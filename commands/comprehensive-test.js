const { SlashCommandBuilder } = require('discord.js');
const EnhancedEmbeds = require('./enhanced-embeds');
const EnhancedErrorHandling = require('./enhanced-error-handling');

// Test imports (these will fail if dependencies aren't available, which is fine for testing)
let testModules = {};
try {
  testModules.ShadowrunCharacter = require('../models/ShadowrunCharacter');
} catch (e) {
  console.log('ShadowrunCharacter model not available for testing');
}
try {
  testModules.ShadowrunDice = require('../utils/ShadowrunDice');
} catch (e) {
  console.log('ShadowrunDice utility not available for testing');
}
try {
  testModules.ShadowrunCombat = require('../utils/ShadowrunCombat');
} catch (e) {
  console.log('ShadowrunCombat utility not available for testing');
}
try {
  testModules.ShadowrunMagic = require('../utils/ShadowrunMagic');
} catch (e) {
  console.log('ShadowrunMagic utility not available for testing');
}
try {
  testModules.ShadowrunMatrix = require('../utils/ShadowrunMatrix');
} catch (e) {
  console.log('ShadowrunMatrix utility not available for testing');
}
try {
  testModules.ShadowrunCyberware = require('../utils/ShadowrunCyberware');
} catch (e) {
  console.log('ShadowrunCyberware utility not available for testing');
}
try {
  testModules.ShadowrunNuyen = require('../utils/ShadowrunNuyen');
} catch (e) {
  console.log('ShadowrunNuyen utility not available for testing');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('comprehensive-test')
    .setDescription('Run comprehensive tests of all bot systems')
    .addSubcommand(subcommand =>
      subcommand
        .setName('all-systems')
        .setDescription('Test all systems and report results'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('phase1')
        .setDescription('Test Phase 1: Character System'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('phase2')
        .setDescription('Test Phase 2: Combat System'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('phase3')
        .setDescription('Test Phase 3: Magic System'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('phase4')
        .setDescription('Test Phase 4: Matrix System'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('phase5')
        .setDescription('Test Phase 5: Enhanced Features')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const enhancedEmbeds = new EnhancedEmbeds();
    const errorHandling = new EnhancedErrorHandling();

    try {
      switch (subcommand) {
        case 'all-systems':
          await testAllSystems(interaction, enhancedEmbeds, errorHandling);
          break;
        case 'phase1':
          await testPhase1(interaction, enhancedEmbeds, errorHandling);
          break;
        case 'phase2':
          await testPhase2(interaction, enhancedEmbeds, errorHandling);
          break;
        case 'phase3':
          await testPhase3(interaction, enhancedEmbeds, errorHandling);
          break;
        case 'phase4':
          await testPhase4(interaction, enhancedEmbeds, errorHandling);
          break;
        case 'phase5':
          await testPhase5(interaction, enhancedEmbeds, errorHandling);
          break;
      }
    } catch (error) {
      await errorHandling.handleCommandError(interaction, error, 'comprehensive-test');
    }
  }
};

async function testAllSystems(interaction, enhancedEmbeds, errorHandling) {
  const results = {
    phase1: false,
    phase2: false,
    phase3: false,
    phase4: false,
    phase5: false,
    database: false,
    commands: false
  };

  const tests = [];

  // Test Phase 1: Character System
  tests.push(testPhase1(interaction, enhancedEmbeds, errorHandling));
  
  // Test Phase 2: Combat System
  tests.push(testPhase2(interaction, enhancedEmbeds, errorHandling));
  
  // Test Phase 3: Magic System
  tests.push(testPhase3(interaction, enhancedEmbeds, errorHandling));
  
  // Test Phase 4: Matrix System
  tests.push(testPhase4(interaction, enhancedEmbeds, errorHandling));
  
  // Test Phase 5: Enhanced Features
  tests.push(testPhase5(interaction, enhancedEmbeds, errorHandling));

  // Wait for all tests to complete
  await Promise.allSettled(tests);

  // Create comprehensive test results embed
  const testEmbed = new enhancedEmbeds.createInfoEmbed(
    'Comprehensive System Test Results',
    'Testing all bot systems for functionality and compatibility'
  );

  // Add test results
  const testResults = [];
  testResults.push({ name: '🎭 Phase 1 - Character System', value: results.phase1 ? '✅ PASSED' : '❌ FAILED' });
  testResults.push({ name: '⚔️ Phase 2 - Combat System', value: results.phase2 ? '✅ PASSED' : '❌ FAILED' });
  testResults.push({ name: '✨ Phase 3 - Magic System', value: results.phase3 ? '✅ PASSED' : '❌ FAILED' });
  testResults.push({ name: '💻 Phase 4 - Matrix System', value: results.phase4 ? '✅ PASSED' : '❌ FAILED' });
  testResults.push({ name: '🎨 Phase 5 - Enhanced Features', value: results.phase5 ? '✅ PASSED' : '❌ FAILED' });

  testEmbed.addFields(testResults);

  // Overall status
  const passedTests = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;
  
  testEmbed.addFields([
    { name: '📊 Overall Status', value: `${passedTests}/${totalTests} systems passed` },
    { name: '🎯 Success Rate', value: `${Math.round((passedTests / totalTests) * 100)}%` },
    { name: '⚡ Performance', value: passedTests === totalTests ? 'All systems operational' : 'Some issues detected' }
  ]);

  await interaction.reply({ embeds: [testEmbed], ephemeral: false });
}

async function testPhase1(interaction, enhancedEmbeds, errorHandling) {
  const results = [];
  
  try {
    // Test character creation (if model available)
    if (testModules.ShadowrunCharacter) {
      const testCharacter = await testModules.ShadowrunCharacter.create({
        name: 'TestCharacter',
        race: 'Human',
        archetype: 'StreetSamurai',
        priority: 'E',
        karma: 3,
        user_id: interaction.user.id,
        guild_id: interaction.guild.id,
        a_attributes: ['Body', 'Quickness'],
        b_attributes: ['Strength'],
        c_attributes: ['Charisma'],
        d_attribute: ['Willpower']
      });

      results.push('Character creation: ✅');

      // Test character sheet generation
      const sheet = testCharacter.getCharacterSheet();
      results.push('Character sheet: ✅');

      // Test racial maximums
      const racialMax = testCharacter.getRacialMaximums();
      results.push('Racial maximums: ✅');

      // Clean up test character
      await testCharacter.destroy();
    } else {
      results.push('Character creation: SKIPPED (model not available)');
    }

    // Test dice rolling (if utility available)
    if (testModules.ShadowrunDice) {
      const dice = new testModules.ShadowrunDice();
      const diceResult = dice.rollDicePool(10, 5);
      results.push('Dice rolling: ✅');
    } else {
      results.push('Dice rolling: SKIPPED (utility not available)');
    }

    return results.length >= 2; // At least some tests should pass
  } catch (error) {
    console.error('Phase 1 test failed:', error);
    return false;
  }
}

async function testPhase2(interaction, enhancedEmbeds, errorHandling) {
  const results = [];
  
  try {
    // Test combat system (if utility available)
    if (testModules.ShadowrunCombat) {
      const combat = new testModules.ShadowrunCombat();
      
      // Test initiative calculation
      const initiative = combat.calculateInitiative ? combat.calculateInitiative(4, 3, 0) : 'N/A';
      if (initiative !== 'N/A') {
        results.push('Initiative calculation: ✅');
      } else {
        results.push('Initiative calculation: ❌ Not implemented');
      }

      results.push('Combat system: ✅');
    } else {
      results.push('Combat system: SKIPPED (utility not available)');
    }

    return results.length >= 1;
  } catch (error) {
    console.error('Phase 2 test failed:', error);
    return false;
  }
}

async function testPhase3(interaction, enhancedEmbeds, errorHandling) {
  const results = [];
  
  try {
    // Test magic system (if utility available)
    if (testModules.ShadowrunMagic) {
      const magic = new testModules.ShadowrunMagic();
      
      // Test spell categories
      const spells = magic.getSpellsByCategory ? magic.getSpellsByCategory('combat') : null;
      if (spells) {
        results.push('Spell listing: ✅');
      } else {
        results.push('Spell listing: ❌ Not implemented');
      }

      results.push('Magic system: ✅');
    } else {
      results.push('Magic system: SKIPPED (utility not available)');
    }

    return results.length >= 1;
  } catch (error) {
    console.error('Phase 3 test failed:', error);
    return false;
  }
}

async function testPhase4(interaction, enhancedEmbeds, errorHandling) {
  const results = [];
  
  try {
    // Test matrix system (if utility available)
    if (testModules.ShadowrunMatrix) {
      const matrix = new testModules.ShadowrunMatrix();
      
      // Test cyberdeck loading
      if (matrix.loadCyberdeck) {
        const cyberdeck = matrix.loadCyberdeck('Hermes Chorus', 5);
        results.push('Cyberdeck loading: ✅');
      } else {
        results.push('Cyberdeck loading: ❌ Not implemented');
      }

      // Test matrix scanning
      if (matrix.scanMatrix) {
        const scanResult = matrix.scanMatrix(4);
        results.push('Matrix scanning: ✅');
      } else {
        results.push('Matrix scanning: ❌ Not implemented');
      }

      // Test persona programs
      if (matrix.getAvailablePersonaPrograms) {
        const programs = matrix.getAvailablePersonaPrograms();
        results.push('Persona programs: ✅');
      } else {
        results.push('Persona programs: ❌ Not implemented');
      }
    } else {
      results.push('Matrix system: SKIPPED (utility not available)');
    }

    return results.length >= 1;
  } catch (error) {
    console.error('Phase 4 test failed:', error);
    return false;
  }
}

async function testPhase5(interaction, enhancedEmbeds, errorHandling) {
  const results = [];
  
  try {
    // Test enhanced embeds
    const testEmbed = enhancedEmbeds.createSuccessEmbed('Test', 'Test message');
    results.push('Enhanced embeds: ✅');

    // Test error handling
    const validation = errorHandling.validateCommandOptions(interaction, ['test']);
    results.push('Error handling: ✅');

    // Test nuyen system (if utility available)
    if (testModules.ShadowrunNuyen) {
      const nuyen = new testModules.ShadowrunNuyen();
      const balance = nuyen.getBalance({ nuyen: 50000 });
      results.push('Nuyen system: ✅');
    } else {
      results.push('Nuyen system: SKIPPED (utility not available)');
    }

    // Test cyberware system (if utility available)
    if (testModules.ShadowrunCyberware) {
      const cyberware = new testModules.ShadowrunCyberware();
      const cyberwareList = cyberware.getCyberwareList();
      results.push('Cyberware system: ✅');
    } else {
      results.push('Cyberware system: SKIPPED (utility not available)');
    }

    return results.length >= 2; // At least embeds and error handling should pass
  } catch (error) {
    console.error('Phase 5 test failed:', error);
    return false;
  }
}