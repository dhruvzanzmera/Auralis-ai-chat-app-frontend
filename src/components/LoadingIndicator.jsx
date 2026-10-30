function LoadingIndicator({ label, className = '', size = 'sm' }) {
  const spinnerSize = size === 'lg' ? 'h-8 w-8 border-[3px]' : size === 'md' ? 'h-5 w-5 border-2' : 'h-4 w-4 border-2'

  return (
    <div className={`flex items-center justify-center gap-2 text-sm text-[#7986a8] ${className}`} role="status" aria-live="polite">
      <span aria-hidden="true" className={`${spinnerSize} shrink-0 animate-spin rounded-full border-[#e0e3f7] border-t-[#667eea]`} />
      <span>{label}</span>
    </div>
  )
}

export default LoadingIndicator
