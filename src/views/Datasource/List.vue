<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">数据源列表</span>
      <el-button type="primary" @click="router.push('/datasource/create')">新建数据源</el-button>
    </div>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="名称">
        <el-input v-model="searchForm.keyword" clearable placeholder="按名称搜索" />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="searchForm.type" clearable placeholder="全部类型">
          <el-option label="API 接口" value="api" />
          <el-option label="文件上传" value="upload" />
          <el-option label="数据库" value="database" />
          <el-option label="网页抓取" value="web" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" clearable placeholder="全部状态">
          <el-option label="草稿" value="draft" />
          <el-option label="启用" value="active" />
          <el-option label="停用" value="inactive" />
          <el-option label="异常" value="failed" />
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
      <template #type="{ row }">
        <el-tag>{{ typeLabelMap[row.type] || row.type }}</el-tag>
      </template>
      <template #status="{ row }">
        <StatusTag :status="row.status" type="datasource" />
      </template>
      <template #operation="{ row }">
        <el-button size="small" @click="router.push(`/datasource/detail/${row.id}`)">详情</el-button>
        <el-button size="small" type="primary" @click="router.push(`/datasource/edit/${row.id}`)">编辑</el-button>
        <el-button size="small" @click="openTest(row)">测试</el-button>
        <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </CommonTable>

    <el-dialog v-model="testDialogVisible" title="连接测试结果" width="640px">
      <el-alert
        v-if="testResult"
        :title="testResult.message"
        :type="testResult.success ? 'success' : 'error'"
        :closable="false"
        show-icon
      />
      <el-table
        v-if="testResult?.sampleData?.length"
        :data="testResult.sampleData"
        border
        max-height="280"
        style="margin-top: 16px"
      >
        <el-table-column
          v-for="column in sampleColumns"
          :key="column"
          :prop="column"
          :label="column"
        />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CommonTable from '@/components/CommonTable.vue'
import StatusTag from '@/components/StatusTag.vue'
import datasourceApi, { type DatasourceListParams, type TestConnectionResult } from '@/api/datasource'

const router = useRouter()
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const tableData = ref<any[]>([])
const testDialogVisible = ref(false)
const testResult = ref<TestConnectionResult | null>(null)

const searchForm = ref<DatasourceListParams>({
  keyword: '',
  type: '',
  status: '',
})

const typeLabelMap: Record<string, string> = {
  api: 'API 接口',
  upload: '文件上传',
  database: '数据库',
  web: '网页抓取',
}

const columns = [
  { prop: 'name', label: '名称', minWidth: 180 },
  { prop: 'type', label: '类型', width: 120, slot: true },
  { prop: 'status', label: '状态', width: 120, slot: true },
  { prop: 'description', label: '描述', minWidth: 220 },
  { prop: 'updatedAt', label: '更新时间', width: 180 },
  { prop: 'operation', label: '操作', width: 260, slot: true },
]

const sampleColumns = computed(() => (testResult.value?.sampleData?.[0] ? Object.keys(testResult.value.sampleData[0]) : []))

const fetchList = async () => {
  loading.value = true
  try {
    const res = await datasourceApi.getList({
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
  searchForm.value = { keyword: '', type: '', status: '' }
  page.value = 1
  fetchList()
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除数据源 ${row.name} 吗？`, '提示', { type: 'warning' }).then(async () => {
    await datasourceApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchList()
  })
}

const openTest = async (row: any) => {
  const detail = await datasourceApi.getDetail(row.id)
  testResult.value = await datasourceApi.testConnection({ type: detail.type, config: detail.config })
  testDialogVisible.value = true
}

watch([page, pageSize], fetchList)
onMounted(fetchList)
</script>

<style scoped></style>
