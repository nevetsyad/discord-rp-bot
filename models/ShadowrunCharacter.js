// Shadowrun 3rd Edition Character Model
const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const ShadowrunCharacter = sequelize.define('ShadowrunCharacter', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'users',
      key: 'discord_id'
    }
  },
  guild_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // Core Identity
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  race: {
    type: DataTypes.ENUM('Human', 'Elf', 'Dwarf', 'Ork', 'Troll'),
    allowNull: false
  },
  archetype: {
    type: DataTypes.ENUM('Mage', 'StreetSamurai', 'Shaman', 'Rigger', 'Decker', 'PhysicalAdept', 'Custom'),
    allowNull: true
  },
  
  // Attribute Point System (Shadowrun 3rd Edition)
  a_attributes: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  b_attributes: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  c_attributes: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  d_attribute: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  
  // Core Attributes (starting values from point allocation)
  body: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 9
    }
  },
  quickness: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 9
    }
  },
  strength: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 9
    }
  },
  charisma: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 9
    }
  },
  intelligence: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 9
    }
  },
  willpower: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 9
    }
  },
  
  // Derived Stats
  essence: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 6.0,
    validate: {
      min: 0,
      max: 6
    }
  },
  magic: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 6
    }
  },
  reaction: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 9
    }
  },
  
  // Resources
  karma: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  nuyen: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  
  // Status
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Character Details
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  personality: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  appearance: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  backstory: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'shadowrun_characters',
  timestamps: true,
  underscored: true
});

// Define racial maximums
const RACIAL_MAXIMUMS = {
  Human: { body: 9, quickness: 9, strength: 9, charisma: 9, intelligence: 9, willpower: 9 },
  Elf: { body: 9, quickness: 11, strength: 9, charisma: 12, intelligence: 9, willpower: 9 },
  Dwarf: { body: 11, quickness: 9, strength: 12, charisma: 9, intelligence: 9, willpower: 11 },
  Ork: { body: 14, quickness: 9, strength: 12, charisma: 8, intelligence: 8, willpower: 9 },
  Troll: { body: 17, quickness: 8, strength: 15, charisma: 6, intelligence: 6, willpower: 9 }
};

// Define starting karma by race
const STARTING_KARMA = {
  Human: 3,
  Elf: 0,
  Dwarf: 0,
  Ork: 0,
  Troll: 0
};

