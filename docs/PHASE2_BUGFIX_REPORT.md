# Phase 2 Bugfix Report (2026-02-20)

## Scope
Focused functional correctness bugs in command loading, event dispatch, and startup DB wiring with minimal-risk changes.

## Fixed / Deferred Matrix

| Area | Issue | Impact | Status | Notes |
|---|---|---|---|---|
| Startup / DB | `index.js` treated `require('./database')` as sequelize instance and called `.sync` on wrong object; also imported missing `./models` index | Bot startup crash risk | ✅ Fixed | Removed redundant/broken sync path from `index.js`; now only loads `database.js` side-effects/wiring |
| Command loading | Loader assumed every `commands/*.js` exports slash command shape `command.data.name`, crashing on support modules or legacy commands | Bot fails to initialize command registry | ✅ Fixed | Added `utils/bootstrap.js` with guarded loader that supports legacy (`name`) and slash (`data.name` / `data.toJSON().name`) shapes and skips non-commands safely |
| Event dispatch | `once` handlers (notably `ready`) were invoked without `commands` map | `ready` event could throw during command registration | ✅ Fixed | Centralized event registration ensures both `once` and `on` handlers receive `commands` |
| Slash builder compatibility | Command modules imported `SlashCommandBuilder` from `discord.js` while project uses v13 where it is undefined | Command modules fail at load time | ✅ Fixed | Updated command files to import `SlashCommandBuilder` from `@discordjs/builders` |
| Discord v13/v14 API surface mismatch beyond builder import | Some modules still use v14-style builders/components (e.g., `EmbedBuilder`, `ActionRowBuilder`) | Runtime command execution issues possible in specific commands | ⏸ Deferred | Keep scoped for Phase 2; address in planned hardening/reliability pass with explicit compatibility strategy |

## Regression Coverage Added
- `test/phase2-regression-tests.js`
  - validates command-name resolution across legacy/slash module shapes
  - verifies loader skips invalid support files and survives module import errors
  - verifies event registration passes `commands` map to both `once` and `on` handlers

## Verification
Commands executed:

```bash
npm run lint
npm test
```

Result summary:
- Lint: PASS
- Tests: PASS (`unit-tests` + `phase2-regression-tests`)
