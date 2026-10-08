const { chromium } = require('C:/Users/aa404/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const assert = require('node:assert/strict')
;(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
  try {
    for (const [width,height] of [[360,780],[390,844],[440,956],[496,884]]) {
      const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1})
      await page.goto('http://127.0.0.1:5173/#/subpages/tarot/index?theme='+encodeURIComponent('事业'))
      await page.evaluate(()=>localStorage.clear())
      await page.reload()
      await page.locator('.flow-intro-button').waitFor()
      await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0))
      const boxes=await page.evaluate(()=>['.flow-intro-header','.flow-intro-deck','.flow-intro-cards','.flow-intro-question','.flow-intro-button'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right}}))
      for(let i=1;i<boxes.length;i++)assert.ok(boxes[i-1].bottom<boxes[i].top,'Career entry overlaps at '+width+'x'+height+': '+JSON.stringify(boxes))
      assert.ok(boxes.every(r=>r.left>=0&&r.right<=width),'Career entry is clipped')
      await page.screenshot({path:`qa/career-fresh-${width}-intro.png`,fullPage:true})
      if(width===390||width===440){
        const headerLayout=()=>page.evaluate(()=>['.flow-select-header-panel','.flow-select-heading','.flow-select-flourish','.flow-select-subtitle'].map(s=>{const e=document.querySelector(s),r=e.getBoundingClientRect(),style=getComputedStyle(e);return {x:r.x,y:r.y,width:r.width,height:r.height,fontSize:style.fontSize,lineHeight:style.lineHeight}}))
        const introHeader=await headerLayout()
        await page.locator('.flow-intro-button').click()
        assert.deepEqual(await headerLayout(),introHeader,'Entry and selection header layouts differ')
        await page.screenshot({path:`qa/career-fresh-${width}-select.png`,fullPage:true})
        for(const index of [39,41,43])await page.locator(`.flow-fan-card[data-card-index="${index}"]`).dispatchEvent('click')
        await page.screenshot({path:`qa/career-fresh-${width}-loading.png`,fullPage:true})
        await page.locator('.flow-choice').filter({hasText:'正在工作'}).waitFor()
        await page.locator('.flow-choice').filter({hasText:'正在工作'}).click()
        await page.getByText('今天的一小步').waitFor()
        await page.screenshot({path:`qa/career-fresh-${width}-reading.png`,fullPage:true})
      }
      console.log(`${width}x${height}: career layout passed`)
      await page.close()
    }
  } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)})