// Define complete Shadowrun 3rd Edition skills
const SHADOWRUN_SKILLS = {
  // ACTIVE SKILLS
  combat: [
    'assaultrifles', 'clubs', 'cyberimplantcombat', 'edgedweapons', 'gunnery',
    'heavyweapons', 'laserweapons', 'launchweapons', 'pistols', 'polearms',
    'projectileweapons', 'rifles', 'shotguns', 'submachineguns', 'throwingweapons',
    'unarmedcombat', 'underwatercombat', 'whips'
  ],
  magical: [
    'aurareading', 'sorcery', 'conjuring', 'astralperception', 'spellcasting', 'enchanting'
  ],
  physical: [
    'athletics', 'climbing', 'diving', 'running', 'swimming', 'stealth', 'survival'
  ],
  social: [
    'etiquette', 'instruction', 'interrogation', 'intimidation', 'leadership', 'negotiation',
    'persuasion', 'seduction', 'streetknowledge'
  ],
  technical: [
    'biotech', 'computer', 'demolitions', 'electronics', 'engineering', 'espionage',
    'forgery', 'perception', 'investigation', 'research', 'security', 'tracking'
  ],
  vehicle: [
    'airship', 'bike', 'boat', 'car', 'hovercraft', 'ltaaircraft', 'motorcycle',
    'submarine', 'surfacecraft', 'vtol', 'wingsuit'
  ],
  
  // KNOWLEDGE SKILLS
  knowledge: [
    'art', 'business', 'chemistry', 'currentevents', 'earthsciences', 'education',
    'entertainment', 'finance', 'geography', 'history', 'law', 'philosophy',
    'physics', 'popularculture', 'psychology', 'sociology', 'streetknowledge',
    'theology', 'wildernesssurvival'
  ],
  
  // LANGUAGE SKILLS
  languages: [
    'english', 'japanese', 'french', 'german', 'spanish', 'russian', 'chinese',
    'arabic', 'sanskrit', 'elvish', 'dwarven', 'orkish', 'troll', 'siouan',
    'salish', 'nahuatl', 'arapaho', 'greek', 'latin', 'arabic', 'hebrew'
  ],
  
  // BUILD/REPAIR SKILLS
  buildrepair: {
    combat: [
      'assaultriflesbr', 'clubsbr', 'cyberimplantcombatbr', 'edgedweaponsbr', 'gunnerybr',
      'heavyweaponsbr', 'laserweaponsbr', 'launchweaponsbr', 'pistolsbr', 'polearmsbr',
      'projectileweaponsbr', 'riflesbr', 'shotgunsbr', 'submachinegunsbr', 'throwingweaponsbr',
      'whipsbr'
    ],
    physical: [
      'divingbr', 'runningbr', 'swimmingbr'
    ],
    technical: [
      'computerbr', 'electronicsbr', 'engineeringbr', 'biotechbr'
    ],
    vehicle: [
      'bikebr', 'carbr', 'airshipbr', 'boatbr', 'hovercraftbr', 'ltaaircraftbr', 'motorcyclebr',
      'submarinebr', 'surfacecraftbr', 'vtolbr', 'wingsuitbr'
    ]
  }
};

// Define starting attribute packages by archetype
const ARCHETYPE_PACKAGES = {
  Mage: {
    recommended: { intelligence: 5, willpower: 5, charisma: 3 },
    skills: ['sorcery', 'conjuring', 'aurareading', 'etiquette', 'computer']
  },
  StreetSamurai: {
    recommended: { strength: 5, body: 5, quickness: 4, willpower: 3 },
    skills: ['pistols', 'rifle', 'unarmedcombat', 'dodge', 'etiquette']
  },
  Shaman: {
    recommended: { charisma: 5, willpower: 5, intelligence: 3 },
    skills: ['conjuring', 'sorcery', 'aurareading', 'etiquette', 'survival']
  },
  Rigger: {
    recommended: { intelligence: 5, body: 3, quickness: 3, willpower: 4 },
    skills: ['vehicle', 'computer', 'electronics', 'automotive']
  },
  Decker: {
    recommended: { intelligence: 6, willpower: 4, quickness: 3 },
    skills: ['computer', 'electronics', 'decking', 'espcontrol']
  },
  PhysicalAdept: {
    recommended: { strength: 5, quickness: 5, body: 4, willpower: 4 },
    skills: ['unarmedcombat', 'athletics', 'dodge', 'stealth']
  },
  Custom: {
    recommended: {},
    skills: []
  }
};

// Attribute Point System (Shadowrun 3rd Edition Official Priority Table)
const PRIORITY_TABLE = {
  A: {
    name: 'Full Magician',
    attributePoints: 30,
    skillPoints: 50,
    nuyen: 1000000,
    racialRestrictions: ['Human', 'Elf', 'Dwarf', 'Ork', 'Troll']
  },
  B: {
    name: 'Adept/Aspected Magician',
    attributePoints: 27,
    skillPoints: 40,
    nuyen: 400000,
    racialRestrictions: ['Human', 'Elf', 'Dwarf', 'Ork', 'Troll']
  },
  C: {
    name: 'Elf/Troll',
    attributePoints: 24,
    skillPoints: 34,
    nuyen: 90000,
    racialRestrictions: ['Elf', 'Troll']
  },
  D: {
    name: 'Dwarf/Ork',
    attributePoints: 21,
    skillPoints: 30,
    nuyen: 20000,
    racialRestrictions: ['Dwarf', 'Ork']
  },
  E: {
    name: 'Human',
    attributePoints: 18,
    skillPoints: 27,
    nuyen: 5000,
    racialRestrictions: ['Human']
  }
};

