<template>
  <view class="bottom-nav" role="navigation" aria-label="主导航">
    <view v-for="item in items" :key="item.key" class="nav-item" :class="{ active: active === item.key }" @tap="go(item.path)" :aria-label="item.label">
      <image :src="ui(`icons/nav-${item.key}-${active === item.key ? 'active' : 'idle'}`)" mode="aspectFit" class="nav-icon" />
      <text>{{ item.label }}</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ui } from '@/theme'
defineProps<{ active: 'home' | 'record' | 'profile' }>()
const items = [
  { key: 'home', label: '逛逛', path: '/pages/index/index' },
  { key: 'record', label: '记录', path: '/pages/record/index' },
  { key: 'profile', label: '我的', path: '/pages/profile/index' }
] as const
function go(path: string) { uni.reLaunch({ url: path }) }
</script>
<style scoped>
.bottom-nav { position: absolute; bottom: 0; left: 0; right: 0; height: calc(130rpx + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom); background: #041b41; border-top: 1rpx solid #58769b; display: flex; z-index: 5; }
.nav-item { position: relative; flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 4rpx; color: #f7f5ee; font-size: 21rpx; }
.nav-item.active { color: #f9ca6e; }
.nav-item.active::before { content: ""; position: absolute; top: 4rpx; left: 50%; width: 116rpx; height: 100rpx; transform: translateX(-50%); border-radius: 50%; background: radial-gradient(ellipse, rgba(255, 207, 101, .48) 0%, rgba(255, 193, 75, .2) 38%, rgba(255, 190, 67, 0) 72%); pointer-events: none; }
.nav-icon { position: relative; width: 54rpx; height: 54rpx; }
.nav-item text { position: relative; }
</style>
