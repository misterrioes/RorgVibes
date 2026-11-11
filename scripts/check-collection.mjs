import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const pages = [
  ['overview', '/', ['/murmel/', '/twos-complement/', '/minifloat/', '/logic/']],
  ['murmel-systeme', '/murmel/', ['/logic/', '/', '/twos-complement/']],
  ['twos-complement-ring', '/twos-complement/', ['/murmel/', '/', '/minifloat/']],
  ['minifloat-labor', '/minifloat/', ['/twos-complement/', '/', '/logic/']],
];

for (const [directory, route, links] of pages) {
  const html = await readFile(resolve(directory, 'dist', 'index.html'), 'utf8');
  for (const link of links) {
    if (!html.includes(`href="${link}"`)) throw new Error(`${route} is missing ${link}`);
  }
}

const logic = await readFile(resolve('dnf-knf-labor', 'src', 'App.tsx'), 'utf8');
for (const link of ['/minifloat/', '/', '/murmel/']) {
  if (!logic.includes(`href="${link}"`)) throw new Error(`/logic/ is missing ${link}`);
}
console.log('Collection navigation is complete.');
