# 数据工坊 — 前端 API 接口设计文档

> 本文档定义前端所有模块需要调用的接口规范，各成员按此文档对接 Mock 数据。
> 统一返回格式：`{ code: number, data: T, message: string }`，`code === 0` 为成功。
> baseURL：`/api`

---

## RESTful 设计规范

本接口文档遵循 RESTful 风格，统一约定如下：

| 规则 | 说明 | 示例 |
|------|------|------|
| 资源用复数名词 | 所有资源路径使用英文复数 | `/datasources`、`/datasets`、`/preprocess-tasks` |
| HTTP 方法表达操作 | 用方法而非 URL 中的动词区分操作 | `GET` 查询、`POST` 新建、`PUT` 更新、`DELETE` 删除 |
| 路径参数定位资源 | `:id` 定位单个资源 | `/datasources/:id` |
| 子资源用嵌套 | 父资源/子资源 层级关系 | `/datasources/:id/datasets` |
| 非 CRUD 动作用 actions | 无法用标准方法表达的操作 | `POST /datasources/:id/actions/test` |
| 查询用 Query 参数 | 筛选、分页、排序统一走 Query | `?page=1&pageSize=10&keyword=xxx` |

**HTTP 方法与操作对应：**

| 方法 | 操作 | 示例 |
|------|------|------|
| GET | 查询（列表 / 详情） | `GET /datasources`、`GET /datasources/:id` |
| POST | 新建 / 执行动作 | `POST /datasources`、`POST /datasources/:id/actions/test` |
| PUT | 全量更新 | `PUT /datasources/:id` |
| PATCH | 局部更新 | `PATCH /datasets/:id/label-status` |
| DELETE | 删除 | `DELETE /datasources/:id` |

---

## 一、数据源管理（成员2 + 成员3）

### 1.1 数据源列表 — 成员2

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 数据源列表 | GET | `/datasources` | 支持分页、筛选 |

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页条数，默认 10 |
| keyword | string | 否 | 名称模糊搜索 |
| type | string | 否 | 数据源类型：api / upload / database / web |
| status | string | 否 | 状态筛选：draft / active / inactive / failed |
| startTime | string | 否 | 创建时间起，格式：YYYY-MM-DD |
| endTime | string | 否 | 创建时间止，格式：YYYY-MM-DD |

