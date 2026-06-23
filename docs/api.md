# API 接口文档

## 通用规范

### 基础地址

```
baseURL: /api
```

所有请求自动添加 `/api` 前缀。例如 `request.get('/preprocess/list')` 实际请求 `/api/preprocess/list`。

### 统一返回格式

```json
{
  "code": 0,
  "data": {},
  "message": "success"
}
```

| 字段 | 说明 |
|------|------|
| `code === 0` | 成功 |
| `code !== 0` | 失败，前端统一弹出 `message` 错误提示 |
| `data` | 响应数据，前端调用处直接拿到此字段内容（响应拦截器已解包）|

### 请求工具

封装在 `src/utils/request.ts`，基于 Axios：

- 超时时间：10 秒
- Content-Type：`application/json`
- 请求拦截器预留了 token 注入位点
- 响应拦截器自动解包 `data`、统一弹错

---

## 一、数据源管理 (`/datasource`)

### 1.1 获取数据源列表

```
GET /api/datasource/list
```

**请求参数 (Query)**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页条数，默认 10 |
| keyword | string | 否 | 名称模糊搜索 |
| type | string | 否 | 数据源类型筛选 |

**响应数据**

```json
{
  "list": [
    {
      "id": "ds_001",
      "name": "数据源 1",
      "type": "api",
      "sourceUrl": "https://api.example.com/source/1",
      "status": "active",
      "description": "描述信息",
      "createdAt": "2026-06-15T10:00:00Z",
      "updatedAt": "2026-06-18T14:30:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

**类型枚举**

| 字段 | 可选值 |
|------|--------|
| type | `api` API接口 / `upload` 本地上传 / `database` 数据库 / `web` Web页面抓取 |
| status | `active` 启用 / `inactive` 停用 |

### 1.2 获取数据源详情

```
GET /api/datasource/detail/:id
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 数据源 ID |

**响应数据** — 同列表项结构。

### 1.3 创建数据源

```
POST /api/datasource/create
```

**请求体 (Body)**

```json
{
  "name": "数据源名称",
  "type": "api",
  "sourceUrl": "https://api.example.com/data",
  "description": "描述信息"
}
```

**响应数据**

```json
{ "id": "ds_new" }
```

### 1.4 更新数据源

```
PUT /api/datasource/update/:id
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 数据源 ID |

**请求体** — 同创建。

**响应数据** — `null`。

### 1.5 删除数据源

```
DELETE /api/datasource/delete/:id
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 数据源 ID |

**响应数据** — `null`。

### 1.6 获取采集规则

```
GET /api/datasource/:id/rules
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 数据源 ID |

**响应数据**

```json
{
  "fieldMappings": [
    { "source": "user_id", "target": "用户ID" }
  ],
  "filters": [
    { "field": "age", "operator": ">", "value": "18" }
  ],
  "schedule": "daily",
  "cron": "0 0 * * *"
}
```

### 1.7 保存采集规则

```
POST /api/datasource/:id/rules
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 数据源 ID |

**响应数据** — `null`。

### 1.8 验证采集规则

```
POST /api/datasource/:id/rules/validate
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 数据源 ID |

**响应数据**

```json
[
  { "user_id": "1001", "name": "张三", "age": 25 }
]
```

### 1.9 获取数据源字段

```
GET /api/datasource/:id/fields
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 数据源 ID |

**响应数据**

```json
["user_id", "name", "age", "email", "phone"]
```

---

## 二、数据集管理 (`/dataset`)

### 2.1 获取数据集列表

```
GET /api/dataset/list
```

**请求参数 (Query)**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页条数，默认 10 |
| keyword | string | 否 | 名称模糊搜索 |
| status | string | 否 | 采集状态筛选 |

**响应数据**

```json
{
  "list": [
    {
      "id": "dt_001",
      "name": "数据集 1",
      "datasourceId": "ds_001",
      "datasourceName": "数据源 1",
      "collectStatus": "success",
      "collectProgress": 100,
      "recordCount": 50000,
      "createdAt": "2026-06-16T09:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 10
}
```