// Base attribute values for each race
const RACE_BASE_VALUES = {
  Human: { body: 1, quickness: 1, strength: 1, charisma: 1, intelligence: 1, willpower: 1 },
  Elf: { body: 1, quickness: 2, strength: 1, charisma: 2, intelligence: 1, willpower: 1 },
  Dwarf: { body: 2, quickness: 1, strength: 2, charisma: 1, intelligence: 1, willpower: 2 },
  Ork: { body: 3, quickness: 1, strength: 3, charisma: 1, intelligence: 1, willpower: 1 },
  Troll: { body: 5, quickness: 1, strength: 5, charisma: 1, intelligence: 1, willpower: 1 }
};

// Instance methods
ShadowrunCharacter.prototype.getRaceBaseValues = function() {
  return RACE_BASE_VALUES[this.race] || RACE_BASE_VALUES.Human;
};

ShadowrunCharacter.prototype.getAttributePointDistribution = function() {
  // Standard Shadowrun 3rd Edition point distribution
  return {
    a_points: 6,  // 6 points for A attributes
    b_points: 5,  // 5 points for B attributes  
    c_points: 4,  // 4 points for C attributes
    d_points: 3   // 3 points for D attribute
  };
};

ShadowrunCharacter.prototype.getPriorityOptions = function() {
  return PRIORITY_TABLE;
};

ShadowrunCharacter.prototype.validatePriorityForRace = function(priority) {
  if (!PRIORITY_TABLE[priority]) {
    throw new Error(`Invalid priority level: ${priority}`);
  }
  
  const priorityData = PRIORITY_TABLE[priority];
  if (!priorityData.racialRestrictions.includes(this.race)) {
    throw new Error(`${this.race} cannot be ${priority} priority. Valid races: ${priorityData.racialRestrictions.join(', ')}`);
  }
  
  return priorityData;
};

ShadowrunCharacter.prototype.allocatePriorityPoints = function(priority, aAttrs, bAttrs, cAttrs, dAttr) {
  const priorityData = this.validatePriorityForRace(priority);
  
  // Convert A/B/C/D allocation to total attribute points
  const totalAttributePoints = aAttrs.length + bAttrs.length + cAttrs.length + (dAttr.length * 3);
  
  if (totalAttributePoints > priorityData.attributePoints) {
    throw new Error(`Cannot allocate ${totalAttributePoints} points. Priority ${priority} only allows ${priorityData.attributePoints} points.`);
  }
  
  // Set the priority
  this.priority = priority;
  this.priority_name = priorityData.name;
  this.nuyen = priorityData.nuyen;
  this.skill_points = priorityData.skillPoints;
  this.skills = {};
  
  // Set attribute allocation
  this.a_attributes = aAttrs;
  this.b_attributes = bAttrs;
  this.c_attributes = cAttrs;
  this.d_attribute = dAttr;
  
  // Calculate final attribute values
  const values = this.getAttributeValues();
  Object.keys(values).forEach(attr => {
    this[attr] = values[attr];
  });
  
  return {
    priority: priority,
    priority_name: priorityData.name,
    attribute_points_allocated: totalAttributePoints,
    total_attribute_points: priorityData.attributePoints,
    remaining_attribute_points: priorityData.attributePoints - totalAttributePoints,
    nuyen: priorityData.nuyen,
    skill_points: priorityData.skillPoints
  };
};

ShadowrunCharacter.prototype.getAllSkills = function() {
  return SHADOWRUN_SKILLS;
};

