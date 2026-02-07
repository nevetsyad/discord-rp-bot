# Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0 or higher
- MySQL 5.7 or higher
- Discord Bot Token
- Discord Application ID
- Discord Server ID
- OpenRouter API Key (optional, for AI features)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/nevetsyad/discord-rp-bot.git
   cd discord-rp-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   npm run setup
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

## 🔧 Detailed Configuration

### Step 1: Create Discord Bot

1. **Go to** [Discord Developer Portal](https://discord.com/developers/applications)
2. **Click "New Application"**
3. **Give it a name** (e.g., "Discord RP Bot")
4. **Go to "Bot" section**
5. **Click "Add Bot"**
6. **Copy the bot token** (click "Reset Token" if needed)

### Step 2: Create Discord Application

1. **Go to "OAuth2" → "URL Generator"**
2. **Select scopes:**
   - `bot`
   - `applications.commands`
3. **Select bot permissions:**
   - `Send Messages`
   - `Embed Links`
   - `Read Message History`
   - `Use Application Commands`
4. **Copy the generated URL**
5. **Paste in browser** and add bot to your server

### Step 3: Get Application ID

1. **Go to "General Information"**
2. **Copy the "Application ID"**
3. **This will be your CLIENT_ID**

### Step 4: Get Server ID

1. **Enable Developer Mode** in Discord Settings → Advanced
2. **Right-click** your server icon
3. **Click "Copy Server ID"**

### Step 5: Set Up Database

#### MySQL
```sql
-- Create database
CREATE DATABASE discord_rp_bot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (recommended)
CREATE USER 'discord_bot'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON discord_rp_bot.* TO 'discord_bot'@'localhost';
FLUSH PRIVILEGES;
```

#### Database Configuration
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=discord_rp_bot
DB_USER=discord_bot
DB_PASSWORD=your_secure_password
```

### Step 6: Configure Environment

Edit your `.env` file:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_application_id_here
GUILD_ID=your_discord_server_id_here

# OpenRouter API Configuration (optional)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=discord_rp_bot
DB_USER=discord_bot
DB_PASSWORD=your_secure_password

# Bot Settings
PREFIX=!
DEFAULT_COLOR=5814783
MAX_CHARACTERS_PER_USER=5
MAX_DICE_ROLLS=10
```

### Step 7: Get OpenRouter API Key (Optional)

1. **Go to** [OpenRouter.ai](https://openrouter.ai/keys)
2. **Create API key**
3. **Copy the key** and add to `.env`

## 🛠️ Running the Bot

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Using Process Manager (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start the bot
pm2 start index.js --name "discord-rp-bot"

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🔍 Verification

### Check Bot is Running
- Look for "Logged in as [bot_name]!" in console
- Check Discord server for online bot
- Test basic commands

### Test Commands
```bash
# Test help command
/help

# Test character creation
/character create --name "Test Character" --description "A test character" --personality "Brave" --appearance "Tall and strong" --backstory "A warrior from the north" --skills "Sword fighting, archery"

# Test dice rolling
/dice 1d20

# Test scene creation
/scene create --name "Test Scene" --description "A mysterious forest" --location "Enchanted Forest" --tone "mysterious"
```

## 🚨 Troubleshooting

### Common Issues

#### Bot Won't Start
- **Check** Discord token is correct
- **Verify** Node.js version is 16+
- **Ensure** all dependencies installed
- **Check** port availability

#### Commands Not Working
- **Verify** bot has correct permissions
- **Check** if commands are registered
- **Restart** the bot
- **Check** console for errors

#### Database Connection Failed
- **Verify** database credentials
- **Check** database is running
- **Ensure** user has proper permissions
- **Check** network connectivity

#### AI Features Not Working
- **Verify** OpenRouter API key
- **Check** API quota
- **Ensure** internet connection
- **Check** API permissions

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

## 📊 Performance Monitoring

### Resource Usage
```bash
# Check memory usage
pm2 info discord-rp-bot

# Monitor CPU usage
htop

# Check disk space
df -h
```

### Database Monitoring
```sql
-- Check database connections
SHOW PROCESSLIST;

-- Check database size
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'discord_rp_bot'
ORDER BY size_mb DESC;
```

## 🔒 Security Best Practices

### Environment Variables
- **Never** commit `.env` files
- **Use** strong passwords
- **Rotate** API keys regularly
- **Limit** access to sensitive data

### Discord Bot Security
- **Use** least permissions necessary
- **Enable** 2FA for Discord account
- **Monitor** bot activity regularly
- **Restrict** bot to specific servers

### Database Security
- **Use** strong authentication
- **Enable** SSL connections
- **Limit** database user privileges
- **Regular** security updates

## 🔄 Maintenance

### Regular Tasks
```bash
# Update dependencies
npm update

# Clean up node_modules
rm -rf node_modules package-lock.json
npm install

# Check for updates
npm outdated

# Restart bot
pm2 restart discord-rp-bot
```

### Backup Strategy
```bash
# Database backup
mysqldump -u username -p discord_rp_bot > backup_$(date +%Y%m%d).sql

# Code backup
git add .
git commit -m "Regular backup"
git push origin main
```

## 🎯 Next Steps

### After Setup
1. **Invite** the bot to your Discord server
2. **Test** all commands
3. **Create** your first character
4. **Set up** your first scene
5. **Explore** AI features

### Advanced Features
1. **Customize** bot appearance
2. **Set up** web dashboard
3. **Configure** automated backups
4. **Implement** monitoring
5. **Add** custom commands

### Community Support
- **GitHub Issues**: Report bugs and request features
- **Discord Server**: Get help from other users
- **Documentation**: Read detailed guides
- **Examples**: Check sample configurations

## 📞 Support

### Getting Help
1. **Check** this setup guide
2. **Review** troubleshooting section
3. **Search** GitHub issues
4. **Create** new issue with details

### Issue Template
```
## Problem
Brief description of the issue

## Environment
- Node.js version:
- Discord.js version:
- Database:
- Operating system:

## Steps to Reproduce
1. Step one
2. Step two

## Expected vs Actual
What should happen vs what happens

## Error Messages
Any error logs or messages

## Additional Context
Other relevant information
```

## 🚀 Deployment to Production

### Using Docker
```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 3000

CMD ["npm", "start"]
```

### Using Heroku
1. **Create** Heroku app
2. **Set** environment variables
3. **Deploy** using Git
4. **Scale** dynos as needed

### Using DigitalOcean
1. **Create** App Platform
2. **Connect** GitHub repository
3. **Configure** environment
4. **Deploy** automatically

## 🎉 Conclusion

Congratulations! You now have a fully functional Discord RP bot with AI-powered Game Master features. 

**Next Steps:**
1. Explore all the bot features
2. Customize for your needs
3. Invite friends to test
4. Contribute to the project
5. Join the community

**Repository:** https://github.com/nevetsyad/discord-rp-bot

**Happy Roleplaying!** 🎲🎭