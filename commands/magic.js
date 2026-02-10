// Discord Commands for Shadowrun Magic System
const ShadowrunMagic = require('../utils/ShadowrunMagic');
const ShadowrunSpirits = require('../utils/ShadowrunSpirits');
const ShadowrunAstral = require('../utils/ShadowrunAstral');
const ShadowrunDice = require('../utils/ShadowrunDice');

class MagicCommands {
  constructor() {
    this.shadowrunMagic = new ShadowrunMagic();
    this.shadowrunSpirits = new ShadowrunSpirits();
    this.shadowrunAstral = new ShadowrunAstral();
  }

  // Spellcasting commands
  async spellcast(interaction, spellName, targetType = null, targetNumber = null) {
    const character = await this.getCharacter(interaction.user.id);
    
    if (!character) {
      return interaction.reply('Please create a character first using /character create-shadowrun');
    }

    const result = this.shadowrunMagic.castSpell(character, spellName, targetType, targetNumber);
    
    let embed = {
      title: `🔮 Spellcasting: ${spellName}`,
      color: 13833,
      fields: [
        {
          name: 'Caster',
          value: character.name,
          inline: true
        },
        {
          name: 'Spell',
          value: spellName,
          inline: true
        },
        {
          name: 'Spell Force',
          value: result.spell.force.toString(),
          inline: true
        },
        {
          name: 'Spell Pool',
          value: `${result.pool} dice`,
          inline: true
        },
        {
          name: 'Spell Roll',
          value: `${result.roll.total} (${result.roll.diceRolled}d6)`,
          inline: true
        },
        {
          name: 'Successes',
          value: result.roll.successes.toString(),
          inline: true
        },
        {
          name: 'Drain',
          value: `${result.drain.value} ${result.drain.type} damage`,
          inline: true
        },
        {
          name: 'Drain Resistance',
          value: `${result.drain.resistancePool} dice (${result.drain.roll.successes} successes)`,
          inline: true
        },
        {
          name: 'Drain Result',
          value: result.drain.resisted ? '✅ Resisted' : `❌ ${result.drain.damage} damage taken`,
          inline: true
        }
      ]
    };

    // Add spell description if available
    if (result.spell.description) {
      embed.fields.push({
        name: 'Description',
        value: result.spell.description
      });
    }

    // Add special effects
    if (result.specialEffects && result.specialEffects.length > 0) {
      embed.fields.push({
        name: 'Special Effects',
        value: result.specialEffects.join('\n')
      });
    }

    // Add glitch information
    if (result.roll.glitch) {
      embed.description = '⚠️ **GLITCH!** Spell had an unintended effect.';
    }

    if (result.roll.criticalGlitch) {
      embed.description = '💀 **CRITICAL GLITCH!** Spell backfired dramatically!';
    }

    return interaction.reply({ embeds: [embed] });
  }

  // Spirit summoning commands
  async summonSpirit(interaction, spiritType, force = 4) {
    const character = await this.getCharacter(interaction.user.id);
    
    if (!character) {
      return interaction.reply('Please create a character first using /character create-shadowrun');
    }

    const result = this.shadowrunSpirits.summonSpirit(character, spiritType, force);
    
    let embed = {
      title: `👻 Spirit Summoning`,
      color: 13833,
      fields: [
        {
          name: 'Summoner',
          value: character.name,
          inline: true
        },
        {
          name: 'Spirit Type',
          value: spiritType,
          inline: true
        },
        {
          name: 'Spirit Force',
          value: force.toString(),
          inline: true
        },
        {
          name: 'Summoning Pool',
          value: `${result.pool} dice`,
          inline: true
        },
        {
          name: 'Summoning Roll',
          value: `${result.roll.total} (${result.roll.diceRolled}d6)`,
          inline: true
        },
        {
          name: 'Successes',
          value: result.roll.successes.toString(),
          inline: true
        },
        {
          name: 'Drain',
          value: `${result.drain.value} ${result.drain.type} damage`,
          inline: true
        },
        {
          name: 'Drain Resistance',
          value: `${result.drain.resistancePool} dice (${result.drain.roll.successes} successes)`,
          inline: true
        },
        {
          name: 'Drain Result',
          value: result.drain.resisted ? '✅ Resisted' : `❌ ${result.drain.damage} damage taken`,
          inline: true
        },
        {
          name: 'Binding Success',
          value: result.success ? '✅ Bound successfully' : '❌ Failed to bind spirit',
          inline: true
        }
      ]
    };

    // Add spirit information if successful
    if (result.success && result.spirit) {
      embed.fields.push(
        {
          name: 'Spirit Name',
          value: result.spirit.name,
          inline: true
        },
        {
          name: 'Spirit Attributes',
          value: `Force: ${result.spirit.force}\nMagic: ${result.spirit.magic}\nWillpower: ${result.spirit.willpower}`,
          inline: true
        },
        {
          name: 'Powers',
          value: result.spirit.powers.join(', ') || 'None',
          inline: false
        }
      );
    }

    // Add glitch information
    if (result.roll.glitch) {
      embed.description = '⚠️ **GLITCH!** Summoning had unintended consequences.';
    }

    if (result.roll.criticalGlitch) {
      embed.description = '💀 **CRITICAL GLITCH!** Something went terribly wrong with the summoning!';
    }

    return interaction.reply({ embeds: [embed] });
  }

