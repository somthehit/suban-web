async function main() {
  const listRes = await fetch('http://localhost:9222/json/list');
  const pages = await listRes.json();
  const page = pages.find(p => p.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise(r => ws.onopen = r);
  await send('Runtime.enable');
  await send('Page.enable');

  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 2000));

  // Ensure Light mode is active
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        if (!document.documentElement.classList.contains('light')) {
          document.querySelector('button[aria-label*="Mode"]')?.click();
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const fs = await import('fs');

  // Capture Hero in Light mode
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/somth/.gemini/antigravity-ide/brain/fd56eb28-ad0b-488e-ac90-e12ca2034806/home-hero-light.png', Buffer.from(shot1.data, 'base64'));

  // Scroll down to showcase cards
  await send('Runtime.evaluate', { expression: `window.scrollBy(0, 800)` });
  await new Promise(r => setTimeout(r, 600));

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/somth/.gemini/antigravity-ide/brain/fd56eb28-ad0b-488e-ac90-e12ca2034806/home-cards-light.png', Buffer.from(shot2.data, 'base64'));

  // Scroll down to footer
  await send('Runtime.evaluate', { expression: `window.scrollBy(0, 1600)` });
  await new Promise(r => setTimeout(r, 600));

  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/somth/.gemini/antigravity-ide/brain/fd56eb28-ad0b-488e-ac90-e12ca2034806/home-footer-light.png', Buffer.from(shot3.data, 'base64'));

  console.log('Saved all light mode screenshots!');
  ws.close();
}

main().catch(console.error);
