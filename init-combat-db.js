const db = require('../database');
const { Combat, CombatParticipant, CombatAction } = db;

/**
 * Initialize Combat Database Tables
 * Creates the combat-related database tables if they don't exist
 */
async function initCombatDB() {
  try {
    console.log('Initializing combat database tables...');
    
    // Sync all combat-related models
    await Combat.sync({ alter: true });
    await CombatParticipant.sync({ alter: true });
    await CombatAction.sync({ alter: true });
    
    console.log('Combat database tables initialized successfully');
    
    // Create sample combat data for testing
    await createSampleCombatData();
    
    return true;
  } catch (error) {
    console.error('Error initializing combat database:', error);
    throw error;
  }
}

/**
 * Create sample combat data for testing
 */
async function createSampleCombatData() {
  try {
    console.log('Creating sample combat data...');
    
    // Create a sample combat
    const sampleCombat = await Combat.create({
      combatName: 'Street Gang Encounter',
      difficulty: 3,
      environment: 'outdoor',
      summary: 'A chance encounter with a street gang in the rain-soaked alleyways of Seattle'
    });
    
    // Create sample participants
    const participants = [
      {
        characterId: 1, // Assuming character with ID 1 exists
        initiative: 12,
        initiativeOrder: 1,
        currentPhysical: 10,
        currentStun: 8,
        isUnconscious: false,
        isDead: false,
        isStunned: false
      },
      {
        characterId: 2, // Assuming character with ID 2 exists
        initiative: 10,
        initiativeOrder: 2,
        currentPhysical: 8,
        currentStun: 10,
        isUnconscious: false,
        isDead: false,
        isStunned: false
      }
    ];
    
    for (const participant of participants) {
      await CombatParticipant.create({
        ...participant,
        combatId: sampleCombat.id
      });
    }
    
    // Create sample actions
    const actions = [
      {
        combatId: sampleCombat.id,
        characterId: 1,
        actionType: 'attack',
        actionName: 'Pistol Shot',
        targetId: 2,
        diceRolled: [5, 3, 6, 4, 2],
        successes: 2,
        damageDealt: 2,
        damageType: 'physical',
        description: 'Street Samurai fires pistol, hitting target for 2 damage'
      },
      {
        combatId: sampleCombat.id,
        characterId: 2,
        actionType: 'defense',
        actionName: 'Dodge',
        diceRolled: [4, 6, 3, 5, 1],
        successes: 2,
        damageDealt: 0,
        damageType: null,
        description: 'Gang member dodges attack, taking no damage'
      }
    ];
    
    for (const action of actions) {
      await CombatAction.create(action);
    }
    
    console.log('Sample combat data created successfully');
  } catch (error) {
    console.log('Could not create sample combat data (may not have characters yet):', error.message);
  }
}

/**
 * Get combat statistics
 */
async function getCombatStats() {
  try {
    const combatCount = await Combat.count();
    const participantCount = await CombatParticipant.count();
    const actionCount = await CombatAction.count();
    
    return {
      combats: combatCount,
      participants: participantCount,
      actions: actionCount
    };
  } catch (error) {
    console.error('Error getting combat stats:', error);
    return { combats: 0, participants: 0, actions: 0 };
  }
}

/**
 * Clean up old combat data (older than 30 days)
 */
async function cleanupOldCombatData() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldCombats = await Combat.findAll({
      where: {
        createdAt: {
          [db.Sequelize.Op.lt]: thirtyDaysAgo
        }
      }
    });
    
    for (const combat of oldCombats) {
      await CombatAction.destroy({
        where: { combatId: combat.id }
      });
      await CombatParticipant.destroy({
        where: { combatId: combat.id }
      });
      await combat.destroy();
    }
    
    console.log(`Cleaned up ${oldCombats.length} old combats`);
  } catch (error) {
    console.error('Error cleaning up old combat data:', error);
  }
}

// Export functions and models
module.exports = {
  initCombatDB,
  createSampleCombatData,
  getCombatStats,
  cleanupOldCombatData,
  Combat,
  CombatParticipant,
  CombatAction
};

// Auto-run initialization if this file is executed directly
if (require.main === module) {
  initCombatDB()
    .then(() => {
      console.log('Combat database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Combat database initialization failed:', error);
      process.exit(1);
    });
}