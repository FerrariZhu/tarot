"""Rebuild only production art, inspect every source PNG, and report byte savings."""
from __future__ import annotations

import json
import math
from pathlib import Path
from PIL import Image, ImageDraw

APP = Path(__file__).resolve().parents[1]
SOURCE = APP.parent
ART = SOURCE / '定稿' / '生成素材'
CUT = SOURCE / '定稿' / '切图'
CARD = SOURCE / 'assets' / 'cards'
MANIFEST = json.loads((ART / 'manifest.json').read_text(encoding='utf-8'))

HOME = {'background/home.png', 'home/brand.png', *(f'home/{x}-art.png' for x in ('love', 'career', 'wealth')),
        *(f'icons/nav-{x}-{state}.png' for x in ('home', 'record', 'profile') for state in ('active', 'idle')),
        *(f'icons/arrow-{x}.png' for x in ('love', 'career', 'wealth'))}
THEME = {*(f'background/{x}.png' for x in ('love', 'career', 'wealth')),
         *(f'tools/{x}-{kind}.png' for x in ('love', 'career', 'wealth') for kind in ('tarot', 'divination')),
         *(f'panels/{x}-{kind}.png' for x in ('love', 'career', 'wealth') for kind in ('info', 'checkin')),
         *(f'icons/{name}.png' for name in ('tarot', 'bagua', 'love-checkin-rose',
                                          'career-checkin-star', 'wealth-checkin-coin'))}
INFO_CROPS = {
    'career-info-reference.png': (0, 2, 857, 251),
    'wealth-info-reference.png': (0, 9, 857, 263),
}

def config(path: str):
    group = path.split('/')[0]
    if path == 'background/home.png': return (941, 1672), 100
    if path in {f'panels/{key}-info.png' for key in ('love', 'career', 'wealth')}:
        return (857, 263), 100
    if group == 'background': return (941, 1672), 76
    if group == 'home': return ((720, 260), 86) if 'brand' in path else ((600, 840), 78)
    if group == 'tools': return (840, 440), 76
    if group == 'panels': return ((920, 300), 78) if 'info' in path else ((400, 200), 78)
    if 'nav-' in path: return (104, 104), 84
    if 'checkin-' in path: return (110, 110), 84
    return (130, 130), 84

def convert(source: Path, target: Path, bounds: tuple[int, int], quality: int):
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image.load()  # detects corrupt or truncated input
        image = image.convert('RGBA' if 'A' in image.getbands() else 'RGB')
        original = image.size
        if source.name in INFO_CROPS:
            image = image.crop(INFO_CROPS[source.name])
        image.thumbnail(bounds, Image.Resampling.LANCZOS)
        image.save(target, 'WEBP', quality=quality, method=6)
        with Image.open(target) as check:
            check.verify()
    return original, target.stat().st_size