ShadowrunCharacter.prototype.allocateSkillPoints = function(skillName, rating, skillType = 'active') {
  const allSkills = this.getAllSkills();
  let found = false;
  let category = null;
  
  // Check if skill exists in any category
  for (const cat in allSkills) {
    if (Array.isArray(allSkills[cat])) {
      if (allSkills[cat].includes(skillName)) {
        found = true;
        category = cat;
        break;
      }
    } else if (typeof allSkills[cat] === 'object') {
      // Handle build/repair subcategories
      for (const subCategory in allSkills[cat]) {
        if (allSkills[cat][subCategory].includes(skillName)) {
          found = true;
          category = cat;
          break;
        }
      }
    }
  }
  
  if (!found) {
    throw new Error(`Skill '${skillName}' not found in Shadowrun skills list`);
  }
  
  if (!this.skills) {
    this.skills = {};
  }
  
  if (rating < 0 || rating > 6) {
    throw new Error('Skill rating must be between 0 and 6');
  }
  
  const oldRating = this.skills[skillName] || 0;
  this.skills[skillName] = rating;
  
  // Store skill type for character sheet display
  if (!this.skillTypes) {
    this.skillTypes = {};
  }
  this.skillTypes[skillName] = category;
  
  return {
    skill: skillName,
    oldRating: oldRating,
    newRating: rating,
    ratingChange: rating - oldRating,
    category: category
  };
};

ShadowrunCharacter.prototype.getKnowledgeSkills = function() {
  if (!this.skills) return {};
  const allSkills = this.getAllSkills();
  const knowledgeSkills = {};
  
  allSkills.knowledge.forEach(skill => {
    const rating = this.skills[skill] || 0;
    if (rating > 0) {
      knowledgeSkills[skill] = rating;
    }
  });
  
  return knowledgeSkills;
};

ShadowrunCharacter.prototype.getLanguageSkills = function() {
  if (!this.skills) return {};
  const allSkills = this.getAllSkills();
  const languageSkills = {};
  
  allSkills.languages.forEach(skill => {
    const rating = this.skills[skill] || 0;
    if (rating > 0) {
      languageSkills[skill] = rating;
    }
  });
  
  return languageSkills;
};

ShadowrunCharacter.prototype.getActiveSkills = function() {
  if (!this.skills) return {};
  const allSkills = this.getAllSkills();
  const activeCategories = ['combat', 'magical', 'physical', 'social', 'technical', 'vehicle'];
  const activeSkills = {};
  
  activeCategories.forEach(category => {
    if (allSkills[category]) {
      allSkills[category].forEach(skill => {
        const rating = this.skills[skill] || 0;
        if (rating > 0) {
          activeSkills[skill] = rating;
        }
      });
    }
  });
  
  return activeSkills;
};

ShadowrunCharacter.prototype.getSkillsByCategory = function() {
  const allSkills = this.getAllSkills();
  const characterSkills = this.skills || {};
  const categorized = {};
  
  // Active skills
  categorized.active = {};
  ['combat', 'magical', 'physical', 'social', 'technical', 'vehicle'].forEach(category => {
    if (allSkills[category]) {
      categorized.active[category] = {};
      allSkills[category].forEach(skill => {
        const rating = characterSkills[skill] || 0;
        if (rating > 0) {
          categorized.active[category][skill] = rating;
        }
      });
    }
  });
  
  // Knowledge skills
  categorized.knowledge = {};
  allSkills.knowledge.forEach(skill => {
    const rating = characterSkills[skill] || 0;
    if (rating > 0) {
      categorized.knowledge[skill] = rating;
    }
  });
  
  // Language skills
  categorized.languages = {};
  allSkills.languages.forEach(skill => {
    const rating = characterSkills[skill] || 0;
    if (rating > 0) {
      categorized.languages[skill] = rating;
    }
  });
  
  // Build/repair skills
  categorized.buildrepair = {};
  if (typeof allSkills.buildrepair === 'object') {
    for (const subCategory in allSkills.buildrepair) {
      categorized.buildrepair[subCategory] = {};
      allSkills.buildrepair[subCategory].forEach(skill => {
        const rating = characterSkills[skill] || 0;
        if (rating > 0) {
          categorized.buildrepair[subCategory][skill] = rating;
        }
      });
    }
  }
  
  return categorized;
};

