#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function checkSubmoduleStatus() {
    log('\n🔍 Checking content submodule status...', 'bold');

    const contentDir = 'content';
    const submoduleUrl = 'https://github.com/CodeAcademyBerlin/content.git';

    if (!fs.existsSync(contentDir)) {
        warning('Content submodule does not exist');
        info('To set up the submodule, run: node scripts/manage-content-submodule.js setup');
        return false;
    }

    if (!fs.existsSync(path.join(contentDir, '.git'))) {
        warning('Content directory exists but is not a git repository');
        info('To fix this, run: node scripts/manage-content-submodule.js setup');
        return false;
    }

    try {
        // Check if it's properly linked to the correct remote
        const remoteUrl = execSync('git remote get-url origin', {
            cwd: contentDir,
            encoding: 'utf8'
        }).trim();

        if (remoteUrl !== submoduleUrl) {
            warning(`Content submodule points to wrong remote: ${remoteUrl}`);
            info('Expected: https://github.com/CodeAcademyBerlin/content.git');
            return false;
        }

        // Check if it's up to date
        const status = execSync('git status --porcelain', {
            cwd: contentDir,
            encoding: 'utf8'
        }).trim();

        if (status) {
            warning('Content submodule has uncommitted changes');
            info('Consider committing or stashing changes in the content directory');
        }

        success('Content submodule is properly configured');
        return true;
    } catch (err) {
        error('Failed to check submodule status');
        return false;
    }
}

function setupSubmodule() {
    log('\n📚 Setting up content submodule...', 'bold');

    const contentDir = 'content';
    const submoduleUrl = 'https://github.com/CodeAcademyBerlin/content.git';

    try {
        // Remove existing content directory if it's not a proper submodule
        if (fs.existsSync(contentDir)) {
            if (!fs.existsSync(path.join(contentDir, '.git'))) {
                fs.rmSync(contentDir, { recursive: true, force: true });
                success('Removed existing content directory to set up proper submodule');
            } else {
                // Check if it's the correct submodule
                try {
                    const remoteUrl = execSync('git remote get-url origin', {
                        cwd: contentDir,
                        encoding: 'utf8'
                    }).trim();

                    if (remoteUrl === submoduleUrl) {
                        info('Content submodule already exists and is correctly configured');
                        updateSubmodule();
                        return;
                    } else {
                        warning('Content directory exists but points to wrong remote');
                        fs.rmSync(contentDir, { recursive: true, force: true });
                        success('Removed existing content directory to set up correct submodule');
                    }
                } catch {
                    fs.rmSync(contentDir, { recursive: true, force: true });
                    success('Removed existing content directory to set up proper submodule');
                }
            }
        }

        // Add the submodule
        executeCommand(
            `git submodule add ${submoduleUrl} ${contentDir}`,
            'Failed to add content submodule',
            'Content submodule added successfully'
        );

        // Initialize and update the submodule
        executeCommand(
            'git submodule update --init --recursive',
            'Failed to initialize content submodule',
            'Content submodule initialized successfully'
        );

        success('Content submodule setup completed successfully!');
    } catch (err) {
        error('Failed to set up content submodule');
        info('You can try manually:');
        info('  git submodule add https://github.com/CodeAcademyBerlin/content.git content');
        info('  git submodule update --init --recursive');
        process.exit(1);
    }
}

function updateSubmodule() {
    log('\n🔄 Updating content submodule...', 'bold');

    try {
        executeCommand(
            'git submodule update --remote --merge',
            'Failed to update content submodule',
            'Content submodule updated successfully'
        );
    } catch (err) {
        error('Failed to update content submodule');
        info('You can try manually: git submodule update --remote --merge');
        process.exit(1);
    }
}

function showHelp() {
    log('\n📚 Content Submodule Management Script', 'bold');
    log('=====================================\n', 'bold');

    log('Usage: node scripts/manage-content-submodule.js <command>', 'cyan');
    log('\nCommands:', 'bold');
    log('  status    - Check the status of the content submodule');
    log('  setup     - Set up the content submodule (add and initialize)');
    log('  update    - Update the content submodule to latest version');
    log('  help      - Show this help message');

    log('\nExamples:', 'bold');
    log('  node scripts/manage-content-submodule.js status');
    log('  node scripts/manage-content-submodule.js setup');
    log('  node scripts/manage-content-submodule.js update');

    log('\nNote:', 'yellow');
    log('The content submodule contains the LMS course content that will be');
    log('imported into the database when running the seed script.');
}

function main() {
    const command = process.argv[2] || 'help';

    switch (command) {
        case 'status':
            checkSubmoduleStatus();
            break;
        case 'setup':
            setupSubmodule();
            break;
        case 'update':
            updateSubmodule();
            break;
        case 'help':
        default:
            showHelp();
            break;
    }
}

if (require.main === module) {
    main();
}