  // Astral projection commands
  async astralProject(interaction, duration = 'sustained') {
    const character = await this.getCharacter(interaction.user.id);
    
    if (!character) {
      return interaction.reply('Please create a character first using /character create-shadowrun');
    }

    if (!character.magic || character.magic === 0) {
      return interaction.reply('Your character cannot astrally project - Magic attribute is 0');
    }

    const result = this.shadowrunAstral.projectIntoAstral(character, duration);
    
    let embed = {
      title: '✨ Astral Projection',
      color: 13833,
      fields: [
        {
          name: 'Character',
          value: character.name,
          inline: true
        },
        {
          name: 'Magic Attribute',
          value: character.magic.toString(),
          inline: true
        },
        {
          name: 'Projection Pool',
          value: `${result.projectionPool} dice`,
          inline: true
        },
        {
          name: 'Projection Roll',
          value: `${result.roll.total} (${result.roll.diceRolled}d6)`,
          inline: true
        },
        {
          name: 'Successes',
          value: result.successes.toString(),
          inline: true
        },
        {
          name: 'Drain',
          value: `${result.drain.value} ${result.drain.type} damage`,
          inline: true
        },
        {
          name: 'Drain Resistance',
          value: `${result.drain.resistancePool} dice (${result.drain.roll.successes} successes)`,
          inline: true
        },
        {
          name: 'Drain Result',
          value: result.drain.resisted ? '✅ Resisted' : `❌ ${result.drain.damage} damage taken`,
          inline: true
        },
        {
          name: 'Status',
          value: result.projected ? '✅ Projected into Astral Plane' : '❌ Failed to project',
          inline: true
        },
        {
          name: 'Duration',
          value: duration,
          inline: true
        }
      ]
    };

    // Add complications
    if (result.complications && result.complications.length > 0) {
      embed.fields.push({
        name: 'Complications',
        value: result.complications.map(c => `• ${c.description}`).join('\n')
      });
    }

    // Add glitch information
    if (result.roll.glitch) {
      embed.description = '⚠️ **GLITCH!** Astral projection has complications.';
    }

    if (result.roll.criticalGlitch) {
      embed.description = '💀 **CRITICAL GLITCH!** Dangerous astral entity attracted!';
    }

    return interaction.reply({ embeds: [embed] });
  }

  // Astral perception commands
  async astralPerception(interaction, target = null, modifier = 0) {
    const character = await this.getCharacter(interaction.user.id);
    
    if (!character) {
      return interaction.reply('Please create a character first using /character create-shadowrun');
    }

    const result = this.shadowrunAstral.astralPerceptionTest(character, target, modifier);
    
    let embed = {
      title: '👁️ Astral Perception Test',
      color: 13833,
      fields: [
        {
          name: 'Character',
          value: character.name,
          inline: true
        },
        {
          name: 'Perception Pool',
          value: `${result.pool} dice`,
          inline: true
        },
        {
          name: 'Perception Roll',
          value: `${result.roll.total} (${result.roll.diceRolled}d6)`,
          inline: true
        },
        {
          name: 'Successes',
          value: result.successes.toString(),
          inline: true
        },
        {
          name: 'Result',
          value: result.success ? '✅ Successfully perceived astral forms' : '❌ No astral forms detected',
          inline: true
        }
      ]
    };

    // Add glitch information
    if (result.glitches) {
      embed.description = '⚠️ **GLITCH!** Perception test had complications.';
    }

    return interaction.reply({ embeds: [embed] });
  }