ShadowrunCharacter.prototype.getSkillRating = function(skillName) {
  if (!this.skills) {
    return 0;
  }
  return this.skills[skillName] || 0;
};

ShadowrunCharacter.prototype.getSkillsByCategory = function() {
  const allSkills = this.getAllSkills();
  const characterSkills = this.skills || {};
  const categorized = {};
  
  for (const category in allSkills) {
    categorized[category] = {};
    
    if (Array.isArray(allSkills[category])) {
      allSkills[category].forEach(skill => {
        const rating = characterSkills[skill] || 0;
        if (rating > 0) {
          categorized[category][skill] = rating;
        }
      });
    } else if (typeof allSkills[category] === 'object') {
      // Handle build/repair subcategories
      for (const subCategory in allSkills[category]) {
        categorized[category][subCategory] = {};
        allSkills[category][subCategory].forEach(skill => {
          const rating = characterSkills[skill] || 0;
          if (rating > 0) {
            categorized[category][subCategory][skill] = rating;
          }
        });
      }
    }
  }
  
  return categorized;
};

ShadowrunCharacter.prototype.getTotalSkillPointsUsed = function() {
  if (!this.skills) {
    return 0;
  }
  
  let total = 0;
  for (const skill in this.skills) {
    const rating = this.skills[skill];
    // Skill cost: 1-2: 1 point, 3-4: 2 points, 5-6: 3 points
    if (rating <= 2) {
      total += 1;
    } else if (rating <= 4) {
      total += 2;
    } else {
      total += 3;
    }
  }
  
  return total;
};

ShadowrunCharacter.prototype.canIncreaseSkill = function(skillName) {
  const rating = this.getSkillRating(skillName);
  return rating < 6;
};

ShadowrunCharacter.prototype.getSkillCost = function(skillName, currentRating) {
  if (currentRating <= 2) return 1;
  if (currentRating <= 4) return 2;
  return 3;
};

ShadowrunCharacter.prototype.spendSkillPoints = function(skillName, amount = 1) {
  const currentRating = this.getSkillRating(skillName);
  const maxRating = 6;
  
  if (currentRating >= maxRating) {
    throw new Error(`${skillName} is already at maximum rating (${maxRating})`);
  }
  
  const newRating = Math.min(currentRating + amount, maxRating);
  const cost = this.getSkillCost(skillName, currentRating) * amount;
  const totalCost = cost * amount;
  
  const availablePoints = this.skill_points || 0;
  const usedPoints = this.getTotalSkillPointsUsed();
  const remainingPoints = availablePoints - usedPoints;
  
  if (totalPoints > remainingPoints) {
    throw new Error(`Not enough skill points. Need ${totalCost} points, have ${remainingPoints} available`);
  }
  
  // Update the skill
  this.allocateSkillPoints(skillName, newRating);
  
  return {
    skill: skillName,
    oldRating: currentRating,
    newRating: newRating,
    pointsSpent: totalCost,
    remainingSkillPoints: remainingPoints - totalCost
  };
};

