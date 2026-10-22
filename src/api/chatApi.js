import axios from 'axios'

export const chatApi = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api'),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})
