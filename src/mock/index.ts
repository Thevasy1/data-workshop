import type { MockMethod } from 'vite-plugin-mock'

type Query = Record<string, any>
type Params = Record<string, any>

interface MockContext {
  query?: Query
  params?: Params
  body?: any
}

const ok = (data: unknown, message = 'success') => ({
  code: 0,
  data,
  message,
})

const datasources = [
  {
    id: 'ds_001',
    name: '用户行为 API',
    type: 'api',
    status: 'active',
    description: '对接埋点平台的用户访问、点击、留资等行为数据接口。',
    config: {
      api: {
        url: 'https://api.example.com/behavior/events',
        method: 'GET',
        headers: [
          { key: 'Authorization', value: 'Bearer demo-token' },
          { key: 'X-App-Id', value: 'workshop-demo' },
        ],
        params: [
          { key: 'limit', value: '500' },
          { key: 'scene', value: 'all' },
        ],
        authType: 'bearer',
      },
    },
    createdAt: '2026-06-15 10:00:00',
    updatedAt: '2026-06-28 14:30:00',
  },
  {
    id: 'ds_002',
    name: '订单业务库',
    type: 'database',
    status: 'active',
    description: '电商订单核心业务库，用于分析订单转化、退款和客单价。',
    config: {
      database: {
        dbType: 'mysql',
        host: '192.168.1.100',
        port: 3306,
        username: 'report_user',
        dbName: 'orders',
        tableName: 'order_fact',
        charset: 'utf8mb4',
      },
    },
    createdAt: '2026-06-16 09:00:00',
    updatedAt: '2026-06-29 11:20:00',
  },
  {
    id: 'ds_003',
    name: '新闻站点抓取源',
    type: 'web',
    status: 'draft',
    description: '抓取行业新闻、公告和媒体报道，供舆情专题分析使用。',
    config: {
      web: {
        url: 'https://news.example.com',
        selector: '.article-list .title a',
        crawlFrequency: 'daily',
        cron: '0 2 * * *',
        userAgent: 'Mozilla/5.0 WorkshopBot/1.0',
        timeout: 30,
        maxPages: 10,
      },
    },
    createdAt: '2026-06-18 15:30:00',
    updatedAt: '2026-06-27 09:10:00',
  },
]

const datasourceFields: Record<string, Array<{ name: string; type: string; description: string }>> = {
  ds_001: [
    { name: 'event_id', type: 'string', description: '行为事件唯一标识' },
    { name: 'user_id', type: 'string', description: '用户唯一标识' },
    { name: 'event_name', type: 'string', description: '事件名称' },
    { name: 'page_name', type: 'string', description: '发生页面' },
    { name: 'event_time', type: 'datetime', description: '事件发生时间' },
    { name: 'device_type', type: 'string', description: '设备类型' },
  ],
  ds_002: [
    { name: 'order_id', type: 'string', description: '订单号' },
    { name: 'user_id', type: 'string', description: '下单用户 ID' },
    { name: 'order_amount', type: 'number', description: '订单金额' },
    { name: 'pay_amount', type: 'number', description: '实付金额' },
    { name: 'order_status', type: 'string', description: '订单状态' },
    { name: 'created_at', type: 'datetime', description: '下单时间' },
  ],
  ds_003: [
    { name: 'title', type: 'string', description: '文章标题' },
    { name: 'url', type: 'string', description: '文章链接' },
    { name: 'publish_time', type: 'datetime', description: '发布时间' },
    { name: 'source', type: 'string', description: '媒体来源' },
  ],
}

