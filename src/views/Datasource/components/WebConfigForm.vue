<template>
  <el-form ref="formRef" :model="config" :rules="rules" label-width="120px">
    <el-form-item label="抓取地址" prop="url">
      <el-input v-model="config.url" placeholder="https://news.example.com" clearable />
    </el-form-item>
    <el-form-item label="CSS 选择器" prop="selector">
      <el-input v-model="config.selector" placeholder=".article-list .title" clearable />
    </el-form-item>
    <el-form-item label="抓取频率" prop="crawlFrequency">
      <el-select v-model="config.crawlFrequency" placeholder="请选择抓取频率">
        <el-option label="仅一次" value="once" />
        <el-option label="每小时" value="hourly" />
        <el-option label="每天" value="daily" />
        <el-option label="每周" value="weekly" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="config.crawlFrequency !== 'once'" label="Cron 表达式">
      <el-input v-model="config.cron" placeholder="0 0 * * *" clearable style="max-width: 240px" />
    </el-form-item>
    <el-form-item label="User-Agent">
      <el-input v-model="config.userAgent" placeholder="默认浏览器 UA" clearable />
    </el-form-item>
    <el-form-item label="超时时间(秒)">
      <el-input-number v-model="config.timeout" :min="1" :step="5" />
    </el-form-item>
    <el-form-item label="最大页数">
      <el-input-number v-model="config.maxPages" :min="1" :step="1" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import type { WebConfig } from '@/api/datasource'

const props = defineProps<{ config: WebConfig }>()

const config = ref(props.config)
watch(() => props.config, (v) => { config.value = v })

const formRef = ref<FormInstance>()

const rules = {
  url: [{ required: true, message: '请输入抓取地址', trigger: 'blur' }],
  selector: [{ required: true, message: '请输入 CSS 选择器', trigger: 'blur' }],
  crawlFrequency: [{ required: true, message: '请选择抓取频率', trigger: 'change' }],
}

const validate = () => formRef.value?.validate()
defineExpose({ validate })
</script>
