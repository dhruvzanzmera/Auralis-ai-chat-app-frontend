import axios from 'axios'

export const chatApi = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api'),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

export function getApiMessage(error) {
  const message = error?.response?.data?.message
  if (typeof message === 'string' && message.trim()) return message
  console.error('API request failed without a backend message.', {
    code: error?.code || 'UNKNOWN',
    status: error?.response?.status || null,
  })
  return ''
}
