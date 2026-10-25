import { request } from '@/utils/request'
import { API_ENDPOINTS, API_SUCCESS_CODE } from '@/config/api'

export interface Device {
  id: number
  name: string
  platform: '安卓' | '苹果' | '鸿蒙'
  model: string
  enabled: boolean
}

/** 后端接口统一返回结构 */
interface ApiResponse<T> {
  code: number
  msg: string
  data?: T
}

export interface DeviceListParams {
  name?: string
  platform?: string
}

export interface DeviceListData {
  list: Device[]
  total: number
}

/** 查询设备列表（支持 name/platform 过滤） */
export async function getDevices(params: DeviceListParams = {}): Promise<DeviceListData> {
  const qs = new URLSearchParams()
  if (params.name) qs.set('name', params.name)
  if (params.platform) qs.set('platform', params.platform)
  const query = qs.toString()

  const res = await request<ApiResponse<DeviceListData>>(
    `${API_ENDPOINTS.devices.list}${query ? `?${query}` : ''}`,
  )
  if (res.code !== API_SUCCESS_CODE) throw new Error(res.msg || '获取设备列表失败')
  return res.data ?? { list: [], total: 0 }
}

/** 查询单个设备 */
export async function getDevice(id: number): Promise<Device> {
  const res = await request<ApiResponse<Device>>(API_ENDPOINTS.devices.detail(id))
  if (res.code !== API_SUCCESS_CODE || !res.data) throw new Error(res.msg || '设备不存在')
  return res.data
}

/** 新增设备，返回新设备 id */
export async function createDevice(data: Omit<Device, 'id'>): Promise<number> {
  const res = await request<ApiResponse<{ id: number }>>(API_ENDPOINTS.devices.list, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (res.code !== API_SUCCESS_CODE || !res.data) throw new Error(res.msg || '创建失败')
  return res.data.id
}

/** 更新设备 */
export async function updateDevice(id: number, data: Partial<Device>): Promise<void> {
  const res = await request<ApiResponse<null>>(API_ENDPOINTS.devices.detail(id), {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  if (res.code !== API_SUCCESS_CODE) throw new Error(res.msg || '更新失败')
}

/** 删除设备 */
export async function deleteDevice(id: number): Promise<void> {
  const res = await request<ApiResponse<null>>(API_ENDPOINTS.devices.detail(id), {
    method: 'DELETE',
  })
  if (res.code !== API_SUCCESS_CODE) throw new Error(res.msg || '删除失败')
}
