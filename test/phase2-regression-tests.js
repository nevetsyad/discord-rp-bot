const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { resolveCommandName, loadCommands, registerEventHandlers } = require('../utils/bootstrap');

function run(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

run('resolveCommandName supports legacy + slash command shapes', () => {
  assert.strictEqual(resolveCommandName({ name: 'legacy', execute: () => {} }), 'legacy');
  assert.strictEqual(resolveCommandName({ data: { name: 'slash' }, execute: () => {} }), 'slash');
  assert.strictEqual(resolveCommandName({ data: { toJSON: () => ({ name: 'json-slash' }) }, execute: () => {} }), 'json-slash');
  assert.strictEqual(resolveCommandName({}), null);
});

run('loadCommands loads valid modules and skips support files', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rpbot-commands-'));

  fs.writeFileSync(path.join(tempDir, 'valid-slash.js'), "module.exports={data:{name:'alpha'},execute:()=>{}};");
  fs.writeFileSync(path.join(tempDir, 'valid-legacy.js'), "module.exports={name:'beta',execute:()=>{}};");
  fs.writeFileSync(path.join(tempDir, 'support-file.js'), "module.exports={helper:true};");
  fs.writeFileSync(path.join(tempDir, 'broken.js'), "throw new Error('boom');");

  const logger = { warn: () => {}, error: () => {} };
  const commands = loadCommands(tempDir, logger);

  assert.strictEqual(commands.size, 2);
  assert.ok(commands.has('alpha'));
  assert.ok(commands.has('beta'));
});

run('registerEventHandlers passes commands to both once/on handlers', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rpbot-events-'));

  fs.writeFileSync(
    path.join(tempDir, 'ready.js'),
    "module.exports={name:'ready',once:true,execute:(client,commands)=>{client._onceCommands=commands;}};"
  );
  fs.writeFileSync(
    path.join(tempDir, 'interactionCreate.js'),
    "module.exports={name:'interactionCreate',execute:(interaction,commands)=>{interaction._commands=commands;}};"
  );

  const handlers = { once: null, on: null };
  const client = {
    once: (_name, fn) => { handlers.once = fn; },
    on: (_name, fn) => { handlers.on = fn; }
  };

  const commands = new Map([['help', { execute: () => {} }]]);
  registerEventHandlers(client, tempDir, commands);

  const readyClient = {};
  handlers.once(readyClient);
  assert.strictEqual(readyClient._onceCommands, commands);

  const interaction = {};
  handlers.on(interaction);
  assert.strictEqual(interaction._commands, commands);
});

if (!process.exitCode) {
  console.log('Phase 2 regression tests passed');
}
