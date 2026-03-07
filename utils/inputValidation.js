const Joi = require('joi');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const logger = require('../config/security').appLogger;

// Initialize DOMPurify
const window = new JSDOM('').window;
const dompurify = DOMPurify(window);

/**
 * Comprehensive input validation utilities for Discord RP Bot
 * Provides sanitization and validation for all user inputs
 */
class InputValidation {
  constructor() {
    this.maxNameLength = 100;
    this.maxDescriptionLength = 1000;
    this.maxBackstoryLength = 2000;
  }

  /**
   * Sanitize string input to prevent XSS and injection attacks
   */
  sanitizeString(input) {
    if (typeof input !== 'string') return input;
    
    // Remove HTML tags and scripts
    let sanitized = dompurify.sanitize(input, { ALLOWED_TAGS: [] });
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');
    
    return sanitized;
  }

  /**
   * Validate character name
   */
  validateCharacterName(name) {
    const schema = Joi.string()
      .min(1)
      .max(this.maxNameLength)
      .pattern(/^[a-zA-Z0-9\s\-'_]+$/)
      .required()
      .messages({
        'string.min': 'Character name must be at least 1 character long',
        'string.max': `Character name cannot exceed ${this.maxNameLength} characters`,
        'string.pattern.base': 'Character name can only contain letters, numbers, spaces, hyphens, underscores, and apostrophes',
        'any.required': 'Character name is required'
      });

    const sanitized = this.sanitizeString(name);
    return schema.validate(sanitized);
  }

  /**
   * Validate description text
   */
  validateDescription(description) {
    const schema = Joi.string()
      .min(10)
      .max(this.maxDescriptionLength)
      .required()
      .messages({
        'string.min': 'Description must be at least 10 characters long',
        'string.max': `Description cannot exceed ${this.maxDescriptionLength} characters`,
        'any.required': 'Description is required'
      });

    const sanitized = this.sanitizeString(description);
    return schema.validate(sanitized);
  }

  /**
   * Validate backstory (longer text)
   */
  validateBackstory(backstory) {
    const schema = Joi.string()
      .min(20)
      .max(this.maxBackstoryLength)
      .required()
      .messages({
        'string.min': 'Backstory must be at least 20 characters long',
        'string.max': `Backstory cannot exceed ${this.maxBackstoryLength} characters`,
        'any.required': 'Backstory is required'
      });

    const sanitized = this.sanitizeString(backstory);
    return schema.validate(sanitized);
  }

  /**
   * Validate dice notation (e.g., "2d6", "1d20+5")
   */
  validateDiceNotation(notation) {
    const schema = Joi.string()
      .pattern(/^(\d+)d(\d+)([+-]\d+)?$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid dice notation. Use format like "2d6", "1d20+5", "3d10-2"',
        'any.required': 'Dice notation is required'
      });

    const sanitized = this.sanitizeString(notation);
    const { error, value } = schema.validate(sanitized);

    if (error) return { error, value };

    // Parse and validate dice parameters
    const match = value.match(/^(\d+)d(\d+)([+-]\d+)?$/);
    const numDice = parseInt(match[1]);
    const diceSides = parseInt(match[2]);

    if (numDice < 1 || numDice > 10) {
      return {
        error: new Error('Number of dice must be between 1 and 10'),
        value: null
      };
    }

    if (diceSides < 2 || diceSides > 100) {
      return {
        error: new Error('Dice sides must be between 2 and 100'),
        value: null
      };
    }

    return { error: null, value };
  }

  /**
   * Validate Shadowrun attribute value
   */
  validateAttribute(value, attributeName) {
    const schema = Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required()
      .messages({
        'number.base': `${attributeName} must be a number`,
        'number.min': `${attributeName} must be at least 1`,
        'number.max': `${attributeName} cannot exceed 10`,
        'any.required': `${attributeName} is required`
      });

    return schema.validate(value);
  }

  /**
   * Validate skill value
   */
  validateSkill(value, skillName) {
    const schema = Joi.number()
      .integer()
      .min(0)
      .max(12)
      .required()
      .messages({
        'number.base': `${skillName} must be a number`,
        'number.min': `${skillName} must be at least 0`,
        'number.max': `${skillName} cannot exceed 12`,
        'any.required': `${skillName} is required`
      });

    return schema.validate(value);
  }

  /**
   * Validate combat ID
   */
  validateCombatId(combatId) {
    const schema = Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'Invalid combat ID format',
        'any.required': 'Combat ID is required'
      });

