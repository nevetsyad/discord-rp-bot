// Database initialization script for Shadowrun 3rd Edition
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

// Import all models
const Character = require('./models/Character')(sequelize);
const User = require('./models/User')(sequelize);
const Scene = require('./models/Scene')(sequelize);
const DiceRoll = require('./models/DiceRoll')(sequelize);
const CharacterScene = require('./models/CharacterScene')(sequelize);
const ShadowrunCharacter = require('./models/ShadowrunCharacter')(sequelize);

// Define relationships
User.hasMany(Character, { foreignKey: 'user_id' });
Character.belongsTo(User, { foreignKey: 'user_id' });

Scene.hasMany(CharacterScene, { foreignKey: 'scene_id' });
CharacterScene.belongsTo(Scene, { foreignKey: 'scene_id' });

Character.hasMany(CharacterScene, { foreignKey: 'character_id' });
CharacterScene.belongsTo(Character, { foreignKey: 'character_id' });

User.hasMany(DiceRoll, { foreignKey: 'user_id' });
DiceRoll.belongsTo(User, { foreignKey: 'user_id' });

Scene.hasMany(DiceRoll, { foreignKey: 'scene_id' });
DiceRoll.belongsTo(Scene, { foreignKey: 'scene_id' });

// ShadowrunCharacter relationships
User.hasMany(ShadowrunCharacter, { foreignKey: 'user_id' });
ShadowrunCharacter.belongsTo(User, { foreignKey: 'user_id' });

const db = {
  sequelize,
  Character,
  User,
  Scene,
  DiceRoll,
  CharacterScene,
  ShadowrunCharacter
};

// Sync database with force option to recreate tables
async function initializeDatabase() {
  try {
    console.log('Syncing database with Shadowrun 3rd Edition models...');
    
    // Sync all tables
    await sequelize.sync({ force: true });
    
    console.log('Database synchronized successfully with Shadowrun support!');
    console.log('Tables created:');
    console.log('- characters (original)');
    console.log('- users');
    console.log('- scenes');
    console.log('- dice_rolls');
    console.log('- character_scenes');
    console.log('- shadowrun_characters (new Shadowrun 3rd Edition table)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// If this file is run directly, initialize the database
if (require.main === module) {
  initializeDatabase();
}

module.exports = db;