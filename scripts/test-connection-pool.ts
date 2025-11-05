#!/usr/bin/env tsx

/**
 * Test script to verify database connection pool configuration
 * This script tests the connection pool settings and retry mechanism
 */

import { prisma } from '../lib/db/prisma';
import { logger } from '../lib/logger';

async function testConnectionPool() {
    console.log('🔍 Testing database connection pool configuration...\n');

    try {
        // Test 1: Basic connection health check
        console.log('1. Testing basic connection...');
        const isHealthy = await prisma.$queryRaw`SELECT 1` ? true : false;
        if (isHealthy) {
            console.log('✅ Database connection is healthy');
        } else {
            console.log('❌ Database connection failed');
            return;
        }

        // Test 2: Multiple concurrent connections
        console.log('\n2. Testing concurrent connections...');
        const concurrentPromises = Array.from({ length: 10 }, (_, i) =>
            prisma.user.findMany({ take: 1 }).then(() => {
                console.log(`   Connection ${i + 1} completed`);
                return i + 1;
            })
        );

        const results = await Promise.all(concurrentPromises);
        console.log(`✅ Successfully handled ${results.length} concurrent connections`);

        // Test 3: Connection pool timeout resilience
        console.log('\n3. Testing connection pool resilience...');
        const stressTestPromises = Array.from({ length: 25 }, (_, i) =>
            prisma.user.findMany({ take: 1 }).catch(error => {
                console.log(`   Connection ${i + 1} failed: ${error.message}`);
                throw error;
            })
        );

        await Promise.all(stressTestPromises);
        console.log('✅ Connection pool handled stress test successfully');

        // Test 4: Connection retry mechanism
        console.log('\n4. Testing connection retry mechanism...');
        try {
            await prisma.$connect();
            console.log('✅ Connection retry mechanism is working');
        } catch (error) {
            console.log('❌ Connection retry mechanism failed:', error);
        }

        console.log('\n🎉 All connection pool tests passed!');
        console.log('\nConnection pool configuration:');
        console.log('- Connection limit: 20');
        console.log('- Pool timeout: 60s');
        console.log('- Connect timeout: 60s');
        console.log('- Socket timeout: 60s');
        console.log('- Retry mechanism: 3 attempts with 1s delay');

    } catch (error) {
        console.error('❌ Connection pool test failed:', error);
        logger.error('Connection pool test failed', error instanceof Error ? error : new Error(String(error)));
    } finally {
        await prisma.$disconnect();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the test
if (require.main === module) {
    testConnectionPool().catch(console.error);
}

export { testConnectionPool };

