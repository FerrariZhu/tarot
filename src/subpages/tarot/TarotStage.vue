<template>
  <view class="flow-screen" :class="['flow-'+themeKey[theme],{'flow-intro-screen':step==='intro','flow-post-screen':step!=='intro'&&step!=='select','flow-loading-screen':step==='loading','flow-dialogue-screen':['context','reading','followup'].includes(step)}]" :style="postBackdropStyle">
    <view v-if="step==='intro'" class="flow-intro-stage" :style="introBackdropStyle">
      <image class="flow-intro-deck" :src="asset('intro-deck')" :style="introDeckStyle" mode="aspectFit"/>
      <view class="flow-select-back" @tap="emit('back')"><image class="flow-nav-icon" src="/static/tarot/icon-back.png" mode="aspectFit"/></view>
      <view class="flow-intro-header flow-select-header-panel">
        <view class="flow-select-heading">{{theme}}<text>{{theme==='爱情'?'♥':'✦'}}</text>抽塔罗</view>
        <view class="flow-select-flourish"><text class="flow-select-flourish-line"/><text>{{theme==='爱情'?'♥':'✦'}}</text><text class="flow-select-flourish-line"/></view>
        <view class="flow-select-subtitle">{{introSubtitle}}</view>
      </view>
      <view class="flow-intro-fill"/>
      <view class="flow-intro-cards">
        <view v-for="position in positions" :key="position" class="flow-intro-card-column">
          <image class="flow-intro-card" :src="back" mode="aspectFill"/>
          <view class="flow-intro-label"><text>✦</text>{{position}}<text>✦</text></view>
        </view>
      </view>
      <view class="flow-intro-question">
        <image class="flow-intro-question-art" :src="asset('intro-question')" mode="aspectFit"/>
        <input class="flow-intro-input" :value="question" maxlength="80" placeholder="想聊的事（选填）" placeholder-class="flow-placeholder" @input="emit('update:question',($event as any).detail.value)"/>
      </view>
      <view class="flow-intro-button" @tap="emit('start')">
        <image class="flow-intro-button-art" :src="asset('intro-button')" mode="scaleToFill"/>
      </view>
    </view>
    <view v-else-if="step==='select'" class="flow-select-stage" :style="selectBackdropStyle">
      <view class="flow-select-back" @tap="emit('back')"><image class="flow-nav-icon" src="/static/tarot/icon-back.png" mode="aspectFit"/></view>
      <view class="flow-select-restart" @tap="emit('restart')"><image class="flow-nav-icon" src="/static/tarot/icon-restart.png" mode="aspectFit"/></view>
      <view class="flow-select-header-panel">
        <view class="flow-select-heading">{{theme}}<text>{{theme==='爱情'?'♥':'✦'}}</text>抽塔罗</view>
        <view class="flow-select-flourish"><text class="flow-select-flourish-line"/><text>{{theme==='爱情'?'♥':'✦'}}</text><text class="flow-select-flourish-line"/></view>
        <view class="flow-select-subtitle">请选择第 {{chosen.length+1}} 张牌</view>
      </view>
      <view class="flow-select-fan" @touchstart="onFanTouchStart" @touchmove.stop.prevent="onFanTouchMove" @touchend="onFanTouchEnd" @mousedown="onFanMouseDown" @mousemove="onFanMouseMove" @mouseup="onFanMouseUp" @mouseleave="onFanMouseUp" @wheel.prevent="onFanWheel">
        <view v-for="item in visibleFanCards" :key="item.card.id" class="flow-fan-card" :class="{active:item.index===focusedCard}" :style="fanCardStyle(item.index)" :data-card-index="item.index" @tap="chooseCard(item.index)">
          <image :src="back" mode="aspectFill"/>
        </view>
      </view>
      <view class="flow-select-slots">
        <view v-for="(position,index) in positions" :key="position" class="flow-select-slot-column">
          <view class="flow-select-slot" :class="{filled:chosen[index]}">
            <image class="flow-select-slot-art" :src="slotArt" mode="scaleToFill"/>
            <image v-if="chosen[index]" class="flow-select-slot-card" :src="back" mode="aspectFill"/>
          </view>
          <view class="flow-select-slot-label"><text>✦</text>{{position}}<text>✦</text></view>
        </view>
      </view>
      <view class="flow-select-hint"><text class="flow-select-hint-line"/>↔&nbsp; 左右滑动牌阵，轻点选牌 <text class="flow-select-hint-line"/></view>
    </view>
    <template v-else>
    <template v-if="step!=='loading'">
      <view class="flow-select-back flow-dialogue-back" @tap="emit('back')"><image class="flow-nav-icon" src="/static/tarot/icon-back.png" mode="aspectFit"/></view>
      <view class="flow-restart flow-dialogue-restart" @tap="emit('restart')"><image class="flow-nav-icon" src="/static/tarot/icon-restart.png" mode="aspectFit"/></view>
    </template>
    <view class="flow-canvas">
      <image v-if="step==='loading'" class="flow-career-loading-panel" :src="asset('loading-panel')" :style="at('loading-panel')" mode="scaleToFill"/>
      <view v-if="step==='loading'" class="flow-hit" :style="at('back-icon')" @tap="emit('back')"/>
      <view v-if="step==='loading'" class="flow-select-back" @tap="emit('back')"><image class="flow-nav-icon" src="/static/tarot/icon-back.png" mode="aspectFit"/></view>
      <view v-if="step==='loading'" class="flow-restart" @tap="emit('restart')"><image class="flow-nav-icon" src="/static/tarot/icon-restart.png" mode="aspectFit"/></view>

      <view class="flow-title" :style="at('title')">{{ heading }}</view>
      <image v-if="step==='loading'" class="flow-loading-rule" :src="'/static/tarot/'+themeKey[theme]+'-title-rule.png'" :style="at('title-rule')" mode="scaleToFill"/>

        <view v-for="(card,index) in results" :key="card.id" class="flow-face flow-face-with-meta" :class="{'flow-face-loading':step==='loading','flow-face-compact':step!=='loading','flow-face-context':step==='context'}" :style="faceStyle(index)">
          <view class="flow-face-art"><image :src="card.image" :class="{reversed:card.reversed}" mode="aspectFill"/></view>
          <view class="flow-face-caption">
              <text class="flow-face-position">{{positions[index]}}</text>
              <view class="flow-face-divider"/>
              <text v-if="step==='loading'" class="flow-face-meta">{{card.name}} · {{card.reversed?'逆位':'正位'}}</text>
              <text v-else class="flow-face-meta">{{card.name}}·{{card.reversed?'逆位':'正位'}}</text>
          </view>
          <image class="flow-face-frame" :src="'/static/tarot/'+themeKey[theme]+'-face-frame.png'" mode="scaleToFill"/>
        </view>
        <template v-if="step==='loading'">
          <view class="flow-loading-title" :style="at('loading-title')">正在解读你的牌阵…</view>
          <view class="flow-loading-caption" :style="at('loading-caption')">{{guide}}把三张牌连起来看</view>
        </template>
        <template v-else-if="step==='context'">
          <view class="flow-subtitle" :style="at('guide-subtitle')">{{guide}}与你一起看</view>
          <view class="flow-context-bubble" :style="at('intro-bubble')">{{opening}}</view>
          <view class="flow-context-bubble" :style="at('question-bubble')">{{contextQuestion}}</view>
          <view v-for="(option,index) in options" :key="option" class="flow-choice flow-context-choice" :style="at('choice-bg-'+index)" @tap="emit('select-context',option)">
            <image class="flow-choice-icon" :src="'/static/tarot/icon-'+choiceIcons[index]+'.png'" mode="aspectFit"/>
            <text>{{option}}</text><image class="flow-choice-chevron" src="/static/tarot/icon-chevron.png" mode="aspectFit"/>
          </view>
          <view class="flow-skip" :style="at('skip')" @tap="emit('select-context','暂不选择')">暂不选择</view>
        </template>
        <template v-else-if="step==='reading'">
          <view v-if="hasGuideSubtitle" class="flow-subtitle" :style="at('guide-subtitle')">{{guide}}与你一起看</view>
          <view class="flow-user-text" :style="at('user-choice')">{{context==='暂不选择'?'暂不选择':'我'+context}}</view>
          <view class="flow-reading-bubble" :style="at('reading-copy')">
          <scroll-view scroll-y class="flow-copy">
            <view class="flow-speaker">{{guide}}</view>
            <view class="flow-reading-intro">{{opening}}</view>
            <view v-for="section in sections" :key="section.title" class="flow-section"><view>{{sectionLabel(section.title)}}</view><text>{{section.body}}</text></view>
            <view class="flow-reading-question">{{readingQuestion}}</view>
          </scroll-view>
          </view>
          <view v-if="error" class="flow-error" :style="rect([65,1380,790,65])" @tap="emit('retry')">{{error}}　重试</view>
        </template>
        <template v-else-if="step==='followup'">
          <view class="flow-user-text" :style="at('follow-question')">{{followupQuestion}}</view>
          <view class="flow-reading-bubble" :style="at('follow-copy')">
          <scroll-view scroll-y class="flow-copy flow-follow-copy">
            <view class="flow-speaker">{{guide}}</view>
            <view class="flow-answer-intro">{{followupAnswer}}</view>
            <view v-for="item in followupBlocks" :key="item.title" class="flow-follow-section"><view>{{item.title}}</view><text>{{item.body}}</text></view>
          </scroll-view>
          </view>
        </template>
    </view>
        <view v-if="step==='context'||step==='reading'||step==='followup'" class="flow-dialogue-footer">
          <view v-if="step!=='context'" class="flow-footer-suggestions"><view v-for="item in suggestions.slice(0,2)" :key="item" class="flow-chip" @tap="emit('ask',item)">{{item}}</view></view>
          <view class="flow-chat-bar">
            <image class="flow-chat-icon" src="/static/tarot/icon-chat-redraw.png" mode="aspectFit"/>
            <input class="flow-input" :value="draft" maxlength="100" :disabled="step==='context'" :placeholder="step==='context'?'选择后，可以继续提问':'继续问'+guide+'…'" placeholder-class="flow-placeholder" @input="emit('update:draft',($event as any).detail.value)" @confirm="emit('ask',draft)"/>
            <view class="flow-chat-send" :class="{disabled:step==='context'}" @tap="step!=='context'&&emit('ask',draft)"><image src="/static/tarot/icon-send-redraw.png" mode="aspectFit"/></view>
          </view>
        </view>
    <view class="flow-tail"/>
    </template>
  </view>
