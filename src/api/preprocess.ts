import request from '@/utils/request'

/* ===== 预处理任务参数类型 ===== */

export interface PreprocessParams {
  page?: number
  pageSize?: number
  keyword?: string
  processTypes?: string[]
  status?: string
  datasetId?: string
  startTime?: string
  endTime?: string
}

export interface PreprocessCreateBody {
  name: string
  datasetId: string
  versionId: string
  outputVersionDesc?: string
  processTypes: string[]
  config: {
    clean?: {
      nullStrategy: 'delete' | 'fill'
      fillValue?: string
      filterOutlier: boolean
      outlierRules?: Array<{ field: string; min?: number; max?: number }>
    }
    dedup?: {
      dedupFields: string[]
      keepStrategy: 'first' | 'last'
    }
    normalize?: {
      normalizeMethod: 'zscore' | 'minmax'
      fields: string[]
    }
    format?: {
      targetFormat: 'csv' | 'json' | 'excel'
      encoding?: string
      delimiter?: string
    }
  }
}

export interface ProgressStep {
  step: number
  name: string
  status: 'completed' | 'running' | 'pending'
  progress?: number
}

export interface TaskProgress {
  id: string
  status: string
  progress: number
  currentStep: number
  currentStepName: string
  steps: ProgressStep[]
  processedCount: number
  totalCount: number
  estimatedRemainingSeconds: number
}

export interface ComparisonData {
  before: { version: string; recordCount: number; fields: string[]; sampleData: any[][] }
  after: { version: string; recordCount: number; fields: string[]; sampleData: any[][] }
  diff: { recordCountChange: number; fieldsAdded: number; fieldsRemoved: number; nullRemoved: number }
}

export default {
  /* 列表 */
  getList(params: PreprocessParams) {
    return request.get('/preprocess-tasks', { params })
  },
  /* 创建 */
  create(data: PreprocessCreateBody) {
    return request.post('/preprocess-tasks', data)
  },
  /* 详情 */
  getDetail(id: string) {
    return request.get(`/preprocess-tasks/${id}`)
  },
  /* 可用数据集（仅 collectStatus === 'success'） */
  getAvailableDatasets() {
    return request.get('/preprocess-tasks/available-datasets')
  },
  /* 数据集版本列表 */
  getDatasetVersions(datasetId: string) {
    return request.get(`/preprocess-tasks/datasets/${datasetId}/versions`)
  },
  /* 执行进度（轮询） */
  getProgress(id: string) {
    return request.get(`/preprocess-tasks/${id}/progress`)
  },
  /* 前后对比 */
  getComparison(id: string) {
    return request.get(`/preprocess-tasks/${id}/comparison`)
  },
  /* 执行日志 */
  getLogs(id: string) {
    return request.get(`/preprocess-tasks/${id}/logs`)
  },
  /* 结果预览 */
  getPreview(id: string) {
    return request.get(`/preprocess-tasks/${id}/preview`)
  },
  /* 结果导出 */
  exportResult(id: string, format: string) {
    return request.get(`/preprocess-tasks/${id}/export`, { params: { format }, responseType: 'blob' })
  },
}
