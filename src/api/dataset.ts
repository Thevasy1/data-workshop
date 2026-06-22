import request from '@/utils/request'

export interface DatasetParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
  dataType?: string
  sourceType?: string
}

export interface DatasetRuleConfig {
  collectMode: 'full' | 'incremental' | 'scheduled'
  sampleLimit: number
  qualityChecks: string[]
  ruleNote?: string
}

export interface DatasetItem {
  id: string
  name: string
  description?: string
  dataType: 'image' | 'text' | 'audioVideo'
  taskType: string
  sourceType: 'upload' | 'api' | 'database' | 'web'
  datasourceId: string
  datasourceName: string
  collectModeLabel: string
  collectStatus: 'pending' | 'running' | 'success' | 'failed' | 'paused'
  collectProgress: number
  recordCount: number
  tags: string[]
  ruleConfig: DatasetRuleConfig
  createdAt: string
  updatedAt: string
}

export interface DatasetCreatePayload {
  name: string
  description: string
  dataType: DatasetItem['dataType']
  taskType: string
  sourceType: DatasetItem['sourceType'] | ''
  tags: string[]
  ruleConfig: DatasetRuleConfig
}

export default {
  getList(params: DatasetParams) {
    return request.get('/dataset/list', { params })
  },
  getDatasourceOptions() {
    return request.get('/dataset/datasource-options')
  },
  create(data: any) {
    return request.post('/dataset/create', data)
  },
  update(id: string, data: any) {
    return request.put(`/dataset/${id}`, data)
  },
  getConfig(id: string) {
    return request.get(`/dataset/${id}/config`)
  },
  delete(id: string) {
    return request.delete(`/dataset/${id}`)
  },
}
