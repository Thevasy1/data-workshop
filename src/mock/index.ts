import type { MockMethod } from 'vite-plugin-mock'
import type { Datasource, DatasourceStatus, DatasourceType } from '@/api/datasource'

type Query = Record<string, string | number | undefined>
type MockContext = {
  query?: Query
  params?: Record<string, string>
  body?: Record<string, unknown>
}

const datasourceTypes: DatasourceType[] = ['api', 'upload', 'database', 'web']
const datasourceStatuses: DatasourceStatus[] = ['active', 'inactive', 'draft', 'failed']

const now = Date.parse('2026-06-20T10:00:00Z')

const makeDatasource = (index: number): Datasource => {
  const type = datasourceTypes[index % datasourceTypes.length]
  const id = `ds_${String(index + 1).padStart(3, '0')}`
  const base = {
    id,
    name: ['用户行为 API', '订单数据库', '日志文件上传', '新闻网页抓取'][index % 4] + ` ${index + 1}`,
    type,
    status: datasourceStatuses[index % datasourceStatuses.length],
    description: '用于数据工坊接入、采集和后续数据集构建的示例数据源。',
    createdAt: new Date(now - index * 86400000).toISOString(),
    updatedAt: new Date(now - index * 43200000).toISOString(),
  }

  const configMap: Record<DatasourceType, Datasource['config']> = {
    api: {
      api: {
        url: `https://api.example.com/events/${index + 1}`,
        method: 'GET',
        headers: [{ key: 'Authorization', value: 'Bearer mock-token' }],
        params: [{ key: 'limit', value: '100' }],
        authType: 'bearer',
      },
    },
    upload: {
      upload: {
        fileFormat: ['csv', 'json', 'excel'],
        maxSize: 100,
        maxSizeUnit: 'MB',
        encoding: 'utf-8',
        delimiter: ',',
      },
    },
    database: {
      database: {
        dbType: 'mysql',
        host: '192.168.1.100',
        port: 3306,
        username: 'root',
        password: '******',
        dbName: 'orders',
        tableName: 'order_list',
        charset: 'utf8mb4',
      },
    },
    web: {
      web: {
        url: 'https://news.example.com',
        selector: '.article-list .title',
        crawlFrequency: 'daily',
        cron: '0 0 * * *',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        timeout: 30,
        maxPages: 10,
      },
    },
  }

  return { ...base, config: configMap[type] }
}

const datasources = Array.from({ length: 36 }, (_, index) => makeDatasource(index))

