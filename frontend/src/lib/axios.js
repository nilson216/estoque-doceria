import axios from 'axios'

import {
  LOCAL_STORAGE_ACCESS_TOKEN_KEY,
  LOCAL_STORAGE_REFRESH_TOKEN_KEY,
} from '@/constants/local-storage'

/**
 * Detecta a URL da API dinamicamente (em runtime, não na build-time)
 * Assim o frontend funciona em qualquer ambiente sem precisar rebuild
 */
const getApiBaseUrl = () => {
  // Primeiro, tenta usar a variável de ambiente (para desenvolvimento local)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  // Se não houver .env, detecta automaticamente baseado no hostname
  const hostname = window.location.hostname
  const protocol = window.location.protocol
  
  // Em produção (Render, Vercel, etc), determina a URL da API
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Desenvolvimento local
    return `${protocol}//localhost:3000`
  }

  if (hostname.includes('estoque-doceria-frontend')) {
    // Frontend no Render → API também está no Render (mesmo domínio pai)
    // Substitui "frontend" por "backend" no domínio
    const backendUrl = hostname.replace('frontend', 'backend')
    return `${protocol}//${backendUrl}`
  }

  // Fallback: assume API na mesma raiz do domínio
  return `${protocol}//${hostname}`
}

const API_BASE_URL = getApiBaseUrl()

console.debug('[axios] API_BASE_URL detectada:', API_BASE_URL)

// === INSTÂNCIAS ===
export const protectedApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
})

export const publicApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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


    // If status is 401, try to refresh tokens (unless we're already retrying or calling the refresh endpoint)
    if (error.response.status === 401 && !request._retry && !request.url.includes('/users/refresh-token')) {
      request._retry = true
      try {
        const response = await publicApi.post('/users/refresh-token', {
          refreshToken,
        })

        const newAccessToken = response.data.accessToken
        const newRefreshToken = response.data.refreshToken

        // Save new tokens
        localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN_KEY, newAccessToken)
        localStorage.setItem(LOCAL_STORAGE_REFRESH_TOKEN_KEY, newRefreshToken)

        // Replay original request with updated token
        request.headers = request.headers || {}
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
