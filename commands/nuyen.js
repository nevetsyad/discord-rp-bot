const { SlashCommandBuilder } = require('/builders');
const { ShadowrunNuyen } = require('../utils/ShadowrunNuyen');
const { ShadowrunCharacter } = require('../models');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuyen')
    .setDescription('Manage your character\'s nuyen (currency)')
    .addSubcommand(subcommand =>
      subcommand
        .setName('balance')
        .setDescription('Check your current nuyen balance'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add nuyen to your character')
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Amount to add')
            .setRequired(true)
            .setMinValue(1)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('spend')
        .setDescription('Spend nuyen')
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Amount to spend')
            .setRequired(true)
            .setMinValue(1)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('transfer')
        .setDescription('Transfer nuyen to another character')
        .addUserOption(option =>
          option.setName('target')
            .setDescription('Target character user')
            .setRequired(true))
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Amount to transfer')
            .setRequired(true)
            .setMinValue(1)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('equipment')
        .setDescription('Browse and purchase equipment')
        .addStringOption(option =>
          option.setName('action')
            .setDescription('Action to perform')
            .setRequired(true)
            .addChoices(
              { name: 'List All', value: 'list' },
              { name: 'List by Category', value: 'category' },
              { name: 'Purchase', value: 'purchase' },
              { name: 'Sell', value: 'sell' }))
        .addStringOption(option =>
          option.setName('category')
            .setDescription('Equipment category (for category action)')
            .setRequired(false)
            .addChoices(
              { name: 'Weapons', value: 'weapons' },
              { name: 'Armor', value: 'armor' },
              { name: 'Cyberware', value: 'cyberware' },
              { name: 'Electronics', value: 'electronics' },
              { name: 'Gear', value: 'gear' },
              { name: 'Lifestyle', value: 'lifestyle' }))
        .addStringOption(option =>
          option.setName('item')
            .setDescription('Equipment name (for purchase/sell actions)')
            .setRequired(false))
        .addIntegerOption(option =>
          option.setName('quantity')
            .setDescription('Quantity to purchase/sell (default: 1)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(100))),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const nuyen = new ShadowrunNuyen();

    try {
      switch (subcommand) {
        case 'balance':
          await handleBalance(interaction, nuyen);
          break;
        case 'add':
          await handleAdd(interaction, nuyen);
          break;
        case 'spend':
          await handleSpend(interaction, nuyen);
          break;
        case 'transfer':
          await handleTransfer(interaction, nuyen);
          break;
        case 'equipment':
          await handleEquipment(interaction, nuyen);
          break;
      }
    } catch (error) {
      console.error('Error in nuyen command:', error);
      await interaction.reply({ content: 'An error occurred while processing your nuyen transaction.', ephemeral: true });
    }
  }
};

async function handleBalance(interaction, nuyen) {
  // Get the user's current character
  const character = await ShadowrunCharacter.findOne({
    where: {
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
      is_active: true
    }
  });

  if (!character) {
    await interaction.reply({ content: 'No active Shadowrun character found. Please create a character first.', ephemeral: true });
    return;
  }

  const balance = nuyen.getBalance(character);
  
  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle(`${character.name}'s Nuyen Balance`)
    .setDescription(`Current balance for character: ${character.name}`)
    .addFields(
      { name: 'Nuyen Balance', value: balance.formatted, inline: true },
      { name: 'Character ID', value: character.id, inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleAdd(interaction, nuyen) {
  const amount = interaction.options.getInteger('amount');
  
  // Get the user's current character
  const character = await ShadowrunCharacter.findOne({
    where: {
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
      is_active: true
    }
  });

  if (!character) {
    await interaction.reply({ content: 'No active Shadowrun character found. Please create a character first.', ephemeral: true });
    return;
  }

  const result = nuyen.addNuyen(character, amount);
  
  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle('Nuyen Added')
    .setDescription(result.message)
    .addFields(
      { name: 'Character', value: character.name, inline: true },
      { name: 'Amount Added', value: nuyen.formatNuyen(amount), inline: true },
      { name: 'New Balance', value: nuyen.formatNuyen(character.nuyen), inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleSpend(interaction, nuyen) {
  const amount = interaction.options.getInteger('amount');
  
  // Get the user's current character
  const character = await ShadowrunCharacter.findOne({
    where: {
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
      is_active: true
    }
  });

  if (!character) {
    await interaction.reply({ content: 'No active Shadowrun character found. Please create a character first.', ephemeral: true });
    return;
  }

  const result = nuyen.removeNuyen(character, amount);
  
  const embed = new EmbedBuilder()
    .setColor(result.success ? 0x00ff00 : 0xff0000)
    .setTitle(result.success ? 'Nuyen Spent' : 'Transaction Failed')
    .setDescription(result.message)
    .addFields(
      { name: 'Character', value: character.name, inline: true },
      { name: 'Amount Requested', value: nuyen.formatNuyen(amount), inline: true },
      { name: 'Current Balance', value: nuyen.formatNuyen(character.nuyen), inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleTransfer(interaction, nuyen) {
  const targetUser = interaction.options.getUser('target');
  const amount = interaction.options.getInteger('amount');
  
  // Get both characters
  const fromCharacter = await ShadowrunCharacter.findOne({
    where: {
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
      is_active: true
    }
  });

  const toCharacter = await ShadowrunCharacter.findOne({
    where: {
      user_id: targetUser.id,
      guild_id: interaction.guild.id,
      is_active: true
    }
  });

  if (!fromCharacter) {
    await interaction.reply({ content: 'No active Shadowrun character found for you. Please create a character first.', ephemeral: true });
    return;
  }

  if (!toCharacter) {
    await interaction.reply({ content: `No active Shadowrun character found for ${targetUser.username}. Please create a character first.`, ephemeral: true });
    return;
  }

  const result = nuyen.transferNuyen(fromCharacter, toCharacter, amount);
  
  const embed = new EmbedBuilder()
    .setColor(result.success ? 0x00ff00 : 0xff0000)
    .setTitle(result.success ? 'Nuyen Transfer Complete' : 'Transfer Failed')
    .setDescription(result.message)
    .addFields(
      { name: 'From', value: result.fromCharacter, inline: true },
      { name: 'To', value: result.toCharacter, inline: true },
      { name: 'Amount', value: nuyen.formatNuyen(amount), inline: true },
      { name: 'Sender Balance', value: nuyen.formatNuyen(result.fromBalance), inline: true },
      { name: 'Receiver Balance', value: nuyen.formatNuyen(result.toBalance), inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleEquipment(interaction, nuyen) {
  const action = interaction.options.getString('action');
  const category = interaction.options.getString('category');
  const itemName = interaction.options.getString('item');
  const quantity = interaction.options.getInteger('quantity') || 1;

  // Get the user's current character
  const character = await ShadowrunCharacter.findOne({
    where: {
      user_id: interaction.user.id,
      guild_id: interaction.guild.id,
      is_active: true
    }
  });

  if (!character) {
    await interaction.reply({ content: 'No active Shadowrun character found. Please create a character first.', ephemeral: true });
    return;
  }

  switch (action) {
    case 'list':
      const allEquipment = nuyen.getEquipmentList();
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('Available Equipment')
        .setDescription(`Found ${allEquipment.length} items available.`)
        .setFields(
          allEquipment.slice(0, 10).map(item => ({
            name: item.name,
            value: `${nuyen.formatNuyen(item.price)} | ${item.category}`,
            inline: true
          }))
        )
        .setTimestamp();
      
      if (allEquipment.length > 10) {
        embed.setFooter({ text: `Showing first 10 of ${allEquipment.length} items. Use category filter for more specific searches.` });
      }
      
      await interaction.reply({ embeds: [embed] });
      break;

    case 'category':
      const categoryEquipment = nuyen.getEquipmentList(category);
      const categoryEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`${category.charAt(0).toUpperCase() + category.slice(1)} Equipment`)
        .setDescription(`Found ${categoryEquipment.length} items in ${category} category.`)
        .setFields(
          categoryEquipment.map(item => ({
            name: item.name,
            value: nuyen.formatNuyen(item.price),
            inline: true
          }))
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [categoryEmbed] });
      break;

    case 'purchase':
      if (!itemName) {
        await interaction.reply({ content: 'Please specify an item to purchase.', ephemeral: true });
        return;
      }

      const purchaseResult = nuyen.purchaseEquipment(character, itemName, quantity);
      const purchaseEmbed = new EmbedBuilder()
        .setColor(purchaseResult.success ? 0x00ff00 : 0xff0000)
        .setTitle(purchaseResult.success ? 'Equipment Purchased' : 'Purchase Failed')
        .setDescription(purchaseResult.message)
        .addFields(
          { name: 'Character', value: character.name, inline: true },
          { name: 'Item', value: purchaseResult.equipmentName, inline: true },
          { name: 'Quantity', value: purchaseResult.quantity.toString(), inline: true },
          { name: 'Total Cost', value: nuyen.formatNuyen(purchaseResult.totalCost), inline: true },
          { name: 'New Balance', value: nuyen.formatNuyen(character.nuyen), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [purchaseEmbed] });
      break;

    case 'sell':
      if (!itemName) {
        await interaction.reply({ content: 'Please specify an item to sell.', ephemeral: true });
        return;
      }

      const sellResult = nuyen.sellEquipment(character, itemName, quantity);
      const sellEmbed = new EmbedBuilder()
        .setColor(sellResult.success ? 0x00ff00 : 0xff0000)
        .setTitle(sellResult.success ? 'Equipment Sold' : 'Sale Failed')
        .setDescription(sellResult.message)
        .addFields(
          { name: 'Character', value: character.name, inline: true },
          { name: 'Item', value: sellResult.equipmentName, inline: true },
          { name: 'Quantity', value: sellResult.quantity.toString(), inline: true },
          { name: 'Refund Amount', value: nuyen.formatNuyen(sellResult.refundAmount), inline: true },
          { name: 'New Balance', value: nuyen.formatNuyen(character.nuyen), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [sellEmbed] });
      break;
  }
}