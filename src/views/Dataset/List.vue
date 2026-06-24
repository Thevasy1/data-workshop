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
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
          <el-option label="待采集" value="pending" />
          <el-option label="采集中" value="running" />
          <el-option label="采集成功" value="success" />
          <el-option label="采集失败" value="failed" />
          <el-option label="已暂停" value="paused" />
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
      v-model:page="page"
      v-model:pageSize="pageSize"
    >
      <template #collectStatus="{ row }">
        <StatusTag :status="row.collectStatus" type="collect" />
      </template>
      <template #collectProgress="{ row }">
        <el-progress v-if="row.collectStatus === 'running'" :percentage="row.collectProgress" />
        <span v-else>{{ row.collectStatus === 'success' ? 100 : 0 }}%</span>
      </template>
      <template #operation="{ row }">
        <el-button v-if="row.collectStatus === 'pending' || row.collectStatus === 'paused'" type="primary" size="small" @click="handleStart(row)">启动</el-button>
        <el-button v-if="row.collectStatus === 'running'" size="small" @click="handlePause(row)">暂停</el-button>
        <el-button v-if="row.collectStatus === 'failed'" type="warning" size="small" @click="handleRetry(row)">重试</el-button>
        <el-button size="small" @click="handleLogs(row)">日志</el-button>
        <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
      </template>
    </CommonTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import StatusTag from '@/components/StatusTag.vue'
import datasetApi from '@/api/dataset'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const searchForm = ref({
  keyword: '',
  status: '',
})

const columns = [
  { prop: 'name', label: '名称', minWidth: 150 },
  { prop: 'datasourceName', label: '数据源', minWidth: 150 },
  { prop: 'collectStatus', label: '采集状态', width: 120, slot: true },
  { prop: 'collectProgress', label: '进度', width: 180, slot: true },
  { prop: 'recordCount', label: '记录数', width: 100 },
  { prop: 'createdAt', label: '创建时间', width: 180 },
  { prop: 'operation', label: '操作', width: 300, slot: true },
]

const fetchList = async () => {
  loading.value = true
  try {
    const res = await datasetApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchForm.value.keyword,
      status: searchForm.value.status,
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
  searchForm.value = { keyword: '', status: '' }
  page.value = 1
  fetchList()
}

const handleCreate = () => {
  router.push('/dataset/create')
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
  ElMessage.success('重新采集已启动')
  fetchList()
}

const handleLogs = (row: any) => {
  // TODO: 打开日志弹窗
  console.log('查看日志', row.id)
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该数据集？', '提示', { type: 'warning' }).then(async () => {
    await datasetApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchList()
  })
}

onMounted(fetchList)
</script>

<style scoped>
.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>
