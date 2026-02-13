const { DataTypes } = require('sequelize');
const sequelize = require('../database');

/**
 * Direct Message Action Submission Model
 * Stores private action declarations from players via DM
 */
const DMActionSubmission = sequelize.define('DMActionSubmission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Identification
  submissionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Unique submission ID'
  },
  discordUserId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Discord user ID who submitted the action'
  },
  discordUsername: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Discord username for display'
  },
  // Action details
  actionType: {
    type: DataTypes.ENUM('attack', 'spell', 'movement', 'skill', 'item', 'defense', 'special'),
    allowNull: false,
    comment: 'Type of action being declared'
  },
  actionName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the action'
  },
  // Combat context
  combatId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Combat ID this action is for'
  },
  characterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Character ID performing the action'
  },
  // Action parameters
  parameters: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Action-specific parameters (target, weapon, spell, etc.)'
  },
  // Processing state
  status: {
    type: DataTypes.ENUM('pending', 'validated', 'approved', 'rejected', 'processed', 'failed'),
    defaultValue: 'pending',
    comment: 'Current status of the submission'
  },
  validationMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Validation results or error messages'
  },
  gmNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'GM notes or approval/rejection reasons'
  },
  // Processing results
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the action was processed'
  },
  processedBy: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'GM who processed the action'
  },
  // Timestamps
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'When the action was submitted'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the submission expires (auto-cleanup)'
  }
});

// Indexes for performance
DMActionSubmission.addIndex(['submissionId'], { unique: true });
DMActionSubmission.addIndex(['discordUserId', 'status']);
DMActionSubmission.addIndex(['combatId', 'status']);
DMActionSubmission.addIndex(['characterId', 'status']);
DMActionSubmission.addIndex(['submittedAt']);

/**
 * DM Action Queue Model
 * Manages the order of actions to be processed
 */
const DMActionQueue = sequelize.define('DMActionQueue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  submissionId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'DMActionSubmissions',
      key: 'submissionId'
    }
  },
  // Queue management
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Position in the processing queue'
  },
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Priority level (higher = processed first)'
  },
  // Processing state
  isProcessing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this item is currently being processed'
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the action was processed'
  }
});

// DM Action History Model
const DMActionHistory = sequelize.define('DMActionHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  submissionId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Reference to the original submission'
  },
  discordUserId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Discord user ID'
  },
  actionType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Type of action'
  },
  actionName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the action'
  },
  // Action results
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Final status of the action'
  },
  resultDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description of the outcome'
  },
  // Combat integration
  combatId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Combat ID if applicable'
  },
  characterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Character ID'
  },
  // Timestamps
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'When this history entry was created'
  }
});

// Define relationships
DMActionSubmission.hasOne(DMActionQueue, { foreignKey: 'submissionId' });
DMActionQueue.belongsTo(DMActionSubmission, { foreignKey: 'submissionId' });

DMActionSubmission.hasMany(DMActionHistory, { foreignKey: 'submissionId' });
DMActionHistory.belongsTo(DMActionSubmission, { foreignKey: 'submissionId' });

// Utility methods
DMActionSubmission.prototype.validateAction = function() {
  const errors = [];
  const action = this;
  
  // Basic validation
  if (!action.actionType || !action.actionName) {
    errors.push('Action type and name are required');
  }
  
  // Validate action-specific parameters
  if (action.parameters) {
    switch (action.actionType) {
      case 'attack':
        if (!action.parameters.target) {
          errors.push('Attack actions require a target');
        }
        if (!action.parameters.weapon && !action.parameters.attackType) {
          errors.push('Attack actions require a weapon or attack type');
        }
        break;
      case 'spell':
        if (!action.parameters.spellName) {
          errors.push('Spell actions require a spell name');
        }
        if (!action.parameters.target && !action.parameters.area) {
          errors.push('Spell actions require a target or area effect');
        }
        break;
      case 'movement':
        if (!action.parameters.destination) {
          errors.push('Movement actions require a destination');
        }
        if (action.parameters.distance && (isNaN(action.parameters.distance) || action.parameters.distance <= 0)) {
          errors.push('Movement distance must be a positive number');
        }
        break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    validationMessage: errors.length > 0 ? `Validation failed: ${errors.join(', ')}` : 'Action validated successfully'
  };
};

DMActionSubmission.prototype.processAction = async function() {
  const action = this;
  const { Combat, CombatAction, CombatParticipant } = require('./Combat');
  
  try {
    // Start transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Get combat context
      let combat = null;
      if (action.combatId) {
        combat = await Combat.findByPk(action.combatId, { transaction });
        if (!combat) {
          throw new Error('Combat not found');
        }
      }
      
      // Get character
      const { ShadowrunCharacter } = require('./ShadowrunCharacter');
      const character = await ShadowrunCharacter.findByPk(action.characterId, { transaction });
      if (!character) {
        throw new Error('Character not found');
      }
      
      // Create combat action if in combat
      let combatAction = null;
      if (combat) {
        // Find participant in combat
        let participant = await CombatParticipant.findOne({
          where: { characterId: character.id, combatId: action.combatId },
          transaction
        });
        
        if (!participant) {
          throw new Error('Character not in combat');
        }
        
        // Create combat action record
        combatAction = await CombatAction.create({
          combatId: combat.id,
          characterId: character.id,
          actionType: action.actionType,
          actionName: action.actionName,
          targetId: action.parameters?.target ? parseInt(action.parameters.target) : null,
          diceRolled: action.parameters?.diceRoll || null,
          successes: action.parameters?.successes || 0,
          damageDealt: action.parameters?.damage || 0,
          damageType: action.parameters?.damageType || null,
          description: action.parameters?.description || null,
          actionTime: new Date()
        }, { transaction });
      }
      
      // Update submission status
      await action.update({
        status: 'processed',
        processedAt: new Date(),
        processedBy: 'system'
      }, { transaction });
      
      // Create history record
      await DMActionHistory.create({
        submissionId: action.submissionId,
        discordUserId: action.discordUserId,
        actionType: action.actionType,
        actionName: action.actionName,
        status: 'processed',
        resultDescription: action.parameters?.description || 'Action processed successfully',
        combatId: action.combatId,
        characterId: action.characterId
      }, { transaction });
      
      // Commit transaction
      await transaction.commit();
      
      return {
        success: true,
        combatAction,
        message: 'Action processed successfully'
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error processing DM action:', error);
    await action.update({
      status: 'failed',
      validationMessage: error.message
    });
    throw error;
  }
};

// Auto-expire old submissions
DMActionSubmission.prototype.cleanupExpired = async function() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 days ago
  
  const expiredSubmissions = await DMActionSubmission.findAll({
    where: {
      status: 'pending',
      expiresAt: {
        [sequelize.Op.lt]: new Date()
      }
    }
  });
  
  for (const submission of expiredSubmissions) {
    await submission.update({
      status: 'failed',
      validationMessage: 'Submission expired'
    });
  }
  
  return expiredSubmissions.length;
};

module.exports = {
  DMActionSubmission,
  DMActionQueue,
  DMActionHistory
};