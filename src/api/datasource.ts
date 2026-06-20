import request from '@/utils/request'

export interface DatasourceParams {
  page?: number
  pageSize?: number
  keyword?: string
  type?: string
}

export default {
  getList(params: DatasourceParams) {
    return request.get('/datasource/list', { params })
  },
  getDetail(id: string) {
    return request.get(`/datasource/detail/${id}`)
  },
  create(data: any) {
    return request.post('/datasource/create', data)
  },
  update(id: string, data: any) {
    return request.put(`/datasource/update/${id}`, data)
  },
  delete(id: string) {
    return request.delete(`/datasource/delete/${id}`)
  },
  getRules(id: string) {
    return request.get(`/datasource/${id}/rules`)
  },
  saveRules(id: string, data: any) {
    return request.post(`/datasource/${id}/rules`, data)
  },
  validateRules(id: string, data: any) {
    return request.post(`/datasource/${id}/rules/validate`, data)
  },
  getFields(id: string) {
    return request.get(`/datasource/${id}/fields`)
  },
}
