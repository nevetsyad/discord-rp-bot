const { Events } = require('discord.js');
const { User, ShadowrunCharacter } = require('../database');

// Import magic commands
const MagicCommands = require('../commands/magic');
const EnhancedErrorHandling = require('../commands/enhanced-error-handling');

// Create instances
const magicCommands = new MagicCommands();
const errorHandling = new EnhancedErrorHandling();

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, commands) {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      // Update user last activity
      await User.upsert({
        discord_id: interaction.user.id,
        username: interaction.user.username,
        discriminator: interaction.user.discriminator,
        avatar: interaction.user.avatar,
        is_bot: interaction.user.bot,
        last_active: new Date()
      });

      // Handle magic commands
      if (interaction.commandName === 'spellcast') {
        const spellName = interaction.options.getString('spell');
        const targetType = interaction.options.getString('target_type');
        const targetNumber = interaction.options.getInteger('target_number');
        await magicCommands.spellcast(interaction, spellName, targetType, targetNumber);
        return;
      }

      if (interaction.commandName === 'summon-spirit') {
        const spiritType = interaction.options.getString('spirit_type');
        const force = interaction.options.getInteger('force') || 4;
        await magicCommands.summonSpirit(interaction, spiritType, force);
        return;
      }

      if (interaction.commandName === 'astral-project') {
        const duration = interaction.options.getString('duration') || 'sustained';
        await magicCommands.astralProject(interaction, duration);
        return;
      }

      if (interaction.commandName === 'astral-perception') {
        const target = interaction.options.getUser('target');
        const modifier = interaction.options.getInteger('modifier') || 0;
        await magicCommands.astralPerception(interaction, target, modifier);
        return;
      }

      if (interaction.commandName === 'astral-combat') {
        const targetCharacter = interaction.options.getUser('target');
        const spellType = interaction.options.getString('spell_type') || 'combat';
        await magicCommands.astralCombat(interaction, targetCharacter, spellType);
        return;
      }

      if (interaction.commandName === 'list-spells') {
        const category = interaction.options.getString('category');
        await magicCommands.listSpells(interaction, category);
        return;
      }

      if (interaction.commandName === 'list-spirits') {
        const tradition = interaction.options.getString('tradition');
        await magicCommands.listSpirits(interaction, tradition);
        return;
      }

      // Execute regular commands
      await command.execute(interaction, commands);
    } catch (error) {
      // Use enhanced error handling
      await errorHandling.handleCommandError(interaction, error, interaction.commandName);
    }
  }
};