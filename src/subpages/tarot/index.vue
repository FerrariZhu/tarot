<template>
  <TarotStage
    :theme="theme" :step="step" :question="question" :reversals="reversals"
    :deck="deck" :chosen="chosen" :results="results" :context="context"
    :sections="sections" :source-note="sourceNote" :draft="draft"
    :followup-question="followupQuestion" :followup-answer="followupAnswer"
    :error="error" :opening="opening" :context-question="contextQuestion"
    :options="options" :suggestions="suggestions"
    @back="goBack" @restart="restart" @start="start" @choose="choose"
    @select-context="selectContext" @ask="ask" @retry="loadReading"
    @update:question="question=$event" @update:reversals="reversals=$event"
    @update:draft="draft=$event"
  />
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import TarotStage from './TarotStage.vue'
import { onLoad } from '@dcloudio/uni-app'
import { byId } from '@/domain/tarot'
import { readingDeck } from '@/domain/draw'
import { requestReading } from '@/services/reading'
import { readingEndpoint } from '@/config'
import { safeTheme, themeCharacter, cardImage, type ThemeName } from '@/theme'
type Step='intro'|'select'|'loading'|'context'|'reading'|'followup'
type Pick={id:string;reversed:boolean;selected?:boolean;position?:string}
type Result=Pick&{name:string;image:string;keyword:string;reading:string}
type Section={title:string;body:string}
const positions=['现状','阻碍','建议']
const contexts:Record<ThemeName,string[]>={爱情:['目前单身','正在暧昧','稳定关系'],事业:['正在工作','正在求职','正在创业'],财富:['日常收支','储蓄目标','经营副业']}
const contextQuestions:Record<ThemeName,string>={爱情:'你现在更接近哪种感情状态？',事业:'你现在更接近哪种事业状态？',财富:'你现在更想聊哪方面的财务处境？'}
const theme=ref<ThemeName>('爱情'),step=ref<Step>('intro'),question=ref(''),reversals=ref(true)
const deck=ref<Pick[]>([]),chosen=ref<Pick[]>([]),results=ref<Result[]>([])
const context=ref(''),sections=ref<Section[]>([]),sourceNote=ref('依据牌面关键词整理；请结合自己的情况判断。')
const draft=ref(''),followupQuestion=ref(''),followupAnswer=ref(''),error=ref(''),readingId=ref(0)
const guide=computed(()=>themeCharacter[theme.value].name)
const options=computed(()=>contexts[theme.value]),contextQuestion=computed(()=>contextQuestions[theme.value])
const opening=computed(()=>results.value.length===3?`这组三张牌在提醒你：${results.value[0].name}带来「${results.value[0].keyword}」的线索，${results.value[1].name}提醒留意「${results.value[1].keyword}」。先别急着下定论。`:'')
const suggestions=computed(()=>theme.value==='爱情'?['如何开口？','对方态度冷淡，我该主动吗？','我该继续等待吗？']:theme.value==='事业'?['怎样迈出下一步？','这份工作值得继续吗？','我该先准备什么？']:['我该先管哪笔支出？','如何开始储蓄？','现在适合尝试副业吗？'])
function goBack(){uni.navigateBack()}
function persist(){
 if(results.value.length!==3)return
 const saved={type:'tarot',id:readingId.value,theme:theme.value,question:question.value,reversals:reversals.value,results:results.value,context:context.value,sections:sections.value,sourceNote:sourceNote.value,followupQuestion:followupQuestion.value,followupAnswer:followupAnswer.value,step:step.value,time:readingId.value}
 uni.setStorageSync('tarot-active-'+theme.value,saved)
 const history=(uni.getStorageSync('reading-history')||[]) as any[]
 uni.setStorageSync('reading-history',[saved,...history.filter(item=>item.id!==saved.id)].slice(0,20))
}
onLoad(query=>{
 theme.value=safeTheme(decodeURIComponent(String(query?.theme||'爱情')))
 const saved=uni.getStorageSync('tarot-active-'+theme.value)
 if(saved?.results?.length===3){
  readingId.value=saved.id||saved.time||Date.now();question.value=saved.question||'';reversals.value=!!saved.reversals;results.value=saved.results.map((item:Result)=>({...item,image:cardImage(item.id)}))
  context.value=saved.context||'';sections.value=saved.sections||[];sourceNote.value=saved.sourceNote||sourceNote.value
  followupQuestion.value=saved.followupQuestion||'';followupAnswer.value=saved.followupAnswer||''
  step.value=context.value?(followupQuestion.value?'followup':'reading'):'context'
  if(context.value&&!sections.value.length){sections.value=localSections();loadReading()}
 }
})
function start(){deck.value=readingDeck({reversals:reversals.value});chosen.value=[];results.value=[];step.value='select'}
function choose(index:number){
 if(step.value!=='select'||deck.value[index]?.selected||chosen.value.length>=3)return
 const item=deck.value[index];deck.value[index]={...item,selected:true};chosen.value=[...chosen.value,{id:item.id,reversed:item.reversed,position:positions[chosen.value.length]}]
 if(chosen.value.length===3){
  results.value=chosen.value.map(pick=>{const card=(byId as Record<string,any>)[pick.id];return {...pick,name:card.name,image:cardImage(pick.id),keyword:card.keyword,reading:pick.reversed?card.reversedMeaning:card.meaning}})
  readingId.value=Date.now();step.value='loading';persist()
  setTimeout(()=>{if(step.value==='loading'){step.value='context';persist()}},1100)
 }
}
function selectContext(value:string){context.value=value;step.value='reading';sections.value=localSections();persist();loadReading()}
function localSections():Section[]{
 const [now,obstacle,advice]=results.value,situation=context.value==='暂不选择'?'此刻的处境':context.value
 return [
  {title:'当前',body:`关于${situation}，${now.name}${now.reversed?'逆位':'正位'}提示：${now.reading}`},
  {title:'阻碍',body:`${obstacle.name}${obstacle.reversed?'逆位':'正位'}让你留意「${obstacle.keyword}」。${obstacle.reading}`},
  {title:'组合线索',body:`从「${now.keyword}」走向「${advice.keyword}」，中间需要看清「${obstacle.keyword}」所指的难处。三张牌是整理思路的线索，不替你做决定。`},
  {title:'给你的建议',body:advice.reading},
  {title:'今天的一小步',body:`写下你最在意的一个问题，从「${advice.keyword}」出发，选一件今天能完成的小事。`}
 ]
}
async function loadReading(){
 if(!readingEndpoint||!context.value||results.value.length!==3)return
 error.value=''
 try{
  const cards=results.value.map(item=>`${item.position}：${item.name}${item.reversed?'逆位':'正位'}；关键词${item.keyword}；参考牌义${item.reading}`).join('\n')
  const response=await requestReading(readingEndpoint,{system:'你是解忧小卖部的塔罗对话助手。塔罗用于自我反思，不作确定性预测。根据三张固定牌和用户处境，以温和、具体的中文回答。summary写当前，details依次写阻碍、组合线索、给你的建议，actions第一项写今天的一小步。不要重新抽牌。',user:`主题：${theme.value}\n问题：${question.value||'未填写'}\n处境：${context.value}\n${cards}`})
  const fallback=localSections();sections.value=[{title:'当前',body:response.summary},{title:'阻碍',body:response.details[0]||fallback[1].body},{title:'组合线索',body:response.details[1]||fallback[2].body},{title:'给你的建议',body:response.details[2]||fallback[3].body},{title:'今天的一小步',body:response.actions[0]||fallback[4].body}]
  sourceNote.value=response.sourceNote||sourceNote.value;persist()
 }catch(cause:any){error.value='在线解读暂不可用，已显示本地牌义。'+(cause?.message||'')}
}
async function ask(value:string){
 const message=value.trim();if(!message||!context.value)return
 draft.value='';followupQuestion.value=message;step.value='followup'
 const advice=results.value[2];followupAnswer.value=`你问到「${message}」。这组三张牌里，${advice.name}的建议是：${advice.reading}你可以先把想说的话或要做的事缩成一步，观察真实反应，再决定下一步。`;persist()
 if(!readingEndpoint)return
 try{
  const response=await requestReading(readingEndpoint,{system:'你是解忧小卖部的塔罗对话助手。沿用原有三张牌和既有对话，用温和、具体的中文回答追问。不要重新抽牌，不作确定性预测。',user:`主题：${theme.value}\n原问题：${question.value||'未填写'}\n处境：${context.value}\n三张牌：${results.value.map(item=>`${item.position}${item.name}${item.reversed?'逆位':'正位'}`).join('、')}\n追问：${message}`})
  if(followupQuestion.value===message){followupAnswer.value=[response.summary,...response.details].filter(Boolean).join('\n');persist()}
 }catch(cause:any){error.value='在线追问暂不可用，已显示本地牌义。'+(cause?.message||'')}
}
function restart(){uni.showModal({title:'开始新的一轮？',content:'当前牌阵已保存在记录中。确认后重新洗牌。',success:({confirm})=>{if(!confirm)return;uni.removeStorageSync('tarot-active-'+theme.value);step.value='intro';question.value='';deck.value=[];chosen.value=[];results.value=[];context.value='';sections.value=[];followupQuestion.value='';followupAnswer.value='';error.value=''}})}
</script>
