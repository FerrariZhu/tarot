const fs=require('node:fs')
const path=require('node:path')
const {chromium}=require('C:/Users/aa404/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
;(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'})
 try{
  const page=await browser.newPage()
  for(const [theme,color]of [['love','#cfa087'],['career','#d4b477'],['wealth','#d4b477']]){
   for(const direction of ['horizontal','vertical']){
    const data=await page.evaluate(({color,direction})=>{
     const canvas=document.createElement('canvas');canvas.width=direction==='horizontal'?1200:6;canvas.height=direction==='horizontal'?18:150
     const c=canvas.getContext('2d'),g=c.createLinearGradient(0,0,direction==='horizontal'?1200:0,direction==='horizontal'?0:150)
     g.addColorStop(0,'transparent');g.addColorStop(.1,color);g.addColorStop(.5,color);g.addColorStop(.9,color);g.addColorStop(1,'transparent')
     c.fillStyle=g
     if(direction==='horizontal'){
      c.fillRect(0,8,1200,2);c.fillStyle='#ffe0ba';c.beginPath();c.moveTo(600,0);c.quadraticCurveTo(602,7,608,9);c.quadraticCurveTo(602,11,600,18);c.quadraticCurveTo(598,11,592,9);c.quadraticCurveTo(598,7,600,0);c.fill()
     }else c.fillRect(2,0,2,150)
     return canvas.toDataURL('image/png').split(',')[1]
    },{color,direction})
    fs.writeFileSync(path.resolve(__dirname,`../src/static/tarot/${theme}-dialogue-${direction}.png`),Buffer.from(data,'base64'))
   }
  }
  console.log('Saved six transparent PNG separator slices')
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)})
