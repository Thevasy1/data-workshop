import request from '@/utils/request'

export type DatasourceType = 'api' | 'upload' | 'database' | 'web'
export type DatasourceStatus = 'draft' | 'active' | 'inactive' | 'failed'

export interface KeyValuePair {
  key: string
  value: string
}

export interface ApiConfig {
  url: string
  method: 'GET' | 'POST'
  headers: KeyValuePair[]
  params: KeyValuePair[]
  authType: string
  authValue?: string
}

export interface UploadConfig {
  fileFormat: string[]
  maxSize: number
  maxSizeUnit: string
  encoding: string
  delimiter: string
}

export interface DatabaseConfig {
  dbType: string
  host: string
  port: number
  username: string
  password?: string
  dbName: string
  tableName: string
  charset: string
}

export interface WebConfig {
  url: string
  selector: string
  crawlFrequency: string
  cron: string
  userAgent: string
  timeout: number
  maxPages: number
}

export interface DatasourceConfig {
  api?: ApiConfig
  upload?: UploadConfig
  database?: DatabaseConfig
  web?: WebConfig
}

export interface DatasourceListParams {
  page?: number
  pageSize?: number
  keyword?: string
  type?: DatasourceType | ''
  status?: DatasourceStatus | ''
  startTime?: string
  endTime?: string
}

export interface DatasourceItem {
  id: string
  name: string
  type: DatasourceType
  status: DatasourceStatus
  description: string
  createdAt: string
  updatedAt: string
}

export interface DatasourceDetail extends DatasourceItem {
  config: DatasourceConfig
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
  collectStatus: string
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

export interface DatasourceField {
  name: string
  type: string
  description: string
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

export interface DatasourceFormData {
  name: string
  type: DatasourceType
  description: string
  config: DatasourceConfig
}

export default {
  getList(params: DatasourceListParams) {
    return request.get<PageResult<DatasourceItem>>('/datasource/list', { params })
  },
  getDetail(id: string) {
    return request.get<DatasourceDetail>(`/datasource/${id}`)
  },
  create(data: DatasourceFormData) {
    return request.post<{ id: string }>('/datasource/create', data)
  },
  update(id: string, data: DatasourceFormData) {
    return request.put<null>(`/datasource/${id}`, data)
  },
  delete(id: string) {
    return request.delete<null>(`/datasource/${id}`)
  },
  testConnection(data: TestConnectionPayload) {
    return request.post<TestConnectionResult>('/datasource/test', data)
  },
  getRelatedDatasets(id: string, params: { page?: number; pageSize?: number }) {
    return request.get<PageResult<RelatedDataset>>(`/datasource/${id}/datasets`, { params })
  },
  getTestRecords(id: string, params: { page?: number; pageSize?: number }) {
    return request.get<PageResult<TestRecord>>(`/datasource/${id}/test-records`, { params })
  },
  getFields(id: string) {
    return request.get<DatasourceField[]>(`/datasource/${id}/fields`)
  },
}
