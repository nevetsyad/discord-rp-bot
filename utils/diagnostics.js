const http = require('http');

function createRuntimeState() {
  return {
    startedAt: Date.now(),
    ready: false,
    shuttingDown: false,
    lastError: null,
    dbConnected: false,
    discordConnected: false,
    commandCount: 0,
    markError(error, context) {
      this.lastError = {
        message: error?.message || String(error),
        context,
        at: new Date().toISOString()
      };
    }
  };
}

function startDiagnosticsServer(state, options = {}) {
  const port = Number(options.port || process.env.HEALTH_PORT || 3001);
  const logger = options.logger || console;

  const server = http.createServer((req, res) => {
    const payload = {
      status: state.ready ? 'ready' : 'starting',
      uptimeMs: Date.now() - state.startedAt,
      ready: state.ready,
      shuttingDown: state.shuttingDown,
      dbConnected: state.dbConnected,
      discordConnected: state.discordConnected,
      commandCount: state.commandCount,
      timestamp: new Date().toISOString(),
      lastError: state.lastError
    };

    if (req.url === '/livez' || req.url === '/healthz') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(payload));
      return;
    }

    if (req.url === '/readyz') {
      const code = state.ready && !state.shuttingDown ? 200 : 503;
      res.writeHead(code, { 'content-type': 'application/json' });
      res.end(JSON.stringify(payload));
      return;
    }

    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  server.listen(port, () => {
    logger.info('Diagnostics server listening', { port });
  });

  return server;
}

module.exports = {
  createRuntimeState,
  startDiagnosticsServer
};