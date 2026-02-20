const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const path = require('path');
const { loadCommands, registerEventHandlers } = require('./utils/bootstrap');
const { validateEnv } = require('./config/env');
const { appLogger } = require('./config/security');

// Load environment variables
dotenv.config();

async function start() {
  const env = validateEnv(process.env);

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildPresences
    ]
  });

  // Load database side-effects/model wiring and initialize with safe strategy.
  const { initializeDatabase } = require('./database');
  await initializeDatabase({
    nodeEnv: env.NODE_ENV,
    strategy: env.DB_SCHEMA_STRATEGY,
    allowSync: env.ALLOW_DB_SYNC
  });

  // Command handler
  const commandsPath = path.join(__dirname, 'commands');
  const commands = loadCommands(commandsPath);

  // Event handlers
  const eventsPath = path.join(__dirname, 'events');
  registerEventHandlers(client, eventsPath, commands);

  await client.login(env.DISCORD_TOKEN);
  appLogger.info('Discord RP Bot started', {
    nodeEnv: env.NODE_ENV,
    dbSchemaStrategy: env.DB_SCHEMA_STRATEGY,
    commandCount: commands.length
  });
}

start().catch((error) => {
  appLogger.error('Fatal startup failure', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});
