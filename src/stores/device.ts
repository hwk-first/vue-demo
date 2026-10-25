import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  getDevices,
  getDevice,
  updateDevice as updateDeviceApi,
  deleteDevice as deleteDeviceApi,
} from '@/api/device'
import type { Device, DeviceListParams } from '@/api/device'

export type { Device }

export const useDeviceStore = defineStore('device', () => {
  const list = ref<Device[]>([])
  const loading = ref(false)

  const total = computed(() => list.value.length)

  /** 从后端拉取设备列表，支持 name/platform 过滤 */
  async function fetchDevices(params: DeviceListParams = {}) {
    loading.value = true
    try {
      const data = await getDevices(params)
      list.value = data.list
    } finally {
      loading.value = false
    }
  }

  /** 根据 id 从后端查询单个设备（失败返回 undefined） */
  async function fetchDevice(id: number): Promise<Device | undefined> {
    try {
      const d = await getDevice(id)
      const idx = list.value.findIndex((x) => x.id === id)
      if (idx > -1) {
        list.value[idx] = d
      }
      return d
    } catch {
      return undefined
    }
  }

  function getDeviceById(id: number): Device | undefined {
    return list.value.find((d) => d.id === id)
  }

  /** 更新设备，成功后同步本地列表 */
  async function updateDevice(id: number, data: Partial<Device>) {
    await updateDeviceApi(id, data)
    const idx = list.value.findIndex((d) => d.id === id)
    if (idx > -1) {
      list.value[idx] = { ...list.value[idx], ...data } as Device
    }
  }

  /** 删除设备，成功后同步本地列表 */
  async function deleteDevice(id: number) {
    await deleteDeviceApi(id)
    list.value = list.value.filter((d) => d.id !== id)
  }

  return {
    list,
    loading,
    total,
    fetchDevices,
    fetchDevice,
    getDeviceById,
    updateDevice,
    deleteDevice,
  }
})
