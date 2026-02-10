// Shadowrun 3rd Edition Matrix Combat System
const { EmbedBuilder } = require('discord.js');

class ShadowrunMatrixCombat {
  constructor() {
    this.combatants = new Map();
    this.currentRound = 0;
    this.currentPass = 0;
    this.combatLog = [];
    this.systemStatus = {
      securityTally: 0,
      alertLevel: 'none', // none, passive, active
      activeIC: []
    };
  }

  // Matrix combatant data structure
  createCombatant(deck, character, programs = []) {
    return {
      id: character.id,
      name: character.name,
      deck: deck,
      programs: programs,
      initiative: 0,
      currentStun: 0,
      currentPhysical: 0,
      matrixActions: 3,
      hackingPool: 0,
      isActive: true
    };
  }

  // Calculate matrix initiative (Matrix p. 209)
  calculateMatrixInitiative(response, intuition, deckMPCP) {
    const baseInitiative = response + intuition;
    const initiativeDie = Math.floor(Math.random() * 6) + 1;
    const deckBonus = deckMPCP;
    
    return {
      total: baseInitiative + initiativeDie + deckBonus,
      passes: Math.floor((baseInitiative + initiativeDie + deckBonus) / 5) + 1,
      roll: initiativeDie
    };
  }

  // Add combatant to matrix combat
  addCombatant(deck, character, programs = []) {
    const combatant = this.createCombatant(deck, character, programs);
    const initiative = this.calculateMatrixInitiative(
      character.attributes.response || 1,
      character.attributes.intuition || 1,
      deck.MPCP || 1
    );
    
    combatant.initiative = initiative.total;
    this.combatants.set(character.id, combatant);
    return combatant;
  }

  // Start matrix combat
  startCombat() {
    this.currentRound = 1;
    this.currentPass = 1;
    this.combatLog = [];
    this.systemStatus = {
      securityTally: 0,
      alertLevel: 'none',
      activeIC: []
    };
    
    // Sort combatants by initiative
    const sortedCombatants = Array.from(this.combatants.values())
      .sort((a, b) => b.initiative - a.initiative);
    
    this.combatLog.push({
      action: 'combat_start',
      message: 'Matrix combat initiated!',
      combatants: sortedCombatants.map(c => `${c.name} (Init: ${c.initiative})`)
    });
    
    return sortedCombatants;
  }

  // Perform matrix action
  performMatrixAction(combatantId, actionType, target, options = {}) {
    const combatant = this.combatants.get(combatantId);
    if (!combatant || !combatant.isActive) {
      throw new Error('Combatant not found or inactive');
    }

    const action = {
      type: actionType,
      combatant: combatant.name,
      target: target,
      round: this.currentRound,
      pass: this.currentPass,
      result: null,
      securityImpact: 0
    };

    switch (actionType) {
      case 'attack':
        action.result = this.performMatrixAttack(combatant, target, options);
        action.securityImpact = this.calculateSecurityTally(action.result.successes);
        break;
        
      case 'defend':
        action.result = this.performMatrixDefense(combatant, target, options);
        break;
        
      case 'system_test':
        action.result = this.performSystemTest(combatant, target, options);
        action.securityImpact = this.calculateSecurityTally(action.result.successes);
        break;
        
      case 'run_program':
        action.result = this.runProgram(combatant, target, options);
        break;
        
      case 'probe':
        action.result = this.performProbe(combatant, target, options);
        action.securityImpact = this.calculateSecurityTally(action.result.successes);
        break;
        
      default:
        throw new Error(`Unknown matrix action: ${actionType}`);
    }

    // Update security tally and check for IC activation
    this.systemStatus.securityTally += action.securityImpact;
    this.checkSecurityTriggers();

    this.combatLog.push(action);
    return action;
  }

  // Matrix attack test (Matrix p. 209-210)
  performMatrixAttack(attacker, target, options = {}) {
    const attackRating = attacker.deck.attack || 1;
    const targetEvasion = target.deck.evasion || 1;
    const programs = attacker.programs || [];
    
    // Add program bonuses
    const attackPrograms = programs.filter(p => p.type === 'attack');
    const attackBonus = attackPrograms.reduce((sum, p) => sum + (p.rating || 1), 0);
    
    const dicePool = Math.max(1, attackRating + attackBonus);
    const targetNumber = Math.max(2, targetEvasion + 1);
    
    const successes = this.rollDicePool(dicePool, targetNumber);
    
    return {
      dicePool: dicePool,
      targetNumber: targetNumber,
      successes: successes,
      criticalGlitch: successes === 0 && dicePool >= 3,
      glitch: successes === 0,
      programs: attackPrograms
    };
  }

