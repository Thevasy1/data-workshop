<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">数据集列表</span>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>创建数据集
      </el-button>
    </div>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="名称">
        <el-input v-model="searchForm.keyword" placeholder="请输入数据集名称" clearable />
      </el-form-item>
      <el-form-item label="数据源">
        <el-select v-model="searchForm.datasourceId" placeholder="请选择数据源" clearable filterable>
          <el-option
            v-for="item in datasourceOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.collectStatus" placeholder="请选择状态" clearable>
          <el-option label="待采集" value="pending" />
          <el-option label="采集中" value="running" />
          <el-option label="采集成功" value="success" />
          <el-option label="采集失败" value="failed" />
          <el-option label="已暂停" value="paused" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
        />
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
        <el-progress
          v-if="row.collectStatus === 'running' || row.collectStatus === 'paused'"
          :percentage="row.collectProgress"
          :status="row.collectStatus === 'paused' ? 'warning' : undefined"
        />
        <span v-else>{{ row.collectProgress }}%</span>
      </template>
      <template #recordCount="{ row }">
        {{ row.recordCount.toLocaleString() }}
      </template>
      <template #isLabeled="{ row }">
        <el-tag :type="row.isLabeled ? 'success' : 'info'">
          {{ row.isLabeled ? '可标注' : '未标注' }}
        </el-tag>
      </template>
      <template #operation="{ row }">
        <div class="operation-buttons">
          <el-button size="small" @click="handleDetail(row)">详情</el-button>
          <el-button
            v-if="row.collectStatus === 'pending' || row.collectStatus === 'paused'"
            type="primary"
            size="small"
            @click="handleStart(row)"
          >
            启动
          </el-button>
          <el-button v-if="row.collectStatus === 'running'" size="small" @click="handlePause(row)">
            暂停
          </el-button>
          <el-button v-if="row.collectStatus === 'failed'" type="warning" size="small" @click="handleRetry(row)">
            重试
          </el-button>
          <el-button size="small" @click="handleLogs(row)">日志</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </div>
      </template>
    </CommonTable>

    <el-dialog v-model="logDialogVisible" title="采集日志" width="680px">
      <el-timeline v-if="logs.length">
        <el-timeline-item
          v-for="item in logs"
          :key="`${item.time}-${item.message}`"
          :timestamp="item.time"
          :type="logTypeMap[item.level]"
        >
          {{ item.message }}
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无日志" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import StatusTag from '@/components/StatusTag.vue'
import datasetApi from '@/api/dataset'
import type {
  CollectStatus,
  DatasetItem,
  DatasetListParams,
  DatasetLog,
  DatasourceOption,
} from '@/api/dataset'

const router = useRouter()

const loading = ref(false)
const tableData = ref<DatasetItem[]>([])
const datasourceOptions = ref<DatasourceOption[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const logs = ref<DatasetLog[]>([])
const logDialogVisible = ref(false)
const dateRange = ref<[string, string] | null>(null)

const searchForm = ref<{
  keyword: string
  datasourceId: string
  collectStatus: CollectStatus | ''
}>({
  keyword: '',
  datasourceId: '',
  collectStatus: '',
})

const logTypeMap: Record<DatasetLog['level'], 'primary' | 'warning' | 'danger'> = {
  info: 'primary',
  warning: 'warning',
  error: 'danger',
}

const columns = [
  { prop: 'name', label: '名称', minWidth: 150 },
  { prop: 'datasourceName', label: '数据源', minWidth: 150 },
  { prop: 'collectStatus', label: '采集状态', width: 120, slot: true },
  { prop: 'collectProgress', label: '进度', width: 180, slot: true },
  { prop: 'recordCount', label: '记录数', width: 110, slot: true },
  { prop: 'version', label: '版本', width: 90 },
  { prop: 'isLabeled', label: '标注状态', width: 110, slot: true },
  { prop: 'createdAt', label: '创建时间', width: 180 },
  { prop: 'operation', label: '操作', width: 360, slot: true },
]

const buildListParams = (): DatasetListParams => ({
  page: page.value,
  pageSize: pageSize.value,
  keyword: searchForm.value.keyword,
  datasourceId: searchForm.value.datasourceId,
  collectStatus: searchForm.value.collectStatus,
  startTime: dateRange.value?.[0],
  endTime: dateRange.value?.[1],
})

const fetchList = async () => {
  loading.value = true
  try {
    const res = await datasetApi.getList(buildListParams())
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const fetchDatasourceOptions = async () => {
  datasourceOptions.value = await datasetApi.getDatasourceOptions()
}

const handleSearch = () => {
  page.value = 1
  fetchList()
}

const handleReset = () => {
  searchForm.value = { keyword: '', datasourceId: '', collectStatus: '' }
  dateRange.value = null
  page.value = 1
  fetchList()
}

const handleCreate = () => {
  router.push('/dataset/create')
}

const handleDetail = (row: DatasetItem) => {
  router.push(`/dataset/detail/${row.id}`)
}

const handleStart = async (row: DatasetItem) => {
  await datasetApi.startCollect(row.id)
  ElMessage.success('采集已启动')
  fetchList()
}

const handlePause = async (row: DatasetItem) => {
  await datasetApi.pauseCollect(row.id)
  ElMessage.success('已暂停采集')
  fetchList()
}

const handleRetry = async (row: DatasetItem) => {
  await datasetApi.retryCollect(row.id)
  ElMessage.success('重新采集已启动')
  fetchList()
}

const handleLogs = async (row: DatasetItem) => {
  logs.value = await datasetApi.getLogs(row.id)
  logDialogVisible.value = true
}

const handleDelete = (row: DatasetItem) => {
  ElMessageBox.confirm(`确认删除数据集「${row.name}」？`, '提示', { type: 'warning' }).then(async () => {
    await datasetApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchList()
  })
}

watch([page, pageSize], fetchList)

onMounted(async () => {
  await fetchDatasourceOptions()
  await fetchList()
})
</script>
