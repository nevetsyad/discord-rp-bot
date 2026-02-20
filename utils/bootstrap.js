const fs = require('fs');
const path = require('path');

function resolveCommandName(command) {
  if (!command || typeof command !== 'object') return null;

  if (typeof command.name === 'string' && command.name.trim()) {
    return command.name;
  }

  if (!command.data) return null;

  if (typeof command.data.name === 'string' && command.data.name.trim()) {
    return command.data.name;
  }

  if (typeof command.data.toJSON === 'function') {
    const json = command.data.toJSON();
    if (json && typeof json.name === 'string' && json.name.trim()) {
      return json.name;
    }
  }

  return null;
}

function loadCommands(commandsPath, logger = console) {
  const commands = new Map();
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const commandFilePath = path.join(commandsPath, file);

    try {
      const command = require(commandFilePath);
      const commandName = resolveCommandName(command);

      if (!commandName || typeof command.execute !== 'function') {
        logger.warn(`Skipping non-command module: ${file}`);
        continue;
      }

      commands.set(commandName, command);
    } catch (error) {
      logger.error(`Failed loading command module ${file}:`, error.message);
    }
  }

  return commands;
}

function registerEventHandlers(client, eventsPath, commands) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, commands));
    } else {
      client.on(event.name, (...args) => event.execute(...args, commands));
    }
  }
}

module.exports = {
  resolveCommandName,
  loadCommands,
  registerEventHandlers
};
