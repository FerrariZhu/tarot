const {chromium}=require('C:/Users/aa404/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const assert=require('node:assert/strict')
;(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'})
 try{
  for(const [width,height]of [[360,640],[390,844],[440,956],[496,884]])for(const [theme,key,option]of [['爱情','love','目前单身'],['事业','career','正在工作'],['财富','wealth','日常收支']]){
   const page=await browser.newPage({viewport:{width,height}})
   const check=async(stage)=>{
    await page.waitForFunction(()=>[...document.images].every(e=>e.complete&&e.naturalWidth>0))
    const canvas=await page.locator('.flow-canvas').boundingBox()
    assert.ok(canvas.y>=48,'Missing top space')
    assert.equal(await page.locator('.flow-guide-avatar').count(),0,'Portraits must be removed')
    const svgImages=await page.locator('img').evaluateAll(items=>items.filter(e=>/\.svg(?:\?|$)/.test(e.src)).map(e=>e.src))
    assert.deepEqual(svgImages,[],'Runtime icons must use PNG')
    const input=await page.locator('.flow-input').boundingBox()
    assert.ok(input.y+input.height<=height,`${theme} ${stage}: input below screen`)
    await page.screenshot({path:`qa/dialogue-${key}-${stage}-${width}.png`,fullPage:true})
   }
   await page.goto('http://127.0.0.1:5173/#/subpages/tarot/index?theme='+encodeURIComponent(theme))
   await page.evaluate(()=>localStorage.clear());await page.reload()
   await page.locator('.flow-intro-button').click()
   for(const i of [39,41,43])await page.locator(`[data-card-index="${i}"]`).dispatchEvent('click')
   await page.locator('.flow-choice').first().waitFor()
   await check('context')
   await page.locator('.flow-choice').filter({hasText:option}).click()
   await page.getByText('今天的一小步').waitFor();await check('reading')
   console.log(`${theme} ${width}x${height}: top spacing and input visible`)
   await page.close()
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)})
