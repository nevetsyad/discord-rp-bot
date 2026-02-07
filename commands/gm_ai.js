const { SlashCommandBuilder } = require('discord.js');
const { Character, Scene, CharacterScene } = require('../database');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openrouter/z-ai/glm-4.5-air:free';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gm_ai')
    .setDescription('AI-powered Game Master tools using OpenRouter')
    .addSubcommand(subcommand =>
      subcommand
        .setName('generate_story')
        .setDescription('Generate a story based on your characters')
        .addStringOption(option =>
          option.setName('prompt')
            .setDescription('What story do you want to generate?')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('character_dialogue')
        .setDescription('Generate dialogue for your character')
        .addStringOption(option =>
          option.setName('character')
            .setDescription('Character name')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('situation')
            .setDescription('What situation is the character in?')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('world_building')
        .setDescription('Generate world-building content')
        .addStringOption(option =>
          option.setName('aspect')
            .setDescription('What aspect of the world?'
            )
            .setRequired(true)
            .addChoices(
              { name: 'Location Description', value: 'location' },
              { name: 'Culture/Traditions', value: 'culture' },
              { name: 'History', value: 'history' },
              { name: 'Magic System', value: 'magic' },
              { name: 'Technology', value: 'technology' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('quest_generator')
        .setDescription('Generate a quest or adventure')
        .addStringOption(option =>
          option.setName('type')
            .setDescription('Quest type'
            )
            .setRequired(true)
            .addChoices(
              { name: 'Main Story Quest', value: 'main' },
              { name: 'Side Quest', value: 'side' },
              { name: 'Random Encounter', value: 'encounter' },
              { name: 'Social Challenge', value: 'social' },
              { name: 'Puzzle/Mystery', value: 'puzzle' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('npc_interaction')
        .setDescription('Generate NPC dialogue and reactions')
        .addStringOption(option =>
          option.setName('npc_name')
            .setDescription('NPC name or description')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('player_action')
            .setDescription('What did the player do?')
            .setRequired(true))),

  async execute(interaction, commands) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    try {
      // Defer the reply since AI generation might take time
      await interaction.deferReply();

      switch (subcommand) {
        case 'generate_story':
          await generateStory(interaction, userId);
          break;
        case 'character_dialogue':
          await generateCharacterDialogue(interaction, userId);
          break;
        case 'world_building':
          await generateWorldBuilding(interaction, userId);
          break;
        case 'quest_generator':
          await generateQuest(interaction, userId);
          break;
        case 'npc_interaction':
          await generateNPCInteraction(interaction, userId);
          break;
      }
    } catch (error) {
      console.error('Error in gm_ai command:', error);
      await interaction.followUp({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
  }
};

async function generateStory(interaction, userId) {
  const prompt = interaction.options.getString('prompt');
  
  // Get user's characters
  const characters = await Character.findAll({
    where: { user_id: userId }
  });

  const characterContext = characters.length > 0
    ? `User's characters:\n${characters.map(char => `- ${char.name}: ${char.description}`).join('\n')}`
    : 'User has no characters created yet.';

  const systemPrompt = `You are an expert Game Master for a roleplaying game. Based on the user's characters and their request, create an engaging story narrative. 

${characterContext}

User's request: ${prompt}

Generate a story that:
1. Incorporates the user's characters naturally
2. Creates an engaging narrative with clear stakes
3. Provides opportunities for character development
4. Sets up interesting challenges and conflicts
5. Ends with a hook or cliffhanger to continue the story

Format your response as a rich narrative description suitable for a roleplaying game.`;

  const story = await callOpenRouterAPI(systemPrompt);

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle('🤖 AI-Generated Story')
    .setDescription(story)
    .addFields(
      { name: 'Requested', value: prompt, inline: false },
      { name: 'Characters Involved', value: characters.length > 0 ? characters.map(c => `**${c.name}**`).join(', ') : 'None specified' }
    )
    .setFooter({ text: `Generated by AI using ${MODEL}` })
    .setTimestamp();

  await interaction.followUp({ embeds: [embed] });
}

async function generateCharacterDialogue(interaction, userId) {
  const characterName = interaction.options.getString('character');
  const situation = interaction.options.getString('situation');
  
  const character = await Character.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.followUp({ content: 'Character not found!', ephemeral: true });
  }

  const systemPrompt = `You are roleplaying as ${character.name}. Based on their personality and the given situation, generate authentic dialogue that matches their character.

Character Information:
- Name: ${character.name}
- Personality: ${character.personality}
- Description: ${character.description}
- Skills: ${character.skills}
- Appearance: ${character.appearance}

Situation: ${situation}

Generate dialogue that:
1. Sounds authentic to this character's personality
2. Shows their character traits and skills
3. Responds appropriately to the situation
4. Provides opportunities for further interaction
5. Is engaging and advances the story

Format your response as the character speaking, with their name clearly indicated.`;

  const dialogue = await callOpenRouterAPI(systemPrompt);

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(`💬 ${character.name}'s Dialogue`)
    .setDescription(dialogue)
    .addFields(
      { name: 'Character', value: `**${character.name}**`, inline: true },
      { name: 'Situation', value: situation, inline: true }
    )
    .setFooter({ text: `Generated by AI using ${MODEL}` })
    .setTimestamp();

  await interaction.followUp({ embeds: [embed] });
}

async function generateWorldBuilding(interaction, userId) {
  const aspect = interaction.options.getString('aspect');
  
  const aspectPrompts = {
    location: 'Generate a detailed description of a fantasy location. Include geography, architecture, atmosphere, and notable features.',
    culture: 'Describe a unique culture with traditions, customs, social structure, and daily life.',
    history: 'Create a historical timeline or backstory for a fantasy world with major events and their impact.',
    magic: 'Design a magic system with clear rules, limitations, sources, and cultural significance.',
    technology: 'Describe technology in a fantasy setting, including how it works and its impact on society.'
  };

  const systemPrompt = `${aspectPrompts[aspect]}

Generate content that is:
1. Rich in detail and immersive
2. Consistent with fantasy genre conventions
3. Provides hooks for adventure and story opportunities
4. Includes interesting NPCs or organizations
5. Sets up potential conflicts or mysteries

Format your response as a descriptive world-building entry suitable for a roleplaying game.`;

  const worldContent = await callOpenRouterAPI(systemPrompt);

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(`🏰 World Building: ${aspect.charAt(0).toUpperCase() + aspect.slice(1)}`)
    .setDescription(worldContent)
    .addFields(
      { name: 'Aspect', value: aspect.charAt(0).toUpperCase() + aspect.slice(1), inline: true }
    )
    .setFooter({ text: `Generated by AI using ${MODEL}` })
    .setTimestamp();

  await interaction.followUp({ embeds: [embed] });
}

async function generateQuest(interaction, userId) {
  const type = interaction.options.getString('type');
  
  const typePrompts = {
    main: 'Generate an epic main story quest with high stakes, major consequences, and significant character development.',
    side: 'Create an engaging side quest that provides interesting challenges, good rewards, and optional story content.',
    encounter: 'Design a random encounter quest that can be dropped into any adventure, with multiple possible resolutions.',
    social: 'Generate a quest focused on social interaction, persuasion, diplomacy, or roleplaying challenges.',
    puzzle: 'Create a puzzle-based quest with intellectual challenges, mysteries to solve, and logical reasoning elements.'
  };

  const systemPrompt = `${typePrompts[type]}

Generate a quest that includes:
1. A compelling hook or premise
2. Clear objectives and challenges
3. Multiple paths to completion
4. Meaningful rewards and consequences
5. Opportunities for character development
6. Connections to the larger world story

Format your response as a complete quest description suitable for a roleplaying game.`;

  const quest = await callOpenRouterAPI(systemPrompt);

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(`🗺️ ${type.charAt(0).toUpperCase() + type.slice(1)} Quest`)
    .setDescription(quest)
    .addFields(
      { name: 'Quest Type', value: type.charAt(0).toUpperCase() + type.slice(1), inline: true }
    )
    .setFooter({ text: `Generated by AI using ${MODEL}` })
    .setTimestamp();

  await interaction.followUp({ embeds: [embed] });
}

async function generateNPCInteraction(interaction, userId) {
  const npcName = interaction.options.getString('npc_name');
  const playerAction = interaction.options.getString('player_action');
  
  const systemPrompt = `You are an NPC in a roleplaying game. The player has just taken the following action: "${playerAction}"

NPC Information:
- Name/Description: ${npcName}
- Personality: Create a fitting personality for this NPC based on their name/description
- Role: Determine their role in the story or community

Generate the NPC's response that:
1. Is authentic to the character's personality and role
2. Shows appropriate emotional reaction to the player's action
3. Provides opportunities for further interaction
4. May reveal information about the world or story
5. Creates tension, intrigue, or cooperation as appropriate
6. Keeps the story moving forward

Format your response as the NPC's dialogue and actions.`;

  const npcResponse = await callOpenRouterAPI(systemPrompt);

  const embed = new EmbedBuilder()
    .setColor(process.env.DEFAULT_COLOR || 5814783)
    .setTitle(`👤 NPC Interaction`)
    .setDescription(npcResponse)
    .addFields(
      { name: 'NPC', value: npcName, inline: true },
      { name: 'Player Action', value: playerAction, inline: true }
    )
    .setFooter({ text: `Generated by AI using ${MODEL}` })
    .setTimestamp();

  await interaction.followUp({ embeds: [embed] });
}

async function callOpenRouterAPI(prompt) {
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://discord.com',
        'X-Title': 'Discord RP Bot'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: 'You are an expert Game Master for a roleplaying game. Generate creative, engaging, and immersive content for players.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API error:', error);
    throw new Error('Failed to generate content using AI. Please try again later.');
  }
}