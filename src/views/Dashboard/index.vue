<template>
  <div class="dashboard-page">
    <!-- ===== 网格底纹（纯装饰） ===== -->
    <div class="grid-bg"></div>

    <!-- ===== 模块信息栏 ===== -->
    <div class="module-bar">
      <div>
        <div class="module-title">数据工坊模块</div>
      </div>
      <div class="module-badges">
        <span class="module-badge">所属：数据标注平台</span>
        <span class="module-badge">模块状态：运行中</span>
        <span class="module-badge">当前版本：v2.4</span>
      </div>
    </div>

    <!-- ===== Hero 区域 ===== -->
    <div class="hero">
      <div class="hero-grid">
        <div class="hero-left">
          <div class="eyebrow">数据标注平台 · 核心模块</div>
          <h1>数据标注平台—— <span>数据工坊模块</span></h1>
          <p>
            数据工坊作为数据标注平台的核心模块之一，负责数据接入、数据集构建与预处理，
            为标注任务提供高质量、标准化的数据基础。 信息范围严格限定于工坊模块自身。
          </p>
          <div class="hero-actions">
            <el-button type="primary" size="large" class="btn-primary" @click="goToCreateDataset">
              新建数据集
            </el-button>
            <el-button size="large" class="btn-secondary" @click="goToPreprocessList">
              查看预处理任务
            </el-button>
          </div>
        </div>

        <!-- Hero 右侧装饰图形 -->
        <div class="scene">
          <div class="chip c1">数据接入</div>
          <div class="chip c2">预处理规则</div>
          <div class="chip-tag t1">样本构建</div>
          <div class="chip-tag t2">质量监测</div>
          <div class="beam b1"></div>
          <div class="beam b2"></div>
          <div class="node n1"></div>
          <div class="node n2"></div>
          <div class="node n3"></div>
          <div class="ring r1"></div>
          <div class="ring r2"></div>
          <div class="ring r3"></div>
        </div>
      </div>
    </div>

    <!-- ===== 统计卡片 ===== -->
    <div class="section">
      <div class="section-head">
        <h2>模块态势</h2>
        <span>展示数据工坊模块的关键运行指标</span>
      </div>
      <el-row :gutter="16" class="stat-row">
        <el-col :xs="12" :sm="6" v-for="stat in stats" :key="stat.label">
          <div class="stat-card">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-trend">{{ stat.trend }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- ===== 图表区域 ===== -->
    <div class="section">
      <div class="section-head">
        <h2>数据趋势</h2>
        <span>数据集创建与预处理完成趋势</span>
      </div>
      <el-row :gutter="16" class="chart-row">
        <el-col :xs="24" :lg="16">
          <div class="chart-box">
            <div ref="trendChartRef" class="chart-container"></div>
          </div>
        </el-col>
        <el-col :xs="24" :lg="8">
          <div class="chart-box">
            <div ref="distChartRef" class="chart-container"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- ===== 最近项目 ===== -->
    <div class="section">
      <div class="section-head">
        <h2>最近项目</h2>
        <span>服务于数据工坊模块的项目入口</span>
      </div>
      <el-row :gutter="16" class="card-row">
        <el-col :xs="24" :sm="8" v-for="(item, index) in projectCards" :key="index">
          <div class="task-card" @click="handleCardClick(item)">
            <div class="task-cover" :class="item.coverClass"></div>
            <div class="task-body">
              <div class="task-title">
                <span class="dot"></span>
                {{ item.title }}
              </div>
              <button class="ellipsis-btn" aria-label="更多操作">⋮</button>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- ===== 最近任务 ===== -->
    <div class="section">
      <div class="section-head">
        <h2>任务列表</h2>
        <span>聚焦模块内任务执行与处理状态</span>
      </div>
      <div class="table-wrap">
        <el-table :data="recentTasks" class="task-table" style="width: 100%">
          <el-table-column prop="name" label="任务名称" min-width="150" />
          <el-table-column prop="type" label="任务类型" width="120">
            <template #default="{ row }">
              <el-tag :type="row.type === 'dataset' ? 'primary' : 'warning'" size="small">
                {{ row.type === 'dataset' ? '数据采集' : '数据预处理' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="执行状态" width="140">
            <template #default="{ row }">
              <span class="status-badge" :class="row.status">
                <span class="status-dot"></span>
                {{ row.status === 'running' ? '运行中' : '已完成' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="owner" label="负责人" width="100">
            <template #default="{ row }">
              {{ row.owner || '成员1' }}
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="更新时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { getStats, getTrend, getDistribution, getRecentTasks } from '@/api/dashboard'
import { formatDate } from '@/utils/format'

const router = useRouter()

// ===== 统计数据 =====
const stats = ref([
  { label: '在线数据源', value: 0, trend: '' },
  { label: '活跃数据集', value: 0, trend: '' },
  { label: '运行任务', value: 0, trend: '' },
  { label: '质检通过率', value: '0%', trend: '' },
])

const recentTasks = ref<any[]>([])

// ===== 最近项目卡片（从最近任务派生） =====
const projectCards = computed(() => {
  const items = recentTasks.value.slice(0, 3)
  const coverClasses = ['radar', 'matrix', 'flow']
  return items.map((item, index) => ({
    title: item.name,
    coverClass: coverClasses[index % coverClasses.length],
    taskId: item.id,
    type: item.type,
  }))
})

// ===== ECharts 引用 =====
const trendChartRef = ref<HTMLElement | null>(null)
const distChartRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null
let distChart: echarts.ECharts | null = null

// ===== 路由跳转 =====
const goToCreateDataset = () => router.push('/dataset/create')
const goToPreprocessList = () => router.push('/preprocess/list')

const handleCardClick = (item: any) => {
  if (item.type === 'dataset') {
    router.push('/dataset/list')
  } else {
    router.push('/preprocess/list')
  }
}

// ===== 数据获取 =====
const fetchData = async () => {
  try {
    const statsRes = await getStats()
    // statsRes 已经是 StatsData 类型，不再是 AxiosResponse
    stats.value = [
      { label: '在线数据源', value: statsRes.datasourceCount ?? 0, trend: '稳定连接率 99.2%' },
      { label: '活跃数据集', value: statsRes.datasetCount ?? 0, trend: '智能治理中' },
      {
        label: '运行任务',
        value: statsRes.preprocessCount ?? 0,
        trend: `今日 ${statsRes.todayTaskCount ?? 0} 个`,
      },
      { label: '质检通过率', value: (statsRes.successRate ?? 0) + '%', trend: '连续 7 日提升' },
    ]

    const trendRes = await getTrend()
    if (trendRes) {
      updateTrendChart(trendRes)
    }

    const distRes = await getDistribution()
    if (distRes) {
      updateDistChart(distRes)
    }

    const tasksRes = await getRecentTasks()
    recentTasks.value = (tasksRes || []).map((t: any) => ({
      ...t,
      owner: t.owner || (t.type === 'dataset' ? '成员4' : '成员6'),
    }))
  } catch (error) {
    console.error('获取首页数据失败:', error)
  }
}

// ===== ECharts 图表 =====
const updateTrendChart = (data: any) => {
  if (!trendChart) return
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      data: ['数据集创建', '预处理完成'],
      textStyle: { color: '#a8c8d8' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.dates,
      axisLabel: { color: '#8ab0c0' },
      axisLine: { lineStyle: { color: 'rgba(74,222,255,0.2)' } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(74,222,255,0.1)' } },
      axisLabel: { color: '#8ab0c0' },
    },
    series: [
      {
        name: '数据集创建',
        type: 'line',
        smooth: true,
        data: data.datasetCreated,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#37f0d6' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(55,240,214,0.3)' },
            { offset: 1, color: 'rgba(55,240,214,0)' },
          ]),
        },
      },
      {
        name: '预处理完成',
        type: 'line',
        smooth: true,
        data: data.preprocessCompleted,
        symbol: 'diamond',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#3d9cff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(61,156,255,0.3)' },
            { offset: 1, color: 'rgba(61,156,255,0)' },
          ]),
        },
      },
    ],
  }
  trendChart.setOption(option)
}

