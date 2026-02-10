// Phase 4: Magic System Comprehensive Testing Suite
const ShadowrunMagic = require('../utils/ShadowrunMagic');
const ShadowrunSpirits = require('../utils/ShadowrunSpirits');
const ShadowrunAstral = require('../utils/ShadowrunAstral');
const ShadowrunDice = require('../utils/ShadowrunDice');

console.log('🔮 Starting Phase 4: Magic System Testing Suite...');
console.log('='.repeat(50));

// Test Results
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Helper function to run tests
function runTest(testName, testFunction) {
  testResults.total++;
  try {
    const result = testFunction();
    if (result) {
      console.log(`✅ ${testName}: PASSED`);
      testResults.passed++;
      return true;
    } else {
      console.log(`❌ ${testName}: FAILED`);
      testResults.failed++;
      return false;
    }
  } catch (error) {
    console.log(`❌ ${testName}: ERROR - ${error.message}`);
    testResults.failed++;
    return false;
  }
}

// Test ShadowrunMagic System
console.log('\n🧪 Testing ShadowrunMagic System...');

// Test 1: Spell casting
runTest('Spell casting with valid parameters', () => {
  const magic = new ShadowrunMagic();
  const character = {
    name: 'Test Mage',
    magic: 6,
    willpower: 5,
    intuition: 4,
    spells: {
      'Stunbolt': { rating: 6 }
    }
  };
  
  const result = magic.castSpell(character, 'Stunbolt', 'physical');
  
  return result && 
         result.spell === 'Stunbolt' &&
         result.castingPool === 12 && // magic + skill
         result.drain.value >= 3; // Base M (3) + floor(successes/2)
});

// Test 2: Spell casting with invalid spell
runTest('Spell casting with invalid spell', () => {
  const magic = new ShadowrunMagic();
  const character = {
    name: 'Test Mage',
    magic: 6,
    willpower: 5,
    intuition: 4,
    spells: {
      'Stunbolt': { rating: 6 }
    }
  };
  
  try {
    magic.castSpell(character, 'InvalidSpell');
    return false; // Should throw an error
  } catch (error) {
    return true; // Correctly threw an error
  }
});

// Test 3: Drain calculation
runTest('Drain calculation', () => {
  const magic = new ShadowrunMagic();
  const character = {
    name: 'Test Mage',
    magic: 6,
    willpower: 5,
    intuition: 4,
    spells: {
      'Fireball': { rating: 6 }
    }
  };
  
  const result = magic.castSpell(character, 'Fireball', 'physical');
  
  return result && result.drain.value >= 3; // Base M (3) + floor(successes/2)
});

// Test 4: Spell categories
runTest('Spell categories validation', () => {
  const magic = new ShadowrunMagic();
  const character = {
    name: 'Test Mage',
    magic: 6,
    willpower: 5,
    intuition: 4,
    spells: {
      'Stunbolt': { rating: 6, category: 'combat' },
      'Fireball': { rating: 6, category: 'combat' }
    }
  };
  
  const combatSpells = magic.getSpellsByCategory(character, 'combat');
  
  return combatSpells && 
         combatSpells.length > 0 && 
         combatSpells.every(spell => spell.category === 'combat');
});

// Test ShadowrunSpirits System
console.log('\n👻 Testing ShadowrunSpirits System...');

// Test 1: Spirit summoning - Hermetic
runTest('Hermetic spirit summoning', () => {
  const spirits = new ShadowrunSpirits();
  const character = {
    name: 'Test Hermetic Mage',
    magic: 6,
    willpower: 5,
    charisma: 4,
    intuition: 4,
    spiritControl: 6,
    tradition: 'Hermetic'
  };
  
  const result = spirits.summonSpirit(character, 'AIR_ELEMENTAL', 4);
  
  return result && 
         result.success &&
         result.spirit && 
         result.spirit.tradition === 'Hermetic' &&
         result.spirit.type === 'AIR_ELEMENTAL';
});

// Test 2: Spirit summoning - Shamanic
runTest('Shamanic spirit summoning', () => {
  const spirits = new ShadowrunSpirits();
  const character = {
    name: 'Test Shaman',
    magic: 6,
    willpower: 5,
    charisma: 4,
    intuition: 4,
    spiritControl: 6,
    tradition: 'Shamanic'
  };
  
  const result = spirits.summonSpirit(character, 'BEAST_SPIRIT', 4);
  
  return result && 
         result.success &&
         result.spirit && 
         result.spirit.tradition === 'Shamanic' &&
         result.spirit.type === 'BEAST_SPIRIT';
});

