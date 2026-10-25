<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { useDeviceStore } from '@/stores/device'

const router = useRouter()
const deviceStore = useDeviceStore()

// 筛选条件
const filterName = ref('')
const filterPlatform = ref('')

// 翻页
const currentPage = ref(1)
const pageSize = ref(10)

const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return deviceStore.list.slice(start, start + pageSize.value)
})

async function fetchData() {
  try {
    await deviceStore.fetchDevices({
      name: filterName.value.trim() || undefined,
      platform: filterPlatform.value || undefined,
    })
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '加载设备列表失败')
  }
}

onMounted(fetchData)

function handleSearch() {
  currentPage.value = 1
  fetchData()
}

function handleReset() {
  filterName.value = ''
  filterPlatform.value = ''
  currentPage.value = 1
  fetchData()
}

function handleSizeChange() {
  currentPage.value = 1
}

function handleCurrentChange(page: number) {
  currentPage.value = page
}

// 操作
function handleEdit(id: number) {
  router.push(`/device-edit/${id}`)
}

function handleView(id: number) {
  router.push(`/device-edit/${id}?readonly=1`)
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除该设备吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  try {
    await deviceStore.deleteDevice(id)
    ElMessage.success('删除成功')
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '删除失败')
  }
}

function platformTagType(platform: string): 'primary' | 'success' | 'warning' {
  if (platform === '安卓') return 'primary'
  if (platform === '苹果') return 'success'
  return 'warning'
}

function indexMethod(index: number) {
  return (currentPage.value - 1) * pageSize.value + index + 1
}
</script>

<template>
  <div class="device-page">
    <!-- 筛选区 -->
    <el-card shadow="never">
      <el-form inline @submit.prevent>
        <el-form-item label="姓名">
          <el-input
            v-model="filterName"
            placeholder="请输入姓名"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="机型">
          <el-select v-model="filterPlatform" placeholder="全部" clearable style="width: 140px">
            <el-option label="安卓" value="安卓" />
            <el-option label="苹果" value="苹果" />
            <el-option label="鸿蒙" value="鸿蒙" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区 -->
    <el-card shadow="never" v-loading="deviceStore.loading">
      <el-table :data="pagedList" stripe>
        <el-table-column label="序号" type="index" width="70" align="center" :index="indexMethod" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="platform" label="机型">
          <template #default="{ row }">
            <el-tag :type="platformTagType(row.platform)">{{ row.platform }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="model" label="手机型号" />
        <el-table-column prop="enabled" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">
              {{ row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row.id)">编辑</el-button>
            <el-button link type="primary" @click="handleView(row.id)">查看</el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无数据" />
        </template>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        class="pagination"
        :total="deviceStore.list.length"
        :page-sizes="[5, 10, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<style scoped>
.device-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
