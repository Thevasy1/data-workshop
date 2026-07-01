import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', name: 'Home', component: () => import('@/views/Home.vue'), meta: { title: '数据工坊首页' } },
    { path: '/datasource/list', name: 'DatasourceList', component: () => import('@/views/Datasource/List.vue'), meta: { title: '数据源列表' } },
    { path: '/datasource/create', name: 'DatasourceCreate', component: () => import('@/views/Datasource/Form.vue'), meta: { title: '新建数据源' } },
    { path: '/datasource/edit/:id', name: 'DatasourceEdit', component: () => import('@/views/Datasource/Form.vue'), meta: { title: '编辑数据源' } },
    { path: '/datasource/detail/:id', name: 'DatasourceDetail', component: () => import('@/views/Datasource/Detail.vue'), meta: { title: '数据源详情' } },
    { path: '/dataset/list', name: 'DatasetList', component: () => import('@/views/Dataset/List.vue'), meta: { title: '数据集列表' } },
    { path: '/dataset/create', name: 'DatasetCreate', component: () => import('@/views/Dataset/Create.vue'), meta: { title: '创建数据集' } },
    { path: '/dataset/detail/:id', name: 'DatasetDetail', component: () => import('@/views/Dataset/Detail.vue'), meta: { title: '数据集详情' } },
    { path: '/preprocess/list', name: 'PreprocessList', component: () => import('@/views/Preprocess/List.vue'), meta: { title: '预处理任务列表' } },
    { path: '/preprocess/create', name: 'PreprocessCreate', component: () => import('@/views/Preprocess/Create.vue'), meta: { title: '创建预处理任务' } },
    { path: '/preprocess/detail/:id', name: 'PreprocessDetail', component: () => import('@/views/Preprocess/Detail.vue'), meta: { title: '预处理任务详情' } },
  ],
})

export default router
