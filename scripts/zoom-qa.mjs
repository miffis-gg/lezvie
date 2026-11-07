import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
await fs.mkdir('tmp/zoom-profile-v2/Default', { recursive: true });
await fs.writeFile('tmp/zoom-profile-v2/Default/Preferences', JSON.stringify({
  partition: { default_zoom_level: { x: Math.log(2) / Math.log(1.2) } },
}));
const context = await chromium.launchPersistentContext('tmp/zoom-profile-v2', {
  channel: 'msedge', headless: true, viewport: null,
  args: ['--window-size=1440,1000'], reducedMotion: 'reduce',
});
try {
  const page = context.pages()[0];
  await page.goto(process.env.QA_URL || 'http://127.0.0.1:4173/lezvie/');
  await page.locator('h1').waitFor();
  await page.evaluate(() => document.fonts.ready);
  const metrics = await page.evaluate(() => ({
    innerWidth, outerWidth, devicePixelRatio, width: document.documentElement.scrollWidth,
    h1Width: document.querySelector('h1').getBoundingClientRect().width,
  }));
  const cdp = await context.newCDPSession(page);
  const capture = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await fs.writeFile('.impeccable/review/zoom-200.png', Buffer.from(capture.data, 'base64'));
  await fs.writeFile('test-results/zoom-200.json', JSON.stringify(metrics, null, 2));
  console.log(JSON.stringify(metrics));
  assert.ok(metrics.devicePixelRatio >= 1.99 && metrics.devicePixelRatio <= 2.01, 'Browser zoom must be 200%');
  assert.equal(metrics.width, metrics.innerWidth, 'No horizontal overflow at actual browser zoom');
} finally {
  await context.close();
}
