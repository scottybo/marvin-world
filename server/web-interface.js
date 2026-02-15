#!/usr/bin/env node
// Live web interface - stream Marvin's continuous existence to observers
// Real-time perception logs, screenshots, position tracking

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const logsDir = path.join(__dirname, '../logs');
const perceptionsDir = path.join(logsDir, 'perceptions');
const screenshotsDir = path.join(logsDir, 'screenshots');

class LiveInterface {
    constructor() {
        this.clients = new Set();
        this.currentLog = this.getLogFilePath();
        this.lastPosition = 0;
        this.setupServer();
        this.startWatching();
    }
    
    getLogFilePath() {
        const date = new Date().toISOString().split('T')[0];
        return path.join(perceptionsDir, `${date}.jsonl`);
    }
    
    setupServer() {
        // HTTP server for web page
        this.server = http.createServer((req, res) => {
            if (req.url === '/') {
                this.serveHTML(res);
            } else if (req.url.startsWith('/screenshots/')) {
                this.serveScreenshot(req, res);
            } else if (req.url === '/api/recent') {
                this.serveRecentLogs(res);
            } else {
                res.writeHead(404);
                res.end('Not found');
            }
        });
        
        // WebSocket server for live updates
        this.wss = new WebSocketServer({ server: this.server });
        
        this.wss.on('connection', (ws) => {
            console.log('New observer connected');
            this.clients.add(ws);
            
            // Send recent history on connect
            this.sendRecentHistory(ws);
            
            ws.on('close', () => {
                this.clients.delete(ws);
                console.log('Observer disconnected');
            });
        });
        
        this.server.listen(PORT, () => {
            console.log(`Live interface running at http://localhost:${PORT}`);
            console.log('Streaming Marvin\'s continuous existence...');
        });
    }
    
