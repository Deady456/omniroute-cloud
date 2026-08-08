const http = require('http');
const httpProxy = require('http-proxy');
const { spawn } = require('child_process');

const port = process.env.PORT || 8080;

console.log('Starting OmniRoute locally...');
const omni = spawn('npx', ['omniroute', 'serve', '--port', '20128'], { stdio: 'inherit', shell: true });

const proxy = httpProxy.createProxyServer({});
proxy.on('error', (err, req, res) => {
  res.writeHead(502, { 'Content-Type': 'text/plain' });
  res.end('OmniRoute is booting up... Please try again in 5 seconds.');
});

http.createServer(function(req, res) {
  proxy.web(req, res, { target: 'http://127.0.0.1:20128' });
}).listen(port, '0.0.0.0', () => {
  console.log('Public Gateway listening on 0.0.0.0:' + port);
});
