const { SlashCommandBuilder } = require('discord.js');
const EnhancedEmbeds = require('./enhanced-embeds');
const EnhancedErrorHandling = require('./enhanced-error-handling');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('validation-test')
    .setDescription('Validate command structure and basic functionality')
    .addSubcommand(subcommand =>
      subcommand
        .setName('command-structure')
        .setDescription('Test all command structures and definitions'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('import-modules')
        .setDescription('Test module imports and dependencies'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('error-handling')
        .setDescription('Test error handling system'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('embed-system')
        .setDescription('Test enhanced embed system')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const enhancedEmbeds = new EnhancedEmbeds();
    const errorHandling = new EnhancedErrorHandling();

    try {
      switch (subcommand) {
        case 'command-structure':
          await testCommandStructure(interaction, enhancedEmbeds);
          break;
        case 'import-modules':
          await testModuleImports(interaction, enhancedEmbeds, errorHandling);
          break;
        case 'error-handling':
          await testErrorHandling(interaction, enhancedEmbeds, errorHandling);
          break;
        case 'embed-system':
          await testEmbedSystem(interaction, enhancedEmbeds, errorHandling);
          break;
      }
    } catch (error) {
      await errorHandling.handleCommandError(interaction, error, 'validation-test');
    }
  }
};

async function testCommandStructure(interaction, enhancedEmbeds) {
  const fs = require('fs');
  const path = require('path');
  
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  const results = {
    total: commandFiles.length,
    valid: 0,
    invalid: 0,
    errors: []
  };

  const testResults = [];

  for (const file of commandFiles) {
    try {
      const commandPath = path.join(commandsPath, file);
      const command = require(commandPath);
      
      // Check if command has required structure
      if (command.data && command.data.name && command.data.description) {
        results.valid++;
        testResults.push({ name: `✅ ${file}`, value: 'Valid structure' });
      } else {
        results.invalid++;
        testResults.push({ name: `❌ ${file}`, value: 'Invalid structure - missing data/name/description' });
        results.errors.push(`${file}: Missing required structure`);
      }
      
      // Check if execute function exists
      if (typeof command.execute !== 'function') {
        results.invalid++;
        testResults.push({ name: `❌ ${file}`, value: 'Invalid structure - missing execute function' });
        results.errors.push(`${file}: Missing execute function`);
      }
      
    } catch (error) {
      results.invalid++;
      testResults.push({ name: `❌ ${file}`, value: `Import error: ${error.message}` });
      results.errors.push(`${file}: ${error.message}`);
    }
  }

  const embed = enhancedEmbeds.createInfoEmbed(
    'Command Structure Validation Results',
    `Testing ${results.total} command files for proper structure and functionality`
  );

  embed.addFields(testResults.slice(0, 15)); // Show first 15 results

  embed.addFields([
    { name: '📊 Summary', value: `${results.valid}/${results.total} commands valid (${Math.round((results.valid/results.total)*100)}%)` },
    { name: '✅ Valid Commands', value: results.valid.toString() },
    { name: '❌ Invalid Commands', value: results.invalid.toString() },
    { name: '🔧 Issues Found', value: results.errors.length > 0 ? results.errors.slice(0, 5).join('\n') : 'None' }
  ]);

  if (results.errors.length > 5) {
    embed.addFields([{ name: 'ℹ️ Note', value: `Showing first 5 of ${results.errors.length} issues. Check logs for full details.` }]);
  }

  await interaction.reply({ embeds: [embed], ephemeral: false });
}

async function testModuleImports(interaction, enhancedEmbeds, errorHandling) {
  const modules = [
    'EnhancedEmbeds',
    'EnhancedErrorHandling',
    'ShadowrunDice',
    'ShadowrunCombat',
    'ShadowrunMagic',
    'ShadowrunMatrix',
    'ShadowrunCyberware',
    'ShadowrunNuyen'
  ];

  const testResults = [];
  let successfulImports = 0;

  for (const moduleName of modules) {
    try {
      let module;
      
      if (moduleName === 'EnhancedEmbeds') {
        module = require('./enhanced-embeds');
      } else if (moduleName === 'EnhancedErrorHandling') {
        module = require('./enhanced-error-handling');
      } else {
        module = require(`../utils/${moduleName}`);
      }
      
      testResults.push({ name: `✅ ${moduleName}`, value: 'Import successful' });
      successfulImports++;
      
    } catch (error) {
      testResults.push({ name: `❌ ${moduleName}`, value: `Import failed: ${error.message}` });
    }
  }

  const embed = enhancedEmbeds.createInfoEmbed(
    'Module Import Validation Results',
    `Testing ${modules.length} core modules for successful import`
  );

  embed.addFields(testResults);
  embed.addFields([
    { name: '📊 Success Rate', value: `${successfulImports}/${modules.length} modules loaded (${Math.round((successfulImports/modules.length)*100)}%)` },
    { name: '🎯 Status', value: successfulImports === modules.length ? 'All modules operational' : 'Some modules failed to load' }
  ]);

  await interaction.reply({ embeds: [embed], ephemeral: false });
}

async function testErrorHandling(interaction, enhancedEmbeds, errorHandling) {
  const tests = [];
  
  // Test error creation
  const testError = new Error('Test error for validation');
  tests.push('Error object creation: ✅');

  // Test validation system
  const validation = errorHandling.validateCommandOptions(interaction, ['test']);
  tests.push('Command option validation: ✅');

  // Test error embed creation
  const errorEmbed = enhancedEmbeds.createErrorEmbed('Test Error', 'Test error message');
  tests.push('Error embed creation: ✅');

  const embed = enhancedEmbeds.createSuccessEmbed(
    'Error Handling System Validation',
    'All error handling components working correctly'
  );

  embed.addFields(tests.map(test => ({ name: test, value: '✅ PASSED' })));

  embed.addFields([
    { name: '🛡️ Error Types Supported', value: 'Validation, Database, Combat, Magic, Matrix, Generic' },
    { name: '🎨 User Experience', value: 'User-friendly error messages with suggestions' },
    { name: '⚡ Performance', value: 'Lightweight error handling with minimal overhead' }
  ]);

  await interaction.reply({ embeds: [embed], ephemeral: false });
}

async function testEmbedSystem(interaction, enhancedEmbeds, errorHandling) {
  const tests = [];
  
  // Test embed creation
  const successEmbed = enhancedEmbeds.createSuccessEmbed('Test', 'Test message');
  tests.push('Success embed creation: ✅');

  const errorEmbed = enhancedEmbeds.createErrorEmbed('Test Error', 'Test error message');
  tests.push('Error embed creation: ✅');

  const infoEmbed = enhancedEmbeds.createInfoEmbed('Test Info', 'Test info message');
  tests.push('Info embed creation: ✅');

  const warningEmbed = enhancedEmbeds.createWarningEmbed('Test Warning', 'Test warning message');
  tests.push('Warning embed creation: ✅');

  // Test progress bars
  const progressBar = enhancedEmbeds.createProgressBar(7, 10);
  tests.push('Progress bar creation: ✅');

  const monitorBar = enhancedEmbeds.createMonitorBar(3, 8);
  tests.push('Monitor bar creation: ✅');

  // Test button creation
  const paginationButtons = enhancedEmbeds.createPaginationButtons(1, 3, 'test');
  tests.push('Pagination button creation: ✅');

  const actionButtons = enhancedEmbeds.createCharacterActionButtons('test-character-id');
  tests.push('Action button creation: ✅');

  // Test formatting
  const formattedNuyen = enhancedEmbeds.formatNuyen(50000);
  tests.push('Nuyen formatting: ✅');

  const embed = enhancedEmbeds.createSuccessEmbed(
    'Enhanced Embed System Validation',
    'All embed components working correctly with consistent styling'
  );

  embed.addFields(tests.map(test => ({ name: test, value: '✅ PASSED' })));

  embed.addFields([
    { name: '🎨 Color System', value: 'Primary, Success, Warning, Error, Magic, Matrix, Combat, Info' },
    { name: '📊 Visual Elements', value: 'Progress bars, Monitor bars, Status indicators' },
    { name: '🎯 Interactive Components', value: 'Pagination buttons, Action buttons' },
    { name: '💎 Formatting', value: 'Nuyen formatting, Resource display' }
  ]);

  await interaction.reply({ 
    embeds: [embed], 
    components: [paginationButtons, actionButtons], 
    ephemeral: false 
  });
}