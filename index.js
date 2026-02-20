const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const path = require('path');
const { loadCommands, registerEventHandlers } = require('./utils/bootstrap');
const { validateEnv } = require('./config/env');
const { appLogger } = require('./config/security');
const { retryWithBackoff, isTransientError } = require('./utils/reliability');
const { createRuntimeState, startDiagnosticsServer } = require('./utils/diagnostics');

// Load environment variables
dotenv.config();

const runtimeState = createRuntimeState();
let diagnosticsServer = null;
let client = null;
let shutdownInProgress = false;

async function shutdown(signal, options = {}) {
  if (shutdownInProgress) return;
  shutdownInProgress = true;

  runtimeState.shuttingDown = true;
  runtimeState.ready = false;

  const exitCode = typeof options.exitCode === 'number' ? options.exitCode : 0;
  const error = options.error;

  appLogger.info('Shutdown initiated', {
    signal,
    exitCode,
    hasError: Boolean(error)
  });

  try {
    if (client) {
      client.destroy();
      runtimeState.discordConnected = false;
    }
  } catch (clientError) {
    runtimeState.markError(clientError, 'shutdown.client.destroy');
    appLogger.error('Failed to destroy Discord client', { error: clientError.message });
  }

  try {
    const { closeDatabase } = require('./database');
    await closeDatabase();
    runtimeState.dbConnected = false;
  } catch (dbError) {
    runtimeState.markError(dbError, 'shutdown.database.close');
    appLogger.error('Failed to close database', { error: dbError.message });
  }

  try {
    if (diagnosticsServer) {
      await new Promise((resolve) => diagnosticsServer.close(resolve));
    }
  } catch (serverError) {
    runtimeState.markError(serverError, 'shutdown.diagnostics.close');
    appLogger.error('Failed to close diagnostics server', { error: serverError.message });
  }

  if (error) {
    appLogger.error('Shutdown due to fatal error', {
      signal,
      error: error.message,
      stack: error.stack
    });
  }

  process.exit(exitCode);
}

function registerSignalHandlers() {
  process.on('SIGTERM', () => shutdown('SIGTERM', { exitCode: 0 }));
  process.on('SIGINT', () => shutdown('SIGINT', { exitCode: 0 }));

  process.on('unhandledRejection', (reason) => {
    const err = reason instanceof Error ? reason : new Error(String(reason));
    runtimeState.markError(err, 'process.unhandledRejection');
    appLogger.error('Unhandled promise rejection', {
      error: err.message,
      stack: err.stack
    });
  });

  process.on('uncaughtException', (error) => {
    runtimeState.markError(error, 'process.uncaughtException');
    appLogger.error('Uncaught exception', {
      error: error.message,
      stack: error.stack
    });
    shutdown('uncaughtException', { exitCode: 1, error });
  });
}

async function start() {
  const env = validateEnv(process.env);
  registerSignalHandlers();

  diagnosticsServer = startDiagnosticsServer(runtimeState, {
    port: env.HEALTH_PORT,
    logger: appLogger
  });

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildPresences
    ]
  });

  client.once('ready', () => {
    runtimeState.discordConnected = true;
  });

  const { initializeDatabase } = require('./database');
  await initializeDatabase({
    nodeEnv: env.NODE_ENV,
    strategy: env.DB_SCHEMA_STRATEGY,
    allowSync: env.ALLOW_DB_SYNC,
    retryAttempts: env.STARTUP_RETRY_ATTEMPTS
  });
  runtimeState.dbConnected = true;

  const commandsPath = path.join(__dirname, 'commands');
  const commands = loadCommands(commandsPath, appLogger);
  runtimeState.commandCount = commands.size;

  const eventsPath = path.join(__dirname, 'events');
  registerEventHandlers(client, eventsPath, commands);

  await retryWithBackoff(() => client.login(env.DISCORD_TOKEN), {
    retries: env.STARTUP_RETRY_ATTEMPTS,
    baseDelayMs: 700,
    maxDelayMs: 8_000,
    shouldRetry: isTransientError,
    operation: 'discord.client.login',
    onRetry: ({ attempt, delayMs, error }) => {
      runtimeState.markError(error, 'discord.login.retry');
      appLogger.warn('Retrying Discord login', {
        attempt,
        delayMs,
        error: error.message,
        code: error.code,
        status: error.status
      });
    }
  });

  runtimeState.ready = true;
  appLogger.info('Discord RP Bot started', {
    nodeEnv: env.NODE_ENV,
    dbSchemaStrategy: env.DB_SCHEMA_STRATEGY,
    commandCount: commands.size
  });
}

start().catch((error) => {
  runtimeState.markError(error, 'startup');
  appLogger.error('Fatal startup failure', {
    error: error.message,
    stack: error.stack
  });
  shutdown('startupFailure', { exitCode: 1, error });
});