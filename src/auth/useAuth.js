import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { chatApi } from '../api/chatApi'
import { setUser } from '../store/authSlice'

export function useAuth() {
  const user = useSelector((state) => state.auth.user)
  const loading = useSelector((state) => state.auth.loading)
  const dispatch = useDispatch()

  const signIn = useCallback(async (credentials) => {
    const { data } = await chatApi.post('/auth/login', credentials)
    const authenticatedUser = data.user || data
    dispatch(setUser(authenticatedUser))
    return authenticatedUser
  }, [dispatch])

  const register = useCallback(async (details) => {
    const { data } = await chatApi.post('/auth/register', details)
    const authenticatedUser = data.user || data
    dispatch(setUser(authenticatedUser))
    return authenticatedUser
  }, [dispatch])

  const logout = useCallback(async () => {
    await chatApi.post('/auth/logout')
    dispatch(setUser(null))
  }, [dispatch])

  return { user, loading, signIn, register, logout }
}
