import { MockMethod } from 'vite-plugin-mock'

interface MockContext {
  query?: Record<string, any>
  params?: Record<string, any>
}

export default [
  // 数据源列表
  {
    url: '/api/datasource/list',
    method: 'get',
    response: ({ query = {} }: MockContext) => {
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
    response: ({ params = {} }: MockContext) => ({
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
  // 数据集列表
  {
    url: '/api/dataset/list',
    method: 'get',
    response: ({ query = {} }: MockContext) => {
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
    response: ({ query = {} }: MockContext) => {
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
    response: ({ params = {} }: MockContext) => ({
      code: 0,
      data: {
        id: params.id,
        name: '用户数据清洗任务',
        datasetId: 'dt_001',
        datasetName: '用户行为数据集',
        processTypes: ['clean', 'dedup'],
        status: 'success',
        progress: 100,
        config: {
          clean: { nullStrategy: 'delete', filterOutlier: true },
          dedup: { dedupFields: ['user_id', 'email'], keepStrategy: 'first' },
        },
        inputVersion: 'v1',
        outputVersion: 'v2',
        inputCount: 50000,
        outputCount: 48000,
        createdAt: '2026-06-18T11:00:00Z',
        finishedAt: '2026-06-18T11:15:00Z',
      },
      message: 'success',
    }),
  },
  // 执行进度
  {
    url: '/api/preprocess/:id/progress',
    method: 'get',
    response: ({ params = {} }: MockContext) => ({
      code: 0,
      data: {
        id: params.id,
        status: 'success',
        progress: 100,
        currentStep: '处理完成',
        processedCount: 50000,
        totalCount: 50000,
        estimatedRemainingSeconds: 0,
      },
      message: 'success',
    }),
  },
  // 前后对比
  {
    url: '/api/preprocess/:id/comparison',
    method: 'get',
    response: () => ({
      code: 0,
      data: {
        before: {
          version: 'v1',
          recordCount: 50000,
          fields: ['user_id', 'name', 'age', 'email', 'phone'],
          sampleData: [
            ['1001', '张三', 25, 'zhangsan@example.com', null],
            ['1002', '李四', 31, 'lisi@example.com', null],
          ],
        },
        after: {
          version: 'v2',
          recordCount: 48000,
          fields: ['user_id', 'name', 'age', 'email', 'phone'],
          sampleData: [
            ['1001', '张三', 25, 'zhangsan@example.com', '13800138000'],
            ['1002', '李四', 31, 'lisi@example.com', '13900139000'],
          ],
        },
        diff: {
          recordCountChange: -2000,
          fieldsAdded: 0,
          fieldsRemoved: 0,
          nullRemoved: 2000,
        },
      },
      message: 'success',
    }),
  },
  // 执行日志
  {
    url: '/api/preprocess/:id/logs',
    method: 'get',
    response: () => ({
      code: 0,
      data: [
        { time: '2026-06-18 11:00:01', level: 'info', message: '任务开始执行' },
        { time: '2026-06-18 11:00:05', level: 'info', message: '开始读取源数据集 v1' },
        { time: '2026-06-18 11:05:00', level: 'warning', message: '发现 2000 条空值记录' },
        { time: '2026-06-18 11:05:02', level: 'info', message: '已删除 2000 条空值记录' },
        { time: '2026-06-18 11:10:00', level: 'info', message: '异常值过滤完成，过滤 0 条' },
        { time: '2026-06-18 11:15:00', level: 'info', message: '任务执行完成，输出 v2 版本' },
      ],
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
        columns: ['user_id', 'name', 'age', 'email', 'phone'],
        rows: [
          ['1001', '张三', '25', 'zhangsan@example.com', '13800138000'],
          ['1002', '李四', '30', 'lisi@example.com', '13900139000'],
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
