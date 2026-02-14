// HUD showing what Marvin is thinking/doing

export function updateHUD(brain) {
    // Create HUD if it doesn't exist
    let hud = document.getElementById('marvin-hud');
    if (!hud) {
        hud = document.createElement('div');
        hud.id = 'marvin-hud';
        hud.style.cssText = `
            position: absolute;
            top: 80px;
            right: 20px;
            background: rgba(0, 0, 0, 0.85);
            color: #64d9ff;
            padding: 15px 20px;
            border-radius: 10px;
            font-size: 13px;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(100, 217, 255, 0.2);
            z-index: 100;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        document.getElementById('game-container').appendChild(hud);
    }
    
    const thought = brain.getCurrentThought();
    hud.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">🤖 Marvin</div>
        <div style="opacity: 0.8;">${thought}</div>
        <div style="font-size: 11px; opacity: 0.6; margin-top: 8px;">Press F to toggle follow mode</div>
    `;
}
