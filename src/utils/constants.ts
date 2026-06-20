// 统一状态枚举
export const COLLECT_STATUS = {
  pending: { label: '待采集', type: 'info' },
  running: { label: '采集中', type: 'warning' },
  success: { label: '采集成功', type: 'success' },
  failed: { label: '采集失败', type: 'danger' },
  paused: { label: '已暂停', type: 'info' },
} as const

export const PREPROCESS_STATUS = {
  pending: { label: '待处理', type: 'info' },
  running: { label: '处理中', type: 'warning' },
  success: { label: '处理成功', type: 'success' },
  failed: { label: '处理失败', type: 'danger' },
} as const

export const DATASOURCE_TYPE = {
  api: 'API接口',
  upload: '本地上传',
  database: '数据库',
  web: 'Web页面抓取',
} as const

export const PROCESS_TYPE = {
  clean: '数据清洗',
  dedup: '数据去重',
  normalize: '标准化',
  format: '格式转换',
} as const
