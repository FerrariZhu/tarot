<template>
  <view class="reading-page">
    <view class="eyebrow">{{ theme }} · 周易</view>
    <view class="title">三枚钱币，起一卦</view>
    <view class="intro">每次抛三枚，共抛六次。从初爻到上爻，依次由下往上记录。</view>
    <textarea v-model="question" class="question" placeholder="想想你希望整理的问题（可不填）" maxlength="300" />
    <button v-if="tosses.length < 6" class="primary" @tap="toss">抛第 {{ tosses.length + 1 }} 次钱币</button>
    <button v-else class="secondary" @tap="restart">重新起卦</button>
    <view v-for="row in rows" :key="row.position" class="coin-row">第 {{ row.position }} 爻　{{ row.coins }}　{{ row.label }}</view>
    <view v-if="result" class="interpretation">
      <view class="section-title">本卦 {{ result.original.symbol }} {{ result.original.fullName }}</view>
      <view class="paragraph">卦辞：{{ originalGuaci }}</view>
      <view class="paragraph">动爻：{{ movingLabel }}</view>
      <view v-for="(text, index) in movingTexts" :key="index" class="paragraph">{{ text }}</view>
      <view v-if="result.changed" class="section-title">变卦 {{ result.changed.symbol }} {{ result.changed.fullName }}</view>
      <view v-if="result.changed" class="paragraph">卦辞：{{ changedGuaci }}</view>
      <view v-if="!readingEndpoint" class="notice">卦象和原文已生成。白话解读将在接口配置后开放。</view>
      <view v-if="loading" class="notice">正在整理卦象的线索……</view>
      <view v-if="error" class="notice">解读暂时不可用：{{ error }}<button class="secondary" @tap="readResult">重试解读</button></view>
    </view>
    <view v-if="reading" class="interpretation"><view class="section-title">白话解读</view><view>{{ reading.summary }}</view><view v-for="(detail, i) in reading.details" :key="i" class="paragraph">{{ detail }}</view><view class="section-title">接下来可以做</view><view v-for="(action, i) in reading.actions" :key="i" class="paragraph">• {{ action }}</view><view class="small">依据：{{ reading.sourceNote }}</view></view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fromTosses } from '@/domain/iching'
import zhouyiText from '@/domain/zhouyi-text'
import { buildIChingPrompt } from '@/domain/reading'
import { requestReading } from '@/services/reading'
import { readingEndpoint } from '@/config'
import { safeTheme, type ThemeName } from '@/theme'
const theme = ref<ThemeName>('爱情')
const question = ref('')
const tosses = ref<number[][]>([])
const rows = ref<any[]>([])
const result = ref<any>(null)
const reading = ref<any>(null)
const loading = ref(false)
const error = ref('')
const originalGuaci = ref('')
const movingTexts = ref<string[]>([])
const movingLabel = ref('')
const changedGuaci = ref('')
onLoad((query) => { theme.value = safeTheme(decodeURIComponent(String(query?.theme || '爱情'))) })
function toss() {
  if (loading.value || tosses.value.length >= 6) return
  const coins = Array.from({ length: 3 }, () => Math.random() < .5 ? 2 : 3)
  tosses.value.push(coins)
  const sum = coins.reduce((a, b) => a + b, 0)
  rows.value.push({ position: tosses.value.length, coins: coins.map(coin => coin === 3 ? '正' : '背').join(' · '), label: ({ 6: '老阴（动）', 7: '少阳', 8: '少阴', 9: '老阳（动）' } as Record<number, string>)[sum] })
  if (tosses.value.length !== 6) return
  result.value = fromTosses(tosses.value)
  const original = (zhouyiText as any[])[result.value.original.number - 1]
  const changed = result.value.changed && (zhouyiText as any[])[result.value.changed.number - 1]
  originalGuaci.value = original.guaci
  movingTexts.value = result.value.movingLines.map((position: number) => original.yaoci[position - 1])
  if (result.value.movingLines.length === 6 && original.yaoci[6]) movingTexts.value.push(original.yaoci[6])
  movingLabel.value = result.value.movingLines.length ? result.value.movingLines.join('、') : '无'
  changedGuaci.value = changed ? changed.guaci : ''
  const saved = { type: 'iching', theme: theme.value, question: question.value, result: result.value, time: Date.now() }
  const history = uni.getStorageSync('reading-history') || []
  uni.setStorageSync('reading-history', [saved, ...history].slice(0, 20))
  readResult()
}
async function readResult() {
  if (!result.value || !readingEndpoint || loading.value) return
  loading.value = true; error.value = ''
  try { reading.value = await requestReading(readingEndpoint, buildIChingPrompt(result.value, question.value.trim(), theme.value)) }
  catch (e: any) { error.value = e.message || '解读接口请求失败' }
  finally { loading.value = false }
}
function restart() { tosses.value = []; rows.value = []; result.value = null; reading.value = null; error.value = ''; originalGuaci.value = ''; movingTexts.value = []; movingLabel.value = ''; changedGuaci.value = '' }
</script>
<style scoped>
.reading-page { min-height: 100vh; padding: 45rpx 32rpx calc(60rpx + env(safe-area-inset-bottom)); background: radial-gradient(circle at 50% 5%, #254369 0, #0c2546 39%, #071a35 80%); }
.eyebrow { text-align: center; color: #e6c68f; font-size: 23rpx; }.title { text-align: center; font-size: 43rpx; font-weight: bold; margin-top: 16rpx; }.intro { text-align: center; font-size: 25rpx; line-height: 1.7; color: #c6d0d8; margin: 22rpx 0 35rpx; }
.question { width: 100%; min-height: 170rpx; padding: 20rpx; border: 1rpx solid #b69772; border-radius: 12rpx; background: #102c4b; font-size: 26rpx; margin-bottom: 25rpx; }
.primary,.secondary { border-radius: 45rpx; font-size: 27rpx; font-weight: bold; }.primary { background: linear-gradient(110deg,#d7af75,#edcd97); color: #0b2343; }.secondary { background: #102c4b; color: #f7f5ee; border: 1rpx solid #b69772; }
.coin-row { padding: 18rpx 20rpx; border-bottom: 1rpx solid #58769b; font-size: 25rpx; }.coin-row:first-of-type { margin-top: 25rpx; }
.interpretation { margin-top: 28rpx; padding: 23rpx; background: #102c4b; border-radius: 16rpx; line-height: 1.7; }.section-title { color: #f1d39c; font-size: 30rpx; font-weight: bold; margin: 20rpx 0; }.paragraph,.notice { font-size: 25rpx; color: #d8deec; margin: 18rpx 0; }.notice { padding: 20rpx; background: #0c2546; border-radius: 12rpx; }.small { font-size: 21rpx; color: #aebcca; }
</style>
