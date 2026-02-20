const Discord = require('discord.js');
const EnhancedEmbeds = require('./enhanced-embeds');

const EmbedCtor = Discord.EmbedBuilder || Discord.MessageEmbed;

/**
 * Enhanced error handling for consistent user experience
 */
class EnhancedErrorHandling {
  constructor() {
    this.embeds = new EnhancedEmbeds();
  }

  buildActionableHint(commandName) {
    return `Try \`/help command:${commandName}\` for usage guidance, then retry with required options.`;
  }

  /**
   * Handle command execution errors with user-friendly messages
   */
  async handleCommandError(interaction, error, commandName) {
    console.error(`Error in ${commandName}:`, error);

    let errorEmbed;

    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      errorEmbed = this.embeds.createErrorEmbed(
        'Could not save your request',
        'Your input did not pass validation checks.',
        [
          { name: 'What happened', value: error.message || 'Validation failed.' },
          { name: 'How to fix it', value: this.buildActionableHint(commandName) }
        ]
      );
    } else if (error.name === 'SequelizeConnectionError' || error.code === 'ECONNREFUSED') {
      errorEmbed = this.embeds.createErrorEmbed(
        'Service temporarily unavailable',
        'The bot could not reach a required backend service.',
        [
          { name: 'Error code', value: error.code || 'DB_CONN_ERROR' },
          { name: 'What you can do', value: 'Wait a moment and retry. If it keeps failing, alert the bot admin.' }
        ]
      );
    } else if (error.name === 'TypeError' || error.name === 'RangeError') {
      errorEmbed = this.embeds.createErrorEmbed(
        'Invalid command input',
        'One or more provided values were not valid for this command.',
        [
          { name: 'Details', value: error.message || 'Input type/shape error.' },
          { name: 'How to fix it', value: this.buildActionableHint(commandName) }
        ]
      );
    } else {
      errorEmbed = this.embeds.createErrorEmbed(
        'Command failed',
        'An unexpected error occurred while handling your command.',
        [
          { name: 'Command', value: `/${commandName}` },
          { name: 'Error type', value: error.name || 'UnknownError' },
          { name: 'How to recover', value: this.buildActionableHint(commandName) }
        ]
      );
    }

    await this.replySafely(interaction, { embeds: [errorEmbed], ephemeral: true });
  }

  async replySafely(interaction, payload) {
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload);
      } else {
        await interaction.reply(payload);
      }
    } catch (replyError) {
      console.error('Failed to send error response:', replyError);
      const fallback = {
        content: '❌ Command failed. Use `/help` (or `/help command:<name>`) and try again.',
        ephemeral: true
      };

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(fallback);
        } else {
          await interaction.reply(fallback);
        }
      } catch (finalError) {
        console.error('Failed to send fallback error message:', finalError);
      }
    }
  }

  validateCommandOptions(interaction, requiredOptions) {
    const missingOptions = [];

    for (const option of requiredOptions) {
      const value = interaction.options.getString(option) || interaction.options.getInteger(option);
      if (value === null || value === undefined) {
        missingOptions.push(option);
      }
    }

    if (missingOptions.length > 0) {
      const errorEmbed = this.embeds.createErrorEmbed(
        'Missing required options',
        `Missing: ${missingOptions.join(', ')}`,
        [{ name: 'How to fix it', value: 'Add all required options, or run `/help` for examples.' }]
      );

      return { valid: false, error: errorEmbed };
    }

    return { valid: true };
  }

  async validateCharacterOwnership(interaction, character, userId) {
    if (!character) {
      return { valid: false, error: 'Character not found' };
    }

    if (character.user_id !== userId) {
      const errorEmbed = this.embeds.createErrorEmbed(
        'Access denied',
        'You can only manage characters you own.',
        [{ name: 'How to fix it', value: 'Select one of your own characters, or ask the owner to run this command.' }]
      );

      await this.replySafely(interaction, { embeds: [errorEmbed], ephemeral: true });
      return { valid: false, error: errorEmbed };
    }

    return { valid: true };
  }

  createErrorHelpEmbed(errorType) {
    const helpEmbed = new EmbedCtor()
      .setColor(0x4169e1)
      .setTitle('🆘 Help & Recovery')
      .setDescription(`Need help with ${errorType.toLowerCase()}? Here are quick pointers:`)
      .setTimestamp();

    helpEmbed.addFields(
      { name: 'General help', value: 'Use `/help` for all commands and `/help command:<name>` for one command.' },
      { name: 'Troubleshooting', value: 'Check required options first, then retry. If it still fails, share the full error with an admin.' }
    );

    return helpEmbed;
  }
}

module.exports = EnhancedErrorHandling;