const updateDistChart = (data: any) => {
  if (!distChart || !data) return
  const pieData = (data.datasourceTypeStats || []).map((item: any) => ({
    name:
      item.type === 'api'
        ? 'API'
        : item.type === 'upload'
          ? '本地上传'
          : item.type === 'database'
            ? '数据库'
            : 'Web抓取',
    value: item.count ?? 0,
  }))

  if (pieData.length === 0) return

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>数量：{c}<br/>占比：{d}%',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      itemGap: 12,
      width: 100,
      itemWidth: 14,
      itemHeight: 14,
      textStyle: { color: '#a8c8d8', fontSize: 13 },
    },
    series: [
      {
        name: '数据源分布',
        type: 'pie',
        radius: ['40%', '58%'],
        center: ['58%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: 'rgba(0,0,0,0.2)',
          borderWidth: 2,
        },
        label: {
          color: '#a8c8d8',
          formatter: '{b}\n{d}%',
          fontSize: 12,
        },
        emphasis: {
          scale: true, // 启用放大效果
          scaleSize: 10, // 放大偏移量（像素）
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#eaf7ff',
            formatter: '{b}\n{c} 条\n{d}%',
          },
        },
        data: pieData,
      },
    ],
  }
  distChart.setOption(option)
}

// ===== 图表初始化 =====
const initCharts = () => {
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value, 'dark')
  }
  if (distChartRef.value) {
    distChart = echarts.init(distChartRef.value, 'dark')
  }
  const handleResize = () => {
    trendChart?.resize()
    distChart?.resize()
  }
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}

