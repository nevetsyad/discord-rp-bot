const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const path = require('path');
const { loadCommands, registerEventHandlers } = require('./utils/bootstrap');

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

// Load database side-effects/model wiring
require('./database');

// Command handler
const commandsPath = path.join(__dirname, 'commands');
const commands = loadCommands(commandsPath);

// Event handlers
const eventsPath = path.join(__dirname, 'events');
registerEventHandlers(client, eventsPath, commands);

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

console.log('Discord RP Bot is starting...');