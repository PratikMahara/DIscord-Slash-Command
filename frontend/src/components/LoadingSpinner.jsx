export default function LoadingSpinner({ size = 'md', className = '' }) {
  const s = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[size]
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${s} animate-spin rounded-full border-2 border-surface-500 border-t-brand-500`} />
    </div>
  )
}
