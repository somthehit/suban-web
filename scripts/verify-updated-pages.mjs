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

  const artifactDir = 'C:/Users/somth/.gemini/antigravity-ide/brain/fd56eb28-ad0b-488e-ac90-e12ca2034806';

  async function setLightMode() {
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
          localStorage.setItem('suban_theme_mode', 'light');
        })()
      `
    });
    await new Promise(r => setTimeout(r, 600));
  }

  // Helper to capture
  async function capture(url, scrollY, filename, name) {
    try {
      console.log(`Navigating to ${url}...`);
      await send('Page.navigate', { url });
      await new Promise(r => setTimeout(r, 1500));
      await setLightMode();
      if (scrollY > 0) {
        await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${scrollY})` });
        await new Promise(r => setTimeout(r, 600));
      }
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(`${artifactDir}/${filename}`, Buffer.from(shot.data, 'base64'));
      console.log(`Captured ${name}: ${filename}`);
    } catch (e) {
      console.error(`Failed ${name}:`, e.message);
    }
  }

  // 1. Blog
  await capture('http://localhost:3000/blog', 3600, 'verify-blog-light.png', 'Blog (Dispatches & Newsletter)');

  // 2. About Manifesto
  await capture('http://localhost:3000/about', 400, 'verify-about-manifesto-light.png', 'About Manifesto');

  // 3. About Expeditions
  await capture('http://localhost:3000/about', 1200, 'verify-about-expeditions-light.png', 'About Expeditions');

  // 4. Gallery Detail (Hero & Radio)
  await capture('http://localhost:3000/gallery/greater-one-horned-rhino-nepal', 0, 'verify-gallery-detail-light-hero.png', 'Gallery Detail Hero');

  // 5. Gallery Detail (EXIF & Dossier)
  await capture('http://localhost:3000/gallery/greater-one-horned-rhino-nepal', 750, 'verify-gallery-detail-light-exif.png', 'Gallery Detail EXIF');

  // 6. Licensing Hero & Cards
  await capture('http://localhost:3000/licensing', 0, 'verify-licensing-light-hero.png', 'Licensing Hero');

  // 7. Licensing Matrix & Form
  await capture('http://localhost:3000/licensing', 1100, 'verify-licensing-light-matrix.png', 'Licensing Matrix');

  ws.close();
  console.log('All verification captures completed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
