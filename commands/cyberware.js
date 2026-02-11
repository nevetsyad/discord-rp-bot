const { SlashCommandBuilder } = require('discord.js');
const { ShadowrunCyberware } = require('../utils/ShadowrunCyberware');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cyberware')
    .setDescription('Cyberware and bioware management')
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all available cyberware and bioware'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('category')
        .setDescription('List cyberware by category')
        .addStringOption(option =>
          option.setName('type')
            .setDescription('Category type')
            .setRequired(true)
            .addChoices(
              { name: 'Cyberware', value: 'cyberware' },
              { name: 'Bioware', value: 'bioware' },
              { name: 'Alpha', value: 'alpha' },
              { name: 'Beta', value: 'beta' },
              { name: 'Delta', value: 'delta' })))
    .addSubcommand(subcommand =>
      subcommand
        .setName('install')
        .setDescription('Install cyberware or bioware')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Cyberware name')
            .setRequired(true)
            .setAutocomplete(true))
        .addIntegerOption(option =>
          option.setName('rating')
            .setDescription('Rating level (1-6)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(6)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove installed cyberware')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Cyberware name to remove')
            .setRequired(true)
            .setAutocomplete(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('installed')
        .setDescription('Show currently installed cyberware'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('effects')
        .setDescription('Show effects of installed cyberware')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Cyberware name (optional)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('compatibility')
        .setDescription('Check cyberware compatibility')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Cyberware name')
            .setRequired(true)
            .setAutocomplete(true))),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const cyberware = new ShadowrunCyberware();

    try {
      switch (subcommand) {
        case 'list':
          await handleList(interaction, cyberware);
          break;
        case 'category':
          await handleCategory(interaction, cyberware);
          break;
        case 'install':
          await handleInstall(interaction, cyberware);
          break;
        case 'remove':
          await handleRemove(interaction, cyberware);
          break;
        case 'installed':
          await handleInstalled(interaction, cyberware);
          break;
        case 'effects':
          await handleEffects(interaction, cyberware);
          break;
        case 'compatibility':
          await handleCompatibility(interaction, cyberware);
          break;
      }
    } catch (error) {
      console.error('Error in cyberware command:', error);
      await interaction.reply({ content: 'An error occurred while processing your cyberware request.', ephemeral: true });
    }
  }
};

async function handleList(interaction, cyberware) {
  const allCyberware = cyberware.getAllCyberware();
  
  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle('Available Cyberware & Bioware')
    .setDescription(`Found ${allCyberware.length} items available.`)
    .setFields(
      allCyberware.slice(0, 10).map(item => ({
        name: item.name,
        value: `Type: ${item.type} | Cost: ¥${item.cost} | Essence: ${item.essence} | ${item.availability} Availability`,
        inline: true
      }))
    )
    .setTimestamp();
  
  if (allCyberware.length > 10) {
    embed.setFooter({ text: `Showing first 10 of ${allCyberware.length} items. Use /cyberware category for more specific searches.` });
  }
  
  await interaction.reply({ embeds: [embed] });
}

async function handleCategory(interaction, cyberware) {
  const type = interaction.options.getString('type');
  
  let filteredCyberware;
  let title;
  let description;
  
  switch (type) {
    case 'cyberware':
      filteredCyberware = cyberware.getCyberwareByType('cyberware');
      title = 'Cyberware';
      description = 'Technology-based enhancements';
      break;
    case 'bioware':
      filteredCyberware = cyberware.getCyberwareByType('bioware');
      title = 'Bioware';
      description = 'Biologically engineered enhancements';
      break;
    case 'alpha':
      filteredCyberware = cyberware.getCyberwareByGrade('alpha');
      title = 'Alpha Grade Cyberware';
      description = 'High-quality cyberware with reduced essence cost';
      break;
    case 'beta':
      filteredCyberware = cyberware.getCyberwareByGrade('beta');
      title = 'Beta Grade Cyberware';
      description = 'Premium cyberware with minimal essence cost';
      break;
    case 'delta':
      filteredCyberware = cyberware.getCyberwareByGrade('delta');
      title = 'Delta Grade Cyberware';
      description = 'Top-tier cyberware with no essence cost';
      break;
    default:
      filteredCyberware = [];
      title = 'No Results';
      description = 'No cyberware found matching the criteria.';
  }
  
  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle(`${title} (${filteredCyberware.length} items)`)
    .setDescription(description)
    .setFields(
      filteredCyberware.slice(0, 10).map(item => ({
        name: item.name,
        value: `Cost: ¥${item.cost} | Essence: ${item.essence} | ${item.availability} Availability`,
        inline: true
      }))
    )
    .setTimestamp();
  
  if (filteredCyberware.length > 10) {
    embed.setFooter({ text: `Showing first 10 of ${filteredCyberware.length} items.` });
  }
  
  await interaction.reply({ embeds: [embed] });
}

