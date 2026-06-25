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
      <template #processType="{ row }">
        <el-tag>{{ processTypeMap[row.processType] }}</el-tag>
      </template>
      <template #status="{ row }">
        <StatusTag :status="row.status" type="preprocess" />
      </template>
      <template #operation="{ row }">
        <div class="operation-buttons">
          <el-button size="small" @click="handleView(row)">查看结果</el-button>
          <el-button size="small" @click="handleVersions(row)">版本管理</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </div>
      </template>
    </CommonTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import StatusTag from '@/components/StatusTag.vue'
import preprocessApi from '@/api/preprocess'

const router = useRouter()

const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const searchForm = ref({
  keyword: '',
})

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
    const res = await preprocessApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchForm.value.keyword,
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
  searchForm.value = { keyword: '' }
  page.value = 1
  fetchList()
}

const handleCreate = () => {
  router.push('/preprocess/create')
}

const handleView = (row: any) => {
  ElMessage.info(`预处理任务「${row.name}」结果详情待后续模块对接`)
}

const handleVersions = (row: any) => {
  ElMessage.info(`预处理任务「${row.name}」版本管理待后续模块对接`)
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除预处理任务「${row.name}」？`, '提示', { type: 'warning' }).then(async () => {
    // TODO: 调用删除接口
    ElMessage.success('删除成功')
    fetchList()
  })
}

watch([page, pageSize], fetchList)

onMounted(fetchList)
</script>
