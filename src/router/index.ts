import { createRouter, createWebHistory } from 'vue-router'
import PageLayout from '@/components/PageLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: PageLayout,
      redirect: '/dashboard',
      children: [
        {
          path: '/datasource',
          redirect: '/datasource/list',
          children: [
            {
              path: '/dashboard',
              name: 'Dashboard',
              component: () => import('@/views/Dashboard/index.vue'),
              meta: { title: '模块概览' },
            },
            {
              path: 'list',
              name: 'DatasourceList',
              component: () => import('@/views/Datasource/List.vue'),
              meta: { title: '数据源列表' },
            },
            {
              path: 'create',
              name: 'DatasourceCreate',
              component: () => import('@/views/Datasource/Create.vue'),
              meta: { title: '新增数据源' },
            },
            {
              path: 'edit/:id',
              name: 'DatasourceEdit',
              component: () => import('@/views/Datasource/Create.vue'),
              meta: { title: '编辑数据源' },
            },
          ],
        },
        {
          path: '/dataset',
          redirect: '/dataset/list',
          children: [
            {
              path: 'list',
              name: 'DatasetList',
              component: () => import('@/views/Dataset/List.vue'),
              meta: { title: '数据集列表' },
            },
            {
              path: 'create',
              name: 'DatasetCreate',
              component: () => import('@/views/Dataset/Create.vue'),
              meta: { title: '创建数据集' },
            },
          ],
        },
        {
          path: '/preprocess',
          redirect: '/preprocess/list',
          children: [
            {
              path: 'list',
              name: 'PreprocessList',
              component: () => import('@/views/Preprocess/List.vue'),
              meta: { title: '预处理任务' },
            },
            {
              path: 'create',
              name: 'PreprocessCreate',
              component: () => import('@/views/Preprocess/Create.vue'),
              meta: { title: '新建预处理' },
            },
          ],
        },
      ],
    },
  ],
})

export default router
