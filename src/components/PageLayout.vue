<template>
  <el-container class="layout-container">
    <el-aside width="var(--sidebar-width)" class="sidebar">
      <div class="logo">
        <el-icon :size="28"><DataAnalysis /></el-icon>
        <span class="logo-text">数据工坊</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/datasource/list">
          <el-icon><Collection /></el-icon>
          <span>数据源管理</span>
        </el-menu-item>
        <el-menu-item index="/dataset/list">
          <el-icon><Document /></el-icon>
          <span>数据集构建</span>
        </el-menu-item>
        <el-menu-item index="/preprocess/list">
          <el-icon><Tools /></el-icon>
          <span>数据预处理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="breadcrumb">
          <el-breadcrumb>
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="user-info">
          <el-avatar :size="32" :icon="UserFilled" />
          <span class="username">管理员</span>
        </div>
      </el-header>

      <el-main class="main-content">
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
const activeMenu = computed(() => {
  if (route.path.startsWith('/datasource')) return '/datasource/list'
  if (route.path.startsWith('/dataset')) return '/dataset/list'
  if (route.path.startsWith('/preprocess')) return '/preprocess/list'
  return route.path
})
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
}

.sidebar {
  background-color: #304156;
  display: flex;
  flex-direction: column;
  box-shadow: 6px 0 20px rgba(31, 45, 61, 0.08);
}

.logo {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  border-bottom: 1px solid #1f2d3d;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
}

.menu {
  border-right: none;
  flex: 1;
}

.menu :deep(.el-menu-item) {
  height: 52px;
  margin: 6px 10px;
  border-radius: 6px;
}

.menu :deep(.el-menu-item.is-active) {
  background-color: rgba(64, 158, 255, 0.14);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid var(--border-light);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.04);
  z-index: 1;
}

.breadcrumb {
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-regular);
}

.main-content {
  background:
    linear-gradient(180deg, rgba(64, 158, 255, 0.06), rgba(64, 158, 255, 0) 180px),
    var(--bg-color);
  padding: 20px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    width: 64px !important;
  }

  .logo {
    gap: 0;
  }

  .logo-text,
  .menu :deep(.el-menu-item span) {
    display: none;
  }

  .header {
    padding: 0 12px;
  }

  .username {
    display: none;
  }

  .main-content {
    padding: 12px;
  }
}
</style>