// ===== 生命周期 =====
onMounted(async () => {
  await nextTick()
  const cleanup = initCharts()
  await fetchData()
  onBeforeUnmount(() => {
    cleanup?.()
    trendChart?.dispose()
    distChart?.dispose()
  })
})
</script>

<style scoped>
/* ============================================================
   1. 页面容器 + 网格底纹
   ============================================================ */
.dashboard-page {
  position: relative;
  padding: 20px;
  min-height: 100vh;
  color: #eaf7ff;
  background:
    radial-gradient(circle at 18% 12%, rgba(55, 240, 214, 0.12), transparent 22%),
    radial-gradient(circle at 82% 18%, rgba(61, 156, 255, 0.16), transparent 20%),
    radial-gradient(circle at 52% 100%, rgba(109, 125, 255, 0.12), transparent 30%),
    linear-gradient(180deg, #040b12 0%, #061018 38%, #081520 100%);
  overflow: hidden;
}

.grid-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(rgba(73, 174, 218, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(73, 174, 218, 0.05) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.18));
  -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.18));
}

.dashboard-page > * {
  position: relative;
  z-index: 1;
}

/* ============================================================
   2. 模块信息栏
   ============================================================ */
.module-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(10, 23, 34, 0.88), rgba(8, 18, 27, 0.92));
  border: 1px solid rgba(74, 222, 255, 0.12);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.38);
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
}

.module-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.module-badge {
  padding: 8px 12px;
  border-radius: 999px;
  color: #9ec2d3;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(74, 222, 255, 0.12);
}

/* ============================================================
   3. Hero 区域
   ============================================================ */
.hero {
  position: relative;
  overflow: hidden;
  min-height: 260px;
  padding: 28px 30px;
  margin-bottom: 28px;
  border-radius: 30px;
  background:
    linear-gradient(
      135deg,
      rgba(8, 22, 32, 0.96),
      rgba(10, 31, 45, 0.96) 44%,
      rgba(13, 40, 58, 0.96)
    ),
    rgba(9, 20, 30, 0.94);
  border: 1px solid rgba(74, 222, 255, 0.16);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.38);
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(rgba(72, 198, 232, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(72, 198, 232, 0.08) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: radial-gradient(circle at 50% 45%, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.18));
  -webkit-mask-image: radial-gradient(circle at 50% 45%, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.18));
  pointer-events: none;
}

.hero::after {
  content: '';
  position: absolute;
  width: 420px;
  height: 420px;
  right: -110px;
  top: -90px;
  background: radial-gradient(
    circle,
    rgba(55, 240, 214, 0.18),
    rgba(61, 156, 255, 0.04) 52%,
    transparent 70%
  );
  filter: blur(10px);
  animation: hero-glow 8s ease-in-out infinite;
  pointer-events: none;
}

.hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.18fr 0.82fr;
  gap: 24px;
  align-items: center;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border-radius: 999px;
  color: #9ceee5;
  background: rgba(55, 240, 214, 0.08);
  border: 1px solid rgba(55, 240, 214, 0.18);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.02),
    0 0 28px rgba(55, 240, 214, 0.24);
  font-size: 13px;
  animation: eyebrow-breathe 3.2s ease-in-out infinite;
}

