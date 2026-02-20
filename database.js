const dotenv = require('dotenv');
const sequelize = require('./config/database');

dotenv.config();

// Import models
const Character = require('./models/Character');
const User = require('./models/User');
const Scene = require('./models/Scene');
const ShadowrunCharacter = require('./models/ShadowrunCharacter');
const ShadowrunCombat = require('./models/ShadowrunCombat');
const ShadowrunMagic = require('./models/ShadowrunMagic');
const ShadowrunCyberware = require('./utils/ShadowrunCyberware');
const ShadowrunNuyen = require('./utils/ShadowrunNuyen');
const ShadowrunVehicles = require('./utils/ShadowrunVehicles');
const { Combat, CombatParticipant, CombatAction } = require('./models/Combat');
const { DMActionSubmission, DMActionQueue, DMActionHistory } = require('./models/DMActionSubmission');

// Define relationships
User.hasMany(Character, { foreignKey: 'user_id' });
Character.belongsTo(User, { foreignKey: 'user_id' });

// Initialize utility systems
const cyberwareSystem = new ShadowrunCyberware(sequelize);
const nuyenSystem = new ShadowrunNuyen(sequelize);
const vehiclesSystem = new ShadowrunVehicles(sequelize);

// Combat relationships
User.hasMany(Combat, { foreignKey: 'user_id' });
Combat.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(CombatParticipant, { foreignKey: 'user_id' });
CombatParticipant.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(CombatAction, { foreignKey: 'user_id' });
CombatAction.belongsTo(User, { foreignKey: 'user_id' });

Character.hasMany(CombatParticipant, { foreignKey: 'character_id' });
CombatParticipant.belongsTo(Character, { foreignKey: 'character_id' });

Character.hasMany(CombatAction, { foreignKey: 'character_id' });
CombatAction.belongsTo(Character, { foreignKey: 'character_id' });

Scene.hasMany(Combat, { foreignKey: 'scene_id' });
Combat.belongsTo(Scene, { foreignKey: 'scene_id' });

// Shadowrun relationships
ShadowrunCharacter.hasMany(ShadowrunCombat, { foreignKey: 'character_id' });
ShadowrunCombat.belongsTo(ShadowrunCharacter, { foreignKey: 'character_id' });

const db = {
  sequelize,
  Character,
  User,
  Scene,
  ShadowrunCharacter,
  ShadowrunCombat,
  ShadowrunMagic,
  Combat,
  CombatParticipant,
  CombatAction,
  DMActionSubmission,
  DMActionQueue,
  DMActionHistory,
  cyberwareSystem,
  nuyenSystem,
  vehiclesSystem
};

let initialized = false;

async function initializeDatabase(options = {}) {
  if (initialized) return db;

  const nodeEnv = options.nodeEnv || process.env.NODE_ENV || 'development';
  const strategy = options.strategy || (nodeEnv === 'production' ? 'migrate' : 'alter');
  const allowSync = typeof options.allowSync === 'boolean'
    ? options.allowSync
    : nodeEnv !== 'production';

  // Production-safe strategy: default to migrate/no runtime schema changes.
  if (nodeEnv === 'production' && ['alter', 'force'].includes(strategy)) {
    throw new Error('Unsafe runtime schema strategy for production. Use migrations instead.');
  }

  if (strategy === 'migrate') {
    await sequelize.authenticate();
    initialized = true;
    return db;
  }

  if (!allowSync) {
    await sequelize.authenticate();
    initialized = true;
    return db;
  }

  if (strategy === 'force') {
    await sequelize.sync({ force: true });
  } else if (strategy === 'alter') {
    await sequelize.sync({ alter: true });
  } else {
    await sequelize.sync();
  }

  initialized = true;
  return db;
}

module.exports = {
  ...db,
  initializeDatabase
};
