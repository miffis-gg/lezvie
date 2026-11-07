import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

await fs.mkdir('.impeccable/review', { recursive: true });
await fs.mkdir('test-results', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
});
const page = await context.newPage();
const errors = [];
const requests = [];
const reports = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('request', (r) => requests.push({ url: r.url(), method: r.method() }));
const url = process.env.QA_URL || 'http://127.0.0.1:5173/';
await page.goto(url);
await page.evaluate(() => document.fonts.ready);
await page.locator('h1').waitFor();
for (const width of [390, 768, 1280, 1440]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.evaluate(async () => {
    for (const img of document.images) {
      img.loading = 'eager';
    }
    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
    window.scrollTo(0, 0);
  });
  const metrics = await page.evaluate(() => ({
    viewport: innerWidth,
    pageWidth: document.documentElement.scrollWidth,
    h1s: document.querySelectorAll('h1').length,
    brokenImages: [...document.images]
      .filter((i) => !i.complete || !i.naturalWidth)
      .map((i) => i.src),
    fonts:
      document.fonts.check('700 32px "Roboto Condensed"') &&
      document.fonts.check('400 16px "Golos Text"'),
  }));
  assert.equal(metrics.pageWidth, width, `horizontal overflow at ${width}`);
  assert.equal(metrics.h1s, 1);
  assert.equal(metrics.brokenImages.length, 0);
  assert.equal(metrics.fonts, true);
  await page.screenshot({
    path: `.impeccable/review/${width === 1440 ? 'desktop' : width === 390 ? 'mobile' : width}.png`,
    fullPage: true,
  });
  await page.screenshot({ path: `.impeccable/review/hero-${width}.png` });
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  reports.push({
    width,
    metrics,
    violations: axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      help: v.help,
    })),
  });
}
await fs.writeFile('test-results/accessibility.json', JSON.stringify(reports, null, 2));
await page.setViewportSize({ width: 1440, height: 1000 });
const services = page.locator('#services');
for (const filter of ['Стрижки', 'Борода', 'Комплексы', 'Детям', 'Уход', 'Все']) {
  await services.getByRole('button', { name: filter, exact: true }).click();
  assert.ok((await services.locator('article').count()) > 0);
}
assert.equal(await services.locator('article').count(), 8);
for (const [name, price, duration, count] of [
  ['Мужская стрижка', '2 200 ₽', 60, 4],
  ['Стрижка + борода', '3 200 ₽', 90, 2],
  ['Оформление бороды', '1 500 ₽', 45, 2],
  ['Детская стрижка', '1 700 ₽', 45, 1],
  ['Стрижка на длинные волосы', '2 600 ₽', 75, 1],
  ['Стрижка машинкой', '1 300 ₽', 30, 2],
  ['Камуфляж седины', '1 800 ₽', 45, 2],
  ['Уход за кожей головы', '1 200 ₽', 30, 1],
]) {
  await services.getByRole('button', { name: `Выбрать: ${name}`, exact: true }).click();
  const summary = page.locator('#booking aside');
  await expect(summary.getByText(name, { exact: true })).toBeVisible();
  await expect(summary.getByText(price, { exact: true })).toBeVisible();
  await expect(summary.getByText(`${duration} мин`, { exact: true })).toBeVisible();
  assert.equal(await page.locator('#booking input[name=master]').count(), count);
}
// Return to initial empty state for required-field validation below.
await page.reload();
await page.locator('h1').waitFor();
const works = page.locator('#works');
for (const filter of ['Короткие стрижки', 'Средняя длина', 'Борода', 'Комплексы', 'Все']) {
  await works.getByRole('button', { name: filter, exact: true }).click();
  assert.ok((await works.locator('figure').count()) > 0);
}
await works.getByRole('button', { name: 'Увеличить: Чистый переход' }).click();
await page.getByRole('dialog').waitFor();
await page.getByRole('button', { name: 'Следующая работа' }).click();
await page.keyboard.press('Escape');
assert.equal(await page.getByRole('dialog').count(), 0);
assert.equal(
  await works
    .getByRole('button', { name: 'Увеличить: Чистый переход' })
    .evaluate((e) => e === document.activeElement),
  true,
);
const faq = page.locator('#faq');
await faq.getByRole('button').nth(0).click();
await faq.getByRole('button').nth(1).click();
assert.equal(await faq.locator('button[aria-expanded=true]').count(), 2);
await page.locator('#contacts').getByRole('button', { name: 'Построить маршрут' }).click();
await page.getByText('Недоступно в концептуальном проекте. Это вымышленный адрес.').waitFor();

