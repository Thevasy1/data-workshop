import request from '@/utils/request'
import type { PageResult } from '@/api/datasource'

export interface DatasetParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
}

export interface DatasetListItem {
  id: string
  name: string
  datasourceId: string
  datasourceName: string
  collectStatus: 'pending' | 'running' | 'success' | 'failed' | 'paused'
  collectProgress: number
  recordCount: number
  createdAt: string
}

export interface DatasourceOption {
  id: string
  name: string
  type?: string
}

export default {
  getList(params: DatasetParams) {
    return request.get<unknown, PageResult<DatasetListItem>>('/dataset/list', { params })
  },
  getDatasourceOptions() {
    return request.get<unknown, DatasourceOption[]>('/dataset/datasource-options')
  },
  create(data: Record<string, unknown>) {
    return request.post<unknown, { id: string }>('/dataset/create', data)
  },
  getConfig(id: string) {
    return request.get<unknown, Record<string, unknown>>(`/dataset/${id}/config`)
  },
  updateConfig(id: string, data: Record<string, unknown>) {
    return request.put<unknown, null>(`/dataset/${id}/config`, data)
  },
  startCollect(id: string) {
    return request.post<unknown, null>(`/dataset/${id}/start`)
  },
  pauseCollect(id: string) {
    return request.post<unknown, null>(`/dataset/${id}/pause`)
  },
  retryCollect(id: string) {
    return request.post<unknown, null>(`/dataset/${id}/retry`)
  },
  delete(id: string) {
    return request.delete<unknown, null>(`/dataset/${id}`)
  },
  getStatus(id: string) {
    return request.get<unknown, Record<string, unknown>>(`/dataset/${id}/status`)
  },
  getLogs(id: string) {
    return request.get<unknown, Record<string, unknown>[]>(`/dataset/${id}/logs`)
  },
}
