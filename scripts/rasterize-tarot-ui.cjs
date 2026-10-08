const fs=require('node:fs')
const path=require('node:path')
const {chromium}=require('C:/Users/aa404/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const output=path.resolve(__dirname,'../src/static/tarot')
;(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'})
 try{
  const page=await browser.newPage({deviceScaleFactor:3})
  for(const name of fs.readdirSync(output).filter(n=>n.endsWith('.svg'))){
   const svg=fs.readFileSync(path.join(output,name),'utf8')
   const box=svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number)
   const width=box[2],height=box[3]
   await page.setViewportSize({width:Math.ceil(width),height:Math.ceil(height)})
   await page.setContent(`<style>html,body{margin:0;background:transparent}img{display:block;width:${width}px;height:${height}px}</style><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}">`)
   await page.locator('img').evaluate(e=>e.decode())
   await page.locator('img').screenshot({path:path.join(output,name.replace('.svg','.png')),omitBackground:true})
  }
  await page.setViewportSize({width:60,height:60})
  for(const [name,glyph]of [['icon-restart','↻'],['icon-chevron','›']]){
   await page.setContent(`<style>html,body{margin:0;background:transparent}.icon{width:60px;height:60px;display:flex;align-items:center;justify-content:center;color:#ffe9ad;font:48px/1 Arial,sans-serif}</style><div class="icon">${glyph}</div>`)
   await page.locator('.icon').screenshot({path:path.join(output,name+'.png'),omitBackground:true})
  }
  console.log('Exported tarot UI as transparent PNG at 3x resolution')
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)})
