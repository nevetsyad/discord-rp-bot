// Shadowrun 3rd Edition Matrix System
const { EmbedBuilder } = require('discord.js');

class ShadowrunMatrix {
  constructor() {
    this.matrixAttributes = {
      response: 1,    // Response attribute
      firewall: 1,     // Firewall attribute  
      dataProcessing: 1, // Data Processing attribute
      attack: 1,      // Attack attribute
      sleaze: 1       // Sleaze attribute
    };
    
    this.matrixInitiative = 0;
    this.matrixPasses = 0;
    this.currentVRMode = 'AR'; // AR or VR
    this.currentDeck = null;
    this.iceRating = 0;
    this.programs = [];
  }

  // Cyberdeck definitions
  getCyberdecks() {
    return {
      'micro': { 
        name: 'Microdeck', 
        response: 1, 
        firewall: 1, 
        dataProcessing: 1, 
        attack: 1, 
        sleaze: 1,
        slots: 2,
        availability: 2,
        cost: 500
      },
      'standard': { 
        name: 'Standard Deck', 
        response: 3, 
        firewall: 3, 
        dataProcessing: 3, 
        attack: 3, 
        sleaze: 3,
        slots: 4,
        availability: 6,
        cost: 5000
      },
      'high': { 
        name: 'High-End Deck', 
        response: 5, 
        firewall: 5, 
        dataProcessing: 5, 
        attack: 5, 
        sleaze: 5,
        slots: 6,
        availability: 12,
        cost: 25000
      },
      'elite': { 
        name: 'Elite Deck', 
        response: 7, 
        firewall: 7, 
        dataProcessing: 7, 
        attack: 7, 
        sleaze: 7,
        slots: 8,
        availability: 18,
        cost: 100000
      }
    };
  }

  // Program definitions
  getPrograms() {
    return {
      'attack': { name: 'Attack', type: 'offense', rating: 1, slots: 1, description: 'Increase your Attack attribute' },
      'defensive': { name: 'Defensive', type: 'defense', rating: 1, slots: 1, description: 'Increase your Firewall attribute' },
      'exploit': { name: 'Exploit', type: 'hacking', rating: 1, slots: 1, description: 'Better chance to bypass ICE' },
      'stealth': { name: 'Stealth', type: 'sleaze', rating: 1, slots: 1, description: 'Increase Sleaze for stealth' },
      'data_sleuth': { name: 'Data Sleuth', type: 'analysis', rating: 1, slots: 1, description: 'Better data analysis' },
      'edit': { name: 'Edit', type: 'utility', rating: 1, slots: 1, description: 'Edit files and data' },
      'blackhammer': { name: 'Black Hammer', type: 'attack', rating: 3, slots: 2, description: 'Black IC attack' },
      'blackout': { name: 'Blackout', type: 'stealth', rating: 2, slots: 2, description: 'Hide all matrix activity' },
      'icebreaker': { name: 'Icebreaker', type: 'exploit', rating: 4, slots: 3, description: 'Advanced ICE bypassing' }
    };
  }

  // ICE definitions
  getICE() {
    return {
      'black_ic': { name: 'Black IC', rating: 6, attack: 6, damage: '6S', description: 'Damaging ICE' },
      'grey_ic': { name: 'Grey IC', rating: 4, attack: 4, damage: '4S', description: 'Standard ICE' },
      'white_ic': { name: 'White IC', rating: 2, attack: 2, damage: '2S', description: 'Alert ICE' },
      'tar_pit': { name: 'Tar Pit', rating: 3, description: 'Slows intruders' },
      'scramble': { name: 'Scramble', rating: 4, description: 'Disorients intruders' }
    };
  }

  // Calculate matrix initiative
  calculateMatrixInitiative(response, intuition) {
    this.matrixInitiative = response + intuition + Math.floor(Math.random() * 6) + 1;
    this.matrixPasses = Math.floor(this.matrixInitiative / 5) + 1;
    return this.matrixInitiative;
  }

  // Switch VR mode
  switchVRMode(mode) {
    if (mode === 'AR' || mode === 'VR') {
      this.currentVRMode = mode;
      return true;
    }
    return false;
  }

