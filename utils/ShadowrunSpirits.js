// Shadowrun 3rd Edition Spirit System
const ShadowrunDice = require('./ShadowrunDice');

class ShadowrunSpirits {
  constructor() {
    this.dice = new ShadowrunDice();
    
    // Hermetic Mages summon Elemental spirits
    this.hermeticSpirits = {
      AIR_ELEMENTAL: 'AIR_ELEMENTAL',
      EARTH_ELEMENTAL: 'EARTH_ELEMENTAL',
      FIRE_ELEMENTAL: 'FIRE_ELEMENTAL',
      WATER_ELEMENTAL: 'WATER_ELEMENTAL',
      MAN_ELEMENTAL: 'MAN_ELEMENTAL'
    };
    
    // Shamans summon Nature spirits by domain
    this.shamanicSpirits = {
      MAN_SPIRIT: 'MAN_SPIRIT',
      WATER_SPIRIT: 'WATER_SPIRIT',
      LAND_SPIRIT: 'LAND_SPIRIT',
      BEAST_SPIRIT: 'BEAST_SPIRIT',
      PLANT_SPIRIT: 'PLANT_SPIRIT'
    };
    
    // All possible spirits for reference
    this.spiritTypes = {
      ...this.hermeticSpirits,
      ...this.shamanicSpirits
    };
    
    // Spirit domains for shamans
    this.spiritDomains = {
      'MAN_SPIRIT': 'urban',
      'WATER_SPIRIT': 'water',
      'LAND_SPIRIT': 'earth',
      'BEAST_SPIRIT': 'wilderness',
      'PLANT_SPIRIT': 'nature'
    };
    
    this.spiritRanks = {
      MINION: 'Minion',
      LESSER: 'Lesser',
      GREATER: 'Greater',
      POWERFUL: 'Powerful'
    };
    
    this.spiritServices = {
      GUARD: 'Guard',
      RECON: 'Reconnaissance', 
      HEAL: 'Heal',
      RESIST_MAGIC: 'Resist Magic',
      PROTECT: 'Protect',
      DELIVER_MESSAGE: 'Deliver Message',
      FIGHT: 'Fight',
      SNEAK: 'Sneak'
    };
  }

  // Summon a spirit
  summonSpirit(character, spiritType, force, services = 1) {
    // Check if character can summon spirits
    const spiritControl = character.spiritControl || character.skills?.['Spirit Control'] || 0;
    if (spiritControl === 0) {
      throw new Error('Character cannot summon spirits - no Spirit Control skill');
    }

    // Check if character can summon this specific spirit type based on tradition
    if (!this.canSummonSpirit(character, spiritType)) {
      const tradition = character.tradition || 'None';
      throw new Error(`Character with ${tradition} tradition cannot summon ${spiritType}`);
    }

    // Validate force level
    const maxForce = Math.min(spiritControl, 6);
    if (force > maxForce) {
      throw new Error(`Cannot summon spirit with force ${force} - max is ${maxForce}`);
    }

    // Calculate drain
    const drainValue = this.calculateSpiritDrain(force, services);
    const drainResistance = this.calculateDrainResistance(character);
    
    // Make summoning test
    const summoningPool = spiritControl + force;
    const result = this.dice.rollDice(summoningPool);
    const successes = result.successes;
    const glitch = result.glitch;
    const criticalGlitch = result.criticalGlitch;

    // Make drain resistance test
    const drainResult = this.dice.rollDice(drainResistance);
    const drainSuccesses = drainResult.successes;

    // Calculate services
    const maxServices = Math.floor(force / 2);
    const actualServices = Math.min(services, maxServices);

    const summonResult = {
      success: successes > 0 && !glitch,
      action: 'summon_spirit',
      spiritType: spiritType,
      force: force,
      requestedServices: services,
      actualServices: actualServices,
      summoningPool: summoningPool,
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
      spirit: this.generateSpirit(spiritType, force, actualServices),
      timeToSummon: force * 10 // minutes
    };

    // Update character spirit count
    character.spiritsSummoned = (character.spiritsSummoned || 0) + 1;

    return summonResult;
  }

  // Calculate spirit drain
  calculateSpiritDrain(force, services) {
    // Base drain is Force ÷ 2, rounded up
    let drain = Math.ceil(force / 2);
    
    // Add 1 drain per service beyond the first
    if (services > 1) {
      drain += services - 1;
    }
    
    // Min 1 drain
    return Math.max(1, drain);
  }

