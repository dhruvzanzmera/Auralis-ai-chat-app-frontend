import axios from 'axios'
import { requestFinished, requestStarted } from '../store/apiStatusSlice'
import { store } from '../store/store'

export const chatApi = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api'),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

chatApi.interceptors.request.use((config) => {
  store.dispatch(requestStarted())
  return config
})

chatApi.interceptors.response.use(
  (response) => {
    store.dispatch(requestFinished())
    return response
  },
  (error) => {
    store.dispatch(requestFinished())
    return Promise.reject(error)
  },
)
