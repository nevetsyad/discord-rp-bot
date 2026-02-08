const { ShadowrunDice } = require('./ShadowrunDice');

/**
 * Shadowrun Combat System
 * Handles combat mechanics, damage calculation, and combat flow
 */
class ShadowrunCombat {
  constructor() {
    this.activeCombats = new Map(); // Track active combats
    this.dice = new ShadowrunDice();
  }

  /**
   * Start a new combat encounter
   * @param {string} combatName - Name of the combat
   * @param {number} difficulty - Combat difficulty modifier
   * @param {string} environment - Combat environment
   * @returns {Object} Combat initialization results
   */
  startCombat(combatName, difficulty = 3, environment = 'indoor') {
    const combatId = Date.now().toString();
    const combat = {
      id: combatId,
      name: combatName,
      difficulty,
      environment,
      round: 1,
      participants: [],
      initiativeOrder: [],
      isActive: true,
      startTime: new Date()
    };

    this.activeCombats.set(combatId, combat);
    return {
      success: true,
      combatId,
      message: `Combat "${combatName}" started! Difficulty: ${difficulty}/10, Environment: ${environment}`
    };
  }

  /**
   * Add a character to combat
   * @param {string} combatId - Combat ID
   * @param {Object} character - Character object
   * @returns {Object} Results of adding character
   */
  addParticipant(combatId, character) {
    const combat = this.activeCombats.get(combatId);
    if (!combat) {
      return { success: false, message: 'Combat not found' };
    }

    // Check if character already in combat
    if (combat.participants.find(p => p.characterId === character.id)) {
      return { success: false, message: 'Character already in combat' };
    }

    // Calculate initiative
    const initiative = this.calculateInitiative(character);
    
    const participant = {
      characterId: character.id,
      characterName: character.name,
      initiative,
      currentPhysical: character.body + 6, // Standard damage boxes
      currentStun: character.quickness + character.body + 2, // Stun damage boxes
      isUnconscious: false,
      isDead: false,
      isStunned: false,
      actionsTaken: 0,
      movementUsed: 0
    };

    combat.participants.push(participant);
    combat.initiativeOrder.push({
      characterId: character.id,
      initiative,
      characterName: character.name
    });

    // Sort by initiative (highest first)
    combat.initiativeOrder.sort((a, b) => b.initiative - a.initiative);

    return {
      success: true,
      message: `${character.name} joins combat with initiative ${initiative}!`,
      participant
    };
  }

  /**
   * Calculate initiative for a character
   * @param {Object} character - Character object
   * @returns {number} Initiative score
   */
  calculateInitiative(character) {
    const initiative = character.quickness + character.reaction;
    const modifier = Math.floor(Math.random() * 6) + 1; // Initiative die
    return initiative + modifier;
  }

  /**
   * Start a new combat round
   * @param {string} combatId - Combat ID
   * @returns {Object} Round start results
   */
  startRound(combatId) {
    const combat = this.activeCombats.get(combatId);
    if (!combat) {
      return { success: false, message: 'Combat not found' };
    }

    if (!combat.isActive) {
      return { success: false, message: 'Combat is not active' };
    }

    // Reset action counters for all participants
    combat.participants.forEach(p => {
      p.actionsTaken = 0;
      p.movementUsed = 0;
    });

    return {
      success: true,
      message: `Round ${combat.round} begins!`,
      round: combat.round,
      initiativeOrder: combat.initiativeOrder
    };
  }

  /**
   * Perform an attack action
   * @param {string} combatId - Combat ID
   * @param {string} attackerId - Attacker character ID
   * @param {string} targetId - Target character ID
   * @param {string} weaponName - Name of weapon used
   * @param {number} attackPool - Dice pool for attack
   * @param {number} defensePool - Target's defense pool
   * @returns {Object} Attack results
   */
  performAttack(combatId, attackerId, targetId, weaponName, attackPool, defensePool) {
    const combat = this.activeCombats.get(combatId);
    if (!combat) {
      return { success: false, message: 'Combat not found' };
    }

    const attacker = combat.participants.find(p => p.characterId === attackerId);
    const target = combat.participants.find(p => p.characterId === targetId);

    if (!attacker || !target) {
      return { success: false, message: 'Participant not found in combat' };
    }

    if (attacker.isDead || target.isDead) {
      return { success: false, message: 'Cannot attack dead characters' };
    }

    // Check if attacker has actions remaining
    if (attacker.actionsTaken >= 2) {
      return { success: false, message: 'No actions remaining this round' };
    }

    // Attack roll
    const attackRoll = this.dice.rollPool(attackPool);
    const attackSuccesses = attackRoll.filter(die => die >= 5).length;

    // Defense roll
    const defenseRoll = this.dice.rollPool(defensePool);
    const defenseSuccesses = defenseRoll.filter(die => die >= 5).length;

    const netSuccesses = Math.max(0, attackSuccesses - defenseSuccesses);
    const damage = netSuccesses; // Base damage equals net successes

    // Apply damage
    const damageResult = this.applyDamage(target, damage, 'physical');
    attacker.actionsTaken++;

    const attackResult = {
      attacker: attacker.characterName,
      target: target.characterName,
      weapon: weaponName,
      attackRoll,
      attackSuccesses,
      defenseRoll,
      defenseSuccesses,
      netSuccesses,
      damage,
      damageResult,
      description: this.generateAttackDescription(attacker, target, weaponName, attackSuccesses, defenseSuccesses, damage, damageResult)
    };

    return {
      success: true,
      action: attackResult,
      message: `${attacker.characterName} attacks ${target.characterName} with ${weaponName}!`
    };
  }

