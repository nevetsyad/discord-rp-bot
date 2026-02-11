// Shadowrun 3rd Edition Cyberware & Bioware System
const { EmbedBuilder } = require('discord.js');

class ShadowrunCyberware {
  constructor() {
    this.cyberware = [];
    this.essence = 1;
    this.maxEssence = 1;
    this.essenceLoss = 0;
    this.essenceReserve = 0;
  }

  // Cyberware categories
  getCyberwareCategories() {
    return {
      'cyberware': {
        name: 'Cyberware',
        description: 'Mechanical and electronic replacements',
        essenceCost: true,
        availability: 'various'
      },
      'bioware': {
        name: 'Bioware', 
        description: 'Biological and genetic modifications',
        essenceCost: true,
        availability: 'restricted'
      },
      'weapons': {
        name: 'Weapons',
        description: 'Integrated weapon systems',
        essenceCost: false,
        availability: 'military'
      },
      'sensors': {
        name: 'Sensors',
        description: 'Enhanced sensory systems',
        essenceCost: true,
        availability: 'commercial'
      },
      'cosmetic': {
        name: 'Cosmetic',
        description: 'Visual and appearance modifications',
        essenceCost: false,
        availability: 'commercial'
      }
    };
  }

  // Cyberware database
  getCyberwareDatabase() {
    return {
      // Cyberware
      'datajack': {
        name: 'Datajack',
        category: 'cyberware',
        rating: 1,
        cost: 500,
        essenceCost: 0.1,
        availability: 2,
        description: 'Direct neural interface for computer access',
        benefits: ['Direct Matrix access', '+2 Computer skill', 'Bypass user interface'],
        drawbacks: ['Essence loss', 'Vulnerability to ICE'],
        slots: 1
      },
      'cybereyes': {
        name: 'Cyber Eyes',
        category: 'cyberware',
        rating: 1,
        cost: 2000,
        essenceCost: 0.2,
        availability: 4,
        description: 'Enhanced optical systems',
        benefits: ['Low-light vision', 'Enhanced targeting', 'Recording capabilities'],
        drawbacks: ['Essence loss', 'Vulnerability to electronic warfare'],
        slots: 1
      },
      'smartlink': {
        name: 'Smartgun System',
        category: 'cyberware',
        rating: 1,
        cost: 800,
        essenceCost: 0.1,
        availability: 2,
        description: 'Integrated weapon targeting system',
        benefits: ['+2 ranged combat', 'Smartgun compatibility', 'Recoil compensation'],
        drawbacks: ['Requires cyberlink', 'Vulnerability to jamming'],
        slots: 1
      },
      'wired_reflexes': {
        name: 'Wired Reflexes',
        category: 'cyberware',
        rating: 2,
        cost: 15000,
        essenceCost: 0.4,
        availability: 12,
        description: 'Neural acceleration for faster reflexes',
        benefits: ['+2d6 Initiative', '+1 Reaction', 'Multiple initiative passes'],
        drawbacks: ['Essence loss', 'Neural feedback risk', 'High cost'],
        slots: 3
      },
      'dermal_armor': {
        name: 'Dermal Plating',
        category: 'cyberware',
        rating: 2,
        cost: 5000,
        essenceCost: 0.1,
        availability: 8,
        description: 'Subdermal armor reinforcement',
        benefits: ['+2 Ballistic armor', '+2 Impact armor', 'Concealed'],
        drawbacks: ['Essence loss', 'Reduced flexibility'],
        slots: 2
      },
      
      // Bioware
      'muscle_augmentation': {
        name: 'Muscle Augmentation',
        category: 'bioware',
        rating: 1,
        cost: 2500,
        essenceCost: 0.1,
        availability: 6,
        description: 'Enhanced muscle tissue',
        benefits: ['+1 Strength', '+1 Body', 'Increased lifting capacity'],
        drawbacks: ['Essence loss', 'Requires biocompatibility'],
        slots: 1
      },
      'dermal_plating_bioware': {
        name: 'Dermal Plating (Bioware)',
        category: 'bioware',
        rating: 1,
        cost: 8000,
        essenceCost: 0.1,
        availability: 12,
        description: 'Biologically integrated armor',
        benefits: ['+2 Ballistic armor', '+2 Impact armor', 'No encumbrance'],
        drawbacks: ['Essence loss', 'High cost', 'Long recovery time'],
        slots: 2
      },
      'synthetic_liver': {
        name: 'Synthetic Liver',
        category: 'bioware',
        rating: 1,
        cost: 1200,
        essenceCost: 0.05,
        availability: 4,
        description: 'Enhanced toxin processing',
        benefits: ['+2 toxin resistance', 'Alcohol tolerance', 'Drug processing'],
        drawbacks: ['Essence loss', 'Maintenance required'],
        slots: 1
      },
      'cyber_arm': {
        name: 'Cyber Arm',
        category: 'cyberware',
        rating: 3,
        cost: 10000,
        essenceCost: 0.4,
        availability: 8,
        description: 'Advanced prosthetic arm with strength enhancement',
        benefits: ['+3 Strength', 'Weapon integration', 'Tool functions'],
        drawbacks: ['Essence loss', 'High cost', 'Maintenance required'],
        slots: 2
      },
      'cyber_leg': {
        name: 'Cyber Leg',
        category: 'cyberware',
        rating: 3,
        cost: 8000,
        essenceCost: 0.4,
        availability: 8,
        description: 'Advanced prosthetic leg with mobility enhancement',
        benefits: ['+3 Agility', 'Running bonus', 'Jump enhancement'],
        drawbacks: ['Essence loss', 'High cost', 'Maintenance required'],
        slots: 2
      }
    };
  }

