const http = require('http');

const data = JSON.stringify({
    email: 'test@test.com',
    password: 'test123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/users/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('🔍 Testing Login API...');

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        console.log('BODY: ' + body);
        if (res.statusCode === 200) {
            console.log('✅ Login Successful!');
        } else {
            console.log('❌ Login Failed');
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Request Error: ${e.message}`);
});

// Write data to request body
req.write(data);
req.end();