const datasets = [
  {
    id: 'dt_001',
    name: '用户行为宽表',
    datasourceId: 'ds_001',
    datasourceName: '用户行为 API',
    collectStatus: 'success',
    collectProgress: 100,
    recordCount: 58240,
    version: 'v3',
    isLabeled: true,
    description: '汇总访问、点击、注册、表单提交等用户行为数据，作为画像与转化分析底表。',
    fields: [
      { name: 'event_id', type: 'string', description: '行为事件唯一标识', source: 'api.event_id' },
      { name: 'user_id', type: 'string', description: '用户唯一标识', source: 'api.user_id' },
      { name: 'event_name', type: 'string', description: '事件名称', source: 'api.event_name' },
      { name: 'page_name', type: 'string', description: '页面名称', source: 'api.page_name' },
      { name: 'event_time', type: 'datetime', description: '事件时间', source: 'api.event_time' },
      { name: 'device_type', type: 'string', description: '设备类型', source: 'api.device_type' },
      { name: 'email', type: 'string', description: '用户邮箱', source: 'api.profile.email' },
    ],
    collectRules: {
      fieldMappings: [
        { source: 'event_id', target: 'event_id' },
        { source: 'user_id', target: 'user_id' },
        { source: 'event_name', target: 'event_name' },
        { source: 'page_name', target: 'page_name' },
        { source: 'event_time', target: 'event_time' },
        { source: 'device_type', target: 'device_type' },
        { source: 'profile.email', target: 'email' },
      ],
      filters: [
        { field: 'event_name', operator: '!=', value: 'heartbeat' },
        { field: 'user_id', operator: '!=', value: 'null' },
      ],
      schedule: 'daily',
      cron: '0 1 * * *',
    },
    createdAt: '2026-06-16 09:00:00',
    updatedAt: '2026-06-29 19:00:00',
  },
  {
    id: 'dt_002',
    name: '订单分析主题集',
    datasourceId: 'ds_002',
    datasourceName: '订单业务库',
    collectStatus: 'running',
    collectProgress: 67,
    recordCount: 31860,
    version: 'v2',
    isLabeled: false,
    description: '面向经营分析的订单主题数据集，保留支付、退款、地区、渠道等指标字段。',
    fields: [
      { name: 'order_id', type: 'string', description: '订单号', source: 'db.order_id' },
      { name: 'user_id', type: 'string', description: '用户 ID', source: 'db.user_id' },
      { name: 'order_amount', type: 'number', description: '订单金额', source: 'db.order_amount' },
      { name: 'pay_amount', type: 'number', description: '实付金额', source: 'db.pay_amount' },
      { name: 'order_status', type: 'string', description: '订单状态', source: 'db.order_status' },
      { name: 'created_at', type: 'datetime', description: '下单时间', source: 'db.created_at' },
    ],
    collectRules: {
      fieldMappings: [
        { source: 'order_id', target: 'order_id' },
        { source: 'user_id', target: 'user_id' },
        { source: 'order_amount', target: 'order_amount' },
        { source: 'pay_amount', target: 'pay_amount' },
        { source: 'order_status', target: 'order_status' },
        { source: 'created_at', target: 'created_at' },
      ],
      filters: [
        { field: 'order_status', operator: '!=', value: 'closed' },
        { field: 'pay_amount', operator: '>', value: '0' },
      ],
      schedule: 'weekly',
      cron: '0 3 * * 1',
    },
    createdAt: '2026-06-18 10:00:00',
    updatedAt: '2026-06-30 08:20:00',
  },
  {
    id: 'dt_003',
    name: '行业新闻语料集',
    datasourceId: 'ds_003',
    datasourceName: '新闻站点抓取源',
    collectStatus: 'paused',
    collectProgress: 25,
    recordCount: 4680,
    version: 'v1',
    isLabeled: false,
    description: '行业资讯原始文本库，用于舆情、主题抽取和问答知识增强。',
    fields: [
      { name: 'title', type: 'string', description: '文章标题', source: 'crawler.title' },
      { name: 'url', type: 'string', description: '文章地址', source: 'crawler.url' },
      { name: 'publish_time', type: 'datetime', description: '发布时间', source: 'crawler.publish_time' },
      { name: 'source', type: 'string', description: '媒体来源', source: 'crawler.source' },
    ],
    collectRules: {
      fieldMappings: [
        { source: 'title', target: 'title' },
        { source: 'url', target: 'url' },
        { source: 'publish_time', target: 'publish_time' },
        { source: 'source', target: 'source' },
      ],
      filters: [
        { field: 'title', operator: 'contains', value: 'AI' },
      ],
      schedule: 'cron',
      cron: '0 */6 * * *',
    },
    createdAt: '2026-06-19 13:00:00',
    updatedAt: '2026-06-28 17:40:00',
  },
]

const datasetSamples: Record<string, { columns: string[]; rows: Array<Array<string | number | null>> }> = {
  dt_001: {
    columns: ['event_id', 'user_id', 'event_name', 'page_name', 'event_time', 'device_type', 'email'],
    rows: [
      ['ev_9001', 'u_1001', 'page_view', '首页', '2026-06-29 10:01:10', 'mobile', 'zhangsan@example.com'],
      ['ev_9002', 'u_1001', 'click_button', '活动页', '2026-06-29 10:01:42', 'mobile', 'zhangsan@example.com'],
      ['ev_9003', 'u_1033', 'submit_form', '留资页', '2026-06-29 10:03:15', 'pc', 'lisi@example.com'],
      ['ev_9004', 'u_1045', 'register_success', '注册页', '2026-06-29 10:06:09', 'mobile', 'wangwu@example.com'],
      ['ev_9005', 'u_1082', 'page_view', '产品页', '2026-06-29 10:08:20', 'tablet', 'zhaoliu@example.com'],
    ],
  },
  dt_002: {
    columns: ['order_id', 'user_id', 'order_amount', 'pay_amount', 'order_status', 'created_at'],
    rows: [
      ['od_2001', 'u_3001', 399, 399, 'paid', '2026-06-29 09:11:00'],
      ['od_2002', 'u_3002', 268, 258, 'paid', '2026-06-29 10:14:00'],
      ['od_2003', 'u_3003', 599, 0, 'refund', '2026-06-29 11:20:00'],
      ['od_2004', 'u_3004', 1299, 1299, 'paid', '2026-06-29 12:05:00'],
      ['od_2005', 'u_3005', 99, 99, 'shipped', '2026-06-29 12:36:00'],
    ],
  },
  dt_003: {
    columns: ['title', 'url', 'publish_time', 'source'],
    rows: [
      ['AI 大模型行业观察', 'https://news.example.com/a1', '2026-06-29 08:30:00', '行业观察'],
      ['数据治理新趋势', 'https://news.example.com/a2', '2026-06-29 09:00:00', '科技日报'],
      ['智能分析平台发布', 'https://news.example.com/a3', '2026-06-29 09:45:00', '产品快讯'],
    ],
  },
}

