<template>
  <div class="page" v-if="detail">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ detail.name }}</h1>
        <p class="page-desc">{{ detail.description }}</p>
      </div>
      <div class="toolbar">
        <el-button @click="router.push('/dataset/list')">返回列表</el-button>
        <el-dropdown trigger="click" @command="(format: 'csv' | 'json') => exportCurrent(format)">
          <el-button>导出数据集</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="csv">导出 CSV</el-dropdown-item>
              <el-dropdown-item command="json">导出 JSON</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button type="primary" @click="store.setDatasetLabel(detail.id, !detail.labelEnabled)">
          {{ detail.labelEnabled ? '取消可标注' : '标记可标注' }}
        </el-button>
        <el-button type="danger" @click="removeCurrent">删除</el-button>
      </div>
    </div>

    <div class="grid-3">
      <div class="metric-card"><span>记录数</span><strong>{{ detail.recordCount }}</strong></div>
      <div class="metric-card"><span>字段数</span><strong>{{ detail.fieldCount }}</strong></div>
      <div class="metric-card"><span>当前版本</span><strong>{{ detail.version }}</strong></div>
    </div>

    <el-card>
      <template #header>基础信息</template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="数据源">{{ detail.datasourceName }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ detail.owner }}</el-descriptions-item>
        <el-descriptions-item label="采集状态"><StatusTag :status="detail.collectStatus" /></el-descriptions-item>
        <el-descriptions-item label="调度规则">{{ detail.schedule }}</el-descriptions-item>
        <el-descriptions-item label="可用于标注">{{ detail.labelEnabled ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createdAt }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card>
      <el-tabs>
        <el-tab-pane label="样本数据">
          <el-table :data="detail.samples" stripe>
            <el-table-column v-for="key in sampleColumns" :key="key" :prop="key" :label="key" min-width="140" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="字段结构">
          <el-table :data="detail.fields" stripe>
            <el-table-column prop="name" label="字段名" />
            <el-table-column prop="type" label="类型" width="140" />
            <el-table-column prop="source" label="源字段" width="160" />
            <el-table-column prop="comment" label="说明" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="历史版本">
          <el-table :data="detail.versions" stripe>
            <el-table-column prop="name" label="版本" width="120" />
            <el-table-column prop="recordCount" label="记录数" width="140" />
            <el-table-column prop="createdAt" label="生成时间" width="190" />
            <el-table-column prop="description" label="说明" />
            <el-table-column label="操作" width="140">
              <template #default="{ row }">
                <el-button size="small" @click="rollback(row.name)">回滚</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="执行日志">
          <el-timeline>
            <el-timeline-item v-for="item in detail.logs" :key="`${item.time}-${item.message}`" :timestamp="item.time">
              {{ item.message }}
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
  <el-empty v-else description="未找到数据集" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import StatusTag from '@/components/StatusTag.vue'
import { useWorkshopStore } from '@/stores/workshop'
import { downloadDataset } from '@/utils/exportDataset'

const route = useRoute()
const router = useRouter()
const store = useWorkshopStore()
const detail = computed(() => store.findDataset(String(route.params.id)))
const sampleColumns = computed(() => Object.keys(detail.value?.samples[0] || {}))

const exportCurrent = (format: 'csv' | 'json') => {
  if (!detail.value) return
  downloadDataset(detail.value, format)
  ElMessage.success(`已导出 ${detail.value.name}.${format}`)
}

const rollback = (versionName: string) => {
  if (!detail.value) return
  store.rollbackDatasetVersion(detail.value.id, versionName)
  ElMessage.success(`已回滚到 ${versionName}`)
}

const removeCurrent = () => {
  if (!detail.value) return
  const current = detail.value
  ElMessageBox.confirm(`确认删除数据集“${current.name}”吗？`, '删除确认', { type: 'warning' }).then(() => {
    store.deleteDataset(current.id)
    ElMessage.success('删除成功')
    router.push('/dataset/list')
  })
}
</script>
