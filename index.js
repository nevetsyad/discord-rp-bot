const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
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

// Command handler
const commands = new Map();
const commandsPath = path.join(__dirname, 'commands');

// Load command files
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.set(command.data.name, command);
}

// Load database and models
const sequelize = require('./database');
const { ShadowrunCharacter } = require('./models');

// Sync database
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synchronized successfully.');
}).catch(err => {
  console.error('Error synchronizing database:', err);
});

// Event handlers
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args, commands));
  }
}

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

console.log('Discord RP Bot is starting...');