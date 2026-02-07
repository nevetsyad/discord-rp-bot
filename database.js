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

// Import models
const Character = require('./models/Character')(sequelize);
const User = require('./models/User')(sequelize);
const Scene = require('./models/Scene')(sequelize);
const DiceRoll = require('./models/DiceRoll')(sequelize);
const CharacterScene = require('./models/CharacterScene')(sequelize);

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

const db = {
  sequelize,
  Character,
  User,
  Scene,
  DiceRoll,
  CharacterScene
};

// Sync database
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database synchronized successfully');
  })
  .catch(err => {
    console.error('Error synchronizing database:', err);
  });

module.exports = db;