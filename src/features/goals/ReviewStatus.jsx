// Badge hiển thị trạng thái review — tái sử dụng ở mọi cấp
export const REVIEW_STATUS = {
  achieved: { label: 'Đạt', icon: '✅', color: 'green' },
  partial: { label: 'Một phần', icon: '⚡', color: 'yellow' },
  not_achieved: { label: 'Không đạt', icon: '❌', color: 'red' },
}

export default function ReviewStatus({ status, size = 'md', isDark = true }) {
  if (!status || !REVIEW_STATUS[status]) return null
  const { label, icon, color } = REVIEW_STATUS[status]

  const colorMap = {
    green: isDark
      ? 'bg-green-500/15 text-green-400 ring-1 ring-green-500/30'
      : 'bg-green-50 text-green-700 ring-1 ring-green-200',
    yellow: isDark
      ? 'bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/30'
      : 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
    red: isDark
      ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30'
      : 'bg-red-50 text-red-700 ring-1 ring-red-200',
  }

  const sizeMap = {
    sm: 'text-xs px-1.5 py-0.5 gap-0.5',
    md: 'text-xs px-2 py-1 gap-1',
  }

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorMap[color]} ${sizeMap[size]}`}>
      <span>{icon}</span>
      {size === 'md' && <span>{label}</span>}
    </span>
  )
}
