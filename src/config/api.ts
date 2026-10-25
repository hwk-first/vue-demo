export const API_BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '').replace(
  /\/$/,
  '',
)

export const API_SUCCESS_CODE = 200

export const API_ENDPOINTS = {
  auth: {
    login: '/api/login',
  },
  devices: {
    list: '/api/devices',
    detail: (id: number | string) => `/api/devices/${id}`,
  },
}
