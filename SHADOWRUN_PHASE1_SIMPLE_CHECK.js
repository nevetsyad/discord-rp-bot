// Phase 1 Bug Check - Shadowrun 3rd Edition Implementation (Standalone)
const { ShadowrunDice } = require('./utils/ShadowrunDice');

console.log('=== Phase 1 Bug Check: Shadowrun 3rd Edition Implementation ===\n');

// Test 1: Dice System
console.log('Test 1: Dice System');
const dice = new ShadowrunDice();
let test1Pass = true;

// Basic dice roll
const basicRoll = dice.rollDicePool(6, 5);
if (basicRoll.dice.length === 6 && basicRoll.successes >= 0 && basicRoll.dice.every(d => d >= 1 && d <= 6)) {
  console.log(`✅ Basic dice roll works - ${basicRoll.successes} successes`);
} else {
  console.log(`❌ Basic dice roll failed`);
  test1Pass = false;
}

// Test glitch detection
const glitchRoll = dice.rollDicePool(10, 5);
if (glitchRoll.ones !== undefined && glitchRoll.glitch !== undefined && glitchRoll.criticalGlitch !== undefined) {
  console.log(`✅ Glitch detection works`);
} else {
  console.log(`❌ Glitch detection failed`);
  test1Pass = false;
}

// Test 2: Combat Pool
console.log('\nTest 2: Combat Pool System');
let test2Pass = true;

try {
  const combatRoll = dice.rollCombatPool(10, 5, 5);
  if (combatRoll.totalPool === 10 && combatRoll.allocated.offense === 5 && combatRoll.allocated.defense === 5) {
    console.log(`✅ Combat pool allocation works`);
  } else {
    console.log(`❌ Combat pool allocation failed`);
    test2Pass = false;
  }
} catch (error) {
  console.log(`❌ Combat pool error: ${error.message}`);
  test2Pass = false;
}

// Test 3: Specialized Rolls
console.log('\nTest 3: Specialized Rolls');
let test3Pass = true;

// Spellcasting roll
const spellRoll = dice.rollSpellcasting(3, 4, 0);
if (spellRoll.dice.length === 7 && spellRoll.successes >= 0) {
  console.log(`✅ Spellcasting roll works - ${spellRoll.successes} successes`);
} else {
  console.log(`❌ Spellcasting roll failed`);
  test3Pass = false;
}

// Conjuring roll
const conjureRoll = dice.rollConjuring(2, 5, 1);
if (conjureRoll.dice.length === 8 && conjureRoll.successes >= 0) {
  console.log(`✅ Conjuring roll works - ${conjureRoll.successes} successes`);
} else {
  console.log(`❌ Conjuring roll failed`);
  test3Pass = false;
}

// Decking roll
const deckRoll = dice.rollDecking(4, 6, -1);
if (deckRoll.dice.length === 9 && deckRoll.successes >= 0) {
  console.log(`✅ Decking roll works - ${deckRoll.successes} successes`);
} else {
  console.log(`❌ Decking roll failed`);
  test3Pass = false;
}

// Test 4: Initiative Calculation
console.log('\nTest 4: Initiative System');
let test4Pass = true;

const initiative = dice.calculateInitiative(6, 5, 0);
if (initiative === 11) { // quickness(6) + reaction(5) = 11
  console.log(`✅ Initiative calculation works - ${initiative}`);
} else {
  console.log(`❌ Initiative calculation failed: Expected 11, got ${initiative}`);
  test4Pass = false;
}

const initiativeWithMods = dice.calculateInitiative(6, 5, -2);
if (initiativeWithMods === 9) { // quickness(6) + reaction(5) - 2 = 9
  console.log(`✅ Initiative with modifiers works - ${initiativeWithMods}`);
} else {
  console.log(`❌ Initiative with modifiers failed: Expected 9, got ${initiativeWithMods}`);
  test4Pass = false;
}

