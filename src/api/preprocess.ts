import request from '@/utils/request'

export interface PreprocessParams {
  page?: number
  pageSize?: number
  keyword?: string
  datasetId?: string
  processTypes?: string[]
  status?: string
  startTime?: string
  endTime?: string
}

export interface AvailableDataset {
  id: string
  name: string
  version: string
  recordCount: number
}

export interface DatasetVersionOption {
  id: string
  name: string
  recordCount: number
  createdAt: string
}

export interface PreprocessTaskItem {
  id: string
  name: string
  datasetId: string
  datasetName: string
  processTypes: string[]
  status: string
  progress: number
  outputVersion?: string
  createdAt: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface PreprocessCreatePayload {
  name: string
  datasetId: string
  versionId: string
  outputVersionDesc?: string
  processTypes: string[]
  config: Record<string, unknown>
}

export interface PreprocessDetail {
  id: string
  name: string
  datasetId: string
  datasetName: string
  processTypes: string[]
  status: string
  progress: number
  config: Record<string, unknown>
  inputVersion: string
  outputVersion: string
  inputCount: number
  outputCount: number
  createdAt: string
  finishedAt: string
}

export interface PreprocessProgress {
  id: string
  status: string
  progress: number
  currentStep: string
  processedCount: number
  totalCount: number
  estimatedRemainingSeconds: number
}

export interface PreprocessComparison {
  before: {
    version: string
    recordCount: number
    fields: string[]
    sampleData: Array<Array<string | number | null>>
  }
  after: {
    version: string
    recordCount: number
    fields: string[]
    sampleData: Array<Array<string | number | null>>
  }
  diff: {
    recordCountChange: number
    fieldsAdded: number
    fieldsRemoved: number
    nullRemoved: number
  }
}

export interface PreprocessLog {
  time: string
  level: string
  message: string
}

export interface PreviewResult {
  columns: string[]
  rows: Array<Array<string | number | null>>
}

export default {
  getList(params: PreprocessParams) {
    return request.get<PageResult<PreprocessTaskItem>>('/preprocess/list', { params })
  },
  getAvailableDatasets() {
    return request.get<AvailableDataset[]>('/preprocess/available-datasets')
  },
  getDatasetVersions(datasetId: string) {
    return request.get<DatasetVersionOption[]>(`/preprocess/dataset/${datasetId}/versions`)
  },
  create(data: PreprocessCreatePayload) {
    return request.post<{ id: string; status: string }>('/preprocess/create', data)
  },
  getDetail(id: string) {
    return request.get<PreprocessDetail>(`/preprocess/${id}/detail`)
  },
  getProgress(id: string) {
    return request.get<PreprocessProgress>(`/preprocess/${id}/progress`)
  },
  getComparison(id: string) {
    return request.get<PreprocessComparison>(`/preprocess/${id}/comparison`)
  },
  getLogs(id: string) {
    return request.get<PreprocessLog[]>(`/preprocess/${id}/logs`)
  },
  getPreview(id: string) {
    return request.get<PreviewResult>(`/preprocess/${id}/preview`)
  },
  exportResult(id: string, format: string) {
    return request.get<string>(`/preprocess/${id}/export`, { params: { format } })
  },
}