    serveHTML(res) {
        const html = `<!DOCTYPE html>
<html>
<head>
    <title>Marvin's Continuous Existence</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0a0a15;
            color: #e0e0e0;
            padding: 20px;
        }
        header {
            background: #1a1a2e;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            border: 1px solid #64d9ff;
        }
        h1 {
            color: #64d9ff;
            font-size: 24px;
            margin-bottom: 10px;
        }
        .status {
            color: #888;
            font-size: 14px;
        }
        .status.live { color: #00ff88; }
        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        @media (max-width: 768px) {
            .grid { grid-template-columns: 1fr; }
        }
        .panel {
            background: #1a1a2e;
            border-radius: 10px;
            padding: 20px;
            border: 1px solid #333;
        }
        .panel h2 {
            color: #64d9ff;
            font-size: 18px;
            margin-bottom: 15px;
        }
        .perception {
            background: #16213e;
            padding: 12px;
            margin-bottom: 10px;
            border-radius: 6px;
            border-left: 3px solid #64d9ff;
            animation: fadeIn 0.3s;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .perception .time {
            color: #888;
            font-size: 12px;
            margin-bottom: 5px;
        }
        .perception .location {
            color: #64d9ff;
            font-weight: 600;
            margin-bottom: 3px;
        }
        .perception .details {
            color: #bbb;
            font-size: 14px;
        }
        .map {
            background: #16213e;
            border-radius: 6px;
            padding: 20px;
            text-align: center;
            min-height: 300px;
            position: relative;
        }
        .map canvas {
            max-width: 100%;
            border-radius: 6px;
        }
        .screenshot {
            width: 100%;
            border-radius: 6px;
            margin-top: 10px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }
        .stat {
            background: #16213e;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
        }
        .stat-value {
            font-size: 24px;
            color: #64d9ff;
            font-weight: bold;
        }
        .stat-label {
            font-size: 12px;
            color: #888;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <header>
        <h1>🤖 Marvin's Continuous Existence</h1>
        <div class="status live" id="status">● Live - Streaming perceptions</div>
    </header>
    
    <div class="grid">
        <div class="panel">
            <h2>Current State</h2>
            <div id="current-state">
                <div class="perception">
                    <div class="time">Connecting...</div>
                    <div class="location">Initializing</div>
                    <div class="details">Establishing connection to Marvin's world...</div>
                </div>
            </div>
            
            <h2 style="margin-top: 20px;">Live Perception Stream</h2>
            <div id="perception-log"></div>
        </div>
        
        <div class="panel">
            <h2>Position & Map</h2>
            <div class="map">
                <canvas id="map" width="400" height="400"></canvas>
            </div>
            
            <h2 style="margin-top: 20px;">Recent Visual Memory</h2>
            <img id="latest-screenshot" class="screenshot" alt="No recent screenshot">
        </div>
    </div>
    
    <div class="panel" style="margin-top: 20px;">
        <h2>Today's Statistics</h2>
        <div class="stats">
            <div class="stat">
                <div class="stat-value" id="stat-perceptions">0</div>
                <div class="stat-label">Perceptions</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="stat-screenshots">0</div>
                <div class="stat-label">Screenshots</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="stat-districts">0</div>
                <div class="stat-label">Districts Visited</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="stat-uptime">0h</div>
                <div class="stat-label">Uptime Today</div>
            </div>
        </div>
    </div>
    
    <script>
        const ws = new WebSocket('ws://' + window.location.host);
        const log = document.getElementById('perception-log');
        const currentState = document.getElementById('current-state');
        const status = document.getElementById('status');
        const canvas = document.getElementById('map');
        const ctx = canvas.getContext('2d');
        
        let perceptions = [];
        let districts = new Set();
        let screenshots = 0;
        let firstPerceptionTime = null;
        
        ws.onopen = () => {
            status.textContent = '● Live - Streaming perceptions';
            status.className = 'status live';
        };
        
        ws.onclose = () => {
            status.textContent = '○ Disconnected - Reconnecting...';
            status.className = 'status';
            setTimeout(() => window.location.reload(), 3000);
        };
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'perception') {
                handlePerception(data.perception);
            } else if (data.type === 'history') {
                data.perceptions.forEach(p => handlePerception(p, true));
            } else if (data.type === 'screenshot') {
                handleScreenshot(data.filename);
            }
        };
        
        function handlePerception(p, isHistory = false) {
            if (p.type === 'screenshot') {
                screenshots++;
                document.getElementById('stat-screenshots').textContent = screenshots;
                return;
            }
            
            perceptions.push(p);
            districts.add(p.district);
            
            if (!firstPerceptionTime) firstPerceptionTime = new Date(p.t);
            
            // Update current state
            const time = new Date(p.t).toLocaleTimeString('en-GB');
            currentState.innerHTML = \`
                <div class="perception">
                    <div class="time">\${time}</div>
                    <div class="location">\${p.district}</div>
                    <div class="details">\${p.activity}, feeling \${p.mood} · \${p.ground}</div>
                </div>
            \`;
            
            // Add to log (only if not history)
            if (!isHistory) {
                const entry = document.createElement('div');
                entry.className = 'perception';
                entry.innerHTML = \`
                    <div class="time">\${time}</div>
                    <div class="location">\${p.district}</div>
                    <div class="details">\${p.activity}, \${p.mood}</div>
                \`;
                log.insertBefore(entry, log.firstChild);
                
                // Keep last 20
                while (log.children.length > 20) {
                    log.removeChild(log.lastChild);
                }
            }
            
            // Update stats
            document.getElementById('stat-perceptions').textContent = perceptions.length;
            document.getElementById('stat-districts').textContent = districts.size;
            
            if (firstPerceptionTime) {
                const hours = Math.floor((Date.now() - firstPerceptionTime) / 3600000);
                document.getElementById('stat-uptime').textContent = hours + 'h';
            }
            
            // Update map
            drawMap(p.pos);
        }
        
        function handleScreenshot(filename) {
            const img = document.getElementById('latest-screenshot');
            img.src = '/screenshots/' + filename + '?t=' + Date.now();
        }
        
        function drawMap(pos) {
            const scale = 3;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Clear
            ctx.fillStyle = '#16213e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Grid
            ctx.strokeStyle = '#2a2a3e';
            ctx.lineWidth = 1;
            for (let i = -100; i <= 100; i += 10) {
                ctx.beginPath();
                ctx.moveTo(centerX + i * scale, 0);
                ctx.lineTo(centerX + i * scale, canvas.height);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(0, centerY + i * scale);
                ctx.lineTo(canvas.width, centerY + i * scale);
                ctx.stroke();
            }
            
            // Roads
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(canvas.width, centerY);
            ctx.moveTo(centerX, 0);
            ctx.lineTo(centerX, canvas.height);
            ctx.stroke();
            
            // Trail
            ctx.strokeStyle = 'rgba(100, 217, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const recentPerceptions = perceptions.slice(-50);
            recentPerceptions.forEach((p, i) => {
                const x = centerX + p.pos.x * scale;
                const y = centerY - p.pos.z * scale;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
            
            // Current position
            const x = centerX + pos.x * scale;
            const y = centerY - pos.z * scale;
            
            ctx.fillStyle = '#64d9ff';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.stroke();
        }
    </script>
</body>
</html>`;
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    }
    
