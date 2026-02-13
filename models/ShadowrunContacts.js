/**
 * Shadowrun 3rd Edition - Contact System Database Model
 * NPC relationship management and networking system
 */

const { DataTypes } = require('sequelize');
const sequelize = require('./config/database');

module.exports = (sequelize) => {
  const ShadowrunContacts = sequelize.define('ShadowrunContacts', {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.ENUM('street', 'corporate', 'government', 'underground', 'specialist', 'fixer', 'gang', 'other'),
      allowNull: false,
      defaultValue: 'street'
    },
    connection: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 0,
        max: 12
      }
    },
    loyalty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 6
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Contact'
    },
    availability: {
      type: DataTypes.ENUM('easy', 'medium', 'hard', 'very hard', 'near impossible'),
      allowNull: false,
      defaultValue: 'medium'
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contactMethod: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    services: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    lastContacted: {
      type: DataTypes.DATE,
      allowNull: true
    },
    contactFrequency: {
      type: DataTypes.ENUM('rarely', 'occasionally', 'regularly', 'often'),
      allowNull: true,
      defaultValue: 'occasionally'
    },
    relationshipNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    isAlive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    reputation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: -10,
        max: 10
      }
    },
    dangerLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'extreme'),
      allowNull: false,
      defaultValue: 'medium'
    },
    customData: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'shadowrun_contacts',
    timestamps: true,
    indexes: [
      {
        unique: false,
        fields: ['characterId']
      },
      {
        unique: false,
        fields: ['type']
      },
      {
        unique: false,
        fields: ['connection']
      },
      {
        unique: false,
        fields: ['loyalty']
      }
    ]
  });

  // Define relationships
  ShadowrunContacts.associate = (models) => {
    ShadowrunContacts.belongsTo(models.ShadowrunCharacter, {
      foreignKey: 'characterId',
      as: 'character'
    });
  };

  return ShadowrunContacts;
};