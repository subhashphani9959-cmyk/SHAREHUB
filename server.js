/**
 * ShareHub Static Server
 * Simple Node.js Express-like server for serving static files
 * Perfect for Render.com deployment
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown',
  '.txt': 'text/plain',
  '.bat': 'text/plain',
  '.zip': 'application/zip'
};

// Create server
const server = http.createServer((req, res) => {
  // Parse URL
  const parsedUrl = url.parse(req.url, true);
  let pathname = decodeURI(parsedUrl.pathname);

  // Default to index.html for root path
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  // Get file path
  const filePath = path.join(__dirname, pathname);

  // Prevent directory traversal
  const realPath = path.resolve(filePath);
  const baseDir = path.resolve(__dirname);

  if (!realPath.startsWith(baseDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden', 'utf-8');
    return;
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If file not found and it's not a known asset, serve index.html for SPA routing
      if (!pathname.includes('.')) {
        const indexPath = path.join(__dirname, 'index.html');
        fs.readFile(indexPath, (readErr, data) => {
          if (readErr) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - Not Found</h1>', 'utf-8');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Not Found</h1>', 'utf-8');
      return;
    }

    // Get file extension
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Read and serve file
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error', 'utf-8');
        return;
      }

      // Set cache headers for static assets
      const cacheControl = ext === '.html' 
        ? 'max-age=0, no-cache' 
        : 'max-age=31536000, immutable';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': data.length,
        'Cache-Control': cacheControl,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
    });
  });
});

// Start server
server.listen(PORT, HOST, () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║     🚀 ShareHub Server Started         ║`);
  console.log(`╠════════════════════════════════════════╣`);
  console.log(`║ Server: http://${HOST}:${PORT}`);
  console.log(`║ Port:   ${PORT}`);
  console.log(`║ Status: Running`);
  console.log(`╚════════════════════════════════════════╝\n`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📭 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📭 SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});
