// Shadowrun 3rd Edition Spell System
const ShadowrunDice = require('./ShadowrunDice');

class ShadowrunMagic {
  constructor() {
    this.dice = new ShadowrunDice();
    this.spellCategories = {
      COMBAT: 'combat',
      DETECTION: 'detection', 
      ILLUSION: 'illusion',
      HEALTH: 'health',
      MANIPULATION: 'manipulation',
      DIVINATION: 'divination'
    };
    
    this.spellTypes = {
      DIRECT: 'direct',
      INDIRECT: 'indirect',
      AREA: 'area',
      TOUCH: 'touch'
    };
    
    this.traditions = {
      HERMETIC: 'Hermetic',
      SHAMANIC: 'Shamanic',
      WITCH: 'Witch',
      DRUIDIC: 'Druidic',
      VOODOO: 'Voodoo'
    };
  }

  // Calculate Spellcasting Test
  castSpell(character, spellName, targetNumber = null, modifiers = {}) {
    const magic = character.magic || 0;
    const skill = this.getSpellSkill(character, spellName) || 0;
    
    // Validate spell exists
    const spellData = this.getSpellData(spellName);
    if (!spellData) {
      throw new Error(`Spell "${spellName}" not found`);
    }
    
    if (magic === 0 || skill === 0) {
      throw new Error('Character cannot cast spells - no Magic rating or spell skill');
    }

    const pool = magic + skill + (modifiers.bonus || 0);
    const tn = targetNumber || (modifiers.difficulty || 4);
    
    const result = this.dice.rollDice(pool);
    const successes = result.successes;
    const glitch = result.glitch;
    const criticalGlitch = result.criticalGlitch;

    // Calculate Drain
    const drainValue = this.calculateDrain(spellName, successes);
    const drainResistance = this.calculateDrainResistance(character);
    
    const drainResult = this.dice.rollDice(drainResistance);
    const drainSuccesses = drainResult.successes;

    const spellResult = {
      spell: spellName,
      castingPool: pool,
      targetNumber: tn,
      roll: result,
      successes: successes,
      glitch: glitch,
      criticalGlitch: criticalGlitch,
      drain: {
        value: drainValue,
        resistancePool: drainResistance,
        roll: drainResult,
        successes: drainSuccesses,
        resisted: drainSuccesses >= Math.ceil(drainValue / 2),
        damage: Math.max(0, drainValue - drainSuccesses)
      },
      modifiers: modifiers
    };

    return spellResult;
  }

  // Get character's skill rating for a specific spell
  getSpellSkill(character, spellName) {
    const spells = character.spells || {};
    return spells[spellName]?.rating || 0;
  }

  // Calculate Drain Value for a spell
  calculateDrain(spellName, successes) {
    // Base drain is based on spell category and force
    const spellData = this.getSpellData(spellName);
    const baseDrain = spellData.drain || 'L';
    
    // Drain increases with more net hits
    let drainValue = this.parseDrainCode(baseDrain);
    drainValue += Math.floor(successes / 2);
    
    return drainValue;
  }

  // Calculate Drain Resistance pool
  calculateDrainResistance(character) {
    const willpower = character.willpower || 3;
    const magic = character.magic || 0;
    
    // Add centering bonus if available
    const centeringBonus = character.centering?.bonus || 0;
    
    return willpower + magic + centeringBonus;
  }

  // Parse drain code (L/M/S) to numeric value
  parseDrainCode(drainCode) {
    const drainMap = {
      'L': 1,
      'M': 3,
      'S': 6,
      'D': 10
    };
    return drainMap[drainCode] || 1;
  }

  // Get spell data from database/cache
  getSpellData(spellName) {
    // This would normally query a spells database
    // For now, return default spell data
    const spells = {
      'Stunbolt': {
        category: 'combat',
        type: 'direct',
        damage: 'S',
        drain: 'M',
        range: 'medium',
        duration: 'instant',
        description: 'Direct mana attack that does Stun damage'
      },
      'Magic Missile': {
        category: 'combat',
        type: 'indirect',
        damage: 'S',
        drain: 'M',
        range: 'medium',
        duration: 'instant',
        description: 'Launch magical projectiles at target'
      },
      'Invisibility': {
        category: 'illusion',
        type: 'mental',
        drain: 'L',
        range: 'touch',
        duration: 'special',
        description: 'Render target invisible'
      },
      'Heal': {
        category: 'health',
        type: 'direct',
        drain: 'M',
        range: 'touch',
        duration: 'instant',
        description: 'Heal physical damage'
      },
      'Fireball': {
        category: 'combat',
        type: 'indirect',
        damage: 'S',
        drain: 'M',
        range: 'medium',
        duration: 'instant',
        description: 'Create an explosion of fire at target location'
      }
    };
    
    return spells[spellName] || {
      category: 'combat',
      type: 'indirect',
      drain: 'M',
      damage: 'S',
      range: 'medium',
      duration: 'instant'
    };
  }

