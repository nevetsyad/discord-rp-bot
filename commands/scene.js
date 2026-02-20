const { SlashCommandBuilder } = require('/builders');
const { Scene, Character, CharacterScene } = require('../database');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scene')
    .setDescription('Manage roleplay scenes')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new scene')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Scene name')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Scene description')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('location')
            .setDescription('Scene location')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('tone')
            .setDescription('Scene tone (e.g., serious, comedic, mysterious)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('characters')
            .setDescription('Character names to include in scene (comma-separated)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all scenes'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('View scene details')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Scene name to view')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('join')
        .setDescription('Join a scene with one of your characters')
        .addStringOption(option =>
          option.setName('scene')
            .setDescription('Scene name to join')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('character')
            .setDescription('Your character name to use in scene')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('leave')
        .setDescription('Leave a scene')
        .addStringOption(option =>
          option.setName('scene')
            .setDescription('Scene name to leave')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('characters')
        .setDescription('List characters in a scene')
        .addStringOption(option =>
          option.setName('scene')
            .setDescription('Scene name')
            .setRequired(true))),

  async execute(interaction, commands) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    try {
      switch (subcommand) {
        case 'create':
          await createScene(interaction, userId);
          break;
        case 'list':
          await listScenes(interaction);
          break;
        case 'view':
          await viewScene(interaction);
          break;
        case 'join':
          await joinScene(interaction, userId);
          break;
        case 'leave':
          await leaveScene(interaction, userId);
          break;
        case 'characters':
          await listSceneCharacters(interaction);
          break;
      }
    } catch (error) {
      console.error('Error in scene command:', error);
      await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
  }
};

async function createScene(interaction, userId) {
  const name = interaction.options.getString('name');
  const description = interaction.options.getString('description');
  const location = interaction.options.getString('location');
  const tone = interaction.options.getString('tone');
  const characterNames = interaction.options.getString('characters') || '';

  // Check if scene already exists
  const existingScene = await Scene.findOne({
    where: { name, guild_id: interaction.guild.id }
  });

  if (existingScene) {
    return await interaction.reply({ content: 'A scene with this name already exists!', ephemeral: true });
  }

  // Create scene
  const scene = await Scene.create({
    name,
    description,
    location,
    tone,
    guild_id: interaction.guild.id,
    creator_id: userId
  });

  // Add characters if specified
  if (characterNames) {
    const characterList = characterNames.split(',').map(name => name.trim());
    const userCharacters = await Character.findAll({
      where: { user_id: userId, name: characterList }
    });

    for (const character of userCharacters) {
      await CharacterScene.create({
        scene_id: scene.id,
        character_id: character.id
      });
    }
  }

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle('Scene Created Successfully!')
    .setDescription(`**${scene.name}** has been created.`)
    .addFields(
      { name: 'Description', value: scene.description },
      { name: 'Location', value: scene.location },
      { name: 'Tone', value: scene.tone },
      { name: 'Characters', value: characterNames ? characterNames : 'None yet' }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function listScenes(interaction) {
  const scenes = await Scene.findAll({
    where: { guild_id: interaction.guild.id },
    include: [{
      model: Character,
      through: { attributes: [] }
    }]
  });

  if (scenes.length === 0) {
    return await interaction.reply({ content: 'No scenes available!', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle('Available Scenes')
    .setDescription(`There are ${scenes.length} scene(s):`);

  const fields = scenes.slice(0, 10).map(scene => ({
    name: scene.name,
    value: `${scene.description.substring(0, 50)}... | ${scene.location} | ${scene.tone}`
  }));

  embed.addFields(fields);
  embed.setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function viewScene(interaction) {
  const sceneName = interaction.options.getString('name');
  const scene = await Scene.findOne({
    where: { name: sceneName, guild_id: interaction.guild.id },
    include: [{
      model: Character,
      through: { attributes: [] },
      include: [{ model: require('../database').User, attributes: ['username'] }]
    }]
  });

  if (!scene) {
    return await interaction.reply({ content: 'Scene not found!', ephemeral: true });
  }

  const characterList = scene.Characters.length > 0 
    ? scene.Characters.map(char => `**${char.name}** (owned by ${char.User.username})`).join('\n')
    : 'No characters yet';

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(scene.name)
    .setDescription(scene.description)
    .addFields(
      { name: 'Location', value: scene.location, inline: false },
      { name: 'Tone', value: scene.tone, inline: false },
      { name: 'Characters', value: characterList, inline: false },
      { name: 'Created by', value: `<@${scene.creator_id}>`, inline: false }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function joinScene(interaction, userId) {
  const sceneName = interaction.options.getString('scene');
  const characterName = interaction.options.getString('character');
  const scene = await Scene.findOne({
    where: { name: sceneName, guild_id: interaction.guild.id }
  });
  const character = await Character.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!scene) {
    return await interaction.reply({ content: 'Scene not found!', ephemeral: true });
  }

  if (!character) {
    return await interaction.reply({ content: 'Character not found!', ephemeral: true });
  }

  // Check if character already in scene
  const existingCharacterScene = await CharacterScene.findOne({
    where: { scene_id: scene.id, character_id: character.id }
  });

  if (existingCharacterScene) {
    return await interaction.reply({ content: 'Your character is already in this scene!', ephemeral: true });
  }

  // Add character to scene
  await CharacterScene.create({
    scene_id: scene.id,
    character_id: character.id
  });

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle('Joined Scene')
    .setDescription(`**${character.name}** has joined the scene: **${scene.name}**`)
    .addFields(
      { name: 'Scene', value: scene.name },
      { name: 'Character', value: character.name }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function leaveScene(interaction, userId) {
  const sceneName = interaction.options.getString('scene');
  const scene = await Scene.findOne({
    where: { name: sceneName, guild_id: interaction.guild.id }
  });
  const userCharacters = await Character.findAll({
    where: { user_id: userId }
  });

  if (!scene) {
    return await interaction.reply({ content: 'Scene not found!', ephemeral: true });
  }

  // Find character-scene relationships for this user
  const characterScenes = await CharacterScene.findAll({
    where: { scene_id: scene.id },
    include: [{ model: Character, where: { user_id: userId } }]
  });

  if (characterScenes.length === 0) {
    return await interaction.reply({ content: 'You don\'t have any characters in this scene!', ephemeral: true });
  }

  // Remove all user characters from scene
  for (const charScene of characterScenes) {
    await charScene.destroy();
  }

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle('Left Scene')
    .setDescription(`You have left the scene: **${scene.name}**`)
    .addFields(
      { name: 'Scene', value: scene.name },
      { name: 'Characters Removed', value: characterScenes.length.toString() }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function listSceneCharacters(interaction) {
  const sceneName = interaction.options.getString('scene');
  const scene = await Scene.findOne({
    where: { name: sceneName, guild_id: interaction.guild.id },
    include: [{
      model: Character,
      through: { attributes: [] },
      include: [{ model: require('../database').User, attributes: ['username'] }]
    }]
  });

  if (!scene) {
    return await interaction.reply({ content: 'Scene not found!', ephemeral: true });
  }

  const characterList = scene.Characters.length > 0 
    ? scene.Characters.map(char => `**${char.name}** (owned by ${char.User.username})`).join('\n')
    : 'No characters in this scene';

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(`Characters in Scene: ${scene.name}`)
    .setDescription(characterList)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}