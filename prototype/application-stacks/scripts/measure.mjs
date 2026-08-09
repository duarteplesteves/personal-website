import { gzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const stacks = [
  { name: 'Next.js + React', workspace: 'next-react', output: 'next-react/out' },
  { name: 'Next.js + constrained TSRX', workspace: 'next-tsrx', output: 'next-tsrx/out' },
  { name: 'Octane', workspace: 'octane', output: 'octane/dist' }
];

async function files(path) {
  const entries = await readdir(path, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(resolve(path, entry.name)) : [resolve(path, entry.name)]))).flat();
}

function sourcesFromHtml(html) {
  return [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1]);
}

const rows = [];
for (const stack of stacks) {
  const started = performance.now();
  const result = spawnSync('npm', ['run', 'build', '-w', stack.workspace], { cwd: root, encoding: 'utf8', stdio: 'pipe' });
  const seconds = (performance.now() - started) / 1000;
  if (result.status !== 0) {
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
  const output = resolve(root, stack.output);
  const all = await files(output);
  const js = all.filter((file) => extname(file) === '.js');
  const htmlFiles = all.filter((file) => extname(file) === '.html');
  const jsBuffers = await Promise.all(js.map((file) => readFile(file)));
  const libraryHtml = await readFile(resolve(output, 'en/library/index.html'), 'utf8');
  const initialPaths = sourcesFromHtml(libraryHtml).map((source) => resolve(output, source.replace(/^\//, '')));
  const initialBuffers = [];
  for (const path of [...new Set(initialPaths)]) {
    try { initialBuffers.push(await readFile(path)); } catch {}
  }
  rows.push({
    stack: stack.name,
    buildSeconds: Number(seconds.toFixed(2)),
    htmlRoutes: htmlFiles.length,
    totalJsRaw: jsBuffers.reduce((sum, value) => sum + value.byteLength, 0),
    totalJsGzip: jsBuffers.reduce((sum, value) => sum + gzipSync(value).byteLength, 0),
    libraryJsRaw: initialBuffers.reduce((sum, value) => sum + value.byteLength, 0),
    libraryJsGzip: initialBuffers.reduce((sum, value) => sum + gzipSync(value).byteLength, 0)
  });
}

const table = [
  '| Stack | Warm production build (s) | HTML files | Total JS raw / gzip | `/en/library/` JS raw / gzip |',
  '| --- | ---: | ---: | ---: | ---: |',
  ...rows.map((row) => `| ${row.stack} | ${row.buildSeconds.toFixed(2)} | ${row.htmlRoutes} | ${row.totalJsRaw} / ${row.totalJsGzip} B | ${row.libraryJsRaw} / ${row.libraryJsGzip} B |`)
].join('\n');
console.log(`\n${table}\n`);
await writeFile(resolve(root, 'measurements.json'), `${JSON.stringify(rows, null, 2)}\n`);
await writeFile(resolve(root, 'MEASUREMENTS.md'), `# Generated measurements\n\nMeasured locally with Node ${process.version} on ${new Date().toISOString()}. These are warm production builds with installed dependencies and prior build caches; each timing includes the stack's mandatory type check. Byte counts sum individually gzipped emitted JavaScript files.\n\n${table}\n`);
