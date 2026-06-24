# API 接口文档

> 遵循 RESTful 风格设计，资源路径使用复数名词。
> 非 CRUD 操作统一使用 `/actions/` 前缀。
> 更新日期：2026-06-24

## 通用规范

### 基础地址

```
baseURL: /api
```

### RESTful 规范

| 方法 | 操作 | 示例 |
|------|------|------|
| GET | 查询（列表 / 详情） | `GET /datasources`、`GET /datasources/:id` |
| POST | 新建 / 执行动作 | `POST /datasources`、`POST /datasources/actions/test` |
| PUT | 全量更新 | `PUT /datasources/:id` |
| PATCH | 局部更新 | `PATCH /datasets/:id/label-status` |
| DELETE | 删除 | `DELETE /datasources/:id` |

### 统一返回格式

```json
{ "code": 0, "data": {}, "message": "success" }
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
- 响应拦截器自动解包 `data`、统一弹错

---

## 一、数据源管理 `/datasources`

### 1.1 列表

```
GET /api/datasources
```

**请求参数 (Query)**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 默认 1 |
| pageSize | number | 否 | 默认 10 |
| keyword | string | 否 | 名称模糊搜索 |
| type | string | 否 | api / upload / database / web |
| status | string | 否 | draft / active / inactive / failed |
| startTime | string | 否 | 创建时间起 YYYY-MM-DD |
| endTime | string | 否 | 创建时间止 YYYY-MM-DD |

### 1.2 详情

```
GET /api/datasources/:id
```

详情包含完整配置信息 `config`，按数据源类型分型（`config.api` / `config.upload` / `config.database` / `config.web`），编辑页回显复用此接口。

### 1.3 新建

```
POST /api/datasources
```

**请求体** — 按 type 不同，config 结构不同（见 API 设计文档 v2.1）。

### 1.4 编辑

```
PUT /api/datasources/:id
```

请求体与新建相同，返回 `{ code: 0, data: null, message: "更新成功" }`。

### 1.5 删除

```
DELETE /api/datasources/:id
```

返回 `{ code: 0, data: null, message: "删除成功" }`。

### 1.6 测试连接

```
POST /api/datasources/actions/test
```

**请求体** — 完整的数据源配置。**响应** — `{ success: boolean, message: string, sampleData: array }`。

### 1.7 关联数据集

```
GET /api/datasources/:id/datasets
```

参数：`page`、`pageSize`（默认 5）。

### 1.8 测试记录

```
GET /api/datasources/:id/test-records
```

参数：`page`、`pageSize`（默认 10）。

### 1.9 字段列表

```
GET /api/datasources/:id/fields
```

**响应** — 结构化字段数组：`[{ name, type, description }]`。

---

## 二、数据集管理 `/datasets`

### 2.1 列表

```
GET /api/datasets
```

**请求参数 (Query)**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 默认 1 |
| pageSize | number | 否 | 默认 10 |
| keyword | string | 否 | 名称搜索 |
| datasourceId | string | 否 | 来源数据源筛选 |
| collectStatus | string | 否 | pending/running/success/failed/paused |
| startTime | string | 否 | 创建时间起 |
| endTime | string | 否 | 创建时间止 |

### 2.2 可选数据源

```
GET /api/datasets/datasource-options
```

### 2.3 创建

```
POST /api/datasets
```

### 2.4 详情

```
GET /api/datasets/:id
```

### 2.5 字段结构

```
GET /api/datasets/:id/fields
```

### 2.6 样本预览

```
GET /api/datasets/:id/samples?limit=20
```

### 2.7 版本管理

| 操作 | 方法 | URL |
|------|------|-----|
| 版本列表 | GET | `/api/datasets/:id/versions` |
| 版本对比 | POST | `/api/datasets/:id/versions/actions/compare` |
| 版本回滚 | POST | `/api/datasets/:id/versions/actions/rollback` |

### 2.8 其他操作

| 操作 | 方法 | URL |
|------|------|-----|
| 导出 | GET | `/api/datasets/:id/export?format=csv` |
| 删除 | DELETE | `/api/datasets/:id` |
| 标记可标注 | PATCH | `/api/datasets/:id/label-status` body: `{ isLabeled: boolean }` |

---

## 三、预处理任务 `/preprocess-tasks`

### 3.1 列表

```
GET /api/preprocess-tasks
```

**请求参数 (Query)**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 默认 1 |
| pageSize | number | 否 | 默认 10 |
| keyword | string | 否 | 任务名称搜索 |
| processTypes | string[] | 否 | 多选：clean/dedup/normalize/format |
| status | string | 否 | pending/running/success/failed |
| datasetId | string | 否 | 源数据集筛选 |
| startTime | string | 否 | 创建时间起 YYYY-MM-DD |
| endTime | string | 否 | 创建时间止 YYYY-MM-DD |

### 3.2 创建

```
POST /api/preprocess-tasks
```

**请求体**

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
      "outlierRules": [{ "field": "age", "min": 0, "max": 150 }]
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

> `processTypes` 为数组，支持多选。系统按数组顺序依次执行（先清洗→再去重→然后标准化→最后格式转换）。
> 选中的每个 type 必须在 `config` 中提供对应配置，未选中的 type 不必出现。

**各类型 config 字段：**

| 类型 | config 字段 |
|------|-------------|
| clean | `nullStrategy`（delete/fill）、`fillValue`、`filterOutlier`、`outlierRules` |
| dedup | `dedupFields`（数组）、`keepStrategy`（first/last） |
| normalize | `normalizeMethod`（zscore/minmax）、`fields`（数组） |
| format | `targetFormat`（csv/json/excel）、`encoding`、`delimiter` |

### 3.3 数据集版本列表

```
GET /api/preprocess-tasks/datasets/:datasetId/versions
```

创建任务时选择源版本。

### 3.4 可用数据集

```
GET /api/preprocess-tasks/available-datasets
```

仅返回 `collectStatus === 'success'` 的数据集。

### 3.5 任务详情

```
GET /api/preprocess-tasks/:id
```

返回含完整配置、执行结果、输入输出版本。

### 3.6 执行进度

```
GET /api/preprocess-tasks/:id/progress
```

轮询获取多步骤执行进度，`steps` 数组展示每个步骤状态。

### 3.7 前后对比

```
GET /api/preprocess-tasks/:id/comparison
```

对比 `before` 和 `after` 的版本信息、记录数、字段和样本数据。

### 3.8 执行日志

```
GET /api/preprocess-tasks/:id/logs
```

### 3.9 结果预览 / 导出

| 操作 | 方法 | URL |
|------|------|-----|
| 预览 | GET | `/api/preprocess-tasks/:id/preview` |
| 导出 | GET | `/api/preprocess-tasks/:id/export?format=csv` |

---

## 四、数据工坊首页 `/dashboard`

### 4.1 统计概览

```
GET /api/dashboard/stats
```

**响应** — `datasourceCount`、`datasetCount`、`preprocessCount`、`todayTaskCount`、`successRate`、`failedTaskCount`。

### 4.2 趋势图

```
GET /api/dashboard/trend
```

**响应** — `dates`、`datasetCreated`、`preprocessCompleted` 数组。

### 4.3 分布统计

```
GET /api/dashboard/distribution
```

**响应** — 数据源类型分布、数据集状态分布、预处理状态分布。

### 4.4 最近任务

```
GET /api/dashboard/recent-tasks
```

---

## 附录：接口总览

| # | 模块 | 接口 | 方法 | URL | 负责人 |
|---|------|------|------|-----|--------|
| 1 | 首页 | 统计概览 | GET | `/dashboard/stats` | 成员1 |
| 2 | 首页 | 趋势数据 | GET | `/dashboard/trend` | 成员1 |
| 3 | 首页 | 分布统计 | GET | `/dashboard/distribution` | 成员1 |
| 4 | 首页 | 最近任务 | GET | `/dashboard/recent-tasks` | 成员1 |
| 5 | 数据源 | 列表 | GET | `/datasources` | 成员2 |
| 6 | 数据源 | 详情 | GET | `/datasources/:id` | 成员2/3 |
| 7 | 数据源 | 关联数据集 | GET | `/datasources/:id/datasets` | 成员2 |
| 8 | 数据源 | 测试记录 | GET | `/datasources/:id/test-records` | 成员2 |
| 9 | 数据源 | 字段列表 | GET | `/datasources/:id/fields` | 成员4 |
| 10 | 数据源 | 删除 | DELETE | `/datasources/:id` | 成员2 |
| 11 | 数据源 | 测试连接 | POST | `/datasources/actions/test` | 成员2/3 |
| 12 | 数据源 | 新建 | POST | `/datasources` | 成员3 |
| 13 | 数据源 | 编辑 | PUT | `/datasources/:id` | 成员3 |
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

### 源码文件映射

| 文件 | 对应前缀 |
|------|---------|
| `src/api/datasource.ts` | `/datasources/*` |
| `src/api/dataset.ts` | `/datasets/*` |
| `src/api/preprocess.ts` | `/preprocess-tasks/*` |