**采集状态枚举**

| 值 | 标签 |
|----|------|
| pending | 待采集 |
| running | 采集中 |
| success | 采集成功 |
| failed | 采集失败 |
| paused | 已暂停 |

### 2.2 获取可选数据源

```
GET /api/dataset/datasource-options
```

用于新建数据集时的下拉选项。

**响应数据**

```json
[
  { "id": "ds_001", "name": "用户行为API" },
  { "id": "ds_002", "name": "订单数据库" },
  { "id": "ds_003", "name": "日志文件上传" }
]
```

### 2.3 创建数据集

```
POST /api/dataset/create
```

**响应数据**

```json
{ "id": "dt_new" }
```

### 2.4 获取数据集配置

```
GET /api/dataset/:id/config
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 数据集 ID |

### 2.5 更新数据集配置

```
PUT /api/dataset/:id/config
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 数据集 ID |

### 2.6 启动采集

```
POST /api/dataset/:id/start
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 数据集 ID |

**响应数据** — `null`。

### 2.7 暂停采集

```
POST /api/dataset/:id/pause
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 数据集 ID |

**响应数据** — `null`。

### 2.8 重新采集

```
POST /api/dataset/:id/retry
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 数据集 ID |

**响应数据** — `null`。

### 2.9 删除数据集

```
DELETE /api/dataset/:id
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 数据集 ID |

**响应数据** — `null`。

### 2.10 获取采集状态

```
GET /api/dataset/:id/status
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 数据集 ID |

**响应数据**

```json
{
  "status": "running",
  "progress": 65,
  "message": "采集中..."
}
```

### 2.11 获取采集日志

```
GET /api/dataset/:id/logs
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 数据集 ID |

**响应数据**

```json
[
  { "time": "2026-06-20 10:00:01", "level": "info", "message": "开始采集数据" }
]
```

| 字段 | 说明 |
|------|------|
| level | `info` / `warning` / `error` |

---

## 三、预处理任务 (`/preprocess`)

### 3.1 获取任务列表

```
GET /api/preprocess/list
```

**请求参数 (Query)**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页条数，默认 10 |
| keyword | string | 否 | 任务名称模糊搜索 |
| processType | string | 否 | 处理方式筛选 |
| status | string | 否 | 状态筛选 |
| datasetId | string | 否 | 源数据集筛选 |
| startDate | string | 否 | 创建开始日期，格式 `YYYY-MM-DD` |
| endDate | string | 否 | 创建结束日期，格式 `YYYY-MM-DD` |

**处理方式枚举**

| 值 | 标签 |
|----|------|
| clean | 数据清洗 |
| dedup | 数据去重 |
| normalize | 标准化 |
| format | 格式转换 |

**状态枚举**

| 值 | 标签 |
|----|------|
| pending | 待处理 |
| running | 处理中 |
| success | 处理成功 |
| failed | 处理失败 |

**响应数据**

```json
{
  "list": [
    {
      "id": "pp_001",
      "name": "预处理任务 1",
      "datasetId": "dt_001",
      "datasetName": "数据集 1",
      "processType": "clean",
      "status": "running",
      "version": "v2",
      "createdAt": "2026-06-18T11:00:00Z"
    }
  ],
  "total": 30,
  "page": 1,
  "pageSize": 10
}
```

### 3.2 获取可用数据集

```
GET /api/preprocess/available-datasets
```

用于新建任务时的下拉选项，仅返回采集状态为 `success` 的数据集。

**响应数据**

```json
[
  { "id": "dt_001", "name": "用户行为数据集_v1", "collectStatus": "success" },
  { "id": "dt_002", "name": "订单数据集_v1", "collectStatus": "success" }
]
```

### 3.3 创建预处理任务

```
POST /api/preprocess/create
```

**请求体 (Body)** — 配置按处理方式分型，仅发送当前类型对应的字段。

