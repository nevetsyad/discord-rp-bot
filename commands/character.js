const { SlashCommandBuilder } = require('discord.js');
const { Character } = require('../database');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('character')
    .setDescription('Manage your roleplay characters')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new character')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Character name')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Character description')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('personality')
            .setDescription('Character personality')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('appearance')
            .setDescription('Character appearance')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('backstory')
            .setDescription('Character backstory')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('skills')
            .setDescription('Character skills and abilities')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all your characters'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('View character details')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Character name to view')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Delete a character')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Character name to delete')
            .setRequired(true))),

  async execute(interaction, commands) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    try {
      switch (subcommand) {
        case 'create':
          await createCharacter(interaction, userId);
          break;
        case 'list':
          await listCharacters(interaction, userId);
          break;
        case 'view':
          await viewCharacter(interaction, userId);
          break;
        case 'delete':
          await deleteCharacter(interaction, userId);
          break;
      }
    } catch (error) {
      console.error('Error in character command:', error);
      await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
  }
};

async function createCharacter(interaction, userId) {
  const name = interaction.options.getString('name');
  const description = interaction.options.getString('description');
  const personality = interaction.options.getString('personality');
  const appearance = interaction.options.getString('appearance');
  const backstory = interaction.options.getString('backstory');
  const skills = interaction.options.getString('skills');

  // Check if character already exists
  const existingCharacter = await Character.findOne({
    where: { name, user_id: userId }
  });

  if (existingCharacter) {
    return await interaction.reply({ content: 'A character with this name already exists!', ephemeral: true });
  }

  // Create character
  const character = await Character.create({
    name,
    description,
    personality,
    appearance,
    backstory,
    skills,
    user_id: userId,
    guild_id: interaction.guild.id
  });

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle('Character Created Successfully!')
    .setDescription(`**${character.name}** has been added to your character roster.`)
    .addFields(
      { name: 'Description', value: character.description },
      { name: 'Personality', value: character.personality },
      { name: 'Appearance', value: character.appearance },
      { name: 'Skills', value: character.skills }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function listCharacters(interaction, userId) {
  const characters = await Character.findAll({
    where: { user_id: userId }
  });

  if (characters.length === 0) {
    return await interaction.reply({ content: 'You don\'t have any characters yet!', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle('Your Characters')
    .setDescription(`You have ${characters.length} character(s):`);

  const fields = characters.map(char => ({
    name: char.name,
    value: char.description.substring(0, 50) + '...'
  }));

  embed.addFields(fields);
  embed.setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function viewCharacter(interaction, userId) {
  const characterName = interaction.options.getString('name');
  const character = await Character.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Character not found!', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(character.name)
    .setDescription(character.description)
    .addFields(
      { name: 'Personality', value: character.personality, inline: false },
      { name: 'Appearance', value: character.appearance, inline: false },
      { name: 'Backstory', value: character.backstory, inline: false },
      { name: 'Skills', value: character.skills, inline: false }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function deleteCharacter(interaction, userId) {
  const characterName = interaction.options.getString('name');
  const character = await Character.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Character not found!', ephemeral: true });
  }

  await character.destroy();

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle('Character Deleted')
    .setDescription(`**${character.name}** has been deleted from your character roster.`)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}