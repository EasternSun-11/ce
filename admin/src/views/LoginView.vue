<template>
  <div class="page">
    <div class="card">
      <h1 class="title">管理后台登录</h1>
      <p class="subtitle">请使用管理员账号登录</p>

      <form @submit.prevent="onSubmit">
        <div class="field">
          <label class="label" for="username">账号</label>
          <input
            id="username"
            v-model="username"
            class="input"
            type="text"
            autocomplete="username"
            placeholder="admin"
          />
        </div>

        <div class="field">
          <label class="label" for="password">密码</label>
          <input
            id="password"
            v-model="password"
            class="input"
            type="password"
            autocomplete="current-password"
            placeholder="admin123"
          />
        </div>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

        <button class="btn" type="submit" :disabled="loading">
          {{ loading ? '登录中…' : '登录' }}
        </button>
      </form>

      <p class="hint">默认账号：admin / admin123</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { RequestError } from '@/api/request'

const router = useRouter()
const userStore = useUserStore()

const username = ref('admin')
const password = ref('admin123')
const loading = ref(false)
const errorMsg = ref('')

async function onSubmit() {
  errorMsg.value = ''
  if (!username.value.trim() || !password.value) {
    errorMsg.value = '请输入账号和密码'
    return
  }
  loading.value = true
  try {
    await userStore.login(username.value.trim(), password.value)
    await router.replace({ name: 'home' })
  } catch (e) {
    const err = e as RequestError
    errorMsg.value = err.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
