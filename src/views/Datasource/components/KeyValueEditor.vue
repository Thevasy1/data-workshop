<template>
  <div class="kv-editor">
    <div v-for="(item, index) in modelValue" :key="index" class="kv-row">
      <el-input
        :model-value="item.key"
        placeholder="键名"
        clearable
        class="kv-input"
        @update:model-value="(val: string) => updateRow(index, 'key', val)"
      />
      <span class="kv-sep">:</span>
      <el-input
        :model-value="item.value"
        placeholder="键值"
        clearable
        class="kv-input"
        @update:model-value="(val: string) => updateRow(index, 'value', val)"
      />
      <el-button
        type="danger"
        :icon="Delete"
        circle
        size="small"
        @click="removeRow(index)"
      />
    </div>
    <el-button type="primary" link :icon="Plus" @click="addRow">
      添加一行
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue'

interface KVItem {
  key: string
  value: string
}

const props = defineProps<{
  modelValue: KVItem[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: KVItem[]): void
}>()

const updateRow = (index: number, field: 'key' | 'value', val: string) => {
  const list = [...props.modelValue]
  list[index] = { ...list[index], [field]: val }
  emit('update:modelValue', list)
}

const addRow = () => {
  emit('update:modelValue', [...props.modelValue, { key: '', value: '' }])
}

const removeRow = (index: number) => {
  const list = [...props.modelValue]
  list.splice(index, 1)
  emit('update:modelValue', list)
}
</script>

<style scoped>
.kv-editor {
  width: 100%;
}
.kv-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.kv-input {
  flex: 1;
}
.kv-sep {
  color: #909399;
  font-weight: 500;
}
</style>
