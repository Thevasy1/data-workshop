<template>
  <el-tag :type="tagType" :size="size">
    {{ tagLabel }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type TagType = 'success' | 'warning' | 'danger' | 'info' | 'primary'

const props = withDefaults(
  defineProps<{
    status: string
    type?: 'collect' | 'preprocess' | 'datasource'
    size?: 'large' | 'default' | 'small'
  }>(),
  {
    type: 'collect',
    size: 'default',
  }
)

const statusMap: Record<string, Record<string, { label: string; type: TagType }>> = {
  collect: {
    pending: { label: '待采集', type: 'info' },
    running: { label: '采集中', type: 'warning' },
    success: { label: '采集成功', type: 'success' },
    failed: { label: '采集失败', type: 'danger' },
    paused: { label: '已暂停', type: 'info' },
  },
  preprocess: {
    pending: { label: '待处理', type: 'info' },
    running: { label: '处理中', type: 'warning' },
    success: { label: '处理成功', type: 'success' },
    failed: { label: '处理失败', type: 'danger' },
  },
  datasource: {
    draft: { label: '草稿', type: 'info' },
    active: { label: '启用', type: 'success' },
    inactive: { label: '停用', type: 'info' },
    failed: { label: '异常', type: 'danger' },
  },
}

const tagLabel = computed(() => statusMap[props.type][props.status]?.label || props.status)
const tagType = computed(() => statusMap[props.type][props.status]?.type || 'info')
</script>