  // Matrix defense test
  performMatrixDefender(defender, attacker, options = {}) {
    const defenseRating = defender.deck.evasion || 1;
    const attackRating = attacker.deck.attack || 1;
    const programs = defender.programs || [];
    
    // Add defense program bonuses
    const defensePrograms = programs.filter(p => p.type === 'defense');
    const defenseBonus = defensePrograms.reduce((sum, p) => sum + (p.rating || 1), 0);
    
    const dicePool = Math.max(1, defenseRating + defenseBonus - attackRating);
    const targetNumber = Math.max(2, 4);
    
    const successes = this.rollDicePool(dicePool, targetNumber);
    
    return {
      dicePool: dicePool,
      targetNumber: targetNumber,
      successes: successes,
      criticalGlitch: successes === 0 && dicePool >= 3,
      glitch: successes === 0,
      programs: defensePrograms
    };
  }

  // System test (Matrix p. 209)
  performSystemTest(decker, target, options = {}) {
    const computerSkill = decker.skills.computer || 1;
    const subsystemRating = options.subsystem || 8;
    const programs = decker.programs || [];
    
    // Add utility program bonuses
    const utilityPrograms = programs.filter(p => p.type === 'utility' || p.type === 'exploit');
    const utilityBonus = utilityPrograms.reduce((sum, p) => sum + (p.rating || 1), 0);
    
    const dicePool = Math.max(1, computerSkill + utilityBonus);
    const targetNumber = Math.max(2, subsystemRating - utilityBonus);
    
    const successes = this.rollDicePool(dicePool, targetNumber);
    
    return {
      dicePool: dicePool,
      targetNumber: targetNumber,
      successes: successes,
      criticalGlitch: successes === 0 && dicePool >= 3,
      glitch: successes === 0,
      subsystem: options.subsystem,
      programs: utilityPrograms
    };
  }

  // Probe operation (Matrix p. 212)
  performProbe(decker, target, options = {}) {
    const probeResult = this.performSystemTest(decker, target, {
      subsystem: target.deck.access || 8
    });
    
    // Determine if probe is detected
    const detectionFactor = (target.deck.masking + (target.deck.sleaze || 0)) / 2;
    const detectionRoll = this.rollDicePool(1, detectionFactor);
    
    return {
      ...probeResult,
      detected: detectionRoll >= probeResult.successes,
      detectionFactor: detectionFactor,
      detectionRoll: detectionRoll
    };
  }

  // Run utility program
  runProgram(decker, programName, options = {}) {
    const program = decker.programs.find(p => p.name === programName);
    if (!program) {
      throw new Error(`Program ${programName} not found`);
    }
    
    const activationRoll = this.rollDicePool(1, program.rating);
    
    return {
      program: program,
      activationSuccess: activationRoll >= 3,
      activationRoll: activationRoll
    };
  }

  // Roll dice pool
  rollDicePool(dice, targetNumber = 5) {
    if (dice <= 0) return 0;
    
    let successes = 0;
    let ones = 0;
    
    for (let i = 0; i < dice; i++) {
      const roll = Math.floor(Math.random() * 6) + 1;
      if (roll >= targetNumber) successes++;
      if (roll === 1) ones++;
    }
    
    return successes;
  }

  // Calculate security tally impact
  calculateSecurityTally(successes) {
    // Each success adds to security tally
    return Math.max(0, successes);
  }

  // Check security triggers and activate IC
  checkSecurityTriggers() {
    const tally = this.systemStatus.securityTally;
    const triggers = this.getSecurityTriggers();
    
    triggers.forEach(trigger => {
      if (tally >= trigger.threshold) {
        this.activateIC(trigger.ic, trigger.alertLevel);
      }
    });
  }

  // Get security trigger configuration
  getSecurityTriggers() {
    return [
      { threshold: 3, ic: 'probe-5', alertLevel: 'none' },
      { threshold: 7, ic: 'probe-7', alertLevel: 'none' },
      { threshold: 10, ic: 'killer-8', alertLevel: 'passive' },
      { threshold: 13, ic: 'killer-10', alertLevel: 'active' },
      { threshold: 20, ic: 'black-hammer', alertLevel: 'active' }
    ];
  }

