/**
 * Shadowrun 3rd Edition - Vehicles Discord Commands
 * Complete vehicle and drone management interface
 */

const { EmbedBuilder } = require('discord.js');
const ShadowrunVehicles = require('../utils/ShadowrunVehicles');

module.exports = {
  name: 'vehicles',
  description: 'Vehicle and drone management commands for Shadowrun 3rd Edition',
  aliases: ['vehicle', 'drone', 'veh'],
  usage: '<subcommand> [options]',
  permissions: [],
  guildOnly: false,

  async execute(message, args, client) {
    const vehicles = new ShadowrunVehicles();

    if (!args.length) {
      return await this.showHelp(message);
    }

    const subcommand = args[0].toLowerCase();
    const remainingArgs = args.slice(1);

    try {
      switch (subcommand) {
        case 'list':
        case 'ls':
          await this.listVehicles(message, remainingArgs);
          break;
        case 'create':
        case 'add':
          await this.createVehicle(message, remainingArgs);
          break;
        case 'view':
        case 'show':
          await this.viewVehicle(message, remainingArgs);
          break;
        case 'modify':
        case 'mod':
          await this.modifyVehicle(message, remainingArgs);
          break;
        case 'delete':
        case 'remove':
          await this.deleteVehicle(message, remainingArgs);
          break;
        case 'combat':
        case 'fight':
          await this.vehicleCombat(message, remainingArgs);
          break;
        case 'rig':
          await this.riggingCommand(message, remainingArgs);
          break;
        case 'drone':
          await this.droneCommand(message, remainingArgs);
          break;
        case 'military':
          await this.militaryVehicles(message, remainingArgs);
          break;
        case 'air':
          await this.airVehicles(message, remainingArgs);
          break;
        case 'water':
          await this.waterVehicles(message, remainingArgs);
          break;
        case 'ground':
          await this.groundVehicles(message, remainingArgs);
          break;
        case 'my':
        case 'character':
          await this.characterVehicles(message, remainingArgs);
          break;
        case 'help':
        case 'h':
          await this.showHelp(message);
          break;
        default:
          await this.showHelp(message);
      }
    } catch (error) {
      console.error('Vehicle command error:', error);
      await message.reply('❌ Error processing vehicle command. Please try again.');
    }
  },

  async showHelp(message) {
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('🚗 Shadowrun Vehicles & Drones Commands')
      .setDescription('Complete vehicle and drone management system')
      .addFields(
        { name: '📋 Vehicle Lists', value: 
          '`vehicles list [type]` - List all vehicles or by type\n' +
          '`vehicles list ground` - Ground vehicles only\n' +
          '`vehicles list air` - Aircraft only\n' +
          '`vehicles list water` - Water vehicles only\n' +
          '`vehicles list drone` - Drones only\n' +
          '`vehicles list military` - Military vehicles only'
        },
        { name: '🚗 Vehicle Management', value:
          '`vehicles create [name] [type] [category] [stats]` - Create new vehicle\n' +
          '`vehicles view [name/id]` - View vehicle details\n' +
          '`vehicles modify [name/id] [property] [value]` - Modify vehicle\n' +
          '`vehicles delete [name/id]` - Delete vehicle'
        },
        { name: '⚔️ Vehicle Combat', value:
          '`vehicles combat [attacker] [defender] [range]` - Vehicle combat\n' +
          '`vehicles rig [character] [vehicle]` - Assign rigger\n' +
          '`vehicles my [character]` - View character\'s vehicles'
        },
        { name: '🤖 Drone Commands', value:
          '`vehicles drone list` - List all drones\n' +
          '`vehicles drone control [drone] [character]` - Control drone\n' +
          '`vehicles drone ai [drone] [rating]` - Set AI rating'
        },
        { name: '🎯 Examples', value:
          '`vehicles list` - List all vehicles\n' +
          '`vehicles view Harley-Davidson Roadmaster` - View specific vehicle\n' +
          '`vehicles create "Lone Star Patrol Car" ground car body:12 armor:12 handling:2 speed:180`\n' +
          '`vehicles combat "Ares Roadmaster" "Lone Star Patrol Car" medium`'
        }
      )
      .setFooter({ text: 'Shadowrun 3rd Edition Vehicles System v1.0' });

    await message.reply({ embeds: [embed] });
  },

  async listVehicles(message, args) {
    let type = args[0];
    let vehicles;

    if (!type) {
      vehicles = await vehicles.getVehicles();
    } else {
      vehicles = await vehicles.getVehiclesByType(type);
    }

    if (vehicles.length === 0) {
      return await message.reply('No vehicles found matching your criteria.');
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`🚗 Shadowrun Vehicles - ${type ? type.charAt(0).toUpperCase() + type.slice(1) : 'All'} Vehicles`)
      .setDescription(`Found ${vehicles.length} vehicles`)
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/3095/3095759.png');

    // Split into multiple embeds if too many vehicles
    const vehiclesPerPage = 10;
    for (let i = 0; i < vehicles.length; i += vehiclesPerPage) {
      const pageVehicles = vehicles.slice(i, i + vehiclesPerPage);
      const vehicleList = pageVehicles.map(v => 
        `**${v.name}** (${v.type}/${v.category})\n` +
        `Body: ${v.body} | Armor: ${JSON.stringify(v.armor)} | Speed: ${v.speed}\n` +
        `Cost: ${v.cost}¥ | Availability: ${v.availability}`
      ).join('\n\n');

      if (i === 0) {
        embed.addFields({ name: '🚗 Vehicle List', value: vehicleList });
      } else {
        const pageEmbed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle(`🚗 Shadowrun Vehicles - Page ${Math.floor(i / vehiclesPerPage) + 2}`)
          .setDescription(vehicleList);
        await message.channel.send({ embeds: [pageEmbed] });
      }
    }

    if (vehicles.length > vehiclesPerPage) {
      embed.setFooter({ text: `Page 1 of ${Math.ceil(vehicles.length / vehiclesPerPage)}` });
    }

    await message.reply({ embeds: [embed] });
  },

  async createVehicle(message, args) {
    if (args.length < 2) {
      return await message.reply('Usage: `vehicles create [name] [type] [category] [stats]`\nExample: `vehicles create "Lone Star Patrol Car" ground car body:12 armor:12 handling:2 speed:180`');
    }

    const name = args[0];
    const type = args[1];
    const category = args[2];
    const stats = args.slice(3).join(' ');

    // Parse stats
    const vehicleData = {
      name,
      type,
      category,
      body: 10,
      armor: { ballistic: 8, impact: 6 },
      handling: 2,
      speed: 180,
      acceleration: 6,
      pilot: 2,
      sensor: 3,
      seats: 4,
      capacity: 200,
      cost: 25000,
      availability: 6,
      description: 'Standard security vehicle',
      weaponMounts: [],
      sensorSuite: {},
      countermeasures: {},
      modularFeatures: { modular: false, hardpoints: 0, availableSlots: [] },
      handlingMods: {},
      speedMods: {},
      specialFeatures: {},
      riggerInterface: { compatible: true, response: 3, bandwidth: 2 },
      droneAI: { autonomous: false, rating: 1, skills: [] },
      status: 'operational',
      damageTracker: { current: 0, max: 0, criticalSystem: [] },
      fuel: { current: 100, max: 100, type: 'gasoline' },
      modifications: [],
      customizations: {},
      manufacturer: 'Lone Star',
      model: 'Patrol Car',
      year: 2060
    };

    // Parse additional stats from command
    if (stats) {
      const statPairs = stats.match(/(\w+):(\d+)/g) || [];
      statPairs.forEach(pair => {
        const [key, value] = pair.split(':');
        if (key === 'body') vehicleData.body = parseInt(value);
        else if (key === 'armor') vehicleData.armor.ballistic = parseInt(value);
        else if (key === 'handling') vehicleData.handling = parseInt(value);
        else if (key === 'speed') vehicleData.speed = parseInt(value);
        else if (key === 'acceleration') vehicleData.acceleration = parseInt(value);
        else if (key === 'pilot') vehicleData.pilot = parseInt(value);
        else if (key === 'sensor') vehicleData.sensor.rating = parseInt(value);
        else if (key === 'seats') vehicleData.seats = parseInt(value);
        else if (key === 'capacity') vehicleData.capacity = parseInt(value);
        else if (key === 'cost') vehicleData.cost = parseInt(value);
        else if (key === 'availability') vehicleData.availability = parseInt(value);
      });
    }

    try {
      const newVehicle = await vehicles.createVehicle(vehicleData);
      await message.reply(`✅ Successfully created vehicle: **${newVehicle.name}**`);
    } catch (error) {
      console.error('Vehicle creation error:', error);
      await message.reply('❌ Failed to create vehicle. Please check the parameters.');
    }
  },

  async viewVehicle(message, args) {
    if (!args.length) {
      return await message.reply('Usage: `vehicles view [name or vehicle ID]`');
    }

    const identifier = args.join(' ');
    const vehicle = await vehicles.getVehicle(identifier);

    if (!vehicle) {
      return await message.reply('Vehicle not found. Use `vehicles list` to see available vehicles.');
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle(`🚗 ${vehicle.name}`)
      .setDescription(vehicle.description || 'No description available')
      .addFields(
        { name: '📋 Basic Info', value:
          `**Type:** ${vehicle.type}\n` +
          `**Category:** ${vehicle.category}\n` +
          `**Manufacturer:** ${vehicle.manufacturer || 'Unknown'}\n` +
          `**Model:** ${vehicle.model || 'Unknown'}\n` +
          `**Year:** ${vehicle.year || 'Unknown'}`
        },
        { name: '🎯 Performance', value:
          `**Body:** ${vehicle.body}\n` +
          `**Armor:** ${JSON.stringify(vehicle.armor)}\n` +
          `**Handling:** ${vehicle.handling}\n` +
          `**Speed:** ${vehicle.speed} km/h\n` +
          `**Acceleration:** ${vehicle.acceleration}\n` +
          `**Pilot:** ${vehicle.pilot}`
        },
        { name: '🔍 Systems', value:
          `**Sensor:** ${JSON.stringify(vehicle.sensor)}\n` +
          `**Seats:** ${vehicle.seats}\n` +
          `**Capacity:** ${vehicle.capacity} kg\n` +
          `**Status:** ${vehicle.status}`
        },
        { name: '💰 Economics', value:
          `**Cost:** ${vehicle.cost}¥\n` +
          `**Availability:** ${vehicle.availability}\n` +
          `**Legality:** ${vehicle.legality}\n` +
          `**Street Index:** ${vehicle.streetIndex}`
        }
      );

    if (vehicle.weaponMounts.length > 0) {
      embed.addFields({ 
        name: '🔫 Weapon Mounts', 
        value: vehicle.weaponMounts.map(mount => 
          `${mount.type} (${mount.capacity}) - ${mount.arcs.join(', ')}`
        ).join('\n')
      });
    }

    if (vehicle.modifications.length > 0) {
      embed.addFields({ 
        name: '🔧 Modifications', 
        value: vehicle.modifications.slice(0, 3).map(mod => 
          `${mod.name}: +${mod.value} (${mod.cost}¥)`
        ).join('\n')
      });
    }

    embed.setFooter({ text: `Vehicle ID: ${vehicle.id}` });
    await message.reply({ embeds: [embed] });
  },

  async modifyVehicle(message, args) {
    if (args.length < 3) {
      return await message.reply('Usage: `vehicles modify [name/id] [property] [value]`\nProperties: body, armor, handling, speed, acceleration, pilot, sensor, seats, capacity, cost, availability, description');
    }

    const identifier = args[0];
    const property = args[1];
    const value = args.slice(2).join(' ');

    const vehicle = await vehicles.getVehicle(identifier);
    if (!vehicle) {
      return await message.reply('Vehicle not found.');
    }

    try {
      const updatedVehicle = await vehicles.updateVehicle(vehicle.id, { [property]: value });
      await message.reply(`✅ Updated ${vehicle.name} - ${property}: ${value}`);
    } catch (error) {
      console.error('Vehicle modification error:', error);
      await message.reply('❌ Failed to modify vehicle. Invalid property or value.');
    }
  },

  async deleteVehicle(message, args) {
    if (!args.length) {
      return await message.reply('Usage: `vehicles delete [name or vehicle ID]`');
    }

    const identifier = args.join(' ');
    const vehicle = await vehicles.getVehicle(identifier);

    if (!vehicle) {
      return await message.reply('Vehicle not found.');
    }

    try {
      await vehicles.deleteVehicle(vehicle.id);
      await message.reply(`✅ Successfully deleted vehicle: **${vehicle.name}**`);
    } catch (error) {
      console.error('Vehicle deletion error:', error);
      await message.reply('❌ Failed to delete vehicle.');
    }
  },

  async vehicleCombat(message, args) {
    if (args.length < 2) {
      return await message.reply('Usage: `vehicles combat [attacker vehicle] [defender vehicle] [range: close/medium/long/extreme]`');
    }

    const attacker = args[0];
    const defender = args[1];
    const range = args[2] || 'medium';

    try {
      const combatResult = await vehicles.calculateVehicleCombat(attacker, defender, range);
      
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('⚔️ Vehicle Combat')
        .addFields(
          { name: '🚗 Attacker', value: `${attacker}\nAttack Pool: ${combatResult.attackerPool}\nTarget Number: ${combatResult.attackerTN}` },
          { name: '🛡️ Defender', value: `${defender}\nDefense Pool: ${combatResult.defenderPool}\nTarget Number: ${combatResult.defenderTN}` },
          { name: '📊 Range', value: range.charAt(0).toUpperCase() + range.slice(1) },
          { name: '🎯 Result', value: combatResult.result }
        );

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Vehicle combat error:', error);
      await message.reply('❌ Vehicle combat failed. Check vehicle names and try again.');
    }
  },

  async riggingCommand(message, args) {
    if (args.length < 2) {
      return await message.reply('Usage: `vehicles rig [character name] [vehicle name]`');
    }

    const characterName = args[0];
    const vehicleName = args[1];

    try {
      await vehicles.assignRigger(characterName, vehicleName);
      await message.reply(`✅ ${characterName} can now rig ${vehicleName}`);
    } catch (error) {
      console.error('Rigging assignment error:', error);
      await message.reply('❌ Failed to assign rigger. Check character and vehicle names.');
    }
  },

  async droneCommand(message, args) {
    const subcommand = args[0];
    const remainingArgs = args.slice(1);

    if (!subcommand) {
      return await this.listVehicles(message, ['drone']);
    }

    switch (subcommand) {
      case 'list':
        await this.listVehicles(message, ['drone']);
        break;
      case 'control':
        await this.droneControl(message, remainingArgs);
        break;
      case 'ai':
        await this.droneAI(message, remainingArgs);
        break;
      default:
        await message.reply('Drone subcommands: `list`, `control [drone] [character]`, `ai [drone] [rating]`');
    }
  },

  async droneControl(message, args) {
    if (args.length < 2) {
      return await message.reply('Usage: `vehicles drone control [drone name] [character name]`');
    }

    const droneName = args[0];
    const characterName = args[1];

    try {
      await vehicles.assignDroneControl(characterName, droneName);
      await message.reply(`✅ ${characterName} now controls ${droneName}`);
    } catch (error) {
      console.error('Drone control error:', error);
      await message.reply('❌ Failed to assign drone control.');
    }
  },

  async droneAI(message, args) {
    if (args.length < 2) {
      return await message.reply('Usage: `vehicles drone ai [drone name] [ai rating]`');
    }

    const droneName = args[0];
    const aiRating = parseInt(args[1]);

    if (isNaN(aiRating) || aiRating < 0 || aiRating > 6) {
      return await message.reply('AI rating must be between 0 and 6.');
    }

    try {
      await vehicles.updateDroneAI(droneName, aiRating);
      await message.reply(`✅ ${droneName} AI rating updated to ${aiRating}`);
    } catch (error) {
      console.error('Drone AI update error:', error);
      await message.reply('❌ Failed to update drone AI.');
    }
  },

  async militaryVehicles(message, args) {
    try {
      const militaryVehicles = await vehicles.getMilitaryVehicles();
      
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('🎖️ Military Vehicles')
        .setDescription(`Found ${militaryVehicles.length} military vehicles`)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/2985/2985151.png');

      if (militaryVehicles.length > 0) {
        const vehicleList = militaryVehicles.slice(0, 10).map(v => 
          `**${v.name}** (${v.category})\n` +
          `Body: ${v.body} | Armor: ${JSON.stringify(v.armor)} | Speed: ${v.speed}\n` +
          `Cost: ${v.cost}¥ | Availability: ${v.availability}`
        ).join('\n\n');

        embed.addFields({ name: '🎖️ Military Vehicle List', value: vehicleList });

        if (militaryVehicles.length > 10) {
          embed.setFooter({ text: `Showing first 10 of ${militaryVehicles.length} vehicles` });
        }
      } else {
        embed.setDescription('No military vehicles found in the database.');
      }

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Military vehicles error:', error);
      await message.reply('❌ Failed to retrieve military vehicles.');
    }
  },

  async airVehicles(message, args) {
    await this.listVehicles(message, ['air']);
  },

  async waterVehicles(message, args) {
    await this.listVehicles(message, ['water']);
  },

  async groundVehicles(message, args) {
    await this.listVehicles(message, ['ground']);
  },

  async characterVehicles(message, args) {
    if (!args.length) {
      return await message.reply('Usage: `vehicles my [character name]`');
    }

    const characterName = args.join(' ');
    try {
      const characterVehicles = await vehicles.getCharacterVehicles(characterName);
      
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`🚗 ${characterName}'s Vehicles`)
        .setDescription(`Found ${characterVehicles.length} vehicles`);

      if (characterVehicles.length > 0) {
        const vehicleList = characterVehicles.map(cv => 
          `**${cv.Vehicle.name}** (${cv.Vehicle.type}/${cv.Vehicle.category})\n` +
          `Role: ${cv.role} | Ownership: ${cv.ownership ? 'Yes' : 'No'}\n` +
          `Body: ${cv.Vehicle.body} | Speed: ${cv.Vehicle.speed} | Cost: ${cv.Vehicle.cost}¥`
        ).join('\n\n');

        embed.addFields({ name: '🚗 Vehicle List', value: vehicleList });
      } else {
        embed.setDescription('This character has no vehicles assigned.');
      }

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Character vehicles error:', error);
      await message.reply('❌ Failed to retrieve character vehicles.');
    }
  }
};