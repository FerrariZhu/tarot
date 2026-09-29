<template>
  <view class="flow-screen" :class="'flow-'+themeKey[theme]">
    <view class="flow-canvas">
      <image class="flow-background" :src="asset('scene')" mode="scaleToFill"/>
      <image class="flow-background flow-overlay" :src="asset(stage+'-overlay')" mode="scaleToFill"/>
      <view class="flow-hit" :style="at('back-icon')" @tap="emit('back')"/>
      <view class="flow-restart" @tap="emit('restart')">↻</view>

      <view class="flow-title" :style="at('title')">{{ heading }}</view>
      <view v-if="step==='intro'" class="flow-subtitle" :style="at('subtitle')">把此刻的心事交给三张牌</view>
      <template v-if="step==='intro'">
        <template v-for="(position,index) in positions" :key="position">
          <view class="flow-card-back" :style="at('back-'+index)"><image :src="back" mode="aspectFill"/></view>
          <view class="flow-label" :style="at('slot-label-'+index)">✦ {{position}} ✦</view>
        </template>
        <view class="flow-question" :style="at('optional-question')"><text>✎</text><input :value="question" maxlength="80" placeholder="想聊的事（选填）" placeholder-class="flow-placeholder" @input="emit('update:question',($event as any).detail.value)"/></view>
        <view class="flow-reverse" :style="rect([587,1397,285,39])" @tap="emit('update:reversals',!reversals)">{{reversals?'☑':'□'}} 纳入逆位</view>
        <view class="flow-button-text" :style="at('start-button')" @tap="emit('start')">开始洗牌</view>
      </template>

      <template v-else-if="step==='select'">
        <view class="flow-subtitle" :style="at('select-title')">请选择第 {{chosen.length+1}} 张牌</view>
        <view class="flow-progress" :style="at('progress')">· 已选 {{chosen.length}} / 3 ·</view>
        <scroll-view scroll-x class="flow-fan" :style="at('card-fan')" :show-scrollbar="false"><view class="flow-fan-inner"><view v-for="(card,index) in deck" :key="card.id" class="flow-fan-card" :class="{selected:card.selected}" @tap="emit('choose',index)"><image :src="back" mode="aspectFill"/></view></view></scroll-view>
        <template v-for="(position,index) in positions" :key="position">
          <view v-if="chosen[index]" class="flow-card-back" :style="rect([62+284*index,945,248,370])"><image :src="back" mode="aspectFill"/></view>
          <view class="flow-label" :style="at('slot-label-'+index)">✦ {{position}} ✦</view>
        </template>
        <view class="flow-hint" :style="at('swipe-hint')">↔ 左右滑动牌阵，轻点选牌</view>
      </template>

      <template v-else>
        <view v-for="(card,index) in results" :key="card.id" class="flow-face" :style="at('card-'+(index+1))">
          <view class="flow-face-art"><image :src="card.image" :class="{reversed:card.reversed}" mode="aspectFill"/></view>
          <view class="flow-face-caption">{{positions[index]}}<text v-if="step!=='context'"> · {{card.name}}</text><text v-if="step==='loading'"> · {{card.reversed?'逆位':'正位'}}</text></view>
        </view>
        <template v-if="step==='loading'">
          <view class="flow-loading-title" :style="at('loading-title')">正在解读你的牌阵…</view>
          <view class="flow-loading-caption" :style="at('loading-caption')">{{guide}}把三张牌连起来看</view>
          <view class="flow-dots" :style="at('loading-dots')">● ● ●</view>
        </template>
        <template v-else-if="step==='context'">
          <view class="flow-subtitle" :style="at('guide-subtitle')">{{guide}}与你一起看</view>
          <view class="flow-context-text" :style="at('intro-text')">{{opening}}</view>
          <view class="flow-context-text" :style="at('question-text')">{{contextQuestion}}</view>
          <view v-for="(option,index) in options" :key="option" class="flow-choice" :style="at('choice-bg-'+index)" @tap="emit('select-context',option)">{{option}}</view>
          <view class="flow-skip" :style="at('skip')" @tap="emit('select-context','暂不选择')">暂不选择</view>
        </template>
        <template v-else-if="step==='reading'">
          <view class="flow-subtitle" :style="at('guide-subtitle')">{{guide}}与你一起看</view>
          <view class="flow-user-text" :style="at('user-choice')">{{context==='暂不选择'?'暂不选择':'我'+context}}</view>
          <scroll-view scroll-y class="flow-copy" :style="at('reading-copy')">
            <view class="flow-speaker">{{guide}}</view>
            <view v-for="section in sections" :key="section.title" class="flow-section"><view>{{section.title}}</view><text>{{section.body}}</text></view>
            <view class="flow-source">{{sourceNote}}</view>
          </scroll-view>
          <view v-if="error" class="flow-error" :style="rect([65,1380,790,65])" @tap="emit('retry')">{{error}}　重试</view>
        </template>
        <template v-else-if="step==='followup'">
          <view class="flow-user-text" :style="at('follow-question')">{{followupQuestion}}</view>
          <scroll-view scroll-y class="flow-copy flow-follow-copy" :style="at('follow-copy')">
            <view class="flow-speaker">{{guide}}</view>
            <view class="flow-answer-intro">{{followupAnswer}}</view>
            <view v-for="item in followupBlocks" :key="item.title" class="flow-follow-section"><view>{{item.title}}</view><text>{{item.body}}</text></view>
          </scroll-view>
        </template>
        <template v-if="step==='context'||step==='reading'||step==='followup'">
          <template v-if="step!=='context'"><view v-for="(item,index) in suggestions.slice(0,2)" :key="item" class="flow-chip" :style="at('follow-chip-'+index)" @tap="emit('ask',item)">{{item}}</view></template>
          <input class="flow-input" :style="at('chat-placeholder')" :value="draft" maxlength="100" :disabled="step==='context'" :placeholder="step==='context'?'选择后，可以继续提问':'继续问'+guide+'…'" placeholder-class="flow-placeholder" @input="emit('update:draft',($event as any).detail.value)" @confirm="emit('ask',draft)"/>
          <view class="flow-hit" :style="at('send-icon')" @tap="emit('ask',draft)"/>
        </template>
      </template>
    </view>
  </view>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ThemeName } from '@/theme'
