import { useSelector } from 'react-redux'

function ApiLoadingIndicator() {
  const isLoading = useSelector((state) => state.apiStatus.activeRequests > 0)

  if (!isLoading) return null

  return (
    <div role="status" aria-label="Loading data" className="fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-[#e8eaf6]">
      <div className="h-full w-1/3 animate-pulse bg-gradient-to-r from-[#667eea] to-[#764ba2]" />
    </div>
  )
}

export default ApiLoadingIndicator
