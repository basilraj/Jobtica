// API Test Script
// Tests the main API endpoints to verify they're working correctly

const API_BASE = 'http://localhost:3001/api';

async function testEndpoint(name, url, method = 'GET', data = null) {
    try {
        console.log(`Testing ${name}...`);
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE}${url}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`✅ ${name}: SUCCESS`);
        return result;
    } catch (error) {
        console.error(`❌ ${name}: FAILED - ${error.message}`);
        return null;
    }
}

async function runTests() {
    console.log('🧪 Jobtica API Tests');
    console.log('===================\n');

    // Test 1: Health Check
    await testEndpoint('Health Check', '/health');

    // Test 2: Auth Status (should work even without login)
    await testEndpoint('Auth Status', '/auth/status');

    // Test 3: Data Endpoint (should work but return limited data without auth)
    await testEndpoint('Data Fetch', '/data');

    // Test 4: Robots.txt
    await testEndpoint('Robots.txt', '/robots');

    console.log('\n🎯 Test Summary:');
    console.log('If all tests show ✅, your API is working correctly!');
    console.log('If any tests show ❌, check the error messages above.\n');

    console.log('💡 Note: Auth and Data endpoints may return limited data');
    console.log('   when not authenticated. This is expected behavior.');
}

// Run tests if called directly
if (typeof window === 'undefined') {
    // Node.js environment
    const fetch = global.fetch || (await import('node-fetch')).default;
    runTests().catch(console.error);
} else {
    // Browser environment
    console.log('Open browser console and run: runTests()');
    window.runTests = runTests;
}

export { runTests };