.eyebrow::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #37f0d6;
  box-shadow: 0 0 14px rgba(55, 240, 214, 0.92);
}

.hero h1 {
  margin: 18px 0 16px;
  font-size: 42px;
  line-height: 1.08;
  letter-spacing: -0.05em;
}

.hero h1 span {
  background: linear-gradient(90deg, #37f0d6, #3d9cff, #8bc8ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero p {
  max-width: 700px;
  margin: 0 0 28px;
  color: #85a8bc;
  font-size: 16px;
  line-height: 1.85;
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.hero-actions .btn-primary,
.hero-actions .btn-secondary {
  height: 50px;
  padding: 0 22px;
  border-radius: 14px;
  font-size: 15px;
  border: 1px solid transparent;
  transition: 0.22s ease;
}

.hero-actions .btn-primary {
  color: #031116;
  font-weight: 700;
  background: linear-gradient(90deg, #37f0d6, #8cffef);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 0 26px rgba(55, 240, 214, 0.22);
  position: relative;
  overflow: hidden;
}
.hero-actions .btn-primary:hover {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 0 34px rgba(55, 240, 214, 0.34);
  transform: translateY(-2px);
}
.hero-actions .btn-primary::after {
  content: '';
  position: absolute;
  top: -20%;
  left: -30%;
  width: 32%;
  height: 140%;
  transform: rotate(20deg);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.52), transparent);
  animation: button-sweep 4.8s ease-in-out infinite;
}

.hero-actions .btn-secondary {
  color: #eaf7ff;
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(74, 222, 255, 0.14);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}
.hero-actions .btn-secondary:hover {
  transform: translateY(-2px);
  border-color: rgba(74, 222, 255, 0.24);
  background: rgba(61, 156, 255, 0.08);
}

/* ---- Hero 右侧装饰图形 ---- */
.scene {
  position: relative;
  height: 220px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0)),
    rgba(4, 13, 21, 0.56);
  border: 1px solid rgba(74, 222, 255, 0.12);
  overflow: hidden;
}
.scene::before {
  content: '';
  position: absolute;
  inset: 24px;
  border-radius: 20px;
  border: 1px solid rgba(74, 222, 255, 0.08);
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(55, 240, 214, 0.18);
  box-shadow:
    inset 0 0 24px rgba(55, 240, 214, 0.04),
    0 0 22px rgba(61, 156, 255, 0.08);
}
.ring.r1 {
  width: 148px;
  height: 148px;
  right: 58px;
  top: 34px;
  animation: ring-rotate 18s linear infinite;
}
.ring.r2 {
  width: 94px;
  height: 94px;
  right: 85px;
  top: 61px;
  border-color: rgba(61, 156, 255, 0.26);
  animation: ring-rotate-reverse 12s linear infinite;
}
.ring.r3 {
  width: 50px;
  height: 50px;
  right: 107px;
  top: 83px;
  background: radial-gradient(
    circle,
    rgba(140, 255, 239, 0.92),
    rgba(55, 240, 214, 0.46) 58%,
    transparent 72%
  );
  border: 0;
  box-shadow: 0 0 30px rgba(55, 240, 214, 0.34);
  animation: core-pulse 2.8s ease-in-out infinite;
}

.beam {
  position: absolute;
  height: 2px;
  background: linear-gradient(
    90deg,
    rgba(55, 240, 214, 0),
    rgba(55, 240, 214, 0.82),
    rgba(61, 156, 255, 0)
  );
  box-shadow: 0 0 16px rgba(55, 240, 214, 0.34);
  overflow: hidden;
}
.beam::after {
  content: '';
  position: absolute;
  top: -3px;
  left: -22px;
  width: 26px;
  height: 8px;
  border-radius: 999px;
  background: rgba(220, 251, 255, 0.96);
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.78);
  animation: beam-flow 3s linear infinite;
}
.beam.b1 {
  left: 42px;
  top: 130px;
  width: 152px;
  transform: rotate(-12deg);
}
.beam.b2 {
  left: 96px;
  top: 76px;
  width: 110px;
  transform: rotate(28deg);
}

