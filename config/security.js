const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const { createLogger, format, transports } = require('winston');
const jwt = require('jsonwebtoken');
const { combine, timestamp, printf, colorize, errors, json } = format;

function redactSensitiveMeta(meta) {
  const cloned = { ...meta };
  const sensitiveKeys = ['authorization', 'token', 'password', 'secret', 'apiKey'];
  Object.keys(cloned).forEach((key) => {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      cloned[key] = '[REDACTED]';
    }
  });
  return cloned;
}

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const safeMeta = redactSensitiveMeta(meta);
  return `${timestamp} [${level}]: ${stack || message} ${Object.keys(safeMeta).length ? JSON.stringify(safeMeta, null, 2) : ''}`;
});

// Security logger configuration
const securityLogger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  transports: [
    new transports.File({ filename: 'logs/security.log', level: 'info' }),
    new transports.File({ filename: 'logs/security-error.log', level: 'error' }),
    new transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        logFormat
      )
    })
  ]
});

// Performance logger configuration
const performanceLogger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    json()
  ),
  transports: [
    new transports.File({ filename: 'logs/performance.log' }),
    new transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        logFormat
      )
    })
  ]
});

// Application logger configuration
const appLogger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  transports: [
    new transports.File({ filename: 'logs/app.log' }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        logFormat
      )
    })
  ]
});

// Security middleware configuration
const securityMiddleware = {
  // Helmet security headers
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:"]
      }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true
  }),

  // Rate limiting configuration
  rateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      limit: 'Rate limit exceeded',
      retryAfter: Math.floor(15 * 60 / 60) // minutes
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      securityLogger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        endpoint: req.path
      });
      res.status(429).json({
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.floor(15 * 60 / 60)
      });
    }
  }),

  // API-specific rate limiting
  apiRateLimit: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // more restrictive for API endpoints
    message: {
      error: 'Too many API requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => !req.path.startsWith('/api/')
  }),

  // Command rate limiting
  commandRateLimit: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit to 10 commands per minute per user
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },
    message: {
      error: 'Too many commands, please wait a moment before trying again.'
    },
    handler: (req, res) => {
      securityLogger.warn('Command rate limit exceeded', {
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        endpoint: req.path
      });
      res.status(429).json({
        success: false,
        error: 'Too many commands, please wait a moment before trying again.',
        retryAfter: 60
      });
    }
  }),

  // Compression middleware
  compression: compression({
    level: 6,
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }),

  // CORS configuration
  cors: cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 204
  }),

  // Request logging
  requestLogging: morgan('combined', {
    stream: {
      write: (message) => appLogger.info(message.trim())
    }
  }),

  // Security logging middleware
  securityLogging: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const securityData = {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        statusCode: res.statusCode,
        duration: duration,
        timestamp: new Date().toISOString(),
        userId: req.user?.id,
        sessionId: req.session?.id
      };

      if (res.statusCode >= 400) {
        securityLogger.warn('HTTP error response', securityData);
      } else {
        securityLogger.debug('HTTP request', securityData);
      }
    });

    next();
  },

  // Input validation middleware
  validateInput: (schema) => {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);
      if (error) {
        securityLogger.warn('Input validation failed', {
          error: error.details[0].message,
          path: error.details[0].path,
          timestamp: new Date().toISOString()
        });
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          details: error.details[0].message
        });
      }
      next();
    };
  },

  // Authentication middleware
  authenticate: (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!token) {
      securityLogger.warn('Authentication attempt without token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        endpoint: req.path
      });
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!process.env.JWT_SECRET) {
      securityLogger.error('JWT_SECRET is not configured', {
        endpoint: req.path,
        ip: req.ip
      });
      return res.status(500).json({
        success: false,
        error: 'Server authentication is not configured'
      });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256']
      });

      const userId = payload.sub || payload.userId || payload.id;
      if (!userId) {
        throw new Error('Token payload missing subject');
      }

      req.user = {
        id: String(userId),
        username: payload.username,
        role: payload.role || 'user'
      };

      return next();
    } catch (error) {
      securityLogger.warn('Authentication failed', {
        reason: error.message,
        endpoint: req.path,
        ip: req.ip
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
  },

  // Authorization middleware
  authorize: (roles = []) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const userRole = req.user.role || 'user';
      
      if (roles.length && !roles.includes(userRole)) {
        securityLogger.warn('Authorization failed', {
          userId: req.user.id,
          userRole: userRole,
          requiredRoles: roles,
          timestamp: new Date().toISOString(),
          endpoint: req.path
        });
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    };
  },

  // Error handling middleware
  errorHandler: (err, req, res, next) => {
    securityLogger.error('Application error', {
      error: err.message,
      stack: err.stack,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      endpoint: req.path,
      userId: req.user?.id
    });

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
      success: false,
      error: isDevelopment ? err.message : 'Internal server error',
      ...(isDevelopment && { stack: err.stack })
    });
  }
};

// Export configured middleware
module.exports = {
  securityMiddleware,
  securityLogger,
  performanceLogger,
  appLogger
};