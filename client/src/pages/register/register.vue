<template>
  <view class="page">
    <view class="bg-decor">
      <view class="blob blob-1" />
      <view class="blob blob-2" />
      <view class="blob blob-3" />
    </view>

    <view class="content">
      <view class="brand">
        <view class="logo-mark">
          <view class="logo-inner" />
        </view>
        <text class="brand-name">UI App</text>
      </view>

      <view class="header">
        <text class="title">创建账号</text>
        <text class="subtitle">注册即表示同意相关服务条款</text>
      </view>

      <view class="form">
        <view class="field">
          <text class="label">账号 / 手机号</text>
          <view class="input-wrap">
            <view class="field-icon user-icon" />
            <input
              v-model="account"
              class="input"
              type="text"
              placeholder="请输入账号"
              placeholder-class="placeholder"
              :maxlength="32"
            />
          </view>
        </view>

        <view class="field">
          <text class="label">昵称（可选）</text>
          <view class="input-wrap">
            <view class="field-icon name-icon" />
            <input
              v-model="nickname"
              class="input"
              type="text"
              placeholder="显示名称"
              placeholder-class="placeholder"
              :maxlength="20"
            />
          </view>
        </view>

        <view class="field">
          <text class="label">密码</text>
          <view class="input-wrap">
            <view class="field-icon lock-icon" />
            <input
              v-model="password"
              class="input"
              type="password"
              placeholder="6-32 位密码"
              placeholder-class="placeholder"
              :maxlength="32"
            />
          </view>
        </view>

        <view class="field">
          <text class="label">确认密码</text>
          <view class="input-wrap">
            <view class="field-icon confirm-icon" />
            <input
              v-model="confirmPassword"
              class="input"
              type="password"
              placeholder="再次输入密码"
              placeholder-class="placeholder"
              :maxlength="32"
            />
          </view>
        </view>

        <view v-if="errorMsg" class="error-box">
          <view class="error-dot" />
          <text class="error">{{ errorMsg }}</text>
        </view>

        <button
          class="btn primary"
          :loading="loading"
          :disabled="loading"
          hover-class="btn-hover"
          @click="onSubmit"
        >
          注册
        </button>

        <view class="footer-link">
          <text class="footer-text">已有账号？</text>
          <text class="link" hover-class="link-hover" @click="goLogin">立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import {
  validateAccount,
  validatePassword,
  validateConfirmPassword,
} from '@/utils/validate'
import type { RequestError } from '@/api/request'

const userStore = useUserStore()
const account = ref('')
const nickname = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')

function goLogin() {
  uni.navigateBack({
    fail: () => {
      uni.reLaunch({ url: '/pages/login/login' })
    },
  })
}

async function onSubmit() {
  errorMsg.value = ''
  const accountErr = validateAccount(account.value)
  if (accountErr) {
    errorMsg.value = accountErr
    return
  }
  const pwdErr = validatePassword(password.value)
  if (pwdErr) {
    errorMsg.value = pwdErr
    return
  }
  const confirmErr = validateConfirmPassword(password.value, confirmPassword.value)
  if (confirmErr) {
    errorMsg.value = confirmErr
    return
  }

  loading.value = true
  try {
    await userStore.register({
      account: account.value.trim(),
      password: password.value,
      nickname: nickname.value.trim() || undefined,
    })
    uni.showToast({ title: '注册成功', icon: 'success' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' })
    }, 500)
  } catch (e) {
    const err = e as RequestError
    errorMsg.value = err.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/theme.scss';

.page {
  @include auth-page;
}

.bg-decor {
  @include bg-blobs;
}

.content {
  @include auth-content;
}

.brand {
  @include auth-brand;
}

.header {
  @include auth-header;
}

.form {
  @include auth-form-card;
}

.user-icon {
  @include icon-user;
}

.name-icon {
  @include icon-name;
}

.lock-icon {
  @include icon-lock;
}

.confirm-icon {
  @include icon-confirm;
}
</style>
