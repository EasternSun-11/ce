<template>
  <div class="layout">
    <header class="topbar">
      <div class="brand">UI App 管理后台</div>
      <div class="user-area">
        <span>{{ displayName }}</span>
        <button class="ghost-btn" type="button" @click="onLogout">退出</button>
      </div>
    </header>

    <main class="content">
      <h1 class="title">{{ home?.title || '首页' }}</h1>
      <p class="subtitle">欢迎回来，这里是管理后台概览</p>

      <section v-if="home" class="stats">
        <div class="stat-card">
          <div class="stat-label">用户总数</div>
          <div class="stat-value">{{ home.summary.userCount }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">今日登录</div>
          <div class="stat-value">{{ home.summary.todayLogins }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">待处理任务</div>
          <div class="stat-value">{{ home.summary.pendingTasks }}</div>
        </div>
      </section>

      <section class="panel">
        <h2 class="panel-title">用户列表</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>账号</th>
              <th>昵称</th>
              <th>角色</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in home?.users || []" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.username }}</td>
              <td>{{ item.nickname }}</td>
              <td>{{ item.role === 'admin' ? '管理员' : '用户' }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAdminHome, type AdminHomeData } from '@/api/auth'
import { useUserStore } from '@/stores/user'
import type { RequestError } from '@/api/request'

const router = useRouter()
const userStore = useUserStore()
const home = ref<AdminHomeData | null>(null)
const errorMsg = ref('')
const displayName = computed(
  () => userStore.user?.nickname || userStore.user?.username || '用户'
)

onMounted(async () => {
  await userStore.hydrate()
  if (!userStore.token) {
    await router.replace({ name: 'login' })
    return
  }
  try {
    home.value = await fetchAdminHome()
  } catch (e) {
    const err = e as RequestError
    errorMsg.value = err.message || '加载首页失败'
    if (err.code === 401) {
      await router.replace({ name: 'login' })
    }
  }
})

function onLogout() {
  userStore.logout()
  router.replace({ name: 'login' })
}
</script>
