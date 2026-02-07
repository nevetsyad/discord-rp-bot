const { SlashCommandBuilder } = require('discord.js');
const { DiceRoll } = require('../database');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll dice for roleplaying')
    .addStringOption(option =>
      option.setName('dice')
        .setDescription('Dice notation (e.g., 2d6, 1d20+5)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the roll')
        .setRequired(false)),

  async execute(interaction, commands) {
    const diceNotation = interaction.options.getString('dice');
    const reason = interaction.options.getString('reason') || '';
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    try {
      const result = await rollDice(diceNotation, userId, guildId, reason);
      await interaction.reply({ embeds: [result.embed] });
    } catch (error) {
      console.error('Error in dice command:', error);
      await interaction.reply({ content: 'Invalid dice notation! Please use format like "2d6", "1d20+5", "3d10-2"', ephemeral: true });
    }
  }
};

function rollDice(diceNotation, userId, guildId, reason) {
  // Parse dice notation (e.g., "2d6", "1d20+5", "3d10-2")
  const diceRegex = /^(\d+)d(\d+)([+-]\d+)?$/;
  const match = diceNotation.match(diceRegex);
  
  if (!match) {
    throw new Error('Invalid dice notation');
  }

  const numDice = parseInt(match[1]);
  const diceSides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;

  // Validate dice parameters
  if (numDice < 1 || numDice > 10) {
    throw new Error('Number of dice must be between 1 and 10');
  }
  if (diceSides < 2 || diceSides > 100) {
    throw new Error('Dice sides must be between 2 and 100');
  }

  // Roll the dice
  const rolls = [];
  let total = 0;

  for (let i = 0; i < numDice; i++) {
    const roll = Math.floor(Math.random() * diceSides) + 1;
    rolls.push(roll);
    total += roll;
  }

  // Apply modifier
  total += modifier;

  // Create result string
  let resultString = rolls.join(', ');
  if (modifier !== 0) {
    resultString += modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
  }
  resultString += ` = **${total}**`;

  // Create embed
  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle('🎲 Dice Roll')
    .setDescription(`**${diceNotation}**${reason ? `\n*Reason: ${reason}*` : ''}`)
    .addFields(
      { name: 'Rolls', value: rolls.join(', ') },
      { name: 'Modifier', value: modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier.toString()) : 'None' },
      { name: 'Total', value: `**${total}**` }
    )
    .setTimestamp();

  // Save to database
  DiceRoll.create({
    user_id: userId,
    guild_id: guildId,
    dice_notation: diceNotation,
    rolls: rolls.join(','),
    modifier: modifier,
    total: total,
    reason: reason
  });

  return { embed };
}