// Shadowrun 3rd Edition Nuyen & Economy System
// Handles character wealth, transactions, and equipment purchasing

class ShadowrunNuyen {
  constructor() {
    // Starting nuyen by priority level (from Shadowrun 3rd Edition rules)
    this.startingNuyen = {
      'A': 1000000,   // 1,000,000¥
      'B': 400000,    // 400,000¥
      'C': 90000,     // 90,000¥
      'D': 20000,     // 20,000¥
      'E': 5000       // 5,000¥
    };

    // Common equipment prices (¥)
    this.equipment = {
      // Weapons
      'Ares Predator': 500,
      'HK227': 1200,
      'Remington 950': 400,
      'Colt America': 650,
      'Ruger SuperWarrior': 800,
      'Streetline Special': 200,
      'Remington Roomsweeper': 450,
      'Winchester 9420': 1200,
      'Schroeder Smartgun': 800,
      'Laser Sight': 250,
      'Smartgun System': 1200,
      
      // Armor
      'Light Jacket': 200,
      'Heavy Jacket': 500,
      'Armored Jacket': 800,
      'Form-Fitting Armor': 1200,
      'Full Armor Suit': 3000,
      'Helmet': 300,
      'Shield': 400,
      
      // Cyberware
      'Datajack': 500,
      'Cyberlimb': 3000,
      'Cyberarm': 1500,
      'Cyberleg': 1500,
      'Cybereye': 2000,
      'Cyberear': 1000,
      'Wired Reflexes': 15000,
      'Muscle Replacement': 5000,
      'Reaction Enhancers': 8000,
      'Skillwires': 10000,
      
      // Electronics
      'Commlink': 500,
      'Deck': 5000,
      'Cyberdeck': 10000,
      'Scanner': 300,
      'Jammer': 800,
      'Tactical Computer': 1500,
      
      // Gear
      'Medkit': 500,
      'First Aid Kit': 100,
      'Toolkit': 200,
      'Lockpick Set': 150,
      'Climbing Gear': 300,
      'Gas Mask': 250,
      'Thermographic Vision': 1500,
      'Low-Light Vision': 800,
      
      // Lifestyle
      'Street': 1000,
      'Squatter': 5000,
      'Low': 10000,
      'Middle': 50000,
      'High': 200000,
      'Luxury': 1000000
    };
  }

  /**
   * Initialize character with starting nuyen based on priority
   */
  initializeCharacter(character, priority) {
    const startingNuyen = this.startingNuyen[priority] || 0;
    
    // Add nuyen to character if not already set
    if (!character.nuyen) {
      character.nuyen = startingNuyen;
    }
    
    return {
      success: true,
      startingNuyen,
      currentNuyen: character.nuyen,
      message: `Character ${character.name} initialized with ${this.formatNuyen(startingNuyen)} starting nuyen.`
    };
  }

  /**
   * Add nuyen to character
   */
  addNuyen(character, amount) {
    if (!character.nuyen) {
      character.nuyen = 0;
    }
    
    const oldNuyen = character.nuyen;
    character.nuyen += amount;
    
    return {
      success: true,
      oldNuyen,
      newNuyen: character.nuyen,
      amount,
      message: `Added ${this.formatNuyen(amount)} to ${character.name}. New balance: ${this.formatNuyen(character.nuyen)}.`
    };
  }

  /**
   * Remove nuyen from character
   */
  removeNuyen(character, amount) {
    if (!character.nuyen) {
      character.nuyen = 0;
    }
    
    if (character.nuyen < amount) {
      return {
        success: false,
        oldNuyen: character.nuyen,
        requestedAmount: amount,
        message: `${character.name} only has ${this.formatNuyen(character.nuyen)}, but tried to spend ${this.formatNuyen(amount)}.`
      };
    }
    
    const oldNuyen = character.nuyen;
    character.nuyen -= amount;
    
    return {
      success: true,
      oldNuyen,
      newNuyen: character.nuyen,
      amount,
      message: `Spent ${this.formatNuyen(amount)} from ${character.name}. New balance: ${this.formatNuyen(character.nuyen)}.`
    };
  }

