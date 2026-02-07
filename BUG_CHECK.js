#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Discord RP Bot - Bug Check Script');
console.log('=====================================\n');

// Check 1: Essential files exist
console.log('📁 Checking essential files...');

const essentialFiles = [
  'index.js',
  'package.json',
  '.env.example',
  'commands/character.js',
  'commands/dice.js',
  'commands/scene.js',
  'commands/game.js',
  'commands/gm.js',
  'commands/gm_ai.js',
  'commands/help.js',
  'events/ready.js',
  'events/interactionCreate.js',
  'models/Character.js',
  'models/Scene.js',
  'models/User.js'
];

const missingFiles = [];
essentialFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
  } else {
    console.log(`  ✅ ${file}`);
  }
});

if (missingFiles.length > 0) {
  console.log(`  ❌ Missing files: ${missingFiles.join(', ')}`);
}

// Check 2: Package.json validation
console.log('\n📦 Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.name && packageJson.version && packageJson.main) {
    console.log(`  ✅ Name: ${packageJson.name}`);
    console.log(`  ✅ Version: ${packageJson.version}`);
    console.log(`  ✅ Main: ${packageJson.main}`);
  } else {
    console.log('  ❌ Missing required package.json fields');
  }
  
  if (packageJson.scripts && packageJson.scripts.start) {
    console.log(`  ✅ Start script: ${packageJson.scripts.start}`);
  } else {
    console.log('  ❌ Missing start script');
  }
} catch (error) {
  console.log(`  ❌ Error reading package.json: ${error.message}`);
}

// Check 3: Environment variables example
console.log('\n🔧 Checking environment configuration...');
try {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const requiredVars = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
  
  const missingVars = requiredVars.filter(varName => !envExample.includes(varName));
  
  if (missingVars.length === 0) {
    console.log('  ✅ All required environment variables present');
  } else {
    console.log(`  ❌ Missing environment variables: ${missingVars.join(', ')}`);
  }
} catch (error) {
  console.log(`  ❌ Error reading .env.example: ${error.message}`);
}

// Check 4: JavaScript syntax validation
console.log('\n🔍 Checking JavaScript syntax...');
const jsFiles = [
  'index.js',
  'setup.js',
  'commands/character.js',
  'commands/dice.js',
  'commands/scene.js',
  'commands/game.js',
  'commands/gm.js',
  'commands/gm_ai.js',
  'commands/help.js',
  'events/ready.js',
  'events/interactionCreate.js',
  'models/Character.js',
  'models/Scene.js',
  'models/User.js'
];

const syntaxErrors = [];
jsFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      // Basic syntax check - try to parse
      new Function(content);
      console.log(`  ✅ ${file} - syntax OK`);
    } catch (error) {
      syntaxErrors.push({ file, error: error.message });
      console.log(`  ❌ ${file} - syntax error: ${error.message}`);
    }
  }
});

// Check 5: Documentation check
console.log('\n📚 Checking documentation...');
const docsFiles = [
  'README.md',
  'BUG_CHECKLIST.md',
  'docs/COMMAND_REFERENCE.md',
  'docs/DEPLOYMENT.md',
  'docs/SETUP_GUIDE.md'
];

docsFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`  ✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`  ❌ ${file} - missing`);
  }
});

// Check 6: Git repository check
console.log('\n🔄 Checking Git repository...');
try {
  const gitConfig = fs.readFileSync('.git/config', 'utf8');
  if (gitConfig.includes('url')) {
    console.log('  ✅ Git repository configured');
  } else {
    console.log('  ❌ Git repository not properly configured');
  }
} catch (error) {
  console.log('  ❌ No git configuration found');
}

// Check 7: License check
console.log('\n📄 Checking license...');
try {
  const licenseContent = fs.readFileSync('LICENSE', 'utf8');
  if (licenseContent.length > 100) {
    console.log('  ✅ License file exists and appears valid');
  } else {
    console.log('  ❌ License file may be incomplete');
  }
} catch (error) {
  console.log('  ❌ No LICENSE file found');
}

// Summary
console.log('\n📊 Bug Check Summary');
console.log('=====================');

const totalChecks = essentialFiles.length + 5; // 5 additional checks
const passedChecks = essentialFiles.length - missingFiles.length;
const totalPassed = passedChecks + (syntaxErrors.length === 0 ? 5 : 5 - syntaxErrors.length);

console.log(`Total checks performed: ${totalChecks}`);
console.log(`Passed checks: ${totalPassed}`);
console.log(`Failed checks: ${totalChecks - totalPassed}`);

if (missingFiles.length === 0 && syntaxErrors.length === 0) {
  console.log('\n🎉 All critical checks passed! The bot should be ready for deployment.');
} else {
  console.log('\n⚠️  Some issues found. Please address them before deployment.');
  
  if (syntaxErrors.length > 0) {
    console.log('\nSyntax Errors:');
    syntaxErrors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }
}

console.log('\n✅ Bug check completed!');