  // Learn a new spell
  learnSpell(character, spellName, category) {
    const spells = character.spells || {};
    
    if (!spells[spellName]) {
      spells[spellName] = {
        name: spellName,
        category: category,
        rating: 1,
        known: true
      };
      
      character.spells = spells;
      character.totalSpellsLearned = (character.totalSpellsLearned || 0) + 1;
      
      // Update category counters
      this.updateCategoryCounters(character, category, 1);
    }
    
    return spells[spellName];
  }

  // Update spell category counters
  updateCategoryCounters(character, category, increment) {
    switch(category) {
      case 'combat':
        character.combatSpellsKnown = (character.combatSpellsKnown || 0) + increment;
        break;
      case 'detection':
        character.detectionSpellsKnown = (character.detectionSpellsKnown || 0) + increment;
        break;
      case 'illusion':
        character.illusionSpellsKnown = (character.illusionSpellsKnown || 0) + increment;
        break;
      case 'health':
        character.healthSpellsKnown = (character.healthSpellsKnown || 0) + increment;
        break;
      case 'manipulation':
        character.manipulationSpellsKnown = (character.manipulationSpellsKnown || 0) + increment;
        break;
      case 'divination':
        character.divinationSpellsKnown = (character.divinationSpellsKnown || 0) + increment;
        break;
    }
  }

  // Calculate Spell Defense
  calculateSpellDefense(character) {
    const willpower = character.willpower || 3;
    const magic = character.magic || 0;
    const skill = character.counterspellingSkill || 0;
    
    return willpower + magic + skill;
  }

  // Astral Perception
  astralPerception(character) {
    const magic = character.magic || 0;
    const intuition = character.intuition || 3;
    
    const pool = magic + intuition;
    const result = this.dice.rollDice(pool);
    
    return {
      action: 'astral_perception',
      pool: pool,
      roll: result,
      successes: result.successes,
      canSeeAstral: result.successes >= 1
    };
  }

  // Astral Combat
  astralCombat(character, target, spellType = 'mana') {
    const magic = character.magic || 0;
    const skill = character.astralCombatSkill || 0;
    
    const pool = magic + skill;
    const result = this.dice.rollDice(pool);
    
    return {
      action: 'astral_combat',
      spellType: spellType,
      pool: pool,
      roll: result,
      successes: result.successes
    };
  }

  // Get available spells by category
  getSpellsByCategory(character, category) {
    const spells = character.spells || {};
    return Object.values(spells).filter(spell => spell.category === category);
  }

  // Check character meets tradition requirements
  checkTraditionRequirements(character, tradition) {
    const requirements = this.getTraditionRequirements(tradition);
    
    for (const [attr, minRating] of Object.entries(requirements)) {
      const currentRating = character[attr] || 0;
      if (currentRating < minRating) {
        return false;
      }
    }
    
    return true;
  }

  // Calculate spell pool for casting
  calculateSpellPool(character, spell) {
    let pool = spell.force || 1;
    
    // Add specialization bonus
    if (spell.is_specialized && character.magic_specialization === spell.specialization) {
      pool += 2;
    }
    
    // Add focus bonus
    if (character.foci && character.foci.includes(spell.category)) {
      pool += character.focus_bonus || 1;
    }
    
    return pool;
  }

  // Get tradition requirements
  getTraditionRequirements(tradition) {
    const requirements = {
      'Hermetic': { logic: 3, intuition: 3 },
      'Shamanic': { charisma: 3, intuition: 3 },
      'Witch': { charisma: 3, willpower: 3 },
      'Druidic': { body: 3, willpower: 3 },
      'Voodoo': { charisma: 3, intuition: 3 }
    };
    
    return requirements[tradition] || {};
  }
}

module.exports = ShadowrunMagic;