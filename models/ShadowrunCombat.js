// Shadowrun 3rd Edition Combat System
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShadowrunCombat = sequelize.define('ShadowrunCombat', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // Combat Session Info
  session_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  character_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ShadowrunCharacters',
      key: 'id'
    }
  },
  
  // Combat State
  initiative: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  initiative_passes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  combat_pool: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  combat_pool_offense: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  combat_pool_defense: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  
  // Condition Monitor
  physical_monitor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  physical_damage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  stun_monitor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  stun_damage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  
  // Combat Status
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  current_phase: {
    type: DataTypes.ENUM('ready', 'action', 'defend', 'damage', 'end'),
    allowNull: false,
    defaultValue: 'ready'
  },
  
  // Combat Log
  combat_log: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
});

// Shadowrun Combat Methods
ShadowrunCombat.prototype.calculateInitiative = function() {
  // Initiative = Reaction + Intuition + 1d6
  const reaction = this.character.reaction || 1;
  const intuition = this.character.intuition || 1;
  const diceRoll = Math.floor(Math.random() * 6) + 1;
  
  this.initiative = reaction + intuition + diceRoll;
  this.initiative_passes = Math.floor(this.initiative / 10) + 1;
  
  return {
    total: this.initiative,
    dice: diceRoll,
    passes: this.initiative_passes
  };
};

ShadowrunCombat.prototype.allocateCombatPool = function(offense = 0, defense = 0) {
  const totalPool = this.combat_pool;
  const totalAllocated = offense + defense;
  
  if (totalAllocated > totalPool) {
    throw new Error(`Cannot allocate ${totalAllocated} points. Only ${totalPool} available.`);
  }
  
  this.combat_pool_offense = offense;
  this.combat_pool_defense = defense;
  this.combat_pool_remaining = totalPool - totalAllocated;
  
  return {
    offense: offense,
    defense: defense,
    remaining: this.combat_pool_remaining
  };
};

ShadowrunCombat.prototype.sufferDamage = function(damage, damageType = 'physical') {
  if (damageType === 'physical') {
    this.physical_damage += damage;
    if (this.physical_damage >= this.physical_monitor) {
      this.is_active = false;
      return { result: 'unconscious', total_damage: this.physical_damage };
    }
  } else if (damageType === 'stun') {
    this.stun_damage += damage;
    if (this.stun_damage >= this.stun_monitor) {
      this.is_active = false;
      return { result: 'unconscious', total_damage: this.stun_damage };
    }
  }
  
  return { 
    result: 'damaged', 
    total_damage: damageType === 'physical' ? this.physical_damage : this.stun_damage,
    damage_type: damageType 
  };
};

ShadowrunCombat.prototype.healDamage = function(damage, damageType = 'physical') {
  if (damageType === 'physical') {
    this.physical_damage = Math.max(0, this.physical_damage - damage);
  } else if (damageType === 'stun') {
    this.stun_damage = Math.max(0, this.stun_damage - damage);
  }
  
  if (!this.is_active && this.physical_damage < this.physical_monitor && this.stun_damage < this.stun_monitor) {
    this.is_active = true;
  }
  
  return { 
    healed_damage: damage,
    remaining_damage: damageType === 'physical' ? this.physical_damage : this.stun_damage 
  };
};

ShadowrunCombat.prototype.getCombatStatus = function() {
  return {
    initiative: this.initiative,
    passes: this.initiative_passes,
    combat_pool: {
      total: this.combat_pool,
      offense: this.combat_pool_offense,
      defense: this.combat_pool_defense,
      remaining: this.combat_pool_remaining || 0
    },
    condition_monitor: {
      physical: {
        current: this.physical_damage,
        max: this.physical_monitor,
        remaining: this.physical_monitor - this.physical_damage
      },
      stun: {
        current: this.stun_damage,
        max: this.stun_monitor,
        remaining: this.stun_monitor - this.stun_damage
      }
    },
    is_active: this.is_active,
    phase: this.current_phase
  };
};

ShadowrunCombat.prototype.addActionToLog = function(action) {
  if (!this.combat_log) {
    this.combat_log = [];
  }
  
  this.combat_log.push({
    timestamp: new Date().toISOString(),
    action: action
  });
};

// Enhanced combat action methods
ShadowrunCombat.prototype.performAttack = function(attacker, target, skill, accuracy = 0) {
  // Simple attack test simulation
  const attackPool = attacker.agility + attacker.getSkillRating(skill) + accuracy;
  const defensePool = target.reaction + target.intuition;
  
  const attackRolls = this.rollDice(attackPool);
  const defenseRolls = this.rollDice(defensePool);
  
  const attackSuccesses = this.countSuccesses(attackRolls);
  const defenseSuccesses = this.countSuccesses(defenseRolls);
  
  const netSuccesses = attackSuccesses - defenseSuccesses;
  const hit = netSuccesses > 0;
  
  // Log the attack
  this.addActionToLog({
    type: 'attack',
    attacker: attacker.name,
    target: target.name,
    skill: skill,
    accuracy: accuracy,
    attackSuccesses: attackSuccesses,
    defenseSuccesses: defenseSuccesses,
    netSuccesses: netSuccesses,
    hit: hit
  });
  
  return {
    hit: hit,
    netSuccesses: netSuccesses,
    attackRolls: attackRolls,
    defenseRolls: defenseRolls
  };
};