  // Generate spirit stats and abilities
  generateSpirit(spiritType, force, services) {
    // Convert underscore format to readable format for internal lookup
    const lookupType = spiritType.replace(/_/g, ' ');
    
    // Determine tradition based on spirit type
    let tradition = 'Unknown';
    if (['AIR_ELEMENTAL', 'EARTH_ELEMENTAL', 'FIRE_ELEMENTAL', 'WATER_ELEMENTAL', 'MAN_ELEMENTAL'].includes(spiritType)) {
      tradition = 'Hermetic';
    } else if (['MAN_SPIRIT', 'WATER_SPIRIT', 'LAND_SPIRIT', 'BEAST_SPIRIT', 'PLANT_SPIRIT'].includes(spiritType)) {
      tradition = 'Shamanic';
    }
    // Hermetic Elemental Spirits
    const hermeticSpirits = {
      'Air Spirit': {
        attributes: {
          strength: 2 + Math.floor(force / 2),
          agility: 4 + force,
          body: 1 + Math.floor(force / 2),
          charisma: 2,
          intuition: 3 + Math.floor(force / 2),
          logic: 1,
          willpower: 3 + Math.floor(force / 2),
          reaction: 4 + force,
          edge: force
        },
        skills: {
          'Invisibility': force,
          'Concealment': force,
          'Guard': force,
          'Quickness': force
        },
        powers: [
          'Astral Form',
          'Concealment',
          'Flight'
        ],
        services: this.getAvailableServices(services),
      tradition: tradition,
      type: spiritType
      },
      'Earth Spirit': {
        attributes: {
          strength: 4 + force,
          agility: 2,
          body: 4 + force,
          charisma: 2,
          intuition: 2,
          logic: 1,
          willpower: 3 + Math.floor(force / 2),
          reaction: 2,
          edge: force
        },
        skills: {
          'Armor': force + 2,
          'Guard': force,
          'Pain Resistance': force,
          'Resist Pain': force
        },
        powers: [
          'Astral Form',
          'Earthquake',
          'Guard',
          'Wall Walking'
        ],
        services: this.getAvailableServices(services)
      },
      'Fire Spirit': {
        attributes: {
          strength: 3 + Math.floor(force / 2),
          agility: 3 + Math.floor(force / 2),
          body: 2,
          charisma: 2,
          intuition: 3,
          logic: 1,
          willpower: 4 + force,
          reaction: 3 + Math.floor(force / 2),
          edge: force
        },
        skills: {
          'Fire': force + 2,
          'Confusion': force,
          'Fear': force,
          'Guard': force
        },
        powers: [
          'Astral Form',
          'Fear',
          'Fire Aura',
          'Engulf'
        ],
        services: this.getAvailableServices(services)
      },
      'Water Spirit': {
        attributes: {
          strength: 3 + Math.floor(force / 2),
          agility: 3,
          body: 3 + force,
          charisma: 2,
          intuition: 3 + Math.floor(force / 2),
          logic: 1,
          willpower: 3 + Math.floor(force / 2),
          reaction: 3,
          edge: force
        },
        skills: {
          'Water Breathing': force,
          'Swimming': force,
          'Concealment': force,
          'Guard': force
        },
        powers: [
          'Astral Form',
          'Concealment',
          'Water Form',
          'Whirlpool'
        ],
        services: this.getAvailableServices(services)
      },
      'Man Spirit': {
        attributes: {
          strength: 3 + Math.floor(force / 2),
          agility: 3,
          body: 3,
          charisma: 3 + force,
          intuition: 3 + Math.floor(force / 2),
          logic: 3 + Math.floor(force / 2),
          willpower: 3 + Math.floor(force / 2),
          reaction: 3,
          edge: force
        },
        skills: {
          'Concentration': force,
          'Intimidation': force,
          'Persuasion': force,
          'Willpower': force
        },
        powers: [
          'Astral Form',
          'Concentration',
          'Mental Manipulation',
          'Possession'
        ],
        services: this.getAvailableServices(services)
      }
    };

    // Shamanic Nature Spirits  
    const shamanicSpirits = {
      'Beast Spirit': {
        attributes: {
          strength: 4 + force,
          agility: 3 + Math.floor(force / 2),
          body: 3 + Math.floor(force / 2),
          charisma: 1,
          intuition: 3,
          logic: 1,
          willpower: 3,
          reaction: 3 + Math.floor(force / 2),
          edge: force
        },
        skills: {
          'Track': force,
          'Climb': force,
          'Jump': force,
          'Pounce': force
        },
        powers: [
          'Astral Form',
          'Track',
          'Pounce',
          'Camouflage'
        ],
        services: this.getAvailableServices(services)
      },
      'Plant Spirit': {
        attributes: {
          strength: 2 + force,
          agility: 1,
          body: 4 + force,
          charisma: 2,
          intuition: 2,
          logic: 1,
          willpower: 3 + Math.floor(force / 2),
          reaction: 1,
          edge: force
        },
        skills: {
          'Immunity to Normal Weapons': force,
          'Poison': force,
          'Regeneration': force,
          'Entangle': force
        },
        powers: [
          'Astral Form',
          'Entangle',
          'Poison',
          'Regeneration'
        ],
        services: this.getAvailableServices(services)
      },
      'Water Spirit': {
        attributes: {
          strength: 3 + Math.floor(force / 2),
          agility: 3,
          body: 3 + force,
          charisma: 2,
          intuition: 3 + Math.floor(force / 2),
          logic: 1,
          willpower: 3 + Math.floor(force / 2),
          reaction: 3,
          edge: force
        },
        skills: {
          'Water Breathing': force,
          'Swimming': force,
          'Concealment': force,
          'Guard': force
        },
        powers: [
          'Astral Form',
          'Concealment',
          'Water Form',
          'Whirlpool'
        ],
        services: this.getAvailableServices(services)
      },
      'Man Spirit': {
        attributes: {
          strength: 3 + Math.floor(force / 2),
          agility: 3,
          body: 3,
          charisma: 3 + force,
          intuition: 3 + Math.floor(force / 2),
          logic: 3 + Math.floor(force / 2),
          willpower: 3 + Math.floor(force / 2),
          reaction: 3,
          edge: force
        },
        skills: {
          'Concentration': force,
          'Intimidation': force,
          'Persuasion': force,
          'Willpower': force
        },
        powers: [
          'Astral Form',
          'Concentration',
          'Mental Manipulation',
          'Possession'
        ],
        services: this.getAvailableServices(services)
      },
      'Fire Spirit': {
        attributes: {
          strength: 3 + Math.floor(force / 2),
          agility: 3 + Math.floor(force / 2),
          body: 2,
          charisma: 2,
          intuition: 3,
          logic: 1,
          willpower: 4 + force,
          reaction: 3 + Math.floor(force / 2),
          edge: force
        },
        skills: {
          'Fire': force + 2,
          'Confusion': force,
          'Fear': force,
          'Guard': force
        },
        powers: [
          'Astral Form',
          'Fear',
          'Fire Aura',
          'Engulf'
        ],
        services: this.getAvailableServices(services)
      }
    };

    // Return the appropriate spirit based on type
    if (hermeticSpirits[spiritType]) {
      return hermeticSpirits[spiritType];
    } else if (shamanicSpirits[spiritType]) {
      return shamanicSpirits[spiritType];
    } else {
      // Fallback to Air Spirit if unknown type
      return hermeticSpirits['Air Spirit'];
    }
  }