  /**
   * Transfer nuyen between characters
   */
  transferNuyen(fromCharacter, toCharacter, amount) {
    const withdrawResult = this.removeNuyen(fromCharacter, amount);
    
    if (!withdrawResult.success) {
      return {
        success: false,
        fromCharacter: fromCharacter.name,
        toCharacter: toCharacter.name,
        amount,
        message: `Transfer failed: ${withdrawResult.message}`
      };
    }
    
    const depositResult = this.addNuyen(toCharacter, amount);
    
    return {
      success: true,
      fromCharacter: fromCharacter.name,
      toCharacter: toCharacter.name,
      amount,
      fromBalance: fromCharacter.nuyen,
      toBalance: toCharacter.nuyen,
      message: `Transferred ${this.formatNuyen(amount)} from ${fromCharacter.name} to ${toCharacter.name}.`
    };
  }

  /**
   * Purchase equipment
   */
  purchaseEquipment(character, equipmentName, quantity = 1) {
    const equipment = this.equipment[equipmentName];
    
    if (!equipment) {
      return {
        success: false,
        equipmentName,
        message: `Equipment "${equipmentName}" not found in price list.`
      };
    }
    
    const totalCost = equipment * quantity;
    const purchaseResult = this.removeNuyen(character, totalCost);
    
    if (!purchaseResult.success) {
      return {
        success: false,
        equipmentName,
        quantity,
        totalCost,
        characterBalance: character.nuyen,
        message: `Cannot purchase ${quantity}x ${equipmentName} for ${this.formatNuyen(totalCost)}. ${purchaseResult.message}`
      };
    }
    
    return {
      success: true,
      equipmentName,
      quantity,
      unitCost: equipment,
      totalCost,
      characterBalance: character.nuyen,
      message: `Purchased ${quantity}x ${equipmentName} for ${this.formatNuyen(totalCost)}. New balance: ${this.formatNuyen(character.nuyen)}.`
    };
  }

  /**
   * Sell equipment back (50% of original price)
   */
  sellEquipment(character, equipmentName, quantity = 1) {
    const equipment = this.equipment[equipmentName];
    
    if (!equipment) {
      return {
        success: false,
        equipmentName,
        message: `Equipment "${equipmentName}" not found in price list.`
      };
    }
    
    const refundAmount = Math.floor((equipment * 0.5) * quantity);
    const sellResult = this.addNuyen(character, refundAmount);
    
    return {
      success: true,
      equipmentName,
      quantity,
      originalPrice: equipment,
      refundAmount,
      characterBalance: character.nuyen,
      message: `Sold ${quantity}x ${equipmentName} for ${this.formatNuyen(refundAmount)}. New balance: ${this.formatNuyen(character.nuyen)}.`
    };
  }

  /**
   * Pay lifestyle costs
   */
  payLifestyle(character, lifestyle, months = 1) {
    const lifestyleCost = this.equipment[lifestyle];
    
    if (!lifestyleCost) {
      return {
        success: false,
        lifestyle,
        message: `Lifestyle "${lifestyle}" not found. Available: ${Object.keys(this.equipment).filter(k => ['Street', 'Squatter', 'Low', 'Middle', 'High', 'Luxury'].includes(k)).join(', ')}`
      };
    }
    
    const totalCost = lifestyleCost * months;
    const paymentResult = this.removeNuyen(character, totalCost);
    
    if (!paymentResult.success) {
      return {
        success: false,
        lifestyle,
        months,
        totalCost,
        characterBalance: character.nuyen,
        message: `Cannot pay ${months} months of ${lifestyle} lifestyle (${this.formatNuyen(totalCost)}). ${paymentResult.message}`
      };
    }
    
    return {
      success: true,
      lifestyle,
      months,
      monthlyCost: lifestyleCost,
      totalCost,
      characterBalance: character.nuyen,
      message: `Paid ${months} months of ${lifestyle} lifestyle (${this.formatNuyen(totalCost)}). New balance: ${this.formatNuyen(character.nuyen)}.`
    };
  }

