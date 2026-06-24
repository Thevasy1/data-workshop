import { MockMethod } from 'vite-plugin-mock'

const PROCESS_TYPES = ['clean', 'dedup', 'normalize', 'format'] as const

const now = new Date()
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString()

export default [
  /* ==================================================================
     数据源管理 /datasources
     ================================================================== */

  // 1.1 列表
  {
    url: '/api/datasources',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 10, keyword, type, status } = query
      let list = Array.from({ length: 100 }, (_, i) => ({
        id: `ds_${String(i + 1).padStart(3, '0')}`,
        name: `数据源 ${i + 1}`,
        type: ['api', 'upload', 'database', 'web'][i % 4],
        status: ['draft', 'active', 'inactive', 'failed'][i % 4],
        description: `数据源 ${i + 1} 的描述`,
        createdAt: daysAgo(30 - i),
        updatedAt: daysAgo(i % 10),
      }))
      if (keyword) list = list.filter((i) => i.name.includes(keyword))
      if (type) list = list.filter((i) => i.type === type)
      if (status) list = list.filter((i) => i.status === status)
      const total = list.length
      const start = (Number(page) - 1) * Number(pageSize)
      return { code: 0, data: { list: list.slice(start, start + Number(pageSize)), total, page: Number(page), pageSize: Number(pageSize) }, message: 'success' }
    },
  },

  // 1.2 详情
  {
    url: '/api/datasources/:id',
    method: 'get',
    response: ({ params }) => ({
      code: 0,
      data: {
        id: params.id,
        name: '用户行为API',
        type: 'api',
        status: 'active',
        description: '用户行为数据接口',
        config: {
          api: { url: 'https://api.example.com/events', method: 'GET', headers: [{ key: 'Authorization', value: 'Bearer xxx' }], params: [{ key: 'limit', value: '100' }], authType: 'bearer' },
        },
        createdAt: daysAgo(15),
        updatedAt: daysAgo(3),
      },
      message: 'success',
    }),
  },

  // 1.3 新建
  {
    url: '/api/datasources',
    method: 'post',
    response: () => ({ code: 0, data: { id: 'ds_new' }, message: '创建成功' }),
  },

  // 1.4 编辑
  {
    url: '/api/datasources/:id',
    method: 'put',
    response: () => ({ code: 0, data: null, message: '更新成功' }),
  },

  // 1.5 删除
  {
    url: '/api/datasources/:id',
    method: 'delete',
    response: () => ({ code: 0, data: null, message: '删除成功' }),
  },

  // 1.6 测试连接
  {
    url: '/api/datasources/actions/test',
    method: 'post',
    response: () => ({
      code: 0,
      data: { success: true, message: '连接成功', sampleData: [{ user_id: '1001', name: '张三', age: 25 }] },
      message: 'success',
    }),
  },

  // 1.7 关联数据集
  {
    url: '/api/datasources/:id/datasets',
    method: 'get',
    response: () => ({
      code: 0,
      data: { list: [{ id: 'dt_001', name: '用户行为数据集', version: 'v1', collectStatus: 'success', recordCount: 50000, createdAt: daysAgo(10) }], total: 1, page: 1, pageSize: 5 },
      message: 'success',
    }),
  },

  // 1.8 测试记录
  {
    url: '/api/datasources/:id/test-records',
    method: 'get',
    response: () => ({
      code: 0,
      data: { list: [{ id: 'tr_001', time: daysAgo(2), success: true, message: '连接成功', responseTime: 120 }], total: 1, page: 1, pageSize: 10 },
      message: 'success',
    }),
  },

  // 1.9 字段列表
  {
    url: '/api/datasources/:id/fields',
    method: 'get',
    response: () => ({
      code: 0,
      data: [
        { name: 'user_id', type: 'string', description: '用户ID' },
        { name: 'name', type: 'string', description: '用户名' },
        { name: 'age', type: 'number', description: '年龄' },
        { name: 'email', type: 'string', description: '邮箱' },
      ],
      message: 'success',
    }),
  },

  /* ==================================================================
     数据集管理 /datasets
     ================================================================== */

  // 2.1 列表
  {
    url: '/api/datasets',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 10, keyword, datasourceId, collectStatus } = query
      let list = Array.from({ length: 50 }, (_, i) => ({
        id: `dt_${String(i + 1).padStart(3, '0')}`,
        name: `数据集 ${i + 1}`,
        datasourceId: `ds_${String((i % 5) + 1).padStart(3, '0')}`,
        datasourceName: `数据源 ${(i % 5) + 1}`,
        collectStatus: ['pending', 'running', 'success', 'failed', 'paused'][i % 5],
        collectProgress: [0, 45, 100, 0, 60][i % 5],
        recordCount: [0, 23000, 50000, 0, 15000][i % 5],
        version: 'v1',
        isLabeled: i % 3 === 0,
        createdAt: daysAgo(20 - i),
      }))
      if (keyword) list = list.filter((i) => i.name.includes(keyword))
      if (datasourceId) list = list.filter((i) => i.datasourceId === datasourceId)
      if (collectStatus) list = list.filter((i) => i.collectStatus === collectStatus)
      const total = list.length
      const start = (Number(page) - 1) * Number(pageSize)
      return { code: 0, data: { list: list.slice(start, start + Number(pageSize)), total, page: Number(page), pageSize: Number(pageSize) }, message: 'success' }
    },
  },

  // 2.2 可选数据源
  {
    url: '/api/datasets/datasource-options',
    method: 'get',
    response: () => ({
      code: 0,
      data: [
        { id: 'ds_001', name: '用户行为API', type: 'api' },
        { id: 'ds_002', name: '订单数据库', type: 'database' },
      ],
      message: 'success',
    }),
  },

  // 2.3 创建
  {
    url: '/api/datasets',
    method: 'post',
    response: () => ({ code: 0, data: { id: 'dt_new' }, message: 'success' }),
  },

  // 2.4 详情
  {
    url: '/api/datasets/:id',
    method: 'get',
    response: () => ({
      code: 0,
      data: {
        id: 'dt_001', name: '用户行为数据集', datasourceId: 'ds_001', datasourceName: '用户行为API',
        collectStatus: 'success', recordCount: 50000, version: 'v1', isLabeled: false,
        fields: [
          { name: 'user_id', type: 'string', description: '用户ID' },
          { name: 'name', type: 'string', description: '用户名' },
          { name: 'age', type: 'number', description: '年龄' },
        ],
        createdAt: daysAgo(10), updatedAt: daysAgo(3),
      },
      message: 'success',
    }),
  },

  // 2.5 字段结构
  { url: '/api/datasets/:id/fields', method: 'get', response: () => ({ code: 0, data: [], message: 'success' }) },

  // 2.6 样本预览
  {
    url: '/api/datasets/:id/samples',
    method: 'get',
    response: () => ({
      code: 0,
      data: { columns: ['user_id', 'name', 'age', 'email'], rows: [['1001', '张三', 25, 'zhangsan@example.com'], ['1002', '李四', 30, 'lisi@example.com']] },
      message: 'success',
    }),
  },

  // 2.7 版本管理
  { url: '/api/datasets/:id/versions', method: 'get', response: () => ({ code: 0, data: [{ version: 'v1', createdAt: daysAgo(10), recordCount: 50000 }, { version: 'v2', createdAt: daysAgo(3), recordCount: 48000 }], message: 'success' }) },
  { url: '/api/datasets/:id/versions/actions/compare', method: 'post', response: () => ({ code: 0, data: { version1: { version: 'v1', recordCount: 50000, fields: 10 }, version2: { version: 'v2', recordCount: 48000, fields: 10 }, diff: { recordCount: -2000, removedFields: 0, addedFields: 0 } }, message: 'success' }) },
  { url: '/api/datasets/:id/versions/actions/rollback', method: 'post', response: () => ({ code: 0, data: null, message: 'success' }) },

  // 2.8 其他操作
  { url: '/api/datasets/:id/export', method: 'get', response: () => ({ code: 0, data: '模拟下载链接', message: 'success' }) },
  { url: '/api/datasets/:id', method: 'delete', response: () => ({ code: 0, data: null, message: '删除成功' }) },
  { url: '/api/datasets/:id/label-status', method: 'patch', response: () => ({ code: 0, data: null, message: 'success' }) },

  /* ==================================================================
     预处理任务 /preprocess-tasks
     ================================================================== */

  // 3.1 列表
  {
    url: '/api/preprocess-tasks',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 10, keyword, processTypes, status, datasetId, startTime, endTime } = query

      const allData = Array.from({ length: 30 }, (_, i) => ({
        id: `pp_${String(i + 1).padStart(3, '0')}`,
        name: `预处理任务 ${i + 1}`,
        datasetId: `dt_${String((i % 5) + 1).padStart(3, '0')}`,
        datasetName: `数据集 ${(i % 5) + 1}`,
        processTypes: [PROCESS_TYPES[i % 4]],
        status: ['pending', 'running', 'success', 'failed'][i % 4],
        progress: ['pending', 'running', 'success', 'failed'][i % 4] === 'running' ? Math.floor(Math.random() * 100) : 100,
        outputVersion: `v${i + 2}`,
        createdAt: daysAgo(i % 10),
      }))

      let filtered = allData
      if (keyword) filtered = filtered.filter((i) => i.name.includes(keyword))
      if (processTypes) {
        const types = Array.isArray(processTypes) ? processTypes : [processTypes]
        filtered = filtered.filter((i) => types.some((t: string) => i.processTypes.includes(t)))
      }
      if (status) filtered = filtered.filter((i) => i.status === status)
      if (datasetId) filtered = filtered.filter((i) => i.datasetId === datasetId)
      if (startTime) filtered = filtered.filter((i) => i.createdAt >= startTime)
      if (endTime) filtered = filtered.filter((i) => i.createdAt <= endTime + 'T23:59:59Z')

      const total = filtered.length
      const start = (Number(page) - 1) * Number(pageSize)
      return { code: 0, data: { list: filtered.slice(start, start + Number(pageSize)), total, page: Number(page), pageSize: Number(pageSize) }, message: 'success' }
    },
  },

  // 3.2 创建
  {
    url: '/api/preprocess-tasks',
    method: 'post',
    response: () => ({ code: 0, data: { id: 'pp_new' }, message: 'success' }),
  },

  // 3.3 数据集版本列表
  {
    url: '/api/preprocess-tasks/datasets/:datasetId/versions',
    method: 'get',
    response: () => ({
      code: 0,
      data: [
        { id: 'v1', name: 'v1', recordCount: 50000, createdAt: daysAgo(15) },
        { id: 'v2', name: 'v2', recordCount: 48000, createdAt: daysAgo(5) },
      ],
      message: 'success',
    }),
  },

  // 3.4 可用数据集
  {
    url: '/api/preprocess-tasks/available-datasets',
    method: 'get',
    response: () => ({
      code: 0,
      data: [
        { id: 'dt_001', name: '用户行为数据集_v1', collectStatus: 'success' },
        { id: 'dt_002', name: '订单数据集_v1', collectStatus: 'success' },
      ],
      message: 'success',
    }),
  },

  // 3.5 任务详情
  {
    url: '/api/preprocess-tasks/:id',
    method: 'get',
    response: ({ params }) => ({
      code: 0,
      data: {
        id: params.id, name: '用户数据预处理任务',
        datasetId: 'dt_001', datasetName: '用户行为数据集',
        processTypes: ['clean', 'dedup', 'format'],
        status: 'success', progress: 100,
        config: { clean: { nullStrategy: 'delete', filterOutlier: true }, dedup: { dedupFields: ['user_id'], keepStrategy: 'first' }, format: { targetFormat: 'csv' } },
        inputVersion: 'v1', outputVersion: 'v2', inputCount: 50000, outputCount: 48000,
        createdAt: daysAgo(5), finishedAt: daysAgo(5),
      },
      message: 'success',
    }),
  },

  // 3.6 执行进度
  {
    url: '/api/preprocess-tasks/:id/progress',
    method: 'get',
    response: () => ({
      code: 0,
      data: {
        id: 'pp_001', status: 'running', progress: 65, currentStep: 2, currentStepName: '去重',
        steps: [
          { step: 1, name: '数据清洗', status: 'completed' },
          { step: 2, name: '数据去重', status: 'running', progress: 30 },
          { step: 3, name: '格式转换', status: 'pending' },
        ],
        processedCount: 32500, totalCount: 50000, estimatedRemainingSeconds: 180,
      },
      message: 'success',
    }),
  },

  // 3.7 前后对比
  {
    url: '/api/preprocess-tasks/:id/comparison',
    method: 'get',
    response: () => ({
      code: 0,
      data: {
        before: { version: 'v1', recordCount: 50000, fields: ['user_id', 'name', 'age', 'email', 'phone'], sampleData: [['1001', '张三', 25, 'zhangsan@example.com', null]] },
        after: { version: 'v2', recordCount: 48000, fields: ['user_id', 'name', 'age', 'email', 'phone'], sampleData: [['1001', '张三', 25, 'zhangsan@example.com', '13800138000']] },
        diff: { recordCountChange: -2000, fieldsAdded: 0, fieldsRemoved: 0, nullRemoved: 2000 },
      },
      message: 'success',
    }),
  },

  // 3.8 执行日志
  {
    url: '/api/preprocess-tasks/:id/logs',
    method: 'get',
    response: () => ({
      code: 0,
      data: [
        { time: daysAgo(0).replace('T', ' ').slice(0, 19), level: 'info', message: '任务开始执行' },
        { time: daysAgo(0).replace('T', ' ').slice(0, 19), level: 'info', message: '开始读取源数据集 v1' },
        { time: daysAgo(0).replace('T', ' ').slice(0, 19), level: 'warning', message: '发现 2000 条空值记录' },
      ],
      message: 'success',
    }),
  },

  // 3.9 结果预览 / 导出
  {
    url: '/api/preprocess-tasks/:id/preview',
    method: 'get',
    response: () => ({
      code: 0,
      data: { columns: ['user_id', 'name', 'age', 'email'], rows: [['1001', '张三', 25, 'zhangsan@example.com'], ['1002', '李四', 30, 'lisi@example.com']] },
      message: 'success',
    }),
  },
  {
    url: '/api/preprocess-tasks/:id/export',
    method: 'get',
    response: () => ({ code: 0, data: '模拟下载链接', message: 'success' }),
  },
] as MockMethod[]
