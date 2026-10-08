const { chromium }=require('C:/Users/aa404/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
;(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'})
  try {
    for(const [width,height] of [[390,844],[440,956]]){
      const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1})
      await page.goto('http://127.0.0.1:5173/#/subpages/theme/index?theme='+encodeURIComponent('事业'))
      await page.locator('.scene-bg').waitFor()
      await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0))
      await page.screenshot({path:`qa/career-theme-redraw-${width}.png`,fullPage:true})
      console.log(`${width}x${height}: background and UI images loaded`)
      await page.close()
    }
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)})
