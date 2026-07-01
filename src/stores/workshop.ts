import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

export type SourceType = 'API' | '本地上传' | '数据库' | 'Web抓取'
export type SourceStatus = 'connected' | 'warning' | 'offline'
export type CollectStatus = 'pending' | 'running' | 'success' | 'failed' | 'paused'
export type PreprocessStatus = 'waiting' | 'running' | 'success' | 'failed'

export interface Datasource {
  id: string
  name: string
  type: SourceType
  owner: string
  status: SourceStatus
  address: string
  description: string
  fields: Array<{ name: string; type: string; comment: string }>
  testRecords: Array<{ time: string; result: string; duration: string }>
  createdAt: string
}

export interface Dataset {
  id: string
  name: string
  datasourceId: string
  datasourceName: string
  owner: string
  collectStatus: CollectStatus
  collectProgress: number
  recordCount: number
  fieldCount: number
  version: string
  labelEnabled: boolean
  description: string
  schedule: string
  filters: string[]
  fields: Array<{ name: string; type: string; source: string; comment: string }>
  samples: Array<Record<string, string | number>>
  versions: Array<{ name: string; recordCount: number; createdAt: string; description: string }>
  logs: Array<{ time: string; message: string }>
  createdAt: string
}

export interface PreprocessTask {
  id: string
  name: string
  datasetId: string
  datasetName: string
  status: PreprocessStatus
  progress: number
  inputCount: number
  outputCount: number
  outputDatasetId: string
  rules: string[]
  beforeRows: Array<Record<string, string | number>>
  afterRows: Array<Record<string, string | number>>
  logs: Array<{ time: string; level: string; message: string }>
  createdAt: string
}

export interface FieldMapping {
  source: string
  target: string
  type: string
  comment: string
}

