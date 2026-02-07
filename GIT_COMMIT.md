# Git Commit Instructions

To publish this Discord RP Bot to an online repository, follow these steps:

## 1. Initialize Git Repository
```bash
cd discord-rp-bot
git init
```

## 2. Add Remote Repository (Choose one)
### GitHub
```bash
git remote add origin https://github.com/your-username/discord-rp-bot.git
```

### GitLab
```bash
git remote add origin https://gitlab.com/your-username/discord-rp-bot.git
```

### Bitbucket
```bash
git remote add origin https://bitbucket.org/your-username/discord-rp-bot.git
```

## 3. Add and Commit Files
```bash
git add .
git commit -m "Initial commit: Complete Discord RP Bot with GM tools and AI integration"
```

## 4. Push to Repository
```bash
git branch -M main
git push -u origin main
```

## 5. Repository Setup Steps
After pushing:

### GitHub:
1. Go to your repository on GitHub
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Add these repository secrets:
   - `DISCORD_TOKEN` (your bot token)
   - `CLIENT_ID` (your bot client ID)
   - `GUILD_ID` (your server ID)
   - `OPENROUTER_API_KEY` (for AI features)
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (database credentials)

### GitLab:
1. Go to your repository on GitLab
2. Go to "Settings" → "CI/CD" → "Variables"
3. Add the same environment variables

### Bitbucket:
1. Go to your repository on Bitbucket
2. Go to "Repository settings" → "Repository variables"
3. Add the same environment variables

## 6. Create GitHub Actions (Optional)
For automated deployment and testing, create a `.github/workflows/deploy.yml` file.

## 7. Share with Friends
Once published, share the repository URL with your friends. They can:
1. Clone the repository: `git clone <repository-url>`
2. Install dependencies: `npm install`
3. Set up their own environment variables
4. Run the bot: `npm start`

## Note for Security
- Never commit your `.env` file
- Keep your bot tokens and API keys secure
- Use repository secrets for production deployments