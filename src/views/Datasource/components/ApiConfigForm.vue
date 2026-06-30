<template>
  <el-form ref="formRef" :model="config" :rules="rules" label-width="120px">
    <el-form-item label="请求地址" prop="url">
      <el-input v-model="config.url" placeholder="https://api.example.com/events" clearable />
    </el-form-item>
    <el-form-item label="请求方法" prop="method">
      <el-select v-model="config.method" placeholder="请选择请求方法">
        <el-option label="GET" value="GET" />
        <el-option label="POST" value="POST" />
        <el-option label="PUT" value="PUT" />
        <el-option label="DELETE" value="DELETE" />
      </el-select>
    </el-form-item>
    <el-form-item label="认证方式" prop="authType">
      <el-select v-model="config.authType" placeholder="请选择认证方式">
        <el-option label="无" value="none" />
        <el-option label="Bearer Token" value="bearer" />
        <el-option label="Basic Auth" value="basic" />
        <el-option label="API Key" value="api-key" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="config.authType !== 'none'" label="认证凭证" prop="authValue">
      <el-input v-model="config.authValue" placeholder="请输入 Token / 用户名密码 / API Key" clearable />
    </el-form-item>
    <el-form-item label="请求头">
      <KeyValueEditor v-model="config.headers" />
    </el-form-item>
    <el-form-item label="请求参数">
      <KeyValueEditor v-model="config.params" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import KeyValueEditor from './KeyValueEditor.vue'
import type { ApiConfig } from '@/api/datasource'

const props = defineProps<{ config: ApiConfig }>()

// 持有 config 引用，编辑回显父组件替换对象时重新同步
const config = ref(props.config)
watch(() => props.config, (v) => { config.value = v })

const formRef = ref<FormInstance>()

const rules = {
  url: [{ required: true, message: '请输入请求地址', trigger: 'blur' }],
  method: [{ required: true, message: '请选择请求方法', trigger: 'change' }],
  authType: [{ required: true, message: '请选择认证方式', trigger: 'change' }],
}

const validate = () => formRef.value?.validate()
defineExpose({ validate })
</script>
