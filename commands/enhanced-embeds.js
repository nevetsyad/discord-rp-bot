const Discord = require('discord.js');

const EmbedCtor = Discord.EmbedBuilder || Discord.MessageEmbed;
const ActionRowCtor = Discord.ActionRowBuilder || Discord.MessageActionRow;
const ButtonCtor = Discord.ButtonBuilder || Discord.MessageButton;
const ButtonStyle = Discord.ButtonStyle || {
  Primary: 'PRIMARY',
  Secondary: 'SECONDARY',
  Success: 'SUCCESS'
};

/**
 * Enhanced embed utilities for better UI presentation
 */
class EnhancedEmbeds {
  constructor() {
    // Color palette for different content types
    this.colors = {
      primary: 0x0080ff,      // Blue for main character info
      success: 0x00ff00,      // Green for successful actions
      warning: 0xffff00,      // Yellow for warnings/caution
      error: 0xff0000,        // Red for errors/failures
      magic: 0x9932cc,        // Purple for magic-related content
      matrix: 0x00ff80,      // Teal for matrix/cyber content
      combat: 0xff4500,      // Orange/red for combat
      info: 0x4169e1,         // Royal blue for information
      gear: 0x8b4513,         // Brown for equipment/gear
      cyberware: 0xff6347     // Tomato for cyberware
    };
  }

