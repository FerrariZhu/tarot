const {chromium}=require('C:/Users/aa404/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const assert=require('node:assert/strict')
;(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'})
 try{
  for(const [width,height] of [[360,780],[390,844],[440,956],[496,884]]){
   let sharedLayout
   for(const [theme,key]of [['爱情','love'],['事业','career'],['财富','wealth']]){
    const page=await browser.newPage({viewport:{width,height}})
    await page.addInitScript(()=>{const timer=window.setTimeout;window.setTimeout=(fn,delay,...args)=>timer(fn,delay===1100?60000:delay,...args)})
    await page.goto('http://127.0.0.1:5173/#/subpages/tarot/index?theme='+encodeURIComponent(theme))
    await page.evaluate(()=>localStorage.clear());await page.reload()
    await page.locator('.flow-intro-button').click()
    for(const i of [39,41,43])await page.locator(`[data-card-index="${i}"]`).dispatchEvent('click')
    await page.locator('.flow-loading-title').waitFor()
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0))
    assert.equal(await page.locator('.flow-face-position').count(),3)
    assert.equal(await page.locator('.flow-face-meta').count(),3)
    assert.equal(await page.locator('.flow-dots').count(),0)
    const clipped=await page.locator('.flow-face-position,.flow-face-meta').evaluateAll(items=>items.filter(e=>e.clientHeight===0||e.scrollWidth>e.clientWidth+1).map(e=>e.textContent))
    assert.deepEqual(clipped,[],theme+' clipped captions')
    const title=await page.locator('.flow-loading-title').boundingBox(),panel=await page.locator('.flow-career-loading-panel').boundingBox()
    assert.ok(title.y>panel.y&&title.y+title.height<panel.y+panel.height)
    const layout=await page.locator('.flow-title,.flow-loading-rule,.flow-face,.flow-loading-title,.flow-loading-caption,.flow-career-loading-panel').evaluateAll(items=>items.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}}))
    if(sharedLayout)assert.deepEqual(layout,sharedLayout,'Loading module positions must match across themes')
    else sharedLayout=layout
    await page.screenshot({path:`qa/loading-fixed-${key}-${width}.png`,fullPage:true})
    console.log(`${theme} ${width}x${height}: captions, panel, assets passed`)
    await page.close()
   }
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)})
