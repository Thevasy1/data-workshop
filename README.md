# 数据工坊

> 数据工坊前端项目 — Vue 3 + TypeScript + Vite + Element Plus + Pinia + Vue Router

## 项目简介

数据工坊是一个数据管理平台，支持多数据源接入、数据集构建和数据预处理。

- **数据源管理**：统一接入 API、本地上传、数据库、Web 页面抓取等多种数据来源
- **数据集构建**：基于数据源创建数据集，支持采集状态监控和手动管理
- **数据预处理**：对数据集进行清洗、去重、标准化、格式转换等处理

## 技术栈

| 技术 | 版本 |
|------|------|
| Vue | 3.4+ |
| TypeScript | 5.4+ |
| Vite | 5.2+ |
| Element Plus | 2.7+ |
| Pinia | 2.1+ |
| Vue Router | 4.3+ |
| Axios | 1.7+ |
| ECharts | 5.5+ |

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产环境

```bash
npm run build
```

### 代码规范检查

```bash
npm run lint
npm run format
```

## 项目结构

```
data-workshop/
├── src/
│   ├── api/              # 接口定义
│   ├── components/       # 公共组件
│   ├── mock/             # Mock 数据
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   ├── styles/           # 全局样式
│   ├── utils/            # 工具函数
│   ├── views/            # 页面视图
│   ├── App.vue           # 根组件
│   └── main.ts           # 入口文件
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .eslintrc.cjs
└── .prettierrc
```

## 开发规范

详见 [DEVELOPMENT.md](./DEVELOPMENT.md)

## 团队成员

- A：基础架构与公共组件
- B：数据源管理 — 列表与接入
- C：数据源管理 — 采集规则配置
- D：数据集构建 — 创建与配置
- E：数据集构建 — 采集状态与手动管理
- F：数据预处理 — 核心功能
- G：数据预处理 — 版本管理与结果

## 许可证

MIT
