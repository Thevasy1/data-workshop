import type { MockMethod } from 'vite-plugin-mock'

interface MockRequest {
  query: Record<string, any>
  params: Record<string, string>
}

type DatasourceType = 'api' | 'upload' | 'database' | 'web'
type CollectStatus = 'pending' | 'running' | 'success' | 'failed' | 'paused'

const datasourceOptions: Array<{ id: string; name: string; type: DatasourceType }> = [
  { id: 'ds_001', name: '用户行为API', type: 'api' },
  { id: 'ds_002', name: '订单数据库', type: 'database' },
  { id: 'ds_003', name: '日志文件上传', type: 'upload' },
  { id: 'ds_004', name: '竞品页面抓取', type: 'web' },
]

const datasourceFields = [
  { name: 'user_id', type: 'string', description: '用户ID', source: 'source.user_id' },
  { name: 'name', type: 'string', description: '用户名', source: 'source.name' },
  { name: 'age', type: 'number', description: '年龄', source: 'source.age' },
  { name: 'email', type: 'string', description: '邮箱', source: 'source.email' },
  { name: 'phone', type: 'string', description: '手机号', source: 'source.phone' },
]

const collectStatuses: CollectStatus[] = ['pending', 'running', 'success', 'failed', 'paused']
const collectProgressMap: Record<CollectStatus, number> = {
  pending: 0,
  running: 45,
  success: 100,
  failed: 0,
  paused: 60,
}

const buildDataset = (index: number) => {
  const datasource = datasourceOptions[index % datasourceOptions.length]
  const collectStatus = collectStatuses[index % collectStatuses.length]

  return {
    id: `dt_${String(index + 1).padStart(3, '0')}`,
    name: ['用户行为数据集', '订单明细数据集', '客服日志数据集', '竞品页面数据集'][index % 4],
    datasourceId: datasource.id,
    datasourceName: datasource.name,
    collectStatus,
    collectProgress: collectProgressMap[collectStatus],
    recordCount: [50000, 32000, 18500, 8600, 0][index % 5],
    version: `v${(index % 3) + 1}`,
    isLabeled: index % 3 === 0,
    description: '用于数据标注和模型训练的数据集样例',
    createdAt: '2026-06-16T09:00:00Z',
    updatedAt: '2026-06-18T14:00:00Z',
    collectRules: {
      fieldMappings: [
        { source: 'user_id', target: '用户ID' },
        { source: 'name', target: '用户名' },
        { source: 'age', target: '年龄' },
      ],
      filters: [
        { field: 'age', operator: '>', value: '18' },
      ],
      schedule: index % 2 === 0 ? 'daily' : 'manual',
      cron: '0 0 * * *',
      sourceOptions: {
        method: 'GET',
        sql: 'SELECT * FROM users WHERE age > 18',
        fileFormat: 'csv',
        url: 'https://example.com/list',
        selector: '.item',
      },
    },
  }
}

const getDatasetById = (id: string) => {
  const numericId = Number(id.replace('dt_', '')) || 1
  return buildDataset(Math.max(numericId - 1, 0))
}

