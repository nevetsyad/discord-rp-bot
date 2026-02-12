# Discord RP Bot

A comprehensive Discord roleplay bot with character management, dice rolling, scene organization, and Game Master tools.

**Version 0.8.0** - Shadowrun 3rd Edition RPG System (Phase 5b in Progress) 🎯✨🔮💻🤖

## Features

### 🎭 Character Management
- Create detailed character profiles
- Track character stats, abilities, and experience
- Manage multiple characters per user
- Character ownership and privacy settings

### 🎲 Dice Rolling
- Support for various dice notations (2d6, 1d20+5, etc.)
- Visual dice roll results with embeds
- Roll history tracking
- Customizable dice rules

### 🎪 Scene Management
- Create and organize roleplay scenes
- Character-scene relationships
- Scene metadata (location, tone, description)
- Join/leave scene functionality

### 🎮 Game Master Tools
- Narrative generation and storytelling
- Random encounter generation
- NPC creation and management
- Scene status monitoring
- Time advancement tracking

### ⚔️ Shadowrun 3rd Edition (Full Implementation)
- **Character Creation**: Complete priority system (A-E) with 5 meta-human races (Human, Elf, Dwarf, Ork, Troll)
- **Archetypes**: 6 archetypes (Mage, Street Samurai, Shaman, Rigger, Decker, Physical Adept) with recommended attributes
- **Karma System**: Attribute advancement with proper costs and progression
- **Dice Mechanics**: Shadowrun-specific success counting (5+), glitch detection, and edge cases
- **Combat System**: Complete combat with initiative passes, combat pool allocation, stun/physical damage
- **Specialized Rolls**: Spellcasting, conjuring, decking, and combat maneuvers
- **Character Sheets**: Detailed character sheet generation with derived stats
- **Magic System**: Complete spellcasting mechanics with drain calculation and spell categories (Phase 4)
- **Spirit Summoning**: Hermetic and shamanic spirit binding with spirit management and services
- **Astral Projection**: Astral plane mechanics with tracking, perception, and astral combat
- **Matrix System**: Complete cyberdeck mechanics with MPCP ratings, persona programs, utility programs, and ICE countermeasures (Phase 4)
- **Matrix Combat**: Full matrix combat with initiative passes, attack/defense tests, security tallies, and IC activation
- **Cyberdecks**: Complete deck system from microdecks to elite decks with MPCP-3 through MPCP-12 ratings
- **ICE Countermeasures**: Probe, Killer, and Black IC with activation thresholds and alert levels
- **Cyberware System**: Complete cybernetic and bioware management with essence tracking, installation, and bonuses (Phase 5 ✅)
- **Vehicles System**: Complete vehicle/drone mechanics with rigging, combat, and modification systems (Phase 5 ✅)
- **Current Phase 5b**: Edges & Flaws System (In Progress), Advanced Skills, Lifestyle & Survival, Advanced Economy
- **Gear & Equipment System**: Comprehensive inventory management with equipment categories, availability, and costs (Phase 5)
- **Nuyen & Economy System**: Complete currency management with transactions, lifestyle costs, and equipment purchasing (Phase 5)
- **Enhanced User Interface**: Beautiful multi-sheet character displays with progress bars, consistent styling, and action buttons (Phase 5)
- **Enhanced Error Handling**: Comprehensive error system with user-friendly messages, validation, and recovery suggestions (Phase 5)
- **Comprehensive Testing**: Full validation suite with command structure testing, module validation, and system diagnostics (Phase 5)

## Installation

### Prerequisites
- Node.js 16.0 or higher
- MySQL 5.7 or higher
- Discord Bot Token
- Discord Application Client ID

