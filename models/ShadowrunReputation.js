/**
 * Shadowrun 3rd Edition - Reputation System Database Model
 * Street cred and notoriety tracking with public reputation mechanics
 */

const { DataTypes } = require('sequelize');
const sequelize = require('./config/database');

module.exports = (sequelize) => {
  const ShadowrunReputation = sequelize.define('ShadowrunReputation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    characterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ShadowrunCharacters',
        key: 'id'
      }
    },
    community: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'General'
    },
    streetCred: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 99
      }
    },
    notoriety: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 99
      }
    },
    publicAwareness: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 99
      }
    },
    reputationScore: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.streetCred - this.notoriety;
      }
    },
    legend: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    infamous: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('unknown', 'local', 'regional', 'national', 'international', 'global'),
      allowNull: false,
      defaultValue: 'unknown'
    },
    recognition: {
      type: DataTypes.ENUM('none', 'rare', 'occasional', 'common', 'widespread'),
      allowNull: false,
      defaultValue: 'none'
    },
    feared: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    respected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    hunted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    protected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    notableActions: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    reputationHistory: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    customData: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'shadowrun_reputation',
    timestamps: true,
    indexes: [
      {
        unique: false,
        fields: ['characterId']
      },
      {
        unique: false,
        fields: ['community']
      },
      {
        unique: false,
        fields: ['streetCred']
      },
      {
        unique: false,
        fields: ['notoriety']
      }
    ]
  });

  // Define relationships
  ShadowrunReputation.associate = (models) => {
    ShadowrunReputation.belongsTo(models.ShadowrunCharacter, {
      foreignKey: 'characterId',
      as: 'character'
    });
  };

  return ShadowrunReputation;
};