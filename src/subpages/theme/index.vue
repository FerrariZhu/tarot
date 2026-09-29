<template>
  <view class="scene-page">
    <image class="scene-bg" :src="themeUi(`background/${key}`)" mode="aspectFill" />
    <view class="title">{{ theme }}</view>
    <view class="checkin" @tap="checkIn" :aria-label="checkedToday ? '今日已打卡' : '今日打卡'">
      <image class="panel-bg" :src="themeUi(`panels/${key}-checkin`)" mode="scaleToFill" />
      <view class="checkin-inner">
        <view class="checkin-title">今日打卡</view>
        <view class="days">
          <view v-for="day in 3" :key="day" class="day">
            <image :src="themeUi(`icons/${character.checkIcon}`)" mode="aspectFit" :style="{ opacity: streak >= day ? 1 : .35 }" />
            <text>第{{ day }}天</text>
          </view>
        </view>
      </view>
    </view>
    <view class="lower">
      <view class="info" :class="key">
        <image class="panel-bg" :src="themeUi(`panels/${key}-info`)" mode="scaleToFill" :aria-label="`${character.name}，${character.line}和${character.name}聊聊`" />
        <view class="info-border" aria-hidden="true" />
      </view>
      <view class="tools">
        <view v-for="tool in toolItems" :key="tool.id" class="tool" @tap="openTool(tool.id)" :aria-label="tool.label">
          <image class="tool-art" :src="themeUi(`tools/${key}-${tool.id}`)" mode="aspectFill" />
          <view class="tool-caption">
            <image :src="themeUi(`icons/${tool.icon}`)" mode="aspectFit" />
            <text>{{ tool.label }}</text>
            <text class="next">›</text>
          </view>
        </view>
      </view>
    </view>
    <BottomNav active="home" />
  </view>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import BottomNav from '@/components/BottomNav.vue'
import { safeTheme, themeKey, themeCharacter, themeUi, type ThemeName } from '@/theme'
const theme = ref<ThemeName>('爱情')
const key = computed(() => themeKey[theme.value])
const character = computed(() => themeCharacter[theme.value])
const streak = ref(0)
const checkedToday = ref(false)
const toolItems = [{ id: 'tarot', label: '抽塔罗', icon: 'tarot' }, { id: 'divination', label: '起一卦', icon: 'bagua' }]
onLoad((query) => { theme.value = safeTheme(decodeURIComponent(String(query?.theme || '爱情'))); loadCheckin() })
function localDay(date = new Date()) { return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` }
function yesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return localDay(d) }
function loadCheckin() {
  const saved = uni.getStorageSync(`checkin-${key.value}`) || {}
  streak.value = saved.date === localDay() || saved.date === yesterday() ? Number(saved.streak) || 0 : 0
  checkedToday.value = saved.date === localDay()
}
function checkIn() {
  if (checkedToday.value) return
  const saved = uni.getStorageSync(`checkin-${key.value}`) || {}
  streak.value = saved.date === yesterday() ? (Number(saved.streak) || 0) + 1 : 1
  checkedToday.value = true
  uni.setStorageSync(`checkin-${key.value}`, { date: localDay(), streak: streak.value })
  uni.showToast({ title: '今日已打卡', icon: 'success' })
}
function openTool(id: string) {
  const path = id === 'tarot' ? '/subpages/tarot/index' : '/subpages/iching/index'
  uni.navigateTo({ url: `${path}?theme=${theme.value}` })
}
</script>
<style scoped>
.scene-page { height: 100vh; min-height: 560px; overflow: hidden; position: relative; background: #041b41; }
.scene-bg { position: absolute; inset: 0; width: 100%; height: 100%; }
.title { position: absolute; top: calc(4% + env(safe-area-inset-top)); width: 100%; text-align: center; font-size: 64rpx; line-height: 1.15; font-weight: bold; text-shadow: 0 3rpx 12rpx #041b41; }
.checkin { position: absolute; top: 25%; right: 2.5%; width: 32%; height: 11%; min-height: 105rpx; overflow: hidden; border-radius: 14rpx; }
.panel-bg { position: absolute; inset: 0; width: 100%; height: 100%; }
.checkin-inner { position: relative; height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column; }
.checkin-title { font-size: 24rpx; font-weight: bold; margin-bottom: 5rpx; }
.days { display: flex; width: 100%; justify-content: space-evenly; }
.day { display: flex; flex-direction: column; align-items: center; font-size: 14rpx; white-space: nowrap; }
.day image { width: 38rpx; height: 38rpx; }
.lower { position: absolute; left: 4.5%; right: 4.5%; bottom: calc(130rpx + env(safe-area-inset-bottom) + 4.5vh); }
.info { height: 27.9vw; position: relative; border-radius: 15rpx; overflow: hidden; }
.info.career { height: 26.4vw; }
.info.wealth { height: 27vw; }
.info-border { position: absolute; inset: 0; box-sizing: border-box; border: 1px solid #fff; border-radius: inherit; pointer-events: none; }
.tools { display: flex; gap: 16rpx; margin-top: 17rpx; }
.tool { flex: 1; min-width: 0; height: min(25vh, 245rpx); display: flex; flex-direction: column; border: 1px solid #fff; border-radius: 15rpx; overflow: hidden; background: #07234c; }
.tool:active { transform: scale(.985); }.tool-art { display: block; flex: none; width: 100%; height: 72%; }.tool-caption { box-sizing: border-box; flex: 1; min-height: 0; display: flex; align-items: center; gap: 9rpx; padding: 0 13rpx; font-size: 27rpx; font-weight: bold; }
.tool-caption image { flex: none; width: 42rpx; height: 42rpx; }.tool-caption text { line-height: 1; }.next { margin-left: auto; font-family: sans-serif; font-size: 40rpx; }
</style>
