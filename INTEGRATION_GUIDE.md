/**
 * Example: How to integrate InputValidation into command handlers
 * 
 * This example shows how to update the character.js command
 * to use the new InputValidation utility.
 */

const { SlashCommandBuilder } = require('discord.js');
const { Character } = require('../database');
const InputValidation = require('../utils/inputValidation');
const EnhancedErrorHandling = require('./enhanced-error-handling');

// Example updated command handler with validation
async function createCharacter(interaction, userId) {
  const errorHandler = new EnhancedErrorHandling();

  try {
    // Get raw inputs
    const rawName = interaction.options.getString('name');
    const rawDescription = interaction.options.getString('description');
    const rawPersonality = interaction.options.getString('personality');
    const rawAppearance = interaction.options.getString('appearance');
    const rawBackstory = interaction.options.getString('backstory');
    const rawSkills = interaction.options.getString('skills');

    // ✅ Validate and sanitize all inputs
    const nameValidation = InputValidation.validateCharacterName(rawName);
    if (nameValidation.error) {
      return await interaction.reply({
        content: `❌ Invalid character name: ${nameValidation.error.message}`,
        ephemeral: true
      });
    }

    const descValidation = InputValidation.validateDescription(rawDescription);
    if (descValidation.error) {
      return await interaction.reply({
        content: `❌ Invalid description: ${descValidation.error.message}`,
        ephemeral: true
      });
    }

    const personalityValidation = InputValidation.validateDescription(rawPersonality);
    if (personalityValidation.error) {
      return await interaction.reply({
        content: `❌ Invalid personality: ${personalityValidation.error.message}`,
        ephemeral: true
      });
    }

    const appearanceValidation = InputValidation.validateDescription(rawAppearance);
    if (appearanceValidation.error) {
      return await interaction.reply({
        content: `❌ Invalid appearance: ${appearanceValidation.error.message}`,
        ephemeral: true
      });
    }

    const backstoryValidation = InputValidation.validateBackstory(rawBackstory);
    if (backstoryValidation.error) {
      return await interaction.reply({
        content: `❌ Invalid backstory: ${backstoryValidation.error.message}`,
        ephemeral: true
      });
    }

    const skillsValidation = InputValidation.validateDescription(rawSkills);
    if (skillsValidation.error) {
      return await interaction.reply({
        content: `❌ Invalid skills: ${skillsValidation.error.message}`,
        ephemeral: true
      });
    }

    // Use sanitized values
    const name = nameValidation.value;
    const description = descValidation.value;
    const personality = personalityValidation.value;
    const appearance = appearanceValidation.value;
    const backstory = backstoryValidation.value;
    const skills = skillsValidation.value;

    // Check if character already exists
    const existingCharacter = await Character.findOne({
      where: { name, user_id: userId }
    });

    if (existingCharacter) {
      return await interaction.reply({
        content: 'A character with this name already exists!',
        ephemeral: true
      });
    }

    // Create character with validated/sanitized data
    const character = await Character.create({
      name,
      description,
      personality,
      appearance,
      backstory,
      skills,
      user_id: userId,
      guild_id: interaction.guild.id
    });

    // ... rest of the function

  } catch (error) {
    await errorHandler.handleCommandError(interaction, error, 'character create');
  }
}

// Example: Shadowrun character creation with validation
async function createShadowrunCharacter(interaction, userId) {
  const errorHandler = new EnhancedErrorHandling();

  try {
    // Get raw inputs
    const rawName = interaction.options.getString('name');
    const rawRace = interaction.options.getString('race');
    const rawPriority = interaction.options.getString('priority');
    const rawArchetype = interaction.options.getString('archetype');

    // ✅ Validate all inputs
    const nameValidation = InputValidation.validateCharacterName(rawName);
    if (nameValidation.error) {
      return await interaction.reply({
        content: `❌ ${nameValidation.error.message}`,
        ephemeral: true
      });
    }

    const raceValidation = InputValidation.validateRace(rawRace);
    if (raceValidation.error) {
      return await interaction.reply({
        content: `❌ ${raceValidation.error.message}`,
        ephemeral: true
      });
    }

    const priorityValidation = InputValidation.validatePriority(rawPriority);
    if (priorityValidation.error) {
      return await interaction.reply({
        content: `❌ ${priorityValidation.error.message}`,
        ephemeral: true
      });
    }

    const archetypeValidation = InputValidation.validateArchetype(rawArchetype);
    if (archetypeValidation.error) {
      return await interaction.reply({
        content: `❌ ${archetypeValidation.error.message}`,
        ephemeral: true
      });
    }

    // Use validated values
    const name = nameValidation.value;
    const race = raceValidation.value;
    const priority = priorityValidation.value;
    const archetype = archetypeValidation.value;

    // ... continue with character creation

  } catch (error) {
    await errorHandler.handleCommandError(interaction, error, 'character create-shadowrun');
  }
}

