const { SlashCommandBuilder } = require('discord.js');
const { ShadowrunCharacter } = require('../models');
const { ShadowrunDice } = require('../utils/ShadowrunDice');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const EnhancedEmbeds = require('./enhanced-embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('character')
    .setDescription('Manage your Shadowrun characters')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create-shadowrun')
        .setDescription('Create a new Shadowrun character')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Character name')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('race')
            .setDescription('Choose your meta-human race')
            .setRequired(true)
            .addChoices(
              { name: 'Human', value: 'Human' },
              { name: 'Elf', value: 'Elf' },
              { name: 'Dwarf', value: 'Dwarf' },
              { name: 'Ork', value: 'Ork' },
              { name: 'Troll', value: 'Troll' }
            ))
        .addStringOption(option =>
          option.setName('archetype')
            .setDescription('Choose your character archetype or Custom for full customization')
            .setRequired(false)
            .addChoices(
              { name: 'Mage', value: 'Mage' },
              { name: 'Street Samurai', value: 'StreetSamurai' },
              { name: 'Shaman', value: 'Shaman' },
              { name: 'Rigger', value: 'Rigger' },
              { name: 'Decker', value: 'Decker' },
              { name: 'Physical Adept', value: 'PhysicalAdept' },
              { name: 'Custom (Full Customization)', value: 'Custom' }
            ))
        .addStringOption(option =>
          option.setName('priority')
          .setDescription('Choose your priority level (A-E)')
          .setRequired(true)
          .addChoices(
            { name: 'A: Full Magician (30 attr points, 50 skill points, 1,000,000¥)', value: 'A' },
            { name: 'B: Adept/Aspected Magician (27 attr points, 40 skill points, 400,000¥)', value: 'B' },
            { name: 'C: Elf/Troll (24 attr points, 34 skill points, 90,000¥)', value: 'C' },
            { name: 'D: Dwarf/Ork (21 attr points, 30 skill points, 20,000¥)', value: 'D' },
            { name: 'E: Human (18 attr points, 27 skill points, 5,000¥)', value: 'E' }
          )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list-shadowrun')
        .setDescription('List all your Shadowrun characters'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list-skills')
        .setDescription('List all available Shadowrun skills by category'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('show-skills')
        .setDescription('Show detailed skills breakdown by category')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Character name')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('combat-start')
        .setDescription('Start a combat encounter')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Character name')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('combat-initiative')
        .setDescription('Roll initiative for combat')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Character name')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('combat-attack')
        .setDescription('Make an attack in combat')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Character name')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('skill')
            .setDescription('Attack skill to use')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('target')
            .setDescription('Target name')
            .setRequired(true))
        .addIntegerOption(option =>
          option.setName('accuracy')
            .setDescription('Accuracy modifier')
            .setRequired(false)
            .setMinValue(-10)
            .setMaxValue(10)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('combat-status')
        .setDescription('Show combat status')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Character name')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('view-shadowrun')
        .setDescription('View Shadowrun character details')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Character name to view')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete-shadowrun')
        .setDescription('Delete a Shadowrun character')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Character name to delete')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('spend-karma')
        .setDescription('Spend karma to improve attributes')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Character name')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('attribute')
            .setDescription('Attribute to improve')
            .setRequired(true)
            .addChoices(
              { name: 'Body', value: 'body' },
              { name: 'Quickness', value: 'quickness' },
              { name: 'Strength', value: 'strength' },
              { name: 'Charisma', value: 'charisma' },
              { name: 'Intelligence', value: 'intelligence' },
              { name: 'Willpower', value: 'willpower' }
            ))
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Number of points to increase (1-3)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(3)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('show-sheet')
        .setDescription('Display your character sheet')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Character name')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('allocate-attributes')
        .setDescription('Allocate attribute points (A/B/C/D system)')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Character name')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('a_attributes')
            .setDescription('A attributes (6 points total, comma-separated)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('b_attributes')
            .setDescription('B attributes (5 points total, comma-separated)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('c_attributes')
            .setDescription('C attributes (4 points total, comma-separated)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('d_attribute')
            .setDescription('D attribute (3 points to single attribute)')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('allocate-skills')
        .setDescription('Allocate skill points based on priority')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Character name')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('skill')
            .setDescription('Skill name to allocate points to')
            .setRequired(true))
        .addIntegerOption(option =>
          option.setName('rating')
            .setDescription('Skill rating (0-6)')
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(6))),

  async execute(interaction, commands) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    try {
      switch (subcommand) {
        case 'create-shadowrun':
          await createShadowrunCharacter(interaction, userId);
        case 'list-shadowrun':
          await listShadowrunCharacters(interaction, userId);
        case 'view-shadowrun':
          await viewShadowrunCharacter(interaction, userId);
        case 'delete-shadowrun':
          await deleteShadowrunCharacter(interaction, userId);
        case 'spend-karma':
          await spendKarma(interaction, userId);
        case 'show-sheet':
          await showCharacterSheet(interaction, userId);
        case 'allocate-attributes':
          await allocateAttributes(interaction, userId);
        case 'allocate-skills':
          await allocateSkills(interaction, userId);
        case 'list-skills':
          await listSkills(interaction, userId);
        case 'show-skills':
          await showSkills(interaction, userId);
        case 'combat-start':
          await startCombat(interaction, userId);
        case 'combat-initiative':
          await rollInitiative(interaction, userId);
        case 'combat-attack':
          await makeAttack(interaction, userId);
        case 'combat-status':
          await showCombatStatus(interaction, userId);
      }
    } catch (error) {
      console.error('Error in Shadowrun character command:', error);
      await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
  }
};

async function createShadowrunCharacter(interaction, userId) {
  const name = interaction.options.getString('name');
  const race = interaction.options.getString('race');
  const archetype = interaction.options.getString('archetype');
  const priority = interaction.options.getString('priority');

  // If no archetype is provided, default to Custom
  const finalArchetype = archetype || 'Custom';

  // Check if character already exists
  const existingCharacter = await ShadowrunCharacter.findOne({
    where: { name, user_id: userId, guild_id: interaction.guild.id }
  });

  if (existingCharacter) {
    return await interaction.reply({ content: 'A character with this name already exists!', ephemeral: true });
  }

  // Create character with starting karma
  const startingKarma = {
    Human: 3,
    Elf: 0,
    Dwarf: 0,
    Ork: 0,
    Troll: 0
  };

  // Create character first with base values
  const character = await ShadowrunCharacter.create({
    name,
    race,
    archetype: finalArchetype,
    priority: priority || 'E',
    karma: startingKarma[race] || 0,
    user_id: userId,
    guild_id: interaction.guild.id
  });

  // Set up default attribute allocation based on archetype recommendations and priority
  const archetypePackage = character.getArchetypePackage();
  const distribution = character.getAttributePointDistribution();
  
  let aAttributes = [];
  let bAttributes = [];
  let cAttributes = [];
  let dAttribute = [];
  
  if (finalArchetype !== 'Custom' && archetypePackage.recommended) {
    // Allocate points based on archetype recommendations
    const recommended = archetypePackage.recommended;
    
    // A attributes: The most important for the archetype (6 points)
    if (recommended.intelligence && recommended.intelligence >= 5) aAttributes.push('intelligence');
    if (recommended.willpower && recommended.willpower >= 5) aAttributes.push('willpower');
    if (recommended.charisma && recommended.charisma >= 5) aAttributes.push('charisma');
    if (recommended.strength && recommended.strength >= 5) aAttributes.push('strength');
    if (recommended.quickness && recommended.quickness >= 5) aAttributes.push('quickness');
    if (recommended.body && recommended.body >= 5) aAttributes.push('body');
    
    // B attributes: Secondary important attributes (5 points)
    const secondaryAttrs = Object.keys(recommended).filter(attr => 
      recommended[attr] >= 4 && recommended[attr] < 5 && !aAttributes.includes(attr)
    );
    bAttributes.push(...secondaryAttrs.slice(0, Math.min(5 - bAttributes.length, 5)));
    
    // C attributes: Tertiary attributes (4 points)
    const tertiaryAttrs = Object.keys(recommended).filter(attr => 
      recommended[attr] >= 3 && recommended[attr] < 4 && !aAttributes.includes(attr) && !bAttributes.includes(attr)
    );
    cAttributes.push(...tertiaryAttrs.slice(0, Math.min(4 - cAttributes.length, 4)));
    
    // D attribute: Least important attribute (3 points)
    const remainingAttrs = Object.keys(recommended).filter(attr => 
      !aAttributes.includes(attr) && !bAttributes.includes(attr) && !cAttributes.includes(attr)
    );
    if (remainingAttrs.length > 0) {
      dAttribute = [remainingAttrs[0]];
    }
    
    // If we still have points to allocate, distribute them logically
    const totalAllocated = aAttributes.length + bAttributes.length + cAttributes.length + dAttribute.length;
    const remainingPoints = 6 + 5 + 4 + 3 - totalAllocated;
    
    if (remainingPoints > 0) {
      // Allocate remaining points to most logical attributes
      const allAttrs = ['body', 'quickness', 'strength', 'charisma', 'intelligence', 'willpower'];
      const unallocatedAttrs = allAttrs.filter(attr => 
        !aAttributes.includes(attr) && !bAttributes.includes(attr) && !cAttributes.includes(attr) && !dAttribute.includes(attr)
      );
      
      // Add to A attributes first if we have room
      while (aAttributes.length < 6 && unallocatedAttrs.length > 0) {
        aAttributes.push(unallocatedAttrs.shift());
      }
      
      // Then B attributes
      while (bAttributes.length < 5 && unallocatedAttrs.length > 0) {
        bAttributes.push(unallocatedAttrs.shift());
      }
      
      // Then C attributes
      while (cAttributes.length < 4 && unallocatedAttrs.length > 0) {
        cAttributes.push(unallocatedAttrs.shift());
      }
      
      // Finally D attribute
      if (unallocatedAttrs.length > 0) {
        dAttribute = [unallocatedAttrs[0]];
      }
    }
  } else {
    // For Custom characters, allocate points evenly as a starting point
    aAttributes = ['intelligence', 'willpower'];
    bAttributes = ['strength', 'quickness'];
    cAttributes = ['body', 'charisma'];
  }
  
  // Apply the attribute allocation
  try {
    const allocationResult = character.setAttributeAllocation(aAttributes, bAttributes, cAttributes, dAttribute);
    
    const racialMax = character.getRacialMaximums();
    
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Shadowrun Character Created!')
      .setDescription(`**${character.name}** has been created as a ${character.race} ${character.archetype || 'Custom Character'}`)
      .addFields(
        { name: 'Race', value: character.race, inline: true },
        { name: 'Archetype', value: character.archetype || 'Custom', inline: true },
        { name: 'Starting Karma', value: character.karma.toString(), inline: true },
        { name: 'Attribute Allocation', value: `A: ${aAttributes.join(', ')} | B: ${bAttributes.join(', ')} | C: ${cAttributes.join(', ')} | D: ${dAttribute[0] || 'None'}`, inline: true },
        { name: 'Current Attributes', value: `Body: ${character.body} | Quickness: ${character.quickness} | Strength: ${character.strength} | Charisma: ${character.charisma} | Intelligence: ${character.intelligence} | Willpower: ${character.willpower}`, inline: false },
        { name: 'Racial Maximums', value: `Body: ${racialMax.body}, Quickness: ${racialMax.quickness}, Strength: ${racialMax.strength}, Charisma: ${racialMax.charisma}, Intelligence: ${racialMax.intelligence}, Willpower: ${racialMax.willpower}` },
        { name: finalArchetype === 'Custom' ? 'Custom Notes' : 'Archetype Skills', value: finalArchetype === 'Custom' ? 
          'Use karma to freely improve attributes and customize your character according to the Shadowrun 3rd Edition rulebook.' :
          archetypePackage.skills.join(', ')
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    
    // Save the character with the attribute allocation
    await character.save();
    
  } catch (error) {
    // If allocation fails, delete the character and inform the user
    await character.destroy();
    await interaction.reply({ content: `Error creating character: ${error.message}`, ephemeral: true });
  }
}

async function listShadowrunCharacters(interaction, userId) {
  const characters = await ShadowrunCharacter.findAll({
    where: { user_id: userId }
  });

  if (characters.length === 0) {
    return await interaction.reply({ content: 'You don\'t have any Shadowrun characters yet!', ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle('Your Shadowrun Characters')
    .setDescription(`You have ${characters.length} character(s):`);

  const fields = characters.map(char => ({
    name: char.name,
    value: `${char.race} ${char.archetype || 'Custom'} - Karma: ${char.karma}`,
    inline: false
  }));

  embed.addFields(fields);
  embed.setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function viewShadowrunCharacter(interaction, userId) {
  const characterName = interaction.options.getString('name');
  const character = await ShadowrunCharacter.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Shadowrun character not found!', ephemeral: true });
  }

  const racialMax = character.getRacialMaximums();
  const sheet = character.getCharacterSheet();
  const archetypePackage = character.getArchetypePackage();

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle(character.name)
    .setDescription(`${character.race} ${character.archetype || 'Custom Character'}`)
    .addFields(
      { name: 'Priority', value: character.priority ? `${character.priority}: ${character.priority_name || 'Unknown'}` : 'Not assigned', inline: true },
      { name: 'Attributes', value: `Body: ${sheet.attributes.body.current}/${sheet.attributes.body.max} | Quickness: ${sheet.attributes.quickness.current}/${sheet.attributes.quickness.max} | Strength: ${sheet.attributes.strength.current}/${sheet.attributes.strength.max}`, inline: false },
      { name: 'Mental', value: `Charisma: ${sheet.attributes.charisma.current}/${sheet.attributes.charisma.max} | Intelligence: ${sheet.attributes.intelligence.current}/${sheet.attributes.intelligence.max} | Willpower: ${sheet.attributes.willpower.current}/${sheet.attributes.willpower.max}`, inline: false },
      { name: 'Derived', value: `Essence: ${sheet.derived.essence} | Magic: ${sheet.derived.magic} | Initiative: ${sheet.derived.initiative} (${sheet.derived.initiativePasses} passes)`, inline: false },
      { name: 'Monitors', value: `Physical: ${sheet.derived.physicalMonitor} | Stun: ${sheet.derived.stunMonitor}`, inline: false },
      { name: 'Resources', value: `Karma: ${sheet.resources.karma} | Nuyen: ${sheet.resources.nuyen}`, inline: true },
      { name: 'Skill Points', value: `${character.getTotalSkillPointsUsed()}/${character.skill_points || 0}`, inline: true },
      { name: 'Skills Summary', value: character.getTotalSkillPointsUsed() > 0 ? 
        `Active: ${Object.keys(character.getActiveSkills()).length} | Knowledge: ${Object.keys(character.getKnowledgeSkills()).length} | Languages: ${Object.keys(character.getLanguageSkills()).length}` : 
        'No skills allocated', inline: true },
      { name: archetypePackage.isCustom ? 'Custom Notes' : 'Archetype Skills', value: archetypePackage.isCustom ? 
        'Use karma to freely improve attributes and customize your character.' :
        archetypePackage.skills.join(', ')
      , inline: false }
    )
    .setTimestamp();

  if (character.description) {
    embed.addFields({ name: 'Description', value: character.description, inline: false });
  }

  await interaction.reply({ embeds: [embed] });
}

async function deleteShadowrunCharacter(interaction, userId) {
  const characterName = interaction.options.getString('name');
  const character = await ShadowrunCharacter.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Shadowrun character not found!', ephemeral: true });
  }

  await character.destroy();

  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle('Character Deleted')
    .setDescription(`**${character.name}** has been deleted from your character roster.`)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function spendKarma(interaction, userId) {
  const characterName = interaction.options.getString('name');
  const attribute = interaction.options.getString('attribute');
  const amount = interaction.options.getInteger('amount');

  const character = await ShadowrunCharacter.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Shadowrun character not found!', ephemeral: true });
  }

  try {
    const result = character.spendKarma(attribute, amount);
    
    const embed = new EmbedBuilder()
      .setColor(0x00ffff)
      .setTitle('Karma Spent')
      .setDescription(`Successfully spent ${result.karmaSpent} karma on ${attribute}`)
      .addFields(
        { name: 'Character', value: character.name },
        { name: 'Attribute', value: attribute },
        { name: 'Rating Change', value: `${result.oldRating} → ${result.newRating}` },
        { name: 'Karma Spent', value: result.karmaSpent.toString() },
        { name: 'Remaining Karma', value: character.karma.toString() }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Save the updated character
    await character.save();

  } catch (error) {
    await interaction.reply({ content: error.message, ephemeral: true });
  }
}

async function showCharacterSheet(interaction, userId) {
  const characterName = interaction.options.getString('name');
  const character = await ShadowrunCharacter.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Shadowrun character not found!', ephemeral: true });
  }

  const enhancedEmbeds = new EnhancedEmbeds();
  const embeds = enhancedEmbeds.createCharacterSheet(character);
  
  // Add character action buttons
  const actionButtons = enhancedEmbeds.createCharacterActionButtons(character.id);
  
  await interaction.reply({ 
    embeds: embeds, 
    components: [actionButtons],
    ephemeral: false 
  });
}

async function allocateAttributes(interaction, userId) {
  const characterName = interaction.options.getString('name');
  const aAttributesStr = interaction.options.getString('a_attributes');
  const bAttributesStr = interaction.options.getString('b_attributes');
  const cAttributesStr = interaction.options.getString('c_attributes');
  const dAttributeStr = interaction.options.getString('d_attribute');

  const character = await ShadowrunCharacter.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Shadowrun character not found!', ephemeral: true });
  }

  // Parse attribute strings
  const aAttributes = aAttributesStr.split(',').map(attr => attr.trim().toLowerCase()).filter(attr => attr);
  const bAttributes = bAttributesStr.split(',').map(attr => attr.trim().toLowerCase()).filter(attr => attr);
  const cAttributes = cAttributesStr.split(',').map(attr => attr.trim().toLowerCase()).filter(attr => attr);
  const dAttribute = dAttributeStr.trim().toLowerCase() ? [dAttributeStr.trim().toLowerCase()] : [];

  try {
    const allocationResult = character.setAttributeAllocation(aAttributes, bAttributes, cAttributes, dAttribute);
    
    const embed = new EmbedBuilder()
      .setColor(0x00ffff)
      .setTitle('Attribute Points Allocated')
      .setDescription(`**${character.name}** attribute allocation updated successfully!`)
      .addFields(
        { name: 'A Attributes (6 points)', value: aAttributes.join(', ') || 'None allocated', inline: true },
        { name: 'B Attributes (5 points)', value: bAttributes.join(', ') || 'None allocated', inline: true },
        { name: 'C Attributes (4 points)', value: cAttributes.join(', ') || 'None allocated', inline: true },
        { name: 'D Attribute (3 points)', value: dAttribute[0] || 'None allocated', inline: true },
        { name: 'Current Attributes', value: `Body: ${character.body} | Quickness: ${character.quickness} | Strength: ${character.strength} | Charisma: ${character.charisma} | Intelligence: ${character.intelligence} | Willpower: ${character.willpower}`, inline: false },
        { name: 'Remaining Points', value: `A: ${allocationResult.remaining_a}, B: ${allocationResult.remaining_b}, C: ${allocationResult.remaining_c}, D: ${allocationResult.remaining_d}`, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    
    // Save the character with the new attribute allocation
    await character.save();
    
  } catch (error) {
    await interaction.reply({ content: `Error allocating attributes: ${error.message}`, ephemeral: true });
  }
}

async function allocateSkills(interaction, userId) {
  const characterName = interaction.options.getString('name');
  const skillName = interaction.options.getString('skill');
  const rating = interaction.options.getInteger('rating');

  const character = await ShadowrunCharacter.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Shadowrun character not found!', ephemeral: true });
  }

  if (!character.skill_points) {
    return await interaction.reply({ content: 'Character has no skill points allocated. Set priority first.', ephemeral: true });
  }

  try {
    const result = character.allocateSkillPoints(skillName, rating);
    
    const embed = new EmbedBuilder()
      .setColor(0x00ffff)
      .setTitle('Skill Points Allocated')
      .setDescription(`**${character.name}** skill rating updated successfully!`)
      .addFields(
        { name: 'Character', value: character.name, inline: true },
        { name: 'Skill', value: skillName, inline: true },
        { name: 'Rating', value: `${result.oldRating} → ${result.newRating}`, inline: true },
        { name: 'Total Skill Points Used', value: character.getTotalSkillPointsUsed().toString(), inline: true },
        { name: 'Available Skill Points', value: (character.skill_points - character.getTotalSkillPointsUsed()).toString(), inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    
    // Save the character with the new skill allocation
    await character.save();
    
  } catch (error) {
    await interaction.reply({ content: `Error allocating skill points: ${error.message}`, ephemeral: true });
  }
}

async function listSkills(interaction, userId) {
  // Create a temporary character to access skills
  const tempCharacter = {
    getAllSkills: function() {
      return {
        combat: [
          'assaultrifles', 'clubs', 'cyberimplantcombat', 'edgedweapons', 'gunnery',
          'heavyweapons', 'laserweapons', 'launchweapons', 'pistols', 'polearms',
          'projectileweapons', 'rifles', 'shotguns', 'submachineguns', 'throwingweapons',
          'unarmedcombat', 'underwatercombat', 'whips'
        ],
        magical: [
          'aurareading', 'sorcery', 'conjuring'
        ],
        physical: [
          'athletics', 'diving', 'stealth'
        ],
        social: [
          'etiquette', 'instruction', 'interrogation', 'intimidation', 'leadership', 'negotiation'
        ],
        technical: [
          'biotech', 'computer', 'demolitions', 'electronics'
        ],
        vehicle: [
          'bike', 'car', 'fixedwingaircraft', 'hovercraft', 'ltaaircraft', 'motorboat',
          'rotoraircraft', 'sailboat', 'ship', 'submarine', 'vectorthrustaircraft'
        ]
      };
    }
  };

  const allSkills = tempCharacter.getAllSkills();
  
  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle('Shadowrun 3rd Edition Skills')
    .setDescription('All available skills organized by category');

  // Add fields for each skill category
  const categories = [
    { name: 'Combat Skills', skills: allSkills.combat, emoji: '⚔️' },
    { name: 'Magical Skills', skills: allSkills.magical, emoji: '🔮' },
    { name: 'Physical Skills', skills: allSkills.physical, emoji: '💪' },
    { name: 'Social Skills', skills: allSkills.social, emoji: '🗣️' },
    { name: 'Technical Skills', skills: allSkills.technical, emoji: '🔧' },
    { name: 'Vehicle Skills', skills: allSkills.vehicle, emoji: '🚗' }
  ];

  categories.forEach(category => {
    const skillsList = category.skills.slice(0, 10).join(', ') + 
                      (category.skills.length > 10 ? '...' : '');
    embed.addFields({
      name: `${category.emoji} ${category.name}`,
      value: skillsList,
      inline: false
    });
  });

  embed.setTimestamp();
  embed.addFields({
    name: 'Usage',
    value: 'Use `/character allocate-skills <character> <skill> <rating>` to allocate skill points (0-6)',
    inline: false
  });

  await interaction.reply({ embeds: [embed] });
}

async function showSkills(interaction, userId) {
  const characterName = interaction.options.getString('name');
  const character = await ShadowrunCharacter.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Shadowrun character not found!', ephemeral: true });
  }

  const categorizedSkills = character.getSkillsByCategory();
  const allSkills = character.getAllSkills();
  
  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle(`${character.name} - Detailed Skills Breakdown`)
    .setDescription(`${character.race} ${character.archetype || 'Custom Character'} - Priority: ${character.priority || 'Not assigned'}`);

  // Active Skills
  const activeFields = [];
  Object.entries(categorizedSkills.active).forEach(([category, skills]) => {
    if (Object.keys(skills).length > 0) {
      const skillList = Object.entries(skills)
        .map(([skill, rating]) => `${skill}(${rating})`)
        .join(', ');
      activeFields.push({ name: `${category.charAt(0).toUpperCase() + category.slice(1)} Skills`, value: skillList, inline: false });
    }
  });
  
  activeFields.forEach(field => embed.addFields(field));

  // Knowledge Skills
  if (Object.keys(categorizedSkills.knowledge).length > 0) {
    const knowledgeList = Object.entries(categorizedSkills.knowledge)
      .map(([skill, rating]) => `${skill}(${rating})`)
      .join(', ');
    embed.addFields({ 
      name: 'Knowledge Skills', 
      value: knowledgeList, 
      inline: false 
    });
  } else {
    embed.addFields({ 
      name: 'Knowledge Skills', 
      value: 'No knowledge skills allocated', 
      inline: false 
    });
  }

  // Language Skills
  if (Object.keys(categorizedSkills.languages).length > 0) {
    const languageList = Object.entries(categorizedSkills.languages)
      .map(([skill, rating]) => `${skill}(${rating})`)
      .join(', ');
    embed.addFields({ 
      name: 'Language Skills', 
      value: languageList, 
      inline: false 
    });
  } else {
    embed.addFields({ 
      name: 'Language Skills', 
      value: 'No language skills allocated', 
      inline: false 
    });
  }

  // Build/Repair Skills
  if (Object.keys(categorizedSkills.buildrepair).length > 0) {
    const brFields = [];
    Object.entries(categorizedSkills.buildrepair).forEach(([category, skills]) => {
      if (Object.keys(skills).length > 0) {
        const skillList = Object.entries(skills)
          .map(([skill, rating]) => `${skill}(${rating})`)
          .join(', ');
        brFields.push({ name: `${category} Build/Repair`, value: skillList, inline: true });
      }
    });
    brFields.forEach(field => embed.addFields(field));
  }

  // Resources and summary
  embed.addFields(
    { 
      name: 'Skill Resources', 
      value: `Points Used: ${character.getTotalSkillPointsUsed()}/${character.skill_points || 0}`, 
      inline: true 
    },
    { 
      name: 'Total Skills', 
      value: `${Object.keys(character.skills || {}).length} skills learned`, 
      inline: true 
    }
  );

  embed.setTimestamp();
  await interaction.reply({ embeds: [embed] });
}

async function startCombat(interaction, userId) {
  const characterName = interaction.options.getString('name');
  const character = await ShadowrunCharacter.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Shadowrun character not found!', ephemeral: true });
  }

  // Check if combat is already active
  const existingCombat = await ShadowrunCombat.findOne({
    where: { character_id: character.id, is_active: true }
  });

  if (existingCombat) {
    return await interaction.reply({ content: 'Character is already in combat!', ephemeral: true });
  }

  // Create new combat session
  const combat = await ShadowrunCombat.create({
    session_id: Date.now().toString(),
    character_id: character.id,
    combat_pool: Math.floor((character.reaction + character.intelligence) / 2) + 2,
    physical_monitor: (character.body * 2) + 8,
    stun_monitor: (character.willpower * 2) + 8
  });

  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle(`${character.name} - Combat Started`)
    .setDescription('Combat encounter initiated!')
    .addFields(
      { name: 'Character', value: character.name, inline: true },
      { name: 'Combat Pool', value: combat.combat_pool.toString(), inline: true },
      { name: 'Physical Monitor', value: `${combat.physical_damage}/${combat.physical_monitor}`, inline: true },
      { name: 'Stun Monitor', value: `${combat.stun_damage}/${combat.stun_monitor}`, inline: true },
      { name: 'Status', value: 'Ready for initiative roll', inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function rollInitiative(interaction, userId) {
  const characterName = interaction.options.getString('name');
  const character = await ShadowrunCharacter.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Shadowrun character not found!', ephemeral: true });
  }

  const combat = await ShadowrunCombat.findOne({
    where: { character_id: character.id, is_active: true }
  });

  if (!combat) {
    return await interaction.reply({ content: 'No active combat session found. Start combat first!', ephemeral: true });
  }

  // Calculate initiative
  const initiativeResult = combat.calculateInitiative();
  combat.initiative = initiativeResult.total;
  combat.initiative_passes = initiativeResult.passes;
  
  await combat.save();

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle(`${character.name} - Initiative Roll`)
    .setDescription('Combat initiative calculated!')
    .addFields(
      { name: 'Character', value: character.name, inline: true },
      { name: 'Reaction', value: character.reaction.toString(), inline: true },
      { name: 'Intuition', value: character.intuition.toString(), inline: true },
      { name: 'Initiative Dice', value: initiativeResult.dice.toString(), inline: true },
      { name: 'Total Initiative', value: initiativeResult.total.toString(), inline: true },
      { name: 'Initiative Passes', value: initiativeResult.passes.toString(), inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function makeAttack(interaction, userId) {
  const characterName = interaction.options.getString('name');
  const skillName = interaction.options.getString('skill');
  const targetName = interaction.options.getString('target');
  const accuracy = interaction.options.getInteger('accuracy') || 0;

  const character = await ShadowrunCharacter.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Shadowrun character not found!', ephemeral: true });
  }

  const combat = await ShadowrunCombat.findOne({
    where: { character_id: character.id, is_active: true }
  });

  if (!combat) {
    return await interaction.reply({ content: 'No active combat session found. Start combat first!', ephemeral: true });
  }

  // Simulate target (for now)
  const target = {
    reaction: 3,
    intuition: 3
  };

  // Use the combat dice system
  const ShadowrunCombatDice = require('../utils/ShadowrunCombatDice');
  const attackResult = ShadowrunCombatDice.rollAttackTest(character, skillName, accuracy, target.reaction + target.intelligence);

  // Log the action
  combat.addActionToLog({
    type: 'attack',
    skill: skillName,
    target: targetName,
    accuracy: accuracy,
    result: attackResult
  });

  // Update combat pool if used
  if (attackResult.defense.successes > 0) {
    combat.combat_pool_defense += attackResult.defense.successes;
    combat.combat_pool_remaining = combat.combat_pool - combat.combat_pool_offense - combat.combat_pool_defense;
  }

  await combat.save();

  const embed = new EmbedBuilder()
    .setColor(0xff6600)
    .setTitle(`${character.name} - Attack Roll`)
    .setDescription(`${character.name} attacks ${targetName} with ${skillName}!`)
    .addFields(
      { name: 'Character', value: character.name, inline: true },
      { name: 'Skill', value: skillName, inline: true },
      { name: 'Target', value: targetName, inline: true },
      { name: 'Attack Pool', value: attackResult.attack.pool.toString(), inline: true },
      { name: 'Attack Successes', value: attackResult.attack.successes.toString(), inline: true },
      { name: 'Defense Successes', value: attackResult.defense.successes.toString(), inline: true },
      { name: 'Net Successes', value: attackResult.netSuccesses.toString(), inline: true },
      { name: 'Hit Result', value: attackResult.hit ? 'HIT!' : 'Miss', inline: true },
      { name: 'Combat Pool Remaining', value: combat.combat_pool_remaining.toString(), inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function showCombatStatus(interaction, userId) {
  const characterName = interaction.options.getString('name');
  const character = await ShadowrunCharacter.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Shadowrun character not found!', ephemeral: true });
  }

  const combat = await ShadowrunCombat.findOne({
    where: { character_id: character.id, is_active: true }
  });

  if (!combat) {
    return await interaction.reply({ content: 'No active combat session found.', ephemeral: true });
  }

  const status = combat.getCombatStatus();

  const embed = new EmbedBuilder()
    .setColor(0x0000ff)
    .setTitle(`${character.name} - Combat Status`)
    .setDescription('Current combat state')
    .addFields(
      { name: 'Initiative', value: status.initiative.toString(), inline: true },
      { name: 'Initiative Passes', value: status.passes.toString(), inline: true },
      { name: 'Combat Pool', value: status.combat_pool.total.toString(), inline: true },
      { name: 'Offensive Pool', value: status.combat_pool.offense.toString(), inline: true },
      { name: 'Defensive Pool', value: status.combat_pool.defense.toString(), inline: true },
      { name: 'Pool Remaining', value: status.combat_pool.remaining.toString(), inline: true },
      { name: 'Physical Damage', value: `${status.condition_monitor.physical.current}/${status.condition_monitor.physical.max}`, inline: true },
      { name: 'Stun Damage', value: `${status.condition_monitor.stun.current}/${status.condition_monitor.stun.max}`, inline: true },
      { name: 'Status', value: status.is_active ? 'Active' : 'Inactive', inline: true },
      { name: 'Phase', value: status.phase, inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
async function applyDamage(interaction, userId) {
  const characterName = interaction.options.getString('name');
  const damageAmount = interaction.options.getInteger('damage');
  const damageType = interaction.options.getString('type');

  const character = await ShadowrunCharacter.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Shadowrun character not found!', ephemeral: true });
  }

  const combat = await ShadowrunCombat.findOne({
    where: { character_id: character.id, is_active: true }
  });

  if (!combat) {
    return await interaction.reply({ content: 'No active combat session found. Start combat first!', ephemeral: true });
  }

  const damageResult = combat.sufferDamage(damageAmount, damageType);

  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle(`${character.name} - Damage Applied`)
    .setDescription(`${damageAmount}  damage applied!`)
    .addFields(
      { name: 'Character', value: character.name, inline: true },
      { name: 'Damage Type', value: damageType, inline: true },
      { name: 'Damage Amount', value: damageAmount.toString(), inline: true },
      { name: 'Result', value: damageResult.result, inline: true },
      { name: 'Total Damage', value: damageResult.total_damage.toString(), inline: true },
      { name: 'Status', value: combat.is_active ? 'Active' : 'Inactive', inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function healDamage(interaction, userId) {
  const characterName = interaction.options.getString('name');
  const healAmount = interaction.options.getInteger('damage');
  const damageType = interaction.options.getString('type');

  const character = await ShadowrunCharacter.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Shadowrun character not found!', ephemeral: true });
  }

  const combat = await ShadowrunCombat.findOne({
    where: { character_id: character.id, is_active: true }
  });

  if (!combat) {
    return await interaction.reply({ content: 'No active combat session found. Start combat first!', ephemeral: true });
  }

  const healResult = combat.healDamage(healAmount, damageType);

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle(`${character.name} - Healing Applied`)
    .setDescription(`${healAmount}  damage healed!`)
    .addFields(
      { name: 'Character', value: character.name, inline: true },
      { name: 'Heal Amount', value: healAmount.toString(), inline: true },
      { name: 'Damage Type', value: damageType, inline: true },
      { name: 'Remaining Damage', value: healResult.remaining_damage.toString(), inline: true },
      { name: 'Status', value: combat.is_active ? 'Active' : 'Inactive', inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function manageCombatPool(interaction, userId) {
  const characterName = interaction.options.getString('name');
  const action = interaction.options.getString('action');
  const offense = interaction.options.getInteger('offense') || 0;
  const defense = interaction.options.getInteger('defense') || 0;

  const character = await ShadowrunCharacter.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Shadowrun character not found!', ephemeral: true });
  }

  const combat = await ShadowrunCombat.findOne({
    where: { character_id: character.id, is_active: true }
  });

  if (!combat) {
    return await interaction.reply({ content: 'No active combat session found. Start combat first!', ephemeral: true });
  }

  if (action === 'allocate') {
    try {
      const allocation = combat.allocateCombatPool(offense, defense);
      
      const embed = new EmbedBuilder()
        .setColor(0x0066ff)
        .setTitle(`${character.name} - Combat Pool Allocated`)
        .setDescription('Combat pool points allocated successfully!')
        .addFields(
          { name: 'Character', value: character.name, inline: true },
          { name: 'Offense Points', value: allocation.offense.toString(), inline: true },
          { name: 'Defense Points', value: allocation.defense.toString(), inline: true },
          { name: 'Remaining Points', value: allocation.remaining.toString(), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: error.message, ephemeral: true });
    }
  } else if (action === 'reset') {
    const reset = combat.resetCombatPool();
    
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`${character.name} - Combat Pool Reset`)
      .setDescription('Combat pool points reset successfully!')
      .addFields(
        { name: 'Character', value: character.name, inline: true },
        { name: 'Total Pool', value: reset.total.toString(), inline: true },
        { name: 'Remaining Points', value: reset.remaining.toString(), inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}

async function endCombat(interaction, userId) {
  const characterName = interaction.options.getString('name');

  const character = await ShadowrunCharacter.findOne({
    where: { name: characterName, user_id: userId }
  });

  if (!character) {
    return await interaction.reply({ content: 'Shadowrun character not found!', ephemeral: true });
  }

  const combat = await ShadowrunCombat.findOne({
    where: { character_id: character.id, is_active: true }
  });

  if (!combat) {
    return await interaction.reply({ content: 'No active combat session found.', ephemeral: true });
  }

  const endResult = combat.endCombat();
  const status = combat.getCombatStatus();

  const embed = new EmbedBuilder()
    .setColor(0x660000)
    .setTitle(`${character.name} - Combat Ended`)
    .setDescription('Combat session concluded!')
    .addFields(
      { name: 'Character', value: character.name, inline: true },
      { name: 'Final Status', value: endResult.status, inline: true },
      { name: 'Physical Damage', value: `${status.condition_monitor.physical.current}/${status.condition_monitor.physical.max}`, inline: true },
      { name: 'Stun Damage', value: `${status.condition_monitor.stun.current}/${status.condition_monitor.stun.max}`, inline: true },
      { name: 'Final Initiative', value: status.initiative.toString(), inline: true },
      { name: 'Combat Actions', value: combat.combat_log ? combat.combat_log.length.toString() : '0', inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