**响应数据：**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "ds_001",
        "name": "用户行为API",
        "type": "api",
        "status": "active",
        "description": "用户行为数据接口",
        "createdAt": "2026-06-15T10:00:00Z",
        "updatedAt": "2026-06-18T14:30:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  },
  "message": "success"
}
```

---

### 1.2 数据源详情 — 成员2 / 成员3

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 数据源详情 | GET | `/datasources/:id` | 含完整配置信息，编辑页回显复用此接口 |

**响应数据（含类型配置）：**

```json
{
  "code": 0,
  "data": {
    "id": "ds_001",
    "name": "用户行为API",
    "type": "api",
    "status": "active",
    "description": "用户行为数据接口",
    "config": {
      "api": {
        "url": "https://api.example.com/events",
        "method": "GET",
        "headers": [{ "key": "Authorization", "value": "Bearer xxx" }],
        "params": [{ "key": "limit", "value": "100" }],
        "authType": "bearer"
      }
    },
    "createdAt": "2026-06-15T10:00:00Z",
    "updatedAt": "2026-06-18T14:30:00Z"
  },
  "message": "success"
}
```

---

### 1.3 新建数据源 — 成员3 ⭐

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 新建数据源 | POST | `/datasources` | 提交表单数据 |

**请求体（按数据源类型不同，config 结构不同）：**

#### API 类型

```json
{
  "name": "用户行为API",
  "type": "api",
  "description": "用户行为数据接口",
  "config": {
    "api": {
      "url": "https://api.example.com/events",
      "method": "GET",
      "headers": [
        { "key": "Authorization", "value": "Bearer xxx" }
      ],
      "params": [
        { "key": "limit", "value": "100" }
      ],
      "authType": "bearer"
    }
  }
}
```

#### 本地上传类型

```json
{
  "name": "日志文件上传",
  "type": "upload",
  "description": "本地上传日志文件",
  "config": {
    "upload": {
      "fileFormat": ["csv", "json", "excel"],
      "maxSize": 100,
      "maxSizeUnit": "MB",
      "encoding": "utf-8",
      "delimiter": ","
    }
  }
}
```

#### 数据库类型

```json
{
  "name": "订单数据库",
  "type": "database",
  "description": "订单业务数据库",
  "config": {
    "database": {
      "dbType": "mysql",
      "host": "192.168.1.100",
      "port": 3306,
      "username": "root",
      "password": "******",
      "dbName": "orders",
      "tableName": "order_list",
      "charset": "utf8mb4"
    }
  }
}
```

#### Web 抓取类型

```json
{
  "name": "新闻网页抓取",
  "type": "web",
  "description": "抓取新闻网站数据",
  "config": {
    "web": {
      "url": "https://news.example.com",
      "selector": ".article-list .title",
      "crawlFrequency": "daily",
      "cron": "0 0 * * *",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "timeout": 30,
      "maxPages": 10
    }
  }
}
```

**响应：**

```json
{
  "code": 0,
  "data": { "id": "ds_new" },
  "message": "创建成功"
}
```

---

### 1.4 编辑数据源 — 成员3 ⭐

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 编辑数据源 | PUT | `/datasources/:id` | 提交修改后的表单 |

**请求体：** 与新建相同，包含完整配置

**响应：**

```json
{ "code": 0, "data": null, "message": "更新成功" }
```

---

### 1.5 删除数据源 — 成员2

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 删除数据源 | DELETE | `/datasources/:id` | 二次确认后调用 |

**响应：**
```json
{ "code": 0, "data": null, "message": "删除成功" }
```

---

### 1.6 测试数据源连接 — 成员2 + 成员3

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 测试连接 | POST | `/datasources/actions/test` | 成员2在列表页测试已有数据源，成员3在新建/编辑页"保存并测试" |

**请求体（完整的数据源配置）：**

```json
{
  "type": "api",
  "config": {
    "api": {
      "url": "https://api.example.com/events",
      "method": "GET",
      "headers": [{ "key": "Authorization", "value": "Bearer xxx" }],
      "params": [{ "key": "limit", "value": "100" }],
      "authType": "bearer"
    }
  }
}
```

**响应：**

```json
{
  "code": 0,
  "data": {
    "success": true,
    "message": "连接成功",
    "sampleData": [
      { "user_id": "1001", "name": "张三", "age": 25 }
    ]
  },
  "message": "success"
}
```

> 连接失败时 `code` 仍为 0，但 `data.success` 为 `false`：

```json
{
  "code": 0,
  "data": {
    "success": false,
    "message": "连接超时，请检查URL和网络",
    "sampleData": null
  },
  "message": "success"
}
```

---

### 1.7 数据源关联数据集 — 成员2

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 关联数据集列表 | GET | `/datasources/:id/datasets` | 数据源详情页展示关联数据集 |

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 默认 1 |
| pageSize | number | 否 | 默认 5 |

**响应：**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "dt_001",
        "name": "用户行为数据集",
        "version": "v1",
        "collectStatus": "success",
        "recordCount": 50000,
        "createdAt": "2026-06-16T09:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 5
  },
  "message": "success"
}
```

---

### 1.8 数据源测试记录 — 成员2

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 测试记录列表 | GET | `/datasources/:id/test-records` | 数据源详情页展示历史测试记录 |

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 默认 1 |
| pageSize | number | 否 | 默认 10 |

