/**
 * Shadowrun 3rd Edition - Vehicle Database Model
 * Enhanced vehicle model with comprehensive features
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Vehicle = sequelize.define('Vehicle', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false
    },
    type: {
      type: DataTypes.ENUM('ground', 'air', 'water', 'space', 'drone'),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM(
        // Ground Vehicles
        'cycle', 'car', 'truck', 'hovercraft', 'tank', 'm APC',
        // Air Vehicles  
        'plane', 'helicopter', 'VTOL', 'spacecraft',
        // Water Vehicles
        'boat', 'submarine', 'submersible',
        // Drones
        'drone_small', 'drone_medium', 'drone_large', 'drone_micro', 'drone_military'
      ),
      allowNull: false
    },
    // Core Vehicle Attributes
    body: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 20
      }
    },
    armor: {
      type: DataTypes.JSON, // { ballistic: number, impact: number }
      allowNull: false,
      defaultValue: { ballistic: 0, impact: 0 }
    },
    handling: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: -8,
        max: 8
      }
    },
    speed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 1000
      }
    },
    acceleration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 20
      }
    },
    pilot: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 0,
        max: 10
      }
    },
    sensor: {
      type: DataTypes.JSON, // { rating: number, types: string[] }
      allowNull: false,
      defaultValue: { rating: 0, types: [] }
    },
    seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 20
      }
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 10000
      }
    },
    // Vehicle Systems
    weaponMounts: {
      type: DataTypes.JSON, // Array of { type: string, capacity: number, arcs: string[] }
      allowNull: false,
      defaultValue: []
    },
    sensorSuite: {
      type: DataTypes.JSON, // { radar: number, sonar: number, thermographic: number, etc. }
      allowNull: false,
      defaultValue: {}
    },
    countermeasures: {
      type: DataTypes.JSON, // { chaff: number, flare: number, ecw: number, etc. }
      allowNull: false,
      defaultValue: {}
    },
    modularFeatures: {
      type: DataTypes.JSON, // { modular: boolean, hardpoints: number, availableSlots: string[] }
      allowNull: false,
      defaultValue: { modular: false, hardpoints: 0, availableSlots: [] }
    },
    // Performance and Handling
    handlingMods: {
      type: DataTypes.JSON, // { road: number, offroad: number, water: number, air: number }
      allowNull: false,
      defaultValue: {}
    },
    speedMods: {
      type: DataTypes.JSON, // { highway: number, city: number, offroad: number }
      allowNull: false,
      defaultValue: {}
    },
    // Special Features
    specialFeatures: {
      type: DataTypes.JSON, // { stealth: boolean, amphibious: boolean, vacuum: boolean, etc. }
      allowNull: false,
      defaultValue: {}
    },
    // Rigger and Drone Systems
    riggerInterface: {
      type: DataTypes.JSON, // { compatible: boolean, response: number, bandwidth: number }
      allowNull: false,
      defaultValue: { compatible: false, response: 0, bandwidth: 0 }
    },
    droneAI: {
      type: DataTypes.JSON, // { autonomous: boolean, rating: number, skills: string[] }
      allowNull: false,
      defaultValue: { autonomous: false, rating: 0, skills: [] }
    },
    // Vehicle State
    status: {
      type: DataTypes.ENUM('operational', 'damaged', 'destroyed', 'maintenance'),
      allowNull: false,
      defaultValue: 'operational'
    },
    damageTracker: {
      type: DataTypes.JSON, // { current: number, max: number, criticalSystem: string[] }
      allowNull: false,
      defaultValue: { current: 0, max: 0, criticalSystem: [] }
    },
    fuel: {
      type: DataTypes.JSON, // { current: number, max: number, type: string }
      allowNull: false,
      defaultValue: { current: 100, max: 100, type: 'gasoline' }
    },
    // Customization and Upgrades
    modifications: {
      type: DataTypes.JSON, // Array of upgrade objects
      allowNull: false,
      defaultValue: []
    },
    customizations: {
      type: DataTypes.JSON, // Paint job, interior, etc.
      allowNull: false,
      defaultValue: {}
    },
    // Economic Data
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
    legality: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Legal'
    },
    streetIndex: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1.0
    },
    // Description and Notes
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: true
    },
    model: {
      type: DataTypes.STRING,
      allowNull: true
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 2050,
        max: 2070
      }
    },
    // Timestamps
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Vehicles',
    timestamps: true,
    paranoid: false, // Soft delete not needed for vehicles
    indexes: [
      {
        name: 'vehicle_type_category',
        fields: ['type', 'category']
      },
      {
        name: 'vehicle_manufacturer',
        fields: ['manufacturer']
      },
      {
        name: 'vehicle_status',
        fields: ['status']
      }
    ]
  });

  // Define associations
  Vehicle.associate = (models) => {
    // Vehicle to Character relationship (ownership/operation)
    Vehicle.belongsToMany(models.ShadowrunCharacter, {
      through: 'VehicleCharacters',
      foreignKey: 'vehicleId',
      otherKey: 'characterId',
      as: 'characters'
    });

    // Vehicle to Combat relationship
    Vehicle.hasMany(models.Combat, {
      foreignKey: 'vehicleId',
      as: 'combats'
    });

    // Vehicle to Gear relationship (vehicle-mounted gear)
    Vehicle.hasMany(models.ShadowrunGear, {
      foreignKey: 'vehicleId',
      as: 'mountedGear'
    });
  };

  // Instance methods for vehicle management
  Vehicle.prototype.calculateTotalArmor = function() {
    const baseArmor = this.armor;
    const armorMods = this.modifications
      .filter(mod => mod.type === 'armor')
      .reduce((total, mod) => total + mod.value, 0);
    
    return {
      ballistic: Math.max(0, baseArmor.ballistic + armorMods),
      impact: Math.max(0, baseArmor.impact + armorMods)
    };
  };

  Vehicle.prototype.calculateEffectiveHandling = function(drivingSkill, roadType = 'normal') {
    const baseHandling = this.handling;
    const handlingMod = this.handlingMods[roadType] || 0;
    const skillRating = drivingSkill || 0;
    
    return baseHandling + handlingMod + Math.floor(skillRating / 2);
  };

  Vehicle.prototype.calculateEffectiveSpeed = function(environment = 'normal') {
    const baseSpeed = this.speed;
    const speedMod = this.speedMods[environment] || 0;
    
    return Math.max(0, baseSpeed + speedMod);
  };

  Vehicle.prototype.hasCriticalDamage = function() {
    return this.damageTracker.criticalSystem.length > 0;
  };

  Vehicle.prototype.addModification = function(modification) {
    this.modifications.push({
      ...modification,
      installedDate: new Date().toISOString(),
      id: Date.now() + Math.random()
    });
    return this.save();
  };

  Vehicle.prototype.removeModification = function(modificationId) {
    this.modifications = this.modifications.filter(mod => mod.id !== modificationId);
    return this.save();
  };

  Vehicle.prototype.installWeapon = function(weapon, mountIndex) {
    if (mountIndex >= this.weaponMounts.length) {
      throw new Error('Invalid weapon mount index');
    }
    
    this.weaponMounts[mountIndex].weapon = weapon;
    return this.save();
  };

  Vehicle.prototype.calculateMaintenanceCost = function() {
    const baseCost = this.cost * 0.01; // 1% of vehicle value per year
    const damageMultiplier = 1 + (this.damageTracker.current / this.damageTracker.max);
    const ageMultiplier = this.year ? 1 + ((new Date().getFullYear() - this.year) * 0.05) : 1;
    
    return Math.round(baseCost * damageMultiplier * ageMultiplier);
  };

  // Class methods for vehicle management
  Vehicle.getAvailableVehicles = async function(type = null, category = null) {
    const where = { status: 'operational' };
    if (type) where.type = type;
    if (category) where.category = category;
    
    return await this.findAll({ where });
  };

  Vehicle.getMilitaryVehicles = async function() {
    const categories = ['tank', 'm APC', 'drone_military', 'helicopter', 'plane'];
    return await this.findAll({
      where: {
        category: { [sequelize.Sequelize.Op.in]: categories },
        status: 'operational'
      }
    });
  };

  Vehicle.createMilitaryVehicle = async function(vehicleData) {
    const militaryDefaults = {
      body: 15,
      armor: { ballistic: 20, impact: 15 },
      handling: -1,
      speed: 80,
      acceleration: 4,
      cost: 500000,
      availability: 12,
      legality: 'Restricted-Military',
      streetIndex: 3.0,
      specialFeatures: {
        armorPlating: true,
        reinforcedChassis: true,
        NBCProtection: true
      }
    };
    
    return await this.create({ ...vehicleData, ...militaryDefaults });
  };

  return Vehicle;
};