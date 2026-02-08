#!/usr/bin/env node

const { Client, GatewayIntentBits } = require('discord.js');
const { sequelize } = require('./database');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function commandExists(command) {
  try {
    execSync(`command -v ${command}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function getPlatform() {
  const platform = process.platform;
  const arch = process.arch;
  
  if (platform === 'darwin') return 'macOS';
  if (platform === 'linux') return 'Linux';
  if (platform === 'win32') return 'Windows';
  return platform;
}

async function checkAndInstallMySQL() {
  console.log('\n🗄️  MySQL Database Setup');
  console.log('=========================');
  
  // Check if MySQL is already installed
  if (commandExists('mysql')) {
    console.log('✅ MySQL is already installed on your system');
    return true;
  }
  
  console.log('❌ MySQL is not installed');
  console.log('\n📋 Available MySQL installation options:');
  console.log('1. Install MySQL via Homebrew (macOS)');
  console.log('2. Install MySQL via APT (Debian/Ubuntu)');
  console.log('3. Install MySQL via YUM (CentOS/RHEL/Fedora)');
  console.log('4. Install MySQL via Chocolatey (Windows)');
  console.log('5. Install MySQL manually (advanced)');
  console.log('6. Skip MySQL installation (use existing MySQL server)');
  
  const choice = await askQuestion('\nPlease select an option (1-6): ');
  
  switch (choice) {
    case '1':
      return installMySQLHomebrew();
    case '2':
      return installMySQLAPT();
    case '3':
      return installMySQLYUM();
    case '4':
      return installMySQLChocolatey();
    case '5':
      return installMySQLManual();
    case '6':
      return useExistingMySQL();
    default:
      console.log('❌ Invalid choice. Please try again.');
      return checkAndInstallMySQL();
  }
}

async function installMySQLHomebrew() {
  try {
    console.log('\n🍺 Installing MySQL via Homebrew...');
    
    // Check if Homebrew is installed
    if (!commandExists('brew')) {
      console.log('❌ Homebrew is not installed!');
      console.log('Please install Homebrew first:');
      console.log('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
      return false;
    }
    
    // Install MySQL
    console.log('📦 Installing MySQL...');
    execSync('brew install mysql', { stdio: 'inherit' });
    
    // Start MySQL service
    console.log('🚀 Starting MySQL service...');
    execSync('brew services start mysql', { stdio: 'inherit' });
    
    console.log('✅ MySQL installed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to install MySQL via Homebrew:', error.message);
    return false;
  }
}

async function installMySQLAPT() {
  try {
    console.log('\n📦 Installing MySQL via APT...');
    
    // Update package list
    console.log('🔄 Updating package list...');
    execSync('sudo apt update', { stdio: 'inherit' });
    
    // Install MySQL
    console.log('📦 Installing MySQL...');
    execSync('sudo apt install mysql-server', { stdio: 'inherit' });
    
    // Start MySQL service
    console.log('🚀 Starting MySQL service...');
    execSync('sudo systemctl start mysql', { stdio: 'inherit' });
    
    // Enable MySQL to start on boot
    console.log('🔧 Enabling MySQL on boot...');
    execSync('sudo systemctl enable mysql', { stdio: 'inherit' });
    
    console.log('✅ MySQL installed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to install MySQL via APT:', error.message);
    return false;
  }
}

async function installMySQLYUM() {
  try {
    console.log('\n📦 Installing MySQL via YUM...');
    
    // Install MySQL repository
    console.log('📦 Adding MySQL repository...');
    execSync('sudo yum localinstall https://dev.mysql.com/get/mysql80-community-release-el7-7.noarch.rpm -y', { stdio: 'inherit' });
    
    // Install MySQL
    console.log('📦 Installing MySQL...');
    execSync('sudo yum install mysql-community-server -y', { stdio: 'inherit' });
    
    // Start MySQL service
    console.log('🚀 Starting MySQL service...');
    execSync('sudo systemctl start mysqld', { stdio: 'inherit' });
    
    // Enable MySQL to start on boot
    console.log('🔧 Enabling MySQL on boot...');
    execSync('sudo systemctl enable mysqld', { stdio: 'inherit' });
    
    console.log('✅ MySQL installed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to install MySQL via YUM:', error.message);
    return false;
  }
}

async function installMySQLChocolatey() {
  try {
    console.log('\n🍫 Installing MySQL via Chocolatey...');
    
    // Install MySQL
    console.log('📦 Installing MySQL...');
    execSync('choco install mysql', { stdio: 'inherit' });
    
    console.log('✅ MySQL installed successfully!');
    console.log('💡 Note: You may need to start MySQL manually using Windows Services');
    return true;
  } catch (error) {
    console.error('❌ Failed to install MySQL via Chocolatey:', error.message);
    return false;
  }
}

async function installMySQLManual() {
  try {
    console.log('\n📖 Manual MySQL Installation');
    console.log('=============================');
    console.log('Please follow these steps:');
    console.log('1. Visit https://dev.mysql.com/downloads/mysql/');
    console.log('2. Download the appropriate MySQL installer for your system');
    console.log('3. Run the installer and follow the on-screen instructions');
    console.log('4. During installation, set a root password and note it down');
    console.log('5. Start MySQL service after installation');
    console.log('');
    console.log('After completing these steps, come back and continue the bot setup.');
    
    const continueSetup = await askQuestion('Have you completed the manual MySQL installation? (y/N): ');
    if (continueSetup.toLowerCase() !== 'y') {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Manual installation error:', error.message);
    return false;
  }
}

async function useExistingMySQL() {
  try {
    console.log('\n🔍 Testing existing MySQL installation...');
    
    // Test if MySQL is running
    execSync('mysql --version', { stdio: 'inherit' });
    
    console.log('✅ MySQL is available!');
    return true;
  } catch (error) {
    console.log('❌ MySQL is not accessible or not running.');
    console.log('💡 Please ensure MySQL is installed and running, then try again.');
    return false;
  }
}

async function configureMySQLSecurity() {
  try {
    console.log('\n🔒 MySQL Security Configuration');
    console.log('===============================');
    
    const secureInstallation = await askQuestion('Do you want to run MySQL secure installation? (Y/n): ');
    if (secureInstallation.toLowerCase() === 'n') {
      return true;
    }
    
    console.log('🔧 Running MySQL secure installation...');
    console.log('💡 Follow the prompts to configure MySQL security settings.');
    console.log('💡 You can set a root password and remove anonymous users.');
    
    const rootPassword = await askQuestion('Enter MySQL root password (leave empty if not set): ');
    
    if (rootPassword.trim()) {
      // Run mysql_secure_installation with provided password
      process.env.MYSQL_PWD = rootPassword;
      execSync('mysql_secure_installation', { stdio: 'inherit' });
      delete process.env.MYSQL_PWD;
    } else {
      // Run mysql_secure_installation without password
      execSync('mysql_secure_installation', { stdio: 'inherit' });
    }
    
    console.log('✅ MySQL security configuration completed!');
    return true;
  } catch (error) {
    console.error('❌ MySQL security configuration failed:', error.message);
    return true; // Continue anyway, as this is optional
  }
}

async function setupBot() {
  const platform = getPlatform();
  console.log(`🎲 Discord RP Bot - Interactive Setup (${platform})`);
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

  // MySQL Setup
  const mysqlSuccess = await checkAndInstallMySQL();
  if (!mysqlSuccess) {
    console.log('❌ MySQL setup failed. Please install MySQL manually and try again.');
    rl.close();
    return;
  }
  
  // MySQL Security Configuration
  await configureMySQLSecurity();

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