  // Load cyberdeck
  loadCyberdeck(deckType) {
    const decks = this.getCyberdecks();
    if (decks[deckType]) {
      this.currentDeck = decks[deckType];
      return this.currentDeck;
    }
    return null;
  }

  // Install program
  installProgram(programName, rating = 1) {
    const programs = this.getPrograms();
    if (programs[programName] && this.currentDeck) {
      const program = { ...programs[programName], rating };
      
      // Check if there are available slots
      const usedSlots = this.programs.reduce((total, p) => total + p.slots, 0);
      if (usedSlots + program.slots <= this.currentDeck.slots) {
        this.programs.push(program);
        return program;
      }
    }
    return null;
  }

  // Calculate matrix attack test
  matrixAttackTest(attack, targetFirewall, deckRating) {
    const totalDice = Math.max(1, attack + deckRating - targetFirewall);
    const hits = Math.floor(Math.random() * totalDice) + Math.floor(totalDice / 2);
    
    return {
      totalDice: totalDice,
      hits: hits,
      success: hits >= 2,
      glitch: totalDice >= 3 && hits === 0
    };
  }

  // Calculate matrix defense test
  matrixDefenseTest(firewall, attackRating) {
    const totalDice = Math.max(1, firewall - attackRating);
    const hits = Math.floor(Math.random() * totalDice) + Math.floor(totalDice / 2);
    
    return {
      totalDice: totalDice,
      hits: hits,
      success: hits >= 1,
      glitch: totalDice >= 3 && hits === 0
    };
  }

  // Create matrix status embed
  createMatrixStatusEmbed() {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Matrix Status');
    
    if (this.currentDeck) {
      embed.addFields(
        { name: 'Cyberdeck', value: this.currentDeck.name, inline: true },
        { name: 'VR Mode', value: this.currentVRMode, inline: true },
        { name: 'Response', value: this.currentDeck.response.toString(), inline: true },
        { name: 'Firewall', value: this.currentDeck.firewall.toString(), inline: true },
        { name: 'Data Processing', value: this.currentDeck.dataProcessing.toString(), inline: true },
        { name: 'Attack', value: this.currentDeck.attack.toString(), inline: true },
        { name: 'Sleaze', value: this.currentDeck.sleaze.toString(), inline: true },
        { name: 'Program Slots', value: `${this.programs.length}/${this.currentDeck.slots}`, inline: true }
      );
    } else {
      embed.setDescription('No cyberdeck loaded');
    }
    
    return embed;
  }

  // Create programs embed
  createProgramsEmbed() {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Matrix Programs');
    
    if (this.programs.length > 0) {
      const programList = this.programs.map(p => 
        `${p.name} (Rating ${p.rating}) - ${p.description}`
      ).join('\n');
      embed.setDescription(programList);
    } else {
      embed.setDescription('No programs installed');
    }
    
    return embed;
  }

  // Create matrix initiative embed
  createMatrixInitiativeEmbed(initiative, passes) {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Matrix Initiative')
      .addFields(
        { name: 'Total Initiative', value: initiative.toString(), inline: true },
        { name: 'Initiative Passes', value: passes.toString(), inline: true },
        { name: 'VR Mode', value: this.currentVRMode, inline: true }
      )
      .setDescription(`Character will act in ${passes} initiative pass${passes !== 1 ? 'es' : ''} each matrix round.`);
    
    return embed;
  }

  // Create matrix test embed
  createMatrixTestEmbed(testType, result, attacker, defender) {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`${testType} Test`);
    
    embed.addFields(
      { name: 'Attacker', value: attacker, inline: true },
      { name: 'Defender', value: defender, inline: true },
      { name: 'Dice Pool', value: result.totalDice.toString(), inline: true },
      { name: 'Hits', value: result.hits.toString(), inline: true },
      { name: 'Result', value: result.success ? 'Success!' : 'Failed', inline: true }
    );
    
    if (result.glitch) {
      embed.addFields({ name: 'Status', value: '🔥 GLITCH!', inline: false });
    }
    
    return embed;
  }
}

module.exports = ShadowrunMatrix;