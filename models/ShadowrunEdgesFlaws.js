/**
 * Shadowrun 3rd Edition - Edges & Flaws Database Model
 * Complete database integration for character edges and flaws
 */

const { DataTypes } = require('sequelize');
const sequelize = require('./config/database');

module.exports = (sequelize) => {
  const ShadowrunEdgesFlaws = sequelize.define('ShadowrunEdgesFlaws', {
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
      type: DataTypes.ENUM('edge', 'flaw'),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    gameEffect: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    availability: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Core Rules'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    customData: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'shadowrun_edges_flaws',
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
        fields: ['category']
      }
    ]
  });

  // Define relationships
  ShadowrunEdgesFlaws.associate = (models) => {
    ShadowrunEdgesFlaws.belongsTo(models.ShadowrunCharacter, {
      foreignKey: 'characterId',
      as: 'character'
    });
  };

  return ShadowrunEdgesFlaws;
};