const { chromium }=require('C:/Users/aa404/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const assert=require('node:assert/strict')
const themes=[['爱情','love','目前单身'],['事业','career','正在工作'],['财富','wealth','日常收支']]
;(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'})
  try {
    const sizes=process.argv.includes('--flow-only')?[[440,956]]:[[360,780],[390,844],[440,956],[496,884]]
    for(const [width,height]of sizes){
      let sharedDeck,sharedHeader,sharedFan
      for(const [theme,key,option]of themes){
        const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1})
        const errors=[]
        page.on('pageerror',e=>errors.push(e.message))
        const imageReady=()=>page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0))
        if(width===440){
          await page.goto('http://127.0.0.1:5173/#/subpages/theme/index?theme='+encodeURIComponent(theme))
          await page.locator('.scene-bg').waitFor()
          await imageReady()
          await page.screenshot({path:`qa/redraw-${key}-home.png`,fullPage:true})
        }
        await page.goto('http://127.0.0.1:5173/#/subpages/tarot/index?theme='+encodeURIComponent(theme))
        await page.evaluate(()=>localStorage.clear())
        await page.reload()
        await page.locator('.flow-intro-button').waitFor()
        await imageReady()
        const headerLayout=()=>page.evaluate(()=>['.flow-select-header-panel','.flow-select-heading','.flow-select-flourish','.flow-select-subtitle'].map(s=>{const e=document.querySelector(s),r=e.getBoundingClientRect(),c=getComputedStyle(e);return {x:r.x,y:r.y,width:r.width,height:r.height,font:c.fontSize,lineHeight:c.lineHeight}}))
        const introHeader=await headerLayout()
        const boxes=await page.evaluate(()=>['.flow-intro-deck','.flow-intro-cards','.flow-intro-question','.flow-intro-button'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}}))
        for(let i=1;i<boxes.length;i++)assert.ok(boxes[i-1].y+boxes[i-1].height<boxes[i].y,`${theme}: elements overlap at ${width}x${height}`)
        assert.ok(boxes.every(b=>b.x>=0&&b.x+b.width<=width),`${theme}: horizontal clipping`)
        if(sharedDeck){assert.deepEqual(boxes[0],sharedDeck,'Deck positions differ across themes');assert.deepEqual(introHeader,sharedHeader,'Title module layout differs across themes')}
        else{sharedDeck=boxes[0];sharedHeader=introHeader}
        await page.screenshot({path:`qa/redraw-${key}-${width}-intro.png`,fullPage:true})
        await page.locator('.flow-intro-button').click()
        await page.locator('.flow-select-fan').waitFor()
        assert.deepEqual(await headerLayout(),introHeader,`${theme}: header moves between pages`)
        const fan=await page.locator('.flow-select-fan').boundingBox()
        if(sharedFan)assert.deepEqual(fan,sharedFan,'Fan positions differ across themes');else sharedFan=fan
        await page.screenshot({path:`qa/redraw-${key}-${width}-select.png`,fullPage:true})
        if(width===440){
          for(const index of [39,41,43])await page.locator(`.flow-fan-card[data-card-index="${index}"]`).dispatchEvent('click')
          const background=await page.locator('.flow-post-screen').evaluate(e=>getComputedStyle(e).backgroundImage)
          assert.ok(background.includes(`${key}-selection-scene.webp`),'Wrong loading background')
          await page.screenshot({path:`qa/redraw-${key}-loading.png`,fullPage:true})
          await page.locator('.flow-choice').filter({hasText:option}).waitFor()
          await page.locator('.flow-choice').filter({hasText:option}).click()
          await page.getByText('今天的一小步').waitFor()
          await page.screenshot({path:`qa/redraw-${key}-reading.png`,fullPage:true})
          await page.locator('.flow-chip').first().click()
          await page.locator('.flow-follow-copy').waitFor()
          await page.reload()
          await page.locator('.flow-follow-copy').waitFor()
        }
        assert.deepEqual(errors,[],'Browser errors')
        console.log(`${theme} ${width}x${height}: layout, shared header/deck/fan and images passed`)
        await page.close()
      }
    }
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)})
