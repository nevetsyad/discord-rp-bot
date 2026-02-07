# Command Reference

## 🎭 Character Commands

### `/character create`
Create a new roleplay character with detailed information.

**Parameters:**
- `name` (required) - Character name
- `description` (required) - Brief character description
- `personality` (required) - Character personality traits
- `appearance` (required) - Character appearance description
- `backstory` (required) - Character background story
- `skills` (required) - Character abilities and skills

**Example:**
```
/character create 
  --name "Aria Shadowstep"
  --description "A rogue with a mysterious past"
  --personality "Cautious, observant, and quick-witted"
  --appearance "Short, agile figure with dark hood and piercing eyes"
  --backstory "Former street orphan turned skilled thief seeking redemption"
  --skills "Stealth, lockpicking, acrobatics, deception"
```

### `/character list`
List all your created characters.

**Example:**
```
/character list
```

### `/character view`
View detailed information about a specific character.

**Parameters:**
- `name` (required) - Name of the character to view

**Example:**
```
/character view --name "Aria Shadowstep"
```

### `/character delete`
Delete a character from your roster.

**Parameters:**
- `name` (required) - Name of the character to delete

**Example:**
```
/character delete --name "Aria Shadowstep"
```

## 🎲 Dice Commands

### `/dice`
Roll dice with various notations and modifiers.

**Parameters:**
- `dice` (required) - Dice notation (e.g., 2d6, 1d20+5)
- `reason` (optional) - Reason for the roll

**Valid Notations:**
- `1d20` - Single 20-sided die
- `2d6+3` - Two 6-sided dice plus 3
- `3d10-2` - Three 10-sided dice minus 2
- `1d100` - Single 100-sided die

**Examples:**
```
/dice 1d20+5 --reason "Attack roll"
/dice 2d6 --reason "Damage roll"
/dice 3d10-1 --reason "Skill check"
```

## 🎪 Scene Commands

### `/scene create`
Create a new roleplay scene with location and tone.

**Parameters:**
- `name` (required) - Scene name
- `description` (required) - Scene description
- `location` (required) - Scene location
- `tone` (required) - Scene tone (serious, comedic, mysterious, action, romantic, tragic, hopeful)
- `characters` (optional) - Character names to include (comma-separated)

**Example:**
```
/scene create 
  --name "The Mysterious Tavern"
  --description "A dimly lit tavern with strange patrons"
  --location "The Rusty Mug Tavern"
  --tone "mysterious"
  --characters "Aria Shadowstep, Borin Stonehand"
```

### `/scene list`
List all available scenes.

**Example:**
```
/scene list
```

### `/scene view`
View detailed information about a scene.

**Parameters:**
- `name` (required) - Name of the scene to view

**Example:**
```
/scene view --name "The Mysterious Tavern"
```

### `/scene join`
Join a scene with one of your characters.

**Parameters:**
- `scene` (required) - Scene name to join
- `character` (required) - Your character name to use in scene

**Example:**
```
/scene join --scene "The Mysterious Tavern" --character "Aria Shadowstep"
```

### `/scene leave`
Leave a scene.

**Parameters:**
- `scene` (required) - Scene name to leave

**Example:**
```
/scene leave --scene "The Mysterious Tavern"
```

### `/scene characters`
List characters in a scene.

**Parameters:**
- `scene` (required) - Scene name

**Example:**
```
/scene characters --scene "The Mysterious Tavern"
```

## 🎮 Game Commands

### `/game start`
Start a new game session with difficulty settings.

**Parameters:**
- `name` (required) - Game session name
- `difficulty` (required) - Difficulty level (easy, normal, hard, brutal)

**Example:**
```
/game start --name "Dragon's Lair" --difficulty "hard"
```

### `/game join`
Join a game session with your character.

**Parameters:**
- `game` (required) - Game session name
- `character` (required) - Your character name

