import { createSlice } from '@reduxjs/toolkit'

const apiStatusSlice = createSlice({
  name: 'apiStatus',
  initialState: { activeRequests: 0 },
  reducers: {
    requestStarted(state) {
      state.activeRequests += 1
    },
    requestFinished(state) {
      state.activeRequests = Math.max(0, state.activeRequests - 1)
    },
  },
})

export const { requestStarted, requestFinished } = apiStatusSlice.actions
export default apiStatusSlice.reducer