def recolor_arrow(source: Path, target: Path, theme: str):
    # The approved icons have the correct rim and chevron; only their shared
    # navy interior conflicts with the three theme colors in the home mockup.
    colors = {'love': (163, 55, 75), 'career': (25, 83, 162), 'wealth': (184, 113, 39)}
    with Image.open(source) as original:
        original.load()
        source_size = original.size
        icon = original.convert('RGBA')
        icon.thumbnail((96, 96), Image.Resampling.LANCZOS)
    width, height = icon.size
    cx, cy = (width - 1) / 2, (height - 1) / 2
    radius_scale = min(width, height) / 2
    base = icon.getpixel((width // 2, height // 2))
    target_color = colors[theme]
    pixels = icon.load()
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if alpha == 0 or min(red, green, blue) > 175:
                continue  # transparent edge and white chevron
            distance = math.hypot(x - cx, y - cy) / radius_scale
            strength = max(0.0, min(1.0, (0.89 - distance) / 0.07))
            if strength == 0:
                continue
            adjusted = tuple(max(0, min(255, round(target_color[i] + (channel - base[i]) * 0.45)))
                             for i, channel in enumerate((red, green, blue)))
            pixels[x, y] = tuple(round(old * (1 - strength) + new * strength)
                                 for old, new in zip((red, green, blue), adjusted)) + (alpha,)
    target.parent.mkdir(parents=True, exist_ok=True)
    icon.save(target, 'WEBP', quality=78, method=6)
    with Image.open(target) as check:
        check.verify()
    return source_size, target.stat().st_size

rows = []
for entry in MANIFEST['assets']:
    rel = entry['path']
    src = ART / rel
    if rel in HOME:
        dst = APP / 'src/static/ui' / Path(rel).with_suffix('.webp')
        selected = True
    elif rel in THEME:
        dst = APP / 'src/subpages/theme/static/ui' / Path(rel).with_suffix('.webp')
        selected = True
    else:
        dst = None
        selected = False
    if not src.exists(): raise FileNotFoundError(src)
    with Image.open(src) as check:
        actual_size = list(check.size)
        actual_alpha = 'A' in check.getbands() or 'transparency' in check.info
        if actual_size != entry['sizePx'] or actual_alpha != entry['hasTransparency']:
            raise ValueError(f'Manifest mismatch: {rel}, {actual_size}, alpha={actual_alpha}')
        check.verify()
    dimensions = None
    output_bytes = 0
    if rel == 'background/home.png':
        production_src = ART / 'background/home-no-bubble.png'
    elif rel in {f'panels/{key}-info.png' for key in ('love', 'career', 'wealth')}:
        production_src = CUT / f'{Path(rel).stem}-reference.png'
    else:
        production_src = src
    if selected:
        if rel.startswith('icons/arrow-'):
            dimensions, output_bytes = recolor_arrow(src, dst, Path(rel).stem.split('-')[1])
        else:
            dimensions, output_bytes = convert(production_src, dst, *config(rel))
    rows.append({'source': rel, 'selected': selected, 'sourceBytes': src.stat().st_size,
                 'productionSource': str(production_src.relative_to(SOURCE)).replace('\\', '/') if production_src != src else rel,
                 'output': str(dst.relative_to(APP)).replace('\\', '/') if dst else None,
                 'outputBytes': output_bytes, 'sourceSizePx': entry['sizePx'], 'checked': True})

for src in sorted(CARD.glob('*.png')):
    dst = APP / 'src/subpages/tarot/static/cards' / f'{src.stem}.webp'
    bounds, quality = ((220, 366), 55) if src.stem.startswith('back') else ((220, 366), 43)
    original, size = convert(src, dst, bounds, quality)
    rows.append({'source': f'cards/{src.name}', 'selected': True, 'sourceBytes': src.stat().st_size,
                 'output': str(dst.relative_to(APP)).replace('\\', '/'), 'outputBytes': size,
                 'sourceSizePx': list(original), 'checked': True})

expected = {APP / row['output'] for row in rows if row['output']}
for generated_root in (APP / 'src/static/ui', APP / 'src/subpages/theme/static/ui', APP / 'src/subpages/tarot/static/cards'):
    for path in generated_root.rglob('*.webp'):
        if path not in expected:
            path.unlink()

report = APP / 'asset-audit.json'
report.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
for title, subset in [('ui', [x for x in rows if x['selected'] and not x['source'].startswith('cards/')]),
                      ('cards', [x for x in rows if x['source'].startswith('cards/')])]:
    cols, width, height = (4, 220, 190) if title == 'ui' else (10, 100, 145)
    sheet = Image.new('RGB', (cols * width, ((len(subset) + cols - 1) // cols) * height), '#142949')
    draw = ImageDraw.Draw(sheet)
    for i, row in enumerate(subset):
        x, y = (i % cols) * width, (i // cols) * height
        with Image.open(APP / row['output']) as asset:
            thumb = asset.convert('RGBA')
            thumb.thumbnail((width - 12, height - 30), Image.Resampling.LANCZOS)
            sheet.paste(thumb, (x + (width - thumb.width) // 2, y + 3), thumb)
        draw.text((x + 5, y + height - 22), row['source'].split('/')[-1][:27], fill='white')
    contact_dir = APP / 'qa'
    contact_dir.mkdir(exist_ok=True)
    sheet.save(contact_dir / f'asset-contact-{title}.webp', 'WEBP', quality=82)
for label, selection in [('home', HOME), ('theme', THEME)]:
    subset = [x for x in rows if x['source'] in selection]
    print(label, len(subset), sum(x['sourceBytes'] for x in subset), '->', sum(x['outputBytes'] for x in subset))
subset = [x for x in rows if x['source'].startswith('cards/')]
print('cards', len(subset), sum(x['sourceBytes'] for x in subset), '->', sum(x['outputBytes'] for x in subset))
print('audited', len(rows), 'selected', sum(x['selected'] for x in rows))
