import path from 'path';
import fs from 'fs';

function loadEnvFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    const envContent = fs.readFileSync(filePath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0 && !process.env[key]) {
          process.env[key] = valueParts.join('=').replace(/"/g, '');
        }
      }
    }
  }
}

async function globalSetup() {
  // Load main .env first (for DATABASE_URL and other dev settings)
  const envPath = path.resolve(process.cwd(), '.env');
  loadEnvFile(envPath);
  
  // Then load test-specific overrides
  const envTestPath = path.resolve(process.cwd(), '.env.test');
  loadEnvFile(envTestPath);
  
  // Set test-specific environment variables
  if (!process.env.NODE_ENV) {
    (process.env as any).NODE_ENV = 'test';
  }
  
  console.log('Test environment setup complete');
  console.log('Using development database for testing');
  console.log('Database URL:', process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***@') || 'Not set');
}

export default globalSetup;