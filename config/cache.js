const Redis = require('redis');
const NodeCache = require('node-cache');
const { performanceLogger } = require('./security');

class CacheManager {
  constructor() {
    this.redisClient = null;
    this.localCache = new NodeCache({
      stdTTL: 300, // 5 minutes default TTL
      checkperiod: 600, // Check for expired items every 10 minutes
      useClones: false, // Better performance, store references
      deleteOnExpire: true
    });
    
    this.initializeRedis();
    this.setupCacheMetrics();
  }

  async initializeRedis() {
    try {
      this.redisClient = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
        }
      });

      this.redisClient.on('error', (err) => {
        performanceLogger.error('Redis client error', { error: err.message });
        // Fallback to local cache if Redis fails
        this.localCache.set('redis_status', 'disconnected');
      });

      this.redisClient.on('connect', () => {
        performanceLogger.info('Redis client connected');
        this.localCache.set('redis_status', 'connected');
      });

      await this.redisClient.connect();
    } catch (error) {
      performanceLogger.error('Failed to connect to Redis', { error: error.message });
      // Continue with local cache fallback
      this.localCache.set('redis_status', 'disconnected');
    }
  }

  setupCacheMetrics() {
    this.stats = {
      hits: 0,
      misses: 0,
      redisHits: 0,
      redisMisses: 0,
      localHits: 0,
      localMisses: 0
    };

    setInterval(() => {
      const total = this.stats.hits + this.stats.misses;
      const hitRate = total > 0 ? (this.stats.hits / total * 100).toFixed(2) : 0;
      
      performanceLogger.info('Cache metrics', {
        totalRequests: total,
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: `${hitRate}%`,
        redisHits: this.stats.redisHits,
        redisMisses: this.stats.redisMisses,
        localHits: this.stats.localHits,
        localMisses: this.stats.localMisses
      });

      // Reset counters for next interval
      this.stats = {
        hits: 0,
        misses: 0,
        redisHits: 0,
        redisMisses: 0,
        localHits: 0,
        localMisses: 0
      };
    }, 300000); // Log metrics every 5 minutes
  }

  async get(key) {
    try {
      // Try Redis first
      if (this.redisClient && this.redisClient.isReady) {
        const value = await this.redisClient.get(key);
        if (value !== null) {
          this.stats.hits++;
          this.stats.redisHits++;
          performanceLogger.debug('Cache hit (Redis)', { key });
          return JSON.parse(value);
        }
        this.stats.redisMisses++;
      }

      // Fallback to local cache
      const value = this.localCache.get(key);
      if (value !== undefined) {
        this.stats.hits++;
        this.stats.localHits++;
        performanceLogger.debug('Cache hit (Local)', { key });
        return value;
      }
      
      this.stats.misses++;
      this.stats.localMisses++;
      return null;
    } catch (error) {
      performanceLogger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  async set(key, value, ttl = null) {
    try {
      const serializedValue = JSON.stringify(value);
      
      // Set in Redis if available
      if (this.redisClient && this.redisClient.isReady) {
        const redisTTL = ttl || 300; // 5 minutes default
        await this.redisClient.setEx(key, redisTTL, serializedValue);
        performanceLogger.debug('Cache set (Redis)', { key, ttl: redisTTL });
      }

      // Also set in local cache for faster access
      const localTTL = ttl || 300;
      this.localCache.set(key, value, localTTL);
      performanceLogger.debug('Cache set (Local)', { key, ttl: localTTL });
    } catch (error) {
      performanceLogger.error('Cache set error', { key, error: error.message });
    }
  }

  async del(key) {
    try {
      if (this.redisClient && this.redisClient.isReady) {
        await this.redisClient.del(key);
      }
      this.localCache.del(key);
      performanceLogger.debug('Cache delete', { key });
    } catch (error) {
      performanceLogger.error('Cache delete error', { key, error: error.message });
    }
  }

  async delByPattern(pattern) {
    try {
      if (this.redisClient && this.redisClient.isReady) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      }
      
      // Delete from local cache (approximate pattern matching)
      const keys = this.localCache.keys();
      keys.forEach(key => {
        if (this.matchPattern(key, pattern)) {
          this.localCache.del(key);
        }
      });
      
      performanceLogger.debug('Cache delete by pattern', { pattern });
    } catch (error) {
      performanceLogger.error('Cache delete by pattern error', { pattern, error: error.message });
    }
  }

  matchPattern(key, pattern) {
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${regexPattern}$`).test(key);
  }

  async clear() {
    try {
      if (this.redisClient && this.redisClient.isReady) {
        await this.redisClient.flushDb();
      }
      this.localCache.flushAll();
      performanceLogger.info('Cache cleared');
    } catch (error) {
      performanceLogger.error('Cache clear error', { error: error.message });
    }
  }

  getStats() {
    return {
      ...this.stats,
      localCacheStats: this.localCache.getStats(),
      redisStatus: this.redisClient?.isReady ? 'connected' : 'disconnected'
    };
  }

  // Cache warming for frequently accessed data
  async warmCache(cacheItems) {
    const promises = cacheItems.map(item => 
      this.set(item.key, item.value, item.ttl || 300)
    );
    
    await Promise.allSettled(promises);
    performanceLogger.info('Cache warming completed', { 
      items: cacheItems.length,
      warmedKeys: cacheItems.map(item => item.key)
    });
  }

  // Health check
  async healthCheck() {
    const health = {
      localCache: {
        status: 'healthy',
        stats: this.localCache.getStats()
      },
      redis: {
        status: this.redisClient?.isReady ? 'healthy' : 'unavailable',
        connected: this.redisClient?.isReady || false
      },
      totalStats: this.getStats()
    };

    return health;
  }
}

// Singleton instance
const cacheManager = new CacheManager();

module.exports = cacheManager;