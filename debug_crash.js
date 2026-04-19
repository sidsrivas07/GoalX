import puppeteer from 'puppeteer';
import { exec } from 'child_process';

const run = async () => {
  // Start the preview server
  console.log('Starting vite preview...');
  const server = exec('npm run preview -- --port 4173', { cwd: process.cwd() });
  
  // Give it a second to start
  await new Promise(r => setTimeout(r, 2000));
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQ FAIL:', request.url(), request.failure()?.errorText));

  console.log('Navigating to http://localhost:4173 ...');
  try {
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0', timeout: 5000 });
  } catch (e) {
    console.error('Goto error:', e.message);
  }

  const content = await page.content();
  if (content.includes('id="root"')) {
    const rootHtml = await page.evaluate(() => document.getElementById('root').innerHTML);
    if (!rootHtml.trim()) {
      console.log('ROOT IS EMPTY. There is a react rendering crash above!');
    } else {
      console.log('ROOT HAS CONTENT:', rootHtml.substring(0, 100));
    }
  }

  await browser.close();
  server.kill();
  process.exit();
};

run().catch(console.error);
