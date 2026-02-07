const { Client, GatewayIntentBits } = require('discord.js');
const { sequelize } = require('./database');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences
  ]
});

async function setupBot() {
  try {
    console.log('Setting up Discord RP Bot...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Sync database tables
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');
    
    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN);
    console.log('✅ Bot logged in successfully');
    
    // Set bot status
    client.user.setActivity('RP Bot Setup Complete! 🎲', { type: 'PLAYING' });
    
    console.log('🎉 Setup complete! The bot is ready to use.');
    console.log('💡 Make sure to configure your .env file with your Discord bot token and other settings.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupBot();