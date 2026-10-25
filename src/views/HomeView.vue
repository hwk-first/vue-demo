<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      authStore.logout()
      router.push('/login')
    })
    .catch(() => {})
}
</script>

<template>
  <div class="home-page">
    <el-card class="home-card" shadow="hover">
      <template #header>
        <span class="card-header">欢迎，{{ authStore.username }}</span>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="当前 Token">
          <code class="token">{{ authStore.token }}</code>
        </el-descriptions-item>
      </el-descriptions>

      <el-button type="danger" class="logout-btn" @click="handleLogout">退出登录</el-button>
    </el-card>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 24px;
}

.home-card {
  width: 100%;
  max-width: 640px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
}

.token {
  font-size: 13px;
  word-break: break-all;
  color: #606266;
}

.logout-btn {
  margin-top: 20px;
}
</style>
