<template>
  <el-form ref="formRef" :model="config" :rules="rules" label-width="120px">
    <el-form-item label="数据库类型" prop="dbType">
      <el-select v-model="config.dbType" placeholder="请选择数据库类型">
        <el-option label="MySQL" value="mysql" />
        <el-option label="PostgreSQL" value="postgresql" />
        <el-option label="MongoDB" value="mongodb" />
        <el-option label="SQL Server" value="sqlserver" />
        <el-option label="Oracle" value="oracle" />
      </el-select>
    </el-form-item>
    <el-form-item label="主机地址" prop="host">
      <el-input v-model="config.host" placeholder="192.168.1.100" clearable />
    </el-form-item>
    <el-form-item label="端口" prop="port">
      <el-input-number v-model="config.port" :min="1" :max="65535" controls-position="right" />
    </el-form-item>
    <el-form-item label="用户名" prop="username">
      <el-input v-model="config.username" placeholder="请输入用户名" clearable />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input
        v-model="config.password"
        type="password"
        show-password
        placeholder="编辑时留空表示不修改密码"
        clearable
      />
    </el-form-item>
    <el-form-item label="数据库名" prop="dbName">
      <el-input v-model="config.dbName" placeholder="请输入数据库名" clearable />
    </el-form-item>
    <el-form-item label="表名" prop="tableName">
      <el-input v-model="config.tableName" placeholder="请输入表名" clearable />
    </el-form-item>
    <el-form-item label="字符集">
      <el-input v-model="config.charset" placeholder="如 utf8mb4" clearable style="max-width: 200px" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance } from 'element-plus'
import type { DatabaseConfig } from '@/api/datasource'

const props = defineProps<{ config: DatabaseConfig }>()

const config = ref(props.config)
watch(() => props.config, (v) => { config.value = v })

const formRef = ref<FormInstance>()

const rules = {
  dbType: [{ required: true, message: '请选择数据库类型', trigger: 'change' }],
  host: [{ required: true, message: '请输入主机地址', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  dbName: [{ required: true, message: '请输入数据库名', trigger: 'blur' }],
  tableName: [{ required: true, message: '请输入表名', trigger: 'blur' }],
}

const validate = () => formRef.value?.validate()
defineExpose({ validate })
</script>
