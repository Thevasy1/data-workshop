<template>
  <div class="page">
    <section class="hero">
      <div>
        <p class="eyebrow">Data Workshop</p>
        <h1>数据源接入、数据集构建与预处理的一体化控制台</h1>
        <p class="page-desc">围绕“数据源接入 -> 数据集构建 -> 数据预处理 -> 生成新版本数据集”的业务主线，展示当前模块运行状态和最近任务。</p>
      </div>
      <div class="radar">
        <span></span>
        <b>AI</b>
      </div>
    </section>

    <div class="grid-3">
      <div v-for="item in cards" :key="item.label" class="metric-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <em>{{ item.tip }}</em>
      </div>
    </div>

    <div class="quick-grid">
      <button v-for="item in quickEntries" :key="item.path" class="quick-card" @click="router.push(item.path)">
        <el-icon><component :is="item.icon" /></el-icon>
        <span>{{ item.title }}</span>
        <small>{{ item.desc }}</small>
      </button>
    </div>

    <div class="grid-2">
      <section class="panel chart-panel">
        <div class="panel-title">
          <h3>数据加工趋势</h3>
          <span class="muted">近 6 日新增与处理量</span>
        </div>
        <div ref="chartRef" class="chart"></div>
      </section>

      <section class="panel">
        <div class="panel-title">
          <h3>最近任务</h3>
          <span class="muted">实时队列</span>
        </div>
        <el-timeline>
          <el-timeline-item v-for="item in recentTasks" :key="item.id" :timestamp="item.createdAt">
            <div class="task-line">
              <span>{{ item.name }}</span>
              <StatusTag :status="item.status" />
            </div>
          </el-timeline-item>
        </el-timeline>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import StatusTag from '@/components/StatusTag.vue'
import { useWorkshopStore } from '@/stores/workshop'

const router = useRouter()
const store = useWorkshopStore()
const chartRef = ref<HTMLDivElement>()

const cards = computed(() => [
  { label: '数据源总数', value: store.dashboardStats.datasourceCount, tip: '覆盖 API、上传、数据库、Web 抓取' },
  { label: '数据集总数', value: store.dashboardStats.datasetCount, tip: '支持字段映射、采集调度、版本管理' },
  { label: '预处理任务', value: store.dashboardStats.preprocessCount, tip: '清洗、去重、标准化、格式转换' },
  { label: '采集成功率', value: `${store.dashboardStats.successRate}%`, tip: `${store.dashboardStats.failedTaskCount} 个任务需关注` },
])

const quickEntries = [
  { title: '新建数据源', desc: '配置 API、数据库或上传文件', path: '/datasource/create', icon: 'Plus' },
  { title: '创建数据集', desc: '选择数据源并设置采集规则', path: '/dataset/create', icon: 'DocumentAdd' },
  { title: '发起预处理', desc: '配置清洗、去重和标准化规则', path: '/preprocess/create', icon: 'Operation' },
  { title: '查看任务队列', desc: '跟踪数据加工执行状态', path: '/preprocess/list', icon: 'Monitor' },
]

const recentTasks = computed(() => store.preprocessTasks.slice(0, 4))

onMounted(async () => {
  await nextTick()
  if (!chartRef.value) return
  const chart = echarts.init(chartRef.value)
  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#85a8bc' }, right: 0 },
    grid: { left: 34, right: 16, top: 42, bottom: 28 },
    xAxis: {
      type: 'category',
      data: ['06-26', '06-27', '06-28', '06-29', '06-30', '07-01'],
      axisLine: { lineStyle: { color: 'rgba(86,190,255,.18)' } },
      axisLabel: { color: '#85a8bc' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(86,190,255,.1)' } },
      axisLabel: { color: '#85a8bc' },
    },
    series: [
      { name: '新增数据集', type: 'line', smooth: true, data: [1, 2, 3, 2, 4, 3], areaStyle: {}, color: '#37f0d6' },
      { name: '预处理量', type: 'bar', data: [28, 45, 38, 62, 78, 64], color: '#3d9cff' },
    ],
  })
})
</script>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 24px;
  min-height: 230px;
  padding: 26px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background:
    linear-gradient(115deg, rgba(55, 240, 214, 0.12), transparent 42%),
    linear-gradient(180deg, rgba(12, 31, 46, 0.9), rgba(7, 17, 26, 0.94));
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--primary);
  font-weight: 700;
}

h1 {
  max-width: 780px;
  margin: 0;
  font-size: 38px;
  line-height: 1.18;
  letter-spacing: 0;
}

.hero .page-desc {
  max-width: 760px;
  margin: 16px 0 0;
  line-height: 1.8;
}

.radar {
  position: relative;
  display: grid;
  place-items: center;
  align-self: center;
  width: 190px;
  aspect-ratio: 1;
  border: 1px solid rgba(74, 222, 255, 0.22);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(55, 240, 214, 0.2), transparent 58%);
}

.radar span {
  position: absolute;
  inset: 20px;
  border-radius: 50%;
  border: 1px dashed rgba(74, 222, 255, 0.28);
  animation: scan 8s linear infinite;
}

.radar b {
  color: var(--primary);
  font-size: 34px;
}

.metric-card em {
  display: block;
  margin-top: 12px;
  color: var(--text-muted);
  font-style: normal;
  font-size: 12px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.quick-card {
  min-height: 112px;
  padding: 16px;
  text-align: left;
  color: var(--text-primary);
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  cursor: pointer;
}

.quick-card:hover {
  border-color: var(--line-strong);
  box-shadow: var(--glow);
  transform: translateY(-2px);
}

.quick-card .el-icon {
  color: var(--primary);
  font-size: 22px;
}

.quick-card span,
.quick-card small {
  display: block;
}

.quick-card span {
  margin-top: 14px;
  font-weight: 700;
}

.quick-card small {
  margin-top: 6px;
  color: var(--text-secondary);
}

.chart {
  height: 320px;
}

.task-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

@keyframes scan {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 980px) {
  .hero,
  .quick-grid {
    grid-template-columns: 1fr;
  }

  .radar {
    display: none;
  }
}
</style>
