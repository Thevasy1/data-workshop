<template>
  <el-form ref="formRef" :model="config" :rules="rules" label-width="120px">
    <el-form-item label="允许格式" prop="fileFormat">
      <el-select v-model="config.fileFormat" multiple placeholder="请选择允许的文件格式">
        <el-option label="CSV" value="csv" />
        <el-option label="JSON" value="json" />
        <el-option label="Excel" value="excel" />
        <el-option label="TXT" value="txt" />
      </el-select>
    </el-form-item>
    <el-form-item label="最大文件大小">
      <el-input-number v-model="config.maxSize" :min="1" :step="10" />
      <el-select v-model="config.maxSizeUnit" class="unit-select">
        <el-option label="MB" value="MB" />
        <el-option label="GB" value="GB" />
      </el-select>
    </el-form-item>
    <el-form-item label="文件编码">
      <el-select v-model="config.encoding" placeholder="请选择编码">
        <el-option label="UTF-8" value="utf-8" />
        <el-option label="GBK" value="gbk" />
        <el-option label="Latin1" value="latin1" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="config.fileFormat?.includes('csv')" label="分隔符">
      <el-input v-model="config.delimiter" placeholder="默认逗号 ," clearable style="max-width: 200px" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import type { UploadConfig } from '@/api/datasource'

const props = defineProps<{ config: UploadConfig }>()

const config = ref(props.config)
watch(() => props.config, (v) => { config.value = v })

const formRef = ref<FormInstance>()

const rules = {
  fileFormat: [{ required: true, message: '请至少选择一种文件格式', trigger: 'change', type: 'array' }],
}

const validate = () => formRef.value?.validate()
defineExpose({ validate })
</script>

<style scoped>
.unit-select {
  width: 90px;
  margin-left: 8px;
}
</style>
