import request from '@/utils/request'

export interface DatasetParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
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
  getConfig(id: string) {
    return request.get(`/dataset/${id}/config`)
  },
  updateConfig(id: string, data: any) {
    return request.put(`/dataset/${id}/config`, data)
  },
  startCollect(id: string) {
    return request.post(`/dataset/${id}/start`)
  },
  pauseCollect(id: string) {
    return request.post(`/dataset/${id}/pause`)
  },
  retryCollect(id: string) {
    return request.post(`/dataset/${id}/retry`)
  },
  delete(id: string) {
    return request.delete(`/dataset/${id}`)
  },
  getStatus(id: string) {
    return request.get(`/dataset/${id}/status`)
  },
  getLogs(id: string) {
    return request.get(`/dataset/${id}/logs`)
  },
}