import { themeKey, cardImage, themeCharacter } from '@/theme'
import flowLayout from './flow-layout.json'
type Step='intro'|'select'|'loading'|'context'|'reading'|'followup'
const props=defineProps<{theme:ThemeName;step:Step;question:string;reversals:boolean;deck:any[];chosen:any[];results:any[];context:string;sections:any[];sourceNote:string;draft:string;followupQuestion:string;followupAnswer:string;error:string;opening:string;contextQuestion:string;options:string[];suggestions:string[]}>()
const emit=defineEmits(['back','restart','start','choose','select-context','ask','retry','update:question','update:reversals','update:draft'])
const positions=['现状','阻碍','建议']
const stage=computed(()=>({intro:'entry',select:'selection',loading:'loading',context:'context',reading:'reading',followup:'followup'} as Record<Step,string>)[props.step])
const guide=computed(()=>themeCharacter[props.theme].name)
const heading=computed(()=>props.step==='intro'||props.step==='select'?props.theme+' · 抽塔罗':props.step==='loading'?'你的三张牌':props.step==='followup'?'继续聊聊':props.theme+'解读')
const back=computed(()=>cardImage('back-'+themeKey[props.theme]))
const followupBlocks=computed(()=>props.theme==='爱情'?[{title:'先看事实',body:'先区分你知道的事和自己的猜测，再决定要表达什么。'},{title:'轻轻表达',body:props.results[2]?.reading||'用清楚而温和的话说出你的感受。'},{title:'留意回应',body:'给彼此一点空间，观察真实回应，而不是反复猜测。'}]:props.theme==='事业'?[{title:'先准备',body:'把你最在意的问题写清楚，选一个能验证的行动。'},{title:'行动当下',body:props.results[2]?.reading||'保持自己的节奏。'},{title:'行动之后',body:'记录结果，再决定下一次调整的方向。'}]:[{title:'先整理',body:'把最近的收支和想法分别记下来。'},{title:'尝试一步',body:props.results[2]?.reading||'从负担得起的一步开始。'},{title:'再看结果',body:'观察实际变化，按自己的承受范围调整。'}])
function asset(piece:string){return '/static/tarot/'+themeKey[props.theme]+'-'+piece+'.webp'}
function rect(r:number[]){return {left:r[0]/941*100+'%',top:r[1]/1672*100+'%',width:r[2]/941*100+'%',height:r[3]/1672*100+'%'}}
function at(id:string){const map=(flowLayout as any)[themeKey[props.theme]]?.[stage.value]||{};return rect(map[id]||[0,0,0,0])}
</script>
<style scoped>
.flow-screen{--accent:#f8abbc;min-height:100vh;background:#05152e;color:#fff6e8}.flow-career{--accent:#f7d675}.flow-wealth{--accent:#f4d281}.flow-canvas{position:relative;width:100%;max-width:520px;height:100vh;min-height:680px;margin:0 auto;overflow:hidden;font-family:serif}.flow-background{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.flow-overlay{z-index:1}.flow-hit{position:absolute;z-index:10}.flow-restart{position:absolute;z-index:10;top:2%;right:3%;font-size:22px;color:#fce9bd;text-shadow:0 2px 5px #021126}.flow-title,.flow-subtitle,.flow-label,.flow-progress,.flow-hint,.flow-loading-title,.flow-loading-caption,.flow-dots,.flow-button-text,.flow-context-text,.flow-choice,.flow-skip,.flow-user-text,.flow-chip{position:absolute;z-index:3;display:flex;align-items:center;justify-content:center;box-sizing:border-box;text-align:center;text-shadow:0 2px 5px #020e27}.flow-title{font-size:clamp(23px,5.4vw,33px);letter-spacing:.13em;color:#fff9f4}.flow-subtitle{font-size:clamp(12px,2.9vw,18px);color:#f5e9dd}.flow-label{font-size:clamp(11px,2.7vw,17px)}.flow-card-back,.flow-face{position:absolute;z-index:3}.flow-card-back{overflow:hidden;border-radius:5%}.flow-card-back image{width:100%;height:100%}.flow-question{position:absolute;z-index:3;display:flex;align-items:center;gap:8px;box-sizing:border-box;padding:0 4%;border:1px solid #d9b5b8;border-radius:11px;background:rgba(12,38,73,.78);font-size:clamp(12px,2.8vw,16px)}.flow-question input{flex:1;font-size:inherit}.flow-placeholder{color:#b7c5da}.flow-reverse{position:absolute;z-index:4;font-size:clamp(10px,2.2vw,13px);color:#f7d8d3;text-align:right}.flow-button-text{font-size:clamp(20px,4.5vw,28px);color:#3d2030}.flow-career .flow-button-text,.flow-wealth .flow-button-text{color:#3b2d16}.flow-progress{font-size:clamp(12px,2.8vw,16px);color:var(--accent)}.flow-fan{position:absolute;z-index:4;white-space:nowrap}.flow-fan-inner{height:100%;display:flex;align-items:flex-end;width:max-content;padding:0 2%}.flow-fan-card{width:13vw;max-width:68px;height:78%;flex:none;margin-right:-7vw;overflow:hidden;border-radius:7px;box-shadow:0 2px 8px #020b19;transition:transform .2s}.flow-fan-card:nth-child(3n+1){transform:rotate(-7deg) translateY(4%)}.flow-fan-card:nth-child(3n+2){transform:rotate(2deg)}.flow-fan-card:nth-child(3n){transform:rotate(7deg) translateY(3%)}.flow-fan-card.selected{opacity:.2;transform:translateY(-10%);pointer-events:none}.flow-fan-card image{width:100%;height:100%}.flow-hint{font-size:clamp(11px,2.7vw,16px);color:#eee0d2}.flow-face{display:flex;flex-direction:column;align-items:stretch;border:1px solid #dfa7ae;border-radius:8px;background:#082244;overflow:hidden;box-shadow:0 5px 14px #020e20}.flow-face-art{height:79%;overflow:hidden}.flow-face-art image{width:100%;height:100%}.flow-face-art image.reversed{transform:rotate(180deg)}.flow-face-caption{height:21%;display:flex;align-items:center;justify-content:center;color:#fff1d9;font-size:clamp(9px,2.1vw,13px);line-height:1.1;white-space:nowrap}.flow-loading-title{font-size:clamp(18px,4vw,26px)}.flow-loading-caption{font-size:clamp(11px,2.7vw,16px)}.flow-dots{color:var(--accent);font-size:clamp(11px,2.4vw,15px)}.flow-context-text{justify-content:flex-start;text-align:left;padding:0 2%;font-size:clamp(11px,2.6vw,16px);line-height:1.5;overflow:hidden}.flow-choice{font-size:clamp(17px,3.7vw,24px);letter-spacing:.13em}.flow-skip{font-size:clamp(11px,2.7vw,15px);color:var(--accent)}.flow-user-text{font-size:clamp(11px,2.7vw,16px);color:#4e3142;padding:0 3%;overflow:hidden}.flow-copy{position:absolute;z-index:3;box-sizing:border-box;overflow-y:auto;padding:1% 2%;font-family:serif;font-size:clamp(11px,2.5vw,15px);line-height:1.46;color:#f6efe6}.flow-speaker{color:var(--accent);font-size:clamp(13px,3vw,18px);margin-bottom:6px}.flow-section,.flow-follow-section{display:flex;gap:3%;padding:2.3% 0;border-bottom:1px solid #a68086}.flow-section>view,.flow-follow-section>view{color:var(--accent);font-weight:bold;width:22%;flex:none}.flow-section>text,.flow-follow-section>text{flex:1}.flow-source{font-size:clamp(9px,2vw,12px);text-align:center;color:#d7c5c9;margin-top:3%}.flow-answer-intro,.flow-answer-extra{padding:2% 0;border-bottom:1px solid #a68086}.flow-answer-extra{color:#eadfdf}.flow-chip{font-size:clamp(10px,2.3vw,14px);color:#fff0dd;white-space:nowrap;overflow:hidden}.flow-input{position:absolute;z-index:4;box-sizing:border-box;padding:0 1%;font-size:clamp(11px,2.7vw,16px);color:#fff5ec}.flow-error{position:absolute;z-index:4;color:#ffb6bd;font-size:11px}
.flow-face-caption{white-space:normal;font-size:clamp(8px,1.85vw,11px);padding:0 2px}
</style>
