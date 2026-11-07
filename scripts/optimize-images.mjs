import fs from 'node:fs/promises';
import sharp from 'sharp';
const sources = JSON.parse(await fs.readFile('tmp/image-sources.json', 'utf8'));
await fs.mkdir('public/images', { recursive: true });
for (const { id, path } of sources) {
  const wide = ['hero', 'interior'].includes(id);
  const width = wide ? 1440 : id.startsWith('work') ? 900 : 600;
  await sharp(path)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(`public/images/${id}.webp`);
  await sharp(path)
    .resize({ width: 480, withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toFile(`public/images/${id}-480.webp`);
  console.log(`${id}: optimized`);
}
