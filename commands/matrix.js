const { SlashCommandBuilder } = require('discord.js');
const { ShadowrunMatrix } = require('../utils/ShadowrunMatrix');
const { ShadowrunMatrixCombat } = require('../utils/ShadowrunMatrixCombat');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('matrix')
    .setDescription('Matrix operations and cyberdeck management')
    .addSubcommand(subcommand =>
      subcommand
        .setName('deck-info')
        .setDescription('Get information about cyberdecks')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Cyberdeck name')
            .setRequired(false)
            .setAutocomplete(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('load-deck')
        .setDescription('Load a cyberdeck for matrix operations')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Cyberdeck name')
            .setRequired(true)
            .setAutocomplete(true))
        .addIntegerOption(option =>
          option.setName('mpcp')
            .setDescription('MPCP rating (3-12)')
            .setRequired(false)
            .setMinValue(3)
            .setMaxValue(12)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('persona')
        .setDescription('Manage persona programs')
        .addStringOption(option =>
          option.setName('action')
            .setDescription('Action to perform')
            .setRequired(true)
            .addChoices(
              { name: 'List Available', value: 'list' },
              { name: 'Load Program', value: 'load' },
              { name: 'Show Loaded', value: 'show' }))
        .addStringOption(option =>
          option.setName('program')
            .setDescription('Program name (for load action)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('scan')
        .setDescription('Scan for nodes and ICE')
        .addIntegerOption(option =>
          option.setName('rating')
            .setDescription('Scan rating (1-6)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(6)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('attack-node')
        .setDescription('Attack a matrix node')
        .addStringOption(option =>
          option.setName('target')
            .setDescription('Target node ID')
            .setRequired(true))
        .addIntegerOption(option =>
          option.setName('dice')
            .setDescription('Attack dice pool')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(20)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('defend')
        .setDescription('Defend against matrix attacks')
        .addIntegerOption(option =>
          option.setName('dice')
            .setDescription('Defense dice pool')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(20))),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const matrix = new ShadowrunMatrix();
    const matrixCombat = new ShadowrunMatrixCombat();

    try {
      switch (subcommand) {
        case 'deck-info':
          await handleDeckInfo(interaction, matrix);
          break;
        case 'load-deck':
          await handleLoadDeck(interaction, matrix);
          break;
        case 'persona':
          await handlePersona(interaction, matrix);
          break;
        case 'scan':
          await handleScan(interaction, matrix);
          break;
        case 'attack-node':
          await handleAttackNode(interaction, matrixCombat);
          break;
        case 'defend':
          await handleDefend(interaction, matrixCombat);
          break;
      }
    } catch (error) {
      console.error('Error in matrix command:', error);
      await interaction.reply({ content: 'An error occurred while processing your matrix operation.', ephemeral: true });
    }
  }
};

async function handleDeckInfo(interaction, matrix) {
  const deckName = interaction.options.getString('name');
  
  if (deckName) {
    const deck = matrix.getCyberdeck(deckName);
    if (!deck) {
      await interaction.reply({ content: `Cyberdeck "${deckName}" not found.`, ephemeral: true });
      return;
    }
    
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`Cyberdeck: ${deck.name}`)
      .addFields(
        { name: 'MPCP Rating', value: deck.mpcp.toString(), inline: true },
        { name: 'Device Rating', value: deck.deviceRating.toString(), inline: true },
        { name: 'Attack', value: deck.attack.toString(), inline: true },
        { name: 'Sleaze', value: deck.sleaze.toString(), inline: true },
        { name: 'Data Processing', value: deck.dataProcessing.toString(), inline: true },
        { name: 'Firewall', value: deck.firewall.toString(), inline: true },
        { name: 'Slots', value: deck.slots.toString(), inline: true },
        { name: 'Capacity', value: deck.capacity.toString(), inline: true },
        { name: 'Availability', value: deck.availability.toString(), inline: true },
        { name: 'Cost', value: `¥${deck.cost.toLocaleString()}`, inline: true }
      )
      .setDescription(deck.description)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  } else {
    const decks = matrix.getAllCyberdecks();
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Available Cyberdecks')
      .setDescription(`Found ${decks.length} cyberdecks available.`)
      .setFields(decks.map(deck => ({
        name: deck.name,
        value: `MPCP ${deck.mpcp} | ¥${deck.cost.toLocaleString()} | ${deck.availability} Availability`,
        inline: true
      })))
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
}

async function handleLoadDeck(interaction, matrix) {
  const deckName = interaction.options.getString('name');
  const mpcp = interaction.options.getInteger('mpcp');
  
  const result = matrix.loadCyberdeck(deckName, mpcp);
  
  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle('Cyberdeck Loaded')
    .setDescription(result.message)
    .addFields(
      { name: 'Deck', value: result.deck.name, inline: true },
      { name: 'MPCP', value: result.deck.mpcp.toString(), inline: true }
    )
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed] });
}

async function handlePersona(interaction, matrix) {
  const action = interaction.options.getString('action');
  const programName = interaction.options.getString('program');
  
  switch (action) {
    case 'list':
      const programs = matrix.getAvailablePersonaPrograms();
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('Available Persona Programs')
        .setDescription(`Found ${programs.length} persona programs available.`)
        .setFields(programs.map(prog => ({
          name: prog.name,
          value: `Type: ${prog.type} | Rating: ${prog.rating} | Cost: ${prog.cost}`,
          inline: true
        })))
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      break;
      
    case 'load':
      if (!programName) {
        await interaction.reply({ content: 'Please specify a program to load.', ephemeral: true });
        return;
      }
      
      const loadResult = matrix.loadPersonaProgram(programName);
      const loadEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('Persona Program Loaded')
        .setDescription(loadResult.message)
        .addFields(
          { name: 'Program', value: loadResult.program.name, inline: true },
          { name: 'Type', value: loadResult.program.type, inline: true },
          { name: 'Rating', value: loadResult.program.rating.toString(), inline: true }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [loadEmbed] });
      break;
      
    case 'show':
      const loadedPrograms = matrix.getLoadedPersonaPrograms();
      if (loadedPrograms.length === 0) {
        await interaction.reply({ content: 'No persona programs currently loaded.', ephemeral: true });
        return;
      }
      
      const showEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('Loaded Persona Programs')
        .setDescription(`${loadedPrograms.length} programs currently loaded:`)
        .setFields(loadedPrograms.map(prog => ({
          name: prog.name,
          value: `Type: ${prog.type} | Rating: ${prog.rating}`,
          inline: true
        })))
        .setTimestamp();
      
      await interaction.reply({ embeds: [showEmbed] });
      break;
  }
}

