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

// Define starting attribute packages by archetype
const ARCHETYPE_PACKAGES = {
  Mage: {
    recommended: { intelligence: 5, willpower: 5, charisma: 3 },
    skills: ['spellcasting', 'concentration', 'research', 'etiquette']
  },
  StreetSamurai: {
    recommended: { strength: 5, body: 5, quickness: 4, willpower: 3 },
    skills: ['pistol', 'rifle', 'closecombat', 'dodge']
  },
  Shaman: {
    recommended: { charisma: 5, willpower: 5, intelligence: 3 },
    skills: ['conjuring', 'spiritcontrol', 'survival', 'etiquette']
  },
  Rigger: {
    recommended: { intelligence: 5, body: 3, quickness: 3, willpower: 4 },
    skills: ['dronecontrol', 'automotive', 'electronics', 'perception']
  },
  Decker: {
    recommended: { intelligence: 6, willpower: 4, quickness: 3 },
    skills: ['decking', 'computer', 'espcontrol', 'electronics']
  },
  PhysicalAdept: {
    recommended: { strength: 5, quickness: 5, body: 4, willpower: 4 },
    skills: ['unarmed', 'closecombat', 'dodge', 'athletics']
  },
  Custom: {
    recommended: {},
    skills: []
  }
};

// Attribute Point System (Shadowrun 3rd Edition)
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