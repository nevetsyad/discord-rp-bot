const assert = require('assert');

const helpCommand = require('../commands/help');
const EnhancedErrorHandling = require('../commands/enhanced-error-handling');

function run(name, fn) {
  Promise.resolve()
    .then(fn)
    .then(() => console.log(`✅ ${name}`))
    .catch((error) => {
      console.error(`❌ ${name}`);
      console.error(error);
      process.exitCode = 1;
    });
}

function createInteraction(commandOption) {
  return {
    options: {
      getString: () => commandOption
    },
    replied: false,
    deferred: false,
    replyPayload: null,
    async reply(payload) {
      this.replyPayload = payload;
      this.replied = true;
    }
  };
}

run('help command returns actionable unknown-command guidance with suggestions', async () => {
  const interaction = createInteraction('char');
  const commands = new Map([
    ['character', { data: { name: 'character', description: 'Character tools' }, execute: async () => {} }],
    ['combat', { data: { name: 'combat', description: 'Combat tools' }, execute: async () => {} }]
  ]);

  await helpCommand.execute(interaction, commands);

  assert.ok(interaction.replyPayload);
  assert.strictEqual(interaction.replyPayload.ephemeral, true);
  assert.ok(interaction.replyPayload.content.includes("couldn't find"));
  assert.ok(interaction.replyPayload.content.includes('/character'));
});

run('help command detailed view includes usage and options', async () => {
  const interaction = createInteraction('dice');
  const commands = new Map([
    ['dice', {
      data: {
        toJSON: () => ({
          name: 'dice',
          description: 'Roll dice',
          options: [{ name: 'expression', description: 'Dice expression', required: true }]
        })
      },
      execute: async () => {}
    }]
  ]);

  await helpCommand.execute(interaction, commands);

  const embed = interaction.replyPayload.embeds[0].toJSON();
  const usageField = embed.fields.find((f) => f.name === 'Usage');
  const optionsField = embed.fields.find((f) => f.name === 'Options');

  assert.ok(usageField.value.includes('/dice <expression>'));
  assert.ok(optionsField.value.includes('expression'));
  assert.strictEqual(interaction.replyPayload.ephemeral, true);
});

run('enhanced error handling includes recovery guidance', async () => {
  const handler = new EnhancedErrorHandling();
  const interaction = {
    replied: false,
    deferred: false,
    replyPayload: null,
    async reply(payload) {
      this.replyPayload = payload;
      this.replied = true;
    }
  };

  const error = new TypeError('Bad input');
  await handler.handleCommandError(interaction, error, 'character');

  assert.ok(interaction.replyPayload);
  const embed = interaction.replyPayload.embeds[0].toJSON();
  const guidanceField = embed.fields.find((f) => f.name.toLowerCase().includes('how to fix'));
  assert.ok(guidanceField);
  assert.ok(guidanceField.value.includes('/help command:character'));
});

setTimeout(() => {
  if (!process.exitCode) {
    console.log('Phase 5 enhancement tests passed');
  }
}, 50);
