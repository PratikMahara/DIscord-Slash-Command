export default function EmptyState({ message = 'No data found' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-3">📭</div>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  )
}
