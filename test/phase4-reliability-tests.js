const assert = require('assert')
const http = require('http')
const {
  isTransientError,
  retryWithBackoff,
  CircuitBreakerLite
} = require('../utils/reliability')
const { createRuntimeState, startDiagnosticsServer } = require('../utils/diagnostics')

function requestJson (port, path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path, method: 'GET' }, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          json: JSON.parse(data)
        })
      })
    })

    req.on('error', reject)
    req.end()
  })
}

async function runReliabilityTests () {
  assert.strictEqual(isTransientError({ code: 'ETIMEDOUT' }), true)
  assert.strictEqual(isTransientError({ status: 503 }), true)
  assert.strictEqual(isTransientError({ message: 'temporarily unavailable' }), true)
  assert.strictEqual(isTransientError({ message: 'invalid token' }), false)

  let attempts = 0
  const result = await retryWithBackoff(async () => {
    attempts++
    if (attempts < 3) {
      const err = new Error('timed out')
      err.code = 'ETIMEDOUT'
      throw err
    }
    return 'ok'
  }, {
    retries: 4,
    baseDelayMs: 1,
    maxDelayMs: 5,
    jitter: 0
  })

  assert.strictEqual(result, 'ok')
  assert.strictEqual(attempts, 3)

  let nonTransientAttempts = 0
  await assert.rejects(async () => retryWithBackoff(async () => {
    nonTransientAttempts++
    throw new Error('permanent failure')
  }, {
    retries: 5,
    baseDelayMs: 1,
    maxDelayMs: 5,
    jitter: 0
  }), /permanent failure/)
  assert.strictEqual(nonTransientAttempts, 1)

  const breaker = new CircuitBreakerLite({ failureThreshold: 2, resetTimeoutMs: 10 })
  await assert.rejects(async () => breaker.execute(async () => { throw new Error('f1') }), /f1/)
  await assert.rejects(async () => breaker.execute(async () => { throw new Error('f2') }), /f2/)

  await assert.rejects(async () => breaker.execute(async () => 'nope'), /Circuit breaker is open/)

  breaker.openedAt = Date.now() - 20
  const reopenedResult = await breaker.execute(async () => 'recovered')
  assert.strictEqual(reopenedResult, 'recovered')
}

async function runDiagnosticsTests () {
  const state = createRuntimeState()
  state.commandCount = 14

  const logger = { info: () => {} }
  const server = startDiagnosticsServer(state, { port: 0, logger })
  await new Promise((resolve) => server.on('listening', resolve))
  const port = server.address().port

  const live = await requestJson(port, '/livez')
  assert.strictEqual(live.statusCode, 200)
  assert.strictEqual(live.json.ready, false)
  assert.strictEqual(live.json.status, 'starting')
  assert.strictEqual(live.json.commandCount, 14)

  const preReady = await requestJson(port, '/readyz')
  assert.strictEqual(preReady.statusCode, 503)

  state.ready = true
  const ready = await requestJson(port, '/readyz')
  assert.strictEqual(ready.statusCode, 200)
  assert.strictEqual(ready.json.status, 'ready')

  state.markError(new Error('boom'), 'phase4-test')
  const health = await requestJson(port, '/healthz')
  assert.strictEqual(health.statusCode, 200)
  assert.strictEqual(health.json.lastError.context, 'phase4-test')

  await new Promise((resolve) => server.close(resolve))
}

async function run () {
  await runReliabilityTests()
  await runDiagnosticsTests()
  console.log('Phase 4 reliability tests passed')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
