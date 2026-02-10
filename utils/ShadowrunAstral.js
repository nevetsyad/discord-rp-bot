// Shadowrun 3rd Edition Astral Projection System
const ShadowrunDice = require('./ShadowrunDice');
const ShadowrunMagic = require('./ShadowrunMagic');
const ShadowrunSpirits = require('./ShadowrunSpirits');

class ShadowrunAstral {
  constructor() {
    this.dice = new ShadowrunDice();
    
    // Astral projection rules and constants
    this.astralRules = {
      // Astral initiative calculation
      baseAstralInitiative: 2,
      // Astral movement (meters per combat turn)
      baseAstralMovement: 100,
      // Astral combat modifiers
      astralCombatModifier: 2,
      // Astral perception range (meters)
      baseAstralPerception: 100,
      // Astral visibility modifiers
      visibilityModifiers: {
        'total darkness': -6,
        'pitch darkness': -4,
        'dim light': -2,
        'normal light': 0,
        'bright light': +2,
        'harsh light': +4
      }
    };
    
    // Astral hazards
    this.astralHazards = {
      'mana void': {
        description: 'Area with no magical energy',
        effect: 'Cannot use magic, drain resistance +2',
        drainModifier: 2
      },
      'background count': {
        description: 'Natural magical field strength',
        levels: {
          '0': 'No background magic',
          '1': 'Minimal background count',
          '2': 'Low background count',
          '3': 'Moderate background count',
          '4': 'High background count',
          '5': 'Extreme background count'
        },
        effects: {
          '1': 'No effect',
          '2': 'Spell force +1 to resist',
          '3': 'Spell force +2 to resist',
          '4': 'Spell force +3 to resist, summoning +2 drain',
          '5': 'Spell force +4 to resist, summoning +4 drain, spellcasting impossible'
        }
      },
      'astral barriers': {
        description: 'Magical barriers that block astral passage',
        types: ['ward', 'circle', 'pattern', 'link'],
        resistance: 'Force of magic vs Willpower + Magic'
      }
    };
  }

  // Calculate astral initiative
  calculateAstralInitiative(character) {
    const intuition = character.intuition || 0;
    const willpower = character.willpower || 0;
    const magic = character.magic || 0;
    
    // Base astral initiative is 2D6 + Intuition + Willpower
    const baseRoll = this.dice.rollDice(2);
    const initiative = baseRoll.total + intuition + willpower;
    
    return {
      base: this.astralRules.baseAstralInitiative,
      roll: baseRoll,
      intuition: intuition,
      willpower: willpower,
      total: initiative
    };
  }

  // Calculate astral movement
  calculateAstralMovement(character) {
    const agility = character.agility || 0;
    const magic = character.magic || 0;
    
    // Base movement is 100 meters + (Agility x 10) + (Magic x 5)
    const baseMovement = this.astralRules.baseAstralMovement;
    const agilityBonus = agility * 10;
    const magicBonus = magic * 5;
    
    return baseMovement + agilityBonus + magicBonus;
  }

  // Astral perception test
  astralPerceptionTest(character, target, modifier = 0) {
    const willpower = character.willpower || 0;
    const magic = character.magic || 0;
    
    // Astral perception test is Willpower + Magic
    const perceptionPool = willpower + magic;
    const roll = this.dice.rollDice(perceptionPool + modifier);
    
    return {
      pool: perceptionPool + modifier,
      roll: roll,
      success: roll.successes >= 1,
      glitches: roll.glitch || roll.criticalGlitch
    };
  }

  // Astral combat attack test
  astralCombatAttack(attacker, defender, spellType = 'combat') {
    const willpower = attacker.willpower || 0;
    const magic = attacker.magic || 0;
    
    // Astral combat attack is Willpower + Magic
    const attackPool = willpower + magic;
    const roll = this.dice.rollDice(attackPool);
    
    // Defense is Willpower + Magic for astral forms
    const defenderWillpower = defender.willpower || 0;
    const defenderMagic = defender.magic || 0;
    const defensePool = defenderWillpower + defenderMagic;
    const defenseRoll = this.dice.rollDice(defensePool);
    
    // Calculate net hits
    const netHits = roll.successes - defenseRoll.successes;
    
    return {
      attackPool: attackPool,
      attackRoll: roll,
      defensePool: defensePool,
      defenseRoll: defenseRoll,
      netHits: netHits,
      damage: netHits > 0 ? netHits : 0
    };
  }

