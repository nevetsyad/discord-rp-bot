const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with the RP bot')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('Get specific command help')
        .setRequired(false)),

  async execute(interaction, commands) {
    const commandName = interaction.options.getString('command');
    
    if (commandName) {
      // Help for specific command
      const command = commands.get(commandName);
      if (!command) {
        return await interaction.reply({ content: 'Command not found!', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(process.env.DEFAULT_COLOR || 5814783)
        .setTitle(`Help: ${command.data.name}`)
        .setDescription(command.data.description)
        .addFields(
          { name: 'Usage', value: `\`/${command.data.name}${command.data.options ? ' ' + command.data.options.map(opt => `[${opt.name}]`).join(' ') : ''}\`` }
        );

      if (command.data.options && command.data.options.length > 0) {
        const optionsList = command.data.options.map(opt => 
          `**${opt.name}**: ${opt.description} ${opt.required ? '(Required)' : '(Optional)'}`
        ).join('\n');
        embed.addFields({ name: 'Options', value: optionsList });
      }

      await interaction.reply({ embeds: [embed] });
    } else {
      // General help
      const embed = new EmbedBuilder()
        .setColor(process.env.DEFAULT_COLOR || 5814783)
        .setTitle('Discord RP Bot Help')
        .setDescription('A comprehensive roleplaying bot with character management, dice rolling, and scene organization.')
        .addFields(
          { name: 'Character Commands', value: '/character - Manage your roleplay characters', inline: true },
          { name: 'Dice Commands', value: '/dice - Roll dice for gameplay', inline: true },
          { name: 'Scene Commands', value: '/scene - Manage roleplay scenes', inline: true },
          { name: 'GM Commands', value: '/gm - Game Master tools (coming soon)', inline: true },
          { name: 'Help', value: '/help - Get this help message', inline: true }
        )
        .addFields(
          { name: 'Quick Start', value: '1. Use `/character create` to make your first character\n2. Use `/scene create` to start a scene\n3. Use `/dice 1d20+5` to roll dice\n4. Use `/character join` to add characters to scenes' }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  }
};