  /**
   * Apply damage to a character
   * @param {Object} participant - Combat participant
   * @param {number} damage - Damage to apply
   * @param {string} damageType - Type of damage
   * @returns {string} Damage result status
   */
  applyDamage(participant, damage, damageType = 'physical') {
    if (damageType === 'physical') {
      participant.currentPhysical = Math.max(0, participant.currentPhysical - damage);
      
      if (participant.currentPhysical <= -(participant.character?.body || 6)) {
        participant.isDead = true;
        return 'dead';
      }
      
      if (participant.currentPhysical <= 0) {
        participant.isUnconscious = true;
        return 'unconscious';
      }
    } else {
      participant.currentStun = Math.max(0, participant.currentStun - damage);
      
      if (participant.currentStun <= 0) {
        participant.isStunned = true;
        return 'stunned';
      }
    }
    
    return 'alive';
  }

  /**
   * Generate attack description
   * @param {Object} attacker - Attacker
   * @param {Object} target - Target
   * @param {string} weapon - Weapon name
   * @param {number} attackSuccesses - Attack roll successes
   * @param {number} defenseSuccesses - Defense roll successes
   * @param {number} damage - Damage dealt
   * @param {string} damageResult - Damage result
   * @returns {string} Description of the attack
   */
  generateAttackDescription(attacker, target, weapon, attackSuccesses, defenseSuccesses, damage, damageResult) {
    let description = `${attacker.characterName} attacks ${target.characterName} with ${weapon}! `;
    
    if (attackSuccesses > 0) {
      description += `Attack hits with ${attackSuccesses} successes! `;
    } else {
      description += 'Attack misses! ';
    }

    if (defenseSuccesses > 0) {
      description += `${target.characterName} defends with ${defenseSuccesses} successes. `;
    }

    if (damage > 0) {
      description += `${damage} damage dealt! `;
    }

    if (damageResult === 'dead') {
      description += `${target.characterName} is killed!`;
    } else if (damageResult === 'unconscious') {
      description += `${target.characterName} falls unconscious!`;
    } else if (damageResult === 'stunned') {
      description += `${target.characterName} is stunned!`;
    }

    return description;
  }

  /**
   * Get combat status
   * @param {string} combatId - Combat ID
   * @returns {Object} Combat status information
   */
  getCombatStatus(combatId) {
    const combat = this.activeCombats.get(combatId);
    if (!combat) {
      return { success: false, message: 'Combat not found' };
    }

    const status = combat.participants.reduce((acc, participant) => {
      if (participant.isDead) acc.dead++;
      else if (participant.isUnconscious) acc.unconscious++;
      else if (participant.isStunned) acc.stunned++;
      else acc.alive++;
      return acc;
    }, { alive: 0, unconscious: 0, stunned: 0, dead: 0 });

    return {
      success: true,
      combat: {
        id: combat.id,
        name: combat.name,
        round: combat.round,
        isActive: combat.isActive,
        difficulty: combat.difficulty,
        environment: combat.environment,
        participantCount: combat.participants.length,
        status,
        initiativeOrder: combat.initiativeOrder
      }
    };
  }

  /**
   * End combat
   * @param {string} combatId - Combat ID
   * @param {string} reason - Reason for ending combat
   * @returns {Object} Combat end results
   */
  endCombat(combatId, reason = 'Combat completed') {
    const combat = this.activeCombats.get(combatId);
    if (!combat) {
      return { success: false, message: 'Combat not found' };
    }

    combat.isActive = false;
    this.activeCombats.delete(combatId);

    return {
      success: true,
      message: `Combat "${combat.name}" ended: ${reason}`,
      duration: Math.floor((Date.now() - combat.startTime) / 1000) + ' seconds',
      rounds: combat.round
    };
  }

  /**
   * Get list of active combats
   * @returns {Array} List of active combats
   */
  getActiveCombats() {
    return Array.from(this.activeCombats.values()).map(combat => ({
      id: combat.id,
      name: combat.name,
      round: combat.round,
      participants: combat.participants.length,
      isActive: combat.isActive
    }));
  }
}

module.exports = ShadowrunCombat;