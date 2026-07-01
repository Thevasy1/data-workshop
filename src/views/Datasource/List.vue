<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">数据源列表</h1>
        <p class="page-desc">管理 API、本地上传、数据库和 Web 抓取数据源，支持搜索、筛选、测试连接和详情查看。</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="router.push('/datasource/create')">新建数据源</el-button>
    </div>

    <el-form :inline="true" :model="query" class="search-panel">
      <el-form-item label="关键字">
        <el-input v-model="query.keyword" clearable placeholder="名称、负责人、地址" />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="query.type" clearable placeholder="全部类型" style="width: 160px">
          <el-option v-for="item in sourceTypes" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" clearable placeholder="全部状态" style="width: 160px">
          <el-option label="连接正常" value="connected" />
          <el-option label="连接波动" value="warning" />
          <el-option label="离线" value="offline" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button :icon="Refresh" @click="reset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="pagedList" stripe>
      <el-table-column prop="name" label="数据源名称" min-width="180" />
      <el-table-column prop="type" label="类型" width="120" />
      <el-table-column prop="owner" label="负责人" width="130" />
      <el-table-column label="连接状态" width="130">
        <template #default="{ row }"><StatusTag :status="row.status" /></template>
      </el-table-column>
      <el-table-column prop="address" label="接入地址" min-width="240" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="test(row)">测试</el-button>
          <el-button size="small" @click="router.push(`/datasource/detail/${row.id}`)">详情</el-button>
          <el-button size="small" @click="router.push(`/datasource/edit/${row.id}`)">编辑</el-button>
          <el-button size="small" type="danger" @click="remove(row)">删除</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import StatusTag from '@/components/StatusTag.vue'
import { useWorkshopStore, type Datasource, type SourceStatus, type SourceType } from '@/stores/workshop'

const router = useRouter()
const store = useWorkshopStore()
const page = ref(1)
const pageSize = ref(10)
const sourceTypes: SourceType[] = ['API', '本地上传', '数据库', 'Web抓取']
const query = reactive<{ keyword: string; type: SourceType | ''; status: SourceStatus | '' }>({
  keyword: '',
  type: '',
  status: '',
})

const filteredList = computed(() => {
  const keyword = query.keyword.trim().toLowerCase()
  return store.datasources.filter((item) => {
    if (query.type && item.type !== query.type) return false
    if (query.status && item.status !== query.status) return false
    if (!keyword) return true
    return [item.name, item.owner, item.address, item.description].join(' ').toLowerCase().includes(keyword)
  })
})

const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

const reset = () => {
  query.keyword = ''
  query.type = ''
  query.status = ''
  page.value = 1
}

const test = (row: Datasource) => {
  store.testDatasource(row.id)
  ElMessage.success(`${row.name} 连接测试成功`)
}

const remove = (row: Datasource) => {
  ElMessageBox.confirm(`确认删除数据源“${row.name}”吗？`, '删除确认', { type: 'warning' }).then(() => {
    store.deleteDatasource(row.id)
    ElMessage.success('删除成功')
  })
}
</script>
