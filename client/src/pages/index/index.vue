<template>
  <view class="page">
    <view class="bg-decor">
      <view class="blob blob-1" />
      <view class="blob blob-2" />
      <view class="blob blob-3" />
    </view>

    <view class="content">
      <!-- Hero -->
      <view class="hero glass-card">
        <view class="hero-top">
          <view class="avatar">
            <text class="avatar-text">{{ avatarLetter }}</text>
          </view>
          <view class="status-badge">
            <view class="status-dot" />
            <text class="status-text">已登录</text>
          </view>
        </view>
        <text class="greeting">{{ greetingText }}</text>
        <text class="welcome-name">{{ displayName }}</text>
        <text class="welcome-desc">欢迎回来，今天也要加油</text>
      </view>

      <!-- Quick stats -->
      <view class="stats-row">
        <view class="stat-card glass-card">
          <view class="stat-icon platform-icon" />
          <text class="stat-label">运行平台</text>
          <text class="stat-value">{{ platformLabel }}</text>
        </view>
        <view class="stat-card glass-card">
          <view class="stat-icon account-icon" />
          <text class="stat-label">账号</text>
          <text class="stat-value stat-value-sm">{{ userStore.userInfo?.account || '-' }}</text>
        </view>
      </view>

      <!-- Quick actions -->
      <view class="section">
        <text class="section-title">快捷入口</text>
        <view class="action-grid">
          <view
            v-for="item in quickActions"
            :key="item.id"
            class="action-item glass-card"
            hover-class="action-hover"
            @click="onActionTap(item.id)"
          >
            <view class="action-icon" :class="item.iconClass" />
            <text class="action-label">{{ item.label }}</text>
            <text class="action-desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>

      <!-- Account info -->
      <view class="section">
        <text class="section-title">账号信息</text>
        <view class="info-card glass-card">
          <view class="info-row">
            <text class="info-key">用户 ID</text>
            <text class="info-val">{{ userStore.userInfo?.id || '-' }}</text>
          </view>
          <view class="info-divider" />
          <view class="info-row">
            <text class="info-key">昵称</text>
            <text class="info-val">{{ userStore.userInfo?.nickname || '未设置' }}</text>
          </view>
          <view class="info-divider" />
          <view class="info-row">
            <text class="info-key">登录账号</text>
            <text class="info-val">{{ userStore.userInfo?.account || '-' }}</text>
          </view>
        </view>
      </view>

      <button class="btn logout" hover-class="logout-hover" @click="onLogout">
        退出登录
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { consumeAuthJustReady } from '@/utils/auth-session'
import { getToken } from '@/utils/storage'
import { getPlatformKind } from '@/utils/platform'

const userStore = useUserStore()

const displayName = computed(
  () => userStore.userInfo?.nickname || userStore.userInfo?.account || '用户'
)

const avatarLetter = computed(() => {
  const name = displayName.value
  return name.charAt(0).toUpperCase()
})

const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const platformLabels: Record<string, string> = {
  h5: 'H5 网页',
  'mp-weixin': '微信小程序',
  'app-plus': 'Android / iOS',
  'app-harmony': '鸿蒙 App',
  other: '其他平台',
}

const platformLabel = computed(
  () => platformLabels[getPlatformKind()] || getPlatformKind()
)

const quickActions = [
  {
    id: 'profile',
    label: '个人资料',
    desc: '查看账号详情',
    iconClass: 'icon-profile',
  },
  {
    id: 'security',
    label: '账号安全',
    desc: '密码与登录保护',
    iconClass: 'icon-security',
  },
  {
    id: 'platform',
    label: '多端同步',
    desc: '跨平台一致体验',
    iconClass: 'icon-sync',
  },
  {
    id: 'help',
    label: '帮助中心',
    desc: '常见问题解答',
    iconClass: 'icon-help',
  },
]

onShow(() => {
  if (consumeAuthJustReady()) {
    userStore.hydrateFromStorage()
    return
  }
  userStore.hydrateFromStorage()
  if (!getToken()) {
    uni.reLaunch({ url: '/pages/login/login' })
  }
})

function onActionTap(id: string) {
  const messages: Record<string, string> = {
    profile: '个人资料功能即将上线',
    security: '账号安全功能即将上线',
    platform: `当前运行于 ${platformLabel.value}`,
    help: '如有问题请联系管理员',
  }
  uni.showToast({
    title: messages[id] || '功能即将上线',
    icon: 'none',
    duration: 2000,
  })
}

function onLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    confirmColor: '#6366F1',
    success: (res) => {
      if (res.confirm) userStore.logout()
    },
  })
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.page {
  @include page-bg;
  padding: 32rpx 32rpx 64rpx;
}

.bg-decor {
  @include bg-blobs;
}

.content {
  position: relative;
  z-index: 1;
}

.glass-card {
  @include glass-card;
}

/* Hero */
.hero {
  padding: 40rpx 36rpx 44rpx;
  margin-bottom: 28rpx;
}

.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, $color-primary 0%, $color-primary-light 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(99, 102, 241, 0.3);
}

.avatar-text {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 10rpx 20rpx;
  background: rgba(16, 185, 129, 0.1);
  border: 1rpx solid rgba(16, 185, 129, 0.25);
  border-radius: 999rpx;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: $color-cta;
}

.status-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #059669;
}

.greeting {
  display: block;
  font-size: 28rpx;
  color: $color-text-muted;
  margin-bottom: 8rpx;
}

.welcome-name {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: $color-text;
  line-height: 1.3;
}

.welcome-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: $color-text-subtle;
}

/* Stats */
.stats-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 36rpx;
}

.stat-card {
  flex: 1;
  padding: 28rpx 24rpx;
  min-width: 0;
}

.stat-icon {
  width: 44rpx;
  height: 44rpx;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  position: relative;
}

.platform-icon {
  background: rgba(99, 102, 241, 0.12);
}

.platform-icon::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20rpx;
  height: 16rpx;
  border: 3rpx solid $color-primary;
  border-radius: 4rpx;
  box-sizing: border-box;
}

.account-icon {
  background: rgba(16, 185, 129, 0.12);
}

.account-icon::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  border: 3rpx solid $color-cta;
  box-sizing: border-box;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: $color-text-subtle;
  margin-bottom: 8rpx;
}

.stat-value {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-value-sm {
  font-size: 26rpx;
}

/* Section */
.section {
  margin-bottom: 32rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 20rpx;
  padding-left: 4rpx;
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.action-item {
  padding: 28rpx 24rpx;
}

.action-hover {
  opacity: 0.85;
  transform: scale(0.98);
}

.action-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 14rpx;
  margin-bottom: 16rpx;
  position: relative;
}

.icon-profile {
  background: rgba(99, 102, 241, 0.12);
}

.icon-profile::before {
  content: '';
  position: absolute;
  top: 10rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: $color-primary;
}

.icon-profile::after {
  content: '';
  position: absolute;
  bottom: 8rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 24rpx;
  height: 12rpx;
  border-radius: 12rpx 12rpx 0 0;
  background: $color-primary;
}

.icon-security {
  background: rgba(239, 68, 68, 0.1);
}

.icon-security::before {
  content: '';
  position: absolute;
  top: 10rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 16rpx;
  height: 10rpx;
  border: 3rpx solid #ef4444;
  border-bottom: none;
  border-radius: 8rpx 8rpx 0 0;
  box-sizing: border-box;
}

.icon-security::after {
  content: '';
  position: absolute;
  bottom: 8rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 22rpx;
  height: 16rpx;
  background: #ef4444;
  border-radius: 4rpx;
}

.icon-sync {
  background: rgba(16, 185, 129, 0.12);
}

.icon-sync::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 22rpx;
  height: 22rpx;
  border: 3rpx solid $color-cta;
  border-radius: 50%;
  border-top-color: transparent;
  box-sizing: border-box;
}

.icon-help {
  background: rgba(129, 140, 248, 0.15);
}

.icon-help::after {
  content: '?';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 26rpx;
  font-weight: 700;
  color: $color-primary-light;
  line-height: 1;
}

.action-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $color-text;
  margin-bottom: 6rpx;
}

.action-desc {
  display: block;
  font-size: 22rpx;
  color: $color-text-subtle;
  line-height: 1.4;
}

/* Info card */
.info-card {
  padding: 8rpx 32rpx;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 0;
  gap: 24rpx;
}

.info-key {
  flex-shrink: 0;
  font-size: 28rpx;
  color: $color-text-muted;
}

.info-val {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  font-weight: 500;
  color: $color-text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-divider {
  height: 1rpx;
  background: rgba(99, 102, 241, 0.1);
}

/* Logout */
.btn.logout {
  margin-top: 16rpx;
  height: 96rpx;
  line-height: 96rpx;
  background: rgba(255, 255, 255, 0.85);
  color: #dc2626;
  border: 1rpx solid $color-error-border;
  border-radius: $radius-md;
  font-size: 30rpx;
  font-weight: 500;
}

.logout-hover {
  background: $color-error-bg;
  opacity: 0.9;
}
</style>
