const { SlashCommandBuilder } = require('discord.js');
const { ShadowrunCharacter } = require('../models');
const { ShadowrunDice } = require('../utils/ShadowrunDice');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

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
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list-shadowrun')
        .setDescription('List all your Shadowrun characters'))
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
            .setRequired(true))),

  async execute(interaction, commands) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    try {
      switch (subcommand) {
        case 'create-shadowrun':
          await createShadowrunCharacter(interaction, userId);
          break;
        case 'list-shadowrun':
          await listShadowrunCharacters(interaction, userId);
          break;
        case 'view-shadowrun':
          await viewShadowrunCharacter(interaction, userId);
          break;
        case 'delete-shadowrun':
          await deleteShadowrunCharacter(interaction, userId);
          break;
        case 'spend-karma':
          await spendKarma(interaction, userId);
          break;
        case 'show-sheet':
          await showCharacterSheet(interaction, userId);
          break;
        case 'allocate-attributes':
          await allocateAttributes(interaction, userId);
          break;
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
    karma: startingKarma[race] || 0,
    user_id: userId,
    guild_id: interaction.guild.id
  });

  // Set up default attribute allocation based on archetype recommendations
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
      { name: 'Attributes', value: `Body: ${sheet.attributes.body.current}/${sheet.attributes.body.max} | Quickness: ${sheet.attributes.quickness.current}/${sheet.attributes.quickness.max} | Strength: ${sheet.attributes.strength.current}/${sheet.attributes.strength.max}`, inline: false },
      { name: 'Mental', value: `Charisma: ${sheet.attributes.charisma.current}/${sheet.attributes.charisma.max} | Intelligence: ${sheet.attributes.intelligence.current}/${sheet.attributes.intelligence.max} | Willpower: ${sheet.attributes.willpower.current}/${sheet.attributes.willpower.max}`, inline: false },
      { name: 'Derived', value: `Essence: ${sheet.derived.essence} | Magic: ${sheet.derived.magic} | Initiative: ${sheet.derived.initiative} (${sheet.derived.initiativePasses} passes)`, inline: false },
      { name: 'Monitors', value: `Physical: ${sheet.derived.physicalMonitor} | Stun: ${sheet.derived.stunMonitor}`, inline: false },
      { name: 'Resources', value: `Karma: ${sheet.resources.karma} | Nuyen: ${sheet.resources.nuyen}`, inline: false },
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

  const sheet = character.getCharacterSheet();

  const archetypePackage = character.getArchetypePackage();
  
  const embed = new EmbedBuilder()
    .setColor(0x0080ff)
    .setTitle(`${sheet.name} - Shadowrun Character Sheet`)
    .setDescription(`${sheet.race} ${sheet.archetype || 'Custom Character'}`)
    .addFields(
      { name: 'Attributes', value: `Body: ${sheet.attributes.body.current}/${sheet.attributes.body.max} | Quickness: ${sheet.attributes.quickness.current}/${sheet.attributes.quickness.max} | Strength: ${sheet.attributes.strength.current}/${sheet.attributes.strength.max}`, inline: true },
      { name: 'Mental', value: `Charisma: ${sheet.attributes.charisma.current}/${sheet.attributes.charisma.max} | Intelligence: ${sheet.attributes.intelligence.current}/${sheet.attributes.intelligence.max} | Willpower: ${sheet.attributes.willpower.current}/${sheet.attributes.willpower.max}`, inline: true },
      { name: 'Attribute Allocation', value: `A: ${sheet.attributeAllocation.a_attributes.join(', ') || 'None'} | B: ${sheet.attributeAllocation.b_attributes.join(', ') || 'None'} | C: ${sheet.attributeAllocation.c_attributes.join(', ') || 'None'} | D: ${sheet.attributeAllocation.d_attribute[0] || 'None'}`, inline: true },
      { name: 'Derived Stats', value: `Essence: ${sheet.derived.essence} | Magic: ${sheet.derived.magic} | Reaction: ${sheet.attributes.reaction.current}/${sheet.attributes.reaction.max}`, inline: true },
      { name: 'Combat', value: `Initiative: ${sheet.derived.initiative} (${sheet.derived.initiativePasses} passes) | Physical Monitor: ${sheet.derived.physicalMonitor} | Stun Monitor: ${sheet.derived.stunMonitor}`, inline: true },
      { name: 'Resources', value: `Karma: ${sheet.resources.karma} | Nuyen: ${sheet.resources.nuyen}`, inline: true },
      { name: archetypePackage.isCustom ? 'Custom Notes' : 'Recommended Attributes', value: archetypePackage.isCustom ? 
        'Use karma to freely improve attributes and customize your character according to the Shadowrun 3rd Edition rulebook.' :
        archetypePackage.skills.join(', ')
      , inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
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