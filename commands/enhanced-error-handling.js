const { EmbedBuilder } = require('discord.js');
const EnhancedEmbeds = require('./enhanced-embeds');

/**
 * Enhanced error handling for consistent user experience
 */
class EnhancedErrorHandling {
  constructor() {
    this.embeds = new EnhancedEmbeds();
  }

  /**
   * Handle command execution errors with user-friendly messages
   */
  async handleCommandError(interaction, error, commandName) {
    console.error(`Error in ${commandName}:`, error);
    
    let errorEmbed;
    
    // Check for specific error types
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      errorEmbed = this.embeds.createErrorEmbed(
        'Database Validation Error',
        'There was an issue with your character data. Please check your input and try again.',
        [
          { name: 'Error Details', value: error.message || 'Unknown validation error' },
          { name: 'Suggestion', value: 'Make sure all required fields are filled correctly and names are unique.' }
        ]
      );
    } else if (error.name === 'SequelizeConnectionError') {
      errorEmbed = this.embeds.createErrorEmbed(
        'Database Connection Error',
        'Unable to connect to the database. The bot administrators have been notified.',
        [
          { name: 'Error Code', value: error.code || 'CONN_ERROR' },
          { name: 'Suggestion', value: 'Please try again later. This is a temporary issue.' }
        ]
      );
    } else if (error.name === 'TypeError') {
      errorEmbed = this.embeds.createErrorEmbed(
        'Invalid Input',
        'There seems to be an issue with the input provided.',
        [
          { name: 'Error Details', value: error.message || 'Invalid parameter type' },
          { name: 'Suggestion', value: 'Please check your command syntax and try again.' }
        ]
      );
    } else if (error.code === 'ECONNREFUSED') {
      errorEmbed = this.embeds.createErrorEmbed(
        'Service Unavailable',
        'The bot service is currently unavailable. Please try again shortly.',
        [
          { name: 'Error Code', value: error.code },
          { name: 'Suggestion', value: 'This is likely a temporary connectivity issue.' }
        ]
      );
    } else {
      // Generic error handling
      errorEmbed = this.embeds.createErrorEmbed(
        'Command Error',
        'An unexpected error occurred while processing your command.',
        [
          { name: 'Command', value: commandName },
          { name: 'Error Type', value: error.name || 'Unknown Error' },
          { name: 'Suggestion', value: 'Please try again. If the problem persists, contact the bot administrator.' }
        ]
      );
    }

