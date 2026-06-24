import request from '@/utils/request'

export interface DatasourceParams {
  page?: number
  pageSize?: number
  keyword?: string
  type?: string
  status?: string
  startTime?: string
  endTime?: string
}

export default {
  /* 列表 */
  getList(params: DatasourceParams) {
    return request.get('/datasources', { params })
  },
  /* 详情 */
  getDetail(id: string) {
    return request.get(`/datasources/${id}`)
  },
  /* 新建 */
  create(data: any) {
    return request.post('/datasources', data)
  },
  /* 编辑（全量更新） */
  update(id: string, data: any) {
    return request.put(`/datasources/${id}`, data)
  },
  /* 删除 */
  delete(id: string) {
    return request.delete(`/datasources/${id}`)
  },
  /* 测试连接 */
  testConnection(data: any) {
    return request.post('/datasources/actions/test', data)
  },
  /* 关联数据集列表 */
  getRelatedDatasets(id: string, params?: { page?: number; pageSize?: number }) {
    return request.get(`/datasources/${id}/datasets`, { params })
  },
  /* 测试记录 */
  getTestRecords(id: string, params?: { page?: number; pageSize?: number }) {
    return request.get(`/datasources/${id}/test-records`, { params })
  },
  /* 字段列表 */
  getFields(id: string) {
    return request.get(`/datasources/${id}/fields`)
  },
}