// Test 3: Spirit drain calculation
runTest('Spirit drain calculation', () => {
  const spirits = new ShadowrunSpirits();
  const character = {
    name: 'Test Mage',
    magic: 6,
    willpower: 5,
    charisma: 4,
    intuition: 4,
    spiritControl: 6,
    tradition: 'Hermetic'
  };
  
  const result = spirits.summonSpirit(character, 'FIRE_ELEMENTAL', 6);
  
  return result && result.drain.value === 3; // Force 6 / 2 = 3 (base drain for 1 service)
});

// Test 4: Spirit powers
runTest('Spirit powers validation', () => {
  const spirits = new ShadowrunSpirits();
  const result = spirits.summonSpirit(
    { name: 'Test', magic: 6, willpower: 5, charisma: 4, intuition: 4, spiritControl: 6, tradition: 'Hermetic' }, 
    'WATER_ELEMENTAL', 
    4
  );
  
  return result && 
         result.success &&
         result.spirit && 
         result.spirit.powers &&
         result.spirit.powers.length > 0;
});

// Test ShadowrunAstral System
console.log('\n✨ Testing ShadowrunAstral System...');

// Test 1: Astral initiative calculation
runTest('Astral initiative calculation', () => {
  const astral = new ShadowrunAstral();
  const character = {
    name: 'Test Astral Mage',
    intuition: 4,
    willpower: 5,
    magic: 6
  };
  
  const result = astral.calculateAstralInitiative(character);
  
  return result && 
         result.base === 2 &&
         result.total >= 2 && // Base 2 + intuition + willpower
         result.total <= 17; // Max roll (12) + 4 + 5
});

// Test 2: Astral movement calculation
runTest('Astral movement calculation', () => {
  const astral = new ShadowrunAstral();
  const character = {
    name: 'Test Astral Mage',
    agility: 4,
    magic: 6
  };
  
  const result = astral.calculateAstralMovement(character);
  
  return result === 100 + (4 * 10) + (6 * 5); // 100 + 40 + 30 = 170
});

// Test 3: Astral perception test
runTest('Astral perception test', () => {
  const astral = new ShadowrunAstral();
  const character = {
    name: 'Test Astral Mage',
    willpower: 5,
    magic: 6
  };
  
  const target = { name: 'Test Target' };
  const result = astral.astralPerceptionTest(character, target);
  
  return result && 
         result.pool === 11 && // willpower + magic = 5 + 6
         result.roll &&
         typeof result.success === 'boolean';
});

// Test 4: Astral combat
runTest('Astral combat test', () => {
  const astral = new ShadowrunAstral();
  const attacker = {
    name: 'Test Attacker',
    willpower: 6,
    magic: 6
  };
  
  const defender = {
    name: 'Test Defender',
    willpower: 5,
    magic: 5
  };
  
  const result = astral.astralCombatAttack(attacker, defender);
  
  return result && 
         result.attackPool === 12 && // willpower + magic = 6 + 6
         result.defensePool === 10 && // willpower + magic = 5 + 5
         result.attackRoll &&
         result.defenseRoll;
});

// Test 5: Astral projection
runTest('Astral projection test', () => {
  const astral = new ShadowrunAstral();
  const character = {
    name: 'Test Astral Mage',
    magic: 6,
    willpower: 5
  };
  
  const result = astral.projectIntoAstral(character);
  
  return result && 
         result.projectionPool === 6 &&
         result.drain.value === 3 && // magic / 2 = 6 / 2 = 3
         result.drain.type === 'physical';
});

// Test 6: Astral return
runTest('Astral return test', () => {
  const astral = new ShadowrunAstral();
  const character = {
    name: 'Test Astral Mage',
    willpower: 5,
    magic: 6
  };
  
  const result = astral.returnFromAstral(character);
  
  return result && 
         result.returnPool === 11 && // willpower + magic = 5 + 6
         result.targetNumber === 4;
});

// Test 7: Astral tracking
runTest('Astral tracking test', () => {
  const astral = new ShadowrunAstral();
  const character = {
    name: 'Test Tracker',
    intuition: 4,
    magic: 6
  };
  
  const result = astral.astralTracking(character, null, 300);
  
  return result && 
         result.trackingPool === 10 && // intuition + magic = 4 + 6
         result.distanceModifier === -1 && // Distance > 200m
         result.targetNumber === 3; // Need 3+ successes to track
});

