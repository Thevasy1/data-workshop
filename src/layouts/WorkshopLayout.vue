<template>
  <el-container class="layout">
    <el-aside width="var(--sidebar-width)" class="sidebar">
      <div class="brand">
        <div class="brand-mark">
          <el-icon :size="23"><DataAnalysis /></el-icon>
        </div>
        <div>
          <div class="brand-name">一体化 <b>AI</b> 平台</div>
          <div class="brand-sub">Data Workshop</div>
        </div>
      </div>

      <div class="menu-label">模块导航</div>
      <el-menu :default-active="activeMenu" router class="menu" background-color="transparent" text-color="#93b1c2" active-text-color="#eaf7ff">
        <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div>
          <div class="crumbs">平台首页 / 四大模块 / 数据工坊 / {{ route.meta.title || '模块概览' }}</div>
          <div class="module-title">{{ route.meta.title || '数据工坊模块' }}</div>
        </div>
        <div class="header-right">
          <span class="module-badge">状态：运行中</span>
          <span class="module-badge">前端演示版</span>
          <el-avatar :size="34" :icon="UserFilled" />
        </div>
      </el-header>

      <el-main class="main">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { UserFilled } from '@element-plus/icons-vue'

const route = useRoute()

const menus = [
  { path: '/home', label: '工坊首页', icon: 'House' },
  { path: '/datasource/list', label: '数据源管理', icon: 'Collection' },
  { path: '/dataset/list', label: '数据集管理', icon: 'Document' },
  { path: '/preprocess/list', label: '数据预处理', icon: 'Tools' },
]

const activeMenu = computed(() => {
  if (route.path.startsWith('/datasource')) return '/datasource/list'
  if (route.path.startsWith('/dataset')) return '/dataset/list'
  if (route.path.startsWith('/preprocess')) return '/preprocess/list'
  return '/home'
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 22px 16px;
  background: linear-gradient(180deg, rgba(8, 19, 29, 0.9), rgba(5, 12, 18, 0.86));
  border-right: 1px solid rgba(86, 190, 255, 0.12);
  backdrop-filter: blur(16px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 8px 18px;
}

.brand-mark {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: #f3f8ff;
  background: linear-gradient(145deg, rgba(55, 240, 214, 0.3), rgba(61, 156, 255, 0.92));
  box-shadow: 0 0 0 1px rgba(140, 233, 255, 0.24), 0 0 26px rgba(61, 156, 255, 0.36);
}

.brand-name {
  font-size: 18px;
  font-weight: 760;
}

.brand-name b {
  color: var(--primary);
}

.brand-sub,
.menu-label,
.crumbs {
  color: var(--text-muted);
  font-size: 12px;
}

.brand-sub,
.menu-label {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.menu-label {
  padding: 8px 12px 14px;
}

:deep(.menu) {
  border-right: 0;
}

:deep(.menu .el-menu-item) {
  margin-bottom: 10px;
  border: 1px solid transparent;
  border-radius: 14px;
  transition: 0.22s ease;
}

:deep(.menu .el-menu-item:hover),
:deep(.menu .el-menu-item.is-active) {
  border-color: rgba(74, 222, 255, 0.16);
  background: linear-gradient(90deg, rgba(55, 240, 214, 0.12), rgba(61, 156, 255, 0.08));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 0 24px rgba(55, 240, 214, 0.08);
  transform: translateX(4px);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: var(--header-height);
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(5, 14, 21, 0.72);
  border-bottom: 1px solid rgba(86, 190, 255, 0.12);
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(18px);
}

.module-title {
  margin-top: 6px;
  color: var(--text-primary);
  font-size: 25px;
  font-weight: 760;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.module-badge {
  padding: 8px 12px;
  border-radius: 999px;
  color: #9ec2d3;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(74, 222, 255, 0.12);
}

.main {
  padding: 28px;
}

@media (max-width: 900px) {
  .layout {
    display: block;
  }

  .sidebar {
    position: static;
    width: 100% !important;
    height: auto;
  }

  .header {
    height: auto;
    padding: 18px;
    align-items: flex-start;
    flex-direction: column;
  }

  .main {
    padding: 18px;
  }
}
</style>
