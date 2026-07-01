<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">预处理任务列表</h1>
        <p class="page-desc">查看全部预处理任务，支持按任务、数据集和执行状态筛选。</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="router.push('/preprocess/create')">创建预处理任务</el-button>
    </div>

    <el-form :inline="true" :model="query" class="search-panel">
      <el-form-item label="关键字">
        <el-input v-model="query.keyword" clearable placeholder="任务名称、数据集" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" clearable placeholder="全部状态" style="width: 160px">
          <el-option label="等待中" value="waiting" />
          <el-option label="执行中" value="running" />
          <el-option label="已完成" value="success" />
          <el-option label="失败" value="failed" />
        </el-select>
      </el-form-item>
      <el-form-item label="数据集">
        <el-select v-model="query.datasetId" clearable placeholder="全部数据集" style="width: 180px">
          <el-option v-for="item in store.datasets" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button :icon="Refresh" @click="reset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="pagedList" stripe>
      <el-table-column prop="name" label="任务名称" min-width="190" />
      <el-table-column prop="datasetName" label="源数据集" min-width="170" />
      <el-table-column label="执行状态" width="130">
        <template #default="{ row }"><StatusTag :status="row.status" /></template>
      </el-table-column>
      <el-table-column label="进度" width="170">
        <template #default="{ row }"><el-progress :percentage="row.progress" /></template>
      </el-table-column>
      <el-table-column prop="inputCount" label="输入量" width="120" />
      <el-table-column prop="outputCount" label="输出量" width="120" />
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="router.push(`/preprocess/detail/${row.id}`)">详情</el-button>
          <el-button size="small" type="primary" @click="router.push(`/dataset/detail/${row.outputDatasetId}`)">输出</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Refresh } from '@element-plus/icons-vue'
import StatusTag from '@/components/StatusTag.vue'
import { useWorkshopStore, type PreprocessStatus } from '@/stores/workshop'

const router = useRouter()
const store = useWorkshopStore()
const page = ref(1)
const pageSize = ref(10)
const query = reactive<{ keyword: string; status: PreprocessStatus | ''; datasetId: string }>({
  keyword: '',
  status: '',
  datasetId: '',
})

const filteredList = computed(() => {
  const keyword = query.keyword.trim().toLowerCase()
  return store.preprocessTasks.filter((item) => {
    if (query.status && item.status !== query.status) return false
    if (query.datasetId && item.datasetId !== query.datasetId) return false
    if (!keyword) return true
    return [item.name, item.datasetName, ...item.rules].join(' ').toLowerCase().includes(keyword)
  })
})

const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

const reset = () => {
  query.keyword = ''
  query.status = ''
  query.datasetId = ''
  page.value = 1
}
</script>