  // Project into astral plane
  projectIntoAstral(character, duration = 'sustained') {
    const magic = character.magic || 0;
    
    if (magic === 0) {
      throw new Error('Character cannot astrally project - Magic attribute is 0');
    }
    
    // Astral projection test
    const projectionPool = magic;
    const roll = this.dice.rollDice(projectionPool);
    
    // Calculate drain (Physical damage for astral projection)
    const drainValue = Math.ceil(magic / 2);
    const drainResistancePool = character.willpower || 0;
    const drainRoll = this.dice.rollDice(drainResistancePool);
    
    // Check for complications
    const complications = this.checkProjectionComplications(roll, drainRoll, drainValue);
    
    return {
      action: 'astral_projection',
      projectionPool: projectionPool,
      roll: roll,
      successes: roll.successes,
      glitch: roll.glitch,
      criticalGlitch: roll.criticalGlitch,
      drain: {
        value: drainValue,
        resistancePool: drainResistancePool,
        roll: drainRoll,
        successes: drainRoll.successes,
        resisted: drainRoll.successes >= Math.ceil(drainValue / 2),
        damage: Math.max(0, drainValue - drainRoll.successes),
        type: 'physical'
      },
      complications: complications,
      duration: duration,
      projected: true
    };
  }

  // Return from astral projection
  returnFromAstral(character) {
    const willpower = character.willpower || 0;
    const magic = character.magic || 0;
    
    // Return test is Willpower + Magic
    const returnPool = willpower + magic;
    const roll = this.dice.rollDice(returnPool);
    
    // Calculate difficulty based on time spent away
    const difficulty = 4; // Base difficulty
    
    return {
      action: 'return_from_astral',
      returnPool: returnPool,
      targetNumber: difficulty,
      roll: roll,
      success: roll.successes >= difficulty,
      complications: roll.glitch || roll.criticalGlitch
    };
  }

  // Check for astral projection complications
  checkProjectionComplications(roll, drainRoll, drainValue) {
    const complications = [];
    
    // Check for glitches
    if (roll.glitch) {
      complications.push({
        type: 'minor_complication',
        description: 'Astral distortion - perception difficulties'
      });
    }
    
    if (roll.criticalGlitch) {
      complications.push({
        type: 'major_complication',
        description: 'Astral rift - dangerous entity attracted'
      });
    }
    
    // Check drain not resisted
    if (drainRoll.successes < Math.ceil(drainValue / 2)) {
      complications.push({
        type: 'drain_damage',
        description: `Physical drain damage: ${drainValue - drainRoll.successes}`
      });
    }
    
    return complications;
  }

  // Detect astral forms
  detectAstralForms(character, areaDescription = 'normal light') {
    const willpower = character.willpower || 0;
    const magic = character.magic || 0;
    const perceptionPool = willpower + magic;
    
    // Apply visibility modifiers
    const visibilityMod = this.astralRules.visibilityModifiers[areaDescription] || 0;
    const modifiedPool = perceptionPool + visibilityMod;
    
    const roll = this.dice.rollDice(modifiedPool);
    
    return {
      perceptionPool: perceptionPool,
      visibilityModifier: visibilityMod,
      totalPool: modifiedPool,
      roll: roll,
      success: roll.successes >= 1,
      numberOfForms: roll.successes,
      glitches: roll.glitch || roll.criticalGlitch
    };
  }

  // Astral tracking
  astralTracking(character, target, distance = 0) {
    const intuition = character.intuition || 0;
    const magic = character.magic || 0;
    
    // Tracking test is Intuition + Magic
    const trackingPool = intuition + magic;
    
    // Distance modifier
    let distanceModifier = 0;
    if (distance > 1000) distanceModifier = -4;
    else if (distance > 500) distanceModifier = -2;
    else if (distance > 200) distanceModifier = -1;
    
    const modifiedPool = trackingPool + distanceModifier;
    const roll = this.dice.rollDice(modifiedPool);
    
    return {
      trackingPool: trackingPool,
      distanceModifier: distanceModifier,
      totalPool: modifiedPool,
      roll: roll,
      targetNumber: 3,
      success: roll.successes >= 3, // Need 3+ successes to track
      trackingPossible: roll.successes >= 3
    };
  }

  // Get astral combat modifiers
  getAstralCombatModifiers() {
    return {
      // Astral vs Physical combat
      astralVsPhysical: {
        attackModifier: 0,
        defenseModifier: 0,
        damageModifier: 0
      },
      // Astral vs Astral combat
      astralVsAstral: {
        attackModifier: 0,
        defenseModifier: 0,
        damageModifier: 1
      },
      // Magical items in astral
      magicalItems: {
        'foci': '+1 to attack against wielder',
        'spirits': 'Use spirit\'s Force for defense'
      }
    };
  }

  // Astral barrier interaction
  interactWithAstralBarrier(character, barrier) {
    const willpower = character.willpower || 0;
    const magic = character.magic || 0;
    const resistancePool = willpower + magic;
    
    const roll = this.dice.rollDice(resistancePool);
    
    // Compare barrier Force
    const barrierForce = barrier.force || 4;
    const targetNumber = barrierForce;
    
    const success = roll.successes >= targetNumber;
    const barrierBroken = success && roll.successes >= barrierForce;
    
    return {
      resistancePool: resistancePool,
      roll: roll,
      targetNumber: targetNumber,
      success: success,
      barrierBroken: barrierBroken,
      barrierForce: barrierForce
    };
  }
}

module.exports = ShadowrunAstral;