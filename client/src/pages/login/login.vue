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
        <text class="title">欢迎回来</text>
        <text class="subtitle">登录账号，开启你的专属体验</text>
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
          <text class="label">密码</text>
          <view class="input-wrap">
            <view class="field-icon lock-icon" />
            <input
              v-model="password"
              class="input"
              type="password"
              placeholder="请输入密码"
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
          登录
        </button>

        <view class="footer-link">
          <text class="footer-text">还没有账号？</text>
          <text class="link" hover-class="link-hover" @click="goRegister">立即注册</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { getToken } from '@/utils/storage'
import { validateAccount, validatePassword } from '@/utils/validate'
import type { RequestError } from '@/api/request'

const userStore = useUserStore()
const account = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

function goRegister() {
  uni.navigateTo({ url: '/pages/register/register' })
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

  loading.value = true
  try {
    await userStore.login({
      account: account.value.trim(),
      password: password.value,
    })
    if (!getToken()) {
      errorMsg.value = '登录状态未保存，请重试'
      return
    }
    uni.reLaunch({ url: '/pages/index/index' })
  } catch (e) {
    const err = e as RequestError
    errorMsg.value = err.message || '登录失败'
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

.lock-icon {
  @include icon-lock;
}
</style>
