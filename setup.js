#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function executeCommand(command, errorMessage, successMessage) {
  try {
    log(`Running: ${command}`, 'cyan');
    execSync(command, { stdio: 'inherit' });
    if (successMessage) success(successMessage);
  } catch (err) {
    error(`${errorMessage}: ${err.message}`);
    throw err;
  }
}

function installPnpm() {
  log('\n📦 Installing pnpm...', 'bold');
  
  try {
    // Check if pnpm is already installed
    execSync('pnpm --version', { stdio: 'ignore' });
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    success(`pnpm ${pnpmVersion} is already installed`);
    return true;
  } catch {
    info('pnpm not found, installing...');
    
    try {
      // Try installing pnpm using npm
      executeCommand(
        'npm install -g pnpm',
        'Failed to install pnpm globally',
        'pnpm installed successfully'
      );
      
      // Verify installation
      const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
      success(`pnpm ${pnpmVersion} installed successfully`);
      return true;
    } catch {
      error('Failed to install pnpm automatically');
      log('\n🔧 Manual pnpm installation options:', 'yellow');
      log('1. Using npm: npm install -g pnpm');
      log('2. Using curl: curl -fsSL https://get.pnpm.io/install.sh | sh -');
      log('3. Using PowerShell (Windows): iwr https://get.pnpm.io/install.ps1 -useb | iex');
      log('4. Visit https://pnpm.io/installation for more options');
      throw new Error('pnpm installation required');
    }
  }
}

function checkPrerequisites() {
  log('\n🔍 Checking prerequisites...', 'bold');
  
  // Check Node.js version
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
    if (majorVersion < 18) {
      throw new Error(`Node.js version ${nodeVersion} detected. Please upgrade to Node.js 18 or higher.`);
    }
    success(`Node.js ${nodeVersion} detected`);
  } catch (err) {
    error('Node.js not found. Please install Node.js 18 or higher.');
    throw err;
  }

  // Install and check pnpm (now mandatory)
  installPnpm();
  
  // Since we enforce pnpm, always return pnpm
  return 'pnpm';
}

function createEnvFile() {
  log('\n📄 Setting up environment variables...', 'bold');
  
  const envFile = '.env';
  const envExampleFile = '.env.example';
  
  if (!fs.existsSync(envFile)) {
    if (fs.existsSync(envExampleFile)) {
      fs.copyFileSync(envExampleFile, envFile);
      success('Created .env file from .env.example');
    } else {
      // Create a basic .env file with default values
      const defaultEnv = `# Database
DATABASE_URL="file:./dev.db"

# Authentication (generate your own secret)
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
UPLOADTHING_TOKEN="your-uploadthing-token"

# Optional: Add your own API keys here
`;
      fs.writeFileSync(envFile, defaultEnv);
      success('Created .env file with default values');
      warning('Please update the NEXTAUTH_SECRET in .env file with a secure secret');
    }
  } else {
    info('.env file already exists');
  }
}

function ensureDirectories() {
  log('\n📁 Ensuring required directories exist...', 'bold');
  
  const requiredDirs = [
    'docs',
    'prisma',
    'public',
    'uploads'
  ];
  
  requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      success(`Created directory: ${dir}`);
    }
  });
}

function setupDatabase(packageManager) {
  log('\n🗄️  Setting up database...', 'bold');
  
  try {
    executeCommand(
      `${packageManager} db:generate`,
      'Failed to generate Prisma client',
      'Generated Prisma client'
    );
    
    executeCommand(
      `${packageManager} db:push --force-reset`,
      'Failed to push database schema',
      'Database schema pushed successfully'
    );
    
    // Try seeding, but don't fail if it doesn't work
    try {
      executeCommand(
        `${packageManager} db:seed`,
        'Failed to seed database',
        'Database seeded successfully'
      );
    } catch {
      warning('Database seeding failed, but this is not critical for development');
      info('You can manually run the seed later with: pnpm db:seed');
    }
    
  } catch (dbError) {
    error('Database setup failed');
    log('\n🔧 Database troubleshooting:', 'yellow');
    log('1. Make sure no other database processes are running');
    log('2. Check if the database file is locked');
    log('3. Try deleting prisma/dev.db and running setup again');
    log('4. For production, ensure your DATABASE_URL is correct');
    throw dbError;
  }
}

function main() {
  log('⚔️  CODAC Attack on Titan Setup Script', 'bold');
  log('=====================================\n', 'bold');
  
  try {
    const packageManager = checkPrerequisites();
    
    createEnvFile();
    ensureDirectories();
    
    log('\n📦 Installing dependencies...', 'bold');
    executeCommand(
      `${packageManager} install`,
      'Failed to install dependencies',
      'Dependencies installed successfully'
    );
    
    setupDatabase(packageManager);
    
    log('\n🎉 Setup completed successfully!', 'green');
    log('\nNext steps:', 'bold');
    log(`1. Start the development server: ${packageManager} dev`);
    log('2. Open http://localhost:3000 in your browser');
    log('3. Join the 104th Training Corps with one of the sample accounts above!');
    
    log('\nSample accounts:', 'cyan');
    log('• Student: eren.yeager@104th.paradis.military');
    log('• Student: mikasa.ackerman@104th.paradis.military');
    log('• Student: armin.arlert@104th.paradis.military');
    log('• Mentor: levi.ackerman@mentor.paradis.military');
    log('• Mentor: erwin.smith@mentor.paradis.military');
    
    log('\nFor help, check:', 'yellow');
    log('• README.md for detailed documentation');
    log('• CONTRIBUTING.md for development guidelines');
    log('• GitHub issues for known problems');
    
  } catch (err) {
    error('\n❌ Setup failed!');
    log(`Error: ${err.message}`, 'red');
    log('\nFor help:', 'yellow');
    log('1. Check the error message above');
    log('2. Ensure you have Node.js 18+ installed');
    log('3. Try running the setup script again');
    log('4. Check the GitHub issues for similar problems');
    log('5. Contact the development team if needed');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 