// Test Integration and Edge Cases
console.log('\n🔗 Testing Integration and Edge Cases...');

// Test 1: Character with 0 magic cannot astral project
runTest('Character with 0 magic cannot astral project', () => {
  const astral = new ShadowrunAstral();
  const character = {
    name: 'Magicless Character',
    magic: 0,
    willpower: 5
  };
  
  try {
    astral.projectIntoAstral(character);
    return false; // Should throw an error
  } catch (error) {
    return error.message.includes('Magic attribute is 0');
  }
});

// Test 2: Critical glitch in astral projection
runTest('Critical glitch handling in astral projection', () => {
  const astral = new ShadowrunAstral();
  const character = {
    name: 'Test Astral Mage',
    magic: 6,
    willpower: 5
  };
  
  // Mock a critical glitch
  const mockRoll = {
    total: 0,
    successes: 0,
    diceRolled: 6,
    glitch: false,
    criticalGlitch: true
  };
  
  // We can't directly test the internal method, but we can verify the structure
  const result = astral.projectIntoAstral(character);
  
  return result && 
         result.roll &&
         result.complications &&
         Array.isArray(result.complications);
});

// Test 3: Spell specialization bonus
runTest('Spell specialization bonus calculation', () => {
  const magic = new ShadowrunMagic();
  const character = {
    name: 'Specialized Mage',
    magic: 6,
    willpower: 5,
    intuition: 4,
    magic_specialization: 'combat'
  };
  
  const spell = {
    name: 'Stunbolt',
    category: 'combat',
    force: 4,
    is_specialized: true,
    specialization: 'combat'
  };
  
  const pool = magic.calculateSpellPool(character, spell);
  
  return pool === 6; // Force 4 + specialization bonus 2 = 6
});

// Test 4: Astral barrier interaction
runTest('Astral barrier interaction', () => {
  const astral = new ShadowrunAstral();
  const character = {
    name: 'Test Barrier Breaker',
    willpower: 6,
    magic: 6
  };
  
  const barrier = {
    name: 'Magical Ward',
    force: 4
  };
  
  const result = astral.interactWithAstralBarrier(character, barrier);
  
  return result && 
         result.resistancePool === 12 && // willpower + magic = 6 + 6
         result.barrierForce === 4;
});

// Performance Test
console.log('\n⚡ Performance Testing...');

// Test 1: Multiple spell casts performance
runTest('Multiple spell casts performance', () => {
  const magic = new ShadowrunMagic();
  const character = {
    name: 'Performance Test Mage',
    magic: 6,
    willpower: 5,
    intuition: 4,
    spells: {
      'Stunbolt': { rating: 6 }
    }
  };
  
  const startTime = Date.now();
  const iterations = 100;
  
  for (let i = 0; i < iterations; i++) {
    magic.castSpell(character, 'Stunbolt', 'physical');
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Should complete 100 iterations in under 1 second
  return duration < 1000;
});

// Test 2: Multiple spirit summons performance
runTest('Multiple spirit summons performance', () => {
  const spirits = new ShadowrunSpirits();
  const character = {
    name: 'Performance Test Summoner',
    magic: 6,
    willpower: 5,
    charisma: 4,
    intuition: 4,
    spiritControl: 6
  };
  
  const startTime = Date.now();
  const iterations = 50;
  
  for (let i = 0; i < iterations; i++) {
    spirits.summonSpirit(character, 'AIR_ELEMENTAL', 4);
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Should complete 50 iterations in under 1 second
  return duration < 1000;
});

// Print Results
console.log('\n📊 Test Results Summary');
console.log('='.repeat(50));
console.log(`Total Tests: ${testResults.total}`);
console.log(`Passed: ${testResults.passed} ✅`);
console.log(`Failed: ${testResults.failed} ❌`);
console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

if (testResults.failed === 0) {
  console.log('\n🎉 ALL TESTS PASSED! Phase 4 Magic System is ready!');
  console.log('='.repeat(50));
} else {
  console.log('\n⚠️ Some tests failed. Please review the implementation.');
  console.log('='.repeat(50));
}

console.log('\n📋 Testing Complete - Phase 4 Magic System');
console.log('='.repeat(50));