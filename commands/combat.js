const { SlashCommandBuilder } = require('discord.js');
const ShadowrunCombat = require('../utils/ShadowrunCombat');

const combat = new ShadowrunCombat();

const combatCommands = {
  /**
   * Start a new combat encounter
   */
  start: {
    data: new SlashCommandBuilder()
      .setName('combat-start')
      .setDescription('Start a new combat encounter')
      .addStringOption(option =>
        option.setName('name')
          .setDescription('Name of the combat encounter')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('difficulty')
          .setDescription('Combat difficulty (1-10)')
          .setRequired(false)
          .setMinValue(1)
          .setMaxValue(10))
      .addStringOption(option =>
        option.setName('environment')
          .setDescription('Combat environment (indoor, outdoor, vehicle, etc.)')
          .setRequired(false)
          .setChoices(
            { name: 'Indoor', value: 'indoor' },
            { name: 'Outdoor', value: 'outdoor' },
            { name: 'Vehicle', value: 'vehicle' },
            { name: 'Matrix', value: 'matrix' },
            { name: 'Astral', value: 'astral' }
          )),
    execute: async (interaction) => {
      try {
        const name = interaction.options.getString('name');
        const difficulty = interaction.options.getInteger('difficulty') || 3;
        const environment = interaction.options.getString('environment') || 'indoor';

        const result = combat.startCombat(name, difficulty, environment);
        
        if (result.success) {
          await interaction.reply({
            content: result.message,
            ephemeral: false
          });
        } else {
          await interaction.reply({
            content: result.message,
            ephemeral: true
          });
        }
      } catch (error) {
        console.error('Error starting combat:', error);
        await interaction.reply({
          content: 'Failed to start combat. Please try again.',
          ephemeral: true
        });
      }
    }
  },

  /**
   * Join a combat encounter
   */
  join: {
    data: new SlashCommandBuilder()
      .setName('combat-join')
      .setDescription('Join an active combat encounter')
      .addStringOption(option =>
        option.setName('combat_id')
          .setDescription('Combat ID (from /combat-list)')
          .setRequired(true)),
    execute: async (interaction) => {
      try {
        const combatId = interaction.options.getString('combat_id');
        const character = interaction.user.character; // Assuming character is stored

        if (!character) {
          await interaction.reply({
            content: 'You need a character to join combat. Create one with /character create-shadowrun.',
            ephemeral: true
          });
          return;
        }

        const result = combat.addParticipant(combatId, character);
        
        if (result.success) {
          await interaction.reply({
            content: result.message,
            ephemeral: false
          });
        } else {
          await interaction.reply({
            content: result.message,
            ephemeral: true
          });
        }
      } catch (error) {
        console.error('Error joining combat:', error);
        await interaction.reply({
          content: 'Failed to join combat. Please try again.',
          ephemeral: true
        });
      }
    }
  },

  /**
   * Start a new combat round
   */
  round: {
    data: new SlashCommandBuilder()
      .setName('combat-round')
      .setDescription('Start a new combat round')
      .addStringOption(option =>
        option.setName('combat_id')
          .setDescription('Combat ID (from /combat-list)')
          .setRequired(true)),
    execute: async (interaction) => {
      try {
        const combatId = interaction.options.getString('combat_id');
        const result = combat.startRound(combatId);
        
        if (result.success) {
          await interaction.reply({
            content: result.message,
            ephemeral: false
          });
        } else {
          await interaction.reply({
            content: result.message,
            ephemeral: true
          });
        }
      } catch (error) {
        console.error('Error starting combat round:', error);
        await interaction.reply({
          content: 'Failed to start combat round. Please try again.',
          ephemeral: true
        });
      }
    }
  },

  /**
   * Perform an attack in combat
   */
  attack: {
    data: new SlashCommandBuilder()
      .setName('combat-attack')
      .setDescription('Perform an attack in combat')
      .addStringOption(option =>
        option.setName('combat_id')
          .setDescription('Combat ID (from /combat-list)')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('target')
          .setDescription('Target character name')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('weapon')
          .setDescription('Weapon used for attack')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('attack_pool')
          .setDescription('Dice pool for attack')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('defense_pool')
          .setDescription('Target defense pool')
          .setRequired(true)),
    execute: async (interaction) => {
      try {
        const combatId = interaction.options.getString('combat_id');
        const target = interaction.options.getString('target');
        const weapon = interaction.options.getString('weapon');
        const attackPool = interaction.options.getInteger('attack_pool');
        const defensePool = interaction.options.getInteger('defense_pool');

        const character = interaction.user.character;
        if (!character) {
          await interaction.reply({
            content: 'You need a character to attack. Create one with /character create-shadowrun.',
            ephemeral: true
          });
          return;
        }

        // Find target character (this would need to be implemented in the character system)
        const targetCharacter = null; // Placeholder - need to implement character lookup
        if (!targetCharacter) {
          await interaction.reply({
            content: `Target character "${target}" not found.`,
            ephemeral: true
          });
          return;
        }

        const result = combat.performAttack(combatId, character.id, targetCharacter.id, weapon, attackPool, defensePool);
        
        if (result.success) {
          await interaction.reply({
            content: result.message,
            ephemeral: false
          });
        } else {
          await interaction.reply({
            content: result.message,
            ephemeral: true
          });
        }
      } catch (error) {
        console.error('Error performing attack:', error);
        await interaction.reply({
          content: 'Failed to perform attack. Please try again.',
          ephemeral: true
        });
      }
    }
  },

  /**
   * Get combat status
   */
  status: {
    data: new SlashCommandBuilder()
      .setName('combat-status')
      .setDescription('Get status of an active combat')
      .addStringOption(option =>
        option.setName('combat_id')
          .setDescription('Combat ID (from /combat-list)')
          .setRequired(true)),
    execute: async (interaction) => {
      try {
        const combatId = interaction.options.getString('combat_id');
        const result = combat.getCombatStatus(combatId);
        
        if (result.success) {
          const combatData = result.combat;
          const statusEmbed = {
            color: 0x0099ff,
            title: `Combat: ${combatData.name}`,
            fields: [
              {
                name: 'Round',
                value: combatData.round.toString(),
                inline: true
              },
              {
                name: 'Difficulty',
                value: combatData.difficulty.toString(),
                inline: true
              },
              {
                name: 'Environment',
                value: combatData.environment,
                inline: true
              },
              {
                name: 'Participants',
                value: `${combatData.participantCount} total`,
                inline: true
              },
              {
                name: 'Status',
                value: combatData.isActive ? 'Active' : 'Ended',
                inline: true
              }
            ],
            description: `**Combat Status:**\n` +
              `🟢 Alive: ${combatData.status.alive}\n` +
              `🟡 Unconscious: ${combatData.status.unconscious}\n` +
              `🔴 Stunned: ${combatData.status.stunned}\n` +
              `💀 Dead: ${combatData.status.dead}`,
            timestamp: new Date()
          };

          await interaction.reply({
            embeds: [statusEmbed],
            ephemeral: false
          });
        } else {
          await interaction.reply({
            content: result.message,
            ephemeral: true
          });
        }
      } catch (error) {
        console.error('Error getting combat status:', error);
        await interaction.reply({
          content: 'Failed to get combat status. Please try again.',
          ephemeral: true
        });
      }
    }
  },

  /**
   * List active combats
   */
  list: {
    data: new SlashCommandBuilder()
      .setName('combat-list')
      .setDescription('List all active combat encounters'),
    execute: async (interaction) => {
      try {
        const activeCombats = combat.getActiveCombats();
        
        if (activeCombats.length === 0) {
          await interaction.reply({
            content: 'No active combats found.',
            ephemeral: false
          });
          return;
        }

        const embed = {
          color: 0x0099ff,
          title: 'Active Combat Encounters',
          description: 'List of currently active combats:',
          fields: activeCombats.map(combat => ({
            name: `🗡️ ${combat.name}`,
            value: `ID: ${combat.id}\nRound: ${combat.round}\nParticipants: ${combat.participants}`,
            inline: false
          }))
        };

        await interaction.reply({
          embeds: [embed],
          ephemeral: false
        });
      } catch (error) {
        console.error('Error listing combats:', error);
        await interaction.reply({
          content: 'Failed to list combats. Please try again.',
          ephemeral: true
        });
      }
    }
  },

  /**
   * End a combat encounter
   */
  end: {
    data: new SlashCommandBuilder()
      .setName('combat-end')
      .setDescription('End an active combat encounter')
      .addStringOption(option =>
        option.setName('combat_id')
          .setDescription('Combat ID (from /combat-list)')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('reason')
          .setDescription('Reason for ending combat')
          .setRequired(false)),
    execute: async (interaction) => {
      try {
        const combatId = interaction.options.getString('combat_id');
        const reason = interaction.options.getString('reason') || 'Combat completed';
        
        const result = combat.endCombat(combatId, reason);
        
        if (result.success) {
          await interaction.reply({
            content: result.message,
            ephemeral: false
          });
        } else {
          await interaction.reply({
            content: result.message,
            ephemeral: true
          });
        }
      } catch (error) {
        console.error('Error ending combat:', error);
        await interaction.reply({
          content: 'Failed to end combat. Please try again.',
          ephemeral: true
        });
      }
    }
  }
};

module.exports = { combatCommands };