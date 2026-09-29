"""Check the built WeChat package limits and all referenced art outputs."""
from pathlib import Path

app = Path(__file__).resolve().parents[1]
root = app / 'dist/build/mp-weixin'
if not root.exists(): raise SystemExit('Build the WeChat target first: npm run build:mp-weixin')
packages = {
    'main': [p for p in root.rglob('*') if p.is_file() and 'subpages' not in p.relative_to(root).parts],
    **{name: [p for p in (root / 'subpages' / name).rglob('*') if p.is_file()]
       for name in ('theme', 'tarot', 'iching')}
}
limit = 2 * 1024 * 1024
for name, files in packages.items():
    size = sum(path.stat().st_size for path in files)
    print(f'{name}: {len(files)} files, {size:,} bytes ({size / 1024 / 1024:.2f} MiB)')
    if size > limit: raise SystemExit(f'{name} exceeds the 2 MiB package limit')
total = sum(sum(path.stat().st_size for path in files) for files in packages.values())
if total > 20 * 1024 * 1024: raise SystemExit('Total package exceeds 20 MiB')
cards = list((root / 'subpages/tarot/static/cards').glob('*.webp'))
if len(cards) != 82: raise SystemExit(f'Expected 82 tarot image assets, found {len(cards)}')
art = list((root / 'static/tarot').glob('*.webp'))
if len(art) != 21: raise SystemExit(f'Expected 21 optimized tarot scene assets, found {len(art)}')
if any(path.stat().st_size == 0 for path in art): raise SystemExit('Empty tarot scene asset')
print(f'total: {total:,} bytes; tarot assets: {len(cards)}; package check passed')
