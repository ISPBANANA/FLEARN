const http = require('http');

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8099,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function test() {
    console.log('\n=== Testing Type Filter ===\n');
    
    const all = await makeRequest('/api/questions');
    console.log('All questions:');
    all.data.forEach(q => console.log(`  - ${q.type_name}: ${q.question_id}`));
    
    console.log('\n=== Filtering by type=multiple_choice ===\n');
    const filtered = await makeRequest('/api/questions?type=multiple_choice');
    console.log(`Found ${filtered.count} questions:`);
    filtered.data.forEach(q => console.log(`  - ${q.type_name}: ${q.question_id}`));
}

test().catch(console.error);
