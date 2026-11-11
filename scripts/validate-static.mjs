import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.cwd(), 'dist');
const index = resolve(root, 'index.html');
await access(index);
const html = await readFile(index, 'utf8');
if (!/<html[\s>]/i.test(html) || !/<\/html>/i.test(html)) {
  throw new Error(`${index} is not a complete HTML document`);
}
console.log(`Validated ${index}`);