  // Get available spirit services
  getAvailableServices(services) {
    const allServices = Object.values(this.spiritServices);
    return allServices.slice(0, services);
  }

  // Bind a spirit (extend duration)
  async bindSpirit(character, spirit) {
    const bindingSkill = character.bindingSkill || 0;
    const spiritForce = spirit.force;

    if (bindingSkill === 0) {
      throw new Error('Character cannot bind spirits - no Binding skill');
    }

    const bindingPool = bindingSkill + spiritForce;
    const result = this.dice.rollDice(bindingPool);
    const successes = result.successes;

    // Calculate extended duration
    const baseDuration = 1 + Math.floor(successes / 2);
    const extendedDuration = baseDuration * 28; // days

    const bindingResult = {
      action: 'bind_spirit',
      spirit: spirit,
      bindingPool: bindingPool,
      roll: result,
      successes: successes,
      duration: extendedDuration,
      drain: {
        value: Math.ceil(spiritForce / 2),
        resistancePool: this.calculateDrainResistance(character)
      }
    };

    return bindingResult;
  }

  // Command a spirit
  async commandSpirit(character, spirit, command) {
    const spiritForce = spirit.force;
    const commandPool = character.charisma + spiritForce;
    
    const result = this.dice.rollDice(commandPool);
    const successes = result.successes;

    // Check if spirit resists
    const resistanceThreshold = Math.ceil(spiritForce / 2);
    const resists = successes < resistanceThreshold;

    const commandResult = {
      action: 'command_spirit',
      spirit: spirit,
      command: command,
      commandPool: commandPool,
      roll: result,
      successes: successes,
      resists: resists,
      effect: resists ? 'Spirit resists command' : 'Spirit obeys command'
    };

    return commandResult;
  }

