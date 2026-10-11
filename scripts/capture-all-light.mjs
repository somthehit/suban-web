async function main() {
  const listRes = await fetch('http://localhost:9222/json/list');
  const pages = await listRes.json();
  const page = pages.find(p => p.type === 'page');
  if (!page) {
    console.error('No page found on 9222');
    return;
  }
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

  const fs = await import('fs');

  // 1. Visit Home
  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 2000));

  // Ensure Light mode
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('suban_theme_mode', 'light');
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Shot 1: Home Hero in Light Mode
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/somth/.gemini/antigravity-ide/brain/fd56eb28-ad0b-488e-ac90-e12ca2034806/home-hero-light-fixed.png', Buffer.from(shot1.data, 'base64'));

  // Scroll to Quote and Journal
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, 3100)` });
  await new Promise(r => setTimeout(r, 800));
  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/somth/.gemini/antigravity-ide/brain/fd56eb28-ad0b-488e-ac90-e12ca2034806/home-quote-journal-fixed.png', Buffer.from(shot2.data, 'base64'));

  // 2. Visit Collections
  await send('Page.navigate', { url: 'http://localhost:3000/collections' });
  await new Promise(r => setTimeout(r, 2000));
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Shot 3: Collections Grid Top
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, 350)` });
  await new Promise(r => setTimeout(r, 800));
  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/somth/.gemini/antigravity-ide/brain/fd56eb28-ad0b-488e-ac90-e12ca2034806/collections-light-fixed.png', Buffer.from(shot3.data, 'base64'));

  // Shot 4: Collections Grid Monographs 03, 04, 05
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, 950)` });
  await new Promise(r => setTimeout(r, 800));
  const shot4 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/somth/.gemini/antigravity-ide/brain/fd56eb28-ad0b-488e-ac90-e12ca2034806/collections-monographs-fixed.png', Buffer.from(shot4.data, 'base64'));

  console.log('Screenshots captured successfully!');
  ws.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
