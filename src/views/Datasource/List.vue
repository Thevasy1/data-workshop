<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">数据源列表</span>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新增数据源
      </el-button>
    </div>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="名称">
        <el-input v-model="searchForm.keyword" placeholder="请输入数据源名称" clearable />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="searchForm.type" placeholder="请选择类型" clearable style="width: 150px">
          <el-option v-for="item in datasourceTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 140px">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
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
      :operation-width="300"
      v-model:page="page"
      v-model:pageSize="pageSize"
    >
      <template #type="{ row }">
        <el-tag>{{ datasourceTypeMap[row.type] || row.type }}</el-tag>
      </template>
      <template #status="{ row }">
        <StatusTag :status="row.status" type="datasource" />
      </template>
      <template #createdAt="{ row }">
        {{ formatDate(row.createdAt) }}
      </template>
      <template #updatedAt="{ row }">
        {{ formatDate(row.updatedAt) }}
      </template>
      <template #operation="{ row }">
        <el-button size="small" @click="handleDetail(row)">详情</el-button>
        <el-button size="small" :loading="testingId === row.id" @click="handleTest(row)">测试</el-button>
        <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
        <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
      </template>
    </CommonTable>

    <el-dialog v-model="testDialogVisible" title="连接测试结果" width="720px">
      <el-result
        v-if="testResult"
        :icon="testResult.success ? 'success' : 'error'"
        :title="testResult.success ? '连接成功' : '连接失败'"
        :sub-title="testResult.message"
      />

      <el-table v-if="testResult?.sampleData?.length" :data="testResult.sampleData" border>
        <el-table-column v-for="col in testColumns" :key="col" :prop="col" :label="col" min-width="120" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import CommonTable from '@/components/CommonTable.vue'
import type { TableColumn } from '@/components/CommonTable.vue'
import StatusTag from '@/components/StatusTag.vue'
import datasourceApi from '@/api/datasource'
import type { DatasourceListItem, DatasourceParams, TestConnectionResult } from '@/api/datasource'
import { DATASOURCE_TYPE } from '@/utils/constants'
import { formatDate } from '@/utils/format'

const router = useRouter()

const loading = ref(false)
const testingId = ref('')
const tableData = ref<DatasourceListItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const dateRange = ref<string[]>([])
const testDialogVisible = ref(false)
const testResult = ref<TestConnectionResult | null>(null)

const datasourceTypeMap: Record<string, string> = DATASOURCE_TYPE
const datasourceTypeOptions = [
  { label: 'API 接口', value: 'api' },
  { label: '本地上传', value: 'upload' },
  { label: '数据库', value: 'database' },
  { label: 'Web 页面抓取', value: 'web' },
]
const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '启用', value: 'active' },
  { label: '停用', value: 'inactive' },
  { label: '异常', value: 'failed' },
]

const searchForm = ref<DatasourceParams>({
  keyword: '',
  type: '',
  status: '',
})

const columns: TableColumn[] = [
  { prop: 'name', label: '名称', minWidth: 160 },
  { prop: 'type', label: '类型', width: 130, slot: true },
  { prop: 'status', label: '状态', width: 100, slot: true },
  { prop: 'description', label: '描述', minWidth: 220 },
  { prop: 'createdAt', label: '创建时间', width: 180, slot: true },
  { prop: 'updatedAt', label: '更新时间', width: 180, slot: true },
]

const testColumns = computed(() => Object.keys(testResult.value?.sampleData?.[0] || {}))

const fetchList = async () => {
  loading.value = true
  try {
    const [startTime, endTime] = dateRange.value
    const res = await datasourceApi.getList({
      ...searchForm.value,
      page: page.value,
      pageSize: pageSize.value,
      startTime,
      endTime,
    })
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const reloadFromFirstPage = () => {
  if (page.value === 1) {
    fetchList()
    return
  }
  page.value = 1
}

const handleSearch = () => {
  reloadFromFirstPage()
}

const handleReset = () => {
  searchForm.value = { keyword: '', type: '', status: '' }
  dateRange.value = []
  reloadFromFirstPage()
}

const handleCreate = () => {
  router.push('/datasource/create')
}

const handleEdit = (row: DatasourceListItem) => {
  router.push(`/datasource/edit/${row.id}`)
}

const handleDetail = (row: DatasourceListItem) => {
  router.push(`/datasource/detail/${row.id}`)
}

const handleTest = async (row: DatasourceListItem) => {
  testingId.value = row.id
  try {
    const detail = await datasourceApi.getDetail(row.id)
    testResult.value = await datasourceApi.testConnection({
      type: detail.type,
      config: detail.config,
    })
    testDialogVisible.value = true

    if (testResult.value.success) {
      ElMessage.success(testResult.value.message)
    } else {
      ElMessage.warning(testResult.value.message)
    }
  } finally {
    testingId.value = ''
  }
}

const handleDelete = async (row: DatasourceListItem) => {
  try {
    await ElMessageBox.confirm(`确认删除数据源“${row.name}”吗？`, '提示', { type: 'warning' })
    await datasourceApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      throw error
    }
  }
}

watch([page, pageSize], fetchList)

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
