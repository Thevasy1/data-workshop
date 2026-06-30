import request from '@/utils/request'

export interface DatasourceParams {
  page?: number
  pageSize?: number
  keyword?: string
  type?: string
}

// API 类型配置
export interface ApiConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers: { key: string; value: string }[]
  params: { key: string; value: string }[]
  authType: 'none' | 'bearer' | 'basic' | 'api-key'
  authValue?: string
}

// 本地上传类型配置
export interface UploadConfig {
  fileFormat: string[]
  maxSize: number
  maxSizeUnit: 'MB' | 'GB'
  encoding: string
  delimiter?: string
}

// 数据库类型配置
export interface DatabaseConfig {
  dbType: 'mysql' | 'postgresql' | 'mongodb' | 'sqlserver' | 'oracle'
  host: string
  port: number
  username: string
  password: string
  dbName: string
  tableName: string
  charset?: string
}

// Web 抓取类型配置
export interface WebConfig {
  url: string
  selector: string
  crawlFrequency: 'once' | 'hourly' | 'daily' | 'weekly'
  cron?: string
  userAgent: string
  timeout: number
  maxPages: number
}

// 创建/编辑数据源请求体
export interface DatasourceFormData {
  name: string
  type: 'api' | 'upload' | 'database' | 'web'
  description?: string
  config: {
    api?: ApiConfig
    upload?: UploadConfig
    database?: DatabaseConfig
    web?: WebConfig
  }
}

// 测试连接响应
export interface TestConnectionResult {
  success: boolean
  message: string
  sampleData: Record<string, any>[] | null
}

export default {
  // 获取数据源列表
  getList(params: DatasourceParams) {
    return request.get('/datasource/list', { params })
  },

  // 获取数据源详情（编辑页回显用）
  getDetail(id: string) {
    return request.get(`/datasource/detail/${id}`)
  },

  // 新建数据源
  create(data: DatasourceFormData) {
    return request.post('/datasource/create', data)
  },

  // 编辑数据源
  update(id: string, data: DatasourceFormData) {
    return request.put(`/datasource/update/${id}`, data)
  },

  // 删除数据源
  delete(id: string) {
    return request.delete(`/datasource/delete/${id}`)
  },

  // 测试数据源连接（列表页 + 新建/编辑页"保存并测试"）
  testConnection(data: Partial<DatasourceFormData>) {
    return request.post('/datasource/test', data)
  },
}
