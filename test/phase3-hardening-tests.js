const assert = require('assert');
const jwt = require('jsonwebtoken');
const { validateEnv } = require('../config/env');
const { securityMiddleware } = require('../config/security');

function buildReqRes(authHeader = null) {
  const req = {
    headers: authHeader ? { authorization: authHeader } : {},
    ip: '127.0.0.1',
    path: '/api/test',
    get: () => 'phase3-test-agent'
  };

  let statusCode = 200;
  let jsonPayload = null;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      jsonPayload = payload;
      return this;
    }
  };

  return { req, res, getStatus: () => statusCode, getJson: () => jsonPayload };
}

async function run() {
  const validated = validateEnv({
    NODE_ENV: 'development',
    DISCORD_TOKEN: 'x'.repeat(30),
    CLIENT_ID: '123',
    DB_HOST: 'localhost',
    DB_PORT: '3306',
    DB_NAME: 'db',
    DB_USER: 'user',
    DB_PASSWORD: 'pass',
    JWT_SECRET: 'y'.repeat(32)
  });
  assert.strictEqual(validated.DB_SCHEMA_STRATEGY, 'alter');

  assert.throws(() => validateEnv({
    NODE_ENV: 'production',
    DISCORD_TOKEN: 'x'.repeat(30),
    CLIENT_ID: '123',
    DB_HOST: 'localhost',
    DB_PORT: '3306',
    DB_NAME: 'db',
    DB_USER: 'user',
    DB_PASSWORD: 'pass',
    DB_SCHEMA_STRATEGY: 'alter',
    JWT_SECRET: 'z'.repeat(32)
  }), /Unsafe DB schema strategy/);

  {
    const { req, res, getStatus, getJson } = buildReqRes();
    let nextCalled = false;
    securityMiddleware.authenticate(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false);
    assert.strictEqual(getStatus(), 401);
    assert.strictEqual(getJson().success, false);
  }

  {
    process.env.JWT_SECRET = 's'.repeat(32);
    const token = jwt.sign({ sub: 'user-1', role: 'admin', username: 'runner' }, process.env.JWT_SECRET, { expiresIn: '5m' });
    const { req, res, getStatus } = buildReqRes(`Bearer ${token}`);
    let nextCalled = false;
    securityMiddleware.authenticate(req, res, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true);
    assert.strictEqual(getStatus(), 200);
    assert.strictEqual(req.user.id, 'user-1');
    assert.strictEqual(req.user.role, 'admin');
  }

  console.log('Phase 3 hardening tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
