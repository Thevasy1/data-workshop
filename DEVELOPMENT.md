# 开发规范

## 目录规范

- `views/`：按模块存放页面组件
- `components/`：全局公共组件
- `api/`：按模块拆分接口定义
- `stores/`：按模块拆分 Pinia Store
- `utils/`：工具函数、常量、格式化
- `mock/`：Mock 数据接口

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `CommonTable.vue` |
| 文件/目录 | kebab-case | `datasource-list.ts` |
| 变量 | camelCase | `tableData` |
| 常量 | UPPER_SNAKE_CASE | `BASE_URL` |
| 组件名 | 多词组合 | `PageLayout.vue` |

## 组件开发规范

1. 使用 `<script setup lang="ts">` 语法
2. 组件名使用 PascalCase，且至少两个单词
3. Props 使用 `withDefaults` 或 `defineProps` 声明类型
4. 使用 `defineEmits` 声明事件类型
5. 使用 `defineExpose` 暴露组件方法

## 接口规范

统一返回格式：

```json
{
  "code": 0,
  "data": {},
  "message": "success"
}
```

- `code === 0` 表示成功
- 非 0 时前端统一弹出 `message` 错误提示

## Git 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: 新增数据源列表页
fix: 修复表格分页显示错误
docs: 更新接口文档
style: 调整按钮样式
refactor: 重构 Axios 封装
```

## 分支管理

- `main`：主分支，联调完成后合并
- `develop`：开发分支，功能开发完成后合并
- `feature/xxx`：功能分支，从 develop 切出

```bash
# 开发新功能
git checkout develop
git pull origin develop
git checkout -b feature/datasource-list
# 开发完成后
git push origin feature/datasource-list
# 在 GitHub 上提 PR 合并到 develop
```

## 状态枚举

```ts
// 采集状态
export const COLLECT_STATUS = {
  pending: '待采集',
  running: '采集中',
  success: '采集成功',
  failed: '采集失败',
  paused: '已暂停',
}

// 预处理状态
export const PREPROCESS_STATUS = {
  pending: '待处理',
  running: '处理中',
  success: '处理成功',
  failed: '处理失败',
}
```

## Mock 开发

本项目使用 `vite-plugin-mock` 进行接口模拟，数据定义在 `src/mock/index.ts` 中。

开发时，前端调用 `request.get('/datasource/list')` 会自动命中 mock 接口。

## 常见问题

### 1. 安装依赖失败

```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### 2. Element Plus 图标不显示

已在 `main.ts` 中自动注册所有图标，直接使用 `<el-icon><Plus /></el-icon>` 即可。

### 3. 接口 404

检查 `vite.config.ts` 中 `viteMockServe` 配置是否开启，且 `mockPath` 指向正确。
