<template>
  <div class="workshop-shell">
    <aside class="workshop-sidebar">
      <div class="brand">
        <div class="brand-mark">DW</div>
        <div>
          <div class="brand-title">数据工坊</div>
          <div class="brand-subtitle">AI Data Workshop</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <RouterLink class="nav-item" :class="{ active: isActive('/') }" to="/">
          <span>模块首页</span>
        </RouterLink>
        <RouterLink class="nav-item" :class="{ active: isActive('/dataset/list') }" to="/dataset/list">
          <span>数据集列表</span>
        </RouterLink>
        <RouterLink class="nav-item" :class="{ active: isActive('/dataset/create') }" to="/dataset/create">
          <span>新建数据集</span>
        </RouterLink>
      </nav>
    </aside>

    <main class="workshop-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.workshop-shell {
  min-height: 100vh;
  display: flex;
  color: #edf8ff;
  background:
    linear-gradient(rgba(38, 101, 129, 0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(38, 101, 129, 0.16) 1px, transparent 1px),
    radial-gradient(circle at 13% 8%, rgba(33, 217, 255, 0.14), transparent 28%),
    radial-gradient(circle at 86% 10%, rgba(53, 242, 161, 0.1), transparent 30%),
    linear-gradient(135deg, #081322 0%, #0a2032 48%, #07111f 100%);
  background-size: 96px 96px, 96px 96px, auto, auto, auto;
}

.workshop-sidebar {
  position: sticky;
  top: 0;
  width: 240px;
  height: 100vh;
  flex: 0 0 240px;
  padding: 24px 16px;
  border-right: 1px solid rgba(118, 218, 255, 0.24);
  background: rgba(4, 15, 28, 0.86);
  backdrop-filter: blur(16px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 36px;
}

.brand-mark {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(77, 220, 255, 0.62);
  border-radius: 8px;
  color: #8ff0ff;
  background: rgba(33, 217, 255, 0.1);
  font-weight: 800;
  letter-spacing: 0;
}

.brand-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.brand-subtitle {
  margin-top: 4px;
  color: #9db5c7;
  font-size: 13px;
}

.sidebar-nav {
  display: grid;
  gap: 14px;
}

.nav-item {
  display: flex;
  align-items: center;
  height: 47px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 7px;
  color: #d3e3f0;
  text-decoration: none;
  transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
}

.nav-item:hover,
.nav-item.active {
  border-color: rgba(83, 213, 245, 0.7);
  color: #ffffff;
  background: linear-gradient(90deg, rgba(33, 217, 255, 0.18), rgba(53, 242, 161, 0.08));
}

.workshop-main {
  min-width: 0;
  flex: 1;
  height: 100vh;
  overflow: auto;
}

.workshop-main::-webkit-scrollbar {
  width: 10px;
}

.workshop-main::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(218, 231, 240, 0.48);
}

@media (max-width: 900px) {
  .workshop-shell {
    display: block;
  }

  .workshop-sidebar {
    position: static;
    width: 100%;
    height: auto;
    flex: none;
  }

  .sidebar-nav {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .workshop-main {
    height: auto;
    min-height: calc(100vh - 166px);
  }
}
</style>