**Example:**
```
/game join --game "Dragon's Lair" --character "Aria Shadowstep"
```

### `/game leave`
Leave the current game session.

**Example:**
```
/game leave
```

### `/game status`
Check the current game session status.

**Example:**
```
/game status
```

### `/game players`
List all players in the current game.

**Example:**
```
/game players
```

### `/game end`
End the current game session (GM only).

**Example:**
```
/game end
```

## 🎭 GM Commands

### `/gm narrate`
Create narrative for the current scene.

**Parameters:**
- `description` (required) - What happens next
- `tone` (optional) - Narrative tone (dramatic, mysterious, active, humorous)

**Example:**
```
/gm narrate --description "The tavern door creaks open as a cloaked figure enters" --tone "mysterious"
```

### `/gm encounter`
Create a random encounter.

**Parameters:**
- `environment` (optional) - Environment type (forest, dungeon, city, wilderness, tavern)

**Example:**
```
/gm encounter --environment "forest"
```

### `/gm create_npc`
Create a non-player character.

**Parameters:**
- `name` (required) - NPC name
- `role` (required) - NPC role
- `description` (required) - NPC appearance and personality

**Example:**
```
/gm create_npc --name "Old Man Jenkins" --role "Tavern Owner" --description "Grizzled old man with a missing eye and a limp"
```

### `/gm scene_status`
Check current scene status.

**Parameters:**
- `scene` (optional) - Scene name to check

**Example:**
```
/gm scene_status --scene "The Mysterious Tavern"
```

### `/gm advance_time`
Advance time in the scene.

**Parameters:**
- `amount` (required) - Time to advance (e.g., 1 hour, 2 days)

**Example:**
```
/gm advance_time --amount "2 hours"
```

## 🤖 AI-Powered GM Commands

### `/gm_ai generate_story`
Generate an AI-powered story based on your characters.

**Parameters:**
- `prompt` (required) - Story prompt or description

**Example:**
```
/gm_ai generate_story --prompt "The party discovers a hidden treasure map in the tavern"
```

### `/gm_ai character_dialogue`
Generate dialogue for your character.

**Parameters:**
- `character` (required) - Character name
- `situation` (required) - What situation is the character in?

**Example:**
```
/gm_ai character_dialogue --character "Aria Shadowstep" --situation "Confronting a suspicious guard"
```

### `/gm_ai world_building`
Generate world-building content.

**Parameters:**
- `aspect` (required) - Aspect of the world (location, culture, history, magic, technology)

**Example:**
```
/gm_ai world_building --aspect "magic"
```

### `/gm_ai quest_generator`
Generate a quest or adventure.

**Parameters:**
- `type` (required) - Quest type (main, side, encounter, social, puzzle)

**Example:**
```
/gm_ai quest_generator --type "main"
```

### `/gm_ai npc_interaction`
Generate NPC dialogue and reactions.

**Parameters:**
- `npc_name` (required) - NPC name or description
- `player_action` (required) - What did the player do?

**Example:**
```
/gm_ai npc_interaction --npc_name "Tavern Owner" --player_action "Ask about the map"
```

## 📋 Help Commands

### `/help`
Get general help and command list.

**Example:**
```
/help
```

### `/help [command]`
Get specific command help.

**Example:**
```
/help character
/help dice
/help gm
```

## 🎯 Usage Examples

### Creating a Character
```
/character create 
  --name "Theron Fireblade"
  --description "A noble paladin seeking justice"
  --personality "Honorable, brave, and compassionate"
  --appearance "Tall knight in shining armor with a righteous demeanor"
  --backstory "Former templar who left the order to help the common people"
  --skills "Swordsmanship, healing, leadership, diplomacy"
```