    const sanitized = this.sanitizeString(combatId);
    return schema.validate(sanitized);
  }

  /**
   * Validate nuyen amount
   */
  validateNuyen(amount) {
    const schema = Joi.number()
      .integer()
      .min(0)
      .max(1000000000) // 1 billion nuyen max
      .required()
      .messages({
        'number.base': 'Nuyen amount must be a number',
        'number.min': 'Nuyen amount cannot be negative',
        'number.max': 'Nuyen amount cannot exceed 1,000,000,000¥',
        'any.required': 'Nuyen amount is required'
      });

    return schema.validate(amount);
  }

  /**
   * Validate karma amount
   */
  validateKarma(amount) {
    const schema = Joi.number()
      .integer()
      .min(0)
      .max(1000)
      .required()
      .messages({
        'number.base': 'Karma amount must be a number',
        'number.min': 'Karma amount cannot be negative',
        'number.max': 'Karma amount cannot exceed 1000',
        'any.required': 'Karma amount is required'
      });

    return schema.validate(amount);
  }

  /**
   * Validate priority level (A-E)
   */
  validatePriority(priority) {
    const schema = Joi.string()
      .valid('A', 'B', 'C', 'D', 'E')
      .required()
      .messages({
        'any.only': 'Priority must be A, B, C, D, or E',
        'any.required': 'Priority is required'
      });

    const sanitized = this.sanitizeString(priority);
    return schema.validate(sanitized);
  }

  /**
   * Validate race selection
   */
  validateRace(race) {
    const schema = Joi.string()
      .valid('Human', 'Elf', 'Dwarf', 'Ork', 'Troll')
      .required()
      .messages({
        'any.only': 'Race must be Human, Elf, Dwarf, Ork, or Troll',
        'any.required': 'Race is required'
      });

    const sanitized = this.sanitizeString(race);
    return schema.validate(sanitized);
  }

  /**
   * Validate archetype selection
   */
  validateArchetype(archetype) {
    const schema = Joi.string()
      .valid('Mage', 'StreetSamurai', 'Shaman', 'Rigger', 'Decker', 'PhysicalAdept', 'Custom')
      .required()
      .messages({
        'any.only': 'Invalid archetype selection',
        'any.required': 'Archetype is required'
      });

    const sanitized = this.sanitizeString(archetype);
    return schema.validate(sanitized);
  }

  /**
   * Validate Discord user ID
   */
  validateUserId(userId) {
    const schema = Joi.string()
      .pattern(/^\d{17,19}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid Discord user ID format',
        'any.required': 'User ID is required'
      });

    const sanitized = this.sanitizeString(userId);
    return schema.validate(sanitized);
  }

  /**
   * Validate Discord guild ID
   */
  validateGuildId(guildId) {
    const schema = Joi.string()
      .pattern(/^\d{17,19}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid Discord guild ID format',
        'any.required': 'Guild ID is required'
      });

    const sanitized = this.sanitizeString(guildId);
    return schema.validate(sanitized);
  }

  /**
   * Validate URL (for images, etc.)
   */
  validateUrl(url) {
    const schema = Joi.string()
      .uri({ scheme: ['http', 'https'] })
      .max(2048)
      .messages({
        'string.uri': 'Invalid URL format',
        'string.max': 'URL cannot exceed 2048 characters'
      });

    const sanitized = this.sanitizeString(url);
    return schema.validate(sanitized);
  }

  /**
   * Middleware wrapper for command validation
   */
  validateCommand(schema) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        logger.warn('Command validation failed', {
          errors: error.details.map(d => d.message),
          path: req.path
        });

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message
          }))
        });
      }

      req.body = value;
      next();
    };
  }

  /**
   * Sanitize object recursively
   */
  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return typeof obj === 'string' ? this.sanitizeString(obj) : obj;
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = this.sanitizeObject(value);
    }
    return sanitized;
  }
}

// Export singleton instance
module.exports = new InputValidation();