const toNumber = (value: string | number | undefined, fallback: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const paginate = <T>(list: T[], query: Query = {}, defaultPageSize = 10) => {
  const page = toNumber(query.page, 1)
  const pageSize = toNumber(query.pageSize, defaultPageSize)
  const start = (page - 1) * pageSize

  return {
    list: list.slice(start, start + pageSize),
    total: list.length,
    page,
    pageSize,
  }
}

const ok = <T>(data: T, message = 'success') => ({ code: 0, data, message })

const getDatasource = (id?: string) => datasources.find((item) => item.id === id) || datasources[0]

const datasetList = Array.from({ length: 24 }, (_, index) => ({
  id: `dt_${String(index + 1).padStart(3, '0')}`,
  name: `用户行为数据集 ${index + 1}`,
  datasourceId: datasources[index % datasources.length].id,
  datasourceName: datasources[index % datasources.length].name,
  collectStatus: ['pending', 'running', 'success', 'failed', 'paused'][index % 5],
  collectProgress: [0, 45, 100, 0, 60][index % 5],
  recordCount: [0, 23000, 50000, 0, 15000][index % 5],
  version: `v${(index % 4) + 1}`,
  createdAt: new Date(now - index * 7200000).toISOString(),
}))

const preprocessList = Array.from({ length: 20 }, (_, index) => ({
  id: `pp_${String(index + 1).padStart(3, '0')}`,
  name: `预处理任务 ${index + 1}`,
  datasetId: datasetList[index % datasetList.length].id,
  datasetName: datasetList[index % datasetList.length].name,
  processType: ['clean', 'dedup', 'normalize', 'format'][index % 4],
  status: ['pending', 'running', 'success', 'failed'][index % 4],
  version: `v${index + 2}`,
  createdAt: new Date(now - index * 5400000).toISOString(),
}))

export default [
  {
    url: '/api/datasources',
    method: 'get',
    response: ({ query = {} }: MockContext) => {
      const keyword = String(query.keyword || '').trim()
      const type = String(query.type || '')
      const status = String(query.status || '')
      const startTime = query.startTime ? new Date(String(query.startTime)).getTime() : 0
      const endTime = query.endTime ? new Date(String(query.endTime)).getTime() + 86400000 - 1 : Number.MAX_SAFE_INTEGER

      const filtered = datasources.filter((item) => {
        const createdTime = new Date(item.createdAt).getTime()
        return (
          (!keyword || item.name.includes(keyword) || item.description.includes(keyword)) &&
          (!type || item.type === type) &&
          (!status || item.status === status) &&
          createdTime >= startTime &&
          createdTime <= endTime
        )
      })

      return ok(paginate(filtered, query))
    },
  },
  {
    url: '/api/datasources/:id',
    method: 'get',
    response: ({ params }: MockContext) => ok(getDatasource(params?.id)),
  },
  {
    url: '/api/datasources',
    method: 'post',
    response: () => ok({ id: 'ds_new' }, '创建成功'),
  },
  {
    url: '/api/datasources/:id',
    method: 'put',
    response: () => ok(null, '更新成功'),
  },
  {
    url: '/api/datasources/:id',
    method: 'delete',
    response: () => ok(null, '删除成功'),
  },
  {
    url: '/api/datasources/actions/test',
    method: 'post',
    response: ({ body }: MockContext) => {
      const type = body?.type
      const success = type !== 'web'
      return ok({
        success,
        message: success ? '连接成功，已获取样例数据' : '连接超时，请检查 URL 和网络',
        sampleData: success
          ? [
              { user_id: '1001', name: '张三', age: 25, email: 'zhangsan@example.com' },
              { user_id: '1002', name: '李四', age: 30, email: 'lisi@example.com' },
            ]
          : null,
      })
    },
  },
  {
    url: '/api/datasources/:id/datasets',
    method: 'get',
    response: ({ params, query = {} }: MockContext) => {
      const related = datasetList
        .filter((item) => item.datasourceId === params?.id)
        .map(({ id, name, version, collectStatus, recordCount, createdAt }) => ({
          id,
          name,
          version,
          collectStatus,
          recordCount,
          createdAt,
        }))

      return ok(paginate(related, query, 5))
    },
  },
  {
    url: '/api/datasources/:id/test-records',
    method: 'get',
    response: ({ query = {} }: MockContext) => {
      const records = Array.from({ length: 12 }, (_, index) => ({
        id: `tr_${String(index + 1).padStart(3, '0')}`,
        time: new Date(now - index * 3600000).toISOString(),
        success: index % 4 !== 0,
        message: index % 4 === 0 ? '连接超时，请检查 URL 和网络' : '连接成功',
        responseTime: index % 4 === 0 ? 30000 : 120 + index * 18,
      }))

      return ok(paginate(records, query))
    },
  },
  {
    url: '/api/datasources/:id/fields',
    method: 'get',
    response: () =>
      ok([
        { name: 'user_id', type: 'string', description: '用户 ID' },
        { name: 'name', type: 'string', description: '用户名称' },
        { name: 'age', type: 'number', description: '年龄' },
        { name: 'email', type: 'string', description: '邮箱' },
      ]),
  },
  {
    url: '/api/dataset/list',
    method: 'get',
    response: ({ query = {} }: MockContext) => ok(paginate(datasetList, query)),
  },
  {
    url: '/api/dataset/datasource-options',
    method: 'get',
    response: () => ok(datasources.map(({ id, name, type }) => ({ id, name, type }))),
  },
  {
    url: '/api/dataset/create',
    method: 'post',
    response: () => ok({ id: 'dt_new' }, '创建成功'),
  },
  {
    url: '/api/dataset/:id/start',
    method: 'post',
    response: () => ok(null, '启动成功'),
  },
  {
    url: '/api/dataset/:id/pause',
    method: 'post',
    response: () => ok(null, '已暂停'),
  },
  {
    url: '/api/dataset/:id/retry',
    method: 'post',
    response: () => ok(null, '已重新采集'),
  },
  {
    url: '/api/dataset/:id',
    method: 'delete',
    response: () => ok(null, '删除成功'),
  },
  {
    url: '/api/preprocess/list',
    method: 'get',
    response: ({ query = {} }: MockContext) => ok(paginate(preprocessList, query)),
  },
  {
    url: '/api/preprocess/available-datasets',
    method: 'get',
    response: () => ok(datasetList.filter((item) => item.collectStatus === 'success').map(({ id, name, collectStatus }) => ({ id, name, collectStatus }))),
  },
  {
    url: '/api/preprocess/create',
    method: 'post',
    response: () => ok({ id: 'pp_new' }, '创建成功'),
  },
] as MockMethod[]