const datasetVersions: Record<string, Array<{ id: string; name: string; version: string; recordCount: number; fieldCount: number; createdAt: string; description: string }>> = {
  dt_001: [
    { id: 'dt_001_v1', name: 'v1', version: 'v1', recordCount: 61020, fieldCount: 7, createdAt: '2026-06-16 09:00:00', description: '首次采集版本，保留原始埋点字段。' },
    { id: 'dt_001_v2', name: 'v2', version: 'v2', recordCount: 59310, fieldCount: 7, createdAt: '2026-06-22 18:15:00', description: '过滤空 user_id 与无效邮箱后的版本。' },
    { id: 'dt_001_v3', name: 'v3', version: 'v3', recordCount: 58240, fieldCount: 7, createdAt: '2026-06-29 19:00:00', description: '剔除心跳事件并补齐设备类型后的版本。' },
  ],
  dt_002: [
    { id: 'dt_002_v1', name: 'v1', version: 'v1', recordCount: 30210, fieldCount: 6, createdAt: '2026-06-18 10:00:00', description: '订单主题初始版本。' },
    { id: 'dt_002_v2', name: 'v2', version: 'v2', recordCount: 31860, fieldCount: 6, createdAt: '2026-06-25 09:40:00', description: '增加退款状态过滤逻辑。' },
  ],
  dt_003: [
    { id: 'dt_003_v1', name: 'v1', version: 'v1', recordCount: 4680, fieldCount: 4, createdAt: '2026-06-19 13:00:00', description: '新闻采集首版。' },
  ],
}

const datasetLogs: Record<string, Array<{ time: string; level: 'info' | 'warning' | 'error'; message: string }>> = {
  dt_001: [
    { time: '2026-06-29 18:00:01', level: 'info', message: '开始执行用户行为宽表增量采集。' },
    { time: '2026-06-29 18:00:08', level: 'info', message: 'API 连接成功，已获取鉴权令牌。' },
    { time: '2026-06-29 18:02:11', level: 'warning', message: '检测到 154 条空邮箱记录，已按规则过滤。' },
    { time: '2026-06-29 18:05:40', level: 'info', message: '字段映射完成，写入宽表 58240 条记录。' },
  ],
  dt_002: [
    { time: '2026-06-30 07:30:10', level: 'info', message: '开始执行订单分析主题集采集。' },
    { time: '2026-06-30 07:35:16', level: 'info', message: 'MySQL 连接成功，开始读取 order_fact。' },
    { time: '2026-06-30 07:40:03', level: 'warning', message: '当前批次出现 21 条退款订单，已记录审计日志。' },
    { time: '2026-06-30 07:49:22', level: 'info', message: '采集进度达到 67%，已写入 31860 条。' },
  ],
  dt_003: [
    { time: '2026-06-28 16:00:00', level: 'info', message: '爬虫任务已暂停，等待调整抓取规则。' },
  ],
}

const datasourceTestRecords: Record<string, Array<{ id: string; time: string; success: boolean; message: string; responseTime: number }>> = {
  ds_001: [
    { id: 'tr_001', time: '2026-06-29 18:00:03', success: true, message: 'API 响应正常，返回样本数据 500 条。', responseTime: 128 },
    { id: 'tr_002', time: '2026-06-26 09:18:11', success: true, message: '鉴权通过，请求头配置有效。', responseTime: 146 },
    { id: 'tr_003', time: '2026-06-24 08:04:55', success: false, message: '接口限流，请检查请求频率配置。', responseTime: 3000 },
  ],
  ds_002: [
    { id: 'tr_004', time: '2026-06-29 11:10:30', success: true, message: '数据库连接成功，表结构读取完成。', responseTime: 260 },
    { id: 'tr_005', time: '2026-06-25 16:42:08', success: true, message: '字符集校验通过。', responseTime: 220 },
  ],
  ds_003: [
    { id: 'tr_006', time: '2026-06-27 08:30:00', success: false, message: '目标站点页面结构变更，选择器命中为空。', responseTime: 1820 },
  ],
}

