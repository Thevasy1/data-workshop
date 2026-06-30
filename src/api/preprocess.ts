import request from '@/utils/request'

export interface PreprocessParams {
  page?: number
  pageSize?: number
  keyword?: string
}

export default {
  getList(params: PreprocessParams) {
    return request.get('/preprocess/list', { params })
  },
  getAvailableDatasets() {
    return request.get('/preprocess/available-datasets')
  },
  create(data: any) {
    return request.post('/preprocess/create', data)
  },
  getDetail(id: string) {
    return request.get(`/preprocess/${id}/detail`)
  },
  getProgress(id: string) {
    return request.get(`/preprocess/${id}/progress`)
  },
  getComparison(id: string) {
    return request.get(`/preprocess/${id}/comparison`)
  },
  getLogs(id: string) {
    return request.get(`/preprocess/${id}/logs`)
  },
  getVersions(id: string) {
    return request.get(`/preprocess/${id}/versions`)
  },
  compareVersions(id: string, data: { version1: string; version2: string }) {
    return request.post(`/preprocess/${id}/compare`, data)
  },
  rollback(id: string, version: string) {
    return request.post(`/preprocess/${id}/rollback`, { version })
  },
  getPreview(id: string) {
    return request.get(`/preprocess/${id}/preview`)
  },
  exportResult(id: string, format: string) {
    return request.get(`/preprocess/${id}/export`, { params: { format }, responseType: 'blob' })
  },
}
