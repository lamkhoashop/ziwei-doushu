const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = 'C:/Users/lamnh/.gemini/antigravity/brain/18aa9ef6-3006-4c5b-93fb-f60e86da8c54/scratch/og-card.html';
const outPath = path.resolve(__dirname, '../public/og-image.png');

console.log('Launching Chrome for OG card capture...');
const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--remote-debugging-port=9244',
  `file:///${htmlPath}`
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9244/json');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.type === 'page') || tabs[0];
    if (!tab) throw new Error('No tab found');

    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Emulation.setDeviceMetricsOverride',
        params: {
          width: 1200,
          height: 630,
          deviceScaleFactor: 1,
          mobile: false
        }
      }));
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id === 1) {
        // Wait 1.5s for Google Webfonts (Philosopher & Playfair Display) to render
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 2,
            method: 'Page.captureScreenshot',
            params: {
              format: 'png',
              clip: {
                x: 0,
                y: 0,
                width: 1200,
                height: 630,
                scale: 1
              }
            }
          }));
        }, 1500);
      } else if (data.id === 2) {
        const base64 = data.result.data;
        fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
        console.log('Successfully generated OG Card at:', outPath);
        ws.close();
        chrome.kill();
        process.exit(0);
      }
    };
  } catch (err) {
    console.error('Error capturing OG Card:', err);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
