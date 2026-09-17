/* One-off screenshot at an arbitrary scroll offset.
   node scripts/shot.mjs <outName> <selector> [extraScrollPx] [width] */
import { chromium } from 'playwright';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';

const [, , name = 'shot', selector = 'body', extra = '0', width = '1440'] = process.argv;
const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(resolve(here, '..', '..'), '.design-audit', 'probe');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +width, height: 900 } });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3500);
await page.evaluate(
    ([sel, px]) => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' });
        window.scrollBy(0, px);
    },
    [selector, +extra]
);
await page.waitForTimeout(3000);
await page.screenshot({ path: join(outDir, `${name}.png`) });
await browser.close();
console.log(join(outDir, `${name}.png`));
