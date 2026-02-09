// Shadowrun 3rd Edition Combat Dice System
const ShadowrunDice = require('./ShadowrunDice');

class ShadowrunCombatDice extends ShadowrunDice {
  constructor() {
    super();
  }

  // Combat Initiative Test
  static rollInitiative(character, modifier = 0) {
    const reaction = character.reaction || 1;
    const intuition = character.intuition || 1;
    const initiativeDice = Math.floor(Math.random() * 6) + 1;
    
    const totalInitiative = reaction + intuition + initiativeDice + modifier;
    const passes = Math.floor(totalInitiative / 10) + 1;
    
    return {
      total: totalInitiative,
      dice: initiativeDice,
      passes: passes,
      formula: `Reaction(${reaction}) + Intuition(${intuition}) + d6(${initiativeDice}) + modifier(${modifier}) = ${totalInitiative}`
    };
  }

  // Attack Test
  static rollAttackTest(character, skill, accuracy = 0, defense = 0) {
    // Attack Test = (Attribute + Skill) vs Defense
    const attribute = this.getAttributeForSkill(character, skill);
    const skillRating = character.getSkillRating(skill) || 0;
    const attackPool = attribute + skillRating + accuracy;
    
    const attackRolls = this.rollDice(attackPool);
    const attackSuccesses = this.countSuccesses(attackRolls);
    
    // Defense Test = Reaction + Intuition + Combat Pool (if used)
    const defensePool = character.reaction + character.intuition + defense;
    const defenseRolls = this.rollDice(defensePool);
    const defenseSuccesses = this.countSuccesses(defenseRolls);
    
    // Net successes = Attack successes - Defense successes
    const netSuccesses = attackSuccesses - defenseSuccesses;
    
    return {
      attack: {
        pool: attackPool,
        dice: attackRolls,
        successes: attackSuccesses,
        total: attackSuccesses
      },
      defense: {
        pool: defensePool,
        dice: defenseRolls,
        successes: defenseSuccesses,
        total: defenseSuccesses
      },
      netSuccesses: netSuccesses,
      hit: netSuccesses > 0,
      glitch: this.isGlitch(attackRolls),
      criticalGlitch: this.isCriticalGlitch(attackRolls)
    };
  }

  // Damage Resistance Test
  static rollDamageResistance(character, damage, armor = 0) {
    // Damage Resistance = Body + Armor + Combat Pool (if used)
    const body = character.body || 1;
    const resistancePool = body + armor;
    
    const resistanceRolls = this.rollDice(resistancePool);
    const resistanceSuccesses = this.countSuccesses(resistanceRolls);
    
    // Damage taken = Damage - Resistance successes
    const damageTaken = Math.max(1, damage - resistanceSuccesses);
    
    return {
      resistance: {
        pool: resistancePool,
        dice: resistanceRolls,
        successes: resistanceSuccesses,
        total: resistanceSuccesses
      },
      damage: damage,
      damageTaken: damageTaken,
      soaked: damage - damageTaken
    };
  }

  // Combat Pool Test
  static rollCombatPoolTest(pool, used = 0) {
    const effectivePool = Math.max(0, pool - used);
    const rolls = this.rollDice(effectivePool);
    const successes = this.countSuccesses(rolls);
    
    return {
      pool: effectivePool,
      used: used,
      remaining: pool - used,
      dice: rolls,
      successes: successes,
      total: successes
    };
  }

  // Getters for character attributes
  static getAttributeForSkill(character, skill) {
    const skillMap = {
      // Combat Skills
      'assaultrifles': character.agility,
      'pistols': character.agility,
      'rifles': character.agility,
      'shotguns': character.agility,
      'submachineguns': character.agility,
      'heavyweapons': character.strength,
      'launchweapons': character.strength,
      'edgedweapons': character.strength,
      'clubs': character.strength,
      'unarmedcombat': character.strength,
      'throwingweapons': character.agility,
      'polearms': character.strength,
      
      // Magical Skills
      'sorcery': character.charisma,
      'conjuring': character.charisma,
      'aurareading': character.intelligence,
      
      // Physical Skills
      'athletics': character.strength,
      'climbing': character.strength,
      'running': character.strength,
      'swimming': character.strength,
      'stealth': character.reaction,
      
      // Social Skills
      'etiquette': character.charisma,
      'leadership': character.charisma,
      'negotiation': character.charisma,
      'intimidation': character.charisma,
      'persuasion': character.charisma,
      
      // Technical Skills
      'computer': logic,
      'electronics': logic,
      'biotech': logic,
      'engineering': logic,
      'demolitions': logic,
      
      // Vehicle Skills
      'car': reaction,
      'bike': reaction,
      'aircraft': intuition,
      'hovercraft': reaction,
      'motorcycle': reaction
    };
    
    return skillMap[skill] || character.logic || 1;
  }

  // Combat action types
  static getActionType(action) {
    const simpleActions = [
      'move', 'aim', 'change weapon', 'reload', 
      'speak', 'gesture', 'drop item', 'pick up item'
    ];
    
    const complexActions = [
      'full auto burst', 'long burst', 'single shot',
      'melee attack', 'spellcasting', 'summoning',
      'complex matrix action', 'vehicle maneuver'
    ];
    
    if (simpleActions.includes(action)) {
      return { type: 'simple', time: '1 complex action' };
    } else if (complexActions.includes(action)) {
      return { type: 'complex', time: '1 complex action' };
    } else {
      return { type: 'free', time: 'free action' };
    }
  }
}

module.exports = ShadowrunCombatDice;