**响应：**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "tr_001",
        "time": "2026-06-18T14:30:00Z",
        "success": true,
        "message": "连接成功",
        "responseTime": 120
      },
      {
        "id": "tr_002",
        "time": "2026-06-17T10:00:00Z",
        "success": false,
        "message": "连接超时，请检查URL和网络",
        "responseTime": 30000
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 10
  },
  "message": "success"
}
```

---

### 1.9 数据源字段列表 — 成员4

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 数据源字段列表 | GET | `/datasources/:id/fields` | 创建数据集配置采集规则时，获取数据源的可用字段列表用于字段映射 |

**响应：**

```json
{
  "code": 0,
  "data": [
    { "name": "user_id", "type": "string", "description": "用户ID" },
    { "name": "name", "type": "string", "description": "用户名" },
    { "name": "age", "type": "number", "description": "年龄" },
    { "name": "email", "type": "string", "description": "邮箱" }
  ],
  "message": "success"
}
```

---

### 1.10 编辑页回显说明 — 成员3 ⭐

> 编辑页复用 1.2 的接口 `GET /datasources/:id`，需要特别关注 config 字段的完整回显。

**编辑页处理逻辑：**

```typescript
// 进入编辑页时，根据路由参数 id 获取详情
const res = await datasourceApi.getDetail(id)
// 回显表单
form.value = {
  name: res.name,
  type: res.type,
  description: res.description,
  config: res.config[res.type] // 根据 type 取对应配置
}
```

---

## 二、数据集管理（成员4 + 成员5）

### 2.1 数据集列表 — 成员4

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 数据集列表 | GET | `/datasets` | 支持分页、筛选 |

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 默认 1 |
| pageSize | number | 否 | 默认 10 |
| keyword | string | 否 | 名称搜索 |
| datasourceId | string | 否 | 来源数据源筛选 |
| collectStatus | string | 否 | 采集状态筛选 |
| startTime | string | 否 | 创建时间起，格式：YYYY-MM-DD |
| endTime | string | 否 | 创建时间止，格式：YYYY-MM-DD |

**响应：**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "dt_001",
        "name": "用户行为数据集",
        "datasourceId": "ds_001",
        "datasourceName": "用户行为API",
        "collectStatus": "success",
        "collectProgress": 100,
        "recordCount": 50000,
        "version": "v1",
        "isLabeled": false,
        "createdAt": "2026-06-16T09:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10
  },
  "message": "success"
}
```

---

### 2.2 可选数据源列表 — 成员4

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 可选数据源 | GET | `/datasets/datasource-options` | 创建数据集时选择数据源 |

**响应：**

```json
{
  "code": 0,
  "data": [
    { "id": "ds_001", "name": "用户行为API", "type": "api" },
    { "id": "ds_002", "name": "订单数据库", "type": "database" }
  ],
  "message": "success"
}
```

---

### 2.3 创建数据集 — 成员4

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 创建数据集 | POST | `/datasets` | 提交采集规则和基础信息 |

**请求体：**

```json
{
  "name": "用户行为数据集",
  "datasourceId": "ds_001",
  "description": "基于用户行为API创建的数据集",
  "collectRules": {
    "fieldMappings": [
      { "source": "user_id", "target": "用户ID" },
      { "source": "name", "target": "用户名" }
    ],
    "filters": [
      { "field": "age", "operator": ">", "value": "18" }
    ],
    "schedule": "daily",
    "cron": "0 0 * * *"
  }
}
```

---

### 2.4 数据集详情 — 成员5

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 数据集详情 | GET | `/datasets/:id` | 含基础信息、字段结构等 |

**响应：**

```json
{
  "code": 0,
  "data": {
    "id": "dt_001",
    "name": "用户行为数据集",
    "datasourceId": "ds_001",
    "datasourceName": "用户行为API",
    "collectStatus": "success",
    "recordCount": 50000,
    "version": "v1",
    "isLabeled": false,
    "fields": [
      { "name": "user_id", "type": "string", "description": "用户ID" },
      { "name": "name", "type": "string", "description": "用户名" },
      { "name": "age", "type": "number", "description": "年龄" }
    ],
    "createdAt": "2026-06-16T09:00:00Z",
    "updatedAt": "2026-06-18T14:00:00Z"
  },
  "message": "success"
}
```

