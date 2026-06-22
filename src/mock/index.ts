import { MockMethod } from 'vite-plugin-mock'

const collectModeMap: Record<string, string> = {
  full: '全量采集',
  incremental: '增量采集',
  scheduled: '定时采集',
}

const datasetRecords = [
  {
    id: 'dt_001',
    name: '客服问答语料集',
    description: '用于客服场景文本总结、多轮对话和实体识别任务的数据集。',
    dataType: 'text',
    taskType: '文本总结',
    sourceType: 'api',
    datasourceId: 'ds_001',
    datasourceName: '用户行为API',
    collectStatus: 'success',
    collectProgress: 100,
    recordCount: 12860,
    tags: ['训练集', '标注任务'],
    ruleConfig: {
      collectMode: 'full',
      sampleLimit: 20000,
      qualityChecks: ['empty', 'duplicate'],
      ruleNote: '按接口返回字段生成文本样本，并去除空值记录。',
    },
    createdAt: '2026-06-16 09:00:00',
    updatedAt: '2026-06-21 10:30:00',
  },
  {
    id: 'dt_002',
    name: '设备巡检图片集',
    description: '用于 2D 图像标注和视觉质检训练的数据集。',
    dataType: 'image',
    taskType: '2D图像',
    sourceType: 'upload',
    datasourceId: 'ds_003',
    datasourceName: '日志文件上传',
    collectStatus: 'pending',
    collectProgress: 0,
    recordCount: 2340,
    tags: ['验证集'],
    ruleConfig: {
      collectMode: 'incremental',
      sampleLimit: 5000,
      qualityChecks: ['empty', 'format'],
      ruleNote: '按上传批次增量导入图片，并检查文件格式。',
    },
    createdAt: '2026-06-18 14:20:00',
    updatedAt: '2026-06-20 17:10:00',
  },
  {
    id: 'dt_003',
    name: '语音转录训练集',
    description: '面向音频转文字任务的音视频数据集。',
    dataType: 'audioVideo',
    taskType: '语音转录',
    sourceType: 'database',
    datasourceId: 'ds_002',
    datasourceName: '订单数据库',
    collectStatus: 'running',
    collectProgress: 45,
    recordCount: 8600,
    tags: ['训练集', '高优先级'],
    ruleConfig: {
      collectMode: 'scheduled',
      sampleLimit: 12000,
      qualityChecks: ['duplicate', 'format'],
      ruleNote: '每天定时同步新增音频样本，并执行重复样本检测。',
    },
    createdAt: '2026-06-19 11:00:00',
    updatedAt: '2026-06-21 13:40:00',
  },
]

const normalizeDatasetRecord = (record: any) => ({
  ...record,
  collectModeLabel: collectModeMap[record.ruleConfig?.collectMode] || '全量采集',
})

const getMockId = ({ params, query, url }: any) => {
  if (params?.id) return params.id
  if (query?.id) return query.id
  return String(url || '').split('?')[0].split('/').filter(Boolean).pop()
}

export default [
  // 数据源列表
  {
    url: '/api/datasource/list',
    method: 'get',
    response: ({ query }: any) => {
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
    response: ({ params }: any) => ({
      code: 0,
      data: {
        id: params?.id || 'ds_001',
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
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10, keyword = '', status = '', dataType = '', sourceType = '' } = query
      const filtered = datasetRecords.filter((item) => {
        return (!keyword || item.name.includes(keyword))
          && (!status || item.collectStatus === status)
          && (!dataType || item.dataType === dataType)
          && (!sourceType || item.sourceType === sourceType)
      })
      const start = (Number(page) - 1) * Number(pageSize)
      const list = filtered.slice(start, start + Number(pageSize)).map(normalizeDatasetRecord)
      return { code: 0, data: { list, total: filtered.length, page: Number(page), pageSize: Number(pageSize) }, message: 'success' }
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
    response: ({ body }: any) => {
      const id = `dt_${String(datasetRecords.length + 1).padStart(3, '0')}`
      datasetRecords.unshift({
        id,
        ...body,
        datasourceId: `ds_${body.sourceType || 'upload'}`,
        datasourceName: ({ upload: '本地上传', api: 'API接口', database: '数据库', web: 'Web抓取' } as Record<string, string>)[body.sourceType] || '本地上传',
        collectStatus: 'pending',
        collectProgress: 0,
        recordCount: body.ruleConfig?.sampleLimit || 0,
        createdAt: '2026-06-22 09:00:00',
        updatedAt: '2026-06-22 09:00:00',
      })
      return { code: 0, data: { id }, message: 'success' }
    },
  },
  // 更新数据集
  {
    url: '/api/dataset/:id',
    method: 'put',
    response: ({ params, query, url, body }: any) => {
      const id = getMockId({ params, query, url }) || body?.id
      const index = datasetRecords.findIndex((item) => item.id === id)
      if (index >= 0) {
        datasetRecords[index] = {
          ...datasetRecords[index],
          ...body,
          datasourceName: ({ upload: '本地上传', api: 'API接口', database: '数据库', web: 'Web抓取' } as Record<string, string>)[body.sourceType] || datasetRecords[index].datasourceName,
          recordCount: body.ruleConfig?.sampleLimit || datasetRecords[index].recordCount,
          updatedAt: '2026-06-22 09:30:00',
        }
      }
      return { code: 0, data: null, message: 'success' }
    },
  },
  // 获取配置
  {
    url: '/api/dataset/:id/config',
    method: 'get',
    response: ({ params, query, url }: any) => {
      const id = getMockId({ params, query, url })
      const record = datasetRecords.find((item) => item.id === id) || datasetRecords[0]
      return {
        code: 0,
        data: normalizeDatasetRecord(record),
        message: 'success',
      }
    },
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
    response: ({ params, query, url }: any) => {
      const id = getMockId({ params, query, url })
      const index = datasetRecords.findIndex((item) => item.id === id)
      if (index >= 0) {
        datasetRecords.splice(index, 1)
      }
      return { code: 0, data: null, message: 'success' }
    },
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
    response: ({ query }: any) => {
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