ShadowrunCharacter.prototype.getAttributeValues = function() {
  const baseValues = this.getRaceBaseValues();
  const { a_attributes, b_attributes, c_attributes, d_attribute } = this;
  
  const values = { ...baseValues };
  
  // Add A attribute points (6 points total, distributed among A attributes)
  a_attributes.forEach(attr => {
    if (values[attr] !== undefined) {
      values[attr] += 1;
    }
  });
  
  // Add B attribute points (5 points total, distributed among B attributes)
  b_attributes.forEach(attr => {
    if (values[attr] !== undefined) {
      values[attr] += 1;
    }
  });
  
  // Add C attribute points (4 points total, distributed among C attributes)
  c_attributes.forEach(attr => {
    if (values[attr] !== undefined) {
      values[attr] += 1;
    }
  });
  
  // Add D attribute points (3 points to the single D attribute)
  if (d_attribute.length > 0 && d_attribute[0] && values[d_attribute[0]] !== undefined) {
    values[d_attribute[0]] += 3;
  }
  
  return values;
};

ShadowrunCharacter.prototype.setAttributeAllocation = function(aAttrs, bAttrs, cAttrs, dAttr) {
  const distribution = this.getAttributePointDistribution();
  
  // Validate point allocation
  if (aAttrs.length > distribution.a_points) {
    throw new Error(`Cannot allocate more than ${distribution.a_points} points to A attributes`);
  }
  if (bAttrs.length > distribution.b_points) {
    throw new Error(`Cannot allocate more than ${distribution.b_points} points to B attributes`);
  }
  if (cAttrs.length > distribution.c_points) {
    throw new Error(`Cannot allocate more than ${distribution.c_points} points to C attributes`);
  }
  if (dAttr.length > 1) {
    throw Error('Can only allocate one D attribute');
  }
  
  // Check for duplicate attributes across categories
  const allAttrs = [...aAttrs, ...bAttrs, ...cAttrs, ...(dAttr || [])];
  const duplicates = allAttrs.filter((attr, index) => allAttrs.indexOf(attr) !== index);
  if (duplicates.length > 0) {
    throw new Error(`Attribute cannot be allocated to multiple categories: ${duplicates.join(', ')}`);
  }
  
  // Set the allocation
  this.a_attributes = aAttrs;
  this.b_attributes = bAttrs;
  this.c_attributes = cAttrs;
  this.d_attribute = dAttr || [];
  
  // Calculate final attribute values
  const values = this.getAttributeValues();
  Object.keys(values).forEach(attr => {
    this[attr] = values[attr];
  });
  
  return {
    a_allocated: aAttrs.length,
    b_allocated: bAttrs.length,
    c_allocated: cAttrs.length,
    d_allocated: dAttr.length,
    remaining_a: distribution.a_points - aAttrs.length,
    remaining_b: distribution.b_points - bAttrs.length,
    remaining_c: distribution.c_points - cAttrs.length,
    remaining_d: distribution.d_points - dAttr.length
  };
};

