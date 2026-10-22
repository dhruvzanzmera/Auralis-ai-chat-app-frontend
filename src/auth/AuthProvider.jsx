import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { chatApi } from '../api/chatApi'
import { setLoading, setUser } from '../store/authSlice'

export function AuthProvider({ children }) {
  const dispatch = useDispatch()

  useEffect(() => {
    let active = true
    chatApi.get('/auth/me')
      .then(({ data }) => {
        if (active) dispatch(setUser(data.user || data))
      })
      .catch(() => {
        if (active) dispatch(setUser(null))
      })
      .finally(() => {
        if (active) dispatch(setLoading(false))
      })
    return () => { active = false }
  }, [dispatch])

  return children
}