.node {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(145deg, #37f0d6, #3d9cff);
  box-shadow: 0 0 20px rgba(55, 240, 214, 0.62);
  animation: node-pulse 2.6s ease-in-out infinite;
}
.node.n1 {
  left: 52px;
  top: 126px;
}
.node.n2 {
  left: 138px;
  top: 98px;
  animation-delay: 0.6s;
}
.node.n3 {
  left: 198px;
  top: 139px;
  animation-delay: 1.2s;
}

.chip {
  position: absolute;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(74, 222, 255, 0.14);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
  color: #b9d9e8;
  font-size: 13px;
  min-width: 104px;
  animation: chip-float 6s ease-in-out infinite;
}
.chip::before {
  content: '';
  display: block;
  width: 34px;
  height: 4px;
  margin-bottom: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, #37f0d6, #3d9cff);
  box-shadow: 0 0 18px rgba(61, 156, 255, 0.18);
}
.chip.c1 {
  left: 22px;
  top: 20px;
}
.chip.c2 {
  left: 26px;
  bottom: 20px;
  animation-delay: 0.8s;
}

.chip-tag {
  position: absolute;
  padding: 8px 12px;
  border-radius: 999px;
  color: #dff7ff;
  font-size: 12px;
  background: rgba(7, 17, 25, 0.88);
  border: 1px solid rgba(74, 222, 255, 0.14);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.24);
  animation: tag-float 5s ease-in-out infinite;
}
.chip-tag.t1 {
  right: 24px;
  top: 18px;
}
.chip-tag.t2 {
  right: 46px;
  bottom: 18px;
  animation-delay: 0.9s;
}

/* ============================================================
   4. 通用区块
   ============================================================ */
.section {
  margin-top: 28px;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-head h2 {
  margin: 0;
  font-size: 28px;
  letter-spacing: -0.04em;
}
.section-head span {
  color: #6f93a8;
  font-size: 14px;
}

/* ============================================================
   5. 统计卡片
   ============================================================ */
.stat-row {
  margin-bottom: 0;
}
.stat-card {
  padding: 22px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(10, 23, 34, 0.9), rgba(8, 18, 27, 0.94));
  border: 1px solid rgba(74, 222, 255, 0.12);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(18px);
  transition: 0.22s ease;
  position: relative;
  overflow: hidden;
}
.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(74, 222, 255, 0.22);
  box-shadow:
    0 26px 62px rgba(0, 0, 0, 0.42),
    0 0 26px rgba(61, 156, 255, 0.08);
}
.stat-card::after {
  content: '';
  position: absolute;
  right: -10px;
  top: -10px;
  width: 104px;
  height: 104px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(55, 240, 214, 0.18), transparent 68%);
  filter: blur(2px);
  animation: stat-glow 4.5s ease-in-out infinite;
}
.stat-label {
  color: #7fa0b4;
  font-size: 14px;
  margin-bottom: 10px;
}
.stat-value {
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.04em;
}
.stat-trend {
  margin-top: 10px;
  color: #80f2e0;
  font-size: 13px;
}

/* ============================================================
   6. 图表
   ============================================================ */
.chart-row {
  margin-top: 0;
}
.chart-box {
  background: linear-gradient(180deg, rgba(10, 23, 34, 0.9), rgba(8, 18, 27, 0.94));
  border: 1px solid rgba(74, 222, 255, 0.12);
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.38);
}
.chart-container {
  width: 100%;
  height: 300px;
}

/* ============================================================
   7. 最近项目卡片
   ============================================================ */
.card-row {
  margin-top: 0;
}
.task-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(10, 23, 34, 0.9), rgba(8, 18, 27, 0.94));
  border: 1px solid rgba(74, 222, 255, 0.12);
  border-radius: 20px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(18px);
  transition: 0.22s ease;
  cursor: pointer;
}
.task-card:hover {
  transform: translateY(-4px);
  border-color: rgba(74, 222, 255, 0.22);
  box-shadow:
    0 26px 62px rgba(0, 0, 0, 0.42),
    0 0 26px rgba(61, 156, 255, 0.08);
}
.task-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(55, 240, 214, 0.08),
    transparent 36%,
    rgba(61, 156, 255, 0.08) 78%,
    transparent
  );
  pointer-events: none;
}

.task-cover {
  height: 176px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #081720, #0d2c3c 58%, #0f2437);
}
.task-cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      120deg,
      transparent 0 26%,
      rgba(55, 240, 214, 0.08) 42%,
      rgba(61, 156, 255, 0.22) 58%,
      transparent 78%
    ),
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size:
    auto,
    28px 28px,
    28px 28px;
}

