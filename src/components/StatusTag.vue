<template>
  <el-tag :type="tagType" effect="dark" round>
    <span class="tag-dot">{{ label }}</span>
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const statusMap: Record<string, { label: string; type: 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
  connected: { label: '连接正常', type: 'success' },
  warning: { label: '连接波动', type: 'warning' },
  offline: { label: '离线', type: 'danger' },
  pending: { label: '待执行', type: 'info' },
  running: { label: '执行中', type: 'primary' },
  success: { label: '已完成', type: 'success' },
  failed: { label: '失败', type: 'danger' },
  paused: { label: '已暂停', type: 'warning' },
  waiting: { label: '等待中', type: 'info' },
}

const option = computed(() => statusMap[props.status] || { label: props.status, type: 'info' })
const label = computed(() => option.value.label)
const tagType = computed(() => option.value.type)
</script>

<style scoped>
.tag-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tag-dot::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 10px currentColor;
}
</style>
