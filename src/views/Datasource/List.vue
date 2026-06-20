<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">数据源列表</span>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>新增数据源
      </el-button>
    </div>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="名称">
        <el-input v-model="searchForm.keyword" placeholder="请输入数据源名称" clearable />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
          <el-option label="API接口" value="api" />
          <el-option label="本地上传" value="upload" />
          <el-option label="数据库" value="database" />
          <el-option label="Web页面抓取" value="web" />
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
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <template #type="{ row }">
        <el-tag>{{ typeMap[row.type] }}</el-tag>
      </template>
      <template #status="{ row }">
        <StatusTag :status="row.status" type="datasource" />
      </template>
      <template #operation="{ row }">
        <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
        <el-button size="small" @click="handleConfig(row)">配置规则</el-button>
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
import datasourceApi from '@/api/datasource'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const searchForm = ref({
  keyword: '',
  type: '',
})

const typeMap: Record<string, string> = {
  api: 'API接口',
  upload: '本地上传',
  database: '数据库',
  web: 'Web页面抓取',
}

const columns = [
  { prop: 'name', label: '名称', minWidth: 150 },
  { prop: 'type', label: '类型', width: 130, slot: true },
  { prop: 'sourceUrl', label: '来源地址', minWidth: 200 },
  { prop: 'status', label: '状态', width: 100, slot: true },
  { prop: 'createdAt', label: '创建时间', width: 180 },
  { prop: 'operation', label: '操作', width: 260, slot: true },
]

const fetchList = async () => {
  loading.value = true
  try {
    const res = await datasourceApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchForm.value.keyword,
      type: searchForm.value.type,
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
  searchForm.value = { keyword: '', type: '' }
  page.value = 1
  fetchList()
}

const handleCreate = () => {
  router.push('/datasource/create')
}

const handleEdit = (row: any) => {
  router.push(`/datasource/edit/${row.id}`)
}

const handleConfig = (row: any) => {
  // TODO: 跳转到规则配置页面
  console.log('配置规则', row.id)
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该数据源？', '提示', { type: 'warning' }).then(async () => {
    await datasourceApi.delete(row.id)
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
