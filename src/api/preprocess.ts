import request from '@/utils/request'
import type { PageResult } from '@/api/datasource'

export interface PreprocessParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export interface PreprocessTaskItem {
  id: string
  name: string
  datasetId: string
  datasetName: string
  processType: 'clean' | 'dedup' | 'normalize' | 'format'
  status: 'pending' | 'running' | 'success' | 'failed'
  version: string
  createdAt: string
}

export interface AvailableDataset {
  id: string
  name: string
  collectStatus: string
}

export default {
  getList(params: PreprocessParams) {
    return request.get<unknown, PageResult<PreprocessTaskItem>>('/preprocess/list', { params })
  },
  getAvailableDatasets() {
    return request.get<unknown, AvailableDataset[]>('/preprocess/available-datasets')
  },
  create(data: Record<string, unknown>) {
    return request.post<unknown, { id: string }>('/preprocess/create', data)
  },
  getDetail(id: string) {
    return request.get<unknown, Record<string, unknown>>(`/preprocess/${id}/detail`)
  },
  getVersions(id: string) {
    return request.get<unknown, Record<string, unknown>[]>(`/preprocess/${id}/versions`)
  },
  compareVersions(id: string, data: { version1: string; version2: string }) {
    return request.post<unknown, Record<string, unknown>>(`/preprocess/${id}/compare`, data)
  },
  rollback(id: string, version: string) {
    return request.post<unknown, null>(`/preprocess/${id}/rollback`, { version })
  },
  getPreview(id: string) {
    return request.get<unknown, Record<string, unknown>>(`/preprocess/${id}/preview`)
  },
  exportResult(id: string, format: string) {
    return request.get<unknown, Blob>(`/preprocess/${id}/export`, { params: { format }, responseType: 'blob' })
  },
}
