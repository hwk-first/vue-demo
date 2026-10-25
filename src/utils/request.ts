import { getToken } from './token'
import { API_BASE_URL } from '@/config/api'

export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  // 相对路径自动拼接后端地址，绝对路径直接使用
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  const response = await fetch(fullUrl, { ...options, headers })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error((body as { msg?: string } | null)?.msg || `请求失败: ${response.status}`)
  }

  return response.json() as Promise<T>
}
