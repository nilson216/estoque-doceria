import axios from 'axios'

import {
  LOCAL_STORAGE_ACCESS_TOKEN_KEY,
  LOCAL_STORAGE_REFRESH_TOKEN_KEY,
} from '@/constants/local-storage'

// === INSTÂNCIAS ===
export const protectedApi = axios.create({
  baseURL: 'http://localhost:8080/api',
})

export const publicApi = axios.create({
  baseURL: 'http://localhost:8080/api',
})


// === INTERCEPTOR DE REQUEST (PARA ENVIAR O TOKEN) ===
protectedApi.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY)

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})


// === INTERCEPTOR DE RESPONSE (PARA REFRESH TOKEN) ===
protectedApi.interceptors.response.use(
  (response) => {
    return response // sempre retorne
  },

  async (error) => {
    const request = error.config

     // Verifica se temos refresh token
    const refreshToken = localStorage.getItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY)

    if (!refreshToken) {
      return Promise.reject(error)
    }


    // Se NÃO for erro 401 → rejeita normal
    if (error.response.status !== 401 && !request._retry && !request.url.includes('/users/refresh-token')) {
      request._retry = true
       try {
      // Requisita novos tokens
      const response = await publicApi.post('/users/refresh-token', {
        refreshToken,
      })

      const newAccessToken = response.data.accessToken
      const newRefreshToken = response.data.refreshToken

      // Salva novos tokens
      localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, newAccessToken)
      localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY, newRefreshToken)

      // Reenvia requisição original com token atualizado
      request.headers.Authorization = `Bearer ${newAccessToken}`
      return protectedApi(request)

    } catch (refreshError) {
      localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY)
      localStorage.removeItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY)
      console.error('Erro ao atualizar token:', refreshError)
      }
    }
    return Promise.reject(error)
  }
)
