<template>
  <div class="page" v-if="detail">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ detail.name }}</h1>
        <p class="page-desc">展示任务进度、处理前后对比、执行日志和输出结果跳转。</p>
      </div>
      <div class="toolbar">
        <el-button @click="router.push('/preprocess/list')">返回列表</el-button>
        <el-button type="primary" @click="router.push(`/dataset/detail/${detail.outputDatasetId}`)">查看输出数据集</el-button>
      </div>
    </div>

    <div class="grid-3">
      <div class="metric-card"><span>任务进度</span><strong>{{ detail.progress }}%</strong></div>
      <div class="metric-card"><span>输入记录</span><strong>{{ detail.inputCount }}</strong></div>
      <div class="metric-card"><span>输出记录</span><strong>{{ detail.outputCount }}</strong></div>
    </div>

    <el-card>
      <template #header>任务详情</template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="源数据集">{{ detail.datasetName }}</el-descriptions-item>
        <el-descriptions-item label="执行状态"><StatusTag :status="detail.status" /></el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="输出数据集">{{ detail.outputDatasetId }}</el-descriptions-item>
      </el-descriptions>
      <el-progress :percentage="detail.progress" :stroke-width="14" style="margin-top: 18px" />
    </el-card>

    <el-card>
      <template #header>规则配置</template>
      <el-tag v-for="item in detail.rules" :key="item" effect="dark" style="margin: 0 8px 8px 0">{{ item }}</el-tag>
    </el-card>

    <div class="grid-2">
      <el-card>
        <template #header>处理前样本</template>
        <el-table :data="detail.beforeRows" stripe>
          <el-table-column v-for="key in beforeColumns" :key="key" :prop="key" :label="key" />
        </el-table>
      </el-card>
      <el-card>
        <template #header>处理后样本</template>
        <el-table :data="detail.afterRows" stripe>
          <el-table-column v-for="key in afterColumns" :key="key" :prop="key" :label="key" />
        </el-table>
      </el-card>
    </div>

    <el-card>
      <template #header>执行日志</template>
      <el-timeline>
        <el-timeline-item v-for="item in detail.logs" :key="`${item.time}-${item.message}`" :timestamp="item.time">
          [{{ item.level }}] {{ item.message }}
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
  <el-empty v-else description="未找到预处理任务" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StatusTag from '@/components/StatusTag.vue'
import { useWorkshopStore } from '@/stores/workshop'

const route = useRoute()
const router = useRouter()
const store = useWorkshopStore()
const detail = computed(() => store.findTask(String(route.params.id)))
const beforeColumns = computed(() => Object.keys(detail.value?.beforeRows[0] || {}))
const afterColumns = computed(() => Object.keys(detail.value?.afterRows[0] || detail.value?.beforeRows[0] || {}))
</script>
