const { SlashCommandBuilder } = require('/builders');
const { Character, Scene, CharacterScene } = require('../database');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gm')
    .setDescription('Game Master tools')
    .addSubcommand(subcommand =>
      subcommand
        .setName('narrate')
        .setDescription('Create narrative for the current scene')
        .addStringOption(option =>
          option.setName('description')
            .setDescription('What happens next?')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('tone')
            .setDescription('Narrative tone')
            .setRequired(false)
            .addChoices(
              { name: 'Dramatic', value: 'dramatic' },
              { name: 'Mysterious', value: 'mysterious' },
              { name: 'Action', value: 'active' },
              { name: 'Humorous', value: 'humorous' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('encounter')
        .setDescription('Create a random encounter')
        .addStringOption(option =>
          option.setName('environment')
            .setDescription('Environment type')
            .setRequired(false)
            .addChoices(
              { name: 'Forest', value: 'forest' },
              { name: 'Dungeon', value: 'dungeon' },
              { name: 'City', value: 'city' },
              { name: 'Wilderness', value: 'wilderness' },
              { name: 'Tavern', value: 'tavern' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('create_npc')
        .setDescription('Create a non-player character')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('NPC name')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('role')
            .setDescription('NPC role')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('NPC appearance and personality')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('scene_status')
        .setDescription('Check current scene status')
        .addStringOption(option =>
          option.setName('scene')
            .setDescription('Scene name')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('advance_time')
        .setDescription('Advance time in the scene')
        .addStringOption(option =>
          option.setName('amount')
            .setDescription('Time to advance (e.g., 1 hour, 2 days)')
            .setRequired(true))),

  async execute(interaction, commands) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    try {
      switch (subcommand) {
        case 'narrate':
          await narrateScene(interaction, userId);
          break;
        case 'encounter':
          await createEncounter(interaction, userId);
          break;
        case 'create_npc':
          await createNPC(interaction, userId);
          break;
        case 'scene_status':
          await checkSceneStatus(interaction, userId);
          break;
        case 'advance_time':
          await advanceTime(interaction, userId);
          break;
      }
    } catch (error) {
      console.error('Error in gm command:', error);
      await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
  }
};

async function narrateScene(interaction, userId) {
  const description = interaction.options.getString('description');
  const tone = interaction.options.getString('tone') || 'neutral';
  
  // Get user's active characters
  const userCharacters = await Character.findAll({
    where: { user_id: userId, is_active: true }
  });

  if (userCharacters.length === 0) {
    return await interaction.reply({ 
      content: 'You don\'t have any active characters to narrate with!', 
      ephemeral: true 
    });
  }

  // Get current scene (for simplicity, using the most recent scene)
  const currentScene = await Scene.findOne({
    where: { 
      creator_id: userId, 
      status: 'active' 
    },
    order: [['created_at', 'DESC']]
  });

  let sceneTitle = currentScene ? currentScene.name : 'Current Scene';
  
  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(`🎭 ${sceneTitle} - Narrative`)
    .setDescription(description)
    .addFields(
      { name: 'Tone', value: tone.charAt(0).toUpperCase() + tone.slice(1), inline: false },
      { name: 'Active Characters', value: userCharacters.map(char => `**${char.name}**`).join('\n') }
    )
    .setFooter({ text: `GM: ${interaction.user.username}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function createEncounter(interaction, userId) {
  const environment = interaction.options.getString('environment') || 'random';
  
  const encounters = {
    forest: [
      'A wounded deer stumbles through the trees, its leg caught in a hunter\'s trap.',
      'Strange glowing mushrooms illuminate a hidden cave entrance.',
      'A group of forest elves demands to know what you\'re doing in their territory.',
      'A pack of wolves watches you from the shadows, their eyes gleaming.'
    ],
    dungeon: [
      'You hear the distant sound of dripping water and chains rattling.',
      'A treasure chest sits in the center of the room, but it\'s trapped.',
      'Skeletons rise from the floor, ancient weapons clattering in their hands.',
      'A mysterious portal swirls with ethereal energy in the corner.'
    ],
    city: [
      'A street vendor offers you mysterious potions of unknown origin.',
      'The town guard is searching someone matching your description.',
      'A noble\'s carriage has overturned, and valuable cargo is scattered.',
      'A festival is in full swing, and strange things are happening in the crowds.'
    ],
    wilderness: [
      'A storm rolls in, making visibility nearly impossible.',
      'You discover ancient ruins half-buried in the sand.',
      'A merchant caravan is under attack by bandits.',
      'Strange tracks lead into a cave system you\'ve never explored.'
    ],
    tavern: [
      'A bard sings a tale of your recent adventures... but gets some details wrong.',
      'A mysterious figure slides a note across the table to you.',
      'A fight breaks out in the corner, and you\'re caught in the middle.',
      'The bartender reveals that the tavern is actually a secret meeting place.'
    ]
  };

  const encounterList = encounters[environment] || encounters.random;
  const encounter = encounterList[Math.floor(Math.random() * encounterList.length)];

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(`🎲 Random Encounter`)
    .setDescription(encounter)
    .addFields(
      { name: 'Environment', value: environment.charAt(0).toUpperCase() + environment.slice(1), inline: true },
      { name: 'Difficulty', value: 'Moderate', inline: true }
    )
    .setFooter({ text: `Generated by ${interaction.user.username}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function createNPC(interaction, userId) {
  const name = interaction.options.getString('name');
  const role = interaction.options.getString('role');
  const description = interaction.options.getString('description');

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(`👤 NPC Created: ${name}`)
    .setDescription(description)
    .addFields(
      { name: 'Role', value: role, inline: true },
      { name: 'Created By', value: interaction.user.username, inline: true },
      { name: 'Status', value: 'Available', inline: true }
    )
    .setFooter({ text: `Use /scene join to add this NPC to scenes` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function checkSceneStatus(interaction, userId) {
  const sceneName = interaction.options.getString('scene');
  
  let scene;
  if (sceneName) {
    scene = await Scene.findOne({
      where: { name: sceneName, guild_id: interaction.guild.id }
    });
  } else {
    scene = await Scene.findOne({
      where: { creator_id: userId, status: 'active' },
      order: [['created_at', 'DESC']]
    });
  }

  if (!scene) {
    return await interaction.reply({ content: 'No active scene found!', ephemeral: true });
  }

  // Get characters in scene
  const characters = await CharacterScene.findAll({
    where: { scene_id: scene.id },
    include: [{ model: require('../database').Character, include: [{ model: require('../database').User }] }]
  });

  const characterList = characters.length > 0 
    ? characters.map(cs => `**${cs.Character.name}** (owned by ${cs.Character.User.username})`).join('\n')
    : 'No characters in scene';

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(`📋 Scene Status: ${scene.name}`)
    .addFields(
      { name: 'Description', value: scene.description.substring(0, 200) + '...', inline: false },
      { name: 'Location', value: scene.location, inline: true },
      { name: 'Tone', value: scene.tone, inline: true },
      { name: 'Status', value: scene.status.charAt(0).toUpperCase() + scene.status.slice(1), inline: true },
      { name: 'Characters', value: characterList }
    )
    .setFooter({ text: `Created by ${interaction.user.username}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function advanceTime(interaction, userId) {
  const amount = interaction.options.getString('amount');
  
  const currentScene = await Scene.findOne({
    where: { creator_id: userId, status: 'active' },
    order: [['created_at', 'DESC']]
  });

  if (!currentScene) {
    return await interaction.reply({ content: 'No active scene to advance time in!', ephemeral: true });
  }

  // Update scene metadata to track time
  if (!currentScene.metadata) {
    currentScene.metadata = {};
  }
  currentScene.metadata.time_advanced = amount;
  currentScene.metadata.last_updated = new Date();
  
  await currentScene.save();

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle('⏰ Time Advanced')
    .setDescription(`Time has advanced by **${amount}** in the scene: **${currentScene.name}**`)
    .addFields(
      { name: 'Scene', value: currentScene.name },
      { name: 'Time Advance', value: amount },
      { name: 'Last Updated', value: new Date().toLocaleString() }
    )
    .setFooter({ text: `GM: ${interaction.user.username}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}