const http = require('http');
const httpProxy = require('http-proxy');
const { spawn } = require('child_process');

const port = process.env.PORT || 8080;

console.log('Starting OmniRoute locally on port 20130...');

// Try to spawn omniroute with NODE_OPTIONS to debug regex issue
const env = Object.assign({}, process.env, {
  NODE_OPTIONS: '--no-warnings'
});

const omni = spawn('npx', ['omniroute', 'serve', '--port', '20130'], { 
  stdio: 'inherit', 
  shell: true,
  env: env
});

// Monitor omniroute subprocess for crashes
omni.on('error', (err) => {
  console.error('Failed to start OmniRoute subprocess:', err.message);
  process.exit(1);
});

omni.on('exit', (code, signal) => {
  console.error(`OmniRoute exited with code ${code} (signal: ${signal}). Check omniroute configuration or dependencies.`);
  if (code !== 0) {
    process.exit(1);
  }
});

const proxy = httpProxy.createProxyServer({});
proxy.on('error', (err, req, res) => {
  res.writeHead(502, { 'Content-Type': 'text/plain' });
  res.end('OmniRoute backend unavailable. Please try again in a moment.');
});

http.createServer(function(req, res) {
  proxy.web(req, res, { target: 'http://127.0.0.1:20130' });
}).listen(port, '0.0.0.0', () => {
  console.log('Public Gateway listening on 0.0.0.0:' + port);
});

