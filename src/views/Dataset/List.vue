<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">数据集列表</span>
      <el-button type="primary" @click="router.push('/dataset/create')">创建数据集</el-button>
    </div>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="名称">
        <el-input v-model="searchForm.keyword" clearable placeholder="按名称搜索" />
      </el-form-item>
      <el-form-item label="数据源">
        <el-select v-model="searchForm.datasourceId" clearable placeholder="全部数据源">
          <el-option v-for="item in datasourceOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="采集状态">
        <el-select v-model="searchForm.collectStatus" clearable placeholder="全部状态">
          <el-option label="待执行" value="pending" />
          <el-option label="执行中" value="running" />
          <el-option label="已完成" value="success" />
          <el-option label="失败" value="failed" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <CommonTable
      :columns="columns"
      :data="tableData"
      :loading="loading"
      :total="total"
      :show-operation="false"
      v-model:page="page"
      v-model:pageSize="pageSize"
    >
      <template #collectStatus="{ row }">
        <StatusTag :status="row.collectStatus" type="collect" />
      </template>
      <template #collectProgress="{ row }">
        <el-progress v-if="row.collectStatus === 'running'" :percentage="row.collectProgress" />
        <span v-else>{{ row.collectStatus === 'success' ? 100 : row.collectProgress || 0 }}%</span>
      </template>
      <template #operation="{ row }">
        <el-button
          v-if="row.collectStatus === 'pending' || row.collectStatus === 'paused'"
          size="small"
          type="primary"
          @click="handleStart(row)"
        >
          启动
        </el-button>
        <el-button
          v-if="row.collectStatus === 'running'"
          size="small"
          @click="handlePause(row)"
        >
          暂停
        </el-button>
        <el-button
          v-if="row.collectStatus === 'failed'"
          size="small"
          type="warning"
          @click="handleRetry(row)"
        >
          重试
        </el-button>
        <el-button size="small" @click="router.push(`/dataset/detail/${row.id}`)">详情</el-button>
        <el-button size="small" @click="handleLogs(row)">日志</el-button>
        <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </CommonTable>

    <el-dialog v-model="logsVisible" title="采集日志" width="720px">
      <el-timeline v-if="logs.length">
        <el-timeline-item
          v-for="item in logs"
          :key="`${item.time}-${item.message}`"
          :timestamp="item.time"
        >
          [{{ item.level }}] {{ item.message }}
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无日志" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import StatusTag from '@/components/StatusTag.vue'
import datasetApi, { type DatasetListParams, type DatasourceOption, type DatasetLog } from '@/api/dataset'

const router = useRouter()
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const tableData = ref<any[]>([])
const datasourceOptions = ref<DatasourceOption[]>([])
const logsVisible = ref(false)
const logs = ref<DatasetLog[]>([])

const searchForm = ref<DatasetListParams>({
  keyword: '',
  datasourceId: '',
  collectStatus: '',
})

const columns = [
  { prop: 'name', label: '名称', minWidth: 180 },
  { prop: 'datasourceName', label: '数据源', minWidth: 160 },
  { prop: 'collectStatus', label: '采集状态', width: 120, slot: true },
  { prop: 'collectProgress', label: '进度', width: 180, slot: true },
  { prop: 'recordCount', label: '记录数', width: 120 },
  { prop: 'version', label: '版本', width: 100 },
  { prop: 'operation', label: '操作', width: 160, slot: true },
]

const fetchList = async () => {
  loading.value = true
  try {
    const res = await datasetApi.getList({
      ...searchForm.value,
      page: page.value,
      pageSize: pageSize.value,
    })
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchList()
}

const handleReset = () => {
  searchForm.value = { keyword: '', datasourceId: '', collectStatus: '' }
  page.value = 1
  fetchList()
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除数据集 ${row.name} 吗？`, '提示', { type: 'warning' }).then(async () => {
    await datasetApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchList()
  })
}

const handleStart = async (row: any) => {
  await datasetApi.startCollect(row.id)
  ElMessage.success('启动成功')
  fetchList()
}

const handlePause = async (row: any) => {
  await datasetApi.pauseCollect(row.id)
  ElMessage.success('已暂停')
  fetchList()
}

const handleRetry = async (row: any) => {
  await datasetApi.retryCollect(row.id)
  ElMessage.success('重试任务已启动')
  fetchList()
}

const handleLogs = async (row: any) => {
  logs.value = await datasetApi.getLogs(row.id)
  logsVisible.value = true
}

watch([page, pageSize], fetchList)
onMounted(async () => {
  datasourceOptions.value = await datasetApi.getDatasourceOptions()
  fetchList()
})
</script>

<style scoped></style>
