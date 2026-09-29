<template>
  <view class="screen">
    <view class="content">
      <view class="eyebrow">解忧小卖部</view><view class="title">我的</view>
      <view class="panel"><view class="panel-title">慢一点，好一点</view><view class="paragraph">这里的塔罗和卦象帮助你整理思路，不替你作决定。</view></view>
      <view class="panel"><view class="panel-title">当前版本</view><view class="paragraph">爱情、事业、财富三个主题，支持塔罗三张牌和周易三枚钱币起卦。</view><view class="paragraph">打卡和解读记录保存在当前设备。</view></view>
    </view>
    <BottomNav active="profile" />
  </view>
</template>
<script setup lang="ts">
import BottomNav from '@/components/BottomNav.vue'
</script>
<style scoped>
.screen { position: relative; min-height: 100vh; background: radial-gradient(circle at top,#153869,#041b41 60%); }.content { padding: calc(75rpx + env(safe-area-inset-top)) 34rpx calc(160rpx + env(safe-area-inset-bottom)); }.eyebrow { color: #f9ca6e; font-size: 24rpx; }.title { font-size: 60rpx; font-weight: bold; margin: 20rpx 0 35rpx; }.panel { background: #0c2b59; border: 1rpx solid #53739b; border-radius: 20rpx; padding: 30rpx; margin-bottom: 20rpx; }.panel-title { color: #f9ca6e; font-size: 29rpx; margin-bottom: 14rpx; }.paragraph { color: #d8deec; font-size: 25rpx; line-height: 1.7; margin: 10rpx 0; }
</style>
