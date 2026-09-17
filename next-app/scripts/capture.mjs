/* Design-audit screenshot capture.
   Usage: node scripts/capture.mjs <label>   e.g. `node scripts/capture.mjs before`
   Writes to ../.design-audit/<label>/<viewport>-<section>.png */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const label = process.argv[2] || 'before';
const base = process.env.BASE_URL || 'http://localhost:3000';
const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(resolve(here, '..', '..'), '.design-audit', label) + '\\';

const VIEWPORTS = [
    { name: '1440', width: 1440, height: 900 },
    { name: '768', width: 768, height: 1024 },
    { name: '390', width: 390, height: 844 },
];

// Anchors to scroll to. `null` = top of page.
const SHOTS = [
    ['hero', null],
    ['pillars', '#pillars'],
    ['services', '#services'],
    ['about', '#about'],
    ['methodology', '#methodology'],
    ['engagement', '#engagement'],
    ['scope', '#scope'],
    ['process', '#process'],
    ['why', '#why'],
    ['industries', '#industries'],
    ['contact', '#contact'],
];

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
    mkdirSync(`${outDir}`, { recursive: true });
    const page = await browser.newPage({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
    });

    await page.goto(base, { waitUntil: 'networkidle', timeout: 60000 });
    // Let fonts, WebGL and the GSAP entrance settle.
    await page.waitForTimeout(4000);

    for (const [name, anchor] of SHOTS) {
        if (anchor) {
            const found = await page.evaluate((sel) => {
                const el = document.querySelector(sel);
                if (!el) return false;
                el.scrollIntoView({ block: 'start', behavior: 'instant' });
                return true;
            }, anchor);
            if (!found) {
                console.log(`  skip ${vp.name}/${name} (no ${anchor})`);
                continue;
            }
        } else {
            await page.evaluate(() => window.scrollTo(0, 0));
        }
        // Scroll-linked reveals and pinned sections need a beat to catch up.
        await page.waitForTimeout(1800);
        await page.screenshot({ path: `${outDir}${vp.name}-${name}.png` });
        console.log(`  ${vp.name}/${name}`);
    }

    await page.close();
}

await browser.close();
console.log(`\ndone -> .design-audit/${label}/`);
