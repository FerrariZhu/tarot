<template>
  <view class="scene-page">
    <image class="scene-bg" :src="ui('background/home')" mode="aspectFill" />
    <view class="brand" aria-label="解忧小卖部">
      <image :src="ui('home/brand')" mode="aspectFit" />
      <text>聊一聊，慢一点，好一点</text>
    </view>
    <view class="choice-area">
      <view class="question">今天想聊聊什么？</view>
      <view class="theme-grid">
        <view v-for="item in themes" :key="item" class="theme-card" :class="themeKey[item]" :aria-label="`进入${item}主题`" @tap="openTheme(item)">
          <image class="card-art" :src="ui(`home/${themeKey[item]}-art`)" mode="aspectFill" />
          <text class="card-title">{{ item }}</text>
          <image class="card-arrow" :src="ui(`icons/arrow-${themeKey[item]}`)" mode="aspectFit" />
        </view>
      </view>
    </view>
    <BottomNav active="home" />
  </view>
</template>
<script setup lang="ts">
import BottomNav from '@/components/BottomNav.vue'
import { themes, themeKey, ui, type ThemeName } from '@/theme'
function openTheme(item: ThemeName) { uni.navigateTo({ url: `/subpages/theme/index?theme=${item}` }) }
</script>
<style scoped>
.scene-page { height: 100vh; min-height: 560px; position: relative; overflow: hidden; background: #041b41; }
.scene-bg { position: absolute; inset: 0; width: 100%; height: 100%; }
.brand { position: absolute; top: calc(9% + env(safe-area-inset-top) / 2); left: 20%; width: 60%; display: flex; flex-direction: column; align-items: center; color: #f7f5ee; white-space: nowrap; }
.brand image { width: 100%; height: 100rpx; }
.brand text { font-family: "Noto Serif SC", "Songti SC", SimSun, serif; font-size: 22rpx; font-weight: 400; letter-spacing: 6rpx; }
.choice-area { position: absolute; left: 3.2%; right: 3.2%; bottom: calc(170rpx + env(safe-area-inset-bottom)); }
.question { display: flex; align-items: center; justify-content: center; gap: 20rpx; text-align: center; font-family: "Noto Serif SC", "Songti SC", SimSun, serif; font-weight: 700; font-size: 43rpx; letter-spacing: 6rpx; margin-bottom: 18rpx; text-shadow: 0 2rpx 12rpx #071631; }
.question::before,.question::after { content: ""; flex: none; width: 28rpx; height: 1rpx; background: #b89976; }
.theme-grid { display: flex; gap: 12rpx; }
.theme-card { position: relative; flex: 1; min-width: 0; height: min(32vh, 315rpx); border-radius: 17rpx; overflow: hidden; border: 2rpx solid #ec709a; background: #082a57; transition: transform 150ms; }
.theme-card:active { transform: scale(.985); }
.theme-card.career { border-color: #6daff3; }.theme-card.wealth { border-color: #f9ba3e; }
.card-art { width: 100%; height: 100%; }
.card-title { position: absolute; top: 12rpx; left: 12rpx; color: #fff; font-family: "Noto Serif SC", "Songti SC", SimSun, serif; font-size: 39rpx; font-weight: 700; letter-spacing: 3rpx; text-shadow: 1rpx 2rpx 5rpx #001026; }
.card-arrow { position: absolute; bottom: 9rpx; right: 9rpx; width: 48rpx; height: 48rpx; pointer-events: none; }
</style>
