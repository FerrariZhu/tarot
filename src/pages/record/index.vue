<template>
  <view class="screen">
    <view class="content">
      <view class="eyebrow">解忧小卖部</view><view class="title">记录</view>
      <view class="intro">把当时的心事和抽到的线索，留在这里慢慢看。</view>
      <view v-if="!history.length" class="empty">还没有记录。去逛逛，选一个主题开始吧。</view>
      <view v-for="(item, index) in history" :key="index" class="entry">
        <view class="entry-head"><text>{{ item.theme }} · {{ item.type === 'tarot' ? '塔罗' : '周易' }}</text><text>{{ formatTime(item.time) }}</text></view>
        <view v-if="item.question" class="question">{{ item.question }}</view>
        <view class="summary">{{ summary(item) }}</view>
      </view>
      <view v-if="history.length" class="note">记录仅保存在当前设备，清理应用数据后将无法恢复。</view>
    </view>
    <BottomNav active="record" />
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import BottomNav from '@/components/BottomNav.vue'
const history = ref<any[]>([])
onShow(() => { history.value = uni.getStorageSync('reading-history') || [] })
function formatTime(value: number) { const date = new Date(value); return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}` }
function summary(item: any) { return item.type === 'tarot' ? (item.results || []).map((card: any) => card.name).join(' · ') : item.result?.original?.fullName || '' }
</script>
<style scoped>
.screen { position: relative; min-height: 100vh; background: radial-gradient(circle at top,#153869,#041b41 60%); }.content { padding: calc(75rpx + env(safe-area-inset-top)) 34rpx calc(160rpx + env(safe-area-inset-bottom)); }.eyebrow { color: #f9ca6e; font-size: 24rpx; }.title { font-size: 60rpx; font-weight: bold; margin-top: 20rpx; }.intro { color: #d8deec; font-size: 25rpx; line-height: 1.6; margin: 20rpx 0 35rpx; }.empty,.entry { background: #0c2b59; border: 1rpx solid #53739b; border-radius: 20rpx; padding: 28rpx; margin-bottom: 18rpx; }.empty { color: #d8deec; font-size: 26rpx; line-height: 1.6; }.entry-head { display: flex; justify-content: space-between; color: #f9ca6e; font-size: 24rpx; }.question { margin-top: 18rpx; font-size: 27rpx; }.summary { margin-top: 12rpx; color: #d8deec; font-size: 24rpx; }.note { color: #aebcca; font-size: 21rpx; line-height: 1.6; margin-top: 30rpx; }
</style>
