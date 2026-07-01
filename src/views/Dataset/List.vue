<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">数据集列表</h1>
        <p class="page-desc">展示全部数据集，支持按名称、负责人、数据源和采集状态筛选，并可进入详情、导出或标记可用于标注。</p>
      </div>
      <div class="toolbar">
        <el-button @click="store.resetDemoData()">重置演示数据</el-button>
        <el-button type="primary" :icon="Plus" @click="router.push('/dataset/create')">创建数据集</el-button>
      </div>
    </div>

    <el-form :inline="true" :model="query" class="search-panel">
      <el-form-item label="关键字">
        <el-input v-model="query.keyword" clearable placeholder="名称、负责人、说明" />
      </el-form-item>
      <el-form-item label="数据源">
        <el-select v-model="query.datasourceId" clearable placeholder="全部数据源" style="width: 180px">
          <el-option v-for="item in store.datasources" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="采集状态">
        <el-select v-model="query.status" clearable placeholder="全部状态" style="width: 160px">
          <el-option label="待执行" value="pending" />
          <el-option label="执行中" value="running" />
          <el-option label="已完成" value="success" />
          <el-option label="失败" value="failed" />
          <el-option label="已暂停" value="paused" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button :icon="Refresh" @click="reset">重置筛选</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="pagedList" stripe class="dataset-table">
      <el-table-column prop="name" label="数据集名称" min-width="180" />
      <el-table-column prop="datasourceName" label="数据源" min-width="170" />
      <el-table-column prop="owner" label="负责人" width="110" />
      <el-table-column label="采集状态" width="130">
        <template #default="{ row }"><StatusTag :status="row.collectStatus" /></template>
      </el-table-column>
      <el-table-column label="进度" width="170">
        <template #default="{ row }"><el-progress :percentage="row.collectProgress" /></template>
      </el-table-column>
      <el-table-column prop="recordCount" label="记录数" width="120" />
      <el-table-column prop="version" label="版本" width="90" />
      <el-table-column label="可标注" width="138" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.labelEnabled" @change="(value: boolean) => store.setDatasetLabel(row.id, value)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="360" align="center">
        <template #default="{ row }">
          <div class="dataset-actions">
            <el-button size="small" @click="router.push(`/dataset/detail/${row.id}`)">详情</el-button>
            <el-button size="small" @click="showLogs(row)">日志</el-button>
            <el-dropdown trigger="click" @command="(format: 'csv' | 'json') => exportDataset(row, format)">
              <el-button size="small">导出</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="csv">导出 CSV</el-dropdown-item>
                  <el-dropdown-item command="json">导出 JSON</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button size="small" type="danger" @click="remove(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="page"
      v-model:page-size="pageSize"
      :total="filteredList.length"
      :page-sizes="[5, 10, 20]"
      layout="total, sizes, prev, pager, next"
    />

    <el-dialog v-model="logVisible" title="采集执行日志" width="720px">
      <el-timeline>
        <el-timeline-item v-for="item in currentLogs" :key="`${item.time}-${item.message}`" :timestamp="item.time">
          {{ item.message }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import StatusTag from '@/components/StatusTag.vue'
import { useWorkshopStore, type CollectStatus, type Dataset } from '@/stores/workshop'
import { downloadDataset } from '@/utils/exportDataset'

const router = useRouter()
const store = useWorkshopStore()
const page = ref(1)
const pageSize = ref(10)
const logVisible = ref(false)
const currentLogs = ref<Dataset['logs']>([])
const query = reactive<{ keyword: string; datasourceId: string; status: CollectStatus | '' }>({
  keyword: '',
  datasourceId: '',
  status: '',
})

const filteredList = computed(() => {
  const keyword = query.keyword.trim().toLowerCase()
  return store.datasets.filter((item) => {
    if (query.datasourceId && item.datasourceId !== query.datasourceId) return false
    if (query.status && item.collectStatus !== query.status) return false
    if (!keyword) return true
    return [item.name, item.owner, item.datasourceName, item.description].join(' ').toLowerCase().includes(keyword)
  })
})

const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

const reset = () => {
  query.keyword = ''
  query.datasourceId = ''
  query.status = ''
  page.value = 1
}

const showLogs = (row: Dataset) => {
  currentLogs.value = row.logs
  logVisible.value = true
}

const exportDataset = (row: Dataset, format: 'csv' | 'json') => {
  downloadDataset(row, format)
  ElMessage.success(`已导出 ${row.name}.${format}`)
}

const remove = (row: Dataset) => {
  ElMessageBox.confirm(`确认删除数据集“${row.name}”吗？`, '删除确认', { type: 'warning' }).then(() => {
    store.deleteDataset(row.id)
    ElMessage.success('删除成功')
  })
}
</script>

<style scoped>
.dataset-table :deep(.el-switch) {
  display: inline-flex;
  vertical-align: middle;
}

.dataset-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 316px;
  white-space: nowrap;
}

.dataset-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}
</style>