export default [
  // 数据源列表
  {
    url: '/api/datasource/list',
    method: 'get',
    response: ({ query }: MockRequest) => {
      const { page = 1, pageSize = 10 } = query
      const list = Array.from({ length: pageSize }, (_, i) => ({
        id: `ds_${String((page - 1) * pageSize + i + 1).padStart(3, '0')}`,
        name: `数据源 ${(page - 1) * pageSize + i + 1}`,
        type: ['api', 'upload', 'database', 'web'][i % 4],
        sourceUrl: `https://api.example.com/source/${i}`,
        status: i % 3 === 0 ? 'active' : 'inactive',
        description: `这是数据源 ${(page - 1) * pageSize + i + 1} 的描述`,
        createdAt: '2026-06-15T10:00:00Z',
        updatedAt: '2026-06-18T14:30:00Z',
      }))
      return { code: 0, data: { list, total: 100, page: Number(page), pageSize: Number(pageSize) }, message: 'success' }
    },
  },
  // 数据源详情
  {
    url: '/api/datasource/detail/:id',
    method: 'get',
    response: ({ params }: MockRequest) => ({
      code: 0,
      data: {
        id: params.id,
        name: '示例数据源',
        type: 'api',
        sourceUrl: 'https://api.example.com/data',
        status: 'active',
        description: '示例数据源描述',
        createdAt: '2026-06-15T10:00:00Z',
        updatedAt: '2026-06-18T14:30:00Z',
      },
      message: 'success',
    }),
  },
  // 创建数据源
  {
    url: '/api/datasource/create',
    method: 'post',
    response: () => ({ code: 0, data: { id: 'ds_new' }, message: 'success' }),
  },
  // 更新数据源
  {
    url: '/api/datasource/update/:id',
    method: 'put',
    response: () => ({ code: 0, data: null, message: 'success' }),
  },
  // 删除数据源
  {
    url: '/api/datasource/delete/:id',
    method: 'delete',
    response: () => ({ code: 0, data: null, message: 'success' }),
  },
  // 获取规则
  {
    url: '/api/datasource/:id/rules',
    method: 'get',
    response: () => ({
      code: 0,
      data: {
        fieldMappings: [
          { source: 'user_id', target: '用户ID' },
          { source: 'name', target: '用户名' },
        ],
        filters: [
          { field: 'age', operator: '>', value: '18' },
        ],
        schedule: 'daily',
        cron: '0 0 * * *',
      },
      message: 'success',
    }),
  },
  // 保存规则
  {
    url: '/api/datasource/:id/rules',
    method: 'post',
    response: () => ({ code: 0, data: null, message: 'success' }),
  },
  // 验证规则
  {
    url: '/api/datasource/:id/rules/validate',
    method: 'post',
    response: () => ({
      code: 0,
      data: [
        { user_id: '1001', name: '张三', age: 25 },
        { user_id: '1002', name: '李四', age: 30 },
      ],
      message: 'success',
    }),
  },
  // 获取字段
  {
    url: '/api/datasource/:id/fields',
    method: 'get',
    response: () => ({
      code: 0,
      data: ['user_id', 'name', 'age', 'email', 'phone'],
      message: 'success',
    }),
  },
  // RESTful 数据源字段
  {
    url: '/api/datasources/:id/fields',
    method: 'get',
    response: () => ({
      code: 0,
      data: datasourceFields,
      message: 'success',
    }),
  },
  // RESTful 数据集列表
  {
    url: '/api/datasets',
    method: 'get',
    response: ({ query }: MockRequest) => {
      const { page = 1, pageSize = 10, keyword = '', datasourceId = '', collectStatus = '' } = query
      const start = (Number(page) - 1) * Number(pageSize)
      const all = Array.from({ length: 50 }, (_, i) => buildDataset(i))
      const filtered = all.filter((item) => {
        const matchKeyword = !keyword || item.name.includes(String(keyword))
        const matchDatasource = !datasourceId || item.datasourceId === datasourceId
        const matchStatus = !collectStatus || item.collectStatus === collectStatus
        return matchKeyword && matchDatasource && matchStatus
      })
      const list = filtered.slice(start, start + Number(pageSize))

      return {
        code: 0,
        data: { list, total: filtered.length, page: Number(page), pageSize: Number(pageSize) },
        message: 'success',
      }
    },
  },
  // RESTful 可选数据源
  {
    url: '/api/datasets/datasource-options',
    method: 'get',
    response: () => ({
      code: 0,
      data: datasourceOptions,
      message: 'success',
    }),
  },
  // RESTful 创建数据集
  {
    url: '/api/datasets',
    method: 'post',
    response: () => ({ code: 0, data: { id: 'dt_new' }, message: 'success' }),
  },
  // RESTful 数据集详情
  {
    url: '/api/datasets/:id',
    method: 'get',
    response: ({ params }: MockRequest) => ({
      code: 0,
      data: {
        ...getDatasetById(params.id),
        fields: datasourceFields,
      },
      message: 'success',
    }),
  },
  // RESTful 数据集字段结构
  {
    url: '/api/datasets/:id/fields',
    method: 'get',
    response: () => ({
      code: 0,
      data: datasourceFields,
      message: 'success',
    }),
  },
  // RESTful 数据集样本预览
  {
    url: '/api/datasets/:id/samples',
    method: 'get',
    response: () => ({
      code: 0,
      data: {
        columns: ['user_id', 'name', 'age', 'email', 'phone'],
        rows: [
          ['1001', '张三', 25, 'zhangsan@example.com', '13800138000'],
          ['1002', '李四', 30, 'lisi@example.com', '13800138001'],
          ['1003', '王五', 28, 'wangwu@example.com', '13800138002'],
          ['1004', '赵六', 34, 'zhaoliu@example.com', '13800138003'],
        ],
      },
      message: 'success',
    }),
  },
  // RESTful 数据集版本
  {
    url: '/api/datasets/:id/versions',
    method: 'get',
    response: () => ({
      code: 0,
      data: [
        { id: 'v1', version: 'v1', recordCount: 50000, fieldCount: 5, createdAt: '2026-06-16T09:00:00Z', description: '初始采集版本' },
        { id: 'v2', version: 'v2', recordCount: 48000, fieldCount: 5, createdAt: '2026-06-18T11:15:00Z', description: '过滤年龄小于18岁记录' },
        { id: 'v3', version: 'v3', recordCount: 47500, fieldCount: 6, createdAt: '2026-06-20T10:30:00Z', description: '补充手机号字段' },
      ],
      message: 'success',
    }),
  },
  // RESTful 版本对比
  {
    url: '/api/datasets/:id/versions/actions/compare',
    method: 'post',
    response: () => ({
      code: 0,
      data: {
        baseVersion: { id: 'v1', version: 'v1', recordCount: 50000, fieldCount: 5, createdAt: '2026-06-16T09:00:00Z', description: '初始采集版本' },
        targetVersion: { id: 'v3', version: 'v3', recordCount: 47500, fieldCount: 6, createdAt: '2026-06-20T10:30:00Z', description: '补充手机号字段' },
        diff: {
          recordCount: -2500,
          addedFields: ['phone'],
          removedFields: [],
          changedFields: ['age'],
        },
      },
      message: 'success',
    }),
  },
  // RESTful 版本回滚
  {
    url: '/api/datasets/:id/versions/actions/rollback',
    method: 'post',
    response: () => ({ code: 0, data: null, message: 'success' }),
  },
  // RESTful 数据集导出
  {
    url: '/api/datasets/:id/export',
    method: 'get',
    response: () => ({ code: 0, data: '模拟导出任务已创建', message: 'success' }),
  },
  // RESTful 标记可标注
  {
    url: '/api/datasets/:id/label-status',
    method: 'patch',
    response: () => ({ code: 0, data: null, message: 'success' }),
  },
  // RESTful 删除数据集
  {
    url: '/api/datasets/:id',
    method: 'delete',
    response: () => ({ code: 0, data: null, message: 'success' }),
  },
  // RESTful 采集流程控制
  {
    url: '/api/datasets/:id/actions/start-collect',
    method: 'post',
    response: () => ({ code: 0, data: null, message: 'success' }),
  },
  {
    url: '/api/datasets/:id/actions/pause-collect',
    method: 'post',
    response: () => ({ code: 0, data: null, message: 'success' }),
  },
  {
    url: '/api/datasets/:id/actions/retry-collect',
    method: 'post',
    response: () => ({ code: 0, data: null, message: 'success' }),
  },
  // RESTful 采集状态和日志
  {
    url: '/api/datasets/:id/status',
    method: 'get',
    response: () => ({
      code: 0,
      data: { status: 'running', progress: 65, message: '采集中...' },
      message: 'success',
    }),
  },
  {
    url: '/api/datasets/:id/logs',
    method: 'get',
    response: () => ({
      code: 0,
      data: [
        { time: '2026-06-20 10:00:01', level: 'info', message: '开始采集数据' },
        { time: '2026-06-20 10:00:05', level: 'info', message: '连接数据源成功' },
        { time: '2026-06-20 10:00:10', level: 'warning', message: '部分字段缺失，已跳过' },
        { time: '2026-06-20 10:01:30', level: 'info', message: '已写入临时数据表' },
      ],
      message: 'success',
    }),
  },
  // 数据集列表
  {
    url: '/api/dataset/list',
    method: 'get',
    response: ({ query }: MockRequest) => {
      const { page = 1, pageSize = 10 } = query
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
      return { code: 0, data: { list, total: 50, page: Number(page), pageSize: Number(pageSize) }, message: 'success' }
    },
  },
  // 可选数据源
  {
    url: '/api/dataset/datasource-options',
    method: 'get',
    response: () => ({
      code: 0,
      data: [
        { id: 'ds_001', name: '用户行为API' },
        { id: 'ds_002', name: '订单数据库' },
        { id: 'ds_003', name: '日志文件上传' },
      ],
      message: 'success',
    }),
  },
  // 创建数据集
  {
    url: '/api/dataset/create',
    method: 'post',
    response: () => ({ code: 0, data: { id: 'dt_new' }, message: 'success' }),
  },
  // 获取配置
  {
    url: '/api/dataset/:id/config',
    method: 'get',
    response: () => ({
      code: 0,
      data: { name: '示例数据集', datasourceId: 'ds_001', config: {} },
      message: 'success',
    }),
  },
  // 更新配置
  {
    url: '/api/dataset/:id/config',
    method: 'put',
    response: () => ({ code: 0, data: null, message: 'success' }),
  },
  // 启动采集
  {
    url: '/api/dataset/:id/start',
    method: 'post',
    response: () => ({ code: 0, data: null, message: 'success' }),
  },
  // 暂停采集
  {
    url: '/api/dataset/:id/pause',
    method: 'post',
    response: () => ({ code: 0, data: null, message: 'success' }),
  },
  // 重新采集
  {
    url: '/api/dataset/:id/retry',
    method: 'post',
    response: () => ({ code: 0, data: null, message: 'success' }),
  },
  // 删除数据集
  {
    url: '/api/dataset/:id',
    method: 'delete',
    response: () => ({ code: 0, data: null, message: 'success' }),
  },
  // 获取状态
  {
    url: '/api/dataset/:id/status',
    method: 'get',
    response: () => ({
      code: 0,
      data: { status: 'running', progress: 65, message: '采集中...' },
      message: 'success',
    }),
  },
  // 获取日志
  {
    url: '/api/dataset/:id/logs',
    method: 'get',
    response: () => ({
      code: 0,
      data: [
        { time: '2026-06-20 10:00:01', level: 'info', message: '开始采集数据' },
        { time: '2026-06-20 10:00:05', level: 'info', message: '连接数据源成功' },
        { time: '2026-06-20 10:00:10', level: 'warning', message: '部分字段缺失' },
      ],
      message: 'success',
    }),
  },
  // 预处理任务列表
  {
    url: '/api/preprocess/list',
    method: 'get',
    response: ({ query }: MockRequest) => {
      const { page = 1, pageSize = 10 } = query
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
      return { code: 0, data: { list, total: 30, page: Number(page), pageSize: Number(pageSize) }, message: 'success' }
    },
  },
  // 可用数据集
  {
    url: '/api/preprocess/available-datasets',
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
  // 创建预处理
  {
    url: '/api/preprocess/create',
    method: 'post',
    response: () => ({ code: 0, data: { id: 'pp_new' }, message: 'success' }),
  },
  // 任务详情
  {
    url: '/api/preprocess/:id/detail',
    method: 'get',
    response: () => ({
      code: 0,
      data: { id: 'pp_001', name: '清洗任务', datasetId: 'dt_001', processType: 'clean', status: 'success' },
      message: 'success',
    }),
  },
  // 版本列表
  {
    url: '/api/preprocess/:id/versions',
    method: 'get',
    response: () => ({
      code: 0,
      data: [
        { version: 'v1', createdAt: '2026-06-15T10:00:00Z', recordCount: 50000 },
        { version: 'v2', createdAt: '2026-06-18T11:00:00Z', recordCount: 48000 },
      ],
      message: 'success',
    }),
  },
  // 版本对比
  {
    url: '/api/preprocess/:id/compare',
    method: 'post',
    response: () => ({
      code: 0,
      data: {
        version1: { version: 'v1', recordCount: 50000, fields: 10 },
        version2: { version: 'v2', recordCount: 48000, fields: 10 },
        diff: { recordCount: -2000, removedFields: 0, addedFields: 0 },
      },
      message: 'success',
    }),
  },
  // 回滚
  {
    url: '/api/preprocess/:id/rollback',
    method: 'post',
    response: () => ({ code: 0, data: null, message: 'success' }),
  },
  // 结果预览
  {
    url: '/api/preprocess/:id/preview',
    method: 'get',
    response: () => ({
      code: 0,
      data: {
        columns: ['user_id', 'name', 'age', 'email'],
        rows: [
          ['1001', '张三', '25', 'zhangsan@example.com'],
          ['1002', '李四', '30', 'lisi@example.com'],
        ],
      },
      message: 'success',
    }),
  },
  // 导出
  {
    url: '/api/preprocess/:id/export',
    method: 'get',
    response: () => ({ code: 0, data: '模拟下载链接', message: 'success' }),
  },
] as MockMethod[]
