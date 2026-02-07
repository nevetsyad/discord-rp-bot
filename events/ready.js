const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client, commands) {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Bot is in ${client.guilds.cache.size} guild(s)`);
    
    // Set bot status
    client.user.setActivity('Roleplaying with characters 🎲', { type: 'PLAYING' });
    
    // Register commands globally (or to specific guilds)
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (guild) {
      guild.commands.set(commands.map(command => command.data.toJSON()));
      console.log(`Commands registered for guild: ${guild.name}`);
    } else {
      client.application.commands.set(commands.map(command => command.data.toJSON()));
      console.log('Commands registered globally');
    }
    
    console.log('Bot is ready to receive commands!');
  }
};