.task-cover.radar::after {
  content: '';
  position: absolute;
  width: 152px;
  height: 152px;
  right: 54px;
  top: 16px;
  border-radius: 50%;
  background:
    radial-gradient(
      circle,
      rgba(169, 255, 241, 0.95) 0 12%,
      rgba(169, 255, 241, 0.18) 12% 31%,
      transparent 31%
    ),
    conic-gradient(
      from 290deg,
      rgba(55, 240, 214, 0) 0%,
      rgba(55, 240, 214, 0.82) 22%,
      rgba(61, 156, 255, 0.16) 36%,
      transparent 50%
    );
  box-shadow: 0 0 42px rgba(55, 240, 214, 0.14);
  animation: radar-spin 8s linear infinite;
}
.task-cover.matrix::after {
  content: '';
  position: absolute;
  width: 152px;
  height: 104px;
  left: 32px;
  top: 30px;
  border-radius: 24px;
  transform: rotate(22deg);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01)),
    repeating-linear-gradient(90deg, rgba(55, 240, 214, 0.2) 0 2px, transparent 2px 36px),
    repeating-linear-gradient(rgba(145, 198, 255, 0.14) 0 2px, transparent 2px 28px);
  border: 1px solid rgba(74, 222, 255, 0.12);
  box-shadow: 0 0 32px rgba(61, 156, 255, 0.08);
}
.task-cover.flow::after {
  content: '';
  position: absolute;
  left: 22px;
  right: 22px;
  top: 28px;
  bottom: 24px;
  background:
    radial-gradient(circle at 16% 56%, rgba(55, 240, 214, 0.92) 0 8px, transparent 9px),
    radial-gradient(circle at 40% 34%, rgba(61, 156, 255, 0.92) 0 8px, transparent 9px),
    radial-gradient(circle at 66% 62%, rgba(55, 240, 214, 0.92) 0 8px, transparent 9px),
    radial-gradient(circle at 84% 28%, rgba(61, 156, 255, 0.92) 0 8px, transparent 9px),
    linear-gradient(
      120deg,
      transparent 0 16%,
      rgba(55, 240, 214, 0.3) 16% 17%,
      transparent 17% 38%,
      rgba(61, 156, 255, 0.3) 38% 39%,
      transparent 39% 58%,
      rgba(55, 240, 214, 0.26) 58% 59%,
      transparent 59% 100%
    );
  filter: drop-shadow(0 0 12px rgba(55, 240, 214, 0.2));
}

.task-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px;
  border-top: 1px solid rgba(74, 222, 255, 0.08);
}
.task-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
}
.dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: linear-gradient(145deg, #37f0d6, #3d9cff);
  box-shadow: 0 0 18px rgba(55, 240, 214, 0.5);
}
.ellipsis-btn {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(74, 222, 255, 0.12);
  border-radius: 10px;
  color: #89aabd;
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  font-size: 20px;
  transition: 0.22s ease;
}
.ellipsis-btn:hover {
  color: #eaf7ff;
  border-color: rgba(74, 222, 255, 0.26);
  background: linear-gradient(90deg, rgba(55, 240, 214, 0.1), rgba(61, 156, 255, 0.1));
  box-shadow: 0 0 22px rgba(61, 156, 255, 0.12);
  transform: scale(1.05);
}

/* ============================================================
   8. 最近任务表格（深色主题，与示例风格一致）
   ============================================================ */
.table-wrap {
  background: linear-gradient(180deg, rgba(10, 23, 34, 0.9), rgba(8, 18, 27, 0.94));
  border: 1px solid rgba(74, 222, 255, 0.12);
  border-radius: 20px;
  padding: 18px 18px 8px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.38);
  transition: 0.22s ease;
}

.table-wrap:hover {
  border-color: rgba(74, 222, 255, 0.22);
  box-shadow:
    0 26px 62px rgba(0, 0, 0, 0.42),
    0 0 26px rgba(61, 156, 255, 0.08);
}

/* 完全移除 el-table 的默认边框和背景，模拟原生 table */
.task-table {
  background: transparent !important;
  font-size: 14px;
  color: #d6edf8;
}

