// Copies the game into app/www for the Android app, with the fonts bundled
// inside so the app works fully offline (the website loads them from Google Fonts).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('..');
const WWW = path.resolve('www');
fs.rmSync(WWW, { recursive: true, force: true });
fs.mkdirSync(WWW, { recursive: true });

for (const item of ['index.html', 'css', 'js', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon-32.png']) {
  fs.cpSync(path.join(ROOT, item), path.join(WWW, item), { recursive: true });
}

// bundle the two pixel fonts
fs.mkdirSync(path.join(WWW, 'fonts'), { recursive: true });
const fonts = [
  ['@fontsource/jersey-10/files/jersey-10-latin-400-normal.woff2', 'jersey-10.woff2', 'Jersey 10'],
  ['@fontsource/vt323/files/vt323-latin-400-normal.woff2', 'vt323.woff2', 'VT323'],
];
let css = '/* Fonts bundled inside the app so it works offline. */\n';
for (const [src, dest, family] of fonts) {
  fs.copyFileSync(path.join('node_modules', src), path.join(WWW, 'fonts', dest));
  css += `@font-face { font-family: '${family}'; font-style: normal; font-weight: 400; font-display: swap; src: url('../fonts/${dest}') format('woff2'); }\n`;
}
fs.writeFileSync(path.join(WWW, 'css', 'fonts.css'), css);

// point the page at the bundled fonts instead of Google Fonts
let html = fs.readFileSync(path.join(WWW, 'index.html'), 'utf8');
html = html
  .replace(/<link rel="preconnect"[^>]*>\n?/g, '')
  .replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>\n?/g, '')
  .replace(/<link rel="manifest"[^>]*>\n?/, '')
  .replace('<link rel="stylesheet" href="css/style.css">', '<link rel="stylesheet" href="css/fonts.css">\n<link rel="stylesheet" href="css/style.css">');
if (html.includes('fonts.googleapis.com')) throw new Error('Google Fonts link still present');
fs.writeFileSync(path.join(WWW, 'index.html'), html);
console.log('www ready:', fs.readdirSync(WWW).join(', '));
