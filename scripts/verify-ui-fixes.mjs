import fs from 'fs';

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

  const outDir = 'C:/Users/somth/.gemini/antigravity-ide/brain/fd56eb28-ad0b-488e-ac90-e12ca2034806';

  // 1. Visit Blog in Light Mode
  console.log('Navigating to /blog in Light Mode...');
  await send('Page.navigate', { url: 'http://localhost:3000/blog' });
  await new Promise(r => setTimeout(r, 2000));
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('suban_theme_mode', 'light');
        window.scrollTo(0, 360);
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  const blogLight = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${outDir}/blog-narrative-light-fixed.png`, Buffer.from(blogLight.data, 'base64'));
  console.log('Saved blog-narrative-light-fixed.png');

  // 2. Visit Home and scroll to Curated Collections in Light Mode
  console.log('Navigating to / and scrolling to Curated Collections in Light Mode...');
  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 2000));
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('suban_theme_mode', 'light');
        const el = Array.from(document.querySelectorAll('h2')).find(h => h.innerText.includes('Curated Collections'));
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  const collectionsHomeLight = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${outDir}/home-curated-collections-light-fixed.png`, Buffer.from(collectionsHomeLight.data, 'base64'));
  console.log('Saved home-curated-collections-light-fixed.png');

  // 3. Visit /collections in Light Mode
  console.log('Navigating to /collections in Light Mode...');
  await send('Page.navigate', { url: 'http://localhost:3000/collections' });
  await new Promise(r => setTimeout(r, 2000));
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('suban_theme_mode', 'light');
        window.scrollTo(0, 400);
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  const collectionsPageLight = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${outDir}/collections-mosaic-light-fixed.png`, Buffer.from(collectionsPageLight.data, 'base64'));
  console.log('Saved collections-mosaic-light-fixed.png');

  // 4. Dark Mode Verification - Home Curated Collections
  console.log('Navigating to / in Dark Mode...');
  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 2000));
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        localStorage.setItem('suban_theme_mode', 'dark');
        const el = Array.from(document.querySelectorAll('h2')).find(h => h.innerText.includes('Curated Collections'));
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  const collectionsHomeDark = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${outDir}/home-curated-collections-dark-fixed.png`, Buffer.from(collectionsHomeDark.data, 'base64'));
  console.log('Saved home-curated-collections-dark-fixed.png');

  // 5. Dark Mode Verification - Blog
  console.log('Navigating to /blog in Dark Mode...');
  await send('Page.navigate', { url: 'http://localhost:3000/blog' });
  await new Promise(r => setTimeout(r, 2000));
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        localStorage.setItem('suban_theme_mode', 'dark');
        window.scrollTo(0, 360);
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  const blogDark = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${outDir}/blog-narrative-dark-fixed.png`, Buffer.from(blogDark.data, 'base64'));
  console.log('Saved blog-narrative-dark-fixed.png');

  ws.close();
  console.log('All verification captures completed successfully!');
}

main().catch(console.error);
