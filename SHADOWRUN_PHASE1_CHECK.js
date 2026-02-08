// Phase 1 Bug Check - Shadowrun 3rd Edition Implementation
const { ShadowrunCharacter } = require('./models/ShadowrunCharacter');
const { ShadowrunDice } = require('./utils/ShadowrunDice');
const dotenv = require('dotenv');

dotenv.config();

console.log('=== Phase 1 Bug Check: Shadowrun 3rd Edition Implementation ===\n');

// Test 1: Racial Maximums
console.log('Test 1: Checking Racial Maximums');
const races = ['Human', 'Elf', 'Dwarf', 'Ork', 'Troll'];
const expectedMax = {
  Human: { body: 9, quickness: 9, strength: 9, charisma: 9, intelligence: 9, willpower: 9 },
  Elf: { body: 9, quickness: 11, strength: 9, charisma: 12, intelligence: 9, willpower: 9 },
  Dwarf: { body: 11, quickness: 9, strength: 12, charisma: 9, intelligence: 9, willpower: 11 },
  Ork: { body: 14, quickness: 9, strength: 12, charisma: 8, intelligence: 8, willpower: 9 },
  Troll: { body: 17, quickness: 8, strength: 15, charisma: 6, intelligence: 6, willpower: 9 }
};

let test1Pass = true;
races.forEach(race => {
  const char = ShadowrunCharacter.build({
    name: 'Test',
    race,
    archetype: 'Mage',
    user_id: 'test',
    guild_id: 'test'
  });
  
  const racialMax = char.getRacialMaximums();
  const expected = expectedMax[race];
  
  let match = true;
  Object.keys(expected).forEach(attr => {
    if (racialMax[attr] !== expected[attr]) {
      console.log(`❌ ${race} ${attr}: Expected ${expected[attr]}, got ${racialMax[attr]}`);
      match = false;
    }
  });
  
  if (match) {
    console.log(`✅ ${race} racial maximums correct`);
  } else {
    test1Pass = false;
  }
});

// Test 2: Starting Karma
console.log('\nTest 2: Starting Karma');
const expectedKarma = { Human: 3, Elf: 0, Dwarf: 0, Ork: 0, Troll: 0 };
let test2Pass = true;

races.forEach(race => {
  const char = ShadowrunCharacter.build({
    name: 'Test',
    race,
    archetype: 'Mage',
    user_id: 'test',
    guild_id: 'test'
  });
  
  const startingKarma = char.getStartingKarma();
  const expected = expectedKarma[race];
  
  if (startingKarma === expected) {
    console.log(`✅ ${race} starting karma: ${expected}`);
  } else {
    console.log(`❌ ${race} starting karma: Expected ${expected}, got ${startingKarma}`);
    test2Pass = false;
  }
});

// Test 3: Archetype Packages
console.log('\nTest 3: Archetype Packages');
const archetypes = ['Mage', 'StreetSamurai', 'Shaman', 'Rigger', 'Decker', 'PhysicalAdept'];
let test3Pass = true;

archetypes.forEach(archetype => {
  const char = ShadowrunCharacter.build({
    name: 'Test',
    race: 'Human',
    archetype,
    user_id: 'test',
    guild_id: 'test'
  });
  
  const package = char.getArchetypePackage();
  const hasRecommended = package.recommended && Object.keys(package.recommended).length > 0;
  const hasSkills = package.skills && Array.isArray(package.skills);
  
  if (hasRecommended && hasSkills) {
    console.log(`✅ ${archetype} package valid`);
  } else {
    console.log(`❌ ${archetype} package incomplete`);
    test3Pass = false;
  }
});

// Test 4: Dice System
console.log('\nTest 4: Dice System');
const dice = new ShadowrunDice();
let test4Pass = true;

// Basic dice roll
const basicRoll = dice.rollDicePool(6, 5);
if (basicRoll.dice.length === 6 && basicRoll.successes >= 0) {
  console.log(`✅ Basic dice roll works`);
} else {
  console.log(`❌ Basic dice roll failed`);
  test4Pass = false;
}

// Combat pool roll
const combatRoll = dice.rollCombatPool(10, 5, 5);
if (combatRoll.totalPool === 10 && combatRoll.allocated.offense === 5 && combatRoll.allocated.defense === 5) {
  console.log(`✅ Combat pool roll works`);
} else {
  console.log(`❌ Combat pool roll failed`);
  test4Pass = false;
}

// Spellcasting roll
const spellRoll = dice.rollSpellcasting(3, 4, 0);
if (spellRoll.dice.length === 7 && spellRoll.successes >= 0) {
  console.log(`✅ Spellcasting roll works`);
} else {
  console.log(`❌ Spellcasting roll failed`);
  test4Pass = false;
}

// Test 5: Character Methods
console.log('\nTest 5: Character Methods');
let test5Pass = true;

const testChar = ShadowrunCharacter.build({
  name: 'TestChar',
  race: 'Human',
  archetype: 'Mage',
  body: 5,
  quickness: 6,
  strength: 4,
  charisma: 7,
  intelligence: 8,
  willpower: 6,
  karma: 15,
  essence: 6.0,
  magic: 3,
  reaction: 5,
  user_id: 'test',
  guild_id: 'test'
});

// Initiative calculation
const initiative = testChar.calculateInitiative();
if (initiative === 11) { // quickness(6) + reaction(5) = 11
  console.log(`✅ Initiative calculation works`);
} else {
  console.log(`❌ Initiative calculation failed: Expected 11, got ${initiative}`);
  test5Pass = false;
}

// Initiative passes
const passes = testChar.calculateInitiativePasses();
if (passes === 1) { // floor(11/10) = 1
  console.log(`✅ Initiative passes calculation works`);
} else {
  console.log(`❌ Initiative passes calculation failed: Expected 1, got ${passes}`);
  test5Pass = false;
}

// Karma spending
try {
  const result = testChar.spendKarma('intelligence', 1);
  if (result.oldRating === 8 && result.newRating === 9 && result.karmaSpent === 15) {
    console.log(`✅ Karma spending works`);
  } else {
    console.log(`❌ Karma spending failed`);
    test5Pass = false;
  }
} catch (error) {
  console.log(`❌ Karma spending error: ${error.message}`);
  test5Pass = false;
}

// Test 6: Character Sheet
console.log('\nTest 6: Character Sheet');
let test6Pass = true;

const sheet = testChar.getCharacterSheet();
if (sheet && sheet.name === 'TestChar' && sheet.race === 'Human' && sheet.archetype === 'Mage') {
  console.log(`✅ Character sheet generation works`);
} else {
  console.log(`❌ Character sheet generation failed`);
  test6Pass = false;
}

// Final Results
console.log('\n=== Phase 1 Bug Check Results ===');
const totalTests = 6;
const passingTests = [test1Pass, test2Pass, test3Pass, test4Pass, test5Pass, test6Pass].filter(Boolean).length;
const failingTests = totalTests - passingTests;

console.log(`Total Tests: ${totalTests}`);
console.log(`Passing Tests: ${passingTests}`);
console.log(`Failing Tests: ${failingTests}`);

if (failingTests === 0) {
  console.log('🎉 ALL TESTS PASSED! Phase 1 implementation is ready.');
} else {
  console.log(`⚠️ ${failingTests} test(s) failed. Please review and fix the issues.`);
  
  // Exit with error code if tests fail
  process.exit(1);
}

console.log('\n=== Bug Check Complete ===');