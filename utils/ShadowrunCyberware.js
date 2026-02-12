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
      },
      
      // NEW CYBERWARE FROM PAGES 301-345
      'bone_lacing_plastic': {
        name: 'Bone Lacing (Plastic)',
        category: 'cyberware',
        rating: 1,
        cost: 7500,
        essenceCost: 0.5,
        availability: 5,
        streetIndex: 1.5,
        legality: '6P-N',
        description: 'Synthetic bone reinforcement with plastic fibers',
        benefits: ['+6 Body', '+1 Armor (Ballistic/Impact)', 'Reduces damage from blunt weapons'],
        drawbacks: ['Essence loss', 'Reduces flexibility', 'Visible on medical scans'],
        slots: 1
      },
      'bone_lacing_aluminum': {
        name: 'Bone Lacing (Aluminum)',
        category: 'cyberware',
        rating: 1,
        cost: 25000,
        essenceCost: 1.15,
        availability: 5,
        streetIndex: 1.5,
        legality: '6P-Q',
        description: 'Enhanced bone reinforcement with aluminum alloy',
        benefits: ['+6 Body', '+1 Armor (Ballistic/Impact)', 'Superior damage reduction'],
        drawbacks: ['Essence loss', 'Reduces flexibility', 'Visible on medical scans'],
        slots: 1
      },
      'bone_lacing_titanium': {
        name: 'Bone Lacing (Titanium)',
        category: 'cyberware',
        rating: 1,
        cost: 75000,
        essenceCost: 2.25,
        availability: 5,
        streetIndex: 1.5,
        legality: '6-R',
        description: 'Maximum bone reinforcement with titanium alloy',
        benefits: ['+6 Body', '+1 Armor (Ballistic/Impact)', 'Excellent damage reduction'],
        drawbacks: ['Essence loss', 'Severely reduces flexibility', 'Very visible on medical scans'],
        slots: 1
      },
      'filtration_system_air': {
        name: 'Air Filtration System',
        category: 'cyberware',
        rating: 1,
        cost: 15000,
        essenceCost: 0.1,
        availability: 6,
        streetIndex: 1,
        legality: 'Legal',
        description: 'Implanted filters detoxify airborne poisons and gases',
        benefits: ['Reduces toxin Power by system rating', 'Protects against airborne toxins', 'Alcohol tolerance'],
        drawbacks: ['Essence loss', 'Maintenance required', 'Maximum rating 10'],
        slots: 1,
        maxRating: 10
      },
      'filtration_system_blood': {
        name: 'Blood Filtration System',
        category: 'cyberware',
        rating: 1,
        cost: 10000,
        essenceCost: 0.1,
        availability: 6,
        streetIndex: 1,
        legality: 'Legal',
        description: 'Circulatory system filters toxins from blood',
        benefits: ['Reduces toxin Power by system rating', 'Continuous protection', 'Drug processing enhancement'],
        drawbacks: ['Essence loss', 'Maintenance required', 'Maximum rating 5'],
        slots: 1,
        maxRating: 5
      },
      'filtration_system_ingested': {
        name: 'Ingested Toxin Filtration',
        category: 'cyberware',
        rating: 1,
        cost: 10000,
        essenceCost: 0.1,
        availability: 6,
        streetIndex: 1,
        legality: 'Legal',
        description: 'Digestive system filters toxins from ingested substances',
        benefits: ['Reduces toxin Power by system rating', 'Alcohol tolerance', 'Food safety enhancement'],
        drawbacks: ['Essence loss', 'Maintenance required', 'Maximum rating 5'],
        slots: 1,
        maxRating: 5
      },
      'fingertip_compartment': {
        name: 'Fingertip Compartment',
        category: 'cyberware',
        rating: 1,
        cost: 3000,
        essenceCost: 0.1,
        availability: 3,
        streetIndex: 1,
        legality: 'Legal',
        description: 'Hidden storage space in fingertip',
        benefits: ['Conceal small items', 'Perfect for data chips', 'Can conceal monofilament whip'],
        drawbacks: ['Essence loss', 'Limited capacity', 'Obvious when used'],
        slots: 1
      },
      'hand_blade': {
        name: 'Hand Blade',
        category: 'cyberware',
        rating: 1,
        cost: 7500,
        essenceCost: 0.1,
        availability: 6,
        streetIndex: 1.5,
        legality: '4P-R',
        description: 'Retrable blade slips out from side of hand',
        benefits: ['Deals (STR + 3)L damage', 'Concealed when retracted', 'Quick deployment'],
        drawbacks: ['Essence loss', 'Close range only', 'Visible when deployed'],
        slots: 1
      },
      'hand_razors': {
        name: 'Hand Razors',
        category: 'cyberware',
        rating: 1,
        cost: 4500,
        essenceCost: 0.1,
        availability: 3,
        streetIndex: 1,
        legality: '3-N',
        description: '2.5cm blades replace fingernails',
        benefits: ['Deals (STR)L damage', 'Always available', 'Concealed when not used'],
        drawbacks: ['Essence loss', 'Close range only', 'Limited damage'],
        slots: 1
      },
      'hand_razors_improved': {
        name: 'Improved Hand Razors',
        category: 'cyberware',
        rating: 1,
        cost: 8500,
        essenceCost: 0.1,
        availability: 6,
        streetIndex: 1,
        legality: '3-N',
        description: 'Compressed carbide blades for increased damage',
        benefits: ['Deals (STR + 2)L damage', 'Superior cutting power', 'Concealed when not used'],
        drawbacks: ['Essence loss', 'Close range only', 'Higher cost'],
        slots: 1
      },
      'muscle_replacement': {
        name: 'Muscle Replacement',
        category: 'cyberware',
        rating: 1,
        cost: 20000,
        essenceCost: 0.5,
        availability: 4,
        streetIndex: 1,
        legality: '5P-Q',
        description: 'Synthetic muscles enhance physical attributes',
        benefits: ['Add rating to Strength and Quickness', 'Increased lifting capacity', 'Enhanced speed'],
        drawbacks: ['Essence loss', 'Does not affect Reaction', 'Maximum increase +4'],
        slots: 1,
        maxBonus: 4
      },
      'reaction_enhancer': {
        name: 'Reaction Enhancer',
        category: 'cyberware',
        rating: 1,
        cost: 60000,
        essenceCost: 0.3,
        availability: 6,
        streetIndex: 2,
        legality: '6P-R',
        description: 'Superconducting material enhances reaction times',
        benefits: ['+1 Reaction per enhancer', 'Compatible with other boosters', 'Up to 6 enhancers'],
        drawbacks: ['Essence loss', 'Expensive', 'Cumulative essence cost'],
        slots: 1,
        maxEnhancers: 6
      },
      'reflex_trigger': {
        name: 'Reflex Trigger',
        category: 'cyberware',
        rating: 1,
        cost: 13000,
        essenceCost: 0.2,
        availability: 'As wired reflexes',
        streetIndex: 'As wired reflexes',
        legality: '4P-Q',
        description: 'Accessory for turning wired reflexes on/off',
        benefits: ['Turn wired reflexes on/off as Simple Action', '+4 TN to detect when off', 'Must be installed with wired reflexes'],
        drawbacks: ['Essence loss', 'Cannot be retrofitted', 'Useless without wired reflexes'],
        slots: 1
      },
      'simrig_baseline': {
        name: 'Simrig (Baseline)',
        category: 'cyberware',
        rating: 2,
        cost: 300000,
        essenceCost: 2,
        availability: 2,
        streetIndex: 1,
        legality: 'Legal',
        description: 'Wet simsense recording system',
        benefits: ['Record baseline simsense', '1 Mp/second recording', 'Playback through simdeck'],
        drawbacks: ['Essence loss', 'Expensive', 'Requires simdeck for playback'],
        slots: 2
      },
      'simrig_fullx': {
        name: 'Simrig (Full-X)',
        category: 'cyberware',
        rating: 2,
        cost: 500000,
        essenceCost: 2,
        availability: 6,
        streetIndex: 3,
        legality: 'Legal',
        description: 'Advanced wet simsense recording with full-X',
        benefits: ['Record full-X simsense', '3 Mp/second recording', 'Enhanced sensory data'],
        drawbacks: ['Essence loss', 'Very expensive', 'Complex operation'],
        slots: 2
      },
      'simlink': {
        name: 'Simlink',
        category: 'cyberware',
        rating: 1,
        cost: 70000,
        essenceCost: 0.6,
        availability: 3,
        streetIndex: 1.5,
        legality: 'Legal',
        description: 'Transceiver system for simsense transmission',
        benefits: ['Transmit simsense to receiver', 'Real-time experience', 'Flux Rating = Device Rating ÷ 4'],
        drawbacks: ['Essence loss', 'Requires receiver', 'Limited range'],
        slots: 1
      },
      'skillwires': {
        name: 'Skillwires',
        category: 'cyberware',
        rating: 1,
        cost: 1000,
        essenceCost: 0.2,
        availability: 'Rating/10 days',
        streetIndex: 1,
        legality: 'Legal',
        description: 'Neuro-muscular controllers for skillsofts',
        benefits: ['Use activesofts as natural skills', 'Programmable skill acquisition', 'Flexible skill loadout'],
        drawbacks: ['Essence loss', 'Requires chipjack', 'Limited by MP and rating'],
        slots: 1
      },
      'smartlink_improved': {
        name: 'Smartlink System',
        category: 'cyberware',
        rating: 1,
        cost: 2500,
        essenceCost: 0.5,
        availability: 3,
        streetIndex: 5,
        legality: '5P-N',
        description: 'Integrated weapon targeting system',
        benefits: ['Targeting reticule display', '+2 ranged combat', 'Smartgun compatibility'],
        drawbacks: ['Essence loss', 'Requires cyberlink', 'Vulnerable to jamming'],
        slots: 1
      },
      'spur': {
        name: 'Spur',
        category: 'cyberware',
        rating: 1,
        cost: 7000,
        essenceCost: 0.1,
        availability: 3,
        streetIndex: 1,
        legality: '3-N',
        description: 'Narrow blade attached to bone',
        benefits: ['Deals (STR)M damage', 'Concealed when retracted', 'Bone-mounted'],
        drawbacks: ['Essence loss', 'Close range only', 'Requires surgical installation'],
        slots: 1
      },
      'spur_retractable': {
        name: 'Retractable Spur',
        category: 'cyberware',
        rating: 1,
        cost: 11500,
        essenceCost: 0.3,
        availability: 5,
        streetIndex: 1,
        legality: '3-N',
        description: 'Concealed retractable blade',
        benefits: ['Deals (STR)M damage', 'Fully concealable', 'Quick deployment'],
        drawbacks: ['Essence loss', 'Close range only', 'Higher cost'],
        slots: 1
      },
      'vehicle_control_rig_1': {
        name: 'Vehicle Control Rig Level 1',
        category: 'cyberware',
        rating: 2,
        cost: 12000,
        essenceCost: 2,
        availability: 6,
        streetIndex: 1.25,
        legality: '6P-N',
        description: 'Neural interface for vehicle control',
        benefits: ['+2 Reaction while rigging', '+1D6 Initiative dice', 'Default to Reaction +2 for Vehicle Skills'],
        drawbacks: ['Essence loss', 'Vehicle must have control gear', 'Specialized use only'],
        slots: 2
      },
      'vehicle_control_rig_2': {
        name: 'Vehicle Control Rig Level 2',
        category: 'cyberware',
        rating: 3,
        cost: 60000,
        essenceCost: 3,
        availability: 8,
        streetIndex: 1.25,
        legality: '6P-N',
        description: 'Advanced vehicle control interface',
        benefits: ['+2 Reaction while rigging', '+1D6 Initiative dice', 'Enhanced vehicle control'],
        drawbacks: ['Essence loss', 'Very expensive', 'Vehicle must have control gear'],
        slots: 3
      },
      'vehicle_control_rig_3': {
        name: 'Vehicle Control Rig Level 3',
        category: 'cyberware',
        rating: 5,
        cost: 300000,
        essenceCost: 5,
        availability: 8,
        streetIndex: 1.5,
        legality: '5P-N',
        description: 'Professional-grade vehicle control system',
        benefits: ['+2 Reaction while rigging', '+1D6 Initiative dice', 'Expert vehicle control'],
        drawbacks: ['Essence loss', 'Extremely expensive', 'Requires specialized vehicles'],
        slots: 5
      },
      'voice_modulator': {
        name: 'Voice Modulator',
        category: 'cyberware',
        rating: 1,
        cost: 45000,
        essenceCost: 0.2,
        availability: 2,
        streetIndex: 1,
        legality: 'Legal',
        description: 'Enhanced vocal organ modifications',
        benefits: ['Voice control and modulation', 'Perfect tone control', 'Entertainment applications'],
        drawbacks: ['Essence loss', 'Maintenance required', 'Obvious when used'],
        slots: 1
      },
      'voice_modulator_volume': {
        name: 'Voice Modulator (Increased Volume)',
        category: 'cyberware',
        rating: 1,
        cost: 10000,
        essenceCost: 0,
        availability: 2,
        streetIndex: 1,
        legality: 'Legal',
        description: 'Volume enhancement for performers',
        benefits: ['Loudspeaker effect', 'Stage projection', 'No essence cost'],
        drawbacks: ['Obvious when used', 'Limited application', 'Maintenance required'],
        slots: 1
      },
      'voice_modulator_tonal': {
        name: 'Voice Modulator (Tonal Shift)',
        category: 'cyberware',
        rating: 1,
        cost: 25000,
        essenceCost: 0,
        availability: 2,
        streetIndex: 1,
        legality: 'Legal',
        description: 'Perfect tone and impression control',
        benefits: ['Perfect bird calls', 'Melodic singing', 'Uncanny vocal impressions'],
        drawbacks: ['Obvious when used', 'Limited application', 'Maintenance required'],
        slots: 1
      },
      'voice_modulator_playback': {
        name: 'Voice Modulator (Playback)',
        category: 'cyberware',
        rating: 1,
        cost: 40000,
        essenceCost: 0.2,
        availability: 4,
        streetIndex: 1,
        legality: 'Legal',
        description: 'Perfect audio reproduction system',
        benefits: ['Perfect voice mimicry', 'Audio playback from memory', 'No interpretation needed'],
        drawbacks: ['Essence loss', 'Cannot interpret context', 'Requires audio source'],
        slots: 1
      },
      'voice_modulator_secondary': {
        name: 'Voice Modulator (Secondary Pattern)',
        category: 'cyberware',
        rating: 1,
        cost: 30000,
        essenceCost: 0.2,
        availability: 6,
        streetIndex: 2,
        legality: 'Legal',
        description: 'Upload and reproduce second vocal pattern',
        benefits: ['Indistinguishable voice mimicry', 'Pattern storage', 'Perfect impersonation'],
        drawbacks: ['Essence loss', 'Illegal in some areas', 'Requires recorded pattern'],
        slots: 1
      },
      'wired_reflexes_level1': {
        name: 'Wired Reflexes Level 1',
        category: 'cyberware',
        rating: 2,
        cost: 55000,
        essenceCost: 2,
        availability: 4,
        streetIndex: 1,
        legality: '5P-Q',
        description: 'Basic neural acceleration system',
        benefits: ['+2 Reaction', '+1D6 Initiative die', 'Multiple initiative passes'],
        drawbacks: ['Essence loss', 'Neural feedback risk', 'Twitchy behavior without reflex trigger'],
        slots: 3
      },
      'wired_reflexes_level2': {
        name: 'Wired Reflexes Level 2',
        category: 'cyberware',
        rating: 3,
        cost: 165000,
        essenceCost: 3,
        availability: 4,
        streetIndex: 1,
        legality: '4P-Q',
        description: 'Advanced neural acceleration system',
        benefits: ['+2 Reaction', '+1D6 Initiative die', 'Enhanced reflexes'],
        drawbacks: ['Essence loss', 'Neural feedback risk', 'High cost'],
        slots: 3
      },
      'wired_reflexes_level3': {
        name: 'Wired Reflexes Level 3',
        category: 'cyberware',
        rating: 5,
        cost: 500000,
        essenceCost: 5,
        availability: 8,
        streetIndex: 1,
        legality: '3P-R',
        description: 'Maximum neural acceleration system',
        benefits: ['+2 Reaction', '+1D6 Initiative die', 'Peak human reflexes'],
        drawbacks: ['Essence loss', 'Severe neural feedback risk', 'Extremely expensive'],
        slots: 5
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