</template>
<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import type { ThemeName } from '@/theme'
import { themeKey, cardImage, themeCharacter } from '@/theme'
import flowLayout from './flow-layout.json'
type Step='intro'|'select'|'loading'|'context'|'reading'|'followup'
const props=defineProps<{theme:ThemeName;step:Step;question:string;reversals:boolean;deck:any[];chosen:any[];results:any[];context:string;sections:any[];sourceNote:string;draft:string;followupQuestion:string;followupAnswer:string;error:string;opening:string;contextQuestion:string;options:string[];suggestions:string[]}>()
const emit=defineEmits(['back','restart','start','choose','select-context','ask','retry','update:question','update:reversals','update:draft'])
const positions=['现状','阻碍','建议']
const stage=computed(()=>({intro:'entry',select:'selection',loading:'loading',context:'context',reading:'reading',followup:'followup'} as Record<Step,string>)[props.step])
const hasGuideSubtitle=computed(()=>Boolean((flowLayout as any)[themeKey[props.theme]]?.[stage.value]?.['guide-subtitle']))
const guide=computed(()=>themeCharacter[props.theme].name)
const readingQuestion=computed(()=>({爱情:'你更在意对方的态度，还是自己的表达？',事业:'你最卡住的是投递、面试，还是选择方向？',财富:'你更想先理清收支，还是下一步的计划？'})[props.theme])
function sectionLabel(title:string){return ({当前:'眼下',组合线索:'牌阵线索',给你的建议:'建议'} as Record<string,string>)[title]||title}
const choiceIcons=computed(()=>({爱情:['single','pair','rings'],事业:['briefcase-redraw','search-redraw','growth-redraw'],财富:['wallet','coin','growth-redraw']})[props.theme])
const introSubtitle=computed(()=>({爱情:'把此刻的心事交给三张牌',事业:'把此刻的困惑交给三张牌',财富:'把眼前的选择交给三张牌'})[props.theme])
const heading=computed(()=>props.step==='intro'||props.step==='select'?props.theme+' · 抽塔罗':props.step==='loading'?'你的三张牌':props.step==='followup'?'继续聊聊':props.theme+'解读')
const back=computed(()=>cardImage('back-'+themeKey[props.theme]))
const slotArt=computed(()=>'/static/tarot/'+themeKey[props.theme]+'-slot.png')
const selectBackdropStyle=computed(()=>({backgroundImage:`url("${asset('selection-scene')}")`}))
function getStageWidth(){
  try {return Math.min(520,uni.getSystemInfoSync().windowWidth)}
  catch {return 440}
}
const stageWidth=ref(getStageWidth())
const fanPosition=ref(39)
const focusedCard=computed(()=>Math.max(0,Math.min(props.deck.length-1,Math.round(fanPosition.value))))
const visibleFanCards=computed(()=>props.deck.map((card,index)=>({card,index})).filter(item=>!item.card.selected&&Math.abs(item.index-fanPosition.value)<7))
const selectedIndices=computed(()=>props.deck.flatMap((card,index)=>card.selected?[index]:[]))
const fanStep=computed(()=>stageWidth.value*.087)
let animationFrame:any
let gapFrame:any
const openingIndex=ref<number|null>(null)
const openingProgress=ref(1)
let dragging=false
let dragStartX=0
let dragStartPosition=39
let lastX=0
let lastTime=0
let velocity=0
let suppressTapUntil=0
function clampFan(position:number){return Math.max(0,Math.min(props.deck.length-1,position))}
function cancelFanAnimation(){if(animationFrame!==undefined){if(typeof cancelAnimationFrame==='function')cancelAnimationFrame(animationFrame);else clearTimeout(animationFrame);animationFrame=undefined}}
function frame(callback:(time:number)=>void){return typeof requestAnimationFrame==='function'?requestAnimationFrame(callback):setTimeout(()=>callback(Date.now()),16)}
function animateFan(target:number){
  cancelFanAnimation()
  const from=fanPosition.value
  const to=clampFan(Math.round(target))
  const duration=Math.min(520,280+Math.abs(to-from)*38)
  let started=0
  function tick(time:number){
    if(!started)started=time
    const t=Math.min(1,(time-started)/duration)
    fanPosition.value=from+(to-from)*(1-Math.pow(1-t,3))
    animationFrame=t<1?frame(tick):undefined
  }
  animationFrame=frame(tick)
}
function startDrag(x:number){cancelFanAnimation();dragging=true;dragStartX=lastX=x;dragStartPosition=fanPosition.value;lastTime=Date.now();velocity=0}
function moveDrag(x:number){
  if(!dragging)return
  const now=Date.now()
  if(now>lastTime)velocity=(x-lastX)/(now-lastTime)
  lastX=x;lastTime=now
  fanPosition.value=clampFan(dragStartPosition-(x-dragStartX)/fanStep.value)
}
function endDrag(){
  if(!dragging)return
  dragging=false
  if(Math.abs(lastX-dragStartX)>7)suppressTapUntil=Date.now()+250
  animateFan(fanPosition.value-velocity*170/fanStep.value)
}
function onFanTouchStart(event:any){const x=event.touches?.[0]?.clientX;if(typeof x==='number')startDrag(x)}
function onFanTouchMove(event:any){const x=event.touches?.[0]?.clientX;if(typeof x==='number')moveDrag(x)}
function onFanTouchEnd(){endDrag()}
function onFanMouseDown(event:any){startDrag(event.clientX)}
function onFanMouseMove(event:any){if(dragging)moveDrag(event.clientX)}
function onFanMouseUp(){endDrag()}
function onFanWheel(event:any){animateFan(fanPosition.value+(event.deltaX||event.deltaY)/fanStep.value)}
function openSelectedGap(index:number){
  if(gapFrame!==undefined){if(typeof cancelAnimationFrame==='function')cancelAnimationFrame(gapFrame);else clearTimeout(gapFrame)}
  openingIndex.value=index
  openingProgress.value=0
  let started=0
  function tick(time:number){
    if(!started)started=time
    const t=Math.min(1,(time-started)/240)
    openingProgress.value=1-Math.pow(1-t,3)
    if(t<1)gapFrame=frame(tick)
    else {gapFrame=undefined;openingIndex.value=null}
  }
  gapFrame=frame(tick)
}
function chooseCard(index:number){
  if(Date.now()<suppressTapUntil)return
  animateFan(index)
  openSelectedGap(index)
  emit('choose',index)
}
function gapShift(position:number){
  const gap=stageWidth.value*.15
  return selectedIndices.value.reduce((offset,index)=>{
    const progress=Math.max(0,Math.min(1,position-index+.5))
    return offset+gap*progress*(index===openingIndex.value?openingProgress.value:1)
  },0)
}
function fanCardStyle(index:number){
  const distance=index-fanPosition.value
  const spread=Math.abs(distance)
  const x=distance*fanStep.value+gapShift(index)-gapShift(fanPosition.value)
  const skew=Math.sign(distance)*Math.min(14,spread*2.3)
  const tilt=-Math.sign(distance)*Math.min(3,spread*.5)
  const yaw=Math.sign(distance)*Math.min(12,spread*2)
  const pitch=Math.min(8,spread*1.5)
  const scale=1.12-Math.min(.22,spread*.035)
  const transform=`translate3d(${x}px,0,0) perspective(480px) rotateZ(${tilt}deg) skewX(${skew}deg) rotateY(${yaw}deg) rotateX(${pitch}deg) scale(${scale})`
  return {transform,zIndex:String(100-Math.ceil(spread*10))}
}
function onFanResize(){stageWidth.value=getStageWidth()}
watch(()=>props.step,(step)=>{if(step==='select'){cancelFanAnimation();fanPosition.value=39}})
onMounted(()=>uni.onWindowResize?.(onFanResize))
onBeforeUnmount(()=>{cancelFanAnimation();if(gapFrame!==undefined){if(typeof cancelAnimationFrame==='function')cancelAnimationFrame(gapFrame);else clearTimeout(gapFrame)}uni.offWindowResize?.(onFanResize)})
const introDeckStyle={left:'34%',top:'37%',width:'32%',height:'auto',aspectRatio:'430/347.12'}
const postBackdropStyle=computed(()=>props.step==='intro'||props.step==='select'?{}:{backgroundImage:`url("${asset('selection-scene')}")`})
const introBackdropStyle=computed(()=>({backgroundImage:`url("${asset('selection-scene')}")`}))
const followupBlocks=computed(()=>props.theme==='爱情'?[{title:'先看事实',body:'先区分你知道的事和自己的猜测，再决定要表达什么。'},{title:'轻轻表达',body:props.results[2]?.reading||'用清楚而温和的话说出你的感受。'},{title:'留意回应',body:'给彼此一点空间，观察真实回应，而不是反复猜测。'}]:props.theme==='事业'?[{title:'先准备',body:'把你最在意的问题写清楚，选一个能验证的行动。'},{title:'行动当下',body:props.results[2]?.reading||'保持自己的节奏。'},{title:'行动之后',body:'记录结果，再决定下一次调整的方向。'}]:[{title:'先整理',body:'把最近的收支和想法分别记下来。'},{title:'尝试一步',body:props.results[2]?.reading||'从负担得起的一步开始。'},{title:'再看结果',body:'观察实际变化，按自己的承受范围调整。'}])
function asset(piece:string){return '/static/tarot/'+themeKey[props.theme]+'-'+piece+'.webp'}
function rect(r:number[]){return {left:r[0]/941*100+'%',top:r[1]/1672*100+'%',width:r[2]/941*100+'%',height:r[3]/1672*100+'%'}}
function at(id:string){
  if(id==='title'&&(props.step==='reading'||props.step==='followup'))return rect([210,72,520,82])
  if(id==='reading-copy'||id==='follow-copy')return rect([55,610,831,825])
  const map=(flowLayout as any)[themeKey[props.theme]]?.[stage.value]||{};return rect(map[id]||[0,0,0,0])
}
function faceStyle(index:number){
  if(props.step==='context')return rect([205+180*index,225,170,310])
  if(props.theme==='事业'&&(props.step==='reading'||props.step==='followup'))return rect([260.5+150*index,182,120,230])
  if(props.step==='reading'||props.step==='followup')return {...at('card-'+(index+1)),top:162/1672*100+'%'}
  return at('card-'+(index+1))
}
</script>
<style scoped>
.flow-screen{--accent:#f8abbc;min-height:100vh;background:#05152e;color:#fff6e8}.flow-career{--accent:#f7d675}.flow-wealth{--accent:#f4d281}.flow-canvas{position:relative;width:100%;max-width:520px;aspect-ratio:941/1672;margin:0 auto;overflow:hidden;font-family:serif}.flow-background{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.flow-overlay{z-index:1}.flow-intro-deck{position:absolute;z-index:2}.flow-intro-input{position:absolute;z-index:4;left:15%;top:78.5%;width:49%;height:3.1%;box-sizing:border-box;padding:0 1%;background:rgba(12,36,72,.96);color:#f8edf0;font-size:clamp(12px,2.9vw,18px);font-family:serif}.flow-intro-start{position:absolute;z-index:5}.flow-hit{position:absolute;z-index:10}.flow-restart{position:absolute;z-index:10;top:2%;right:3%;font-size:22px;color:#fce9bd;text-shadow:0 2px 5px #021126}.flow-title,.flow-subtitle,.flow-label,.flow-progress,.flow-hint,.flow-loading-title,.flow-loading-caption,.flow-dots,.flow-button-text,.flow-context-text,.flow-choice,.flow-skip,.flow-user-text,.flow-chip{position:absolute;z-index:3;display:flex;align-items:center;justify-content:center;box-sizing:border-box;text-align:center;text-shadow:0 2px 5px #020e27}.flow-title{font-size:clamp(23px,5.4vw,33px);letter-spacing:.13em;color:#fff9f4}.flow-subtitle{font-size:clamp(12px,2.9vw,18px);color:#f5e9dd}.flow-label{font-size:clamp(11px,2.7vw,17px)}.flow-card-back,.flow-face{position:absolute;z-index:3}.flow-card-back{overflow:hidden;border-radius:5%}.flow-card-back image{width:100%;height:100%}.flow-question{position:absolute;z-index:3;display:flex;align-items:center;gap:8px;box-sizing:border-box;padding:0 4%;border:1px solid #d9b5b8;border-radius:11px;background:rgba(12,38,73,.78);font-size:clamp(12px,2.8vw,16px)}.flow-question input{flex:1;font-size:inherit}.flow-placeholder{color:#b7c5da}.flow-reverse{position:absolute;z-index:4;font-size:clamp(10px,2.2vw,13px);color:#f7d8d3;text-align:right}.flow-button-text{font-size:clamp(20px,4.5vw,28px);color:#3d2030}.flow-career .flow-button-text,.flow-wealth .flow-button-text{color:#3b2d16}.flow-progress{font-size:clamp(12px,2.8vw,16px);color:var(--accent)}.flow-fan{position:absolute;z-index:4;white-space:nowrap}.flow-fan-inner{height:100%;display:flex;align-items:flex-end;width:max-content;padding:0 2%}.flow-fan-card{width:13vw;max-width:68px;height:78%;flex:none;margin-right:-7vw;overflow:hidden;border-radius:7px;box-shadow:0 2px 8px #020b19;transition:transform .2s}.flow-fan-card:nth-child(3n+1){transform:rotate(-7deg) translateY(4%)}.flow-fan-card:nth-child(3n+2){transform:rotate(2deg)}.flow-fan-card:nth-child(3n){transform:rotate(7deg) translateY(3%)}.flow-fan-card.selected{opacity:.2;transform:translateY(-10%);pointer-events:none}.flow-fan-card image{width:100%;height:100%}.flow-hint{font-size:clamp(11px,2.7vw,16px);color:#eee0d2}.flow-face{display:flex;flex-direction:column;align-items:stretch;border:1px solid #dfa7ae;border-radius:8px;background:#082244;overflow:hidden;box-shadow:0 5px 14px #020e20}.flow-face-art{height:79%;overflow:hidden}.flow-face-art image{width:100%;height:100%}.flow-face-art image.reversed{transform:rotate(180deg)}.flow-face-caption{height:21%;display:flex;align-items:center;justify-content:center;color:#fff1d9;font-size:clamp(9px,2.1vw,13px);line-height:1.1;white-space:nowrap}.flow-loading-title{font-size:clamp(18px,4vw,26px)}.flow-loading-caption{font-size:clamp(11px,2.7vw,16px)}.flow-dots{color:var(--accent);font-size:clamp(11px,2.4vw,15px)}.flow-context-text{justify-content:flex-start;text-align:left;padding:0 2%;font-size:clamp(11px,2.6vw,16px);line-height:1.5;overflow:hidden}.flow-choice{font-size:clamp(17px,3.7vw,24px);letter-spacing:.13em}.flow-skip{font-size:clamp(11px,2.7vw,15px);color:var(--accent)}.flow-user-text{font-size:clamp(11px,2.7vw,16px);color:#4e3142;padding:0 3%;overflow:hidden}.flow-copy{position:absolute;z-index:3;box-sizing:border-box;overflow-y:auto;padding:1% 2%;font-family:serif;font-size:clamp(11px,2.5vw,15px);line-height:1.46;color:#f6efe6}.flow-speaker{color:var(--accent);font-size:clamp(13px,3vw,18px);margin-bottom:6px}.flow-section,.flow-follow-section{display:flex;gap:3%;padding:2.3% 0;border-bottom:1px solid #a68086}.flow-section>view,.flow-follow-section>view{color:var(--accent);font-weight:bold;width:22%;flex:none}.flow-section>text,.flow-follow-section>text{flex:1}.flow-source{font-size:clamp(9px,2vw,12px);text-align:center;color:#d7c5c9;margin-top:3%}.flow-answer-intro,.flow-answer-extra{padding:2% 0;border-bottom:1px solid #a68086}.flow-answer-extra{color:#eadfdf}.flow-chip{font-size:clamp(10px,2.3vw,14px);color:#fff0dd;white-space:nowrap;overflow:hidden}.flow-input{position:absolute;z-index:4;box-sizing:border-box;padding:0 1%;font-size:clamp(11px,2.7vw,16px);color:#fff5ec}.flow-error{position:absolute;z-index:4;color:#ffb6bd;font-size:11px}
.flow-face-caption{white-space:normal;font-size:clamp(8px,1.85vw,11px);padding:0 2px}
.flow-face-position,.flow-face-meta{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.flow-face-meta{font-size:clamp(8px,1.85vw,11px)}
.flow-screen .flow-face{border:0;border-radius:3.5%;background:#061f45;box-shadow:0 3px 10px rgba(0,8,24,.7),0 0 0 1px #4e361c}
.flow-screen .flow-face-art{width:94%;height:78%;margin:2% auto 0;flex:none}
.flow-screen .flow-face-caption{display:grid;grid-template-rows:1fr;justify-items:center;align-items:center;box-sizing:border-box;height:20%;padding:0 3%;border-top:1px solid #d9ad5b;color:#fff0bb;text-align:center;text-shadow:0 1px 2px #001029}
.flow-screen .flow-face-with-meta .flow-face-caption{grid-template-rows:48% 1px minmax(0,1fr)}
.flow-screen .flow-face-divider{width:80%;height:1px;background:linear-gradient(90deg,transparent,#e6b966 18%,#ffe29e 50%,#e6b966 82%,transparent)}
.flow-screen .flow-face-loading .flow-face-position{font-size:clamp(13px,3.55vw,21px);line-height:1.15;font-weight:600}
.flow-screen .flow-face-loading .flow-face-meta{font-size:clamp(10px,2.75vw,14px);line-height:1.15}
.flow-screen .flow-face-compact .flow-face-position{font-size:clamp(10px,2.65vw,15px);line-height:1.1;font-weight:600}
.flow-screen .flow-face-compact.flow-face-with-meta .flow-face-art{height:71%}
.flow-screen .flow-face-compact.flow-face-with-meta .flow-face-caption{height:27%}
.flow-screen .flow-face-compact .flow-face-meta{font-size:clamp(7px,1.85vw,10px);line-height:1.05}
.flow-face-frame{position:absolute;z-index:2;inset:0;width:100%;height:100%;pointer-events:none}
.flow-fan-card{width:19vw;max-width:96px;height:auto;aspect-ratio:971/1620;margin-right:-13vw}
.flow-screen{display:flex;flex-direction:column}
.flow-canvas{flex:none}
.flow-post-screen{width:100%;max-width:520px;min-height:100dvh;margin:0 auto;background-size:cover;background-position:center center;background-repeat:no-repeat}
.flow-tail{flex:1;min-height:0;width:100%;pointer-events:none}
.flow-post-screen .flow-overlay{clip-path:inset(28% 0 0)}
.flow-career-loading-panel{position:absolute;z-index:2;pointer-events:none}
.flow-intro-input,.flow-question,.flow-input{background:transparent}
.flow-intro-stage{position:relative;display:flex;flex-direction:column;flex:none;width:100%;max-width:520px;height:100dvh;min-height:760px;margin:0 auto;overflow:hidden;background-color:#05152e;background-position:center bottom;background-size:cover;background-repeat:no-repeat}
.flow-intro-scene{position:relative;flex:none;width:100%;aspect-ratio:941/1672;mask-image:linear-gradient(to bottom,#000 0%,#000 72%,transparent 100%)}
.flow-intro-fill{flex:1;min-height:0;width:100%;pointer-events:none}
.flow-intro-cards{position:absolute;z-index:3;top:43%;left:12%;width:76%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(10px,4vw,20px)}
.flow-intro-card-column{min-width:0}.flow-intro-card{display:block;box-sizing:border-box;width:100%;height:auto;aspect-ratio:971/1620;border:2px solid #ffe8ae;border-radius:6px;box-shadow:0 2px 9px #03112d}
.flow-intro-label{display:flex;align-items:center;justify-content:space-around;margin-top:8px;color:#fff2e9;font-size:clamp(14px,3.7vw,19px);letter-spacing:.08em;text-shadow:0 2px 4px #04122b}.flow-intro-label text{color:var(--accent);font-size:.8em}
.flow-intro-question{position:absolute;z-index:4;top:70%;left:5%;width:90%;aspect-ratio:850/180;overflow:hidden;box-sizing:border-box}
.flow-intro-question-art{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.flow-intro-question .flow-intro-input{position:absolute;left:12%;top:21%;width:68%;height:57%;padding:0;border:0;background:transparent;color:#fff3ef;font-size:clamp(12px,2.9vw,18px)}
.flow-intro-button{position:absolute;z-index:4;top:83%;left:10%;width:80%;aspect-ratio:1912/428;overflow:hidden;cursor:pointer}
.flow-career .flow-intro-button{aspect-ratio:2016/469}
.flow-wealth .flow-intro-button{aspect-ratio:1967/429}
.flow-intro-button-art{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.flow-select-stage{--stage-w:min(100vw,520px);--fan-card-w:calc(var(--stage-w) * .16);--fan-step:calc(var(--stage-w) * .087);position:relative;flex:none;width:100%;max-width:520px;height:100dvh;margin:0 auto;overflow:hidden;background-color:#05152e;background-size:cover;background-position:center center;background-repeat:no-repeat;font-family:serif}
.flow-select-back,.flow-select-restart{position:absolute;z-index:10;top:2.5%;color:#ffeed1;font-size:clamp(25px,6vw,34px);line-height:1;text-shadow:0 2px 5px #06152c;cursor:pointer}.flow-select-back{left:3%}.flow-select-restart{right:3%}
.flow-select-header-panel{position:absolute;z-index:3;top:4.35%;left:22.2%;width:55.6%;height:15.3%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;overflow:hidden;border:1px solid rgba(255,221,188,.84);border-radius:clamp(14px,3.8vw,20px);background:linear-gradient(110deg,rgba(117,80,69,.48),rgba(58,61,82,.54) 56%,rgba(37,49,76,.58));-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 0 0 1px rgba(241,185,160,.17),0 8px 22px rgba(7,12,27,.2),inset 0 0 22px rgba(255,211,179,.09);pointer-events:none}
.flow-career .flow-select-header-panel{border-color:rgba(250,220,152,.82);background:linear-gradient(110deg,rgba(21,41,71,.61),rgba(27,47,76,.54) 55%,rgba(28,45,77,.57));box-shadow:0 0 0 1px rgba(249,211,126,.14),0 8px 22px rgba(5,15,34,.22),inset 0 0 22px rgba(255,224,153,.07)}
.flow-wealth .flow-select-header-panel{border-color:rgba(250,220,152,.82);background:linear-gradient(110deg,rgba(93,65,42,.56),rgba(70,58,56,.53) 55%,rgba(45,51,70,.58));box-shadow:0 0 0 1px rgba(249,211,126,.15),0 8px 22px rgba(17,15,23,.22),inset 0 0 22px rgba(255,224,153,.08)}
.flow-select-heading{flex:none;margin-top:10%;width:100%;text-align:center;color:#fff5e8;font-size:clamp(26px,6.5vw,36px);line-height:1.3;letter-spacing:.1em;white-space:nowrap;text-shadow:0 2px 5px rgba(33,22,31,.72)}.flow-select-heading text{padding:0 .22em;color:var(--accent);font-size:.58em;vertical-align:middle}
.flow-select-flourish{flex:none;display:flex;align-items:center;justify-content:center;gap:3px;width:76%;height:15%;color:var(--accent);font-size:clamp(15px,3.6vw,21px);line-height:1;text-shadow:0 1px 4px rgba(48,19,30,.45)}.flow-select-flourish-line{display:block;flex:1;height:8px;border-bottom:1px solid var(--accent);border-radius:0 0 50% 50%}.flow-select-flourish-line:first-child{transform:rotate(-5deg)}.flow-select-flourish-line:last-child{transform:rotate(5deg)}
.flow-select-subtitle{flex:none;margin-top:2%;width:100%;text-align:center;color:#fff2e5;font-size:clamp(17px,4.15vw,24px);line-height:1.3;letter-spacing:.1em;white-space:nowrap;text-shadow:0 2px 5px rgba(34,22,32,.8)}
.flow-select-fan{position:absolute;z-index:4;top:29%;left:0;width:100%;height:20.5%;overflow:hidden;touch-action:none;perspective:520px}
.flow-select-fan .flow-fan-card{position:absolute;left:50%;bottom:13%;width:var(--fan-card-w);max-width:none;height:auto;aspect-ratio:971/1620;margin:0 0 0 calc(var(--fan-card-w) / -2);overflow:visible;box-sizing:border-box;border:1px solid #ffe4b3;border-radius:5px;background:#06182b;box-shadow:0 5px 9px #020916,0 0 2px #ffdd8d;transform-origin:center bottom;transition:box-shadow 180ms ease-out,opacity 180ms ease-out;will-change:transform;backface-visibility:hidden;cursor:pointer}.flow-select-fan .flow-fan-card image{display:block;width:100%;height:100%;border-radius:4px;pointer-events:none}.flow-select-fan .flow-fan-card.active{border-color:#fff4c8;box-shadow:0 0 0 3px #ffb861,0 0 18px 5px #ff8e52,0 7px 12px #061127}
.flow-select-slots{position:absolute;z-index:3;top:54%;left:6.5%;width:87%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4%}.flow-select-slot-column{min-width:0}.flow-select-slot{position:relative;width:100%;aspect-ratio:248/370;filter:drop-shadow(0 3px 7px #031127)}.flow-select-slot-art{position:absolute;inset:0;width:100%;height:100%}.flow-select-slot-card{position:absolute;left:3.5%;top:2.5%;width:93%;height:95%;border:2px solid #ffe6a6;border-radius:5%;box-sizing:border-box;box-shadow:0 0 11px 3px #ff9b52}.flow-select-slot-label{display:flex;justify-content:space-around;align-items:center;margin-top:8%;color:#fff5eb;font-size:clamp(16px,3.9vw,24px);letter-spacing:.1em;text-shadow:0 2px 5px #00112b}.flow-select-slot-label text{color:var(--accent);font-size:.7em}
.flow-select-hint{position:absolute;z-index:3;top:86%;left:5%;width:90%;display:flex;align-items:center;justify-content:center;gap:2%;color:#fff3e5;font-size:clamp(13px,3.1vw,19px);white-space:nowrap;text-shadow:0 2px 5px #06152c}.flow-select-hint-line{width:12%;height:1px;background:var(--accent)}
@media (max-height:760px){.flow-select-fan{top:27%}.flow-select-slots{top:52%}.flow-select-hint{top:88%}}
.flow-intro-stage{background-position:center top;font-family:serif}
.flow-select-subtitle{font-size:clamp(13px,3.2vw,18px);line-height:1.5;letter-spacing:.06em}
.flow-intro-cards{top:52%;left:16%;width:68%}
.flow-intro-question{top:75%}
.flow-intro-button{top:87%}
.flow-select-header-panel{top:8.5%}
.flow-copy .flow-section,.flow-copy .flow-follow-section{width:100%;box-sizing:border-box}
.flow-section>text,.flow-follow-section>text{min-width:0;overflow-wrap:anywhere}

/* Loading composition uses the same 941 x 1672 coordinates as the approved artwork. */
.flow-loading-screen .flow-title{font-size:clamp(23px,6.6vw,35px);letter-spacing:.16em;color:var(--accent)}
.flow-loading-rule{position:absolute;z-index:3;pointer-events:none}
.flow-loading-screen .flow-face{box-sizing:border-box}
.flow-love .flow-face-caption{color:#ffe6d9;border-color:#eaa0aa}
.flow-wealth .flow-face-caption{color:#fff0bb}
.flow-loading-screen .flow-loading-title{font-size:clamp(18px,5.4vw,29px);letter-spacing:.04em}
.flow-loading-screen .flow-loading-caption{font-size:clamp(12px,3.4vw,19px);letter-spacing:.04em}
/* Move the complete dialogue composition together, including its artwork. */
.flow-dialogue-screen{--dialogue-top-space:max(48px,calc(7dvh + env(safe-area-inset-top,0px)));position:relative;box-sizing:border-box;padding-top:var(--dialogue-top-space)}
.flow-dialogue-screen .flow-canvas{width:min(100%,calc((100dvh - var(--dialogue-top-space) - env(safe-area-inset-bottom,0px) - 12px)*941/1672))}
.flow-dialogue-back{top:calc(clamp(16px,4.45vw,23px) + env(safe-area-inset-top,0px))}
.flow-dialogue-restart{top:calc(clamp(13px,3.55vw,18.5px) + env(safe-area-inset-top,0px))}
.flow-context-bubble{position:absolute;z-index:3;box-sizing:border-box;display:flex;align-items:center;padding:3% 4%;border:1px solid var(--accent);border-radius:12px;background:rgba(4,25,55,.94);font-size:clamp(12px,3.1vw,16px);line-height:1.65;color:#fff2e5}
.flow-context-choice{display:flex;justify-content:space-between;padding:0 6%;border:1px solid var(--accent);border-radius:999px;background:rgba(4,25,55,.94);font-size:clamp(16px,4vw,22px);letter-spacing:.08em;box-shadow:0 3px 10px rgba(0,8,24,.3)}
.flow-choice-icon{width:12%;height:58%;flex:none}
.flow-choice-chevron{width:8%;font-family:Arial,sans-serif;font-size:1.5em;line-height:1;color:var(--accent)}
.flow-chat-bar{position:absolute;z-index:4;box-sizing:border-box;display:flex;align-items:center;gap:3%;padding:0 2.5%;border:1px solid #789aca;border-radius:999px;background:rgba(9,39,82,.96)}
.flow-chat-icon{flex:none;width:8%;height:64%}
.flow-chat-bar .flow-input{position:static;flex:1;width:0;min-width:0;height:72%;box-sizing:border-box;border-radius:999px;background:rgba(34,68,110,.72);padding:0 4%;font-size:clamp(12px,3vw,16px)}
.flow-chat-send{flex:none;height:78%;aspect-ratio:1;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--accent)}
.flow-chat-send image{width:66%;height:66%}.flow-chat-send.disabled{opacity:.65}
.flow-dialogue-screen .flow-overlay{clip-path:inset(28% 0 8.4%)}
.flow-screen .flow-face-compact .flow-face-meta{font-size:clamp(6px,1.6vw,9px)}
.flow-screen .flow-face-context .flow-face-meta{font-size:clamp(8px,2.1vw,11px)}
.flow-dialogue-screen .flow-copy{border:1px solid var(--accent);border-radius:16px;background:rgba(3,24,53,.96);padding:4%;font-size:clamp(12px,3.15vw,17px);line-height:1.6}
.flow-dialogue-screen .flow-speaker{font-size:clamp(15px,3.6vw,20px)}
.flow-dialogue-screen .flow-section,.flow-dialogue-screen .flow-follow-section{padding:3% 0;border-color:var(--accent)}
.flow-dialogue-screen .flow-section>view,.flow-dialogue-screen .flow-follow-section>view{width:28%;font-weight:500}
.flow-dialogue-screen .flow-user-text{border:1px solid var(--accent);border-radius:12px;background:var(--accent);color:#062246;text-shadow:none;font-size:clamp(13px,3.1vw,17px)}
.flow-dialogue-screen .flow-chip{border:1px solid var(--accent);border-radius:999px;background:rgba(4,25,55,.94);padding:0 3%;font-size:clamp(10px,2.4vw,13px)}

.flow-nav-icon{display:block;width:clamp(25px,6vw,34px);height:clamp(25px,6vw,34px)}
.flow-choice-chevron{height:50%;flex:none}
.flow-reading-bubble{position:absolute;z-index:3;box-sizing:border-box}
.flow-reading-bubble::before,.flow-context-bubble::before{content:'';position:absolute;inset:-17px -5px -5px;box-sizing:border-box;border:20px solid transparent;border-image: url('/static/tarot/dialogue-bubble-skin.png') 150 110 110 150 fill / 45px 35px 35px 45px stretch;pointer-events:none;z-index:-1}
.flow-context-bubble{border:0;background:transparent;isolation:isolate}
.flow-reading-bubble{isolation:isolate}
.flow-dialogue-screen .flow-reading-bubble .flow-copy{position:relative;inset:auto;width:100%;height:100%;border:0;border-radius:17px;background:transparent;padding:3% 4%;font-size:clamp(11px,2.8vw,15px);line-height:1.45}
.flow-reading-bubble .flow-speaker{font-size:inherit;margin-bottom:1.5%;font-weight:500}
.flow-reading-intro{padding-bottom:2.5%;border:0;background:var(--dialogue-horizontal) center bottom/100% 5px no-repeat}
.flow-dialogue-screen .flow-reading-bubble .flow-section,.flow-dialogue-screen .flow-reading-bubble .flow-follow-section{gap:0;padding:1.7% 0;border-bottom:0;background:var(--dialogue-horizontal) center bottom/100% 5px no-repeat;align-items:center}
.flow-dialogue-screen .flow-reading-bubble .flow-section>view,.flow-dialogue-screen .flow-reading-bubble .flow-follow-section>view{width:25%;box-sizing:border-box;padding-right:2%;font-size:1.05em}
.flow-reading-bubble .flow-section>text,.flow-reading-bubble .flow-follow-section>text{padding-left:4%;border-left:0;background:var(--dialogue-vertical) left center/2px 100% no-repeat}
.flow-reading-question{padding-top:2.5%;text-align:center;color:var(--accent);font-size:1.05em}
.flow-love{--dialogue-horizontal:url('/static/tarot/love-dialogue-horizontal.png');--dialogue-vertical:url('/static/tarot/love-dialogue-vertical.png')}
.flow-career{--dialogue-horizontal:url('/static/tarot/career-dialogue-horizontal.png');--dialogue-vertical:url('/static/tarot/career-dialogue-vertical.png')}
.flow-wealth{--dialogue-horizontal:url('/static/tarot/wealth-dialogue-horizontal.png');--dialogue-vertical:url('/static/tarot/wealth-dialogue-vertical.png')}
.flow-dialogue-screen{--dialogue-canvas-width:min(100vw,520px,calc((100dvh - var(--dialogue-top-space) - env(safe-area-inset-bottom,0px) - 12px)*941/1672));height:100dvh}
.flow-dialogue-screen .flow-canvas{overflow:visible}
.flow-dialogue-screen .flow-reading-bubble{height:calc(100dvh - var(--dialogue-top-space) - var(--dialogue-canvas-width)*610/941 - env(safe-area-inset-bottom,0px) - 124px)!important}
.flow-dialogue-footer{position:absolute;z-index:5;left:3%;right:3%;bottom:calc(12px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:10px}
.flow-footer-suggestions{display:flex;gap:10px;padding:0 3%}
.flow-dialogue-screen .flow-footer-suggestions .flow-chip{position:relative;flex:1;min-width:0;height:30px}
.flow-dialogue-footer .flow-chat-bar{position:relative;width:100%;height:52px}
</style>