---

### 2.5 数据集字段结构 — 成员5

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 字段列表 | GET | `/datasets/:id/fields` | 展示数据集的字段结构 |

**响应：**

```json
{
  "code": 0,
  "data": [
    { "name": "user_id", "type": "string", "description": "用户ID", "source": "api.user_id" },
    { "name": "name", "type": "string", "description": "用户名", "source": "api.name" },
    { "name": "age", "type": "number", "description": "年龄", "source": "api.age" }
  ],
  "message": "success"
}
```

---

### 2.6 数据集样本预览 — 成员5

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 样本数据 | GET | `/datasets/:id/samples` | 预览前 N 条数据 |

**请求参数：** `limit`（默认 20）

**响应：**

```json
{
  "code": 0,
  "data": {
    "columns": ["user_id", "name", "age", "email"],
    "rows": [
      ["1001", "张三", 25, "zhangsan@example.com"],
      ["1002", "李四", 30, "lisi@example.com"]
    ]
  },
  "message": "success"
}
```

---

### 2.7 数据集版本管理 — 成员5

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 版本列表 | GET | `/datasets/:id/versions` | 获取所有版本 |
| 版本对比 | POST | `/datasets/:id/versions/actions/compare` | 两个版本对比 |
| 版本回滚 | POST | `/datasets/:id/versions/actions/rollback` | 回滚到指定版本 |

---

### 2.8 数据集操作 — 成员5

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 导出 | GET | `/datasets/:id/export` | 参数：format=csv/json/excel |
| 删除 | DELETE | `/datasets/:id` | — |
| 标记可标注 | PATCH | `/datasets/:id/label-status` | body: `{ "isLabeled": true }` |

---

## 三、数据预处理（成员6 + 成员7）

### 3.1 预处理任务列表 — 成员6

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 预处理任务列表 | GET | `/preprocess-tasks` | 支持分页、筛选 |

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 默认 1 |
| pageSize | number | 否 | 默认 10 |
| keyword | string | 否 | 任务名称搜索 |
| datasetId | string | 否 | 所属数据集筛选 |
| processTypes | string[] | 否 | clean/dedup/normalize/format，支持多选筛选 |
| status | string | 否 | pending/running/success/failed |
| startTime | string | 否 | 创建时间起，格式：YYYY-MM-DD |
| endTime | string | 否 | 创建时间止，格式：YYYY-MM-DD |

---

### 3.2 创建预处理任务 — 成员6

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 创建预处理任务 | POST | `/preprocess-tasks` | 提交处理规则和配置 |

**请求体：**

```json
{
  "name": "用户数据预处理任务",
  "datasetId": "dt_001",
  "versionId": "v1",
  "outputVersionDesc": "清洗去重标准化后版本",
  "processTypes": ["clean", "dedup", "normalize", "format"],
  "config": {
    "clean": {
      "nullStrategy": "delete",
      "filterOutlier": true,
      "outlierRules": [
        { "field": "age", "min": 0, "max": 150 }
      ]
    },
    "dedup": {
      "dedupFields": ["user_id", "phone"],
      "keepStrategy": "first"
    },
    "normalize": {
      "normalizeMethod": "zscore",
      "fields": ["age", "price"]
    },
    "format": {
      "targetFormat": "csv",
      "encoding": "utf-8",
      "delimiter": ","
    }
  }
}
```

> **说明：** `processTypes` 为数组，支持一次选择多种处理方式。选中的每种类型都必须在 `config` 中提供对应的配置。
> 系统按 `processTypes` 数组中的**顺序**依次执行处理步骤（先清洗 → 再去重 → 然后标准化 → 最后格式转换）。

**各类型 config 结构：**

| 类型 | config 字段 |
|------|-------------|
| clean（清洗） | `nullStrategy`（delete/fill）、`fillValue`、`filterOutlier`、`outlierRules` |
| dedup（去重） | `dedupFields`（数组）、`keepStrategy`（first/last） |
| normalize（标准化） | `normalizeMethod`（zscore/minmax）、`fields`（数组） |
| format（格式转换） | `targetFormat`（csv/json/excel）、`encoding`、`delimiter` |

