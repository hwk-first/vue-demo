import { ref } from 'vue'
import { defineStore } from 'pinia'
import { login as loginApi } from '@/api/auth'
import { getToken, setToken, removeToken } from '@/utils/token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getToken())
  const username = ref<string>('')

  async function login(user: string, password: string) {
    const { token: newToken, username: name } = await loginApi({ username: user, password })
    token.value = newToken
    username.value = name
    setToken(newToken)
  }

  function logout() {
    token.value = null
    username.value = ''
    removeToken()
  }

  return { token, username, login, logout }
})
