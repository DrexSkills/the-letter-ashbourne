#!/usr/bin/env python3
"""Bundle the game into ONE self-contained HTML file: dist/the-letter.html

You don't need this to run the game — just open index.html (or the GitHub Pages site).
Use it when you want a single file to share, e.g. to send someone or play offline.

    python3 build.py
"""
import re, os
ROOT = os.path.dirname(os.path.abspath(__file__))
html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
css = open(os.path.join(ROOT, 'css', 'style.css'), encoding='utf-8').read()
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '</style>')
def inline(m):
    code = open(os.path.join(ROOT, m.group(1)), encoding='utf-8').read()
    return '<script>\n' + code.replace('</script>', '<\\/script>') + '</script>'
html = re.sub(r'<script src="(js/[^"]+)"></script>', inline, html)
os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
out = os.path.join(ROOT, 'dist', 'the-letter.html')
open(out, 'w', encoding='utf-8').write(html)
print('Built', out, f'({len(html)//1024} KB)')
