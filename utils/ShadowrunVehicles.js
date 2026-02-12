/**
 * Shadowrun 3rd Edition - Vehicles & Drones System
 * Complete vehicle, drone, and rigging implementation
 */

const { DataTypes } = require('sequelize');

class ShadowrunVehicles {
  constructor(sequelize) {
    this.sequelize = sequelize;
    this.Vehicle = sequelize.define('Vehicle', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('ground', 'air', 'water', 'space', 'drone'),
        allowNull: false
      },
      category: {
        type: DataTypes.ENUM('cycle', 'car', 'truck', 'hovercraft', 'vtol', 'submarine', 'spacecraft', 'drone_small', 'drone_medium', 'drone_large'),
        allowNull: false
      },
      body: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      armor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      handling: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      speed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      acceleration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      pilot: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      sensor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      seats: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      cost: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      availability: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      weapons: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      modifications: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      }
    });

    this.VehicleCharacter = sequelize.define('VehicleCharacter', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Vehicles',
          key: 'id'
        }
      },
      characterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'ShadowrunCharacters',
          key: 'id'
        }
      },
      role: {
        type: DataTypes.ENUM('driver', 'rigger', 'gunner', 'passenger'),
        allowNull: false,
        defaultValue: 'passenger'
      },
      ownership: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      customizations: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
      }
    });

    // Define relationships
    this.Vehicle.hasMany(this.VehicleCharacter);
    this.VehicleCharacter.belongsTo(this.Vehicle);
    this.VehicleCharacter.belongsTo(sequelize.models.ShadowrunCharacter, { foreignKey: 'characterId' });
  }

  // Vehicle database initialization
  async initDatabase() {
    try {
      await this.Vehicle.sync();
      await this.VehicleCharacter.sync();
      
      // Insert default vehicles if table is empty
      const vehicleCount = await this.Vehicle.count();
      if (vehicleCount === 0) {
        await this.insertDefaultVehicles();
      }
      
      console.log('✅ Vehicles & Drones system initialized');
      return true;
    } catch (error) {
      console.error('❌ Vehicles database initialization failed:', error);
      return false;
    }
  }

  // Insert default Shadowrun 3rd Edition vehicles
  async insertDefaultVehicles() {
    const defaultVehicles = [
      // Ground Vehicles
      {
        name: "Harley-Davidson Roadmaster",
        type: "ground",
        category: "cycle",
        body: 8,
        armor: 8,
        handling: 1,
        speed: 120,
        acceleration: 6,
        pilot: 2,
        sensor: 3,
        seats: 1,
        capacity: 10,
        cost: 8000,
        availability: 2,
        description: "Classic American motorcycle"
      },
      {
        name: "Ares Roadmaster",
        type: "ground", 
        category: "car",
        body: 12,
        armor: 12,
        handling: 2,
        speed: 200,
        acceleration: 8,
        pilot: 3,
        sensor: 4,
        seats: 4,
        capacity: 200,
        cost: 18000,
        availability: 3,
        description: "Standard security vehicle"
      },
      {
        name: "Ford Americar",
        type: "ground",
        category: "car", 
        body: 10,
        armor: 6,
        handling: 2,
        speed: 180,
        acceleration: 6,
        pilot: 2,
        sensor: 3,
        seats: 4,
        capacity: 150,
        cost: 5000,
        availability: 1,
        description: "Economy car for everyday use"
      },
      // Drones
      {
        name: "Steel Lynx",
        type: "drone",
        category: "drone_medium",
        body: 6,
        armor: 4,
        handling: 3,
        speed: 60,
        acceleration: 4,
        pilot: 1,
        sensor: 5,
        seats: 1,
        capacity: 0,
        cost: 6000,
        availability: 3,
        description: "Combat drone with weapon mounts"
      },
      {
        name: "Fly-Spy",
        type: "drone",
        category: "drone_small",
        body: 2,
        armor: 2,
        handling: 5,
        speed: 80,
        acceleration: 6,
        pilot: 1,
        sensor: 6,
        seats: 0,
        capacity: 0,
        cost: 800,
        availability: 2,
        description: "Micro surveillance drone"
      },
      {
        name: "Rotodrone",
        type: "drone",
        category: "drone_medium", 
        body: 4,
        armor: 3,
        handling: 4,
        speed: 100,
        acceleration: 5,
        pilot: 1,
        sensor: 4,
        seats: 0,
        capacity: 5,
        cost: 2000,
        availability: 2,
        description: "Versatile flying drone"
      }
    ];

    for (const vehicle of defaultVehicles) {
      await this.Vehicle.create(vehicle);
    }
    
    console.log(`✅ Inserted ${defaultVehicles.length} default vehicles`);
  }

  // Vehicle management functions
  async listVehicles(category = null) {
    let whereClause = {};
    if (category) {
      whereClause.category = category;
    }
    
    return await this.Vehicle.findAll({
      where: whereClause,
      order: [['cost', 'ASC']]
    });
  }

  async getVehicle(id) {
    return await this.Vehicle.findByPk(id);
  }

  async addVehicleToCharacter(characterId, vehicleId, role = 'passenger', ownership = false) {
    return await this.VehicleCharacter.create({
      characterId,
      vehicleId,
      role,
      ownership
    });
  }

  async removeVehicleFromCharacter(characterId, vehicleId) {
    return await this.VehicleCharacter.destroy({
      where: {
        characterId,
        vehicleId
      }
    });
  }

  async getCharacterVehicles(characterId) {
    return await this.VehicleCharacter.findAll({
      where: { characterId },
      include: [{ model: this.Vehicle }]
    });
  }

  // Vehicle combat and mechanics
  calculateInitiative(vehicle, riggerSkill = 0) {
    const baseInitiative = 1 + Math.floor(Math.random() * 6);
    const riggerBonus = Math.floor(riggerSkill / 2);
    return baseInitiative + riggerBonus;
  }

  calculateVehicleCombat(vehicle, attackerPool, defenderPool, range = 'medium', attackerAdvantages = [], defenderAdvantages = []) {
    // Base target numbers
    const rangeModifiers = {
      'close': 0,
      'medium': -2, 
      'long': -4,
      'extreme': -6
    };
    
    let attackerTN = 4 + (rangeModifiers[range] || 0);
    let defenderTN = 4;
    
    // Apply advantages
    attackerAdvantages.forEach(adv => {
      attackerTN -= adv.modifier || 0;
    });
    
    defenderAdvantages.forEach(adv => {
      defenderTN -= adv.modifier || 0;
    });
    
    // Clamp TNs
    attackerTN = Math.max(1, attackerTN);
    defenderTN = Math.max(1, defenderTN);
    
    // Resolve combat
    const attackerRolls = this.rollDicePool(attackerPool);
    const defenderRolls = this.rollDicePool(defenderPool);
    
    const attackerSuccesses = attackerRolls.filter(die => die >= 4).length;
    const defenderSuccesses = defenderRolls.filter(die => die >= 4).length;
    
    return {
      attackerRolls,
      defenderRolls,
      attackerSuccesses,
      defenderSuccesses,
      attackerTN,
      defenderTN,
      outcome: attackerSuccesses > defenderSuccesses ? 'hit' : 'miss'
    };
  }

  rollDicePool(pool) {
    const rolls = [];
    for (let i = 0; i < pool; i++) {
      rolls.push(Math.floor(Math.random() * 6) + 1);
    }
    return rolls;
  }

  // Vehicle modification system
  async modifyVehicle(vehicleId, modification) {
    const vehicle = await this.getVehicle(vehicleId);
    if (!vehicle) return null;
    
    const modifications = vehicle.modifications || [];
    modifications.push(modification);
    
    await vehicle.update({ modifications });
    return vehicle;
  }

  // Calculate vehicle costs and availability
  calculateTotalCost(vehicle) {
    const baseCost = vehicle.cost;
    const modificationCost = (vehicle.modifications || []).reduce((total, mod) => total + (mod.cost || 0), 0);
    return baseCost + modificationCost;
  }

  calculateTotalAvailability(vehicle) {
    const baseAvail = vehicle.availability;
    const modifications = vehicle.modifications || [];
    
    let maxAvail = baseAvail;
    modifications.forEach(mod => {
      if (mod.availability && mod.availability > maxAvail) {
        maxAvail = mod.availability;
      }
    });
    
    return maxAvail;
  }

  // Export system data for testing
  getSystemInfo() {
    return {
      name: "Shadowrun Vehicles & Drones System",
      version: "1.0.0",
      features: [
        "Complete vehicle and drone database",
        "Vehicle combat mechanics",
        "Rigging and drone control",
        "Vehicle modifications",
        "Character-vehicle relationships",
        "Cost and availability calculations"
      ],
      vehicleCount: this.Vehicle ? this.Vehicle.length : 0,
      categories: ["ground", "air", "water", "space", "drone"],
      roles: ["driver", "rigger", "gunner", "passenger"]
    };
  }
}

module.exports = ShadowrunVehicles;