    // Try to reply to the user
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    } catch (replyError) {
      console.error('Failed to send error response:', replyError);
      // Last resort - send a simple message
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: '❌ An error occurred. Please try again.', ephemeral: true });
        } else {
          await interaction.reply({ content: '❌ An error occurred. Please try again.', ephemeral: true });
        }
      } catch (finalError) {
        console.error('Failed to send fallback error message:', finalError);
      }
    }
  }

  /**
   * Handle missing character errors
   */
  async handleMissingCharacter(interaction, characterName) {
    const errorEmbed = this.embeds.createErrorEmbed(
      'Character Not Found',
      `The character "${characterName}" was not found in your account.`,
      [
        { name: 'Possible Solutions', value: '• Check the spelling of the character name\n• Make sure you have created the character first\n• Ensure you are using the correct guild' },
        { name: 'Create a Character', value: 'Use `/character create-shadowrun` to create a new character.' }
      ]
    );

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }

  /**
   * Handle insufficient resources errors (nuyen, karma, etc.)
   */
  async handleInsufficientResources(interaction, resourceType, currentAmount, requiredAmount) {
    const resourceName = resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
    const errorEmbed = this.embeds.createErrorEmbed(
      `Insufficient ${resourceName}`,
      `You don't have enough ${resourceType.toLowerCase()} to complete this action.`,
      [
        { name: 'Current Amount', value: this.formatResourceAmount(resourceType, currentAmount) },
        { name: 'Required Amount', value: this.formatResourceAmount(resourceType, requiredAmount) },
        { name: 'How to Get More', value: this.getResourceSuggestion(resourceType) }
      ]
    );

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }

  /**
   * Handle invalid input errors
   */
  async handleInvalidInput(interaction, fieldName, expectedValue, actualValue) {
    const errorEmbed = this.embeds.createErrorEmbed(
      'Invalid Input',
      `The "${fieldName}" field contains an invalid value.`,
      [
        { name: 'Expected', value: expectedValue },
        { name: 'Received', value: actualValue },
        { name: 'Suggestion', value: `Please correct the ${fieldName.toLowerCase()} and try again.` }
      ]
    );

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }

  /**
   * Handle cooldown errors
   */
  async handleCooldownError(interaction, commandName, remainingTime) {
    const errorEmbed = this.embeds.createErrorEmbed(
      'Command on Cooldown',
      `You can use ${commandName} again in ${remainingTime}.`,
      [
        { name: 'Command', value: commandName },
        { name: 'Remaining Time', value: remainingTime },
        { name: 'Suggestion', value: 'Please wait for the cooldown to expire before trying again.' }
      ]
    );

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }

  /**
   * Handle permission errors
   */
  async handlePermissionError(interaction, requiredPermission) {
    const errorEmbed = this.embeds.createErrorEmbed(
      'Insufficient Permissions',
      'You do not have the required permissions to use this command.',
      [
        { name: 'Required Permission', value: requiredPermission },
        { name: 'Current Permissions', value: 'Insufficient' },
        { name: 'Suggestion', value: 'Contact a server administrator if you believe this is an error.' }
      ]
    );

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }

  /**
   * Handle combat-related errors
   */
  async handleCombatError(interaction, errorType, details) {
    const errorEmbed = this.embeds.createErrorEmbed(
      'Combat System Error',
      `An error occurred in the combat system: ${errorType}`,
      [
        { name: 'Error Type', value: errorType },
        { name: 'Details', value: details },
        { name: 'Suggestion', value: 'Please try again. If the problem persists, report it to the bot administrator.' }
      ]
    );

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
  }

  /**
   * Format resource amounts with appropriate styling
   */
  formatResourceAmount(resourceType, amount) {
    switch (resourceType.toLowerCase()) {
      case 'nuyen':
        return `💰${amount.toLocaleString()}`;
      case 'karma':
        return `⭐${amount}`;
      case 'essence':
        return `🌊${amount}`;
      case 'magic':
        return `✨${amount}`;
      case 'skill points':
        return `🎯${amount}`;
      default:
        return amount.toString();
    }
  }

  /**
   * Get suggestions for obtaining more resources
   */
  getResourceSuggestion(resourceType) {
    switch (resourceType.toLowerCase()) {
      case 'nuyen':
        return '• Complete runs/missions\n• Sell equipment\n• Take on jobs';
      case 'karma':
        return '• Complete missions\n• Roleplay effectively\n• Overcome challenges';
      case 'essence':
        return ' ';// Essence cannot be regained naturally in Shadowrun
      case 'magic':
        return '• Rest and recover\n• Use magical resources\n• Avoid magical drain';
      case 'skill points':
        return '• Level up your character\n• Complete training programs\n• Learn from experience';
      default:
        return '• Complete activities\n• Earn rewards';
    }
  }

  /**
   * Validate command options before execution
   */
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
        'Missing Required Options',
        `The following required options are missing: ${missingOptions.join(', ')}`,
        [
          { name: 'Missing Options', value: missingOptions.map(opt => `• ${opt}`).join('\n') },
          { name: 'Suggestion', value: 'Please provide all required options and try again.' }
        ]
      );
      
      return { valid: false, error: errorEmbed };
    }

    return { valid: true };
  }

  /**
   * Validate character ownership
   */
  async validateCharacterOwnership(interaction, character, userId) {
    if (!character) {
      return { valid: false, error: 'Character not found' };
    }

    if (character.user_id !== userId) {
      const errorEmbed = this.embeds.createErrorEmbed(
        'Access Denied',
        'You do not own this character.',
        [
          { name: 'Character', value: character.name },
          { name: 'Owner', value: character.user_id },
          { name: 'Suggestion', value: 'You can only manage characters that you own.' }
        ]
      );
      
      return { valid: false, error: errorEmbed };
    }

    return { valid: true };
  }

  /**
   * Create a help embed for error recovery
   */
  createErrorHelpEmbed(errorType) {
    const helpEmbed = new EmbedBuilder()
      .setColor(0x4169e1)
      .setTitle('🆘 Help & Recovery')
      .setDescription(`Need help with ${errorType.toLowerCase()}? Here are some resources:`)
      .setTimestamp();

    switch (errorType.toLowerCase()) {
      case 'character creation':
        helpEmbed.addFields(
          { name: '📖 Character Creation Guide', value: 'Use `/character create-shadowrun` to create a new character with step-by-step guidance.' },
          { name: '🎭 Race Selection', value: 'Choose from Human, Elf, Dwarf, Ork, or Troll - each has different racial maximums.' },
          { name: '⚙️ Archetype Packages', value: 'Select from predefined archetypes or create a fully custom character.' }
        );
        break;
      case 'combat':
        helpEmbed.addFields(
          { name: '⚔️ Combat Basics', value: 'Use `/combat start` to begin a combat encounter.' },
          { name: '🎯 Initiative', value: 'Roll initiative with `/combat initiative` to determine turn order.' },
          { name: '🗡️ Combat Actions', value: 'Use `/combat attack` to make attacks during your turn.' }
        );
        break;
      case 'magic':
        helpEmbed.addFields(
          { name: '✨ Magic System', value: 'Use `/spellcast` to cast spells and `/summon-spirit` for spirit summoning.' },
          { name: '🔮 Spell Categories', value: 'Choose from combat, detection, illusion, health, and manipulation spells.' },
          { name: '🌌 Astral Projection', value: 'Use `/astral-project` to enter the astral plane.' }
        );
        break;
      default:
        helpEmbed.addFields(
          { name: '📚 General Help', value: 'Use `/help` for command information and `/help <command>` for specific help.' },
          { name: '🎮 Getting Started', value: 'Start with `/character create-shadowrun` to create your first character.' },
          { name: '🤖 Support', value: 'Contact the bot administrator for additional assistance.' }
        );
    }

    return helpEmbed;
  }
}

module.exports = EnhancedErrorHandling;