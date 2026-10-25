<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import bannerBg from '@/assets/login-banner2.png'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await authStore.login(form.username, form.password)
    ElMessage.success('登录成功') // 提示登录成功
    router.push('/device-manage') // 跳转到设备管理页面
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- 左侧图片区域 -->
    <div class="login-banner" :style="{ backgroundImage: `url(${bannerBg})` }"></div>

    <!-- 右侧登录区域 -->
    <div class="login-form-wrapper">
      <el-form ref="formRef" :model="form" :rules="rules" class="login-card">
        <h1 class="login-title">测试平台test</h1>

        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            size="large"
            placeholder="请输入用户名"
            :prefix-icon="User"
            autocomplete="username"
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            size="large"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            autocomplete="current-password"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          class="submit-btn"
          :loading="loading"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '登 录' }}
        </el-button>

        <!-- <p class="hint">演示账号：admin / 123456</p> -->
      </el-form>

      <!-- 底部版权信息，与登录卡片水平居中对齐 -->
      <div class="login-footer">Copyright © 2026 测试组 · All rights reserved · V1.0</div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  background: #ede9fe;
  /* 让 Element Plus 主题色跟随紫色 */
  --el-color-primary: #7c3aed;
  --el-color-primary-light-3: #a78bfa;
  --el-color-primary-light-5: #c4b5fd;
  --el-color-primary-light-7: #ddd6fe;
  --el-color-primary-light-8: #ede9fe;
  --el-color-primary-light-9: #f5f3ff;
  --el-color-primary-dark-2: #6d28d9;
}

/* ===== 左侧图片区域 ===== */
.login-banner {
  flex: 5;
  position: relative;
  margin: 10px 0 10px 10px;
  border-radius: 10px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
}

/* 图片右缘渐变过渡，与右侧背景自然融合 */
.login-banner::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0) 55%, #ede9fe 100%);
  pointer-events: none;
}

/* ===== 右侧表单 ===== */
.login-form-wrapper {
  flex: 2;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #ede9fe;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 16px;
  padding: 44px 36px 36px;
  box-shadow: 0 16px 48px rgba(76, 29, 149, 0.12);
}

.login-title {
  position: relative;
  margin: 0 0 30px;
  padding-bottom: 14px;
  font-size: 26px;
  color: #3b1d6e;
  text-align: center;
}

/* 标题下方的紫色装饰线 */
.login-title::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  border-radius: 2px;
  background: linear-gradient(90deg, #7c3aed, #a78bfa);
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
}

.hint {
  margin: 16px 0 0;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.login-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 16px;
  z-index: 10;
  font-size: 14px;
  color: #000000;
  text-align: center;
  user-select: none;
  pointer-events: none;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .login-banner {
    display: none;
  }

  .login-form-wrapper {
    flex: 1;
  }
}
</style>