// Example: Dice rolling with validation
async function rollDice(interaction, userId, guildId) {
  const errorHandler = new EnhancedErrorHandling();

  try {
    const rawDiceNotation = interaction.options.getString('dice');
    const rawReason = interaction.options.getString('reason') || '';

    // ✅ Validate dice notation
    const diceValidation = InputValidation.validateDiceNotation(rawDiceNotation);
    if (diceValidation.error) {
      return await interaction.reply({
        content: `❌ ${diceValidation.error.message}`,
        ephemeral: true
      });
    }

    // Sanitize reason (optional field)
    const reason = InputValidation.sanitizeString(rawReason);

    // Use validated dice notation
    const diceNotation = diceValidation.value;

    // ... continue with dice rolling logic

  } catch (error) {
    await errorHandler.handleCommandError(interaction, error, 'dice roll');
  }
}

// Example: Combat commands with validation
async function combatAttack(interaction) {
  const errorHandler = new EnhancedErrorHandling();

  try {
    const rawCombatId = interaction.options.getString('combat_id');
    const rawTarget = interaction.options.getString('target');
    const rawWeapon = interaction.options.getString('weapon');
    const rawAttackPool = interaction.options.getInteger('attack_pool');
    const rawDefensePool = interaction.options.getInteger('defense_pool');

    // ✅ Validate all inputs
    const combatIdValidation = InputValidation.validateCombatId(rawCombatId);
    if (combatIdValidation.error) {
      return await interaction.reply({
        content: `❌ ${combatIdValidation.error.message}`,
        ephemeral: true
      });
    }

    // Sanitize target and weapon names
    const target = InputValidation.sanitizeString(rawTarget);
    const weapon = InputValidation.sanitizeString(rawWeapon);

    // Validate dice pools
    const attackPoolValidation = InputValidation.validateSkill(rawAttackPool, 'Attack pool');
    if (attackPoolValidation.error) {
      return await interaction.reply({
        content: `❌ ${attackPoolValidation.error.message}`,
        ephemeral: true
      });
    }

    const defensePoolValidation = InputValidation.validateSkill(rawDefensePool, 'Defense pool');
    if (defensePoolValidation.error) {
      return await interaction.reply({
        content: `❌ ${defensePoolValidation.error.message}`,
        ephemeral: true
      });
    }

    // Use validated values
    const combatId = combatIdValidation.value;
    const attackPool = attackPoolValidation.value;
    const defensePool = defensePoolValidation.value;

    // ... continue with combat logic

  } catch (error) {
    await errorHandler.handleCommandError(interaction, error, 'combat attack');
  }
}

// Example: Nuyen transactions with validation
async function transferNuyen(interaction, userId) {
  const errorHandler = new EnhancedErrorHandling();

  try {
    const rawAmount = interaction.options.getInteger('amount');
    const rawRecipient = interaction.options.getString('recipient');

    // ✅ Validate nuyen amount
    const amountValidation = InputValidation.validateNuyen(rawAmount);
    if (amountValidation.error) {
      return await interaction.reply({
        content: `❌ ${amountValidation.error.message}`,
        ephemeral: true
      });
    }

    // Sanitize recipient
    const recipient = InputValidation.sanitizeString(rawRecipient);

    // Use validated amount
    const amount = amountValidation.value;

    // ... continue with transfer logic

  } catch (error) {
    await errorHandler.handleCommandError(interaction, error, 'nuyen transfer');
  }
}

/**
 * MIGRATION CHECKLIST FOR ALL COMMANDS:
 * 
 * For each command file in /commands:
 * 
 * 1. Import InputValidation at the top:
 *    const InputValidation = require('../utils/inputValidation');
 * 
 * 2. For each user input:
 *    a. Get the raw value from interaction.options
 *    b. Call appropriate validation method
 *    c. Check for errors and return user-friendly message
 *    d. Use the validated/sanitized value
 * 
 * 3. Common validation methods:
 *    - validateCharacterName()
 *    - validateDescription()
 *    - validateBackstory()
 *    - validateDiceNotation()
 *    - validateAttribute()
 *    - validateSkill()
 *    - validateCombatId()
 *    - validateNuyen()
 *    - validateKarma()
 *    - validatePriority()
 *    - validateRace()
 *    - validateArchetype()
 *    - validateUserId()
 *    - validateGuildId()
 *    - validateUrl()
 *    - sanitizeString() - for any text input
 * 
 * 4. Test thoroughly:
 *    - Valid inputs
 *    - Invalid inputs (special characters, scripts, SQL injection attempts)
 *    - Edge cases (empty strings, very long strings, null values)
 *    - Malicious inputs (XSS attempts, injection attacks)
 */

module.exports = {
  // This is an example file, not an actual command
  // Use these patterns to update your command handlers
};