**校验规则：**
- `processTypes` 至少选中 1 种
- 选中的每个 type 必须在 `config` 中提供对应配置
- 未选中的 type 不需要在 `config` 中出现

---

### 3.3 数据集版本列表 — 成员6

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 数据集版本 | GET | `/preprocess-tasks/datasets/:datasetId/versions` | 创建预处理任务时选择源版本 |

**响应：**

```json
{
  "code": 0,
  "data": [
    { "id": "v1", "name": "v1", "recordCount": 50000, "createdAt": "2026-06-16T09:00:00Z" },
    { "id": "v2", "name": "v2", "recordCount": 48000, "createdAt": "2026-06-18T11:15:00Z" }
  ],
  "message": "success"
}
```

---

### 3.4 可用数据集列表 — 成员6

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 可用数据集 | GET | `/preprocess-tasks/available-datasets` | 只返回 `collectStatus === 'success'` 的数据集 |

---

### 3.5 预处理任务详情 — 成员7

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 任务详情 | GET | `/preprocess-tasks/:id` | 含完整配置和执行结果 |

**响应：**

```json
{
  "code": 0,
  "data": {
    "id": "pp_001",
    "name": "用户数据预处理任务",
    "datasetId": "dt_001",
    "datasetName": "用户行为数据集",
    "processTypes": ["clean", "dedup", "format"],
    "status": "success",
    "progress": 100,
    "config": {
      "clean": { "nullStrategy": "delete", "filterOutlier": true },
      "dedup": { "dedupFields": ["user_id"], "keepStrategy": "first" },
      "format": { "targetFormat": "csv" }
    },
    "inputVersion": "v1",
    "outputVersion": "v2",
    "inputCount": 50000,
    "outputCount": 48000,
    "createdAt": "2026-06-18T11:00:00Z",
    "finishedAt": "2026-06-18T11:15:00Z"
  },
  "message": "success"
}
```

---

### 3.6 执行进度 — 成员7

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 实时进度 | GET | `/preprocess-tasks/:id/progress` | 轮询获取执行进度 |

**响应：**

```json
{
  "code": 0,
  "data": {
    "id": "pp_001",
    "status": "running",
    "progress": 65,
    "currentStep": 2,
    "currentStepName": "去重",
    "steps": [
      { "step": 1, "name": "数据清洗", "status": "completed" },
      { "step": 2, "name": "数据去重", "status": "running", "progress": 30 },
      { "step": 3, "name": "格式转换", "status": "pending" }
    ],
    "processedCount": 32500,
    "totalCount": 50000,
    "estimatedRemainingSeconds": 180
  },
  "message": "success"
}
```

> **说明：** 多选模式下，`steps` 展示每个处理步骤的执行状态（completed / running / pending），`progress` 为整体进度百分比。

---

### 3.7 前后对比 — 成员7

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 处理前后对比 | GET | `/preprocess-tasks/:id/comparison` | 对比处理前后的数据差异 |

**响应：**

```json
{
  "code": 0,
  "data": {
    "before": {
      "version": "v1",
      "recordCount": 50000,
      "fields": ["user_id", "name", "age", "email", "phone"],
      "sampleData": [
        ["1001", "张三", 25, "zhangsan@example.com", null]
      ]
    },
    "after": {
      "version": "v2",
      "recordCount": 48000,
      "fields": ["user_id", "name", "age", "email", "phone"],
      "sampleData": [
        ["1001", "张三", 25, "zhangsan@example.com", "13800138000"]
      ]
    },
    "diff": {
      "recordCountChange": -2000,
      "fieldsAdded": 0,
      "fieldsRemoved": 0,
      "nullRemoved": 2000
    }
  },
  "message": "success"
}
```

---

### 3.8 执行日志 — 成员7

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 日志列表 | GET | `/preprocess-tasks/:id/logs` | 任务执行日志 |