/* 表头样式 — 与示例 th 一致 */
.task-table :deep(.el-table__header-wrapper) {
  background: transparent !important;
}

.task-table :deep(.el-table__header th) {
  color: #7c9caf !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  padding: 16px 12px !important;
  border-bottom: 1px solid rgba(86, 190, 255, 0.1) !important;
  background: transparent !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
}

/* 表格行样式 — 与示例 td 一致 */
.task-table :deep(.el-table__body td) {
  color: #d6edf8 !important;
  font-size: 14px !important;
  padding: 16px 12px !important;
  border-bottom: 1px solid rgba(86, 190, 255, 0.1) !important;
  background: transparent !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
}

/* 表格行 hover — 轻微发光效果，不改变背景色 */
.task-table :deep(.el-table__body tr:hover > td) {
  background: rgba(55, 240, 214, 0.04) !important;
  box-shadow: inset 0 0 20px rgba(55, 240, 214, 0.03);
}

/* 空状态文字 */
.task-table :deep(.el-table__empty-text) {
  color: #6d8a9b !important;
  font-size: 14px !important;
}

/* 去除 el-table 默认的额外边框 */
.task-table :deep(.el-table__inner-wrapper),
.task-table :deep(.el-table__header),
.task-table :deep(.el-table__body),
.task-table :deep(.el-table__row) {
  background: transparent !important;
  border: none !important;
}

/* 状态标签 — 与示例 .status 完全一致 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  color: #b0fff0;
  background: rgba(55, 240, 214, 0.08);
  border: 1px solid rgba(55, 240, 214, 0.14);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.status-badge .status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #37f0d6;
  box-shadow: 0 0 12px rgba(55, 240, 214, 0.88);
  animation: status-pulse 2.2s ease-in-out infinite;
  flex-shrink: 0;
}

/* 运行中状态 — 橙色系 */
.status-badge.running {
  color: #f0c78a;
  background: rgba(230, 162, 60, 0.12);
  border-color: rgba(230, 162, 60, 0.25);
}

.status-badge.running .status-dot {
  background: #e6a23c;
  box-shadow: 0 0 12px rgba(230, 162, 60, 0.88);
}

/* 已完成状态 — 绿色系（与示例一致） */
.status-badge.success .status-dot {
  background: #67c23a;
  box-shadow: 0 0 12px rgba(103, 194, 58, 0.88);
}

/* ============================================================
   9. 动画 Keyframes
   ============================================================ */
@keyframes hero-glow {
  0%,
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
  50% {
    transform: scale(1.06) translateY(8px);
    opacity: 0.82;
  }
}
@keyframes eyebrow-breathe {
  0%,
  100% {
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.02),
      0 0 18px rgba(55, 240, 214, 0.12);
  }
  50% {
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.02),
      0 0 28px rgba(55, 240, 214, 0.24);
  }
}
@keyframes button-sweep {
  0%,
  100% {
    left: -34%;
    opacity: 0;
  }
  18% {
    opacity: 0.9;
  }
  38% {
    left: 116%;
    opacity: 0.2;
  }
}
@keyframes ring-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes ring-rotate-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}
@keyframes core-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 24px rgba(55, 240, 214, 0.26);
  }
  50% {
    transform: scale(1.08);
    box-shadow: 0 0 36px rgba(55, 240, 214, 0.42);
  }
}
@keyframes beam-flow {
  from {
    left: -24px;
    opacity: 0.2;
  }
  25% {
    opacity: 1;
  }
  to {
    left: calc(100% - 2px);
    opacity: 0.2;
  }
}
@keyframes node-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 14px rgba(55, 240, 214, 0.46);
  }
  50% {
    transform: scale(1.22);
    box-shadow: 0 0 24px rgba(55, 240, 214, 0.76);
  }
}
@keyframes chip-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
@keyframes tag-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
@keyframes stat-glow {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}
@keyframes radar-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes status-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(55, 240, 214, 0.72);
  }
  50% {
    transform: scale(1.24);
    box-shadow: 0 0 16px rgba(55, 240, 214, 1);
  }
}

/* ============================================================
   10. 响应式
   ============================================================ */
@media (max-width: 1200px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .module-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  .hero {
    padding: 24px 20px;
  }
  .hero h1 {
    font-size: 34px;
  }
  .scene {
    height: 180px;
  }
  .section-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>