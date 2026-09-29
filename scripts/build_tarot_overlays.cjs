// Compose fixed art for each scene. Cards, words and hit areas stay in Vue.
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const { pathToFileURL } = require('url')
let chromium
try { ({ chromium } = require('playwright')) }
catch { ({ chromium } = require('C:/Users/aa404/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')) }
const root = path.resolve(__dirname, '..')
const source = path.resolve(root, '..', '定稿', '抽塔罗-分层素材')
const layout = JSON.parse(fs.readFileSync(path.join(source, 'layout.json'), 'utf8'))
const output = path.join(root, 'src', 'static', 'tarot')
const pngDir = path.join(root, 'qa', 'tarot-overlays')
fs.mkdirSync(pngDir, { recursive: true })
const stages = ['01-entry','02-selection','03-reveal-loading','04-context-choice','05-reading','06-follow-up']
const stageNames = ['entry','selection','loading','context','reading','followup']
const dynamicIds = /^(back-\d|selected-back|card-\d|card-fan)$/
const compiled = {}
function encodedAsset(relative) {
  let bytes = fs.readFileSync(path.join(source, relative))
  if (relative.endsWith('/crescent-moon.svg')) {
    const fixed = bytes.toString('utf8').replace('filter="url(#glow)"/>', 'filter="url(#glow)" mask="url(#cut)"/>')
    bytes = Buffer.from(fixed)
  }
  const mime = relative.endsWith('.svg') ? 'image/svg+xml' : 'image/png'
  return 'data:' + mime + ';base64,' + bytes.toString('base64')
}
;(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
  try {
    const page = await browser.newPage({ viewport: { width: 941, height: 1672 }, deviceScaleFactor: 1 })
    for (const [theme, screens] of Object.entries(layout.screens)) {
      compiled[theme] = {}
      for (let index = 0; index < stages.length; index++) {
        const stage = stages[index], layers = screens[stage].layers
        compiled[theme][stageNames[index]] = Object.fromEntries(layers.map(item => [item.id, item.rect]))
        const images = layers.filter(item => item.type === 'image' && (
          item.asset.startsWith('assets/ui/') || item.id === 'deck' || item.id === 'guide-large' || item.id.startsWith('avatar-')
        ) && !dynamicIds.test(item.id))
        // Both empty slots are always part of the fixed selection surface; picked cards cover them.
        if (stage === '02-selection') {
          const slot = layers.find(item => item.id === 'empty-slot-1')
          if (slot) images.push({ ...slot, id: 'empty-slot-0', rect: [62, 945, 248, 370] })
        }
        let content = images.sort((a,b) => a.z-b.z).map(item => {
          const [x,y,w,h] = item.rect
          return `<img src="${encodedAsset(item.asset)}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;z-index:${item.z}">`
        }).join('')
        if (theme === 'career') content += '<div style="position:absolute;left:140px;top:105px;width:122px;height:159px;display:flex;align-items:center;justify-content:center;text-align:center;white-space:pre-line;color:#684621;font:18px/1.6 serif;transform:rotate(-4deg)">写好一件事\n再做下一件\n路会渐明</div>'
        await page.setContent(`<html><head><style>*{box-sizing:border-box}html,body{margin:0;width:941px;height:1672px;background:transparent;overflow:hidden}img{position:absolute;object-fit:fill}</style></head><body>${content}</body></html>`)
        await page.locator('img').last().waitFor()
        const png = path.join(pngDir, theme + '-' + stageNames[index] + '.png')
        await page.screenshot({ path: png, omitBackground: true })
      }
    }
  } finally { await browser.close() }
  fs.writeFileSync(path.join(root, 'src', 'subpages', 'tarot', 'flow-layout.json'), JSON.stringify(compiled))
  const py = 'C:/Users/aa404/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
  execFileSync(py, ['-c', `from PIL import Image
from pathlib import Path
src=Path(r'${pngDir.replace(/\\/g,'\\\\')}')
dst=Path(r'${output.replace(/\\/g,'\\\\')}')
for p in src.glob('*.png'):
 im=Image.open(p).convert('RGBA').resize((750,1333),Image.Resampling.LANCZOS)
 im.save(dst/(p.stem+'-overlay.webp'),'WEBP',quality=78,method=6)
print(sum(p.stat().st_size for p in dst.glob('*-overlay.webp')))`], { stdio: 'inherit' })
  for (const file of fs.readdirSync(pngDir)) {
    if (file.endsWith('.png')) fs.unlinkSync(path.join(pngDir, file))
  }
})().catch(error => { console.error(error); process.exit(1) })
