"""Build the reusable tarot scenery from the approved layered artwork.

Only fixed scenery is flattened. Cards, people, text and controls remain live layers.
"""
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / '定稿' / '抽塔罗-分层素材'
TARGET = ROOT / 'src' / 'static' / 'tarot'
layout = json.loads((SOURCE / 'layout.json').read_text(encoding='utf-8'))
TARGET.mkdir(parents=True, exist_ok=True)
for theme in ('love', 'career', 'wealth'):
    layers = layout['screens'][theme]['01-entry']['layers']
    scene = Image.new('RGBA', (941, 1672))
    for layer in layers:
        asset = layer.get('asset', '')
        if not asset.startswith(('assets/backgrounds/', 'assets/props/')):
            continue
        x, y, width, height = layer['rect']
        with Image.open(SOURCE / asset) as original:
            picture = original.convert('RGBA').resize((width, height), Image.Resampling.LANCZOS)
            scene.alpha_composite(picture, (x, y)) if x >= 0 and y >= 0 else scene.paste(
                picture, (x, y), picture
            )
    scene = scene.convert('RGB').resize((750, 1333), Image.Resampling.LANCZOS)
    scene.save(TARGET / f'{theme}-scene.webp', 'WEBP', quality=69, method=6)
    for stale in ('deck', 'character'):
        (TARGET / f'{theme}-{stale}.webp').unlink(missing_ok=True)
    print(theme, (TARGET / f'{theme}-scene.webp').stat().st_size)