  /**
   * Create a beautifully formatted character sheet with multiple embeds
   */
  createCharacterSheet(character) {
    const sheet = character.getCharacterSheet();
    const archetypePackage = character.getArchetypePackage();
    
    // Main character info embed
    const mainEmbed = new EmbedCtor()
      .setColor(this.colors.primary)
      .setTitle(`🎭 ${sheet.name} - Shadowrun Character Sheet`)
      .setDescription(`${sheet.race} ${sheet.archetype || 'Custom Character'}`)
      .setThumbnail('https://i.imgur.com/MBQjR5v.png') // Shadowrun-style icon placeholder
      .addFields(
        { name: '🎯 Core Identity', value: `${archetypePackage.isCustom ? 'Custom Character' : archetypePackage.name}`, inline: true },
        { name: '⭐ Priority Level', value: character.priority || 'E', inline: true },
        { name: '🌟 Karma Points', value: sheet.resources.karma.toString(), inline: true },
        { name: '💰 Nuyen', value: this.formatNuyen(sheet.resources.nuyen), inline: true }
      )
      .setTimestamp();

    // Attributes embed
    const attributesEmbed = new EmbedCtor()
      .setColor(this.colors.success)
      .setTitle('🏋️ Physical Attributes')
      .setDescription('Natural physical capabilities')
      .addFields(
        { name: 'Body', value: `${this.createProgressBar(sheet.attributes.body.current, sheet.attributes.body.max)} ${sheet.attributes.body.current}/${sheet.attributes.body.max}`, inline: true },
        { name: 'Quickness', value: `${this.createProgressBar(sheet.attributes.quickness.current, sheet.attributes.quickness.max)} ${sheet.attributes.quickness.current}/${sheet.attributes.quickness.max}`, inline: true },
        { name: 'Strength', value: `${this.createProgressBar(sheet.attributes.strength.current, sheet.attributes.strength.max)} ${sheet.attributes.strength.current}/${sheet.attributes.strength.max}`, inline: true },
        { name: 'Reaction', value: `${this.createProgressBar(sheet.attributes.reaction.current, sheet.attributes.reaction.max)} ${sheet.attributes.reaction.current}/${sheet.attributes.reaction.max}`, inline: true }
      )
      .setTimestamp();

    // Mental attributes embed
    const mentalEmbed = new EmbedCtor()
      .setColor(this.colors.magic)
      .setTitle('🧠 Mental Attributes')
      .setDescription('Cognitive and social capabilities')
      .addFields(
        { name: 'Charisma', value: `${this.createProgressBar(sheet.attributes.charisma.current, sheet.attributes.charisma.max)} ${sheet.attributes.charisma.current}/${sheet.attributes.charisma.max}`, inline: true },
        { name: 'Intelligence', value: `${this.createProgressBar(sheet.attributes.intelligence.current, sheet.attributes.intelligence.max)} ${sheet.attributes.intelligence.current}/${sheet.attributes.intelligence.max}`, inline: true },
        { name: 'Willpower', value: `${this.createProgressBar(sheet.attributes.willpower.current, sheet.attributes.willpower.max)} ${sheet.attributes.willpower.current}/${sheet.attributes.willpower.max}`, inline: true }
      )
      .setTimestamp();

    // Derived stats embed
    const derivedEmbed = new EmbedCtor()
      .setColor(this.colors.matrix)
      .setTitle('⚡ Derived Statistics')
      .setDescription('Calculated from base attributes')
      .addFields(
        { name: '🌊 Essence', value: sheet.derived.essence.toString(), inline: true },
        { name: '✨ Magic', value: sheet.derived.magic.toString(), inline: true },
        { name: '🎯 Initiative', value: `${sheet.derived.initiative} (${sheet.derived.initiativePasses} passes)`, inline: true },
        { name: '🛡️ Physical Monitor', value: `${this.createMonitorBar(sheet.derived.physicalMonitor.current, sheet.derived.physicalMonitor.max)}`, inline: true },
        { name: '⚡ Stun Monitor', value: `${this.createMonitorBar(sheet.derived.stunMonitor.current, sheet.derived.stunMonitor.max)}`, inline: true }
      )
      .setTimestamp();

    // Skills overview embed
    const skillsEmbed = new EmbedCtor()
      .setColor(this.colors.cyberware)
      .setTitle('🎭 Skills Overview')
      .addFields(
        { name: '💎 Skill Points', value: `${character.getTotalSkillPointsUsed()}/${character.skill_points || 0}`, inline: true },
        { name: '🎲 Combat Points', value: `${character.combat_pool || 0} available`, inline: true },
        { name: '📊 Skills Allocated', value: character.getTotalSkillPointsUsed() > 0 ? 'See detailed skills below' : 'No skills allocated yet', inline: false }
      )
      .setTimestamp();

    // Attribute allocation embed
    const allocationEmbed = new EmbedCtor()
      .setColor(this.colors.info)
      .setTitle('📋 Attribute Allocation')
      .setDescription('Current attribute point distribution')
      .addFields(
        { name: '🏆 A Attributes (6 pts)', value: sheet.attributeAllocation.a_attributes.join(', ') || 'None', inline: true },
        { name: '🥈 B Attributes (5 pts)', value: sheet.attributeAllocation.b_attributes.join(', ') || 'None', inline: true },
        { name: '🥉 C Attributes (4 pts)', value: sheet.attributeAllocation.c_attributes.join(', ') || 'None', inline: true },
        { name: '🎖️ D Attribute (1 pt)', value: sheet.attributeAllocation.d_attribute[0] || 'None', inline: true }
      )
      .setTimestamp();

    // Combat overview embed
    const combatEmbed = new EmbedCtor()
      .setColor(this.colors.combat)
      .setTitle('⚔️ Combat Readiness')
      .setDescription('Combat capabilities and status')
      .addFields(
        { name: '🗡️ Attack', value: `${this.calculateAttack(character)}`, inline: true },
        { name: '🛡️ Defense', value: `${this.calculateDefense(character)}`, inline: true },
        { name: '🎯 Accuracy', value: `${this.calculateAccuracy(character)}`, inline: true },
        { name: '💨 Speed', value: `${this.calculateSpeed(character)}`, inline: true }
      )
      .setTimestamp();

    return [mainEmbed, attributesEmbed, mentalEmbed, derivedEmbed, skillsEmbed, allocationEmbed, combatEmbed];
  }

  /**
   * Create a progress bar for visual representation
   */
  createProgressBar(current, max) {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    const filled = Math.round((percentage / 100) * 10);
    const empty = 10 - filled;
    
    const filledBar = '█'.repeat(filled);
    const emptyBar = '░'.repeat(empty);
    
    return `${filledBar}${emptyBar} ${Math.round(percentage)}%`;
  }

  /**
   * Create a damage monitor bar
   */
  createMonitorBar(current, max) {
    const filled = current;
    const empty = max - current;
    
    const filledBar = '█'.repeat(filled);
    const emptyBar = '░'.repeat(empty);
    
    return `${filledBar}${emptyBar} ${current}/${max}`;
  }

