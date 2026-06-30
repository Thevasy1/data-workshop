<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">预处理任务</span>
      <el-button type="primary" @click="router.push('/preprocess/create')">新建预处理</el-button>
    </div>

    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="名称">
        <el-input v-model="searchForm.keyword" clearable />
      </el-form-item>
      <el-form-item label="处理方式">
        <el-select v-model="searchForm.processTypes" multiple clearable collapse-tags>
          <el-option label="数据清洗" value="clean" />
          <el-option label="数据去重" value="dedup" />
          <el-option label="标准化" value="normalize" />
          <el-option label="格式转换" value="format" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" clearable>
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
      <template #processTypes="{ row }">
        <el-tag v-for="item in row.processTypes" :key="item" class="mr8">
          {{ processTypeMap[item] || item }}
        </el-tag>
      </template>
      <template #status="{ row }">
        <StatusTag :status="row.status" type="preprocess" />
      </template>
      <template #operation="{ row }">
        <el-button size="small" @click="router.push(`/preprocess/detail/${row.id}`)">详情</el-button>
      </template>
    </CommonTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import CommonTable from '@/components/CommonTable.vue'
import StatusTag from '@/components/StatusTag.vue'
import preprocessApi, { type PreprocessParams } from '@/api/preprocess'

const router = useRouter()
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const tableData = ref<any[]>([])

const processTypeMap: Record<string, string> = {
  clean: '数据清洗',
  dedup: '数据去重',
  normalize: '标准化',
  format: '格式转换',
}

const searchForm = ref<PreprocessParams>({
  keyword: '',
  processTypes: [],
  status: '',
})

const columns = [
  { prop: 'name', label: '任务名称', minWidth: 180 },
  { prop: 'datasetName', label: '数据集', minWidth: 160 },
  { prop: 'processTypes', label: '处理方式', width: 200, slot: true },
  { prop: 'status', label: '状态', width: 120, slot: true },
  { prop: 'progress', label: '进度', width: 120 },
  { prop: 'createdAt', label: '创建时间', width: 180 },
  { prop: 'operation', label: '操作', width: 100, slot: true },
]

const fetchList = async () => {
  loading.value = true
  try {
    const res = await preprocessApi.getList({
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
  searchForm.value = { keyword: '', processTypes: [], status: '' }
  page.value = 1
  fetchList()
}

watch([page, pageSize], fetchList)
onMounted(fetchList)
</script>

<style scoped>
.mr8 {
  margin-right: 8px;
}
</style>
