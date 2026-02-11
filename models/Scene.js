const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Scene = sequelize.define('Scene', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: 'scene_name_guild_unique',
      msg: 'Scene name must be unique per guild'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['serious', 'comedic', 'mysterious', 'action', 'romantic', 'tragic', 'hopeful']]
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'completed', 'abandoned'),
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'paused', 'completed', 'abandoned']]
    }
  },
  creator_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  guild_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  max_players: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // 0 means unlimited
  },
  current_players: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'scenes',
  timestamps: true,
  underscored: true
});

module.exports = Scene;