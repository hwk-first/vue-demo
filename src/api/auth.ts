import { request } from '@/utils/request'

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
  const res = await request<LoginResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify(params),
  })

  if (res.code === 200 && res.data?.token) {
    return { token: res.data.token, username: res.data.username || params.username }
  }

  throw new Error(res.msg || '登录失败')
}