const booking = page.locator('#booking');
await booking.getByRole('button', { name: 'Выбрать мастера', exact: true }).click();
await booking.getByRole('alert').waitFor();
await services.getByRole('button', { name: 'Выбрать: Детская стрижка', exact: true }).click();
assert.equal(await booking.locator('input[name=master]').count(), 1);
await booking.getByRole('radio', { name: /Никита Лебедев/ }).check();
await booking.getByRole('button', { name: 'Выбрать время', exact: true }).click();
await booking.locator('input[name=day]').last().check();
await booking.getByText(/На этот день нет демонстрационных слотов/).waitFor();
await booking.locator('input[name=day]').first().check();
assert.ok((await booking.locator('input[name=time]:disabled').count()) > 0);
await booking.locator('input[name=time]:not(:disabled)').first().check();
await booking.getByRole('button', { name: 'Указать контакты', exact: true }).click();
await booking.getByRole('button', { name: 'Показать подтверждение', exact: true }).click();
await expect(page.locator('#contact-name')).toBeFocused();
assert.equal(await booking.locator('[aria-invalid=true]').count(), 3);
await page.locator('#contact-name').fill('А');
await page.locator('#contact-phone').fill('123');
await page.locator('#contact-comment').fill('а'.repeat(501));
await booking.getByRole('button', { name: 'Показать подтверждение', exact: true }).click();
assert.equal(await booking.locator('[aria-invalid=true]').count(), 4);
await page.locator('#contact-name').fill('А'.repeat(61));
await page.locator('#contact-phone').fill('1'.repeat(16));
await booking.getByRole('button', { name: 'Показать подтверждение', exact: true }).click();
assert.equal(await booking.locator('[aria-invalid=true]').count(), 4);
await page.screenshot({ path: '.impeccable/review/form-errors.png' });
await page.locator('#contact-name').fill('Иван');
await page.locator('#contact-phone').fill('+7 (999) 123-45-67');
await page.locator('#contact-comment').fill('Учебный тест');
await page.locator('#contact-consent').check();
const before = requests.length;
const started = Date.now();
await booking.getByRole('button', { name: 'Показать подтверждение', exact: true }).click();
assert.equal(await booking.getByRole('button', { name: 'Обработка…' }).isDisabled(), true);
await booking.getByRole('heading', { name: 'Демонстрационная запись собрана' }).waitFor();
assert.ok(Date.now() - started >= 600);
await expect(
  booking.getByRole('heading', { name: 'Демонстрационная запись собрана' }),
).toBeFocused();
await expect
  .poll(() =>
    booking
      .getByRole('heading', { name: 'Демонстрационная запись собрана' })
      .evaluate((e) => Math.round(e.getBoundingClientRect().top)),
  )
  .toBeGreaterThanOrEqual(88);
assert.equal(requests.slice(before).filter((v) => v.method !== 'GET').length, 0);
assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
assert.equal((await context.cookies()).length, 0);
await page.screenshot({ path: '.impeccable/review/success.png' });
await booking.getByRole('button', { name: 'Записаться ещё раз' }).click();
assert.equal(await booking.locator('input[name=service]:checked').count(), 0);
await booking.getByRole('radio', { name: /Оформление бороды/ }).check();
await booking.getByRole('button', { name: 'Выбрать мастера', exact: true }).click();
assert.equal(await booking.locator('input[name=master]').count(), 2);
await page
  .locator('#masters article')
  .last()
  .getByRole('button', { name: 'Выбрать мастера' })
  .click();
await page.getByRole('heading', { name: 'Выберите услугу мастера' }).waitFor();
await page
  .getByRole('dialog')
  .getByRole('button', { name: /Детская стрижка/ })
  .click();
await booking.getByRole('heading', { name: 'Когда вам удобно?' }).waitFor();
await page
  .locator('#packages article')
  .nth(1)
  .getByRole('button', { name: 'Выбрать пакет' })
  .click();
await booking.getByText('3 900 ₽', { exact: true }).first().waitFor();
await booking
  .getByRole('button', { name: /1Услуга|Услуга/ })
  .first()
  .click();
