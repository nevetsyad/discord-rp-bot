const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Character = sequelize.define('Character', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: 'character_name_user_unique',
      msg: 'Character name must be unique per user'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  personality: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  appearance: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  backstory: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  skills: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  health: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  max_health: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mana: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  max_mana: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  strength: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  dexterity: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  intelligence: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  wisdom: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  charisma: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  constitution: {
    type: DataTypes.INTEGER,
    defaultValue: 10
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
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'characters',
  timestamps: true,
  underscored: true
});

module.exports = Character;