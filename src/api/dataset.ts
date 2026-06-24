import request from '@/utils/request'

export interface DatasetParams {
  page?: number
  pageSize?: number
  keyword?: string
  datasourceId?: string
  collectStatus?: string
  startTime?: string
  endTime?: string
}

export default {
  /* 列表 */
  getList(params: DatasetParams) {
    return request.get('/datasets', { params })
  },
  /* 可选数据源 */
  getDatasourceOptions() {
    return request.get('/datasets/datasource-options')
  },
  /* 创建 */
  create(data: any) {
    return request.post('/datasets', data)
  },
  /* 详情 */
  getDetail(id: string) {
    return request.get(`/datasets/${id}`)
  },
  /* 字段结构 */
  getFields(id: string) {
    return request.get(`/datasets/${id}/fields`)
  },
  /* 样本预览 */
  getSamples(id: string, limit?: number) {
    return request.get(`/datasets/${id}/samples`, { params: { limit } })
  },
  /* 版本列表 */
  getVersions(id: string) {
    return request.get(`/datasets/${id}/versions`)
  },
  /* 版本对比 */
  compareVersions(id: string, data: { version1: string; version2: string }) {
    return request.post(`/datasets/${id}/versions/actions/compare`, data)
  },
  /* 版本回滚 */
  rollbackVersion(id: string, version: string) {
    return request.post(`/datasets/${id}/versions/actions/rollback`, { version })
  },
  /* 导出 */
  exportResult(id: string, format: string) {
    return request.get(`/datasets/${id}/export`, { params: { format }, responseType: 'blob' })
  },
  /* 删除 */
  delete(id: string) {
    return request.delete(`/datasets/${id}`)
  },
  /* 标记可标注 */
  updateLabelStatus(id: string, isLabeled: boolean) {
    return request.patch(`/datasets/${id}/label-status`, { isLabeled })
  },
}
