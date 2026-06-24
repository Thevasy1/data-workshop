<template>
  <el-table
    v-loading="loading"
    :data="data"
    border
    stripe
    style="width: 100%"
    @selection-change="handleSelectionChange"
  >
    <el-table-column v-if="showSelection" type="selection" width="55" />
    <el-table-column
      v-for="col in columns"
      :key="col.prop"
      :prop="col.prop"
      :label="col.label"
      :width="col.width"
      :min-width="col.minWidth"
      :sortable="col.sortable"
    >
      <template #default="scope" v-if="col.slot">
        <slot :name="col.prop" :row="scope.row" :index="scope.$index" />
      </template>
    </el-table-column>
    <el-table-column v-if="showOperation" label="操作" :width="operationWidth" fixed="right">
      <template #default="scope">
        <slot name="operation" :row="scope.row" :index="scope.$index">
          <el-button type="primary" size="small" @click="$emit('edit', scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="$emit('delete', scope.row)">删除</el-button>
        </slot>
      </template>
    </el-table-column>
  </el-table>

  <div class="pagination-wrapper" v-if="showPagination">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Column {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  sortable?: boolean
  slot?: boolean
}

const props = withDefaults(
  defineProps<{
    columns: Column[]
    data: any[]
    loading?: boolean
    total?: number
    page?: number
    pageSize?: number
    showSelection?: boolean
    showOperation?: boolean
    showPagination?: boolean
    operationWidth?: string | number
  }>(),
  {
    loading: false,
    total: 0,
    page: 1,
    pageSize: 10,
    showSelection: false,
    showOperation: true,
    showPagination: true,
    operationWidth: 180,
  }
)

const emit = defineEmits<{
  (e: 'update:page', page: number): void
  (e: 'update:pageSize', pageSize: number): void
  (e: 'edit', row: any): void
  (e: 'delete', row: any): void
  (e: 'selection-change', selection: any[]): void
}>()

const currentPage = ref(props.page)
const pageSize = ref(props.pageSize)

watch(() => props.page, (val) => { currentPage.value = val })
watch(() => props.pageSize, (val) => { pageSize.value = val })

const handleSizeChange = (val: number) => {
  emit('update:pageSize', val)
}

const handleCurrentChange = (val: number) => {
  emit('update:page', val)
}

const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
