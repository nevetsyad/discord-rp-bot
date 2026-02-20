const { SlashCommandBuilder } = require('/builders');
const { Character, Scene, User } = require('../database');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('game')
    .setDescription('Game management and session control')
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('Start a new game session')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Game session name')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('difficulty')
            .setDescription('Game difficulty'
            )
            .setRequired(true)
            .addChoices(
              { name: 'Easy (Learning Mode)', value: 'easy' },
              { name: 'Normal (Balanced)', value: 'normal' },
              { name: 'Hard (Challenging)', value: 'hard' },
              { name: 'Brutal (Unforgiving)', value: 'brutal' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('join')
        .setDescription('Join a game session with your character')
        .addStringOption(option =>
          option.setName('game')
            .setDescription('Game session name'
            )
            .setRequired(true))
        .addStringOption(option =>
          option.setName('character')
            .setDescription('Your character name'
            )
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('leave')
        .setDescription('Leave a game session'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Check game session status'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('players')
        .setDescription('List players in current game'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('end')
        .setDescription('End the current game session')),

  async execute(interaction, commands) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    try {
      switch (subcommand) {
        case 'start':
          await startGame(interaction, userId);
          break;
        case 'join':
          await joinGame(interaction, userId);
          break;
        case 'leave':
          await leaveGame(interaction, userId);
          break;
        case 'status':
          await gameStatus(interaction, userId);
          break;
        case 'players':
          await gamePlayers(interaction, userId);
          break;
        case 'end':
          await endGame(interaction, userId);
          break;
      }
    } catch (error) {
      console.error('Error in game command:', error);
      await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
  }
};

// In-memory game state (in production, use database)
const activeGames = new Map();

function getGameSession(userId) {
  // Find user's active game session
  for (const [gameId, game] of activeGames) {
    if (game.players.some(p => p.userId === userId)) {
      return game;
    }
  }
  return null;
}

function getGMGame(userId) {
  // Find game where user is GM
  for (const [gameId, game] of activeGames) {
    if (game.gmId === userId) {
      return game;
    }
  }
  return null;
}

async function startGame(interaction, userId) {
  const gameName = interaction.options.getString('name');
  const difficulty = interaction.options.getString('difficulty');

  // Check if user is already in a game
  const existingGame = getGameSession(userId);
  if (existingGame) {
    return await interaction.reply({ 
      content: 'You are already in a game session! Leave your current game first.', 
      ephemeral: true 
    });
  }

  // Check if user is already GMing a game
  const existingGMGame = getGMGame(userId);
  if (existingGMGame) {
    return await interaction.reply({ 
      content: 'You are already running a game session! End your current game first.', 
      ephemeral: true 
    });
  }

  // Create new game session
  const gameId = `${gameName}-${Date.now()}`;
  const game = {
    id: gameId,
    name: gameName,
    gmId: userId,
    difficulty: difficulty,
    status: 'recruiting',
    players: [],
    currentScene: null,
    combat: null,
    turn: 0,
    createdAt: new Date(),
    metadata: {
      totalEncounters: 0,
      totalCombatRounds: 0,
      playerDeaths: 0,
      experienceAwarded: 0
    }
  };

  activeGames.set(gameId, game);

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(`🎮 Game Session Created: ${gameName}`)
    .setDescription(`A new ${difficulty} difficulty game session has been created!`)
    .addFields(
      { name: 'Game Name', value: gameName, inline: true },
      { name: 'Difficulty', value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1), inline: true },
      { name: 'Status', value: 'Recruiting Players', inline: true },
      { name: 'GM', value: `<@${userId}>`, inline: true },
      { name: 'Players', value: 'None yet', inline: false }
    )
    .addFields(
      { name: 'How to Join', value: 'Use `/game join` to join this game with your character!' }
    )
    .setFooter({ text: `Game ID: ${gameId}` })
    .setTimestamp();

  // Add action buttons
  const actionRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`join_game_${gameId}`)
        .setLabel('Join Game')
        .setStyle(ButtonStyle.Success)
        .setEmoji('👥'),
      new ButtonBuilder()
        .setCustomId(`start_game_${gameId}`)
        .setLabel('Start Game')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('▶️')
        .setDisabled(true)
    );

  await interaction.reply({ 
    embeds: [embed], 
    components: [actionRow] 
  });
}

