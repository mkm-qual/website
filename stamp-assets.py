#!/usr/bin/env python3
"""Stamp shared CSS/JS links with a short content hash so browsers fetch new copies after every change.
Run before committing: python3 stamp-assets.py"""
import hashlib, re, glob
assets = {'assets/css/site.css': None, 'assets/js/site.js': None}
for path in assets:
    assets[path] = hashlib.sha1(open(path, 'rb').read()).hexdigest()[:8]
for page in sorted(glob.glob('*.html')):
    s = open(page).read()
    new = s
    for path, h in assets.items():
        new = re.sub(re.escape(path) + r'(\?v=[0-9a-f]+)?"', f'{path}?v={h}"', new)
    if new != s:
        open(page, 'w').write(new)
        print('stamped', page)
print({p: h for p, h in assets.items()})
