import request from '@/utils/request'

export type DatasourceType = 'api' | 'upload' | 'database' | 'web'
export type CollectStatus = 'pending' | 'running' | 'success' | 'failed' | 'paused'
export type DatasetSchedule = 'manual' | 'daily' | 'weekly' | 'cron'

export interface DatasetListParams {
  page?: number
  pageSize?: number
  keyword?: string
  datasourceId?: string
  collectStatus?: CollectStatus | ''
  startTime?: string
  endTime?: string
}

export interface DatasetItem {
  id: string
  name: string
  datasourceId: string
  datasourceName: string
  collectStatus: CollectStatus
  collectProgress: number
  recordCount: number
  version: string
  isLabeled: boolean
  createdAt: string
  updatedAt?: string
}

export interface PaginatedResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface DatasourceOption {
  id: string
  name: string
  type: DatasourceType
}

export interface DatasetField {
  name: string
  type: string
  description: string
  source?: string
}

export interface FieldMapping {
  source: string
  target: string
}

export interface FilterRule {
  field: string
  operator: string
  value: string
}

export interface CollectRules {
  fieldMappings: FieldMapping[]
  filters: FilterRule[]
  schedule: DatasetSchedule
  cron?: string
  sourceOptions: {
    method?: 'GET' | 'POST'
    requestBody?: string
    sql?: string
    fileFormat?: 'csv' | 'excel' | 'json'
    url?: string
    selector?: string
  }
}

export interface CreateDatasetPayload {
  name: string
  datasourceId: string
  description: string
  collectRules: CollectRules
}

export interface DatasetDetail extends DatasetItem {
  description: string
  fields: DatasetField[]
  collectRules: CollectRules
  updatedAt: string
}

export interface DatasetSamples {
  columns: string[]
  rows: Array<Array<string | number | null>>
}

export interface DatasetVersion {
  id: string
  version: string
  recordCount: number
  fieldCount: number
  createdAt: string
  description: string
}

export interface VersionCompareResult {
  baseVersion: DatasetVersion
  targetVersion: DatasetVersion
  diff: {
    recordCount: number
    addedFields: string[]
    removedFields: string[]
    changedFields: string[]
  }
}

export interface DatasetLog {
  time: string
  level: 'info' | 'warning' | 'error'
  message: string
}

export default {
  getList(params: DatasetListParams) {
    return request.get<PaginatedResult<DatasetItem>>('/datasets', { params })
  },
  getDatasourceOptions() {
    return request.get<DatasourceOption[]>('/datasets/datasource-options')
  },
  getDatasourceFields(datasourceId: string) {
    return request.get<DatasetField[]>(`/datasources/${datasourceId}/fields`)
  },
  create(data: CreateDatasetPayload) {
    return request.post<{ id: string }>('/datasets', data)
  },
  getDetail(id: string) {
    return request.get<DatasetDetail>(`/datasets/${id}`)
  },
  getFields(id: string) {
    return request.get<DatasetField[]>(`/datasets/${id}/fields`)
  },
  getSamples(id: string, limit = 20) {
    return request.get<DatasetSamples>(`/datasets/${id}/samples`, { params: { limit } })
  },
  getVersions(id: string) {
    return request.get<DatasetVersion[]>(`/datasets/${id}/versions`)
  },
  compareVersions(id: string, data: { baseVersionId: string; targetVersionId: string }) {
    return request.post<VersionCompareResult>(`/datasets/${id}/versions/actions/compare`, data)
  },
  rollbackVersion(id: string, versionId: string) {
    return request.post<null>(`/datasets/${id}/versions/actions/rollback`, { versionId })
  },
  exportDataset(id: string, format: 'csv' | 'json' | 'excel') {
    return request.get<string>(`/datasets/${id}/export`, { params: { format } })
  },
  updateLabelStatus(id: string, isLabeled: boolean) {
    return request.patch<null>(`/datasets/${id}/label-status`, { isLabeled })
  },
  delete(id: string) {
    return request.delete<null>(`/datasets/${id}`)
  },
  startCollect(id: string) {
    return request.post<null>(`/datasets/${id}/actions/start-collect`)
  },
  pauseCollect(id: string) {
    return request.post<null>(`/datasets/${id}/actions/pause-collect`)
  },
  retryCollect(id: string) {
    return request.post<null>(`/datasets/${id}/actions/retry-collect`)
  },
  getStatus(id: string) {
    return request.get<{ status: CollectStatus; progress: number; message: string }>(`/datasets/${id}/status`)
  },
  getLogs(id: string) {
    return request.get<DatasetLog[]>(`/datasets/${id}/logs`)
  },
}
