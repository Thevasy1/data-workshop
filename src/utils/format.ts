export const formatDate = (date: string | Date, includeTime = true) => {
  if (!date) return '-'

  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return '-'

  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(includeTime
      ? {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }
      : {}),
  })

  return formatter.format(value).replace(/\//g, '-')
}

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'

  const base = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(base)), sizes.length - 1)

  return `${parseFloat((bytes / Math.pow(base, index)).toFixed(2))} ${sizes[index]}`
}
