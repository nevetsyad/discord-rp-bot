const { Events } = require('discord.js');
const { User, ShadowrunCharacter } = require('../database');

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

      await command.execute(interaction, commands);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}:`, error);
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ 
          content: 'There was an error while executing this command!', 
          ephemeral: true 
        });
      } else {
        await interaction.reply({ 
          content: 'There was an error while executing this command!', 
          ephemeral: true 
        });
      }
    }
  }
};