await booking.getByRole('radio', { name: /Мужская стрижка/ }).check();
await booking.getByRole('button', { name: 'Выбрать мастера', exact: true }).click();
await booking.getByRole('button', { name: 'Подобрать любого доступного мастера' }).click();
await booking.getByRole('button', { name: 'Выбрать время', exact: true }).click();
assert.equal(await booking.locator('input[name=time]:checked').count(), 1);

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(url);
await page.evaluate(() => document.fonts.ready);
const menu = page.getByRole('button', { name: 'Открыть меню' });
await menu.click();
await page.getByRole('dialog').waitFor();
for (let i = 0; i < 12; i++) {
  await page.keyboard.press('Tab');
  assert.equal(
    await page.getByRole('dialog').evaluate((e) => e.contains(document.activeElement)),
    true,
  );
}
await page.keyboard.press('Escape');
assert.equal(await menu.evaluate((e) => e === document.activeElement), true);
await menu.click();
await page
  .getByRole('navigation', { name: 'Мобильная навигация' })
  .getByRole('link', { name: 'Услуги', exact: true })
  .click();
assert.equal(await page.getByRole('dialog').count(), 0);
await page.locator('#services').evaluate((e) => window.scrollTo(0, e.offsetTop + 160));
await page.waitForTimeout(150);
assert.equal(await page.locator('[class*=mobileBar]').count(), 1);
await booking.scrollIntoViewIfNeeded();
await page.waitForTimeout(150);
assert.equal(await page.locator('[class*=mobileBar]').count(), 0);
await page.locator('#footer').scrollIntoViewIfNeeded();
await page.waitForTimeout(150);
assert.equal(await page.locator('[class*=mobileBar]').count(), 0);
// Drive the mobile wizard with keyboard activation and native radio arrow keys.
await page
  .locator('#services')
  .getByRole('button', { name: 'Выбрать: Мужская стрижка', exact: true })
  .click();
await booking.scrollIntoViewIfNeeded();
await page.screenshot({ path: '.impeccable/review/mobile-master.png' });
await booking.locator('input[name=master]').first().focus();
await page.keyboard.press('Space');
await page.keyboard.press('ArrowDown');
await booking.getByRole('button', { name: 'Выбрать время', exact: true }).focus();
await page.keyboard.press('Enter');
await booking.locator('input[name=time]:not(:disabled)').first().focus();
await page.keyboard.press('Space');
await booking.scrollIntoViewIfNeeded();
await page.screenshot({ path: '.impeccable/review/mobile-time.png' });
await booking.getByRole('button', { name: 'Указать контакты', exact: true }).click();
await booking.getByRole('button', { name: 'Показать подтверждение', exact: true }).click();
await expect(page.locator('#contact-name')).toBeFocused();
await page.screenshot({ path: '.impeccable/review/mobile-errors.png' });
const contactAxe = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
  .analyze();
reports.push({
  state: 'mobile contact errors',
  violations: contactAxe.violations.map((v) => ({
    id: v.id,
    help: v.help,
    nodes: v.nodes.map((n) => n.target),
  })),
});
await page.locator('#contact-name').fill('Иван');
await page.keyboard.press('Tab');
await page.keyboard.type('+7 999 123 45 67');
await page.keyboard.press('Tab');
await page.keyboard.type('Демозапись с клавиатуры');
await page.keyboard.press('Tab');
await page.keyboard.press('Space');
await booking.getByRole('button', { name: 'Показать подтверждение', exact: true }).focus();
await page.keyboard.press('Enter');
await booking.getByRole('heading', { name: 'Демонстрационная запись собрана' }).waitFor();
await expect
  .poll(() =>
    booking
      .getByRole('heading', { name: 'Демонстрационная запись собрана' })
      .evaluate((e) => Math.round(e.getBoundingClientRect().top)),
  )
  .toBeGreaterThanOrEqual(68);
await page.screenshot({ path: '.impeccable/review/mobile-success.png' });
await booking.getByRole('button', { name: 'Записаться ещё раз' }).click();
await page.setViewportSize({ width: 720, height: 500 });
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), true);
await page.reload();
assert.equal(await booking.locator('input[name=service]:checked').count(), 0);
assert.equal(
  requests.filter(
    (r) => !r.url.startsWith(url) && !r.url.startsWith('ws:') && !r.url.startsWith('data:'),
  ).length,
  0,
);
assert.equal(errors.length, 0, `Browser console errors: ${errors.join('; ')}`);
await fs.writeFile(
  'test-results/browser-qa.json',
  JSON.stringify(
    { reports, errors, requests: requests.length, scenario: 'all assertions passed' },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    viewports: reports.map((v) => ({
      width: v.width,
      overflow: false,
      axeViolations: v.violations.length,
    })),
    errors,
    scenario: 'PASS',
  }),
);
await browser.close();
