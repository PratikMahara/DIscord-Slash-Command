import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

export default function DataTable({ columns, data, loading, onRowClick }) {
  if (loading) return <LoadingSpinner className="py-16" />
  if (!data?.length) return <EmptyState />

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-600">
            {columns.map((col) => (
              <th key={col.key} className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-700">
          {data.map((row, i) => (
            <tr
              key={row.id ?? i}
              onClick={() => onRowClick?.(row)}
              className={`transition-colors hover:bg-surface-700/50 ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4 text-slate-300 whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
