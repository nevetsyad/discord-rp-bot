const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const { performanceLogger, appLogger } = require('./security');
const cacheManager = require('./cache');

class DatabaseManager {
  constructor() {
    this.sequelize = null;
    this.connectionPool = null;
    this.queryCache = new Map();
    this.cacheTimeout = 300000; // 5 minutes cache for queries
    this.setupMetrics();
  }

  setupMetrics() {
    this.metrics = {
      totalQueries: 0,
      cachedQueries: 0,
      slowQueries: 0,
      connectionErrors: 0,
      queryTimes: []
    };

    setInterval(() => {
      const avgQueryTime = this.metrics.queryTimes.length > 0 
        ? this.metrics.queryTimes.reduce((a, b) => a + b, 0) / this.metrics.queryTimes.length 
        : 0;
      
      appLogger.info('Database metrics', {
        totalQueries: this.metrics.totalQueries,
        cachedQueries: this.metrics.cachedQueries,
        slowQueries: this.metrics.slowQueries,
        connectionErrors: this.metrics.connectionErrors,
        avgQueryTime: `${avgQueryTime.toFixed(2)}ms`,
        cacheHitRate: this.metrics.totalQueries > 0 
          ? `${(this.metrics.cachedQueries / this.metrics.totalQueries * 100).toFixed(2)}%` 
          : '0%'
      });

      // Reset counters
      this.metrics.queryTimes = [];
    }, 300000); // Log every 5 minutes
  }

  async initialize() {
    try {
      // Create Sequelize instance with optimized settings
      this.sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 3306,
          dialect: 'mysql',
          logging: process.env.NODE_ENV === 'development' ? 
            (msg, timing) => appLogger.debug('SQL Query', { query: msg, timing }) : 
            false,
          pool: {
            max: 20, // Maximum number of connection in pool
            min: 5, // Minimum number of connection in pool
            acquire: 30000, // Maximum time (ms) that pool will try to get connection before throwing error
            idle: 10000 // Maximum time (ms) that connection can be idle before being released
          },
          define: {
            timestamps: true,
            underscored: true,
            paranoid: true, // Soft delete support
            version: true, // Optimistic locking
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at'
          },
          dialectOptions: {
            connectTimeout: 10000,
            acquireTimeout: 30000,
            timeout: 60000
          },
          retry: {
            max: 3,
            match: [
              'ConnectionError',
              'SequelizeConnectionError',
              'SequelizeConnectionRefusedError',
              'SequelizeHostNotReachableError',
              'SequelizeInvalidConnectionError'
            ]
          }
        }
      );

      // Test connection
      await this.sequelize.authenticate();
      appLogger.info('Database connection established successfully');

      // Initialize connection pool for raw queries
      await this.initializeConnectionPool();

      // Setup query caching
      this.setupQueryCache();

