// Shadowrun 3rd Edition Dice System
const { EmbedBuilder } = require('discord.js');

class ShadowrunDice {
  constructor() {
    this.diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  }

  // Simple dice roll method for basic testing
  rollDice(pool, targetNumber = 5) {
    if (pool <= 0) {
      return { total: 0, successes: 0, diceRolled: 0, glitch: false, criticalGlitch: false };
    }

    const dice = [];
    let successes = 0;
    let ones = 0;

    for (let i = 0; i < pool; i++) {
      const roll = Math.floor(Math.random() * 6) + 1;
      dice.push(roll);
      
      if (roll >= targetNumber) {
        successes++;
      }
      
      if (roll === 1) {
        ones++;
      }
    }

    // Determine glitch
    const glitch = ones >= Math.ceil(pool / 2) && successes === 0;
    const criticalGlitch = ones >= pool / 2 && successes === 0;

    return {
      total: successes,
      successes: successes,
      diceRolled: pool,
      dice: dice,
      ones: ones,
      targetNumber: targetNumber,
      glitch: glitch,
      criticalGlitch: criticalGlitch
    };
  }

  // Basic Shadowrun dice roll - count successes (5+)
  rollDicePool(pool, targetNumber = 5) {
    if (pool <= 0) {
      return { successes: 0, dice: [], criticalGlitch: false, glitch: false };
    }

    const dice = [];
    let successes = 0;
    let ones = 0;

    for (let i = 0; i < pool; i++) {
      const roll = Math.floor(Math.random() * 6) + 1;
      dice.push(roll);
      
      if (roll >= targetNumber) {
        successes++;
      }
      
      if (roll === 1) {
        ones++;
      }
    }

    // Check for glitches
    const glitch = ones > Math.floor(pool / 2);
    const criticalGlitch = glitch && successes === 0;

    return {
      successes,
      dice,
      ones,
      glitch,
      criticalGlitch,
      targetNumber
    };
  }

  // Roll combat pool and allocate between offense/defense
  rollCombatPool(totalPool, offenseDice, defenseDice) {
    if (totalPool < (offenseDice + defenseDice)) {
      throw new Error('Not enough combat pool dice for allocation');
    }

    const offenseRolls = this.rollDicePool(offenseDice);
    const defenseRolls = this.rollDicePool(defenseDice);
    const remainingPool = totalPool - (offenseDice + defenseDice);

    return {
      totalPool,
      allocated: {
        offense: offenseDice,
        defense: defenseDice,
        remaining: remainingPool
      },
      offense: offenseRolls,
      defense: defenseRolls
    };
  }

  // Spellcasting roll with willpower as base
  rollSpellcasting(spellRating, willpower, modifiers = 0) {
    const totalDice = spellRating + willpower + modifiers;
    return this.rollDicePool(totalDice);
  }

  // Conjuring roll with charisma as base
  rollConjuring(conjuringRating, charisma, modifiers = 0) {
    const totalDice = conjuringRating + charisma + modifiers;
    return this.rollDicePool(totalDice);
  }

  // Decking roll with intelligence as base
  rollDecking(deckRating, intelligence, modifiers = 0) {
    const totalDice = deckRating + intelligence + modifiers;
    return this.rollDicePool(totalDice);
  }

