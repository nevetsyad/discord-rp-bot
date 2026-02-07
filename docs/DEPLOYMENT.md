# Deployment Guide

## 🚀 Deployment Options

### Option 1: Local Development
```bash
# Clone the repository
git clone https://github.com/nevetsyad/discord-rp-bot.git
cd discord-rp-bot

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run setup

# Start the bot
npm start
```

### Option 2: Docker Deployment
```bash
# Build the Docker image
docker build -t discord-rp-bot .

# Run the container
docker run -d \
  --name discord-rp-bot \
  -e DISCORD_TOKEN=your_token \
  -e CLIENT_ID=your_client_id \
  -e GUILD_ID=your_guild_id \
  -e OPENROUTER_API_KEY=your_api_key \
  -e DB_HOST=your_db_host \
  -e DB_PORT=3306 \
  -e DB_NAME=discord_rp_bot \
  -e DB_USER=your_db_user \
  -e DB_PASSWORD=your_db_password \
  discord-rp-bot
```

### Option 3: PM2 Process Management
```bash
# Install PM2 globally
npm install -g pm2

# Start the bot with PM2
pm2 start index.js --name "discord-rp-bot"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 4: Heroku Deployment
1. Create a Heroku app
2. Add the following buildpacks:
   - heroku/nodejs
   - heroku/mysql

3. Set environment variables:
   ```bash
   heroku config:set DISCORD_TOKEN=your_token
   heroku config:set CLIENT_ID=your_client_id
   heroku config:set GUILD_ID=your_guild_id
   heroku config:set OPENROUTER_API_KEY=your_api_key
   heroku config:set DB_HOST=your_db_host
   heroku config:set DB_PORT=3306
   heroku config:set DB_NAME=discord_rp_bot
   heroku config:set DB_USER=your_db_user
   heroku config:set DB_PASSWORD=your_db_password
   ```

4. Deploy:
   ```bash
   git push heroku main
   ```

### Option 5: DigitalOcean App Platform
1. Create a new app
2. Connect your GitHub repository
3. Configure environment variables
4. Set up deployment triggers

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DISCORD_TOKEN` | ✅ | Discord bot token | - |
| `CLIENT_ID` | ✅ | Discord bot application ID | - |
| `GUILD_ID` | ✅ | Discord server ID | - |
| `OPENROUTER_API_KEY` | ❌ | OpenRouter API key for AI features | - |
| `DB_HOST` | ✅ | Database host | `localhost` |
| `DB_PORT` | ✅ | Database port | `3306` |
| `DB_NAME` | ✅ | Database name | `discord_rp_bot` |
| `DB_USER` | ✅ | Database username | - |
| `DB_PASSWORD` | ✅ | Database password | - |
| `PREFIX` | ❌ | Command prefix | `!` |
| `DEFAULT_COLOR` | ❌ | Default embed color | `5814783` |
| `MAX_CHARACTERS_PER_USER` | ❌ | Max characters per user | `5` |
| `MAX_DICE_ROLLS` | ❌ | Max dice rolls per request | `10` |

### Database Setup

#### MySQL
```sql
-- Create database
CREATE DATABASE discord_rp_bot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (optional)
CREATE USER 'discord_bot'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON discord_rp_bot.* TO 'discord_bot'@'localhost';
FLUSH PRIVILEGES;
```

#### PostgreSQL
```sql
-- Create database
CREATE DATABASE discord_rp_bot;
CREATE USER discord_bot WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE discord_rp_bot TO discord_bot;
```

## 📊 Monitoring & Logging

### Logging Configuration
```javascript
// Add to your setup for better logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Health Checks
```javascript
// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: sequelize.connection
  });
});
```

## 🔒 Security Hardening

### Environment Security
1. **Never commit .env files**
2. **Use strong passwords**
3. **Rotate API keys regularly**
4. **Use environment-specific configurations**
5. **Enable HTTPS for web interfaces**

### Discord Bot Security
1. **Use the least permissions necessary**
2. **Enable 2FA for your Discord account**
3. **Regular token rotation**
4. **Monitor bot activity**
5. **Restrict guild access**

### Database Security
1. **Use strong authentication**
2. **Enable SSL connections**
3. **Regular backups**
4. **Limit database user privileges**
5. **Enable query logging**

## 🔄 Backup Strategies

### Database Backups
```bash
# MySQL backup
mysqldump -u username -p discord_rp_bot > backup.sql

# PostgreSQL backup
pg_dump -U username discord_rp_bot > backup.sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > "backup_$DATE.sql"
# Keep only last 7 days
find . -name "backup_*.sql" -mtime +7 -delete
```

### Code Backups
```bash
# Regular git commits
git add .
git commit -m "Regular backup commit"
git push origin main
```

## 🚀 Production Checklist

### Pre-Deployment
- [ ] Run all tests
- [ ] Review environment variables
- [ ] Check database schema
- [ ] Test all commands
- [ ] Verify API credentials
- [ ] Create backups
- [ ] Review security settings

### Post-Deployment
- [ ] Monitor bot startup
- [ ] Test all commands
- [ ] Check database connections
- [ ] Monitor API usage
- [ ] Set up monitoring alerts
- [ ] Create documentation update

## 📈 Performance Optimization

### Database Optimization
1. **Add indexes** for frequently queried fields
2. **Use connection pooling**
3. **Optimize query performance**
4. **Regular maintenance**
5. **Monitor slow queries**

### Application Optimization
1. **Enable caching** for frequently accessed data
2. **Use compression** for API responses
3. **Implement rate limiting**
4. **Optimize AI API calls**
5. **Use proper error handling**

### Infrastructure Optimization
1. **Use CDN for static assets**
2. **Implement load balancing**
3. **Use container orchestration**
4. **Set up auto-scaling**
5. **Use managed databases**

## 🛠️ Maintenance

### Regular Tasks
- [ ] Check for updates
- [ ] Monitor performance
- [ ] Review logs
- [ ] Update dependencies
- [ ] Rotate API keys
- [ ] Take backups
- [ ] Test disaster recovery

### Update Process
1. **Test in staging environment**
2. **Create backup**
3. **Deploy update**
4. **Monitor for issues**
5. **Rollback if necessary**

## 🚨 Troubleshooting

### Common Issues
- **Bot won't start**: Check token and permissions
- **Database connection failed**: Verify credentials and network
- **Commands not working**: Check registration and permissions
- **AI features not working**: Verify API key and quota
- **Memory issues**: Check for leaks and optimize

### Debug Commands
```bash
# Check bot status
pm2 status

# View logs
pm2 logs discord-rp-bot

# Restart bot
pm2 restart discord-rp-bot

# Monitor resources
pm2 monit
```

## 📞 Support

### Getting Help
1. **Check the documentation**
2. **Review existing issues**
3. **Search for similar problems**
4. **Create detailed issue report**
5. **Provide reproduction steps**

### Issue Template
```
## Description
Brief description of the issue

## Environment
- Node.js version:
- Discord.js version:
- Database:
- Operating system:

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Error Messages
Any error messages or logs

## Additional Context
Any other relevant information
```

## 🎯 Best Practices

### Code Quality
- Follow existing code style
- Add comments for complex logic
- Write comprehensive tests
- Use proper error handling
- Document new features

### Security
- Validate all inputs
- Use parameterized queries
- Implement proper authentication
- Monitor for suspicious activity
- Keep dependencies updated

### Performance
- Profile before optimizing
- Use appropriate data structures
- Monitor resource usage
- Optimize database queries
- Implement caching strategies

### Documentation
- Keep README updated
- Add examples for new features
- Update deployment guides
- Document configuration options
- Create troubleshooting guides