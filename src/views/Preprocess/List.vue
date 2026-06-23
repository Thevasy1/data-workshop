<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">预处理任务</span>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>新建预处理
      </el-button>
    </div>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="名称">
        <el-input v-model="searchForm.keyword" placeholder="请输入任务名称" clearable />
      </el-form-item>
      <el-form-item label="处理方式">
        <el-select v-model="searchForm.processType" placeholder="全部方式" clearable style="width: 130px">
          <el-option label="数据清洗" value="clean" />
          <el-option label="数据去重" value="dedup" />
          <el-option label="标准化" value="normalize" />
          <el-option label="格式转换" value="format" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 130px">
          <el-option label="待处理" value="pending" />
          <el-option label="处理中" value="running" />
          <el-option label="处理成功" value="success" />
          <el-option label="处理失败" value="failed" />
        </el-select>
      </el-form-item>
      <el-form-item label="源数据集">
        <el-select v-model="searchForm.datasetId" placeholder="全部数据集" clearable style="width: 180px">
          <el-option
            v-for="item in datasetOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
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
          style="width: 240px"
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
      v-model:page="page"
      v-model:pageSize="pageSize"
    >
      <template #processType="{ row }">
        <el-tag>{{ processTypeMap[row.processType] }}</el-tag>
      </template>
      <template #status="{ row }">
        <StatusTag :status="row.status" type="preprocess" />
      </template>
      <template #operation="{ row }">
        <el-button size="small" @click="handleView(row)">查看结果</el-button>
        <el-button size="small" @click="handleVersions(row)">版本管理</el-button>
        <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
      </template>
    </CommonTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CommonTable from '@/components/CommonTable.vue'
import StatusTag from '@/components/StatusTag.vue'
import preprocessApi from '@/api/preprocess'
import type { PreprocessParams } from '@/api/preprocess'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const datasetOptions = ref<{ id: string; name: string }[]>([])

const searchForm = ref({
  keyword: '',
  processType: '',
  status: '',
  datasetId: '',
})

const dateRange = ref<[string, string] | null>(null)

const processTypeMap: Record<string, string> = {
  clean: '数据清洗',
  dedup: '数据去重',
  normalize: '标准化',
  format: '格式转换',
}

const columns = [
  { prop: 'name', label: '任务名称', minWidth: 150 },
  { prop: 'datasetName', label: '源数据集', minWidth: 150 },
  { prop: 'processType', label: '处理方式', width: 120, slot: true },
  { prop: 'status', label: '状态', width: 120, slot: true },
  { prop: 'version', label: '版本', width: 100 },
  { prop: 'createdAt', label: '创建时间', width: 180 },
  { prop: 'operation', label: '操作', width: 280, slot: true },
]

const fetchList = async () => {
  loading.value = true
  try {
    const params: PreprocessParams = {
      page: page.value,
      pageSize: pageSize.value,
    }
    if (searchForm.value.keyword) params.keyword = searchForm.value.keyword
    if (searchForm.value.processType) params.processType = searchForm.value.processType
    if (searchForm.value.status) params.status = searchForm.value.status
    if (searchForm.value.datasetId) params.datasetId = searchForm.value.datasetId
    if (dateRange.value) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }

    const res = await preprocessApi.getList(params)
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
  searchForm.value = { keyword: '', processType: '', status: '', datasetId: '' }
  dateRange.value = null
  page.value = 1
  fetchList()
}

const handleCreate = () => {
  router.push('/preprocess/create')
}

const handleView = (row: any) => {
  // TODO: 查看结果
  console.log('查看结果', row.id)
}

const handleVersions = (row: any) => {
  // TODO: 版本管理
  console.log('版本管理', row.id)
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该预处理任务？', '提示', { type: 'warning' }).then(async () => {
    // TODO: 调用删除接口
    ElMessage.success('删除成功')
    fetchList()
  })
}

const loadDatasetOptions = async () => {
  try {
    const res = await preprocessApi.getAvailableDatasets()
    datasetOptions.value = res
  } catch {
    /* 选项加载失败不影响列表展示 */
  }
}

onMounted(() => {
  loadDatasetOptions()
  fetchList()
})
</script>

<style scoped>
/* 搜索表单样式由 global.css 统一管理 */
</style>