  // Create formatted dice roll embed
  createRollEmbed(result, type = 'basic', title = 'Shadowrun Dice Roll') {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(title);

    // Add success/failure result
    if (result.criticalGlitch) {
      embed.addFields(
        { name: 'Result', value: '💥 CRITICAL GLITCH!', inline: false }
      );
    } else if (result.glitch) {
      embed.addFields(
        { name: 'Result', value: '⚠️ GLITCH!', inline: false }
      );
    } else {
      embed.addFields(
        { name: 'Result', value: `✅ ${result.successes} Success${result.successes !== 1 ? 'es' : ''}`, inline: false }
      );
    }

    // Add dice visualization
    const diceEmojis = result.dice.map(die => this.diceFaces[die - 1]).join(' ');
    embed.addFields(
      { name: 'Dice', value: diceEmojis, inline: true }
    );

    // Add target number
    embed.addFields(
      { name: 'Target Number', value: result.targetNumber.toString(), inline: true }
    );

    // Add ones count for glitch detection
    if (result.ones > 0) {
      embed.addFields(
        { name: 'Ones', value: `${result.ones} ones rolled`, inline: false }
      );
    }

    // Add type-specific information
    if (type === 'combat') {
      embed.addFields(
        { name: 'Combat Pool', value: 'Allocated between offense and defense', inline: false }
      );
    } else if (type === 'spellcasting') {
      embed.addFields(
        { name: 'Spellcasting', value: 'Willpower + Spell Rating + Modifiers', inline: false }
      );
    } else if (type === 'conjuring') {
      embed.addFields(
        { name: 'Conjuring', value: 'Charisma + Conjuring Rating + Modifiers', inline: false }
      );
    } else if (type === 'decking') {
      embed.addFields(
        { name: 'Decking', value: 'Intelligence + Deck Rating + Modifiers', inline: false }
      );
    }

    embed.setTimestamp();

    return embed;
  }

  // Create combat pool embed
  createCombatPoolEmbed(result, characterName = 'Character') {
    const embed = new EmbedBuilder()
      .setColor(0x0080ff)
      .setTitle(`${characterName} - Combat Pool Roll`);

    embed.addFields(
      { name: 'Total Combat Pool', value: result.totalPool.toString(), inline: true },
      { name: 'Offense Dice', value: result.allocated.offense.toString(), inline: true },
      { name: 'Defense Dice', value: result.allocated.defense.toString(), inline: true },
      { name: 'Remaining Pool', value: result.allocated.remaining.toString(), inline: true }
    );

    embed.addFields(
      { name: 'Offense Result', value: `✅ ${result.offense.successes} successes`, inline: true },
      { name: 'Defense Result', value: `✅ ${result.defense.successes} successes`, inline: true }
    );

    const offenseDice = result.offense.dice.map(die => this.diceFaces[die - 1]).join(' ');
    const defenseDice = result.defense.dice.map(die => this.diceFaces[die - 1]).join(' ');

    embed.addFields(
      { name: 'Offense Dice', value: offenseDice, inline: true },
      { name: 'Defense Dice', value: defenseDice, inline: true }
    );

    // Check for glitches
    if (result.offense.criticalGlitch) {
      embed.addFields(
        { name: '⚠️ Note', value: 'Critical Glitch on offense roll!', inline: false }
      );
    } else if (result.offense.glitch) {
      embed.addFields(
        { name: '⚠️ Note', value: 'Glitch on offense roll!', inline: false }
      );
    }

    if (result.defense.criticalGlitch) {
      embed.addFields(
        { name: '⚠️ Note', value: 'Critical Glitch on defense roll!', inline: false }
      );
    } else if (result.defense.glitch) {
      embed.addFields(
        { name: '⚠️ Note', value: 'Glitch on defense roll!', inline: false }
      );
    }

    embed.setTimestamp();

    return embed;
  }

  // Calculate initiative
  calculateInitiative(quickness, reaction, modifiers = 0) {
    return (quickness || 1) + (reaction || 1) + modifiers;
  }

  // Calculate initiative passes
  calculateInitiativePasses(initiative) {
    return Math.max(1, Math.floor(initiative / 10));
  }

  // Check if roll is a success (meets or exceeds threshold)
  isSuccessful(result, threshold = 1) {
    return result.successes >= threshold;
  }

  // Get roll result description
  getResultDescription(result, threshold = 1) {
    if (result.criticalGlitch) {
      return 'Critical Glitch! Something went terribly wrong!';
    } else if (result.glitch) {
      return 'Glitch! The action succeeded but with complications.';
    } else if (result.successes >= threshold) {
      return `Success! ${result.successes} success${result.successes !== 1 ? 'es' : ''} achieved.`;
    } else {
      return `Failure. Only ${result.successes} success${result.successes !== 1 ? 'es' : ''} needed ${threshold}.`;
    }
  }
}

module.exports = ShadowrunDice;
module.exports.ShadowrunDice = ShadowrunDice;