**数据清洗 (clean)**

```json
{
  "name": "清洗任务",
  "datasetId": "dt_001",
  "processType": "clean",
  "config": {
    "nullStrategy": "delete",
    "filterOutlier": true
  }
}
```

| 配置字段 | 类型 | 说明 |
|---------|------|------|
| nullStrategy | string | `delete` 删除空值行 / `fill` 填充默认值 |
| filterOutlier | boolean | 是否过滤异常值 |

**数据去重 (dedup)**

```json
{
  "name": "去重任务",
  "datasetId": "dt_001",
  "processType": "dedup",
  "config": {
    "dedupFields": ["user_id", "phone"],
    "keepStrategy": "first"
  }
}
```

| 配置字段 | 类型 | 说明 |
|---------|------|------|
| dedupFields | string[] | 去重依据字段列表 |
| keepStrategy | string | `first` 保留第一条 / `last` 保留最后一条 |

**标准化 (normalize)**

```json
{
  "name": "标准化任务",
  "datasetId": "dt_001",
  "processType": "normalize",
  "config": {
    "normalizeMethod": "zscore"
  }
}
```

| 配置字段 | 类型 | 说明 |
|---------|------|------|
| normalizeMethod | string | `zscore` Z-score 标准化 / `minmax` Min-Max 归一化 |

**格式转换 (format)**

```json
{
  "name": "格式转换任务",
  "datasetId": "dt_001",
  "processType": "format",
  "config": {
    "targetFormat": "csv"
  }
}
```

| 配置字段 | 类型 | 说明 |
|---------|------|------|
| targetFormat | string | `csv` / `json` / `excel` |

**响应数据**

```json
{ "id": "pp_new" }
```

### 3.4 获取任务详情

```
GET /api/preprocess/:id/detail
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 任务 ID |

### 3.5 获取版本列表

```
GET /api/preprocess/:id/versions
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 任务 ID |

**响应数据**

```json
[
  { "version": "v1", "createdAt": "2026-06-15T10:00:00Z", "recordCount": 50000 },
  { "version": "v2", "createdAt": "2026-06-18T11:00:00Z", "recordCount": 48000 }
]
```

### 3.6 版本对比

```
POST /api/preprocess/:id/compare
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 任务 ID |

**请求体**

```json
{
  "version1": "v1",
  "version2": "v2"
}
```

**响应数据**

```json
{
  "version1": { "version": "v1", "recordCount": 50000, "fields": 10 },
  "version2": { "version": "v2", "recordCount": 48000, "fields": 10 },
  "diff": {
    "recordCount": -2000,
    "removedFields": 0,
    "addedFields": 0
  }
}
```

### 3.7 回滚到指定版本

```
POST /api/preprocess/:id/rollback
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 任务 ID |

**请求体**

```json
{
  "version": "v1"
}
```

**响应数据** — `null`。

### 3.8 结果预览

```
GET /api/preprocess/:id/preview
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 任务 ID |

**响应数据**

```json
{
  "columns": ["user_id", "name", "age", "email"],
  "rows": [
    ["1001", "张三", "25", "zhangsan@example.com"],
    ["1002", "李四", "30", "lisi@example.com"]
  ]
}
```

### 3.9 导出结果

```
GET /api/preprocess/:id/export
```

**路径参数**

| 参数 | 说明 |
|------|------|
| id | 任务 ID |

**请求参数 (Query)**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| format | string | 是 | 导出格式：`csv` / `json` / `excel` |

**响应** — 文件流 Blob（`responseType: 'blob'`）。

---

## 附录：API 文件映射

| 源码文件 | 对应 API 前缀 |
|----------|--------------|
| `src/api/datasource.ts` | `/datasource/*` |
| `src/api/dataset.ts` | `/dataset/*` |
| `src/api/preprocess.ts` | `/preprocess/*` |

各模块 API 方法命名与后端端点一一对应，文件名按模块拆分，与 `views/` 和 `stores/` 的目录结构保持一致。
