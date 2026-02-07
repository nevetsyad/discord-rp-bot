# Discord RP Bot

A comprehensive Discord roleplay bot with character management, dice rolling, scene organization, and Game Master tools.

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

## Installation

### Prerequisites
- Node.js 16.0 or higher
- MySQL 5.7 or higher
- Discord Bot Token
- Discord Application Client ID

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

3. **Configure environment variables**
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