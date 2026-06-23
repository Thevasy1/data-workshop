<template>
  <el-container class="layout-container">
    <el-aside width="var(--sidebar-width)" class="sidebar">
      <div class="logo">
        <div class="brand-mark"></div>
        <div class="brand-meta">
          <div class="brand-title">一体化 <b>AI</b> 平台</div>
          <div class="brand-sub">数据工坊</div>
        </div>
      </div>

      <div class="sidebar-section">Module 1 / 4</div>

      <el-menu
        :default-active="activeMenu"
        router
        class="menu"
      >
        <el-menu-item index="/datasource/list">
          <span class="menu-dot"></span>
          <span>数据源管理</span>
        </el-menu-item>
        <el-menu-item index="/dataset/list">
          <span class="menu-dot"></span>
          <span>数据集构建</span>
        </el-menu-item>
        <el-menu-item index="/preprocess/list">
          <span class="menu-dot"></span>
          <span>数据预处理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="topbar">
        <div class="breadcrumb">
          <el-breadcrumb>
            <el-breadcrumb-item>数据工坊</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="user-info">
          <el-avatar :size="32" class="user-avatar">管</el-avatar>
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

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
}

/* ===== 侧边栏 ===== */
.sidebar {
  background: linear-gradient(180deg, rgba(8, 19, 29, 0.88), rgba(5, 12, 18, 0.84));
  backdrop-filter: blur(16px);
  border-right: 1px solid rgba(86, 190, 255, 0.12);
  display: flex;
  flex-direction: column;
}

.logo {
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(86, 190, 255, 0.1);
}

.brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  position: relative;
  flex-shrink: 0;
  background: linear-gradient(145deg, rgba(55, 240, 214, 0.3), rgba(61, 156, 255, 0.92));
  box-shadow: 0 0 0 1px rgba(140, 233, 255, 0.24), 0 0 26px rgba(61, 156, 255, 0.36);
}

.brand-mark::before {
  content: '';
  position: absolute;
  inset: 7px;
  border: 2px solid rgba(232, 249, 255, 0.92);
  border-radius: 6px 6px 6px 2px;
}

.brand-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.brand-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.03em;
}

.brand-title b {
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.brand-sub {
  font-size: 11px;
  color: #6d8a9b;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sidebar-section {
  padding: 14px 16px 10px;
  color: #5f8195;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

/* ===== 菜单 ===== */
.menu {
  border-right: none;
  flex: 1;
  --el-menu-bg-color: transparent;
  --el-menu-text-color: #93b1c2;
  --el-menu-active-color: var(--text);
  --el-menu-hover-text-color: var(--text);
  --el-menu-hover-bg-color: transparent;
}

.menu .el-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px;
  margin: 0 10px 8px;
  border-radius: 16px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.01);
  transition: 0.22s ease;
  height: auto;
  line-height: normal;
}

.menu .el-menu-item:hover {
  border-color: rgba(74, 222, 255, 0.16);
  background: linear-gradient(90deg, rgba(55, 240, 214, 0.12), rgba(61, 156, 255, 0.08));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 0 24px rgba(55, 240, 214, 0.08);
}

.menu .el-menu-item.is-active {
  color: var(--text);
  border-color: rgba(74, 222, 255, 0.16);
  background: linear-gradient(90deg, rgba(55, 240, 214, 0.12), rgba(61, 156, 255, 0.08));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 0 24px rgba(55, 240, 214, 0.08);
}

.menu .el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, var(--primary), var(--secondary));
  box-shadow: 0 0 10px rgba(55, 240, 214, 0.5);
}

.menu-dot {
  width: 10px;
  height: 10px;
  border-radius: 4px;
  flex-shrink: 0;
  background: linear-gradient(145deg, var(--primary), var(--secondary));
  box-shadow: 0 0 0 3px rgba(55, 240, 214, 0.08), 0 0 14px rgba(55, 240, 214, 0.2);
}

/* ===== 顶栏 ===== */
.topbar {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(18px);
  background: rgba(5, 14, 21, 0.72);
  border-bottom: 1px solid rgba(86, 190, 255, 0.12);
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.22);
}

.breadcrumb {
  font-size: 14px;
}

.breadcrumb :deep(.el-breadcrumb__inner) {
  color: #6d8a9b !important;
  font-weight: 400;
}

.breadcrumb :deep(.el-breadcrumb__inner.is-link:hover) {
  color: var(--text) !important;
}

.breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--muted) !important;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  background: linear-gradient(145deg, rgba(55, 240, 214, 0.3), rgba(61, 156, 255, 0.6)) !important;
  border: 1px solid rgba(74, 222, 255, 0.2);
  color: var(--text) !important;
  font-weight: 600;
}

.username {
  font-size: 14px;
  color: var(--muted);
}

/* ===== 主内容 ===== */
.main-content {
  background: transparent;
  padding: 0;
  overflow-y: auto;
}
</style>
