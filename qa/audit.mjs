import { chromium } from 'playwright';
const base = 'http://localhost:4321';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let failures = 0;
const fail = (m) => { failures++; console.log('FAIL', m); };

// 1. overflow at every width
for (const w of [360, 390, 430, 768, 1024, 1280, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(base + '/', { waitUntil: 'load' });
  const r = await p.evaluate(() => ({ iw: window.innerWidth, sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth }));
  console.log(`width ${w}: innerWidth=${r.iw} scrollWidth=${r.sw}`);
  if (r.sw !== r.iw) fail(`overflow at ${w}`);
  await p.close();
}

// 2. mobile menu at 390
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(base + '/', { waitUntil: 'load' });
  const btn = p.locator('#menu-btn');
  const nav = p.locator('#mobile-nav');
  const box = await btn.boundingBox();
  console.log('menu button size', box.width, box.height);
  if (box.width < 44 || box.height < 44) fail('menu button under 44px');
  if (await nav.isVisible()) fail('nav visible before open');
  await btn.click();
  console.log('after click: expanded=', await btn.getAttribute('aria-expanded'), 'visible=', await nav.isVisible(), 'bodyOverflow=', await p.evaluate(() => getComputedStyle(document.body).overflow), 'focus=', await p.evaluate(() => document.activeElement.textContent.trim()));
  if (await btn.getAttribute('aria-expanded') !== 'true' || !(await nav.isVisible())) fail('menu did not open');
  if (await btn.getAttribute('aria-controls') !== 'mobile-nav') fail('aria-controls');
  const links = await nav.locator('a').allTextContents(); console.log('drawer links:', links.join(' | '));
  const sizes = await nav.locator('a').evaluateAll(els => els.map(e => e.getBoundingClientRect().height));
  if (sizes.some(h => h < 44)) fail('drawer link under 44px: ' + sizes);
  await p.keyboard.press('Escape');
  console.log('after Escape: expanded=', await btn.getAttribute('aria-expanded'), 'visible=', await nav.isVisible(), 'focus on button=', await p.evaluate(() => document.activeElement.id));
  if (await nav.isVisible()) fail('Escape did not close');
  await btn.click();
  await nav.locator('a[href="#process"]').click();
  await p.waitForTimeout(300);
  console.log('after link: visible=', await nav.isVisible(), 'bodyOverflow=', await p.evaluate(() => getComputedStyle(document.body).overflow), 'scrollY>0=', await p.evaluate(() => window.scrollY > 0));
  if (await nav.isVisible()) fail('link did not close menu');
  // keyboard: Tab from button opens via Enter
  await p.keyboard.press('Shift+Tab'); 
  await btn.focus(); await p.keyboard.press('Enter');
  console.log('Enter opens:', await nav.isVisible());
  await p.keyboard.press('Escape');
  await p.close();
}

// 3. link audit + heading hierarchy across pages
const pages = ['/', '/privacy', '/terms'];
const seen = new Map();
for (const path of pages) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const resp = await p.goto(base + path, { waitUntil: 'load' });
  if (!resp || resp.status() !== 200) fail(`${path} status ${resp && resp.status()}`);
  const info = await p.evaluate(() => ({
    hrefs: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
    ids: [...document.querySelectorAll('[id]')].map(e => e.id),
    heads: [...document.querySelectorAll('h1,h2,h3,h4')].map(h => h.tagName),
    title: document.title,
    desc: document.querySelector('meta[name=description]')?.content,
    canon: document.querySelector('link[rel=canonical]')?.href,
    ld: !!document.querySelector('script[type="application/ld+json"]'),
    og: document.querySelectorAll('meta[property^="og:"]').length,
    tw: document.querySelectorAll('meta[name^="twitter:"]').length,
    viewport: document.querySelector('meta[name=viewport]')?.content,
    iconBtns: [...document.querySelectorAll('button')].filter(b => !b.textContent.trim() && !b.getAttribute('aria-label')).length,
  }));
  seen.set(path, info);
  console.log(path, '|', info.title, '| canonical', info.canon, '| og', info.og, 'tw', info.tw, 'ld', info.ld, '| h1 count', info.heads.filter(h=>h==='H1').length);
  // heading order: no level skips
  let prev = 0; for (const h of info.heads) { const n = +h[1]; if (n > prev + 1) fail(`${path} heading skip ${prev}->${n}`); prev = n; }
  if (info.iconBtns) fail(`${path} unlabeled buttons`);
  await p.close();
}
for (const [path, info] of seen) {
  for (const h of info.hrefs) {
    if (h.startsWith('mailto:') || h.startsWith('http')) continue;
    let target = path, anchor = null;
    if (h.startsWith('#')) anchor = h.slice(1);
    else { const [pth, a] = h.split('#'); target = pth; anchor = a || null; }
    if (!seen.has(target)) { fail(`${path}: link ${h} → missing page ${target}`); continue; }
    if (anchor && !seen.get(target).ids.includes(anchor)) fail(`${path}: link ${h} → missing anchor`);
  }
}
for (const asset of ['/robots.txt', '/sitemap.xml', '/favicon.svg', '/og-image.png']) {
  const p = await b.newPage(); const r = await p.goto(base + asset); if (!r || r.status() !== 200) fail(asset); await p.close();
}
console.log(failures ? `${failures} FAILURE(S)` : 'ALL CHECKS PASSED');
await b.close();