  // Activate IC program
  activateIC(icType, alertLevel) {
    const ic = this.createIC(icType);
    this.systemStatus.activeIC.push(ic);
    
    if (alertLevel === 'passive' && this.systemStatus.alertLevel === 'none') {
      this.systemStatus.alertLevel = 'passive';
    } else if (alertLevel === 'active') {
      this.systemStatus.alertLevel = 'active';
    }
    
    this.combatLog.push({
      action: 'ic_activate',
      ic: ic,
      alertLevel: this.systemStatus.alertLevel,
      message: `${ic.name} activated! System is now ${this.systemStatus.alertLevel} alert.`
    });
  }

  // Create IC program
  createIC(type) {
    const icTypes = {
      'probe-5': { name: 'Probe-5', rating: 5, type: 'probe', damage: 'none' },
      'probe-7': { name: 'Probe-7', rating: 7, type: 'probe', damage: 'none' },
      'killer-8': { name: 'Killer-8', rating: 8, type: 'attack', damage: '8S' },
      'killer-10': { name: 'Killer-10', rating: 10, type: 'attack', damage: '10S' },
      'black-hammer': { name: 'Black Hammer', rating: 12, type: 'black', damage: '12D' }
    };
    
    return icTypes[type] || { name: 'Unknown IC', rating: 1, type: 'unknown', damage: 'none' };
  }

  // Advance to next combat pass
  nextPass() {
    this.currentPass++;
    
    if (this.currentPass > this.getMaxInitiativePasses()) {
      this.currentPass = 1;
      this.currentRound++;
      
      // Reset matrix actions for all combatants
      this.combatants.forEach(combatant => {
        combatant.matrixActions = 3;
      });
    }
    
    this.combatLog.push({
      action: 'pass_advance',
      round: this.currentRound,
      pass: this.currentPass
    });
    
    return { round: this.currentRound, pass: this.currentPass };
  }

  // Get maximum initiative passes
  getMaxInitiativePasses() {
    return Math.max(...Array.from(this.combatants.values())
      .map(c => Math.floor(c.initiative / 5) + 1));
  }

  // Create combat status embed
  createCombatStatusEmbed() {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Matrix Combat Status')
      .addFields(
        { name: 'Round', value: this.currentRound.toString(), inline: true },
        { name: 'Initiative Pass', value: this.currentPass.toString(), inline: true },
        { name: 'Security Tally', value: this.systemStatus.securityTally.toString(), inline: true },
        { name: 'Alert Level', value: this.systemStatus.alertLevel.toUpperCase(), inline: true },
        { name: 'Active IC', value: this.systemStatus.activeIC.length.toString(), inline: true }
      );
    
    return embed;
  }

  // Create combatant list embed
  createCombatantListEmbed() {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Matrix Combatants');
    
    const sortedCombatants = Array.from(this.combatants.values())
      .sort((a, b) => b.initiative - a.initiative);
    
    const combatantList = sortedCombatants.map(c => 
      `${c.name} - Initiative: ${c.initiative}, Actions: ${c.matrixActions}`
    ).join('\n');
    
    embed.setDescription(combatantList);
    return embed;
  }

  // Create combat log embed
  createCombatLogEmbed(limit = 10) {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Matrix Combat Log');
    
    const recentLogs = this.combatLog.slice(-limit);
    
    const logText = recentLogs.map(log => {
      if (log.action === 'combat_start') {
        return `🎮 **Combat Started**\n${log.message}`;
      } else if (log.action === 'ic_activate') {
        return `🚨 **IC Activated**: ${log.ic.name} (${log.alertLevel} alert)`;
      } else if (log.action === 'attack') {
        return `⚔️ **Attack**: ${log.combatant} vs ${log.target}\nSuccesses: ${log.result.successes}`;
      } else if (log.action === 'pass_advance') {
        return `⏭️ **Next Pass**: Round ${log.round}, Pass ${log.pass}`;
      } else {
        return `📋 **${log.action}**: ${log.combatant}`;
      }
    }).join('\n\n');
    
    embed.setDescription(logText);
    return embed;
  }
}

module.exports = ShadowrunMatrixCombat;