async function joinGame(interaction, userId) {
  const gameName = interaction.options.getString('game');
  const characterName = interaction.options.getString('character');

  // Find the game session
  let targetGame = null;
  for (const [gameId, game] of activeGames) {
    if (game.name === gameName || game.id.includes(gameName)) {
      targetGame = game;
      break;
    }
  }

  if (!targetGame) {
    return await interaction.reply({ content: 'Game session not found!', ephemeral: true });
  }

  if (targetGame.status !== 'recruiting') {
    return await interaction.reply({ 
      content: 'This game session is no longer accepting players!', 
      ephemeral: true 
    });
  }

  // Check if user is already in the game
  if (targetGame.players.some(p => p.userId === userId)) {
    return await interaction.reply({ 
      content: 'You are already in this game session!', 
      ephemeral: true 
    });
  }

  // Check if character exists and belongs to user
  const character = await Character.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ 
      content: 'Character not found or you don\'t own this character!', 
      ephemeral: true 
    });
  }

  // Add player to game
  const player = {
    userId,
    characterId: character.id,
    characterName: character.name,
    class: 'Adventurer', // Could be expanded
    level: character.level,
    health: character.health,
    maxHealth: character.max_health,
    mana: character.mana,
    maxMana: character.max_mana,
    status: 'active',
    initiative: 0
  };

  targetGame.players.push(player);

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(`👥 Player Joined: ${targetGame.name}`)
    .setDescription(`**${character.name}** has joined the game!`)
    .addFields(
      { name: 'Character', value: character.name, inline: true },
      { name: 'Player', value: `<@${userId}>`, inline: true },
      { name: 'Level', value: character.level.toString(), inline: true },
      { name: 'Health', value: `${character.health}/${character.max_health}`, inline: true },
      { name: 'Total Players', value: targetGame.players.length.toString(), inline: true }
    )
    .setFooter({ text: `Game ID: ${targetGame.id}` })
    .setTimestamp();

  // Update original message
  await interaction.update({ embeds: [embed] });

  // Update start button if enough players
  if (targetGame.players.length >= 1) {
    const actionRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`join_game_${targetGame.id}`)
          .setLabel('Join Game')
          .setStyle(ButtonStyle.Success)
          .setEmoji('👥')
          .setDisabled(targetGame.players.length >= 6),
        new ButtonBuilder()
          .setCustomId(`start_game_${targetGame.id}`)
          .setLabel('Start Game')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('▶️')
          .setDisabled(false)
      );

    await interaction.message.edit({ components: [actionRow] });
  }
}

async function leaveGame(interaction, userId) {
  const game = getGameSession(userId) || getGMGame(userId);
  
  if (!game) {
    return await interaction.reply({ content: 'You are not in any active game session!', ephemeral: true });
  }

  if (game.gmId === userId) {
    // GM is leaving - end the game
    activeGames.delete(game.id);
    return await interaction.reply({ 
      content: `Game session "${game.name}" has been ended by the GM.`, 
      ephemeral: true 
    });
  }

  // Remove player from game
  game.players = game.players.filter(p => p.userId !== userId);
  
  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(`👤 Player Left: ${game.name}`)
    .setDescription('A player has left the game session.')
    .addFields(
      { name: 'Remaining Players', value: game.players.length.toString(), inline: true },
      { name: 'Status', value: game.status, inline: true }
    )
    .setFooter({ text: `Game ID: ${game.id}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function gameStatus(interaction, userId) {
  const game = getGameSession(userId) || getGMGame(userId);
  
  if (!game) {
    return await interaction.reply({ content: 'You are not in any active game session!', ephemeral: true });
  }

  const difficulty = game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1);
  const status = game.status.charAt(0).toUpperCase() + game.status.slice(1);

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(`🎮 Game Status: ${game.name}`)
    .addFields(
      { name: 'Game Name', value: game.name, inline: true },
      { name: 'Difficulty', value: difficulty, inline: true },
      { name: 'Status', value: status, inline: true },
      { name: 'GM', value: `<@${game.gmId}>`, inline: true },
      { name: 'Players', value: game.players.length.toString(), inline: true },
      { name: 'Turn', value: game.turn.toString(), inline: true }
    );

  if (game.currentScene) {
    embed.addFields(
      { name: 'Current Scene', value: game.currentScene, inline: false }
    );
  }

  if (game.combat) {
    embed.addFields(
      { name: 'Combat', value: `Active - Round ${game.combat.round}`, inline: false }
    );
  }

  embed.addFields(
    { name: 'Statistics', value: 
      `Encounters: ${game.metadata.totalEncounters}\n` +
      `Combat Rounds: ${game.metadata.totalCombatRounds}\n` +
      `Player Deaths: ${game.metadata.playerDeaths}\n` +
      `XP Awarded: ${game.metadata.experienceAwarded}`
    }
  );

  embed.setFooter({ text: `Game ID: ${game.id} | Created: ${game.createdAt.toLocaleDateString()}` });
  embed.setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function gamePlayers(interaction, userId) {
  const game = getGameSession(userId) || getGMGame(userId);
  
  if (!game) {
    return await interaction.reply({ content: 'You are not in any active game session!', ephemeral: true });
  }

  if (game.players.length === 0) {
    return await interaction.reply({ content: 'No players in this game session.', ephemeral: true });
  }

  const playerList = game.players.map((player, index) => 
    `${index + 1}. **${player.characterName}** (Level ${player.level}) - ${player.health}/${player.maxHealth} HP`
  ).join('\n');

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(`👥 Players in ${game.name}`)
    .setDescription(playerList)
    .addFields(
      { name: 'Total Players', value: game.players.length.toString(), inline: true },
      { name: 'Game Status', value: game.status, inline: true }
    )
    .setFooter({ text: `GM: <@${game.gmId}> | Game ID: ${game.id}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function endGame(interaction, userId) {
  const game = getGMGame(userId);
  
  if (!game) {
    return await interaction.reply({ 
      content: 'You are not running any game session! Only the GM can end a game.', 
      ephemeral: true 
    });
  }

  // End the game
  activeGames.delete(game.id);

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(`🏁 Game Ended: ${game.name}`)
    .setDescription(`The game session "${game.name}" has been ended by the GM.`)
    .addFields(
      { name: 'Duration', value: `${Math.floor((Date.now() - game.createdAt) / 60000)} minutes`, inline: true },
      { name: 'Total Encounters', value: game.metadata.totalEncounters.toString(), inline: true },
      { name: 'Combat Rounds', value: game.metadata.totalCombatRounds.toString(), inline: true },
      { name: 'Player Deaths', value: game.metadata.playerDeaths.toString(), inline: true }
    )
    .setFooter({ text: `GM: <@${game.gmId}> | Game ID: ${game.id}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}