  /**
   * Calculate attack value
   */
  calculateAttack(character) {
    const sheet = character.getCharacterSheet();
    const baseAttack = Math.floor(sheet.attributes.strength.current / 2) + Math.floor(sheet.attributes.quickness.current / 2);
    return `${baseAttack} (Base)`;
  }

  /**
   * Calculate defense value
   */
  calculateDefense(character) {
    const sheet = character.getCharacterSheet();
    const baseDefense = Math.floor(sheet.attributes.reaction.current / 2) + Math.floor(sheet.attributes.quickness.current / 2);
    return `${baseDefense} (Base)`;
  }

  /**
   * Calculate accuracy
   */
  calculateAccuracy(character) {
    const sheet = character.getCharacterSheet();
    const baseAccuracy = Math.floor(sheet.attributes.intelligence.current / 2) + Math.floor(sheet.attributes.reaction.current / 2);
    return `${baseAccuracy} (Base)`;
  }

  /**
   * Calculate speed
   */
  calculateSpeed(character) {
    const sheet = character.getCharacterSheet();
    const baseSpeed = Math.floor(sheet.attributes.quickness.current / 2) + Math.floor(sheet.attributes.strength.current / 2);
    return `${baseSpeed} (Base)`;
  }

  /**
   * Format nuyen with proper styling
   */
  formatNuyen(amount) {
    if (amount >= 1000000) {
      return `💎${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `💰${(amount / 1000).toFixed(1)}K`;
    }
    return `💰${amount}`;
  }

  /**
   * Create a success embed with consistent styling
   */
  createSuccessEmbed(title, description, fields = []) {
    return new EmbedCtor()
      .setColor(this.colors.success)
      .setTitle(`✅ ${title}`)
      .setDescription(description)
      .addFields(fields)
      .setTimestamp();
  }

  /**
   * Create an error embed with consistent styling
   */
  createErrorEmbed(title, description, fields = []) {
    return new EmbedCtor()
      .setColor(this.colors.error)
      .setTitle(`❌ ${title}`)
      .setDescription(description)
      .addFields(fields)
      .setTimestamp();
  }

  /**
   * Create a warning embed with consistent styling
   */
  createWarningEmbed(title, description, fields = []) {
    return new EmbedCtor()
      .setColor(this.colors.warning)
      .setTitle(`⚠️ ${title}`)
      .setDescription(description)
      .addFields(fields)
      .setTimestamp();
  }

  /**
   * Create an info embed with consistent styling
   */
  createInfoEmbed(title, description, fields = []) {
    return new EmbedCtor()
      .setColor(this.colors.info)
      .setTitle(`ℹ️ ${title}`)
      .setDescription(description)
      .addFields(fields)
      .setTimestamp();
  }

  /**
   * Create pagination buttons for long content
   */
  createPaginationButtons(page, totalPages, customId) {
    const row = new ActionRowCtor();
    
    // Previous button
    const prevButton = new ButtonCtor()
      .setCustomId(`${customId}_prev_${page}`)
      .setLabel('⬅️ Previous')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 1);
    
    // Page info
    const pageButton = new ButtonCtor()
      .setCustomId(`${customId}_page_${page}`)
      .setLabel(`Page ${page} of ${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);
    
    // Next button
    const nextButton = new ButtonCtor()
      .setCustomId(`${customId}_next_${page}`)
      .setLabel('Next ➡️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === totalPages);
    
    row.addComponents(prevButton, pageButton, nextButton);
    
    return row;
  }

  /**
   * Create action buttons for character management
   */
  createCharacterActionButtons(characterId) {
    const row = new ActionRowCtor();
    
    const viewButton = new ButtonCtor()
      .setCustomId(`view_char_${characterId}`)
      .setLabel('📋 View Sheet')
      .setStyle(ButtonStyle.Primary);
    
    const editButton = new ButtonCtor()
      .setCustomId(`edit_char_${characterId}`)
      .setLabel('✏️ Edit')
      .setStyle(ButtonStyle.Secondary);
    
    const combatButton = new ButtonCtor()
      .setCustomId(`combat_char_${characterId}`)
      .setLabel('⚔️ Start Combat')
      .setStyle(ButtonStyle.Success);
    
    row.addComponents(viewButton, editButton, combatButton);
    
    return row;
  }
}

module.exports = EnhancedEmbeds;