ShadowrunCharacter.prototype.validatePriorityAllocation = function(priority, aAttrs, bAttrs, cAttrs, dAttr) {
  const priorityData = this.validatePriorityForRace(priority);
  
  // Calculate total points based on A/B/C/D allocation
  const totalPoints = aAttrs.length + bAttrs.length + cAttrs.length + (dAttr.length * 3);
  
  if (totalPoints > priorityData.attributePoints) {
    throw new Error(`Priority ${priority} only allows ${priorityData.attributePoints} points, but you're trying to allocate ${totalPoints} points.`);
  }
  
  // Check for duplicate attributes
  const allAttrs = [...aAttrs, ...bAttrs, ...cAttrs, ...dAttr];
  const duplicates = allAttrs.filter((attr, index) => allAttrs.indexOf(attr) !== index);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate attributes found: ${duplicates.join(', ')}`);
  }
  
  return {
    valid: true,
    totalPoints: totalPoints,
    remainingPoints: priorityData.attributePoints - totalPoints,
    priorityInfo: priorityData
  };
};

ShadowrunCharacter.prototype.getRacialMaximums = function() {
  return RACIAL_MAXIMUMS[this.race] || RACIAL_MAXIMUMS.Human;
};

ShadowrunCharacter.prototype.getStartingKarma = function() {
  return STARTING_KARMA[this.race] || 0;
};

ShadowrunCharacter.prototype.getArchetypePackage = function() {
  if (!this.archetype || this.archetype === 'Custom') {
    return {
      recommended: {},
      skills: [],
      isCustom: true
    };
  }
  return ARCHETYPE_PACKAGES[this.archetype] || {};
};

ShadowrunCharacter.prototype.calculateInitiative = function() {
  return (this.quickness || 1) + (this.reaction || 1);
};

ShadowrunCharacter.prototype.calculateInitiativePasses = function() {
  const initiative = this.calculateInitiative();
  return Math.floor(initiative / 10);
};

ShadowrunCharacter.prototype.calculatePhysicalMonitor = function() {
  return (this.body || 1) * 2;
};

ShadowrunCharacter.prototype.calculateStunMonitor = function() {
  return (this.willpower || 1) * 2;
};

ShadowrunCharacter.prototype.getAttributeRating = function(attribute) {
  return this[attribute] || 1;
};

ShadowrunCharacter.prototype.canIncreaseAttribute = function(attribute) {
  const racialMax = this.getRacialMaximums()[attribute];
  const current = this.getAttributeRating(attribute);
  return current < racialMax;
};

ShadowrunCharacter.prototype.getKarmaCost = function(attribute, currentRating) {
  // Karma costs: 1-2: 5 karma, 3-4: 10 karma, 5+: 15 karma per point
  if (currentRating <= 2) return 5;
  if (currentRating <= 4) return 10;
  return 15;
};

ShadowrunCharacter.prototype.spendKarma = function(attribute, amount = 1) {
  const currentRating = this.getAttributeRating(attribute);
  const racialMax = this.getRacialMaximums()[attribute];
  
  if (currentRating >= racialMax) {
    throw new Error(`${attribute} is already at racial maximum (${racialMax})`);
  }
  
  const cost = this.getKarmaCost(attribute, currentRating);
  const totalCost = cost * amount;
  
  if (this.karma < totalCost) {
    throw new Error(`Not enough karma. Need ${totalCost} karma, have ${this.karma}`);
  }
  
  // Update the attribute
  this[attribute] = currentRating + amount;
  this.karma -= totalCost;
  
  return {
    attribute,
    oldRating: currentRating,
    newRating: currentRating + amount,
    karmaSpent: totalCost
  };
};

ShadowrunCharacter.prototype.getCharacterSheet = function() {
  const racialMax = this.getRacialMaximums();
  const archetypePackage = this.getArchetypePackage();
  
  return {
    name: this.name,
    race: this.race,
    archetype: this.archetype,
    isCustom: archetypePackage.isCustom || false,
    attributes: {
      body: { current: this.body, max: racialMax.body },
      quickness: { current: this.quickness, max: racialMax.quickness },
      strength: { current: this.strength, max: racialMax.strength },
      charisma: { current: this.charisma, max: racialMax.charisma },
      intelligence: { current: this.intelligence, max: racialMax.intelligence },
      willpower: { current: this.willpower, max: racialMax.willpower },
      reaction: { current: this.reaction, max: 9 }
    },
    derived: {
      essence: this.essence,
      magic: this.magic,
      initiative: this.calculateInitiative(),
      initiativePasses: this.calculateInitiativePasses(),
      physicalMonitor: this.calculatePhysicalMonitor(),
      stunMonitor: this.calculateStunMonitor()
    },
    resources: {
      karma: this.karma,
      nuyen: this.nuyen
    },
    recommendedAttributes: archetypePackage.recommended || {},
    skills: archetypePackage.skills || [],
    attributeAllocation: {
      a_attributes: this.a_attributes,
      b_attributes: this.b_attributes,
      c_attributes: this.c_attributes,
      d_attribute: this.d_attribute
    },
    description: this.description,
    personality: this.personality,
    appearance: this.appearance,
    backstory: this.backstory
  };
};

module.exports = ShadowrunCharacter;