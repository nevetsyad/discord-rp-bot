// Shadowrun Magic System Database Model
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShadowrunMagic = sequelize.define('ShadowrunMagic', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  character_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'characters',
      key: 'id'
    }
  },
  spell_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  spell_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  spell_category: {
    type: DataTypes.ENUM('combat', 'illusion', 'manipulation', 'enchantment', 'health', 'detection', 'divination', 'spirit_control', 'ritual_magic', 'alchemical'),
    allowNull: false
  },
  spell_type: {
    type: DataTypes.ENUM('combat_spell', 'illusion_spell', 'manipulation_spell', 'enchantment_spell', 'health_spell', 'detection_spell', 'divination_spell', 'spirit_control_spell', 'ritual_spell', 'alchemical_spell'),
    allowNull: false
  },
  force: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 12
    }
  },
  duration: {
    type: DataTypes.ENUM('instant', 'sustained', 'permanent'),
    allowNull: false,
    defaultValue: 'instant'
  },
  range: {
    type: DataTypes.ENUM('touch', 'short', 'medium', 'long', 'los'),
    allowNull: false,
    defaultValue: 'medium'
  },
  damage_type: {
    type: DataTypes.ENUM('physical', 'stun', 'special'),
    allowNull: true
  },
  drain_value: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  drain_type: {
    type: DataTypes.ENUM('physical', 'stun'),
    allowNull: false,
    defaultValue: 'stun'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  effect: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  target_number: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  spell_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 10
    }
  },
  is_learned: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  is_specialized: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'shadowrun_magic',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      name: 'character_spell_index',
      fields: ['character_id', 'spell_id']
    },
    {
      name: 'category_index',
      fields: ['spell_category']
    },
    {
      name: 'learned_spells_index',
      fields: ['character_id', 'is_learned']
    }
  ]
});

// Define relationships
ShadowrunMagic.belongsTo(require('./ShadowrunCharacter'), {
  foreignKey: 'character_id',
  as: 'character'
});

// Instance methods
ShadowrunMagic.prototype.calculateDrain = function() {
  return this.force + Math.floor(this.force / 2);
};

ShadowrunMagic.prototype.calculateSpellPool = function(character) {
  if (!character) return this.force;
  
  let pool = this.force;
  
  // Add specialization bonus
  if (this.is_specialized && character.magic_specialization === this.specialization) {
    pool += 2;
  }
  
  // Add focus bonus
  if (character.foci && character.foci.includes(this.spell_category)) {
    pool += character.focus_bonus || 1;
  }
  
  return pool;
};

ShadowrunMagic.prototype.calculateTargetNumber = function(character, target) {
  let tn = this.target_number || 4;
  
  // Apply modifiers based on target
  if (target) {
    // Cover modifier
    if (target.is_covered) tn += 2;
    
    // Movement modifier
    if (target.is_moving) tn += 2;
    
    // Size modifier
    if (target.size === 'small') tn += 2;
    if (target.size === 'large') tn -= 2;
    
    // Visibility modifier
    if (target.visibility === 'poor') tn += 2;
    if (target.visibility === 'excellent') tn -= 2;
  }
  
  // Apply spell-specific modifiers
  if (this.spell_category === 'combat') tn += 1;
  if (this.spell_category === 'illusion') tn += 2;
  if (this.spell_category === 'manipulation') tn += 1;
  
  return tn;
};

// Class methods
ShadowrunMagic.findByCharacter = function(characterId) {
  return this.findAll({
    where: { character_id: character_id },
    include: [{
      model: require('./models/ShadowrunCharacter'),
      as: 'character'
    }]
  });
};

ShadowrunMagic.findByCategory = function(category, characterId) {
  return this.findAll({
    where: {
      spell_category: category,
      character_id: characterId
    }
  });
};

ShadowrunMagic.findLearnedSpells = function(characterId) {
  return this.findAll({
    where: {
      character_id: characterId,
      is_learned: true
    }
  });
};

ShadowrunMagic.findSpecializedSpells = function(characterId) {
  return this.findAll({
    where: {
      character_id: characterId,
      is_specialized: true
    }
  });
};

ShadowrunMagic.prototype.cast = function(character, target = null) {
  const spellPool = this.calculateSpellPool(character);
  const targetNumber = this.calculateTargetNumber(character, target);
  const drain = this.calculateDrain();
  
  return {
    spell: this,
    character: character,
    pool: spellPool,
    targetNumber: targetNumber,
    drain: drain,
    result: null // This would be populated with the actual dice roll result
  };
};

module.exports = ShadowrunMagic;