  // Astral combat commands
  async astralCombat(interaction, targetCharacter, spellType = 'combat') {
    const attacker = await this.getCharacter(interaction.user.id);
    const defender = await this.getCharacter(targetCharacter.id);
    
    if (!attacker || !defender) {
      return interaction.reply('Both characters must exist for astral combat');
    }

    const result = this.shadowrunAstral.astralCombatAttack(attacker, defender, spellType);
    
    let embed = {
      title: '⚔️ Astral Combat',
      color: 13833,
      fields: [
        {
          name: 'Attacker',
          value: attacker.name,
          inline: true
        },
        {
          name: 'Defender',
          value: defender.name,
          inline: true
        },
        {
          name: 'Attack Pool',
          value: `${result.attackPool} dice`,
          inline: true
        },
        {
          name: 'Attack Roll',
          value: `${result.attackRoll.total} (${result.attackRoll.diceRolled}d6)`,
          inline: true
        },
        {
          name: 'Defense Pool',
          value: `${result.defensePool} dice`,
          inline: true
        },
        {
          name: 'Defense Roll',
          value: `${result.defenseRoll.total} (${result.defenseRoll.diceRolled}d6)`,
          inline: true
        },
        {
          name: 'Net Hits',
          value: result.netHits.toString(),
          inline: true
        },
        {
          name: 'Damage',
          value: result.damage.toString(),
          inline: true
        }
      ]
    };

    return interaction.reply({ embeds: [embed] });
  }

  // List available spells command
  async listSpells(interaction, category = null) {
    const spells = this.shadowrunMagic.getSpellsByCategory(category);
    
    let embed = {
      title: '📚 Available Spells',
      color: 13833,
      fields: []
    };

    if (category) {
      embed.title = `📚 ${category} Spells`;
      const categorySpells = spells[category] || [];
      
      if (categorySpells.length === 0) {
        return interaction.reply('No spells found in that category');
      }

      embed.fields.push({
        name: category,
        value: categorySpells.map(spell => `• ${spell.name} (Force ${spell.force})`).join('\n')
      });
    } else {
      // Show all categories
      Object.keys(spells).forEach(category => {
        if (spells[category].length > 0) {
          embed.fields.push({
            name: category,
            value: `${spells[category].length} spells`
          });
        }
      });
    }

    return interaction.reply({ embeds: [embed] });
  }

  // List available spirits command
  async listSpirits(interaction, tradition = null) {
    const spirits = this.shadowrunSpirits.getSpiritsByTradition(tradition);
    
    let embed = {
      title: '👻 Available Spirits',
      color: 13833,
      fields: []
    };

    if (tradition) {
      embed.title = `👻 ${tradition} Spirits`;
      const traditionSpirits = spirits[tradition] || [];
      
      if (traditionSpirits.length === 0) {
        return interaction.reply('No spirits found for that tradition');
      }

      embed.fields.push({
        name: tradition,
        value: traditionSpirits.map(spirit => `• ${spirit.name} (Force ${spirit.force})`).join('\n')
      });
    } else {
      // Show all traditions
      Object.keys(spirits).forEach(tradition => {
        if (spirits[tradition].length > 0) {
          embed.fields.push({
            name: tradition,
            value: spirits[tradition].length + ' spirits'
          });
        }
      });
    }

    return interaction.reply({ embeds: [embed] });
  }

  // Helper method to get character (placeholder - would connect to your database)
  async getCharacter(userId) {
    // This would connect to your database to get the character
    // For now, return a mock character
    return {
      id: userId,
      name: 'Test Mage',
      magic: 6,
      willpower: 5,
      intuition: 4,
      charisma: 5,
      agility: 3,
      strength: 3,
      body: 3,
      reaction: 3,
      logic: 4,
      cool: 4,
      essence: 6
    };
  }
}

module.exports = MagicCommands;