import { request } from '@/utils/request'
import { API_ENDPOINTS, API_SUCCESS_CODE } from '@/config/api'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  username: string
}

/** 后端接口返回结构 */
interface LoginResponse {
  code: number
  msg: string
  data?: {
    token?: string
    username?: string
  }
}

/** 调用后端登录接口 */
export async function login(params: LoginParams): Promise<LoginResult> {
  const res = await request<LoginResponse>(API_ENDPOINTS.auth.login, {
    method: 'POST',
    body: JSON.stringify(params),
  })

  if (res.code === API_SUCCESS_CODE && res.data?.token) {
    return { token: res.data.token, username: res.data.username || params.username }
  }

  throw new Error(res.msg || '登录失败')
}
