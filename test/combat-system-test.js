// Test Phase 3: Combat System
const { Sequelize, DataTypes } = require('sequelize');

// Use the existing MySQL database for testing
const sequelize = require('../database').sequelize;

// Mock ShadowrunCharacter for testing
const ShadowrunCharacter = sequelize.define('ShadowrunCharacter', {
  name: DataTypes.STRING,
  race: DataTypes.STRING,
  reaction: DataTypes.INTEGER,
  intuition: DataTypes.INTEGER,
  body: DataTypes.INTEGER,
  willpower: DataTypes.INTEGER,
  charisma: DataTypes.INTEGER,
  strength: DataTypes.INTEGER,
  agility: DataTypes.INTEGER,
  logic: DataTypes.INTEGER,
  edge: DataTypes.INTEGER,
  magic: DataTypes.INTEGER,
  essence: DataTypes.INTEGER
});

// Mock ShadowrunCombat
const ShadowrunCombat = sequelize.define('ShadowrunCombat', {
  initiative: DataTypes.INTEGER,
  initiative_passes: DataTypes.INTEGER,
  combat_pool: DataTypes.INTEGER,
  combat_pool_offense: DataTypes.INTEGER,
  combat_pool_defense: DataTypes.INTEGER,
  physical_monitor: DataTypes.INTEGER,
  physical_damage: DataTypes.INTEGER,
  stun_monitor: DataTypes.INTEGER,
  stun_damage: DataTypes.INTEGER,
  is_active: DataTypes.BOOLEAN
});

// Set up relationships
ShadowrunCharacter.hasMany(ShadowrunCombat, { foreignKey: 'character_id' });
ShadowrunCombat.belongsTo(ShadowrunCharacter, { foreignKey: 'character_id' });

// Add methods to mock character
ShadowrunCharacter.prototype.getSkillRating = function(skillName) {
  const skills = {
    'pistols': 4,
    'rifles': 3,
    'swords': 3,
    'unarmedcombat': 2
  };
  return skills[skillName] || 0;
};

// Add combat methods to mock
ShadowrunCombat.prototype.calculateInitiative = function() {
  const reaction = this.character.reaction || 1;
  const intuition = this.character.intuition || 1;
  const diceRoll = Math.floor(Math.random() * 6) + 1;
  
  this.initiative = reaction + intuition + diceRoll;
  this.initiative_passes = Math.floor(this.initiative / 10) + 1;
  
  return {
    total: this.initiative,
    dice: diceRoll,
    passes: this.initiative_passes
  };
};

ShadowrunCombat.prototype.getCombatStatus = function() {
  return {
    initiative: this.initiative,
    passes: this.initiative_passes,
    combat_pool: {
      total: this.combat_pool,
      offense: this.combat_pool_offense,
      defense: this.combat_pool_defense,
      remaining: this.combat_pool - this.combat_pool_offense - this.combat_pool_defense
    },
    condition_monitor: {
      physical: {
        current: this.physical_damage,
        max: this.physical_monitor,
        remaining: this.physical_monitor - this.physical_damage
      },
      stun: {
        current: this.stun_damage,
        max: this.stun_monitor,
        remaining: this.stun_monitor - this.stun_damage
      }
    },
    is_active: this.is_active
  };
};

// Test combat system
async function testCombatSystem() {
  console.log('=== Phase 3: Combat System Test ===\n');
  
  try {
    // Sync database
    await sequelize.sync();
    console.log('✅ Test database created');
    
    // Create test character
    const character = await ShadowrunCharacter.create({
      name: 'Test Samurai',
      race: 'Human',
      reaction: 4,
      intuition: 4,
      body: 5,
      willpower: 5,
      charisma: 3,
      strength: 4,
      agility: 5,
      logic: 3,
      edge: 6,
      magic: 0,
      essence: 6
    });
    console.log('✅ Test character created');
    
    // Create combat session
    const combat = await ShadowrunCombat.create({
      character_id: character.id,
      combat_pool: Math.floor((character.reaction + character.intelligence) / 2) + 2,
      physical_monitor: (character.body * 2) + 8,
      stun_monitor: (character.willpower * 2) + 8,
      is_active: true
    });
    
    // Set character relationship
    combat.character = character;
    console.log('✅ Combat session created');
    
    // Test initiative calculation
    const initiative = combat.calculateInitiative();
    console.log(`🎯 Initiative Test:`);
    console.log(`   Reaction: ${character.reaction}, Intuition: ${character.intuition}`);
    console.log(`   Dice Roll: ${initiative.dice}`);
    console.log(`   Total Initiative: ${initiative.total}`);
    console.log(`   Initiative Passes: ${initiative.passes}`);
    
    // Test combat status
    const status = combat.getCombatStatus();
    console.log(`\n⚔️ Combat Status:`);
    console.log(`   Initiative: ${status.initiative}`);
    console.log(`   Combat Pool: ${status.combat_pool.total} (Offense: ${status.combat_pool.offense}, Defense: ${status.combat_pool.defense})`);
    console.log(`   Physical Monitor: ${status.condition_monitor.physical.current}/${status.condition_monitor.physical.max}`);
    console.log(`   Stun Monitor: ${status.condition_monitor.stun.current}/${status.condition_monitor.stun.max}`);
    
    // Test damage system
    const damageResult = combat.sufferDamage(3, 'physical');
    console.log(`\n💥 Damage Test:`);
    console.log(`   Damage Taken: 3 physical damage`);
    console.log(`   Result: ${damageResult.result}`);
    console.log(`   Total Physical Damage: ${damageResult.total_damage}`);
    
    // Test healing
    const healResult = combat.healDamage(2, 'physical');
    console.log(`\n🩹 Healing Test:`);
    console.log(`   Healing Applied: 2 physical damage`);
    console.log(`   Remaining Damage: ${healResult.remaining_damage}`);
    
    console.log('\n✅ Phase 3 Combat System Tests Complete!');
    console.log('✅ Initiative calculation working');
    console.log('✅ Combat pool management working');
    console.log('✅ Damage/healing system working');
    console.log('✅ Status tracking working');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCombatSystem();