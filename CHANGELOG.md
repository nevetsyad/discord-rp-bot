# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3.0] - 2026-02-08
### Added
- Complete Shadowrun 3rd Edition character creation system with proper priority table (A-E)
- Full implementation of 5 meta-human races (Human, Elf, Dwarf, Ork, Troll) with racial modifications
- 6 archetype packages (Mage, Street Samurai, Shaman, Rigger, Decker, Physical Adept) with recommended attributes
- Karma advancement system with proper costs based on attribute ratings
- Racial maximums system for all attributes with validation
- Comprehensive Discord command interface for Shadowrun characters
- Database models and relationships for ShadowrunCharacter with proper foreign keys
- Complete dice system with Shadowrun-specific mechanics (success counting on 5+)
- Combat pool allocation between offense and defense
- Spellcasting, conjuring, and decking roll types
- Initiative calculation with proper pass system
- Character sheet generation with detailed attribute breakdown
- 100% test coverage across 6 test categories
- Documentation updates for Shadowrun Phase 1 implementation
- GitHub package.json and README updates to reflect Shadowrun 3rd Edition focus

### Changed
- Updated versioning to 0.1.3.0 to reflect pre-alpha status and major feature completion
- Updated package.json description to specify Shadowrun 3rd Edition GM Bot
- Added Shadowrun-specific keywords to package.json
- Updated README.md to reflect Shadowrun 3rd Edition capabilities

## [Unreleased]

## [0.1.0] - 2026-02-08
### Added
- Pre-Alpha version 0.1.0 release
- Phase 2 development started
- Versioning system updated to reflect pre-alpha status
- Combat System implementation (Phase 2.1)
  - Combat model with damage tracking and status effects
  - Combat participant management with initiative system
  - Combat action logging for detailed combat tracking
  - ShadowrunCombat utility class with core combat mechanics
  - Complete combat command interface (/combat-*)
  - Database integration with combat tables
  - Combat initialization and cleanup utilities

### Technical
- New models: Combat.js, CombatParticipant.js, CombatAction.js
- New utility: ShadowrunCombat.js with comprehensive combat mechanics
- New commands: combat.js with /combat-start, /combat-join, /combat-round, /combat-attack, /combat-status, /combat-list, /combat-end
- New database initialization: init-combat-db.js for combat table setup
- Enhanced database.js with combat model relationships
- Combat damage calculation with physical/stun damage types
- Initiative system with proper turn ordering
- Status effects (unconscious, dead, stunned) tracking
- Combat action logging for detailed combat narratives

## [1.3.0] - 2026-02-07
### Added
- Shadowrun 3rd Edition Phase 1 implementation
- Complete character creation system with 5 meta-human races and 6 archetypes
- Advanced dice system with success counting (5+) and glitch detection
- Karma advancement system with proper attribute costs
- Combat pool allocation between offense and defense
- Specialized dice rolls for spellcasting, conjuring, and decking
- Initiative calculation with passes system
- Comprehensive Shadowrun character model with derived stats
- Full Discord command interface for Shadowrun characters
- Database integration with new shadowrun_characters table
- Automated testing system with 6 comprehensive test categories
- Pure JavaScript bug check script (no dependencies)
- Complete Shadowrun documentation and implementation guide

### Changed
- Updated database.js to include ShadowrunCharacter model
- Enhanced interactionCreate.js to support Shadowrun commands
- Updated index.js with database synchronization
- Added init-shadowrun-db.js for database initialization
- Enhanced USER.md with user preferences and interests
- Updated MEMORY.md with Shadowrun implementation progress
- Added comprehensive documentation in docs/SHADOWRUN_PHASE1.md

### Fixed
- All Phase 1 automated tests passing (6/6 tests)
- Dice system properly handling edge cases and glitch detection
- Character advancement with proper karma costs
- Database relationships and foreign key constraints
- Discord command integration and error handling

### Technical
- New files: models/ShadowrunCharacter.js, utils/ShadowrunDice.js
- New commands: commands/shadowrun.js, commands/shadowrun-dice.js
- Database: init-shadowrun-db.js, enhanced database relationships
- Testing: SHADOWRUN_PHASE1_PURE_CHECK.js with 100% test coverage
- Documentation: Complete Shadowrun Phase 1 guide and API documentation

## [0.1.3.0] - 2026-02-07
### Added
- MySQL installation automation with cross-platform support
- Interactive setup scripts for easy configuration
- Automatic platform detection and package manager selection
- MySQL security configuration with secure installation
- Enhanced error handling and rollback mechanisms
- Comprehensive documentation and release management
- Bug fix for dice parser regex pattern
- Enhanced message validation to handle null and non-string values
- Version 0.1.3.0 tagged and pushed to GitHub

### Changed
- Updated README.md with installation instructions for both setup methods
- Enhanced CHANGELOG.md with version history and future plans
- Added setup:mysql and setup:interactive script commands to package.json

### Fixed
- Dice parser regex pattern for proper dice notation handling
- Message validation edge cases for null and non-string values
- All 20/20 bug checks passing in NEW_CODE_CHECK.js
- All 8 components working in COMPONENT_TEST.js

## [1.2.0] - 2026-02-06
### Added
- Interactive setup script for guided environment variable configuration
- MySQL installation automation for automatic database setup
- Cross-platform support (Homebrew, APT, YUM, Chocolatey)
- Platform detection with getPlatform() function
- MySQL secure integration with environment variable cleanup
- Enhanced error handling and rollback mechanisms
- Complete documentation and release management

### Changed
- Updated package.json with new setup scripts
- Enhanced README.md with installation guides
- Added CHANGELOG.md with version tracking
- Created comprehensive release documentation

### Fixed
- All cross-platform compatibility issues resolved
- MySQL installation security concerns addressed
- User experience improvements for non-technical users

## [1.1.0] - 2026-02-05
### Added
- Complete Discord RP bot with Game Master capabilities
- Character creation and management system
- Dice rolling with parser validation
- Scene management and progression
- AI-powered Game Master tools
- Comprehensive documentation and setup guides
- GitHub repository structure and publishing

### Changed
- Initial release of Discord RP bot
- Complete implementation of game management system
- Character progression and quest management
- Published to GitHub repository https://github.com/nevetsyad/discord-rp-bot

### Fixed
- Initial bug fixes and validation systems
- Dice parser and message validation improvements

## [1.0.0] - 2026-02-01
### Added
- Initial Discord bot framework
- Basic command structure and interaction handling
- Database models and relationships
- Basic character and scene management
- Initial testing and validation systems

### Changed
- First release of Discord RP bot framework
- Basic functionality implemented and tested

### Fixed
- Initial setup and configuration issues
- Basic Discord integration problems
## [0.1.5.0] - 2026-02-09

### Added
- Complete Phase 4: Magic System Implementation
- ShadowrunMagic model with spellcasting mechanics and drain calculation
- ShadowrunSpirits utility with complete spirit summoning/binding system
- ShadowrunAstral utility with astral projection mechanics
- Magic Discord command interface with full spell and spirit management
- Comprehensive spell categories and drain system following Shadowrun 3rd Edition rules
- Spirit summoning for both Hermetic (Elemental Spirits) and Shamanic (Nature Spirits) traditions
- Astral plane mechanics with tracking, perception, combat, and projection systems
- Complete database integration with new magic-related tables and relationships
- 100% test coverage across 21 comprehensive test categories
- All Phase 4 features fully functional and tested

### Changed
- Updated version to 0.1.5.0 to reflect Phase 4 completion
- Updated README.md to reflect completed Magic System implementation
- Fixed spirit name format consistency (AIR_ELEMENTAL vs Air_Elemental)
- Added success property to spirit summoning results
- Enhanced astral tracking with proper target number calculation
- Optimized drain calculation logic with proper service counting
- Improved error handling and validation for all magic system components

## [0.1.4.0] - 2026-02-08

### Added
- Complete Phase 3: Combat System Implementation
- ShadowrunCombat model with full combat mechanics
- Initiative calculation system with passes
- Combat pool management (offense/defense allocation)
- Damage and healing system (stun vs physical damage)
- Condition monitors with knockdown rules
- Combat phase management (ready → action → defend → damage → end)
- Combat logging system for tracking all actions
- Special combat maneuvers: called shots, full auto bursts
- Attack and defense test systems with success counting
- Error handling for combat pool allocation
- Discord combat commands: combat-start, combat-initiative, combat-attack, combat-status
- Additional combat commands: combat-damage, combat-heal, combat-pool, combat-end
- Comprehensive test suite with 11 test categories, 100% pass rate
- GLM prompt optimization system for reduced token usage (48% savings)