const STORAGE_KEY = 'data-workshop-demo-state-v3'
const nowText = () => new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
const nextId = (prefix: string, items: Array<{ id: string }>) => {
  const max = items.reduce((value, item) => {
    const current = Number(item.id.replace(`${prefix}_`, ''))
    return Number.isFinite(current) ? Math.max(value, current) : value
  }, 0)
  return `${prefix}_${String(max + 1).padStart(3, '0')}`
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const seedDatasources: Datasource[] = [
  {
    id: 'ds_001',
    name: '用户行为 API',
    type: 'API',
    owner: '数据平台组',
    status: 'connected',
    address: 'https://api.example.com/user-events',
    description: '接入移动端点击、浏览、搜索、支付等行为事件。',
    fields: [
      { name: 'user_id', type: 'string', comment: '用户编号' },
      { name: 'event_type', type: 'string', comment: '行为类型' },
      { name: 'event_time', type: 'datetime', comment: '事件时间' },
      { name: 'channel', type: 'string', comment: '渠道来源' },
      { name: 'device', type: 'string', comment: '设备类型' },
    ],
    testRecords: [
      { time: '2026-07-01 09:20:18', result: '连接成功，返回 200', duration: '118ms' },
      { time: '2026-06-30 18:42:03', result: '连接成功，字段解析正常', duration: '126ms' },
    ],
    createdAt: '2026-06-28 10:22:00',
  },
  {
    id: 'ds_002',
    name: '订单主题数据库',
    type: '数据库',
    owner: '经营分析组',
    status: 'connected',
    address: 'jdbc:mysql://10.10.8.16:3306/order_dw',
    description: '同步订单、支付、退款、地区、渠道等业务表。',
    fields: [
      { name: 'order_id', type: 'string', comment: '订单编号' },
      { name: 'pay_amount', type: 'decimal', comment: '支付金额' },
      { name: 'region', type: 'string', comment: '地区' },
      { name: 'pay_channel', type: 'string', comment: '支付渠道' },
      { name: 'refund_flag', type: 'boolean', comment: '是否退款' },
    ],
    testRecords: [{ time: '2026-07-01 08:32:31', result: '连接成功，采样 200 条', duration: '242ms' }],
    createdAt: '2026-06-27 16:18:00',
  },
  {
    id: 'ds_003',
    name: '行业新闻抓取源',
    type: 'Web抓取',
    owner: '语料建设组',
    status: 'warning',
    address: 'https://news.example.com/list',
    description: '定时抓取行业资讯标题、正文、发布时间和标签。',
    fields: [
      { name: 'title', type: 'string', comment: '标题' },
      { name: 'content', type: 'text', comment: '正文' },
      { name: 'published_at', type: 'datetime', comment: '发布时间' },
      { name: 'topic', type: 'string', comment: '主题标签' },
    ],
    testRecords: [{ time: '2026-07-01 07:12:44', result: '连接成功，部分页面解析较慢', duration: '690ms' }],
    createdAt: '2026-06-25 11:06:00',
  },
  {
    id: 'ds_004',
    name: '客服问答上传文件',
    type: '本地上传',
    owner: '客服运营组',
    status: 'connected',
    address: '/upload/faq_2026_q2.xlsx',
    description: '本地 Excel 上传的客服问答语料和分类标签。',
    fields: [
      { name: 'question', type: 'text', comment: '问题' },
      { name: 'answer', type: 'text', comment: '答案' },
      { name: 'category', type: 'string', comment: '类别' },
      { name: 'satisfaction', type: 'number', comment: '满意度' },
    ],
    testRecords: [{ time: '2026-06-30 14:36:21', result: '文件读取成功，编码 UTF-8', duration: '64ms' }],
    createdAt: '2026-06-24 15:30:00',
  },
  {
    id: 'ds_005',
    name: '设备传感器流',
    type: 'API',
    owner: '物联监控组',
    status: 'connected',
    address: 'https://api.example.com/iot/sensors',
    description: '设备温度、电压、负载和告警状态的准实时数据。',
    fields: [
      { name: 'device_id', type: 'string', comment: '设备编号' },
      { name: 'temperature', type: 'number', comment: '温度' },
      { name: 'voltage', type: 'number', comment: '电压' },
      { name: 'alarm_level', type: 'string', comment: '告警等级' },
    ],
    testRecords: [{ time: '2026-07-01 10:18:33', result: '连接成功，流式采样正常', duration: '88ms' }],
    createdAt: '2026-06-29 09:45:00',
  },
]

const seedDatasets: Dataset[] = [
  {
    id: 'dt_001',
    name: '用户行为宽表',
    datasourceId: 'ds_001',
    datasourceName: '用户行为 API',
    owner: '成员4',
    collectStatus: 'running',
    collectProgress: 72,
    recordCount: 128640,
    fieldCount: 5,
    version: 'v2.1',
    labelEnabled: true,
    description: '用于用户画像、行为路径分析和模型特征加工的数据集。',
    schedule: '每日 02:00',
    filters: ['event_time >= 最近30天', 'event_type 非空'],
    fields: [
      { name: 'user_id', type: 'string', source: 'user_id', comment: '用户编号' },
      { name: 'event_type', type: 'string', source: 'event_type', comment: '行为类型' },
      { name: 'event_time', type: 'datetime', source: 'event_time', comment: '事件时间' },
      { name: 'channel', type: 'string', source: 'channel', comment: '渠道来源' },
      { name: 'device', type: 'string', source: 'device', comment: '设备类型' },
    ],
    samples: [
      { user_id: 'U10021', event_type: 'click', event_time: '2026-07-01 08:13:21', channel: 'app', device: 'ios' },
      { user_id: 'U10033', event_type: 'pay', event_time: '2026-07-01 08:14:02', channel: 'miniapp', device: 'android' },
      { user_id: 'U10046', event_type: 'search', event_time: '2026-07-01 08:15:19', channel: 'web', device: 'pc' },
      { user_id: 'U10051', event_type: 'browse', event_time: '2026-07-01 08:16:47', channel: 'app', device: 'android' },
    ],
    versions: [
      { name: 'v2.1', recordCount: 128640, createdAt: '2026-07-01 07:40:00', description: '补充设备类型字段' },
      { name: 'v2.0', recordCount: 120330, createdAt: '2026-06-30 07:40:00', description: '新增用户路径聚合' },
    ],
    logs: [
      { time: '2026-07-01 07:30:00', message: '采集任务启动' },
      { time: '2026-07-01 07:36:00', message: '已完成字段映射和过滤规则校验' },
    ],
    createdAt: '2026-06-28 11:10:00',
  },
  {
    id: 'dt_002',
    name: '订单分析主题集',
    datasourceId: 'ds_002',
    datasourceName: '订单主题数据库',
    owner: '成员4',
    collectStatus: 'success',
    collectProgress: 100,
    recordCount: 92380,
    fieldCount: 5,
    version: 'v1.4',
    labelEnabled: false,
    description: '面向经营分析的订单主题数据集。',
    schedule: '每周一 01:00',
    filters: ['pay_amount > 0', 'refund_flag = false'],
    fields: [
      { name: 'order_id', type: 'string', source: 'order_id', comment: '订单编号' },
      { name: 'pay_amount', type: 'decimal', source: 'pay_amount', comment: '支付金额' },
      { name: 'region', type: 'string', source: 'region', comment: '地区' },
      { name: 'pay_channel', type: 'string', source: 'pay_channel', comment: '支付渠道' },
      { name: 'refund_flag', type: 'boolean', source: 'refund_flag', comment: '是否退款' },
    ],
    samples: [
      { order_id: 'O20260701001', pay_amount: 189, region: '华东', pay_channel: '微信', refund_flag: 'false' },
      { order_id: 'O20260701002', pay_amount: 76, region: '华南', pay_channel: '支付宝', refund_flag: 'false' },
      { order_id: 'O20260701003', pay_amount: 324, region: '华北', pay_channel: '银行卡', refund_flag: 'false' },
    ],
    versions: [{ name: 'v1.4', recordCount: 92380, createdAt: '2026-06-30 03:10:00', description: '过滤退款订单' }],
    logs: [{ time: '2026-06-30 03:10:00', message: '采集完成，生成 v1.4' }],
    createdAt: '2026-06-27 12:20:00',
  },
  {
    id: 'dt_003',
    name: '行业新闻语料集',
    datasourceId: 'ds_003',
    datasourceName: '行业新闻抓取源',
    owner: '成员4',
    collectStatus: 'failed',
    collectProgress: 41,
    recordCount: 18620,
    fieldCount: 4,
    version: 'v1.0',
    labelEnabled: true,
    description: '用于文本分类、摘要和热点分析的行业新闻语料。',
    schedule: '每 6 小时',
    filters: ['title 非空', 'content 长度 > 100'],
    fields: [
      { name: 'title', type: 'string', source: 'title', comment: '标题' },
      { name: 'content', type: 'text', source: 'content', comment: '正文' },
      { name: 'published_at', type: 'datetime', source: 'published_at', comment: '发布时间' },
      { name: 'topic', type: 'string', source: 'topic', comment: '主题标签' },
    ],
    samples: [
      { title: 'AI 平台建设提速', content: '行业平台持续推进...', published_at: '2026-07-01', topic: 'AI平台' },
      { title: '数据治理进入新阶段', content: '企业数据资产化...', published_at: '2026-06-30', topic: '数据治理' },
    ],
    versions: [{ name: 'v1.0', recordCount: 18620, createdAt: '2026-06-28 22:12:00', description: '初始采集版本' }],
    logs: [
      { time: '2026-07-01 06:00:00', message: '采集启动' },
      { time: '2026-07-01 06:14:00', message: '页面解析超时，任务失败' },
    ],
    createdAt: '2026-06-25 17:46:00',
  },
  {
    id: 'dt_004',
    name: '客服问答知识集',
    datasourceId: 'ds_004',
    datasourceName: '客服问答上传文件',
    owner: '成员4',
    collectStatus: 'success',
    collectProgress: 100,
    recordCount: 15420,
    fieldCount: 4,
    version: 'v1.2',
    labelEnabled: true,
    description: '用于智能客服问答匹配、意图识别和知识库标注。',
    schedule: '手动执行',
    filters: ['question 非空', 'answer 非空'],
    fields: [
      { name: 'question', type: 'text', source: 'question', comment: '问题' },
      { name: 'answer', type: 'text', source: 'answer', comment: '答案' },
      { name: 'category', type: 'string', source: 'category', comment: '类别' },
      { name: 'satisfaction', type: 'number', source: 'satisfaction', comment: '满意度' },
    ],
    samples: [
      { question: '如何修改收货地址？', answer: '进入订单详情后点击地址修改。', category: '订单', satisfaction: 4.8 },
      { question: '发票在哪里申请？', answer: '在个人中心的发票管理中申请。', category: '财务', satisfaction: 4.6 },
      { question: '会员积分多久到账？', answer: '订单完成后 24 小时内到账。', category: '会员', satisfaction: 4.7 },
    ],
    versions: [{ name: 'v1.2', recordCount: 15420, createdAt: '2026-06-30 15:05:00', description: '补充满意度字段' }],
    logs: [{ time: '2026-06-30 15:05:00', message: '本地文件解析完成，生成 v1.2' }],
    createdAt: '2026-06-24 16:00:00',
  },
  {
    id: 'dt_005',
    name: '设备异常监控集',
    datasourceId: 'ds_005',
    datasourceName: '设备传感器流',
    owner: '成员4',
    collectStatus: 'paused',
    collectProgress: 56,
    recordCount: 45680,
    fieldCount: 4,
    version: 'v0.9',
    labelEnabled: false,
    description: '用于设备异常检测和告警等级预测。',
    schedule: '每 10 分钟',
    filters: ['temperature 非空', 'alarm_level in normal,warning,danger'],
    fields: [
      { name: 'device_id', type: 'string', source: 'device_id', comment: '设备编号' },
      { name: 'temperature', type: 'number', source: 'temperature', comment: '温度' },
      { name: 'voltage', type: 'number', source: 'voltage', comment: '电压' },
      { name: 'alarm_level', type: 'string', source: 'alarm_level', comment: '告警等级' },
    ],
    samples: [
      { device_id: 'D-1001', temperature: 36.8, voltage: 220.4, alarm_level: 'normal' },
      { device_id: 'D-1002', temperature: 62.1, voltage: 217.9, alarm_level: 'warning' },
      { device_id: 'D-1003', temperature: 79.6, voltage: 211.5, alarm_level: 'danger' },
    ],
    versions: [{ name: 'v0.9', recordCount: 45680, createdAt: '2026-07-01 09:52:00', description: '初始监控版本' }],
    logs: [{ time: '2026-07-01 10:04:00', message: '手动暂停采集任务' }],
    createdAt: '2026-06-29 10:10:00',
  },
]

const seedPreprocessTasks: PreprocessTask[] = [
  {
    id: 'pp_001',
    name: '用户行为宽表清洗任务',
    datasetId: 'dt_001',
    datasetName: '用户行为宽表',
    status: 'running',
    progress: 64,
    inputCount: 128640,
    outputCount: 125900,
    outputDatasetId: 'dt_001',
    rules: ['空值清洗', '事件类型标准化', '用户ID去重'],
    beforeRows: [{ user_id: '', event_type: 'CLICK', event_time: '2026/07/01 08:13', channel: 'App', device: 'IOS' }],
    afterRows: [{ user_id: 'UNKNOWN', event_type: 'click', event_time: '2026-07-01 08:13:00', channel: 'app', device: 'ios' }],
    logs: [
      { time: '2026-07-01 10:01:00', level: 'info', message: '任务创建成功' },
      { time: '2026-07-01 10:04:00', level: 'info', message: '正在执行标准化规则' },
    ],
    createdAt: '2026-07-01 10:00:00',
  },
  {
    id: 'pp_002',
    name: '订单金额格式转换',
    datasetId: 'dt_002',
    datasetName: '订单分析主题集',
    status: 'success',
    progress: 100,
    inputCount: 92380,
    outputCount: 92380,
    outputDatasetId: 'dt_002',
    rules: ['金额字段 decimal 转换', '地区名称标准化'],
    beforeRows: [{ order_id: 'O20260701001', pay_amount: '189.00', region: 'East', pay_channel: 'wx', refund_flag: '0' }],
    afterRows: [{ order_id: 'O20260701001', pay_amount: 189, region: '华东', pay_channel: '微信', refund_flag: 'false' }],
    logs: [{ time: '2026-06-30 11:28:00', level: 'info', message: '输出新版本 v1.5' }],
    createdAt: '2026-06-30 11:20:00',
  },
]

function normalizeRow(row: Record<string, string | number>) {
  const output: Record<string, string | number> = {}
  Object.entries(row).forEach(([key, value]) => {
    if (typeof value === 'number') {
      output[key] = Number(value.toFixed(2))
      return
    }
    const text = String(value).trim()
    output[key] = text
      .replace(/\//g, '-')
      .replace(/\bCLICK\b/g, 'click')
      .replace(/\bApp\b/g, 'app')
      .replace(/\bIOS\b/g, 'ios')
      .replace(/\bEast\b/g, '华东')
      .replace(/\bwx\b/g, '微信')
      .replace(/\b0\b/g, 'false')
  })
  return output
}

function buildValue(field: { name: string; type: string }, index: number) {
  if (field.type === 'number' || field.type === 'decimal') return Number((Math.random() * 1000 + index).toFixed(2))
  if (field.type === 'datetime') return `2026-07-0${Math.min(index, 9)} 09:${String(10 + index).padStart(2, '0')}:00`
  if (field.type === 'boolean') return index % 2 === 0 ? 'true' : 'false'
  return `${field.name}_${index}`
}

function buildRowsFromDatasource(source?: Datasource, mappings?: FieldMapping[]) {
  if (!source) return []
  const activeMappings =
    mappings?.length ? mappings : source.fields.map((field) => ({ source: field.name, target: field.name, type: field.type, comment: field.comment }))
  const rows: Array<Record<string, string | number>> = []
  for (let index = 1; index <= 5; index += 1) {
    const row: Record<string, string | number> = {}
    activeMappings.forEach((mapping) => {
      row[mapping.target || mapping.source] = buildValue({ name: mapping.source, type: mapping.type }, index)
    })
    rows.push(row)
  }
  return rows
}

function defaultFieldsByType(type: SourceType) {
  if (type === 'API') {
    return [
      { name: 'id', type: 'string', comment: '业务编号' },
      { name: 'event_time', type: 'datetime', comment: '事件时间' },
      { name: 'payload', type: 'text', comment: '接口返回内容' },
    ]
  }
  if (type === '本地上传') {
    return [
      { name: 'row_id', type: 'string', comment: '行编号' },
      { name: 'content', type: 'text', comment: '文件内容' },
      { name: 'category', type: 'string', comment: '分类' },
    ]
  }
  if (type === '数据库') {
    return [
      { name: 'id', type: 'string', comment: '主键编号' },
      { name: 'amount', type: 'decimal', comment: '金额指标' },
      { name: 'created_at', type: 'datetime', comment: '创建时间' },
    ]
  }
  return [
    { name: 'title', type: 'string', comment: '页面标题' },
    { name: 'url', type: 'string', comment: '页面地址' },
    { name: 'content', type: 'text', comment: '正文内容' },
  ]
}

function loadState() {
  if (typeof localStorage === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as {
      datasources: Datasource[]
      datasets: Dataset[]
      preprocessTasks: PreprocessTask[]
    } | null
  } catch {
    return null
  }
}

export const useWorkshopStore = defineStore('workshop', () => {
  const savedState = loadState()
  const datasources = ref<Datasource[]>(savedState?.datasources || clone(seedDatasources))
  const datasets = ref<Dataset[]>(savedState?.datasets || clone(seedDatasets))
  const preprocessTasks = ref<PreprocessTask[]>(savedState?.preprocessTasks || clone(seedPreprocessTasks))

  const dashboardStats = computed(() => ({
    datasourceCount: datasources.value.length,
    datasetCount: datasets.value.length,
    preprocessCount: preprocessTasks.value.length,
    todayTaskCount: preprocessTasks.value.filter((item) => item.createdAt.startsWith('2026-07-01')).length,
    successRate: Math.round((datasets.value.filter((item) => item.collectStatus === 'success').length / Math.max(datasets.value.length, 1)) * 100),
    failedTaskCount: datasets.value.filter((item) => item.collectStatus === 'failed').length,
  }))

  watch(
    [datasources, datasets, preprocessTasks],
    () => {
      if (typeof localStorage === 'undefined') return
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          datasources: datasources.value,
          datasets: datasets.value,
          preprocessTasks: preprocessTasks.value,
        }),
      )
    },
    { deep: true },
  )

  function findDatasource(id: string) {
    return datasources.value.find((item) => item.id === id)
  }

  function findDataset(id: string) {
    return datasets.value.find((item) => item.id === id)
  }

  function findTask(id: string) {
    return preprocessTasks.value.find((item) => item.id === id)
  }

  function saveDatasource(payload: Omit<Datasource, 'id' | 'fields' | 'testRecords' | 'createdAt'> & { id?: string }) {
    if (payload.id) {
      const current = findDatasource(payload.id)
      if (current) Object.assign(current, payload)
      return payload.id
    }

    const id = nextId('ds', datasources.value)
    datasources.value.unshift({
      ...payload,
      id,
      fields: defaultFieldsByType(payload.type),
      testRecords: [{ time: nowText(), result: '保存后自动测试成功', duration: '96ms' }],
      createdAt: nowText(),
    })
    return id
  }

  function testDatasource(id: string) {
    const current = findDatasource(id)
    if (!current) return
    current.status = 'connected'
    current.testRecords.unshift({ time: nowText(), result: '手动测试成功，字段结构可读取', duration: `${Math.floor(Math.random() * 120 + 60)}ms` })
  }

  function deleteDatasource(id: string) {
    datasources.value = datasources.value.filter((item) => item.id !== id)
  }

  function createDataset(payload: {
    name: string
    datasourceId: string
    owner: string
    description: string
    schedule: string
    filters: string[]
    fieldMappings?: FieldMapping[]
  }) {
    const source = findDatasource(payload.datasourceId)
    const fieldMappings =
      payload.fieldMappings?.filter((item) => item.source && item.target) ||
      (source?.fields || []).map((field) => ({ source: field.name, target: field.name, type: field.type, comment: field.comment }))
    const samples = buildRowsFromDatasource(source, fieldMappings)
    const id = nextId('dt', datasets.value)
    datasets.value.unshift({
      id,
      name: payload.name,
      datasourceId: payload.datasourceId,
      datasourceName: source?.name || '未知数据源',
      owner: payload.owner,
      collectStatus: 'success',
      collectProgress: 100,
      recordCount: samples.length,
      fieldCount: fieldMappings.length,
      version: 'v1.0',
      labelEnabled: false,
      description: payload.description,
      schedule: payload.schedule,
      filters: payload.filters,
      fields: fieldMappings.map((field) => ({
        name: field.target,
        type: field.type,
        source: field.source,
        comment: field.comment || '字段映射生成',
      })),
      samples,
      versions: [{ name: 'v1.0', recordCount: samples.length, createdAt: nowText(), description: '新建数据集初始版本，已生成测试样本' }],
      logs: [
        { time: nowText(), message: '数据集已创建' },
        { time: nowText(), message: '模拟采集完成，已生成样本数据' },
      ],
      createdAt: nowText(),
    })
    return id
  }

  function deleteDataset(id: string) {
    datasets.value = datasets.value.filter((item) => item.id !== id)
  }

  function setDatasetLabel(id: string, labelEnabled: boolean) {
    const item = findDataset(id)
    if (item) item.labelEnabled = labelEnabled
  }

  function rollbackDatasetVersion(id: string, versionName: string) {
    const item = findDataset(id)
    const version = item?.versions.find((entry) => entry.name === versionName)
    if (!item || !version) return
    item.version = version.name
    item.recordCount = version.recordCount
    item.logs.unshift({ time: nowText(), message: `已回滚到版本 ${version.name}` })
  }

  function createPreprocessTask(payload: { name: string; datasetId: string; rules: string[] }) {
    const dataset = findDataset(payload.datasetId)
    const id = nextId('pp', preprocessTasks.value)
    const beforeRows = clone(dataset?.samples || [])
    const afterRows = beforeRows.map(normalizeRow)
    const outputDatasetId = dataset ? nextId('dt', datasets.value) : payload.datasetId
    const outputName = dataset ? `${dataset.name}（预处理输出）` : '预处理输出数据集'
    const outputCount = dataset ? Math.max(afterRows.length, Math.floor(dataset.recordCount * 0.98)) : afterRows.length

    if (dataset) {
      datasets.value.unshift({
        ...clone(dataset),
        id: outputDatasetId,
        name: outputName,
        collectStatus: 'success',
        collectProgress: 100,
        recordCount: outputCount,
        version: 'v1.0',
        labelEnabled: false,
        description: `${dataset.name} 经过 ${payload.rules.join('、')} 后生成的新版本数据集。`,
        samples: afterRows,
        versions: [{ name: 'v1.0', recordCount: outputCount, createdAt: nowText(), description: '预处理任务输出版本' }],
        logs: [{ time: nowText(), message: `由预处理任务 ${payload.name} 生成` }],
        createdAt: nowText(),
      })
    }

    preprocessTasks.value.unshift({
      id,
      name: payload.name,
      datasetId: payload.datasetId,
      datasetName: dataset?.name || '未知数据集',
      status: 'success',
      progress: 100,
      inputCount: dataset?.recordCount || 0,
      outputCount,
      outputDatasetId,
      rules: payload.rules,
      beforeRows,
      afterRows,
      logs: [
        { time: nowText(), level: 'info', message: '预处理任务已创建' },
        { time: nowText(), level: 'info', message: `执行规则：${payload.rules.join('、')}` },
        { time: nowText(), level: 'info', message: `输出数据集已生成：${outputName}` },
      ],
      createdAt: nowText(),
    })
    return id
  }

  function resetDemoData() {
    datasources.value = clone(seedDatasources)
    datasets.value = clone(seedDatasets)
    preprocessTasks.value = clone(seedPreprocessTasks)
  }

  return {
    datasources,
    datasets,
    preprocessTasks,
    dashboardStats,
    findDatasource,
    findDataset,
    findTask,
    saveDatasource,
    testDatasource,
    deleteDatasource,
    createDataset,
    deleteDataset,
    setDatasetLabel,
    rollbackDatasetVersion,
    createPreprocessTask,
    resetDemoData,
  }
})
