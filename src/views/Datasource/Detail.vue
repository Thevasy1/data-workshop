<template>
  <div class="page" v-if="detail">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ detail.name }}</h1>
        <p class="page-desc">{{ detail.description }}</p>
      </div>
      <div class="toolbar">
        <el-button @click="router.push('/datasource/list')">返回列表</el-button>
        <el-button @click="testCurrent">测试连接</el-button>
        <el-button type="primary" @click="router.push(`/datasource/edit/${detail.id}`)">编辑</el-button>
        <el-button type="danger" @click="removeCurrent">删除</el-button>
      </div>
    </div>

    <div class="grid-3">
      <div class="metric-card"><span>数据源类型</span><strong>{{ detail.type }}</strong></div>
      <div class="metric-card"><span>字段数量</span><strong>{{ detail.fields.length }}</strong></div>
      <div class="metric-card"><span>连接状态</span><strong><StatusTag :status="detail.status" /></strong></div>
    </div>

    <div class="grid-2">
      <el-card>
        <template #header>基础信息</template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="负责人">{{ detail.owner }}</el-descriptions-item>
          <el-descriptions-item label="接入地址">{{ detail.address }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.createdAt }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card>
        <template #header>测试记录</template>
        <el-timeline>
          <el-timeline-item v-for="item in detail.testRecords" :key="`${item.time}-${item.duration}`" :timestamp="item.time">
            {{ item.result }}，耗时 {{ item.duration }}
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>

    <el-card>
      <template #header>字段结构</template>
      <el-table :data="detail.fields" stripe>
        <el-table-column prop="name" label="字段名" />
        <el-table-column prop="type" label="字段类型" width="160" />
        <el-table-column prop="comment" label="说明" />
      </el-table>
    </el-card>

    <el-card>
      <template #header>关联数据集</template>
      <el-table :data="relatedDatasets" stripe>
        <el-table-column prop="name" label="数据集名称" />
        <el-table-column prop="owner" label="负责人" width="140" />
        <el-table-column prop="version" label="版本" width="100" />
        <el-table-column prop="recordCount" label="记录数" width="140" />
        <el-table-column label="状态" width="130">
          <template #default="{ row }"><StatusTag :status="row.collectStatus" /></template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
  <el-empty v-else description="未找到数据源" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import StatusTag from '@/components/StatusTag.vue'
import { useWorkshopStore } from '@/stores/workshop'

const route = useRoute()
const router = useRouter()
const store = useWorkshopStore()
const detail = computed(() => store.findDatasource(String(route.params.id)))
const relatedDatasets = computed(() => store.datasets.filter((item) => item.datasourceId === detail.value?.id))

const testCurrent = () => {
  if (!detail.value) return
  store.testDatasource(detail.value.id)
  ElMessage.success(`${detail.value.name} 连接测试成功`)
}

const removeCurrent = () => {
  if (!detail.value) return
  const current = detail.value
  ElMessageBox.confirm(`确认删除数据源“${current.name}”吗？`, '删除确认', { type: 'warning' }).then(() => {
    store.deleteDatasource(current.id)
    ElMessage.success('删除成功')
    router.push('/datasource/list')
  })
}
</script>
