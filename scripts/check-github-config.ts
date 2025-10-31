#!/usr/bin/env tsx

/**
 * Script to check GitHub OAuth configuration
 * Run with: npx tsx scripts/check-github-config.ts
 */

// Environment variables are automatically loaded by Next.js

console.log('🔍 Checking GitHub OAuth Configuration...\n');

// Check environment variables
const githubId = process.env.AUTH_GITHUB_ID;
const githubSecret = process.env.AUTH_GITHUB_SECRET;
const authSecret = process.env.AUTH_SECRET;

console.log('📋 Environment Variables:');
console.log(`  AUTH_GITHUB_ID: ${githubId ? '✅ Set' : '❌ Missing'}`);
console.log(`  AUTH_GITHUB_SECRET: ${githubSecret ? '✅ Set' : '❌ Missing'}`);
console.log(`  AUTH_SECRET: ${authSecret ? '✅ Set' : '❌ Missing'}`);

console.log('\n🔧 Configuration Status:');

if (!githubId || !githubSecret) {
    console.log('❌ GitHub OAuth is NOT configured');
    console.log('\n📝 To fix this:');
    console.log('1. Create a GitHub OAuth App at: https://github.com/settings/applications/new');
    console.log('2. Set Authorization callback URL to: http://localhost:3000/api/auth/callback/github');
    console.log('   (Better Auth handles OAuth callbacks through /api/auth/callback/[provider])');
    console.log('3. Create .env.local file with:');
    console.log('   AUTH_GITHUB_ID=your-client-id');
    console.log('   AUTH_GITHUB_SECRET=your-client-secret');
    console.log('4. Restart your development server');
} else {
    console.log('✅ GitHub OAuth is configured');
    console.log('\n🚀 Next steps:');
    console.log('1. Make sure your development server is running');
    console.log('2. Test GitHub sign-in functionality');
    console.log('3. Try fetching GitHub repositories');
}

console.log('\n📚 For more help, see: README.md#github-oauth-setup');
