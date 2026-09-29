"""Copy the existing tested reading rules into platform-independent ES modules."""
from pathlib import Path

root = Path(__file__).resolve().parents[2]
out = Path(__file__).resolve().parents[1] / 'src' / 'domain'
out.mkdir(parents=True, exist_ok=True)

replacements = {
    'tarot.js': [('module.exports = { cards, byId, major, suits, ranks };', 'export { cards, byId, major, suits, ranks };'),
                 ('/assets/cards/', '/subpages/tarot/static/cards/'), ('.png', '.webp')],
    'draw.js': [("const { cards } = require('./tarot');", "import { cards } from './tarot';"),
                ('module.exports = { shuffledDeck, threeCardReading, readingDeck };', 'export { shuffledDeck, threeCardReading, readingDeck };')],
    'iching.js': [('module.exports = { TRIGRAMS, lookupHexagram, fromTosses, cast };', 'export { TRIGRAMS, lookupHexagram, fromTosses, cast };')],
    'zhouyi-text.js': [('module.exports = ', 'export default ')],
    'reading.js': [("const zhouyiText = require('./zhouyi-text');", "import zhouyiText from './zhouyi-text';")],
}
for name, changes in replacements.items():
    source = (root / 'lib' / name).read_text(encoding='utf-8')
    for before, after in changes:
        if before not in source: raise ValueError(f'{name}: missing {before}')
        source = source.replace(before, after)
    if name == 'reading.js':
        source = source.split('// endpoint 指向自有后端。')[0]
        source += '\nexport { buildIChingPrompt, buildTarotPrompt, normalizeReading };\n'
    (out / name).write_text(source, encoding='utf-8')
    print('migrated', name)