**响应：**

```json
{
  "code": 0,
  "data": [
    { "time": "2026-06-18 11:00:01", "level": "info", "message": "任务开始执行" },
    { "time": "2026-06-18 11:00:05", "level": "info", "message": "开始读取源数据集 v1" },
    { "time": "2026-06-18 11:05:00", "level": "warning", "message": "发现 2000 条空值记录" },
    { "time": "2026-06-18 11:05:02", "level": "info", "message": "已删除 2000 条空值记录" },
    { "time": "2026-06-18 11:10:00", "level": "info", "message": "异常值过滤完成，过滤 0 条" },
    { "time": "2026-06-18 11:15:00", "level": "info", "message": "任务执行完成，输出 v2 版本" }
  ],
  "message": "success"
}
```

---

### 3.9 输出结果 — 成员7

| 接口 | 方法 | URL | 说明 |
|------|------|-----|------|
| 结果预览 | GET | `/preprocess-tasks/:id/preview` | 处理后的样本数据 |
| 结果导出 | GET | `/preprocess-tasks/:id/export` | 参数：format=csv/json/excel |

---

## 四、数据工坊首页（成员1）

> 首页接口为聚合统计接口，不属于单一资源，保留 `/dashboard` 前缀。

### 4.1 统计数据

| 接口 | 方法 | URL |
|------|------|-----|
| 统计概览 | GET | `/dashboard/stats` |

**响应：**

```json
{
  "code": 0,
  "data": {
    "datasourceCount": 25,
    "datasetCount": 18,
    "preprocessCount": 12,
    "todayTaskCount": 5,
    "successRate": 92.5,
    "failedTaskCount": 2
  },
  "message": "success"
}
```

### 4.2 趋势图数据

| 接口 | 方法 | URL |
|------|------|-----|
| 趋势数据 | GET | `/dashboard/trend` |

**响应：**

```json
{
  "code": 0,
  "data": {
    "dates": ["06-15", "06-16", "06-17", "06-18", "06-19", "06-20"],
    "datasetCreated": [3, 5, 2, 8, 4, 6],
    "preprocessCompleted": [1, 3, 2, 5, 3, 4]
  },
  "message": "success"
}
```

### 4.3 分布图数据

| 接口 | 方法 | URL |
|------|------|-----|
| 分布统计 | GET | `/dashboard/distribution` |

**响应：**

```json
{
  "code": 0,
  "data": {
    "datasourceTypeStats": [
      { "type": "api", "count": 8 },
      { "type": "upload", "count": 6 },
      { "type": "database", "count": 5 },
      { "type": "web", "count": 6 }
    ],
    "datasetStatusStats": [
      { "status": "success", "count": 12 },
      { "status": "running", "count": 4 },
      { "status": "failed", "count": 2 }
    ],
    "preprocessStatusStats": [
      { "status": "pending", "count": 2 },
      { "status": "running", "count": 3 },
      { "status": "success", "count": 10 },
      { "status": "failed", "count": 1 }
    ]
  },
  "message": "success"
}
```

### 4.4 最近任务

| 接口 | 方法 | URL |
|------|------|-----|
| 最近任务 | GET | `/dashboard/recent-tasks` |

**响应：**

```json
{
  "code": 0,
  "data": [
    {
      "id": "pp_005",
      "name": "用户数据去重",
      "type": "preprocess",
      "status": "running",
      "createdAt": "2026-06-20T14:00:00Z"
    },
    {
      "id": "dt_003",
      "name": "订单数据集创建",
      "type": "dataset",
      "status": "success",
      "createdAt": "2026-06-20T10:00:00Z"
    }
  ],
  "message": "success"
}
```

---

## 五、接口总览

