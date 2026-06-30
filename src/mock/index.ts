// Mock 数据定义（纯数据，不依赖 vite-plugin-mock）
// 由 vite.config.ts 中的 configureServer 中间件加载并拦截请求

export interface MockRule {
  url: string
  method: string
  handler: (context: { query?: Record<string, string>; params?: Record<string, string>; body?: any }) => any
}

function pathToReg(url: string): RegExp {
  // 将 :id 这样的路径参数转为正则捕获组
  const pattern = url
    .replace(/:[^/]+/g, '[^/]+')
    .replace(/\//g, '\\/')
  return new RegExp(`^${pattern}$`)
}

// ===== 内存存储：模拟 CRUD =====
let dsIdCounter = 100
const dataSources: any[] = []
const types = ['api', 'upload', 'database', 'web']
for (let i = 1; i <= 5; i++) {
  dataSources.push({
    id: `ds_${String(i).padStart(3, '0')}`,
    name: `数据源 ${i}`,
    type: types[i % 4],
    sourceUrl: `https://api.example.com/source/${i}`,
    status: i % 3 === 0 ? 'active' : 'inactive',
    description: `这是数据源 ${i} 的描述`,
    createdAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-06-18T14:30:00Z',
  })
}

export const mockRules: MockRule[] = [
  // ===== 数据源 =====
  {
    url: '/api/datasource/list',
    method: 'get',
    handler: ({ query }) => {
      const page = Number(query?.page || 1)
      const pageSize = Number(query?.pageSize || 10)
      const keyword = query?.keyword || ''
      const type = query?.type || ''

      // 支持搜索过滤
      let filtered = dataSources
      if (keyword) {
        filtered = filtered.filter(d => d.name.includes(keyword))
      }
      if (type) {
        filtered = filtered.filter(d => d.type === type)
      }

      const total = filtered.length
      const start = (page - 1) * pageSize
      const list = filtered.slice(start, start + pageSize)

      return { code: 0, data: { list, total, page, pageSize }, message: 'success' }
    },
  },
  {
    url: '/api/datasource/detail/:id',
    method: 'get',
    handler: ({ params }) => {
      const item = dataSources.find(d => d.id === params?.id)
      if (!item) return { code: 0, data: null, message: '数据源不存在' }
      const configs: Record<string, any> = {
        api: { api: { url: 'https://api.example.com/events', method: 'GET', headers: [{ key: 'Authorization', value: 'Bearer xxx' }], params: [{ key: 'limit', value: '100' }], authType: 'bearer', authValue: 'xxx' } },
        upload: { upload: { fileFormat: ['csv', 'json', 'excel'], maxSize: 100, maxSizeUnit: 'MB', encoding: 'utf-8', delimiter: ',' } },
        database: { database: { dbType: 'mysql', host: '192.168.1.100', port: 3306, username: 'root', password: '******', dbName: 'orders', tableName: 'order_list', charset: 'utf8mb4' } },
        web: { web: { url: 'https://news.example.com', selector: '.article-list .title', crawlFrequency: 'daily', cron: '0 0 * * *', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', timeout: 30, maxPages: 10 } },
      }
      return { code: 0, data: { ...item, config: configs[item.type] || null }, message: 'success' }
    },
  },
  {
    url: '/api/datasource/create',
    method: 'post',
    handler: ({ body }) => {
      if (!body || !body.name) return { code: 0, data: null, message: '名称不能为空' }
      dsIdCounter++
      const now = new Date().toISOString()
      const item = {
        id: `ds_${String(dsIdCounter).padStart(3, '0')}`,
        name: body.name,
        type: body.type || 'api',
        sourceUrl: body.config?.[body.type]?.url || body.config?.[body.type]?.host || '-',
        status: 'active',
        description: body.description || '',
        createdAt: now,
        updatedAt: now,
      }
      dataSources.unshift(item) // 新加的放最前面
      return { code: 0, data: { id: item.id }, message: '创建成功' }
    },
  },
  {
    url: '/api/datasource/update/:id',
    method: 'put',
    handler: ({ params, body }) => {
      const item = dataSources.find(d => d.id === params?.id)
      if (!item) return { code: 0, data: null, message: '数据源不存在' }
      if (body?.name) item.name = body.name
      if (body?.type) item.type = body.type
      if (body?.description !== undefined) item.description = body.description
      item.updatedAt = new Date().toISOString()
      return { code: 0, data: null, message: '更新成功' }
    },
  },
  {
    url: '/api/datasource/delete/:id',
    method: 'delete',
    handler: ({ params }) => {
      const idx = dataSources.findIndex(d => d.id === params?.id)
      if (idx === -1) return { code: 0, data: null, message: '数据源不存在' }
      dataSources.splice(idx, 1)
      return { code: 0, data: null, message: '删除成功' }
    },
  },
  {
    url: '/api/datasource/test',
    method: 'post',
    handler: ({ body }) => {
      if (!body || !body.config) return { code: 0, data: { success: false, message: '配置不完整', sampleData: null }, message: 'success' }
      return { code: 0, data: { success: true, message: '连接成功', sampleData: [{ user_id: '1001', name: '张三', age: 25 }, { user_id: '1002', name: '李四', age: 30 }] }, message: 'success' }
    },
  },
  {
    url: '/api/datasource/:id/rules',
    method: 'get',
    handler: () => ({ code: 0, data: { fieldMappings: [{ source: 'user_id', target: '用户ID' }, { source: 'name', target: '用户名' }], filters: [{ field: 'age', operator: '>', value: '18' }], schedule: 'daily', cron: '0 0 * * *' }, message: 'success' }),
  },
  {
    url: '/api/datasource/:id/rules',
    method: 'post',
    handler: () => ({ code: 0, data: null, message: 'success' }),
  },
  {
    url: '/api/datasource/:id/rules/validate',
    method: 'post',
    handler: () => ({ code: 0, data: [{ user_id: '1001', name: '张三', age: 25 }, { user_id: '1002', name: '李四', age: 30 }], message: 'success' }),
  },
  {
    url: '/api/datasource/:id/fields',
    method: 'get',
    handler: () => ({ code: 0, data: ['user_id', 'name', 'age', 'email', 'phone'], message: 'success' }),
  },

  // ===== 数据集 =====
  {
    url: '/api/dataset/list',
    method: 'get',
    handler: ({ query }) => {
      const page = Number(query?.page || 1)
      const pageSize = Number(query?.pageSize || 10)
      const list = Array.from({ length: pageSize }, (_, i) => ({
        id: `dt_${String((page - 1) * pageSize + i + 1).padStart(3, '0')}`,
        name: `数据集 ${(page - 1) * pageSize + i + 1}`,
        datasourceId: `ds_${String(i + 1).padStart(3, '0')}`,
        datasourceName: `数据源 ${i + 1}`,
        collectStatus: ['pending', 'running', 'success', 'failed', 'paused'][i % 5],
        collectProgress: [0, 45, 100, 0, 60][i % 5],
        recordCount: [0, 23000, 50000, 0, 15000][i % 5],
        createdAt: '2026-06-16T09:00:00Z',
      }))
      return { code: 0, data: { list, total: 50, page, pageSize }, message: 'success' }
    },
  },
  {
    url: '/api/dataset/datasource-options',
    method: 'get',
    handler: () => ({ code: 0, data: [{ id: 'ds_001', name: '用户行为API' }, { id: 'ds_002', name: '订单数据库' }, { id: 'ds_003', name: '日志文件上传' }], message: 'success' }),
  },
  {
    url: '/api/dataset/create',
    method: 'post',
    handler: () => ({ code: 0, data: { id: 'dt_new' }, message: 'success' }),
  },
  {
    url: '/api/dataset/:id/config',
    method: 'get',
    handler: () => ({ code: 0, data: { name: '示例数据集', datasourceId: 'ds_001', config: {} }, message: 'success' }),
  },
  {
    url: '/api/dataset/:id/config',
    method: 'put',
    handler: () => ({ code: 0, data: null, message: 'success' }),
  },
  {
    url: '/api/dataset/:id/start',
    method: 'post',
    handler: () => ({ code: 0, data: null, message: 'success' }),
  },
  {
    url: '/api/dataset/:id/pause',
    method: 'post',
    handler: () => ({ code: 0, data: null, message: 'success' }),
  },
  {
    url: '/api/dataset/:id/retry',
    method: 'post',
    handler: () => ({ code: 0, data: null, message: 'success' }),
  },
  {
    url: '/api/dataset/:id',
    method: 'delete',
    handler: () => ({ code: 0, data: null, message: 'success' }),
  },
  {
    url: '/api/dataset/:id/status',
    method: 'get',
    handler: () => ({ code: 0, data: { status: 'running', progress: 65, message: '采集中...' }, message: 'success' }),
  },
  {
    url: '/api/dataset/:id/logs',
    method: 'get',
    handler: () => ({ code: 0, data: [{ time: '2026-06-20 10:00:01', level: 'info', message: '开始采集数据' }, { time: '2026-06-20 10:00:05', level: 'info', message: '连接数据源成功' }, { time: '2026-06-20 10:00:10', level: 'warning', message: '部分字段缺失' }], message: 'success' }),
  },

  // ===== 预处理 =====
  {
    url: '/api/preprocess/list',
    method: 'get',
    handler: ({ query }) => {
      const page = Number(query?.page || 1)
      const pageSize = Number(query?.pageSize || 10)
      const list = Array.from({ length: pageSize }, (_, i) => ({
        id: `pp_${String((page - 1) * pageSize + i + 1).padStart(3, '0')}`,
        name: `预处理任务 ${(page - 1) * pageSize + i + 1}`,
        datasetId: `dt_${String(i + 1).padStart(3, '0')}`,
        datasetName: `数据集 ${i + 1}`,
        processType: ['clean', 'dedup', 'normalize', 'format'][i % 4],
        status: ['pending', 'running', 'success', 'failed'][i % 4],
        version: `v${i + 2}`,
        createdAt: '2026-06-18T11:00:00Z',
      }))
      return { code: 0, data: { list, total: 30, page, pageSize }, message: 'success' }
    },
  },
  {
    url: '/api/preprocess/available-datasets',
    method: 'get',
    handler: () => ({ code: 0, data: [{ id: 'dt_001', name: '用户行为数据集_v1', collectStatus: 'success' }, { id: 'dt_002', name: '订单数据集_v1', collectStatus: 'success' }], message: 'success' }),
  },
  {
    url: '/api/preprocess/create',
    method: 'post',
    handler: () => ({ code: 0, data: { id: 'pp_new' }, message: 'success' }),
  },
  {
    url: '/api/preprocess/:id/detail',
    method: 'get',
    handler: () => ({ code: 0, data: { id: 'pp_001', name: '清洗任务', datasetId: 'dt_001', processType: 'clean', status: 'success' }, message: 'success' }),
  },
  {
    url: '/api/preprocess/:id/versions',
    method: 'get',
    handler: () => ({ code: 0, data: [{ version: 'v1', createdAt: '2026-06-15T10:00:00Z', recordCount: 50000 }, { version: 'v2', createdAt: '2026-06-18T11:00:00Z', recordCount: 48000 }], message: 'success' }),
  },
  {
    url: '/api/preprocess/:id/compare',
    method: 'post',
    handler: () => ({ code: 0, data: { version1: { version: 'v1', recordCount: 50000, fields: 10 }, version2: { version: 'v2', recordCount: 48000, fields: 10 }, diff: { recordCount: -2000, removedFields: 0, addedFields: 0 } }, message: 'success' }),
  },
  {
    url: '/api/preprocess/:id/rollback',
    method: 'post',
    handler: () => ({ code: 0, data: null, message: 'success' }),
  },
  {
    url: '/api/preprocess/:id/preview',
    method: 'get',
    handler: () => ({ code: 0, data: { columns: ['user_id', 'name', 'age', 'email'], rows: [['1001', '张三', '25', 'zhangsan@example.com'], ['1002', '李四', '30', 'lisi@example.com']] }, message: 'success' }),
  },
  {
    url: '/api/preprocess/:id/export',
    method: 'get',
    handler: () => ({ code: 0, data: '模拟下载链接', message: 'success' }),
  },
]

/**
 * 匹配请求 URL 到 mock 规则
 */
export function matchMockRule(url: string, method: string): { rule: MockRule; params?: Record<string, string> } | null {
  for (const rule of mockRules) {
    if (rule.method.toLowerCase() !== method.toLowerCase()) continue
    const reg = pathToReg(rule.url)
    const match = url.match(reg)
    if (!match) continue

    // 提取路径参数
    if (rule.url.includes(':')) {
      const segments = url.split('/').filter(Boolean)
      const templateSegments = rule.url.split('/').filter(Boolean)
      const params: Record<string, string> = {}
      for (let i = 0; i < templateSegments.length; i++) {
        if (templateSegments[i].startsWith(':')) {
          params[templateSegments[i].slice(1)] = segments[i] || ''
        }
      }
      return { rule, params }
    }

    return { rule }
  }
  return null
}
