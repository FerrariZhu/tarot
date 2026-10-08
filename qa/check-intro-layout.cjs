const { chromium } = require('C:/Users/aa404/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const assert = require('node:assert/strict')
;(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
  try {
    for (const [width, height] of [[496, 884], [440, 956], [390, 844], [360, 780]]) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
      await page.goto('http://127.0.0.1:5173/#/subpages/tarot/index?theme=%E7%88%B1%E6%83%85')
      await page.locator('.flow-intro-button').waitFor()
      await page.waitForFunction(() => [...document.querySelectorAll('.flow-intro-deck img, .flow-intro-card img, .flow-intro-button-art img, .flow-intro-question-art img')].length === 6 && [...document.querySelectorAll('.flow-intro-deck img, .flow-intro-card img, .flow-intro-button-art img, .flow-intro-question-art img')].every(img => img.complete && img.naturalWidth > 0))
      const result = await page.evaluate(() => {
        const names = ['.flow-intro-stage', '.flow-intro-deck', '.flow-intro-cards', '.flow-intro-card', '.flow-intro-question', '.flow-intro-button']
        const rectangles = Object.fromEntries(names.map(name => {
          const rect = document.querySelector(name).getBoundingClientRect()
          return [name, [rect.x, rect.y, rect.width, rect.height]]
        }))
        const images = [...document.querySelectorAll('.flow-intro-deck img, .flow-intro-card img, .flow-intro-button-art img')].map(img => [img.currentSrc.split('/').pop(), img.naturalWidth, img.naturalHeight])
        return { rectangles, images }
      })
      const { rectangles: boxes, images } = result
      const deck = boxes['.flow-intro-deck'], cards = boxes['.flow-intro-cards'], question = boxes['.flow-intro-question'], button = boxes['.flow-intro-button'], stage = boxes['.flow-intro-stage']
      assert.equal(await page.locator('.flow-intro-deck > div').evaluate(surface => getComputedStyle(surface).backgroundSize), 'contain', 'Deck image is stretched')
      assert.ok(Math.abs(boxes['.flow-intro-card'][2] / boxes['.flow-intro-card'][3] - images[1][1] / images[1][2]) < .015, 'Card back is stretched')
      assert.ok(Math.abs(button[2] / button[3] - images[4][1] / images[4][2]) < .015, 'Start button is stretched')
      const questionArt = await page.locator('.flow-intro-question-art').evaluate(element => { const img = element.querySelector('img'), box = element.getBoundingClientRect(); return [box.width / box.height, img.naturalWidth / img.naturalHeight, getComputedStyle(element).maskImage] })
      assert.ok(Math.abs(questionArt[0] - questionArt[1]) < .04 && questionArt[2] === 'none', 'Question panel is stretched or masked')
      assert.ok(deck[1] + deck[3] < cards[1] && cards[1] + cards[3] < question[1] && question[1] + question[3] < button[1] && button[1] + button[3] <= stage[1] + stage[3], 'Entry elements overlap or clip')
      console.log(`${width}x${height}: ${JSON.stringify(result)}`)
      await page.screenshot({ path: `qa/intro-${width}x${height}.png`, fullPage: true })
      if (width === 496) await page.locator('.flow-intro-question').screenshot({ path: 'qa/intro-question-detail.png', scale: 'css' })
      await page.close()
    }
    for (const theme of ['事业', '财富']) {
      const page = await browser.newPage({ viewport: { width: 496, height: 884 }, deviceScaleFactor: 1 })
      await page.goto('http://127.0.0.1:5173/#/subpages/tarot/index?theme=' + encodeURIComponent(theme))
      await page.locator('.flow-intro-deck').waitFor()
      await page.waitForFunction(() => { const img = document.querySelector('.flow-intro-deck img'); return img && img.complete && img.naturalWidth > 0 })
      const ratios = await page.locator('.flow-intro-deck').evaluate(element => { const box = element.getBoundingClientRect(), img = element.querySelector('img'); return [box.width / box.height, img.naturalWidth / img.naturalHeight] })
      assert.equal(await page.locator('.flow-intro-deck > div').evaluate(surface => getComputedStyle(surface).backgroundSize), 'contain', theme + ' deck image is stretched')
      const buttonRatios = await page.locator('.flow-intro-button').evaluate(element => { const box = element.getBoundingClientRect(), img = element.querySelector('img'); return [box.width / box.height, img.naturalWidth / img.naturalHeight] })
      assert.ok(Math.abs(buttonRatios[0] - buttonRatios[1]) < .015, theme + ' start button is stretched')
      await page.screenshot({ path: `qa/intro-${theme}-496x884.png`, fullPage: true })
      await page.close()
    }
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exit(1) })
