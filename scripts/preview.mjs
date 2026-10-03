#!/usr/bin/env node
/*
 * Local preview without installing Ruby/Jekyll.
 * Renders the Jekyll templates with LiquidJS into _preview/ and serves them.
 *
 *   npm install          (once)
 *   npm run preview      → http://localhost:4000/portfolio/
 *
 * GitHub Pages still builds the real site with Jekyll; this is only for checking changes locally.
 */
import { Liquid } from 'liquidjs';
import yaml from 'js-yaml';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_preview');
const PORT = Number(process.env.PORT) || 4000;

function readYaml(file) { return yaml.load(fs.readFileSync(file, 'utf8')) || {}; }

function splitFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  return m ? { data: yaml.load(m[1]) || {}, body: src.slice(m[0].length) } : { data: null, body: src };
}

function build() {
  const config = readYaml(path.join(ROOT, '_config.yml'));
  const baseurl = (config.baseurl || '').replace(/\/$/, '');
  const data = {};
  for (const f of fs.readdirSync(path.join(ROOT, '_data'))) {
    if (/\.ya?ml$/.test(f)) data[f.replace(/\.ya?ml$/, '')] = readYaml(path.join(ROOT, '_data', f));
  }
  const site = { ...config, data, time: new Date() };

  const liquid = new Liquid({
    root: [path.join(ROOT, '_includes')],
    layouts: path.join(ROOT, '_layouts'),
    extname: '',
    jekyllInclude: true,
    dynamicPartials: false,
    cache: false,
  });
  const relative = (v = '') => baseurl + ('/' + String(v)).replace(/\/{2,}/g, '/');
  liquid.registerFilter('relative_url', relative);
  liquid.registerFilter('absolute_url', (v) => (config.url || '') + relative(v));
  liquid.registerFilter('jsonify', (v) => JSON.stringify(v));

  const outBase = path.join(OUT, baseurl);
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(outBase, { recursive: true });

  const skip = new Set(['node_modules', '_preview', 'scripts', ...(config.exclude || [])]);
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = path.relative(ROOT, path.join(dir, entry.name));
      if (entry.name.startsWith('_') || entry.name.startsWith('.') || skip.has(rel)) continue;
      const src = path.join(ROOT, rel);
      const dest = path.join(outBase, rel);
      if (entry.isDirectory()) { walk(src); continue; }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const text = /\.(html|xml|txt|css|js)$/.test(entry.name) ? fs.readFileSync(src, 'utf8') : null;
      const fm = text && splitFrontMatter(text);
      if (fm && fm.data) {
        const page = { ...fm.data, url: '/' + rel.replace(/\\/g, '/') };
        let html = liquid.parseAndRenderSync(fm.body, { site, page });
        if (page.layout) {
          html = liquid.parseAndRenderSync(
            fs.readFileSync(path.join(ROOT, '_layouts', page.layout + '.html'), 'utf8'),
            { site, page, content: html }
          );
        }
        fs.writeFileSync(dest, html);
      } else {
        fs.copyFileSync(src, dest);
      }
    }
  };
  walk(ROOT);
  return baseurl;
}

const baseurl = build();
console.log('Built preview into _preview/');

if (!process.argv.includes('--build-only')) {
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.pdf': 'application/pdf', '.txt': 'text/plain', '.xml': 'application/xml' };
  http.createServer((req, res) => {
    if (req.url === '/' && baseurl) { res.writeHead(302, { Location: baseurl + '/' }); return res.end(); }
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    if (p.endsWith('.html')) {
      try { build(); } catch (err) { res.writeHead(500, { 'Content-Type': 'text/plain' }); return res.end(String(err)); }
    }
    const file = path.join(OUT, path.normalize(p));
    if (!file.startsWith(OUT) || !fs.existsSync(file)) {
      res.writeHead(404, { 'Content-Type': types['.html'] });
      const nf = path.join(OUT, baseurl, '404.html');
      return res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found');
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  }).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}${baseurl}/`));
}
