async function main() {
  const listRes = await fetch('http://localhost:9222/json/list');
  const pages = await listRes.json();
  const page = pages.find(p => p.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    const handler = (msg) => {
      const res = JSON.parse(msg.data);
      if (res.id === curId) {
        ws.removeEventListener('message', handler);
        resolve(res.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.onopen = r);
  await send('Page.navigate', { url: 'http://localhost:3000/gallery/greater-one-horned-rhino-nepal' });
  await new Promise(r => setTimeout(r, 2000));

  await send('Runtime.evaluate', {
    expression: `
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('suban_theme_mode', 'light');
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const fs = await import('fs');
  // Shot 1: Top section (canvas, breadcrumb, purchase card)
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
  await new Promise(r => setTimeout(r, 600));
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/somth/.gemini/antigravity-ide/brain/fd56eb28-ad0b-488e-ac90-e12ca2034806/rhino-detail-light-top.png', Buffer.from(shot1.data, 'base64'));

  // Shot 2: EXIF & Middle
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 750)' });
  await new Promise(r => setTimeout(r, 600));
  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/somth/.gemini/antigravity-ide/brain/fd56eb28-ad0b-488e-ac90-e12ca2034806/rhino-detail-light-mid.png', Buffer.from(shot2.data, 'base64'));

  // Shot 3: Story & Related photos
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 1500)' });
  await new Promise(r => setTimeout(r, 600));
  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/somth/.gemini/antigravity-ide/brain/fd56eb28-ad0b-488e-ac90-e12ca2034806/rhino-detail-light-bottom.png', Buffer.from(shot3.data, 'base64'));

  console.log('Rhino detail screenshots captured successfully!');
  ws.close();
}

main().catch(console.error);
