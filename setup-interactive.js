#!/usr/bin/env node

const { Client, GatewayIntentBits } = require('discord.js');
const { sequelize } = require('./database');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupBot() {
  console.log('🎲 Discord RP Bot - Interactive Setup');
  console.log('=====================================\n');
  
  // Check if .env file already exists
  if (fs.existsSync('.env')) {
    const overwrite = await askQuestion('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled. Keeping existing .env file.');
      rl.close();
      return;
    }
  }

  console.log('\n📝 Please provide the following configuration details:\n');

  // Discord Bot Configuration
  console.log('🔵 Discord Bot Configuration:');
  const discordToken = await askQuestion('  Discord Bot Token: ');
  const clientId = await askQuestion('  Bot Client ID: ');
  const guildId = await askQuestion('  Server/Guild ID: ');
  
  // Database Configuration
  console.log('\n🗄️  Database Configuration:');
  const dbHost = await askQuestion('  Database Host (default: localhost): ') || 'localhost';
  const dbPort = await askQuestion('  Database Port (default: 3306): ') || '3306';
  const dbName = await askQuestion('  Database Name: ');
  const dbUser = await askQuestion('  Database User: ');
  const dbPassword = await askQuestion('  Database Password: ');
  
  // Bot Settings
  console.log('\n⚙️  Bot Settings:');
  const prefix = await askQuestion('  Command Prefix (default: !): ') || '!';
  const defaultColor = await askQuestion('  Default Embed Color (default: 5814783): ') || '5814783';
  const maxCharacters = await askQuestion('  Max Characters Per User (default: 5): ') || '5';
  const maxDiceRolls = await askQuestion('  Max Dice Rolls (default: 10): ') || '10';

  console.log('\n✅ Configuration Complete!');
  
  // Create .env file
  const envContent = `# Discord Bot Configuration
DISCORD_TOKEN=${discordToken}
CLIENT_ID=${clientId}
GUILD_ID=${guildId}

# Database Configuration (MySQL)
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_NAME=${dbName}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}

# Bot Settings
PREFIX=${prefix}
DEFAULT_COLOR=${defaultColor}
MAX_CHARACTERS_PER_USER=${maxCharacters}
MAX_DICE_ROLLS=${maxDiceRolls}`;

  fs.writeFileSync('.env', envContent);
  console.log('📄 .env file created successfully!');

  // Test configuration
  console.log('\n🔍 Testing Configuration...');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Sync database tables
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');
    
    // Test Discord login
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
      ]
    });
    
    await client.login(discordToken);
    console.log('✅ Discord bot login successful');
    
    // Set bot status
    client.user.setActivity('RP Bot Ready! 🎲', { type: 'PLAYING' });
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Keep client open for 2 seconds
    client.destroy();
    
    console.log('\n🎉 Setup Complete!');
    console.log('💡 You can now start the bot with: npm start');
    console.log('💡 Or run in development mode with: npm run dev');
    
  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
    console.log('\n🔧 Please check your configuration and try again.');
    console.log('💡 The .env file has been saved. You can edit it manually if needed.');
  }
  
  rl.close();
}

setupBot().catch(error => {
  console.error('Setup failed:', error);
  rl.close();
  process.exit(1);
});