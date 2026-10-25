import { request } from '@/utils/request'

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

  const res = await request<ApiResponse<DeviceListData>>(`/api/devices${query ? `?${query}` : ''}`)
  if (res.code !== 200) throw new Error(res.msg || '获取设备列表失败')
  return res.data ?? { list: [], total: 0 }
}

/** 查询单个设备 */
export async function getDevice(id: number): Promise<Device> {
  const res = await request<ApiResponse<Device>>(`/api/devices/${id}`)
  if (res.code !== 200 || !res.data) throw new Error(res.msg || '设备不存在')
  return res.data
}

/** 新增设备，返回新设备 id */
export async function createDevice(data: Omit<Device, 'id'>): Promise<number> {
  const res = await request<ApiResponse<{ id: number }>>('/api/devices', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (res.code !== 200 || !res.data) throw new Error(res.msg || '创建失败')
  return res.data.id
}

/** 更新设备 */
export async function updateDevice(id: number, data: Partial<Device>): Promise<void> {
  const res = await request<ApiResponse<null>>(`/api/devices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  if (res.code !== 200) throw new Error(res.msg || '更新失败')
}

/** 删除设备 */
export async function deleteDevice(id: number): Promise<void> {
  const res = await request<ApiResponse<null>>(`/api/devices/${id}`, {
    method: 'DELETE',
  })
  if (res.code !== 200) throw new Error(res.msg || '删除失败')
}
