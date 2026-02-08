const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ShadowrunCharacter = require('./ShadowrunCharacter');

/**
 * Shadowrun Combat Model
 * Handles combat mechanics, damage, armor, healing, and combat encounters
 */
const Combat = sequelize.define('Combat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Combat identification
  combatName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the combat encounter'
  },
  // Combat state
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether combat is currently active'
  },
  currentRound: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Current combat round number'
  },
  // Combat setup
  difficulty: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    comment: 'Combat difficulty modifier (1-10)'
  },
  environment: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Combat environment (indoor, outdoor, vehicle, etc.)'
  },
  // Combat tracking
  participantCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of participants in combat'
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Combat summary and narrative'
  },
  // Timestamps
  startTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'When combat started'
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When combat ended'
  }
});

// Combat Participants relationship
const CombatParticipant = sequelize.define('CombatParticipant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  combatId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Combat,
      key: 'id'
    }
  },
  characterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ShadowrunCharacters',
      key: 'id'
    }
  },
  // Combat positioning
  initiative: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Initiative score for this round'
  },
  initiativeOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Order in initiative pass (1-10)'
  },
  currentHealth: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Current health/stun boxes remaining'
  },
  currentPhysical: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Current physical boxes remaining'
  },
  // Status effects
  isUnconscious: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Character is unconscious'
  },
  isDead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Character is dead'
  },
  isStunned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Character is stunned'
  },
  // Combat actions
  actionsTaken: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of actions taken this round'
  },
  movementUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Movement used this round'
  }
});

// Combat Actions relationship
const CombatAction = sequelize.define('CombatAction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  combatId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Combat,
      key: 'id'
    }
  },
  characterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ShadowrunCharacters',
      key: 'id'
    }
  },
  // Action details
  actionType: {
    type: DataTypes.ENUM('attack', 'defense', 'spell', 'skill', 'movement', 'item', 'special'),
    allowNull: false,
    comment: 'Type of combat action'
  },
  actionName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the action performed'
  },
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Target character ID if applicable'
  },
  // Action results
  diceRolled: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Dice roll results'
  },
  successes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of successes on the roll'
  },
  damageDealt: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Damage dealt by this action'
  },
  damageType: {
    type: DataTypes.ENUM('physical', 'stun', 'matrix', 'acid', 'fire', 'electric'),
    allowNull: true,
    comment: 'Type of damage dealt'
  },
  // Action description
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description of the action and results'
  },
  // Timestamps
  actionTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'When the action occurred'
  }
});

// Define relationships
Combat.hasMany(CombatParticipant, { foreignKey: 'combatId' });
CombatParticipant.belongsTo(Combat, { foreignKey: 'combatId' });

Combat.hasMany(CombatAction, { foreignKey: 'combatId' });
CombatAction.belongsTo(Combat, { foreignKey: 'combatId' });

CombatParticipant.hasMany(CombatAction, { foreignKey: 'characterId', sourceKey: 'characterId' });
CombatAction.belongsTo(CombatParticipant, { foreignKey: 'characterId', targetKey: 'characterId' });

ShadowrunCharacter.hasMany(CombatParticipant, { foreignKey: 'characterId' });
ShadowrunCharacter.hasMany(CombatAction, { foreignKey: 'characterId' });
CombatParticipant.belongsTo(ShadowrunCharacter, { foreignKey: 'characterId' });
CombatAction.belongsTo(ShadowrunCharacter, { foreignKey: 'characterId' });

// Combat utility methods
Combat.prototype.calculateInitiative = function(character) {
  const initiative = character.quickness + character.reaction;
  const modifier = Math.floor(Math.random() * 6) + 1; // Initiative die
  return initiative + modifier;
};

Combat.prototype.applyDamage = function(participant, damage, damageType = 'physical') {
  const maxBoxes = participant.character.body + 6; // Standard damage boxes
  
  if (damageType === 'physical') {
    participant.currentPhysical = Math.max(0, participant.currentPhysical - damage);
    
    // Check for immediate death
    if (participant.currentPhysical <= -maxBoxes) {
      participant.isDead = true;
      return 'dead';
    }
    
    // Check for unconsciousness
    if (participant.currentPhysical <= 0) {
      participant.isUnconscious = true;
      return 'unconscious';
    }
  } else {
    participant.currentHealth = Math.max(0, participant.currentHealth - damage);
    
    // Check for stun
    if (participant.currentHealth <= 0) {
      participant.isStunned = true;
      return 'stunned';
    }
  }
  
  return 'alive';
};

Combat.prototype.getCombatStatus = function() {
  const participants = this.CombatParticipants;
  let alive = 0;
  let unconscious = 0;
  let dead = 0;
  let stunned = 0;
  
  participants.forEach(participant => {
    if (participant.isDead) dead++;
    else if (participant.isUnconscious) unconscious++;
    else if (participant.isStunned) stunned++;
    else alive++;
  });
  
  return {
    total: participants.length,
    alive,
    unconscious,
    dead,
    stunned,
    round: this.currentRound,
    active: this.isActive
  };
};

module.exports = {
  Combat,
  CombatParticipant,
  CombatAction
};