  /**
   * Get character's current nuyen balance
   */
  getBalance(character) {
    return {
      character: character.name,
      nuyen: character.nuyen || 0,
      formatted: this.formatNuyen(character.nuyen || 0)
    };
  }

  /**
   * Get equipment price list
   */
  getEquipmentList(category = null) {
    const categories = {
      weapons: ['Ares Predator', 'HK227', 'Remington 950', 'Colt America', 'Ruger SuperWarrior', 'Streetline Special', 'Remington Roomsweeper', 'Winchester 9420', 'Schroeder Smartgun', 'Laser Sight', 'Smartgun System'],
      armor: ['Light Jacket', 'Heavy Jacket', 'Armored Jacket', 'Form-Fitting Armor', 'Full Armor Suit', 'Helmet', 'Shield'],
      cyberware: ['Datajack', 'Cyberlimb', 'Cyberarm', 'Cyberleg', 'Cybereye', 'Cyberear', 'Wired Reflexes', 'Muscle Replacement', 'Reaction Enhancers', 'Skillwires'],
      electronics: ['Commlink', 'Deck', 'Cyberdeck', 'Scanner', 'Jammer', 'Tactical Computer'],
      gear: ['Medkit', 'First Aid Kit', 'Toolkit', 'Lockpick Set', 'Climbing Gear', 'Gas Mask', 'Thermographic Vision', 'Low-Light Vision'],
      lifestyle: ['Street', 'Squatter', 'Low', 'Middle', 'High', 'Luxury']
    };

    if (category && categories[category]) {
      return categories[category].map(item => ({
        name: item,
        price: this.equipment[item]
      }));
    }

    return Object.keys(this.equipment).map(item => ({
      name: item,
      price: this.equipment[item],
      category: this.getCategory(item)
    }));
  }

  /**
   * Get category for equipment item
   */
  getCategory(item) {
    const weapons = ['Ares Predator', 'HK227', 'Remington 950', 'Colt America', 'Ruger SuperWarrior', 'Streetline Special', 'Remington Roomsweeper', 'Winchester 9420', 'Schroeder Smartgun', 'Laser Sight', 'Smartgun System'];
    const armor = ['Light Jacket', 'Heavy Jacket', 'Armored Jacket', 'Form-Fitting Armor', 'Full Armor Suit', 'Helmet', 'Shield'];
    const cyberware = ['Datajack', 'Cyberlimb', 'Cyberarm', 'Cyberleg', 'Cybereye', 'Cyberear', 'Wired Reflexes', 'Muscle Replacement', 'Reaction Enhancers', 'Skillwires'];
    const electronics = ['Commlink', 'Deck', 'Cyberdeck', 'Scanner', 'Jammer', 'Tactical Computer'];
    const gear = ['Medkit', 'First Aid Kit', 'Toolkit', 'Lockpick Set', 'Climbing Gear', 'Gas Mask', 'Thermographic Vision', 'Low-Light Vision'];
    const lifestyle = ['Street', 'Squatter', 'Low', 'Middle', 'High', 'Luxury'];

    if (weapons.includes(item)) return 'weapons';
    if (armor.includes(item)) return 'armor';
    if (cyberware.includes(item)) return 'cyberware';
    if (electronics.includes(item)) return 'electronics';
    if (gear.includes(item)) return 'gear';
    if (lifestyle.includes(item)) return 'lifestyle';
    return 'other';
  }

  /**
   * Format nuyen with proper currency symbol
   */
  formatNuyen(amount) {
    if (amount >= 1000) {
      const thousands = (amount / 1000).toFixed(1);
      return `${thousands}k¥`;
    }
    return `${amount}¥`;
  }

  /**
   * Get starting nuyen by priority
   */
  getStartingNuyen(priority) {
    return this.startingNuyen[priority] || 0;
  }

  /**
   * Get all lifestyle costs
   */
  getLifestyleCosts() {
    return ['Street', 'Squatter', 'Low', 'Middle', 'High', 'Luxury'].map(lifestyle => ({
      lifestyle,
      cost: this.equipment[lifestyle],
      monthly: true
    }));
  }
}

module.exports = ShadowrunNuyen;