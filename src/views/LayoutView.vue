<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Grid, User, ArrowDown, Switch } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeMenu = computed(() =>
  route.path.startsWith('/device') ? '/device-manage' : route.path,
)

// 面包屑
interface Breadcrumb {
  label: string
  path?: string
}

const breadcrumbs = computed<Breadcrumb[]>(() => {
  const isReadonly = route.query.readonly === '1'

  if (route.path.startsWith('/device')) {
    const crumbs: Breadcrumb[] = [{ label: '基础管理' }]
    crumbs.push({ label: '设备管理', path: '/device-manage' })
    if (route.path.startsWith('/device-edit/')) {
      crumbs.push({ label: isReadonly ? '查看设备' : '编辑设备' })
    }
    return crumbs
  }

  if (route.path.startsWith('/format-convert')) {
    return [{ label: '格式转换' }, { label: 'JSON' }, { label: 'XMind' }]
  }

  return [{ label: '基础管理' }]
})

function handleCommand(command: string) {
  if (command === 'logout') {
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
}
</script>

<template>
  <el-container class="layout">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="sidebar">
      <div class="logo">测试平台</div>
      <el-menu
        :default-active="activeMenu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        class="sidebar-menu"
        router
      >
        <el-sub-menu index="basic">
          <template #title>
            <el-icon><Grid /></el-icon>
            <span>基础管理</span>
          </template>
          <el-menu-item index="/device-manage">设备管理</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="format">
          <template #title>
            <el-icon><Switch /></el-icon>
            <span>格式转换</span>
          </template>
          <el-menu-item index="/format-convert">JSON</el-menu-item>
          <el-menu-item index="/format-convert">XMind</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部栏 -->
      <el-header class="top-bar">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="(crumb, i) in breadcrumbs" :key="i">
            <router-link v-if="crumb.path" :to="crumb.path" class="crumb-link">
              {{ crumb.label }}
            </router-link>
            <span v-else>{{ crumb.label }}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>

        <el-dropdown @command="handleCommand">
          <span class="user-trigger">
            <el-icon><User /></el-icon>
            {{ authStore.username }}
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100vh;
}

.sidebar {
  background: #304156;
  overflow-x: hidden;
}

.logo {
  height: 56px;
  line-height: 56px;
  padding-left: 20px;
  text-align: left;
  color: #fff;
  font-size: 18px;
  letter-spacing: 2px;
}

.sidebar-menu {
  border-right: none;
  --el-menu-item-height: 44px;
  --el-menu-sub-item-height: 38px;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  height: 44px;
  line-height: 44px;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  height: 38px;
  line-height: 38px;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: #263445;
  color: #ffffff;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #263445;
  color: #409eff;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  height: 60px;
}

.crumb-link {
  text-decoration: none;
  color: #409eff;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #303133;
  font-size: 14px;
  outline: none;
}

.main-content {
  background: #f0f2f5;
}
</style>
