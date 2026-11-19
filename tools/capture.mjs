import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/hatch/skills/spaces/ts-runtime/dist/node_modules/playwright');
const path = require('node:path');

const browser = await chromium.launch({
  executablePath: '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell',
  headless: true,
  args: ['--allow-file-access-from-files', '--disable-web-security', '--no-sandbox', '--disable-crash-reporter', '--disable-crashpad', '--no-zygote', '--single-process'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const failures = [];
page.on('pageerror', error => failures.push(error.message));
page.on('console', message => { if (message.type() === 'error') failures.push(message.text()); });
const game = 'file://' + path.resolve('game/index.html');
await page.goto(game, { waitUntil: 'load' });
await page.waitForTimeout(700);
await page.keyboard.press('Enter');
await page.waitForTimeout(120);
await page.waitForTimeout(250);
await page.screenshot({ path: 'screenshots/1-city.jpg', type: 'jpeg', quality: 85 });
await page.keyboard.press('KeyE');
await page.waitForTimeout(200);
await page.keyboard.down('KeyW');
await page.waitForTimeout(950);
await page.keyboard.up('KeyW');
await page.screenshot({ path: 'screenshots/2-drive.jpg', type: 'jpeg', quality: 85 });
for (let i=0;i<4;i++) {
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(90);
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(100);
}
await page.waitForTimeout(500);
await page.screenshot({ path: 'screenshots/3-chase.jpg', type: 'jpeg', quality: 85 });
await page.keyboard.press('KeyF');
await page.waitForTimeout(220);
await page.keyboard.down('KeyW');
await page.waitForTimeout(600);
await page.keyboard.up('KeyW');
await page.screenshot({ path: 'screenshots/4-mission.jpg', type: 'jpeg', quality: 85 });
console.log(JSON.stringify({ errors: failures, title: await page.title(), image: await page.locator('canvas').evaluate(c => [c.width,c.height]) }));
await browser.close();
