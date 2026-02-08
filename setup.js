const { Client, GatewayIntentBits } = require('discord.js');
const { sequelize } = require('./database');
const dotenv = require('dotenv');
const fs = require('fs');

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
    console.log('🔧 Discord RP Bot - Configuration Test');
    console.log('=====================================');
    
    // Check if .env file exists
    if (!fs.existsSync('.env')) {
      console.log('❌ .env file not found!');
      console.log('💡 Please run "npm run setup:interactive" to create your configuration file.');
      console.log('💡 Or manually create a .env file based on .env.example');
      process.exit(1);
    }
    
    console.log('🔍 Testing configuration...');
    
    // Check for required environment variables
    if (!process.env.DISCORD_TOKEN) {
      console.error('❌ DISCORD_TOKEN not found in environment variables!');
      console.log('💡 Please run "npm run setup:interactive" to configure your bot.');
      process.exit(1);
    }
    
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
    client.user.setActivity('RP Bot Ready! 🎲', { type: 'PLAYING' });
    
    console.log('\n🎉 Configuration test complete! Your bot is ready to use.');
    console.log('💡 Start the bot with: npm start');
    console.log('💡 Or run in development mode with: npm run dev');
    
  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
    console.log('\n🔧 Please check your .env file and make sure all values are correct.');
    console.log('💡 You can also run "npm run setup:interactive" to recreate your configuration.');
    process.exit(1);
  }
}

setupBot();