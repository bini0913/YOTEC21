const http = require('http');
const fs = require('fs');
const path = require('path');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json' };
http.createServer((req, res) => {
    let file = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain', 'Access-Control-Allow-Origin': '*' });
        res.end(data);
    });
}).listen(8420, () => console.log('YOTEC running at http://localhost:8420'));