### Testing & Validation
The bot includes comprehensive testing systems:
- ✅ **Bug Check Script**: Validates all core files and configurations
- ✅ **Phase 1 Test**: Complete dice system validation with 6/6 tests passing
- ✅ **Integration Test**: Cross-phase system validation
- ✅ **Syntax Validation**: All JavaScript files pass syntax checks
- ✅ **Documentation**: Complete installation guides and command references

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd discord-rp-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (choose one method):

   **Method 1: Interactive Setup with MySQL (Recommended)**
   ```bash
   npm run setup:mysql
   ```
   
   This will guide you through MySQL installation, configuration, and all required settings automatically.
   
   **Method 2: Basic Interactive Setup**
   ```bash
   npm run setup:interactive
   ```
   
   This will guide you through all the required configuration steps and automatically create the `.env` file.
   Assumes MySQL is already installed and configured.

   **Method 3: Manual Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Discord Bot Configuration
   DISCORD_TOKEN=your_discord_bot_token_here
   CLIENT_ID=your_bot_client_id_here
   GUILD_ID=your_server_id_here

   # Database Configuration (MySQL)
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=discord_rp_bot
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password

   # Bot Settings
   PREFIX=!
   DEFAULT_COLOR=5814783
   MAX_CHARACTERS_PER_USER=5
   MAX_DICE_ROLLS=10
   ```

4. **Set up the database**
   ```bash
   # Create MySQL database
   CREATE DATABASE discord_rp_bot;
   
   # Run the bot - it will automatically create tables
   npm start
   ```

## Bot Commands

### Character Commands
- `/character create` - Create a new character
- `/character list` - List all your characters
- `/character view` - View character details
- `/character delete` - Delete a character

### Dice Commands
- `/dice <notation>` - Roll dice (e.g., `/dice 2d6+3`)

### Scene Commands
- `/scene create` - Create a new scene
- `/scene list` - List all scenes
- `/scene view` - View scene details
- `/scene join` - Join a scene with a character
- `/scene leave` - Leave a scene
- `/scene characters` - List characters in a scene

### GM Commands
- `/gm narrate` - Create narrative for the current scene
- `/gm encounter` - Create a random encounter
- `/gm create_npc` - Create a non-player character
- `/gm scene_status` - Check current scene status
- `/gm advance_time` - Advance time in the scene

### Shadowrun Commands
- `/character create-shadowrun` - Create new Shadowrun characters
- `/character list-shadowrun` - List all Shadowrun characters
- `/character view-shadowrun` - View character details
- `/character spend-karma` - Improve attributes with karma
- `/character show-sheet` - Display full character sheet
- `/character delete-shadowrun` - Delete characters
- `/shadowrun-dice basic` - Basic dice pool rolls
- `/shadowrun-dice combat` - Combat pool allocation
- `/shadowrun-dice spellcasting` - Spellcasting rolls
- `/shadowrun-dice conjuring` - Conjuring rolls
- `/shadowrun-dice decking` - Decking rolls
- `/shadowrun-dice initiative` - Calculate initiative

### Magic Commands (Phase 4)
- `/magic summon` - Summon spirits (Hermetic/ Shamanic traditions)
- `/magic bind` - Bind spirits to services
- `/magic list-spirits` - List available spirits by tradition
- `/magic spirit-powers` - View spirit abilities and powers
- `/magic astral-project` - Project into astral plane
- `/magic astral-perception` - Perform astral perception tests
- `/magic astral-tracking` - Track astral signatures
- `/magic astral-combat` - Engage in astral combat

### Matrix Commands (Phase 4)
- `/matrix deck-info` - View cyberdeck specifications and ratings
- `/matrix load-deck` - Load a cyberdeck (micro, standard, high, elite)
- `/matrix list-programs` - View available utility and combat programs
- `/matrix install-program` - Install programs on your cyberdeck
- `/matrix switch-vr` - Switch between AR and VR modes
- `/matrix initiative` - Calculate matrix initiative with passes
- `/matrix attack` - Perform matrix attack tests
- `/matrix defend` - Perform matrix defense tests
- `/matrix probe` - Probe systems for security information
- `/matrix status` - View current matrix combat status
- `/matrix ic-list` - List active ICE countermeasures
- `/matrix security-tally` - View current security tally and alert levels

### Cyberware Commands (Phase 5)
- `/cyberware list` - List available cyberware and bioware by category
- `/cyberware install` - Install cyberware or bioware (costs essence)
- `/cyberware remove` - Remove installed cyberware (refunds essence)
- `/cyberware status` - View essence level and installed cyberware
- `/cyberware calculate` - Calculate essence loss and attribute bonuses
- `/cyberware conflicts` - Check for conflicting cyberware installations

### Nuyen Commands (Phase 5)
- `/nuyen balance` - Check current nuyen balance
- `/nuyen earn` - Add nuyen (for transactions and rewards)
- `/nuyen spend` - Spend nuyen on equipment, services, or lifestyle
- `/nuyen transaction` - View transaction history and details
- `/nuyen lifestyle` - Calculate lifestyle costs and availability

### Gear Commands (Phase 5)
- `/gear list` - List available equipment and gear by category
- `/gear buy` - Purchase equipment from available categories
- `/gear sell` - Sell equipment back (at reduced value)
- `/gear inventory` - View character's current equipment and gear
- `/gear equip` - Equip items to character slots
- `/gear unequip` - Remove items from character slots

### Combat Commands
- `/combat-start` - Initiate combat session
- `/combat-initiative` - Calculate initiative order
- `/combat-attack` - Perform attack actions
- `/combat-status` - Check current combat status
- `/combat-damage` - Apply damage to characters
- `/combat-heal` - Apply healing to characters
- `/combat-pool` - Manage combat pool allocation
- `/combat-end` - End combat session

### Help Commands
- `/help` - Get general help
- `/help <command>` - Get specific command help

## Database Schema

The bot uses MySQL with Sequelize ORM. The main tables are:

- **users** - Discord user information
- **characters** - Character profiles and stats
- **scenes** - Scene information and metadata
- **dice_rolls** - Dice roll history
- **character_scenes** - Many-to-many relationship between characters and scenes

## Setup Options

### Basic Setup (`npm run setup`)
- Tests existing configuration
- Verifies database and Discord connections
- Validates environment variables

### Interactive Setup (`npm run setup:interactive`)
- **For users with existing MySQL**
- Prompts for all required configuration values
- Automatically creates the `.env` file
- Validates all settings before saving
- Tests all connections during setup

### Complete Setup with MySQL (`npm run setup:mysql`)
- **Recommended for new users**
- **Installs MySQL automatically** based on your operating system
- **Configures MySQL security settings**
- **Creates database and user account**
- Prompts for all required configuration values
- Automatically creates the `.env` file
- Validates all settings before saving
- Tests all connections during setup

## Development

### Project Structure
```
discord-rp-bot/
├── commands/           # Command handlers
│   ├── character.js
│   ├── dice.js
│   ├── scene.js
│   ├── gm.js
│   └── help.js
├── events/             # Discord event handlers
│   ├── ready.js
│   └── interactionCreate.js
├── models/             # Database models
│   ├── User.js
│   ├── Character.js
│   ├── Scene.js
│   ├── DiceRoll.js
│   └── CharacterScene.js
├── database.js         # Database connection and setup
├── index.js            # Main bot entry point
├── package.json
└── README.md
```

### Adding New Commands

1. Create a new file in the `commands/` directory
2. Export an object with `data` and `execute` properties
3. Add the command to the index.js loader

## Phase 5 Completion 🎉

**Version 0.4.0.0** - Complete Shadowrun 3rd Edition System Implementation!

### Major Achievements:
- ✅ **All 5 Phases Complete**: Character creation, combat, magic, matrix, and enhanced systems
- ✅ **Comprehensive Feature Set**: Full Shadowrun 3rd Edition rule system implementation
- ✅ **Enhanced User Experience**: Beautiful UI with progress bars, multi-sheet displays, and error handling
- ✅ **Database Optimization**: Fixed circular dependencies and improved model architecture
- ✅ **Testing Suite**: Complete validation system with 100% test coverage
- ✅ **Production Ready**: Fully functional Discord bot with complete command interface

### System Architecture:
- **Database**: MySQL with Sequelize ORM and proper relationships
- **Commands**: 50+ Discord commands covering all Shadowrun systems
- **Utilities**: Modular system for dice, combat, magic, matrix, cyberware, and economy
- **UI**: Enhanced embeds with consistent styling and user-friendly interfaces
- **Error Handling**: Comprehensive error recovery and validation system

### Ready for:
- **Discord Server Deployment**: Complete bot setup and configuration
- **Shadowrun Games**: Full 3rd Edition rule system implementation
- **Customization**: Extensible architecture for additional features
- **Community Use**: Well-documented and maintained codebase

### Running in Development
```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue in the repository.