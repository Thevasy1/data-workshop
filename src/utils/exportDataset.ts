import type { Dataset } from '@/stores/workshop'

type ExportFormat = 'csv' | 'json'

const safeFileName = (name: string) => name.replace(/[\\/:*?"<>|]/g, '_')

const escapeCsvCell = (value: string | number | undefined) => {
  const text = value == null ? '' : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const getColumns = (dataset: Dataset) => {
  const fromFields = dataset.fields.map((item) => item.name)
  const fromRows = Array.from(new Set(dataset.samples.flatMap((row) => Object.keys(row))))
  return fromFields.length ? fromFields : fromRows
}

const makeCsv = (dataset: Dataset) => {
  const columns = getColumns(dataset)
  const header = columns.map(escapeCsvCell).join(',')
  const rows = dataset.samples.map((row) => columns.map((column) => escapeCsvCell(row[column])).join(','))
  return ['\uFEFF' + header, ...rows].join('\n')
}

const makeJson = (dataset: Dataset) =>
  JSON.stringify(
    {
      id: dataset.id,
      name: dataset.name,
      version: dataset.version,
      owner: dataset.owner,
      datasourceName: dataset.datasourceName,
      recordCount: dataset.recordCount,
      fields: dataset.fields,
      samples: dataset.samples,
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  )

export function downloadDataset(dataset: Dataset, format: ExportFormat = 'csv') {
  const content = format === 'json' ? makeJson(dataset) : makeCsv(dataset)
  const type = format === 'json' ? 'application/json;charset=utf-8' : 'text/csv;charset=utf-8'
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${safeFileName(dataset.name)}_${dataset.version}.${format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