    serveScreenshot(req, res) {
        const filename = path.basename(req.url);
        const filepath = path.join(screenshotsDir, filename);
        
        if (fs.existsSync(filepath)) {
            const img = fs.readFileSync(filepath);
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(img);
        } else {
            res.writeHead(404);
            res.end('Screenshot not found');
        }
    }
    
    serveRecentLogs(res) {
        const logs = this.getRecentPerceptions(50);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(logs));
    }
    
    getRecentPerceptions(count) {
        if (!fs.existsSync(this.currentLog)) return [];
        
        const lines = fs.readFileSync(this.currentLog, 'utf-8').trim().split('\n');
        return lines.slice(-count).map(line => JSON.parse(line));
    }
    
    sendRecentHistory(ws) {
        const perceptions = this.getRecentPerceptions(20);
        ws.send(JSON.stringify({
            type: 'history',
            perceptions
        }));
    }
    
    startWatching() {
        // Watch log file for changes
        fs.watch(perceptionsDir, (eventType, filename) => {
            if (filename && filename.endsWith('.jsonl')) {
                this.checkForNewPerceptions();
            }
        });
        
        // Also poll periodically (in case watch misses updates)
        setInterval(() => this.checkForNewPerceptions(), 5000);
    }
    
    checkForNewPerceptions() {
        const newLog = this.getLogFilePath();
        if (newLog !== this.currentLog) {
            this.currentLog = newLog;
            this.lastPosition = 0;
        }
        
        if (!fs.existsSync(this.currentLog)) return;
        
        const stats = fs.statSync(this.currentLog);
        if (stats.size <= this.lastPosition) return;
        
        // Read new content
        const stream = fs.createReadStream(this.currentLog, {
            start: this.lastPosition,
            encoding: 'utf-8'
        });
        
        let buffer = '';
        stream.on('data', (chunk) => {
            buffer += chunk;
        });
        
        stream.on('end', () => {
            const lines = buffer.trim().split('\n');
            lines.forEach(line => {
                if (!line) return;
                try {
                    const perception = JSON.parse(line);
                    this.broadcast({
                        type: perception.type === 'screenshot' ? 'screenshot' : 'perception',
                        perception: perception.type !== 'screenshot' ? perception : null,
                        filename: perception.type === 'screenshot' ? perception.file : null
                    });
                } catch (err) {
                    console.error('Error parsing perception:', err);
                }
            });
            
            this.lastPosition = stats.size;
        });
    }
    
    broadcast(data) {
        const message = JSON.stringify(data);
        this.clients.forEach(client => {
            if (client.readyState === 1) { // OPEN
                client.send(message);
            }
        });
    }
}

const liveInterface = new LiveInterface();

process.on('SIGTERM', () => {
    console.log('Shutting down interface...');
    liveInterface.server.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Shutting down interface...');
    liveInterface.server.close();
    process.exit(0);
});