  // Install cyberware
  installCyberware(cyberwareId, rating = 1) {
    const cyberwareDB = this.getCyberwareDatabase();
    const cyberware = cyberwareDB[cyberwareId];
    
    if (!cyberware) {
      throw new Error(`Cyberware ${cyberwareId} not found`);
    }
    
    // Check if already installed
    if (this.cyberware.some(cw => cw.id === cyberwareId)) {
      throw new Error(`${cyberware.name} already installed`);
    }
    
    // Check essence availability
    const totalEssenceCost = this.essenceLoss + cyberware.essenceCost * rating;
    if (totalEssenceCost > this.maxEssence) {
      throw new Error('Not enough essence remaining');
    }
    
    // Check availability
    if (cyberware.availability > 12) {
      throw new Error(`${cyberware.name} is too rare/illegal to acquire`);
    }
    
    // Install cyberware
    const installedCyberware = {
      ...cyberware,
      id: cyberwareId,
      rating: rating,
      essenceCost: cyberware.essenceCost * rating,
      installed: true,
      date: new Date().toISOString()
    };
    
    this.cyberware.push(installedCyberware);
    this.essenceLoss += cyberware.essenceCost * rating;
    
    return installedCyberware;
  }

  // Remove cyberware
  removeCyberware(cyberwareId) {
    const index = this.cyberware.findIndex(cw => cw.id === cyberwareId);
    if (index === -1) {
      throw new Error(`Cyberware ${cyberwareId} not found`);
    }
    
    const cyberware = this.cyberware[index];
    this.essenceLoss -= cyberware.essenceCost;
    this.cyberware.splice(index, 1);
    
    return cyberware;
  }

  // Calculate essence
  calculateEssence() {
    this.essence = this.maxEssence - this.essenceLoss;
    this.essenceReserve = Math.max(0, this.essence);
    return this.essence;
  }

  // Calculate cyberware bonuses
  calculateBonuses() {
    const bonuses = {
      attributes: {
        strength: 0,
        agility: 0,
        body: 0,
        reaction: 0,
        intuition: 0,
        logic: 0,
        willpower: 0,
        charisma: 0
      },
      skills: {
        computer: 0,
        ranged_combat: 0,
        melee_combat: 0,
        athletics: 0,
        perception: 0
      },
      armor: {
        ballistic: 0,
        impact: 0
      },
      initiative: 0,
      reaction: 0
    };

    this.cyberware.forEach(cyberware => {
      switch (cyberware.id) {
        case 'cyber_arm':
          bonuses.attributes.strength += cyberware.rating;
          break;
        case 'cyber_leg':
          bonuses.attributes.agility += cyberware.rating;
          break;
        case 'wired_reflexes':
          bonuses.initiative += cyberware.rating * 1;
          bonuses.attributes.reaction += cyberware.rating;
          break;
        case 'dermal_armor':
          bonuses.armor.ballistic += cyberware.rating;
          bonuses.armor.impact += cyberware.rating;
          break;
        case 'muscle_augmentation':
          bonuses.attributes.strength += cyberware.rating;
          bonuses.attributes.body += cyberware.rating;
          break;
        case 'dermal_plating_bioware':
          bonuses.armor.ballistic += cyberware.rating;
          bonuses.armor.impact += cyberware.rating;
          break;
        case 'smartlink':
          bonuses.skills.ranged_combat += 2;
          break;
        case 'cybereyes':
          bonuses.skills.perception += 1;
          break;
      }
    });

    return bonuses;
  }

