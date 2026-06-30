<template>
  <el-container class="layout-container">
    <el-aside width="var(--sidebar-width)" class="sidebar">
      <div class="logo">
        <div class="brand-mark">
          <el-icon :size="22"><DataAnalysis /></el-icon>
        </div>
        <div class="brand-meta">
          <span class="logo-text">一体化 <b>AI</b> 平台</span>
          <span class="logo-sub">Data Workshop Module</span>
        </div>
      </div>
      <div class="sidebar-title">Module 1 / 4</div>
      <el-menu
        :default-active="activeMenu"
        router
        class="menu"
        background-color="transparent"
        text-color="#93b1c2"
        active-text-color="#eaf7ff"
      >
        <el-menu-item index="/home">
          <el-icon><House /></el-icon>
          <span>模块概览</span>
        </el-menu-item>
        <el-menu-item index="/datasource/list">
          <el-icon><Collection /></el-icon>
          <span>数据源管理</span>
        </el-menu-item>
        <el-menu-item index="/dataset/list">
          <el-icon><Document /></el-icon>
          <span>数据集管理</span>
        </el-menu-item>
        <el-menu-item index="/preprocess/list">
          <el-icon><Tools /></el-icon>
          <span>预处理任务</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div>
          <div class="crumbs">平台首页 / 四大模块 / 数据工坊 / {{ route.meta.title || '模块概览' }}</div>
          <div class="module-title">{{ route.meta.title || '数据工坊模块' }}</div>
        </div>
        <div class="user-info">
          <div class="module-badges">
            <span class="module-badge">所属：平台四大模块之一</span>
            <span class="module-badge">状态：运行中</span>
            <span class="module-badge">版本：v2.4</span>
          </div>
          <el-avatar :size="34" :icon="UserFilled" />
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
import { House, UserFilled } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
}

.sidebar {
  padding: 22px 16px;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(180deg, rgba(8, 19, 29, 0.88), rgba(5, 12, 18, 0.84));
  border-right: 1px solid rgba(86, 190, 255, 0.12);
  backdrop-filter: blur(16px);
}

.logo {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 8px 18px;
  color: #f3f8ff;
}

.brand-mark {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: #f3f8ff;
  background: linear-gradient(145deg, rgba(55, 240, 214, 0.3), rgba(61, 156, 255, 0.92));
  box-shadow: 0 0 0 1px rgba(140, 233, 255, 0.24), 0 0 26px rgba(61, 156, 255, 0.36);
}

.brand-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
}

.logo-text b {
  background: linear-gradient(90deg, var(--primary-color), #3d9cff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.logo-sub {
  color: #6d8a9b;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sidebar-title {
  padding: 8px 12px 14px;
  color: #5f8195;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

:deep(.menu) {
  border-right: none;
  flex: 1;
  --el-menu-bg-color: transparent;
  --el-menu-hover-bg-color: transparent;
}

:deep(.menu .el-menu-item) {
  margin-bottom: 10px;
  border: 1px solid transparent;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.01);
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
  backdrop-filter: blur(18px);
  background: rgba(5, 14, 21, 0.72);
  border-bottom: 1px solid rgba(86, 190, 255, 0.12);
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.22);
}

.crumbs {
  color: #6d8a9b;
  font-size: 13px;
}

.module-title {
  margin-top: 6px;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

.user-info,
.module-badges {
  display: flex;
  align-items: center;
  gap: 10px;
}

.module-badges {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.module-badge {
  padding: 8px 12px;
  border-radius: 999px;
  color: #9ec2d3;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(74, 222, 255, 0.12);
}

.main-content {
  padding: 28px;
  overflow-y: auto;
  background: transparent;
}

@media (max-width: 900px) {
  .layout-container {
    height: auto;
  }

  .sidebar {
    width: 100% !important;
    border-right: 0;
    border-bottom: 1px solid rgba(86, 190, 255, 0.12);
  }

  .header {
    height: auto;
    padding: 18px;
    align-items: flex-start;
    flex-direction: column;
  }

  .user-info {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .main-content {
    padding: 18px;
  }
}
</style>