      // Run database optimizations
      await this.optimizeDatabase();

    } catch (error) {
      appLogger.error('Failed to initialize database', { error: error.message, stack: error.stack });
      this.metrics.connectionErrors++;
      throw error;
    }
  }

  async initializeConnectionPool() {
    try {
      const poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 20,
        queueLimit: 0,
        acquireTimeout: 30000,
        timeout: 60000,
        namedPlaceholders: true,
        multipleStatements: false,
        dateStrings: false,
        timezone: '+00:00'
      };

      this.connectionPool = mysql.createPool(poolConfig);
      appLogger.info('Database connection pool initialized');
    } catch (error) {
      appLogger.error('Failed to initialize connection pool', { error: error.message });
      throw error;
    }
  }

  setupQueryCache() {
    // Clear expired cache entries periodically
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.queryCache.entries()) {
        if (now - value.timestamp > this.cacheTimeout) {
          this.queryCache.delete(key);
        }
      }
    }, 60000); // Check every minute
  }

  async optimizeDatabase() {
    try {
      const optimizations = [
        'SET FOREIGN_KEY_CHECKS = 0',
        'ANALYZE TABLE characters, users, scenes, shadowrun_characters, shadowrun_combat, combat, combat_participants, combat_actions',
        'SET FOREIGN_KEY_CHECKS = 1'
      ];

      for (const query of optimizations) {
        await this.sequelize.query(query);
      }

      appLogger.info('Database optimizations completed');
    } catch (error) {
      appLogger.error('Database optimization failed', { error: error.message });
    }
  }

  // Cached query execution
  async cachedQuery(query, params = [], cacheKey = null, ttl = 300000) {
    const key = cacheKey || `${query}:${JSON.stringify(params)}`;
    
    // Check cache first
    const cached = this.queryCache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      this.metrics.cachedQueries++;
      appLogger.debug('Query cache hit', { key });
      return cached.result;
    }

    // Execute query
    const start = Date.now();
    this.metrics.totalQueries++;
    
    try {
      const [results, metadata] = await this.sequelize.query(query, {
        replacements: params,
        type: this.sequelize.QueryTypes.SELECT
      });

      const queryTime = Date.now() - start;
      this.metrics.queryTimes.push(queryTime);

      // Cache slow queries (over 100ms)
      if (queryTime > 100) {
        this.metrics.slowQueries++;
        appLogger.warn('Slow query detected', { query, time: `${queryTime}ms` });
      }

      // Cache the result
      this.queryCache.set(key, {
        result: results,
        timestamp: Date.now()
      });

      return results;
    } catch (error) {
      appLogger.error('Query execution failed', { query, error: error.message });
      throw error;
    }
  }

  // Execute query with connection pool (for better performance)
  async pooledQuery(query, params = []) {
    try {
      const start = Date.now();
      const [results] = await this.connectionPool.execute(query, params);
      const queryTime = Date.now() - start;
      
      this.metrics.queryTimes.push(queryTime);
      this.metrics.totalQueries++;

      if (queryTime > 100) {
        this.metrics.slowQueries++;
        appLogger.warn('Slow pooled query detected', { query, time: `${queryTime}ms` });
      }

      return results;
    } catch (error) {
      appLogger.error('Pooled query failed', { query, error: error.message });
      this.metrics.connectionErrors++;
      throw error;
    }
  }

  // Get character with caching
  async getCharacterWithCache(characterId) {
    const cacheKey = `character:${characterId}`;
    
    // Try cache first
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Database query
    const character = await this.sequelize.models.ShadowrunCharacter.findByPk(characterId, {
      include: [
        { model: this.sequelize.models.User, attributes: ['id', 'username'] },
        { model: this.sequelize.models.Scene, attributes: ['id', 'name'] }
      ]
    });

    if (character) {
      // Cache for 10 minutes
      await cacheManager.set(cacheKey, character.toJSON(), 600);
    }

    return character;
  }

  // Get user characters with caching
  async getUserCharactersWithCache(userId) {
    const cacheKey = `user:${userId}:characters`;
    
    // Try cache first
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Database query
    const characters = await this.sequelize.models.ShadowrunCharacter.findAll({
      where: { user_id: userId },
      attributes: ['id', 'name', 'race', 'archetype', 'karma', 'nuyen'],
      order: [['created_at', 'DESC']]
    });

    // Cache for 5 minutes
    await cacheManager.set(cacheKey, characters, 300);

    return characters;
  }

  // Clear character cache
  async clearCharacterCache(characterId, userId = null) {
    const cacheKeys = [`character:${characterId}`];
    if (userId) {
      cacheKeys.push(`user:${userId}:characters`);
    }
    
    for (const key of cacheKeys) {
      await cacheManager.del(key);
    }
  }

  // Health check
  async healthCheck() {
    try {
      await this.sequelize.authenticate();
      
      // Test connection pool
      await this.connectionPool.execute('SELECT 1');
      
      return {
        status: 'healthy',
        sequelize: 'connected',
        pool: 'healthy',
        cacheSize: this.queryCache.size,
        metrics: this.metrics
      };
    } catch (error) {
      appLogger.error('Database health check failed', { error: error.message });
      return {
        status: 'unhealthy',
        error: error.message,
        sequelize: error.name,
        pool: 'unknown',
        cacheSize: this.queryCache.size,
        metrics: this.metrics
      };
    }
  }

  // Graceful shutdown
  async shutdown() {
    try {
      if (this.connectionPool) {
        await this.connectionPool.end();
        appLogger.info('Database connection pool closed');
      }
      
      if (this.sequelize) {
        await this.sequelize.close();
        appLogger.info('Sequelize connection closed');
      }
      
      appLogger.info('Database shutdown completed');
    } catch (error) {
      appLogger.error('Database shutdown error', { error: error.message });
    }
  }
}

// Singleton instance
const databaseManager = new DatabaseManager();

module.exports = databaseManager;