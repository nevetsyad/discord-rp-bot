const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');

const EmbedCtor = Discord.EmbedBuilder || Discord.MessageEmbed;

function normalizeCommand(command) {
  if (!command) return null;

  if (command.data && typeof command.data.toJSON === 'function') {
    return command.data.toJSON();
  }

  if (command.data && typeof command.data === 'object') {
    return command.data;
  }

  if (command.name) {
    return {
      name: command.name,
      description: command.description || 'No description available.',
      options: command.options || []
    };
  }

  return null;
}

function formatUsage(commandData) {
  const options = Array.isArray(commandData.options) ? commandData.options : [];
  const usageOptions = options
    .map((opt) => (opt.required ? `<${opt.name}>` : `[${opt.name}]`))
    .join(' ');

  return `\`/${commandData.name}${usageOptions ? ` ${usageOptions}` : ''}\``;
}

function suggestCommands(commandName, commands) {
  if (!commandName || !commands) return [];

  const target = commandName.toLowerCase();
  const suggestions = [];

  for (const key of commands.keys()) {
    const candidate = key.toLowerCase();
    if (candidate.startsWith(target) || candidate.includes(target) || target.includes(candidate)) {
      suggestions.push(key);
    }
  }

  return suggestions.slice(0, 5);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show command help and discover what to do next')
    .addStringOption((option) =>
      option
        .setName('command')
        .setDescription('Optional command name for detailed help')
        .setRequired(false)
    ),

  async execute(interaction, commands) {
    const commandName = interaction.options.getString('command');

    if (commandName) {
      const command = commands.get(commandName);
      if (!command) {
        const suggestions = suggestCommands(commandName, commands);
        const suggestionText = suggestions.length > 0
          ? `Did you mean: ${suggestions.map((name) => `\`/${name}\``).join(', ')}?`
          : 'Try `/help` to see all available commands.';

        return interaction.reply({
          content: `❌ I couldn't find \`/${commandName}\`. ${suggestionText}`,
          ephemeral: true
        });
      }

      const commandData = normalizeCommand(command);
      const embed = new EmbedCtor()
        .setColor(process.env.DEFAULT_COLOR || 0x58B0FF)
        .setTitle(`Help: /${commandData.name}`)
        .setDescription(commandData.description || 'No description available.')
        .addFields({ name: 'Usage', value: formatUsage(commandData) })
        .addFields({
          name: 'Tip',
          value: 'Required options use `<like-this>`, optional options use `[like-this]`.'
        })
        .setTimestamp();

      const options = Array.isArray(commandData.options) ? commandData.options : [];
      if (options.length > 0) {
        const optionsList = options
          .map((opt) => `• **${opt.name}** — ${opt.description || 'No description'} ${opt.required ? '(required)' : '(optional)'}`)
          .join('\n');

        embed.addFields({ name: 'Options', value: optionsList });
      }

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const commandNames = Array.from(commands.keys()).sort((a, b) => a.localeCompare(b));
    const commandList = commandNames.map((name) => `• \`/${name}\``).join('\n');

    const embed = new EmbedCtor()
      .setColor(process.env.DEFAULT_COLOR || 0x58B0FF)
      .setTitle('Discord RP Bot Help')
      .setDescription('Use `/help command:<name>` for details on one command.')
      .addFields(
        { name: 'Available Commands', value: commandList || 'No commands loaded.' },
        {
          name: 'Quick Start',
          value: '1) Create a character with `/character`\n2) Roll with `/dice`\n3) Manage scenes with `/scene`'
        },
        {
          name: 'Need troubleshooting?',
          value: 'If a command fails, re-run `/help command:<name>` and verify required options first.'
        }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
