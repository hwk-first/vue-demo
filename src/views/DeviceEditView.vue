<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useDeviceStore } from '@/stores/device'
import type { Device } from '@/api/device'

const router = useRouter()
const route = useRoute()
const deviceStore = useDeviceStore()

const deviceId = Number(route.params.id)
const isReadonly = route.query.readonly === '1'

const loading = ref(false)
const device = ref<Device | null>(null)
const notFound = computed(() => !loading.value && !device.value)

const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  name: '',
  platform: '安卓' as '安卓' | '苹果' | '鸿蒙',
  model: '',
  enabled: true,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  platform: [{ required: true, message: '请选择机型', trigger: 'change' }],
  model: [{ required: true, message: '请输入手机型号', trigger: 'blur' }],
  enabled: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

onMounted(async () => {
  loading.value = true
  try {
    const d = await deviceStore.fetchDevice(deviceId)
    device.value = d ?? null
    if (d) {
      form.name = d.name
      form.platform = d.platform
      form.model = d.model
      form.enabled = d.enabled
    }
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '加载设备失败')
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  try {
    await deviceStore.updateDevice(deviceId, { ...form })
    ElMessage.success('保存成功')
    router.push('/device-manage')
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '保存失败')
  }
}

function handleBack() {
  router.push('/device-manage')
}
</script>

<template>
  <div class="edit-page" v-loading="loading">
    <!-- 未找到 -->
    <el-result
      v-if="notFound"
      icon="warning"
      title="设备不存在"
      sub-title="未找到该设备，可能已被删除"
    >
      <template #extra>
        <el-button type="primary" @click="handleBack">返回列表</el-button>
      </template>
    </el-result>

    <!-- 编辑表单 -->
    <template v-else>
      <h1 class="page-title">{{ isReadonly ? '查看设备' : '编辑设备' }}</h1>

      <el-card shadow="never">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          :disabled="isReadonly"
          label-width="100px"
          class="edit-form"
        >
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入姓名" clearable />
          </el-form-item>

          <el-form-item label="机型" prop="platform">
            <el-select v-model="form.platform" placeholder="请选择机型" style="width: 240px">
              <el-option label="安卓" value="安卓" />
              <el-option label="苹果" value="苹果" />
              <el-option label="鸿蒙" value="鸿蒙" />
            </el-select>
          </el-form-item>

          <el-form-item label="手机型号" prop="model">
            <el-input v-model="form.model" placeholder="请输入手机型号" clearable />
          </el-form-item>

          <el-form-item label="状态" prop="enabled">
            <el-radio-group v-model="form.enabled">
              <el-radio :value="true">启用</el-radio>
              <el-radio :value="false">禁用</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item>
            <el-button v-if="!isReadonly" type="primary" @click="handleSave">保存</el-button>
            <el-button @click="handleBack">返回</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.edit-page {
  max-width: 720px;
}

.page-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.edit-form {
  max-width: 560px;
}
</style>