async function handleScan(interaction, matrix) {
  const rating = interaction.options.getInteger('rating');
  
  const result = matrix.scanMatrix(rating);
  
  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle('Matrix Scan Results')
    .setDescription(result.message)
    .addFields(
      { name: 'Scan Rating', value: rating.toString(), inline: true },
      { name: 'Nodes Found', value: result.nodes.length.toString(), inline: true },
      { name: 'ICE Detected', value: result.iceDetected.toString(), inline: true }
    )
    .setTimestamp();
  
  if (result.nodes.length > 0) {
    embed.addFields(
      result.nodes.slice(0, 3).map(node => ({
        name: node.name,
        value: `ID: ${node.id} | Security: ${node.security} | Response: ${node.response}`,
        inline: false
      }))
    );
  }
  
  await interaction.reply({ embeds: [embed] });
}

async function handleAttackNode(interaction, matrixCombat) {
  const target = interaction.options.getString('target');
  const dice = interaction.options.getInteger('dice');
  
  const result = matrixCombat.attackNode(target, dice);
  
  const embed = new EmbedBuilder()
    .setColor(result.success ? 0x00ff00 : 0xff0000)
    .setTitle('Matrix Attack')
    .setDescription(result.message)
    .addFields(
      { name: 'Target', value: target, inline: true },
      { name: 'Attack Dice', value: dice.toString(), inline: true },
      { name: 'Successes', value: result.successes.toString(), inline: true },
      { name: 'Result', value: result.success ? 'SUCCESS' : 'FAILURE', inline: true }
    )
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed] });
}

async function handleDefend(interaction, matrixCombat) {
  const dice = interaction.options.getInteger('dice');
  
  const result = matrixCombat.defend(dice);
  
  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle('Matrix Defense')
    .setDescription(result.message)
    .addFields(
      { name: 'Defense Dice', value: dice.toString(), inline: true },
      { name: 'Successes', value: result.successes.toString(), inline: true },
      { name: 'Security Tally', value: result.securityTally, inline: true }
    )
    .setTimestamp();
  
  await interaction.reply({ embeds: [embed] });
}