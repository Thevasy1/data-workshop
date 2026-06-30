import request from '@/utils/request'

export type DatasourceType = 'api' | 'upload' | 'database' | 'web'
export type DatasourceStatus = 'draft' | 'active' | 'inactive' | 'failed'

export interface KeyValueItem {
  key: string
  value: string
}

export interface DatasourceConfig {
  api?: {
    url: string
    method: 'GET' | 'POST'
    headers: KeyValueItem[]
    params: KeyValueItem[]
    authType: string
  }
  upload?: {
    fileFormat: string[]
    maxSize: number
    maxSizeUnit: string
    encoding: string
    delimiter: string
  }
  database?: {
    dbType: string
    host: string
    port: number
    username: string
    password?: string
    dbName: string
    tableName: string
    charset: string
  }
  web?: {
    url: string
    selector: string
    crawlFrequency: string
    cron: string
    userAgent: string
    timeout: number
    maxPages: number
  }
}

export interface Datasource {
  id: string
  name: string
  type: DatasourceType
  status: DatasourceStatus
  description: string
  config: DatasourceConfig
  createdAt: string
  updatedAt: string
}

export interface DatasourceListItem extends Omit<Datasource, 'config'> {
  config?: DatasourceConfig
}

export interface DatasourceParams {
  page?: number
  pageSize?: number
  keyword?: string
  type?: DatasourceType | ''
  status?: DatasourceStatus | ''
  startTime?: string
  endTime?: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface RelatedDataset {
  id: string
  name: string
  version: string
  collectStatus: 'pending' | 'running' | 'success' | 'failed' | 'paused'
  recordCount: number
  createdAt: string
}

export interface TestRecord {
  id: string
  time: string
  success: boolean
  message: string
  responseTime: number
}

export interface TestConnectionPayload {
  type: DatasourceType
  config: DatasourceConfig
}

export interface TestConnectionResult {
  success: boolean
  message: string
  sampleData: Record<string, unknown>[] | null
}

export default {
  getList(params: DatasourceParams) {
    return request.get<unknown, PageResult<DatasourceListItem>>('/datasources', { params })
  },
  getDetail(id: string) {
    return request.get<unknown, Datasource>(`/datasources/${id}`)
  },
  create(data: Record<string, unknown>) {
    return request.post<unknown, { id: string }>('/datasources', data)
  },
  update(id: string, data: Record<string, unknown>) {
    return request.put<unknown, null>(`/datasources/${id}`, data)
  },
  delete(id: string) {
    return request.delete<unknown, null>(`/datasources/${id}`)
  },
  testConnection(data: TestConnectionPayload) {
    return request.post<unknown, TestConnectionResult>('/datasources/actions/test', data)
  },
  getRelatedDatasets(id: string, params: { page?: number; pageSize?: number }) {
    return request.get<unknown, PageResult<RelatedDataset>>(`/datasources/${id}/datasets`, { params })
  },
  getTestRecords(id: string, params: { page?: number; pageSize?: number }) {
    return request.get<unknown, PageResult<TestRecord>>(`/datasources/${id}/test-records`, { params })
  },
  getFields(id: string) {
    return request.get<unknown, { name: string; type: string; description: string }[]>(`/datasources/${id}/fields`)
  },
}
