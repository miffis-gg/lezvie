import fs from 'node:fs/promises';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
const chrome = await launch({
  chromePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
});
try {
  const result = await lighthouse(process.env.QA_URL || 'http://127.0.0.1:4173/lezvie/', {
    port: chrome.port,
    output: ['html', 'json'],
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });
  if (result.lhr.runtimeError) throw new Error(result.lhr.runtimeError.message);
  await fs.mkdir('test-results', { recursive: true });
  await fs.writeFile('test-results/lighthouse.html', result.report[0]);
  await fs.writeFile('test-results/lighthouse.json', result.report[1]);
  console.log(
    JSON.stringify({
      scores: Object.fromEntries(
        Object.entries(result.lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]),
      ),
      metrics: {
        LCP: result.lhr.audits['largest-contentful-paint'].displayValue,
        CLS: result.lhr.audits['cumulative-layout-shift'].displayValue,
      },
      failed: Object.values(result.lhr.audits)
        .filter((v) => v.score !== null && v.score < 1 && v.details?.type !== 'opportunity')
        .map((v) => ({ id: v.id, title: v.title, score: v.score, displayValue: v.displayValue })),
    }),
  );
} finally {
  await chrome.kill();
}
