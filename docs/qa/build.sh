#!/bin/sh
# Regenerates sections.css from the {% stylesheet %} blocks inside the dk-*
# sections, so the QA page shows exactly what the theme renders.
cd "$(dirname "$0")/../.." || exit 1
python3 - <<'PY'
import re, glob
out = []
for f in sorted(glob.glob('theme/sections/dk-*.liquid')):
    for m in re.findall(r'\{%\s*stylesheet\s*%\}(.*?)\{%\s*endstylesheet\s*%\}', open(f).read(), re.S):
        out.append('/* === %s === */' % f.split('/')[-1])
        out.append(m)
open('docs/qa/sections.css', 'w').write('\n'.join(out))
print('sections.css rebuilt from', len(out) // 2, 'sections')
PY