| # | 模块 | 接口 | 方法 | URL | 负责人 |
|---|------|------|------|-----|--------|
| 1 | 首页 | 统计概览 | GET | `/dashboard/stats` | 成员1 |
| 2 | 首页 | 趋势数据 | GET | `/dashboard/trend` | 成员1 |
| 3 | 首页 | 分布统计 | GET | `/dashboard/distribution` | 成员1 |
| 4 | 首页 | 最近任务 | GET | `/dashboard/recent-tasks` | 成员1 |
| 5 | 数据源 | 列表 | GET | `/datasources` | 成员2 |
| 6 | 数据源 | 详情 | GET | `/datasources/:id` | 成员2 / 成员3 |
| 7 | 数据源 | 关联数据集 | GET | `/datasources/:id/datasets` | 成员2 |
| 8 | 数据源 | 测试记录 | GET | `/datasources/:id/test-records` | 成员2 |
| 9 | 数据源 | 字段列表 | GET | `/datasources/:id/fields` | 成员4 |
| 10 | 数据源 | 删除 | DELETE | `/datasources/:id` | 成员2 |
| 11 | 数据源 | 测试连接 | POST | `/datasources/actions/test` | 成员2 / 成员3 |
| 12 | 数据源 | 新建 | POST | `/datasources` | 成员3 ⭐ |
| 13 | 数据源 | 编辑 | PUT | `/datasources/:id` | 成员3 ⭐ |
| 14 | 数据集 | 列表 | GET | `/datasets` | 成员4 |
| 15 | 数据集 | 可选数据源 | GET | `/datasets/datasource-options` | 成员4 |
| 16 | 数据集 | 创建 | POST | `/datasets` | 成员4 |
| 17 | 数据集 | 详情 | GET | `/datasets/:id` | 成员5 |
| 18 | 数据集 | 字段结构 | GET | `/datasets/:id/fields` | 成员5 |
| 19 | 数据集 | 样本预览 | GET | `/datasets/:id/samples` | 成员5 |
| 20 | 数据集 | 版本列表 | GET | `/datasets/:id/versions` | 成员5 |
| 21 | 数据集 | 版本对比 | POST | `/datasets/:id/versions/actions/compare` | 成员5 |
| 22 | 数据集 | 版本回滚 | POST | `/datasets/:id/versions/actions/rollback` | 成员5 |
| 23 | 数据集 | 导出 | GET | `/datasets/:id/export` | 成员5 |
| 24 | 数据集 | 删除 | DELETE | `/datasets/:id` | 成员5 |
| 25 | 数据集 | 标记可标注 | PATCH | `/datasets/:id/label-status` | 成员5 |
| 26 | 预处理 | 列表 | GET | `/preprocess-tasks` | 成员6 |
| 27 | 预处理 | 数据集版本 | GET | `/preprocess-tasks/datasets/:datasetId/versions` | 成员6 |
| 28 | 预处理 | 可用数据集 | GET | `/preprocess-tasks/available-datasets` | 成员6 |
| 29 | 预处理 | 创建 | POST | `/preprocess-tasks` | 成员6 |
| 30 | 预处理 | 详情 | GET | `/preprocess-tasks/:id` | 成员7 |
| 31 | 预处理 | 执行进度 | GET | `/preprocess-tasks/:id/progress` | 成员7 |
| 32 | 预处理 | 前后对比 | GET | `/preprocess-tasks/:id/comparison` | 成员7 |
| 33 | 预处理 | 日志 | GET | `/preprocess-tasks/:id/logs` | 成员7 |
| 34 | 预处理 | 结果预览 | GET | `/preprocess-tasks/:id/preview` | 成员7 |
| 35 | 预处理 | 结果导出 | GET | `/preprocess-tasks/:id/export` | 成员7 |

---

> 文档版本：v2.1
> 更新日期：2026-06-23
> 统一返回格式：`{ code: 0, data: T, message: string }`
> v2.0 更新：全面统一为 RESTful 风格，资源路径改为复数名词，移除 URL 中的动词，非 CRUD 操作统一使用 actions 前缀
> v2.1 更新：预处理任务 `processType`（单选）改为 `processTypes`（多选数组），支持一次选择多种处理方式按顺序执行；进度接口增加多步骤状态展示
