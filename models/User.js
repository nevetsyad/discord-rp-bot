const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const User = sequelize.define('User', {
  discord_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  discriminator: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_bot: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  last_active: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  total_characters: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_scenes_created: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_dice_rolls: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

// Update user stats when characters/scenes are created
User.afterCreate((user, options) => {
  // Update stats when needed
});

module.exports = User;