const preprocessTasks = [
  {
    id: 'pp_001',
    name: '用户行为数据清洗任务',
    datasetId: 'dt_001',
    datasetName: '用户行为宽表',
    processTypes: ['clean', 'dedup', 'normalize'],
    status: 'success',
    progress: 100,
    inputVersion: 'v2',
    outputVersion: 'v3',
    inputCount: 59310,
    outputCount: 58240,
    config: {
      clean: { nullStrategy: '删除空 user_id', invalidEmailStrategy: '剔除', trimWhitespace: true },
      dedup: { dedupFields: ['event_id'], keepStrategy: 'first' },
      normalize: { timeFormat: 'YYYY-MM-DD HH:mm:ss', deviceTypeEnum: ['mobile', 'pc', 'tablet'] },
    },
    createdAt: '2026-06-29 17:40:00',
    finishedAt: '2026-06-29 19:00:00',
  },
  {
    id: 'pp_002',
    name: '订单主题格式整理任务',
    datasetId: 'dt_002',
    datasetName: '订单分析主题集',
    processTypes: ['format', 'clean'],
    status: 'running',
    progress: 65,
    inputVersion: 'v2',
    outputVersion: 'v3',
    inputCount: 31860,
    outputCount: 20500,
    config: {
      format: { targetFormat: 'csv', encoding: 'utf-8', delimiter: ',', dateFormat: 'YYYY-MM-DD' },
      clean: { nullStrategy: '补默认值', zeroPayStrategy: '保留并标记退款' },
    },
    createdAt: '2026-06-30 07:20:00',
    finishedAt: '',
  },
  {
    id: 'pp_003',
    name: '新闻正文标准化任务',
    datasetId: 'dt_003',
    datasetName: '行业新闻语料集',
    processTypes: ['clean', 'format'],
    status: 'pending',
    progress: 0,
    inputVersion: 'v1',
    outputVersion: 'v2',
    inputCount: 4680,
    outputCount: 0,
    config: {
      clean: { htmlTagStrategy: 'remove', emptyParagraphStrategy: 'drop' },
      format: { targetFormat: 'json', contentField: 'body_text' },
    },
    createdAt: '2026-06-30 09:15:00',
    finishedAt: '',
  },
]

const preprocessLogs: Record<string, Array<{ time: string; level: string; message: string }>> = {
  pp_001: [
    { time: '2026-06-29 17:40:03', level: 'info', message: '任务启动，开始读取用户行为宽表 v2。' },
    { time: '2026-06-29 17:46:15', level: 'info', message: '空值清洗完成，移除 706 条 user_id 缺失记录。' },
    { time: '2026-06-29 18:03:50', level: 'warning', message: '发现 364 条邮箱格式异常，已按规则剔除。' },
    { time: '2026-06-29 18:28:40', level: 'info', message: '重复事件去重完成，减少 720 条记录。' },
    { time: '2026-06-29 19:00:00', level: 'info', message: '输出版本 v3 已生成。' },
  ],
  pp_002: [
    { time: '2026-06-30 07:20:01', level: 'info', message: '任务启动，开始处理订单主题集 v2。' },
    { time: '2026-06-30 07:29:40', level: 'info', message: '日期字段标准化完成。' },
    { time: '2026-06-30 07:38:20', level: 'warning', message: '发现 21 条退款订单金额为 0，已按策略保留。' },
    { time: '2026-06-30 07:48:20', level: 'info', message: '当前已输出 20500 条格式化结果。' },
  ],
  pp_003: [
    { time: '2026-06-30 09:15:00', level: 'info', message: '任务已创建，等待调度执行。' },
  ],
}

const preprocessComparisons: Record<string, any> = {
  pp_001: {
    before: {
      version: 'v2',
      recordCount: 59310,
      fields: ['event_id', 'user_id', 'event_name', 'page_name', 'event_time', 'device_type', 'email'],
      sampleData: [
        ['ev_8001', 'u_1001', 'page_view', '首页', '2026/06/29 10:01:10', 'mobile', 'zhangsan@example.com'],
        ['ev_8002', null, 'click_button', '活动页', '2026/06/29 10:01:42', 'mobile', ''],
        ['ev_8003', 'u_1033', 'submit_form', '留资页', '2026/06/29 10:03:15', 'PC', 'lisi@example.com'],
      ],
    },
    after: {
      version: 'v3',
      recordCount: 58240,
      fields: ['event_id', 'user_id', 'event_name', 'page_name', 'event_time', 'device_type', 'email'],
      sampleData: [
        ['ev_8001', 'u_1001', 'page_view', '首页', '2026-06-29 10:01:10', 'mobile', 'zhangsan@example.com'],
        ['ev_8003', 'u_1033', 'submit_form', '留资页', '2026-06-29 10:03:15', 'pc', 'lisi@example.com'],
        ['ev_8004', 'u_1045', 'register_success', '注册页', '2026-06-29 10:06:09', 'mobile', 'wangwu@example.com'],
      ],
    },
    diff: {
      recordCountChange: -1070,
      fieldsAdded: 0,
      fieldsRemoved: 0,
      nullRemoved: 706,
    },
  },
  pp_002: {
    before: {
      version: 'v2',
      recordCount: 31860,
      fields: ['order_id', 'user_id', 'order_amount', 'pay_amount', 'order_status', 'created_at'],
      sampleData: [
        ['od_2001', 'u_3001', 399, 399, 'paid', '2026/06/29'],
        ['od_2002', 'u_3002', 268, 258, 'paid', '2026/06/29'],
        ['od_2003', 'u_3003', 599, 0, 'refund', '2026/06/29'],
      ],
    },
    after: {
      version: 'v3',
      recordCount: 20500,
      fields: ['order_id', 'user_id', 'order_amount', 'pay_amount', 'order_status', 'created_at'],
      sampleData: [
        ['od_2001', 'u_3001', 399, 399, 'paid', '2026-06-29'],
        ['od_2002', 'u_3002', 268, 258, 'paid', '2026-06-29'],
        ['od_2003', 'u_3003', 599, 0, 'refund', '2026-06-29'],
      ],
    },
    diff: {
      recordCountChange: -11360,
      fieldsAdded: 0,
      fieldsRemoved: 0,
      nullRemoved: 0,
    },
  },
}