ShadowrunCombat.prototype.performDefense = function(defender, attackType = 'melee') {
  const defensePool = defender.reaction + defender.intuition + this.combat_pool_defense;
  const defenseRolls = this.rollDice(defensePool);
  const defenseSuccesses = this.countSuccesses(defenseRolls);
  
  this.addActionToLog({
    type: 'defense',
    character: defender.name,
    attackType: attackType,
    defenseSuccesses: defenseSuccesses,
    combatPoolUsed: this.combat_pool_defense
  });
  
  return {
    defenseSuccesses: defenseSuccesses,
    defenseRolls: defenseRolls
  };
};

ShadowrunCombat.prototype.calculateDamage = function(baseDamage, armor = 0) {
  // Damage resistance test
  const resistancePool = armor + 1; // +1 for body attribute in simplified version
  const resistanceRolls = this.rollDice(resistancePool);
  const resistanceSuccesses = this.countSuccesses(resistanceRolls);
  
  const damageTaken = Math.max(1, baseDamage - resistanceSuccesses);
  
  return {
    damageTaken: damageTaken,
    resistanceSuccesses: resistanceSuccesses,
    soaked: baseDamage - damageTaken
  };
};

ShadowrunCombat.prototype.useCombatPool = function(amount, type = 'offense') {
  if (amount > this.combat_pool_remaining) {
    throw new Error(`Not enough combat pool points. Available: ${this.combat_pool_remaining}`);
  }
  
  if (type === 'offense') {
    this.combat_pool_offense += amount;
  } else if (type === 'defense') {
    this.combat_pool_defense += amount;
  }
  
  this.combat_pool_remaining -= amount;
  
  return {
    type: type,
    amount: amount,
    remaining: this.combat_pool_remaining
  };
};

ShadowrunCombat.prototype.resetCombatPool = function() {
  const totalPool = this.combat_pool;
  this.combat_pool_offense = 0;
  this.combat_pool_defense = 0;
  this.combat_pool_remaining = totalPool;
  
  return {
    total: totalPool,
    remaining: this.combat_pool_remaining
  };
};

// Helper methods for dice rolling
ShadowrunCombat.prototype.rollDice = function(pool) {
  const rolls = [];
  for (let i = 0; i < pool; i++) {
    rolls.push(Math.floor(Math.random() * 6) + 1);
  }
  return rolls;
};

ShadowrunCombat.prototype.countSuccesses = function(rolls) {
  return rolls.filter(roll => roll >= 5).length;
};

// Combat phase management
ShadowrunCombat.prototype.nextPhase = function() {
  const phases = ['ready', 'action', 'defend', 'damage', 'end'];
  const currentIndex = phases.indexOf(this.current_phase);
  this.current_phase = phases[(currentIndex + 1) % phases.length];
  
  this.addActionToLog({
    type: 'phase_change',
    from: phases[currentIndex],
    to: this.current_phase
  });
  
  return this.current_phase;
};

ShadowrunCombat.prototype.endCombat = function() {
  this.is_active = false;
  this.current_phase = 'end';
  
  this.addActionToLog({
    type: 'combat_end',
    final_status: this.is_active ? 'completed' : 'terminated'
  });
  
  return {
    status: 'ended',
    final_damage: {
      physical: this.physical_damage,
      stun: this.stun_damage
    }
  };
};

// Special combat maneuvers
ShadowrunCombat.prototype.performCalledShot = function(attacker, target, skill, bodyLocation = 'head') {
  // Called shot: -2 dice, +2 power on hit
  const result = this.performAttack(attacker, target, skill, -2);
  
  if (result.hit) {
    // Add damage bonus for called shot
    const damageBonus = bodyLocation === 'head' ? 4 : 2;
    result.damageBonus = damageBonus;
    
    this.addActionToLog({
      type: 'called_shot',
      attacker: attacker.name,
      target: target.name,
      location: bodyLocation,
      damageBonus: damageBonus
    });
  }
  
  return result;
};

ShadowrunCombat.prototype.performFullAuto = function(attacker, target, skill, burst = 'long') {
  // Full auto burst: +3 dice, +2 damage, multiple targets possible
  const accuracyBonus = burst === 'long' ? 3 : 1;
  const result = this.performAttack(attacker, target, skill, accuracyBonus);
  
  if (result.hit) {
    result.damageBonus = burst === 'long' ? 2 : 1;
    
    this.addActionToLog({
      type: 'full_auto',
      attacker: attacker.name,
      target: target.name,
      burstType: burst,
      damageBonus: result.damageBonus
    });
  }
  
  return result;
};

module.exports = ShadowrunCombat;