  // Get cyberware list
  getCyberwareList() {
    return this.cyberware.map(cw => ({
      name: cw.name,
      rating: cw.rating,
      essenceCost: cw.essenceCost,
      category: cw.category,
      cost: cw.cost
    }));
  }

  // Create cyberware status embed
  createCyberwareStatusEmbed() {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Cyberware Status');
    
    const essenceInfo = `Current Essence: ${this.essence.toFixed(2)}/${this.maxEssence}`;
    const essenceBar = '█'.repeat(Math.floor(this.essence * 10)) + '░'.repeat(10 - Math.floor(this.essence * 10));
    
    embed.addFields(
      { name: 'Essence', value: `${essenceInfo}\n${essenceBar}`, inline: false },
      { name: 'Installed Cyberware', value: this.cyberware.length.toString(), inline: true },
      { name: 'Essence Loss', value: this.essenceLoss.toFixed(2), inline: true }
    );
    
    if (this.cyberware.length > 0) {
      const cyberwareList = this.cyberware
        .slice(0, 5)
        .map(cw => `${cw.name} (${cw.rating})`)
        .join('\n');
      embed.addFields({ name: 'Top Cyberware', value: cyberwareList, inline: true });
    }
    
    return embed;
  }

  // Create cyberware details embed
  createCyberwareDetailsEmbed(cyberwareId) {
    const cyberwareDB = this.getCyberwareDatabase();
    const cyberware = cyberwareDB[cyberwareId];
    
    if (!cyberware) {
      throw new Error(`Cyberware ${cyberwareId} not found`);
    }
    
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(cyberware.name)
      .setDescription(cyberware.description);
    
    embed.addFields(
      { name: 'Category', value: cyberware.category, inline: true },
      { name: 'Rating', value: cyberware.rating.toString(), inline: true },
      { name: 'Cost', value: `${cyberware.cost}¥`, inline: true },
      { name: 'Essence Cost', value: cyberware.essenceCost.toString(), inline: true },
      { name: 'Availability', value: cyberware.availability.toString(), inline: true },
      { name: 'Slots', value: cyberware.slots.toString(), inline: true }
    );
    
    if (cyberware.benefits && cyberware.benefits.length > 0) {
      embed.addFields(
        { name: 'Benefits', value: cyberware.benefits.join('\n'), inline: false }
      );
    }
    
    if (cyberware.drawbacks && cyberware.drawbacks.length > 0) {
      embed.addFields(
        { name: 'Drawbacks', value: cyberware.drawbacks.join('\n'), inline: false }
      );
    }
    
    return embed;
  }

  // Check cyberware conflicts
  checkConflicts() {
    const conflicts = [];
    
    // Check for conflicting cyberware
    if (this.cyberware.some(cw => cw.id === 'wired_reflexes')) {
      const otherSpeedEnhancers = this.cyberware.filter(cw => 
        cw.id === 'muscle_augmentation' || cw.id === 'synthetic_liver'
      );
      if (otherSpeedEnhancers.length > 0) {
        conflicts.push('Wired Reflexes may conflict with other speed-enhancing cyberware');
      }
    }
    
    // Check for essence overload
    if (this.essenceLoss >= this.maxEssence) {
      conflicts.push('Essence completely depleted - character may suffer severe penalties');
    }
    
    return conflicts;
  }

  // Calculate cyberware maintenance
  calculateMaintenance() {
    const monthlyCost = this.cyberware.reduce((total, cw) => {
      return total + (cw.cost * 0.01); // 1% of cost per month
    }, 0);
    
    const reliabilityCheck = this.cyberware.length > 5 ? 
      'Frequent maintenance required' : 'Standard maintenance schedule';
    
    return {
      monthlyCost: monthlyCost,
      reliabilityCheck: reliabilityCheck,
      nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
}

module.exports = ShadowrunCyberware;