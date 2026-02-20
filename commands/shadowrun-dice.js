const { SlashCommandBuilder } = require('/builders');
const { ShadowrunDice } = require('../utils/ShadowrunDice');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shadowrun-dice')
    .setDescription('Roll Shadowrun dice with various systems')
    .addSubcommand(subcommand =>
      subcommand
        .setName('basic')
        .setDescription('Basic Shadowrun dice pool roll')
        .addIntegerOption(option =>
          option.setName('dice')
            .setDescription('Number of dice to roll')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(20))
        .addIntegerOption(option =>
          option.setName('target')
            .setDescription('Target number for success')
            .setRequired(false)
            .setMinValue(2)
            .setMaxValue(6)
            .setDefaultValue(5)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('combat')
        .setDescription('Combat pool roll with offense/defense allocation')
        .addIntegerOption(option =>
          option.setName('total-pool')
            .setDescription('Total combat pool dice')
            .setRequired(true)
            .setMinValue(2)
            .setMaxValue(20))
        .addIntegerOption(option =>
          option.setName('offense')
            .setDescription('Dice for offense rolls')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(10))
        .addIntegerOption(option =>
          option.setName('defense')
            .setDescription('Dice for defense rolls')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(10)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('spellcasting')
        .setDescription('Spellcasting roll (Willpower + Spell Rating)')
        .addIntegerOption(option =>
          option.setName('spell-rating')
            .setDescription('Spell rating')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(12))
        .addIntegerOption(option =>
          option.setName('willpower')
            .setDescription('Willpower attribute')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(9))
        .addIntegerOption(option =>
          option.setName('modifiers')
            .setDescription('Modifiers (positive or negative)')
            .setRequired(false)
            .setMinValue(-10)
            .setMaxValue(10)
            .setDefaultValue(0)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('conjuring')
        .setDescription('Conjuring roll (Charisma + Conjuring Rating)')
        .addIntegerOption(option =>
          option.setName('conjuring-rating')
            .setDescription('Conjuring rating')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(12))
        .addIntegerOption(option =>
          option.setName('charisma')
            .setDescription('Charisma attribute')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(9))
        .addIntegerOption(option =>
          option.setName('modifiers')
            .setDescription('Modifiers (positive or negative)')
            .setRequired(false)
            .setMinValue(-10)
            .setMaxValue(10)
            .setDefaultValue(0)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('decking')
        .setDescription('Decking roll (Intelligence + Deck Rating)')
        .addIntegerOption(option =>
          option.setName('deck-rating')
            .setDescription('Deck rating')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(12))
        .addIntegerOption(option =>
          option.setName('intelligence')
            .setDescription('Intelligence attribute')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(9))
        .addIntegerOption(option =>
          option.setName('modifiers')
            .setDescription('Modifiers (positive or negative)')
            .setRequired(false)
            .setMinValue(-10)
            .setMaxValue(10)
            .setDefaultValue(0)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('initiative')
        .setDescription('Calculate Shadowrun initiative')
        .addIntegerOption(option =>
          option.setName('quickness')
            .setDescription('Quickness attribute')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(9))
        .addIntegerOption(option =>
          option.setName('reaction')
            .setDescription('Reaction attribute')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(9))
        .addIntegerOption(option =>
          option.setName('modifiers')
            .setDescription('Modifiers (positive or negative)')
            .setRequired(false)
            .setMinValue(-10)
            .setMaxValue(10)
            .setDefaultValue(0))),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const dice = new ShadowrunDice();

    try {
      switch (subcommand) {
        case 'basic':
          await rollBasicDice(interaction, dice);
          break;
        case 'combat':
          await rollCombatDice(interaction, dice);
          break;
        case 'spellcasting':
          await rollSpellcasting(interaction, dice);
          break;
        case 'conjuring':
          await rollConjuring(interaction, dice);
          break;
        case 'decking':
          await rollDecking(interaction, dice);
          break;
        case 'initiative':
          await calculateInitiative(interaction, dice);
          break;
      }
    } catch (error) {
      console.error('Error in Shadowrun dice command:', error);
      await interaction.reply({ content: 'An error occurred while processing your dice roll.', ephemeral: true });
    }
  }
};

async function rollBasicDice(interaction, dice) {
  const diceCount = interaction.options.getInteger('dice');
  const targetNumber = interaction.options.getInteger('target') || 5;

  const result = dice.rollDicePool(diceCount, targetNumber);
  const embed = dice.createRollEmbed(result, 'basic', 'Shadowrun Dice Pool Roll');

  await interaction.reply({ embeds: [embed] });
}

async function rollCombatDice(interaction, dice) {
  const totalPool = interaction.options.getInteger('total-pool');
  const offenseDice = interaction.options.getInteger('offense');
  const defenseDice = interaction.options.getInteger('defense');

  const result = dice.rollCombatPool(totalPool, offenseDice, defenseDice);
  const embed = dice.createCombatPoolEmbed(result);

  await interaction.reply({ embeds: [embed] });
}

async function rollSpellcasting(interaction, dice) {
  const spellRating = interaction.options.getInteger('spell-rating');
  const willpower = interaction.options.getInteger('willpower');
  const modifiers = interaction.options.getInteger('modifiers');

  const result = dice.rollSpellcasting(spellRating, willpower, modifiers);
  const embed = dice.createRollEmbed(result, 'spellcasting', 'Spellcasting Roll');

  await interaction.reply({ embeds: [embed] });
}

async function rollConjuring(interaction, dice) {
  const conjuringRating = interaction.options.getInteger('conjuring-rating');
  const charisma = interaction.options.getInteger('charisma');
  const modifiers = interaction.options.getInteger('modifiers');

  const result = dice.rollConjuring(conjuringRating, charisma, modifiers);
  const embed = dice.createRollEmbed(result, 'conjuring', 'Conjuring Roll');

  await interaction.reply({ embeds: [embed] });
}

async function rollDecking(interaction, dice) {
  const deckRating = interaction.options.getInteger('deck-rating');
  const intelligence = interaction.options.getInteger('intelligence');
  const modifiers = interaction.options.getInteger('modifiers');

  const result = dice.rollDecking(deckRating, intelligence, modifiers);
  const embed = dice.createRollEmbed(result, 'decking', 'Decking Roll');

  await interaction.reply({ embeds: [embed] });
}

async function calculateInitiative(interaction, dice) {
  const quickness = interaction.options.getInteger('quickness');
  const reaction = interaction.options.getInteger('reaction');
  const modifiers = interaction.options.getInteger('modifiers');

  const initiative = dice.calculateInitiative(quickness, reaction, modifiers);
  const passes = dice.calculateInitiativePasses(initiative);

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle('Shadowrun Initiative Calculation')
    .addFields(
      { name: 'Quickness', value: quickness.toString(), inline: true },
      { name: 'Reaction', value: reaction.toString(), inline: true },
      { name: 'Modifiers', value: modifiers.toString(), inline: true },
      { name: 'Total Initiative', value: initiative.toString(), inline: true },
      { name: 'Initiative Passes', value: passes.toString(), inline: true }
    )
    .setDescription(`Character will act in ${passes} initiative pass${passes !== 1 ? 'es' : ''} each combat round.`)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}