### Starting a Game Session
```
/game start --name "Kingdom's Quest" --difficulty "normal"

/character create 
  --name "Lyra Moonwhisper"
  --description "An elven mage with ancient knowledge"
  --personality "Wise, patient, and mysterious"
  --appearance "Tall elf with silver hair and piercing blue eyes"
  --backstory "Scholar who left the arcane academy to study ancient magic"
  --skills "Arcane magic, alchemy, ancient languages"

/game join --game "Kingdom's Quest" --character "Lyra Moonwhisper"
```

### Creating a Scene and Narrating
```
/scene create 
  --name "Ancient Ruins"
  --description "Mysterious ruins overgrown with vines"
  --location "Whispering Woods"
  --tone "mysterious"

/gm narrate --description "The ancient stone archway stands before you, covered in glowing runes that pulse with an otherworldly energy. A cool breeze carries the scent of magic and decay."
```

### Using AI Features
```
/gm_ai generate_story --prompt "The party finds a mysterious artifact in the ruins"

/gm_ai character_dialogue --character "Lyra Moonwhisper" --situation "Examining the ancient artifact"

/gm_ai quest_generator --type "side"
```

## 🚨 Error Handling

### Common Error Messages

**Character Already Exists**
```
Error: A character with this name already exists!
```
**Solution:** Use a different name or delete the existing character first.

**Character Not Found**
```
Error: Character not found!
```
**Solution:** Check the character name spelling and ensure you own the character.

**Invalid Dice Notation**
```
Error: Invalid dice notation! Please use format like "2d6", "1d20+5", "3d10-2"
```
**Solution:** Use proper dice notation with format `XdY±Z`.

**Scene Not Found**
```
Error: Scene not found!
```
**Solution:** Check the scene name or create a new scene first.

**Game Not Found**
```
Error: Game session not found!
```
**Solution:**
- If you're a player: Check if you're in a game session
- If you're a GM: Make sure you started a game session

**API Error**
```
Error: Failed to generate content using AI. Please try again later.
```
**Solution:** Check your OpenRouter API key and quota, then try again.

## 🎨 Formatting Guidelines

### Character Creation
- **Names** should be unique and descriptive
- **Descriptions** should be concise but informative
- **Personality** should reflect character traits
- **Appearance** should help visualize the character
- **Backstory** should provide context and motivation
- **Skills** should be relevant to the character concept

### Scene Creation
- **Names** should be clear and descriptive
- **Descriptions** should set the atmosphere
- **Locations** should be specific and detailed
- **Tone** should match the intended mood

### Game Sessions
- **Names** should be descriptive of the campaign
- **Difficulty** should match player experience:
  - **Easy:** New players, learning mode
  - **Normal:** Balanced gameplay
  - **Hard:** Challenging, requires strategy
  - **Brutal:** Unforgiving, high risk

## 📊 Advanced Features

### Character Progression
- Characters gain experience through gameplay
- Level up to unlock new abilities
- Track health, mana, and stats
- Save progression between sessions

### Combat System
- Initiative-based combat
- Damage calculation
- Status effects and conditions
- Turn management

### AI Storytelling
- Dynamic story generation
- Character-specific narratives
- World-building content
- Procedural quest creation

### Multiplayer Support
- Multiple players per game
- Character management
- Session persistence
- Game state tracking

## 🎉 Tips for Best Experience

### For Players
1. **Create diverse characters** with unique abilities
2. **Use descriptive language** in roleplay
3. **Engage with AI features** for immersive storytelling
4. **Participate actively** in scenes and game sessions
5. **Provide feedback** to improve the experience

### For GMs
1. **Start with easy scenarios** for new players
2. **Use AI tools** to enhance storytelling
3. **Balance difficulty** based on player skill
4. **Keep track of game state** and progression
5. **Encourage creativity** and player agency

### For Everyone
1. **Read the documentation** thoroughly
2. **Test all features** before using
3. **Report bugs** and suggest improvements
4. **Share your experiences** with the community
5. **Contribute** to the project development

---

**Repository:** https://github.com/nevetsyad/discord-rp-bot

**Happy Roleplaying!** 🎲🎭✨