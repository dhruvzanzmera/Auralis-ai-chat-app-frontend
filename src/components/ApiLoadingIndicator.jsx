import { useSelector } from 'react-redux'

function ApiLoadingIndicator() {
  const isLoading = useSelector((state) => state.apiStatus.activeRequests > 0)

  if (!isLoading) return null

  return (
    <div role="status" aria-label="Loading data" className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f8f9fc]/90 backdrop-blur-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg shadow-[#667eea]/15">
        <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#e0e3f7] border-t-[#667eea]" />
      </div>
    </div>
  )
}

export default ApiLoadingIndicator
