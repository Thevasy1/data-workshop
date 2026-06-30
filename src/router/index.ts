import { createRouter, createWebHistory } from 'vue-router'
import PageLayout from '@/components/PageLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: PageLayout,
      redirect: '/home',
      children: [
        {
          path: '/home',
          name: 'WorkshopHome',
          component: () => import('@/views/Home.vue'),
          meta: { title: '数据工坊首页' },
        },
        {
          path: '/datasource',
          redirect: '/datasource/list',
          children: [
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
              meta: { title: '新建数据源' },
            },
            {
              path: 'edit/:id',
              name: 'DatasourceEdit',
              component: () => import('@/views/Datasource/Create.vue'),
              meta: { title: '编辑数据源' },
            },
            {
              path: 'detail/:id',
              name: 'DatasourceDetail',
              component: () => import('@/views/Datasource/Detail.vue'),
              meta: { title: '数据源详情' },
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
            {
              path: 'detail/:id',
              name: 'DatasetDetail',
              component: () => import('@/views/Dataset/Detail.vue'),
              meta: { title: '数据集详情' },
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
            {
              path: 'detail/:id',
              name: 'PreprocessDetail',
              component: () => import('@/views/Preprocess/Detail.vue'),
              meta: { title: '预处理任务详情' },
            },
          ],
        },
      ],
    },
  ],
})

export default router