async function handleInstall(interaction, cyberware) {
  const name = interaction.options.getString('name');
  const rating = interaction.options.getInteger('rating') || 1;
  
  const result = cyberware.installCyberware(name, rating);
  
  const embed = new EmbedBuilder()
    .setColor(result.success ? 0x00ff00 : 0xff0000)
    .setTitle(result.success ? 'Cyberware Installed' : 'Installation Failed')
    .setDescription(result.message)
    .addFields(
      { name: 'Item', value: result.item ? result.item.name : 'N/A', inline: true },
      { name: 'Rating', value: rating.toString(), inline: true },
      { name: 'Essence Cost', value: result.essenceCost.toString(), inline: true },
      { name: 'Essence Remaining', value: result.essenceRemaining.toString(), inline: true }
    )
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed] });
}

async function handleRemove(interaction, cyberware) {
  const name = interaction.options.getString('name');
  
  const result = cyberware.removeCyberware(name);
  
  const embed = new EmbedBuilder()
    .setColor(result.success ? 0x00ff00 : 0xff0000)
    .setTitle(result.success ? 'Cyberware Removed' : 'Removal Failed')
    .setDescription(result.message)
    .addFields(
      { name: 'Item', value: result.item ? result.item.name : 'N/A', inline: true },
      { name: 'Essence Refunded', value: result.essenceRefunded.toString(), inline: true },
      { name: 'Essence Remaining', value: result.essenceRemaining.toString(), inline: true }
    )
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed] });
}

async function handleInstalled(interaction, cyberware) {
  const installed = cyberware.getInstalledCyberware();
  
  if (installed.length === 0) {
    await interaction.reply({ content: 'No cyberware currently installed.', ephemeral: true });
    return;
  }
  
  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle('Installed Cyberware & Bioware')
    .setDescription(`${installed.length} items currently installed:`)
    .setFields(
      installed.map(item => ({
        name: item.name,
        value: `Type: ${item.type} | Rating: ${item.rating} | Essence: ${item.essenceCost}`,
        inline: true
      }))
    )
    .addFields(
      { name: 'Total Essence Cost', value: cyberware.getTotalEssenceCost().toString(), inline: true },
      { name: 'Essence Remaining', value: cyberware.getEssenceRemaining().toString(), inline: true }
    )
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed] });
}

async function handleEffects(interaction, cyberware) {
  const name = interaction.options.getString('name');
  
  if (name) {
    // Show effects of specific cyberware
    const item = cyberware.getCyberwareByName(name);
    if (!item) {
      await interaction.reply({ content: `Cyberware "${name}" not found.`, ephemeral: true });
      return;
    }
    
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`Cyberware Effects: ${item.name}`)
      .setDescription(item.description)
      .addFields(
        { name: 'Type', value: item.type, inline: true },
        { name: 'Essence Cost', value: item.essence.toString(), inline: true },
        { name: 'Cost', value: `¥${item.cost.toLocaleString()}`, inline: true },
        { name: 'Availability', value: item.availability, inline: true },
        { name: 'Rating', value: item.rating.toString(), inline: true }
      )
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  } else {
    // Show effects of all installed cyberware
    const installed = cyberware.getInstalledCyberware();
    const totalEssenceCost = cyberware.getTotalEssenceCost();
    const essenceRemaining = cyberware.getEssenceRemaining();
    
    if (installed.length === 0) {
      await interaction.reply({ content: 'No cyberware currently installed.', ephemeral: true });
      return;
    }
    
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Effects of Installed Cyberware')
      .setDescription('Summary of all installed cyberware effects:')
      .addFields(
        { name: 'Total Essence Cost', value: totalEssenceCost.toString(), inline: true },
        { name: 'Essence Remaining', value: essenceRemaining.toString(), inline: true },
        { name: 'Items Installed', value: installed.length.toString(), inline: true }
      )
      .setTimestamp();
    
    await interaction.reply({ content: `Use /cyberware effects <name> to see specific effects of each item.`, ephemeral: true });
  }
}

async function handleCompatibility(interaction, cyberware) {
  const name = interaction.options.getString('name');
  
  const result = cyberware.checkCompatibility(name);
  
  const embed = new EmbedBuilder()
    .setColor(result.compatible ? 0x00ff00 : 0xff0000)
    .setTitle('Cyberware Compatibility Check')
    .setDescription(result.message)
    .addFields(
      { name: 'Item', value: result.item ? result.item.name : 'N/A', inline: true },
      { name: 'Compatible', value: result.compatible ? 'Yes' : 'No', inline: true },
      { name: 'Essence Cost', value: result.item ? result.item.essence.toString() : 'N/A', inline: true },
      { name: 'Essence Remaining', value: result.essenceRemaining.toString(), inline: true }
    )
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed] });
}