const passes = dice.calculateInitiativePasses(11);
if (passes === 1) { // floor(11/10) = 1
  console.log(`✅ Initiative passes calculation works - ${passes} passes`);
} else {
  console.log(`❌ Initiative passes calculation failed: Expected 1, got ${passes}`);
  test4Pass = false;
}

// Test 5: Roll Results and Descriptions
console.log('\nTest 5: Roll Results and Descriptions');
let test5Pass = true;

const successRoll = dice.rollDicePool(8, 4); // Easy TN, should get successes
const failureRoll = dice.rollDicePool(3, 6); // Hard TN, likely failure

if (dice.isSuccessful(successRoll, 1) && !dice.isSuccessful(failureRoll, 5)) {
  console.log(`✅ Success/failure detection works`);
} else {
  console.log(`❌ Success/failure detection failed`);
  test5Pass = false;
}

const successDesc = dice.getResultDescription(successRoll, 1);
const failureDesc = dice.getResultDescription(failureRoll, 5);
if (successDesc.includes('Success') && failureDesc.includes('Failure')) {
  console.log(`✅ Result descriptions work`);
} else {
  console.log(`❌ Result descriptions failed`);
  test5Pass = false;
}

// Test 6: Embed Creation
console.log('\nTest 6: Embed Creation');
let test6Pass = true;

try {
  const embed = dice.createRollEmbed(basicRoll, 'basic', 'Test Roll');
  if (embed && embed.data && embed.data.title === 'Test Roll') {
    console.log(`✅ Basic embed creation works`);
  } else {
    console.log(`❌ Basic embed creation failed`);
    test6Pass = false;
  }
} catch (error) {
  console.log(`❌ Basic embed creation error: ${error.message}`);
  test6Pass = false;
}

try {
  const combatEmbed = dice.createCombatPoolEmbed(combatRoll, 'Test Character');
  if (combatEmbed && combatEmbed.data && combatEmbed.data.title === 'Test Character - Combat Pool Roll') {
    console.log(`✅ Combat embed creation works`);
  } else {
    console.log(`❌ Combat embed creation failed`);
    test6Pass = false;
  }
} catch (error) {
  console.log(`❌ Combat embed creation error: ${error.message}`);
  test6Pass = false;
}

// Test 7: Edge Cases
console.log('\nTest 7: Edge Cases');
let test7Pass = true;

// Zero dice pool
const zeroRoll = dice.rollDicePool(0, 5);
if (zeroRoll.successes === 0 && zeroRoll.dice.length === 0) {
  console.log(`✅ Zero dice pool handled correctly`);
} else {
  console.log(`❌ Zero dice pool failed`);
  test7Pass = false;
}

// Single die
const singleRoll = dice.rollDicePool(1, 5);
if (singleRoll.dice.length === 1) {
  console.log(`✅ Single die roll works`);
} else {
  console.log(`❌ Single die roll failed`);
  test7Pass = false;
}

// High target number
const highTNRoll = dice.rollDicePool(10, 6);
if (highTNRoll.dice.length === 10 && highTNRoll.targetNumber === 6) {
  console.log(`✅ High target number works`);
} else {
  console.log(`❌ High target number failed`);
  test7Pass = false;
}

// Final Results
console.log('\n=== Phase 1 Bug Check Results ===');
const totalTests = 7;
const passingTests = [test1Pass, test2Pass, test3Pass, test4Pass, test5Pass, test6Pass, test7Pass].filter(Boolean).length;
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

// Print sample dice rolls for verification
console.log('\n=== Sample Dice Rolls for Verification ===');
console.log('Basic d6 pool (6 dice, TN 5):', dice.rollDicePool(6, 5));
console.log('Combat pool (10 dice, 5/5 split):', dice.rollCombatPool(10, 5, 5));
console.log('Spellcasting (3 + 4 = 7 dice):', dice.rollSpellcasting(3, 4, 0));
console.log('Initiative (Qui 6 + Rea 5 = 11):', dice.calculateInitiative(6, 5, 0), 'passes:', dice.calculateInitiativePasses(11));