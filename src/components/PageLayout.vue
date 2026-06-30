<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-mark"></div>
        <div>
          <div class="logo-text">数据<b>工坊</b></div>
          <div class="logo-sub">Data Workshop</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/datasource/list" class="nav-item" active-class="active">
          <span class="nav-dot"></span>
          <span>数据源管理</span>
        </router-link>
        <router-link to="/dataset/list" class="nav-item" active-class="active">
          <span class="nav-dot"></span>
          <span>数据集构建</span>
        </router-link>
        <router-link to="/preprocess/list" class="nav-item" active-class="active">
          <span class="nav-dot"></span>
          <span>数据预处理</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="footer-dot"></div>
        <span>模块运行中 · v2.4</span>
      </div>
    </el-aside>

    <!-- 主区域 -->
    <el-container class="main-area">
      <!-- 顶栏 -->
      <el-header class="topbar">
        <div class="topbar-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="topbar-right">
          <div class="user-avatar"></div>
          <span class="user-name">管理员</span>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main-content">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
}

/* ===== 侧边栏 ===== */
.sidebar {
  background: linear-gradient(180deg, rgba(8, 19, 29, 0.94), rgba(5, 12, 18, 0.92));
  border-right: 1px solid rgba(86, 190, 255, 0.1);
  backdrop-filter: blur(16px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 18px 18px;
  border-bottom: 1px solid rgba(86, 190, 255, 0.08);
}

.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(145deg, rgba(55, 240, 214, 0.35), rgba(61, 156, 255, 0.88));
  box-shadow: 0 0 0 1px rgba(140, 233, 255, 0.2), 0 0 20px rgba(61, 156, 255, 0.3);
  position: relative;
}

.logo-mark::before {
  content: '';
  position: absolute;
  inset: 7px;
  border: 2px solid rgba(232, 249, 255, 0.85);
  border-radius: 6px 6px 6px 2px;
}

.logo-text {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.03em;
}

.logo-text b {
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.logo-sub {
  font-size: 10px;
  color: #6d8a9b;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-top: 2px;
}

/* ===== 导航 ===== */
.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  color: #93b1c2;
  text-decoration: none;
  border-radius: 14px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.01);
  transition: all 0.22s ease;
  font-size: 14px;
}

.nav-item:hover,
.nav-item.active {
  color: var(--text);
  border-color: rgba(74, 222, 255, 0.16);
  background: linear-gradient(90deg, rgba(55, 240, 214, 0.12), rgba(61, 156, 255, 0.08));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 0 22px rgba(55, 240, 214, 0.06);
  transform: translateX(3px);
}

.nav-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: linear-gradient(145deg, var(--primary), var(--secondary));
  box-shadow: 0 0 0 3px rgba(55, 240, 214, 0.08), 0 0 14px rgba(55, 240, 214, 0.22);
  flex-shrink: 0;
}

/* ===== 侧边栏脚 ===== */
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  border-top: 1px solid rgba(86, 190, 255, 0.08);
  color: #5f8195;
  font-size: 11px;
}

.footer-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 0 10px rgba(55, 240, 214, 0.6);
  animation: dot-pulse 2.5s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* ===== 主区域 ===== */
.main-area {
  flex-direction: column;
}

/* ===== 顶栏 ===== */
.topbar {
  height: var(--header-height) !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(18px);
  background: rgba(5, 14, 21, 0.78) !important;
  border-bottom: 1px solid rgba(86, 190, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.topbar-left {
  display: flex;
  align-items: center;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  box-shadow: 0 0 12px rgba(61, 156, 255, 0.25);
  position: relative;
}

.user-avatar::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  border-radius: 5px;
}

.user-name {
  font-size: 13px;
  color: var(--text-muted);
}

/* ===== 内容区 ===== */
.main-content {
  padding: 20px;
  overflow-y: auto;
}
</style>