  // Calculate drain resistance
  calculateDrainResistance(character) {
    const willpower = character.willpower || 3;
    const magic = character.magic || 0;
    
    // Add centering bonus if available
    const centeringBonus = character.centering?.bonus || 0;
    
    // Add spirit binding bonus if applicable
    const bindingBonus = character.bindingBonus || 0;
    
    return willpower + magic + centeringBonus + bindingBonus;
  }

  // Get available spirits based on tradition
  getAvailableSpirits(tradition) {
    switch(tradition) {
      case 'Hermetic':
        return Object.values(this.hermeticSpirits);
      case 'Shamanic':
        return Object.values(this.shamanicSpirits);
      default:
        // For traditions without specific spirit types, return all
        return Object.values(this.spiritTypes);
    }
  }

  // Check if character can summon specific spirit type based on tradition
  canSummonSpirit(character, spiritType) {
    // Handle both formats: 'AIR_ELEMENTAL' and 'AIR_ELEMENTAL'
    const normalizedSpiritType = spiritType.includes('_') ? 
      spiritType.replace(/_/g, ' ').replace(/\w/g, l => l.toUpperCase()) : 
      spiritType;
    const tradition = character.tradition || 'None';
    
    switch(tradition) {
      case 'Hermetic':
        return Object.values(this.hermeticSpirits).includes(spiritType) || Object.values(this.hermeticSpirits).includes(normalizedSpiritType);
      case 'Shamanic':
        return Object.values(this.shamanicSpirits).includes(spiritType) || Object.values(this.shamanicSpirits).includes(normalizedSpiritType);
      default:
        // Traditions without spirit restrictions can summon any
        return Object.values(this.spiritTypes).includes(spiritType) || Object.values(this.spiritTypes).includes(normalizedSpiritType);
    }
  }

  // Get spirit domain for shamanic spirits
  getSpiritDomain(spiritType) {
    return this.spiritDomains[spiritType] || 'general';
  }

  // Get spirits available for a specific domain
  getSpiritsByDomain(domain) {
    return Object.entries(this.spiritDomains)
      .filter(([_, spiritDomain]) => spiritDomain === domain)
      .map(([spiritType, _]) => spiritType);
  }

  // Get spirit's combat pool
  getSpiritCombatPool(spirit) {
    const force = spirit.force || 1;
    return force + Math.floor(force / 2);
  }

  // Get spirit's initiative
  getSpiritInitiative(spirit) {
    const force = spirit.force || 1;
    const reaction = spirit.reaction || force;
    return reaction + force;
  }

  // Get spirit's damage resistance
  getSpiritDamageResistance(spirit) {
    const body = spirit.body || 1;
    const force = spirit.force || 1;
    return Math.ceil((body + force) / 2);
  }

  // Spirit combat actions
  spiritCombatAction(spirit, actionType, target = null) {
    const combatPool = this.getSpiritCombatPool(spirit);
    const initiative = this.getSpiritInitiative(spirit);
    
    const action = {
      type: actionType,
      spirit: spirit,
      combatPool: combatPool,
      initiative: initiative,
      possibleActions: this.getPossibleCombatActions(spirit, actionType)
    };

    if (target) {
      action.target = target;
      action.attackPool = combatPool;
    }

    return action;
  }

  // Get possible combat actions for spirit
  getPossibleCombatActions(spirit, actionType) {
    const force = spirit.force || 1;
    const actions = [];

    switch(actionType) {
      case 'melee':
        actions.push({
          type: 'Punch',
          damage: 'S',
          ap: -force
        });
        if (spirit.powers.includes('Pounce')) {
          actions.push({
            type: 'Pounce',
            damage: 'S+2',
            ap: -force - 1
          });
        }
        break;
      case 'ranged':
        if (spirit.powers.includes('Fire')) {
          actions.push({
            type: 'Fire Attack',
            damage: 'S',
            ap: force
          });
        }
        break;
      case 'special':
        actions.push(...spirit.powers.map(power => ({
          type: power,
          effect: this.getPowerEffect(power, force)
        })));
        break;
    }

    return actions;
  }

  // Get power effect description
  getPowerEffect(power, force) {
    const effects = {
      'Fear': 'Target makes Willpower + Logic test or flees for (Force) Combat Turns',
      'Fire Aura': 'Anyone engaging in melee takes (Force)S damage',
      'Invisibility': 'Spirit becomes invisible',
      'Concealment': 'Spirit gains + dice to stealth tests',
      'Guard': 'Spirit defends designated area',
      'Track': 'Spirit can track by scent'
    };

    return effects[power] || `${power} effect`;
  }
}

module.exports = ShadowrunSpirits;