import { configureStore } from '@reduxjs/toolkit'
import apiStatusReducer from './apiStatusSlice'
import authReducer from './authSlice'

export const store = configureStore({
  reducer: {
    apiStatus: apiStatusReducer,
    auth: authReducer,
  },
})
