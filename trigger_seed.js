const http = require('http');

console.log("Triggering seed...");
const request = http.get('http://localhost:3000/api/seed', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log("Response status:", res.statusCode);
        console.log("Body:", data);
    });
});

request.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

request.end();