const preprocessPreviews: Record<string, { columns: string[]; rows: Array<Array<string | number | null>> }> = {
  pp_001: datasetSamples.dt_001,
  pp_002: {
    columns: ['order_id', 'user_id', 'order_amount', 'pay_amount', 'order_status', 'created_at'],
    rows: [
      ['od_2001', 'u_3001', 399, 399, 'paid', '2026-06-29'],
      ['od_2002', 'u_3002', 268, 258, 'paid', '2026-06-29'],
      ['od_2005', 'u_3005', 99, 99, 'shipped', '2026-06-29'],
      ['od_2008', 'u_3008', 880, 880, 'paid', '2026-06-29'],
    ],
  },
  pp_003: {
    columns: ['title', 'source', 'publish_time', 'body_text'],
    rows: [
      ['AI 大模型行业观察', '行业观察', '2026-06-29 08:30:00', '正文清洗后内容示例 1'],
      ['数据治理新趋势', '科技日报', '2026-06-29 09:00:00', '正文清洗后内容示例 2'],
    ],
  },
}

const nowString = () => {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

const nextId = (prefix: 'ds' | 'dt' | 'pp', list: Array<{ id: string }>) => {
  const max = list.reduce((current, item) => {
    const match = item.id.match(/(\d+)$/)
    return Math.max(current, match ? Number(match[1]) : 0)
  }, 0)
  return `${prefix}_${String(max + 1).padStart(3, '0')}`
}

const buildDatasetFieldsFromDatasource = (
  datasourceId: string,
  mappings: Array<{ source: string; target: string }>
) => {
  const sourceFields = datasourceFields[datasourceId] || []
  if (!mappings.length) {
    return sourceFields.map((field) => ({
      name: field.name,
      type: field.type,
      description: field.description,
      source: field.name,
    }))
  }

  return mappings.map((mapping) => {
    const matchedField = sourceFields.find((field) => field.name === mapping.source)
    return {
      name: mapping.target || mapping.source || 'field',
      type: matchedField?.type || 'string',
      description: matchedField?.description || '新建字段',
      source: mapping.source || matchedField?.name || '',
    }
  })
}

const paginate = <T>(list: T[], query: Query = {}) => {
  const page = Number(query.page || 1)
  const pageSize = Number(query.pageSize || 10)
  const start = (page - 1) * pageSize
  return {
    list: list.slice(start, start + pageSize),
    total: list.length,
    page,
    pageSize,
  }
}

const normalizeId = (id?: string) => (id || '').trim()

const resolveAliasId = (id: string, prefix: 'ds' | 'dt' | 'pp', total: number) => {
  const numericMatch = id.match(/(\d+)/)
  if (!numericMatch) return ''
  const index = Number(numericMatch[1])
  if (!index || index > total) return ''
  return `${prefix}_${String(index).padStart(3, '0')}`
}

const findById = <T extends { id: string }>(list: T[], rawId?: string, prefix?: 'ds' | 'dt' | 'pp') => {
  const id = normalizeId(rawId)
  if (!id) return list[0]

  const exact = list.find((item) => item.id === id)
  if (exact) return exact

  const normalized = id.toLowerCase()
  const suffixMatched = list.find((item) => item.id.toLowerCase().endsWith(normalized))
  if (suffixMatched) return suffixMatched

  if (prefix) {
    const aliasId = resolveAliasId(id, prefix, list.length)
    if (aliasId) {
      const aliasMatched = list.find((item) => item.id === aliasId)
      if (aliasMatched) return aliasMatched
    }
  }

  return list[0]
}

const getDatasetById = (id?: string) => findById(datasets, id, 'dt')
const getDatasourceById = (id?: string) => findById(datasources, id, 'ds')
const getPreprocessById = (id?: string) => findById(preprocessTasks, id, 'pp')

const filterDatasources = (query: Query = {}) =>
  datasources.filter((item) => {
    if (query.keyword && !item.name.includes(query.keyword)) return false
    if (query.type && item.type !== query.type) return false
    if (query.status && item.status !== query.status) return false
    return true
  })

const filterDatasets = (query: Query = {}) =>
  datasets.filter((item) => {
    if (query.keyword && !item.name.includes(query.keyword)) return false
    if (query.datasourceId && item.datasourceId !== query.datasourceId) return false
    if (query.collectStatus && item.collectStatus !== query.collectStatus) return false
    return true
  })

const filterPreprocess = (query: Query = {}) =>
  preprocessTasks.filter((item) => {
    if (query.keyword && !item.name.includes(query.keyword)) return false
    if (query.datasetId && item.datasetId !== query.datasetId) return false
    if (query.status && item.status !== query.status) return false
    if (query.processTypes) {
      const types = Array.isArray(query.processTypes) ? query.processTypes : [query.processTypes]
      if (!types.every((type) => item.processTypes.includes(type))) return false
    }
    return true
  })

export default [
  {
    url: '/api/dashboard/stats',
    method: 'get',
    response: () =>
      ok({
        datasourceCount: datasources.length,
        datasetCount: datasets.length,
        preprocessCount: preprocessTasks.length,
        todayTaskCount: 6,
        successRate: 94.7,
        failedTaskCount: 1,
      }),
  },
  {
    url: '/api/dashboard/trend',
    method: 'get',
    response: () =>
      ok({
        dates: ['06-25', '06-26', '06-27', '06-28', '06-29', '06-30'],
        datasetCreated: [1, 2, 1, 3, 2, 2],
        preprocessCompleted: [0, 1, 0, 2, 3, 1],
      }),
  },
  {
    url: '/api/dashboard/distribution',
    method: 'get',
    response: () =>
      ok({
        datasourceTypeStats: [
          { type: 'api', count: 6 },
          { type: 'upload', count: 3 },
          { type: 'database', count: 5 },
          { type: 'web', count: 2 },
        ],
        datasetStatusStats: [
          { status: 'success', count: 8 },
          { status: 'running', count: 2 },
          { status: 'paused', count: 1 },
        ],
        preprocessStatusStats: [
          { status: 'pending', count: 1 },
          { status: 'running', count: 1 },
          { status: 'success', count: 6 },
        ],
      }),
  },
  {
    url: '/api/dashboard/recent-tasks',
    method: 'get',
    response: () =>
      ok([
        { id: 'pp_002', name: '订单主题格式整理任务', type: 'preprocess', status: 'running', createdAt: '2026-06-30 07:20:00' },
        { id: 'dt_002', name: '订单分析主题集', type: 'dataset', status: 'running', createdAt: '2026-06-30 07:30:00' },
        { id: 'pp_001', name: '用户行为数据清洗任务', type: 'preprocess', status: 'success', createdAt: '2026-06-29 17:40:00' },
      ]),
  },
  {
    url: '/api/datasource/list',
    method: 'get',
    response: ({ query = {} }: MockContext) => ok(paginate(filterDatasources(query), query)),
  },
  {
    url: '/api/datasource/:id',
    method: 'get',
    response: ({ params = {} }: MockContext) => ok(getDatasourceById(params.id)),
  },
  {
    url: '/api/datasource/create',
    method: 'post',
    response: ({ body }: MockContext) => {
      const id = nextId('ds', datasources)
      const createdAt = nowString()
      datasources.unshift({
        id,
        name: body?.name || `新建数据源 ${datasources.length + 1}`,
        type: body?.type || 'api',
        status: 'active',
        description: body?.description || '',
        config: body?.config || {},
        createdAt,
        updatedAt: createdAt,
      })
      datasourceFields[id] = datasourceFields[id] || [
        { name: 'id', type: 'string', description: '主键' },
        { name: 'name', type: 'string', description: '名称' },
        { name: 'created_at', type: 'datetime', description: '创建时间' },
      ]
      datasourceTestRecords[id] = [
        {
          id: `tr_${String(Object.values(datasourceTestRecords).flat().length + 1).padStart(3, '0')}`,
          time: createdAt,
          success: true,
          message: '新建后已生成默认测试记录。',
          responseTime: 120,
        },
      ]
      return ok({ id }, '创建成功')
    },
  },
  {
    url: '/api/datasource/:id',
    method: 'put',
    response: () => ok(null, '更新成功'),
  },
  {
    url: '/api/datasource/:id',
    method: 'delete',
    response: () => ok(null, '删除成功'),
  },
  {
    url: '/api/datasource/:id/datasets',
    method: 'get',
    response: ({ params = {}, query = {} }: MockContext) =>
      ok(
        paginate(
          datasets
            .filter((item) => item.datasourceId === params.id)
            .map((item) => ({
              id: item.id,
              name: item.name,
              version: item.version,
              collectStatus: item.collectStatus,
              recordCount: item.recordCount,
              createdAt: item.createdAt,
            })),
          query
        )
      ),
  },
  {
    url: '/api/datasource/:id/test-records',
    method: 'get',
    response: ({ params = {}, query = {} }: MockContext) =>
      ok(paginate(datasourceTestRecords[params.id] || [], query)),
  },
  {
    url: '/api/datasource/:id/fields',
    method: 'get',
    response: ({ params = {} }: MockContext) => ok(datasourceFields[params.id] || []),
  },
  {
    url: '/api/datasource/test',
    method: 'post',
    response: ({ body }: MockContext) => {
      const type = body?.type || 'api'
      if (type === 'database') {
        return ok(
          {
            success: true,
            message: '数据库连接成功，已读取表结构样本。',
            sampleData: [
              { order_id: 'od_2001', pay_amount: 399, order_status: 'paid' },
              { order_id: 'od_2002', pay_amount: 258, order_status: 'paid' },
            ],
          },
          'success'
        )
      }

      if (type === 'web') {
        return ok(
          {
            success: false,
            message: '选择器未命中，请检查目标页面结构。',
            sampleData: [],
          },
          'success'
        )
      }

      return ok(
        {
          success: true,
          message: '接口连接成功，已返回测试样本。',
          sampleData: [
            { event_id: 'ev_9001', user_id: 'u_1001', event_name: 'page_view' },
            { event_id: 'ev_9002', user_id: 'u_1002', event_name: 'click_button' },
          ],
        },
        'success'
      )
    },
  },
  {
    url: '/api/dataset/list',
    method: 'get',
    response: ({ query = {} }: MockContext) => ok(paginate(filterDatasets(query), query)),
  },
  {
    url: '/api/dataset/datasource-options',
    method: 'get',
    response: () => ok(datasources.map(({ id, name, type }) => ({ id, name, type }))),
  },
  {
    url: '/api/dataset/create',
    method: 'post',
    response: ({ body }: MockContext) => {
      const id = nextId('dt', datasets)
      const createdAt = nowString()
      const datasource = getDatasourceById(body?.datasourceId)
      const fields = buildDatasetFieldsFromDatasource(body?.datasourceId || '', body?.collectRules?.fieldMappings || [])
      datasets.unshift({
        id,
        name: body?.name || `新建数据集 ${datasets.length + 1}`,
        datasourceId: body?.datasourceId || datasource?.id || '',
        datasourceName: datasource?.name || '未知数据源',
        collectStatus: 'running',
        collectProgress: 0,
        recordCount: 0,
        version: 'v1',
        isLabeled: false,
        description: body?.description || '',
        fields,
        collectRules: body?.collectRules || {
          fieldMappings: [],
          filters: [],
          schedule: 'manual',
        },
        createdAt,
        updatedAt: createdAt,
      })
      datasetSamples[id] = {
        columns: fields.map((field) => field.name),
        rows: [],
      }
      datasetVersions[id] = [
        {
          id: `${id}_v1`,
          name: 'v1',
          version: 'v1',
          recordCount: 0,
          fieldCount: fields.length,
          createdAt,
          description: body?.description || '新建数据集初始版本',
        },
      ]
      datasetLogs[id] = [{ time: createdAt, level: 'info', message: '数据集已创建，等待首次采集执行。' }]
      return ok({ id, collectTaskId: `collect_${id}` }, '创建成功')
    },
  },
  {
    url: '/api/dataset/:id',
    method: 'get',
    response: ({ params = {} }: MockContext) => ok(getDatasetById(params.id)),
  },
  {
    url: '/api/dataset/:id/fields',
    method: 'get',
    response: ({ params = {} }: MockContext) => ok(getDatasetById(params.id)?.fields || []),
  },
  {
    url: '/api/dataset/:id/sample',
    method: 'get',
    response: ({ params = {} }: MockContext) => ok(datasetSamples[params.id] || { columns: [], rows: [] }),
  },
  {
    url: '/api/dataset/:id/versions',
    method: 'get',
    response: ({ params = {} }: MockContext) => ok(datasetVersions[params.id] || []),
  },
  {
    url: '/api/dataset/:id/versions/compare',
    method: 'post',
    response: ({ params = {}, body }: MockContext) => {
      const versions = datasetVersions[params.id] || []
      const baseVersion = versions.find((item) => item.id === body?.baseVersionId) || versions[0]
      const targetVersion =
        versions.find((item) => item.id === body?.targetVersionId) || versions[versions.length - 1]

      return ok({
        baseVersion,
        targetVersion,
        diff: {
          recordCount: (targetVersion?.recordCount || 0) - (baseVersion?.recordCount || 0),
          addedFields: [],
          removedFields: [],
          changedFields:
            params.id === 'dt_001'
              ? ['device_type', 'email']
              : params.id === 'dt_002'
                ? ['order_status']
                : ['source'],
        },
      })
    },
  },
  {
    url: '/api/dataset/:id/versions/rollback',
    method: 'post',
    response: () => ok(null, '版本回滚成功'),
  },
  {
    url: '/api/dataset/:id/export',
    method: 'get',
    response: ({ query = {} }: MockContext) => ok(`${query.format || 'csv'} 导出任务已创建`, 'success'),
  },
  {
    url: '/api/dataset/:id/label-status',
    method: 'patch',
    response: () => ok(null, '标注状态已更新'),
  },
  {
    url: '/api/dataset/:id/start',
    method: 'post',
    response: () => ok(null, '采集任务已启动'),
  },
  {
    url: '/api/dataset/:id/pause',
    method: 'post',
    response: () => ok(null, '采集任务已暂停'),
  },
  {
    url: '/api/dataset/:id/retry',
    method: 'post',
    response: () => ok(null, '采集任务已重新触发'),
  },
  {
    url: '/api/dataset/:id',
    method: 'delete',
    response: () => ok(null, '删除成功'),
  },
  {
    url: '/api/dataset/:id/status',
    method: 'get',
    response: ({ params = {} }: MockContext) => {
      const item = getDatasetById(params.id)
      return ok({
        id: params.id,
        status: item?.collectStatus || 'pending',
        progress: item?.collectProgress || 0,
        message: item?.collectStatus === 'running' ? '采集中' : '任务状态正常',
      })
    },
  },
  {
    url: '/api/dataset/:id/logs',
    method: 'get',
    response: ({ params = {} }: MockContext) => ok(datasetLogs[params.id] || []),
  },
  {
    url: '/api/preprocess/list',
    method: 'get',
    response: ({ query = {} }: MockContext) => ok(paginate(filterPreprocess(query), query)),
  },
  {
    url: '/api/preprocess/create',
    method: 'post',
    response: ({ body }: MockContext) => {
      const id = nextId('pp', preprocessTasks)
      const createdAt = nowString()
      const dataset = getDatasetById(body?.datasetId)
      const sourceSample = datasetSamples[dataset?.id || ''] || { columns: [], rows: [] }
      const outputVersion = `v${((datasetVersions[dataset?.id || ''] || []).length || 0) + 1}`
      preprocessTasks.unshift({
        id,
        name: body?.name || `新建预处理任务 ${preprocessTasks.length + 1}`,
        datasetId: body?.datasetId || dataset?.id || '',
        datasetName: dataset?.name || '未知数据集',
        processTypes: body?.processTypes || [],
        status: 'pending',
        progress: 0,
        inputVersion: body?.versionId || dataset?.version || 'v1',
        outputVersion,
        inputCount: dataset?.recordCount || 0,
        outputCount: 0,
        config: body?.config || {},
        createdAt,
        finishedAt: '',
      })
      preprocessLogs[id] = [{ time: createdAt, level: 'info', message: '预处理任务已创建，等待调度执行。' }]
      preprocessPreviews[id] = sourceSample
      preprocessComparisons[id] = {
        before: {
          version: body?.versionId || dataset?.version || 'v1',
          recordCount: dataset?.recordCount || 0,
          fields: (dataset?.fields || []).map((field) => field.name),
          sampleData: sourceSample.rows.slice(0, 3),
        },
        after: {
          version: outputVersion,
          recordCount: 0,
          fields: (dataset?.fields || []).map((field) => field.name),
          sampleData: [],
        },
        diff: {
          recordCountChange: 0,
          fieldsAdded: 0,
          fieldsRemoved: 0,
          nullRemoved: 0,
        },
      }
      return ok({ id, status: 'pending' }, '创建成功')
    },
  },
  {
    url: '/api/preprocess/dataset/:datasetId/versions',
    method: 'get',
    response: ({ params = {} }: MockContext) => ok(datasetVersions[params.datasetId] || []),
  },
  {
    url: '/api/preprocess/available-datasets',
    method: 'get',
    response: () =>
      ok(
        datasets
          .filter((item) => item.collectStatus === 'success' || item.collectStatus === 'running')
          .map((item) => ({
            id: item.id,
            name: item.name,
            version: item.version,
            recordCount: item.recordCount,
          }))
      ),
  },
  {
    url: '/api/preprocess/:id/detail',
    method: 'get',
    response: ({ params = {} }: MockContext) => ok(getPreprocessById(params.id)),
  },
  {
    url: '/api/preprocess/:id/progress',
    method: 'get',
    response: ({ params = {} }: MockContext) => {
      const item = getPreprocessById(params.id)
      return ok({
        id: params.id,
        status: item?.status || 'pending',
        progress: item?.progress || 0,
        currentStep:
          item?.status === 'running'
            ? '执行格式整理'
            : item?.status === 'success'
              ? '处理完成'
              : '等待调度',
        processedCount: item?.status === 'running' ? 20500 : item?.outputCount || 0,
        totalCount: item?.inputCount || 0,
        estimatedRemainingSeconds: item?.status === 'running' ? 180 : 0,
      })
    },
  },
  {
    url: '/api/preprocess/:id/comparison',
    method: 'get',
    response: ({ params = {} }: MockContext) => ok(preprocessComparisons[params.id] || preprocessComparisons.pp_001),
  },
  {
    url: '/api/preprocess/:id/logs',
    method: 'get',
    response: ({ params = {} }: MockContext) => ok(preprocessLogs[params.id] || []),
  },
  {
    url: '/api/preprocess/:id/preview',
    method: 'get',
    response: ({ params = {} }: MockContext) => ok(preprocessPreviews[params.id] || { columns: [], rows: [] }),
  },
  {
    url: '/api/preprocess/:id/export',
    method: 'get',
    response: ({ query = {} }: MockContext) => ok(`${query.format || 'csv'} 导出任务已创建`, 'success'),
  },
] as MockMethod[]
