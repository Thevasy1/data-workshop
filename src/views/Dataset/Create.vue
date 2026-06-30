<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">创建数据集</span>
    </div>

    <el-steps :active="activeStep" finish-status="success" style="margin-bottom: 30px">
      <el-step title="选择数据源" />
      <el-step title="配置参数" />
      <el-step title="确认创建" />
    </el-steps>

    <el-card>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <template v-if="activeStep === 0">
          <el-form-item label="选择数据源" prop="datasourceId">
            <el-select v-model="form.datasourceId" placeholder="请选择数据源" style="width: 400px">
              <el-option v-for="item in datasourceOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="数据集名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入数据集名称" style="width: 400px" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="form.description" type="textarea" placeholder="请输入描述" style="width: 400px" />
          </el-form-item>
        </template>

        <template v-if="activeStep === 1">
          <el-form-item label="请求方式" v-if="datasourceType === 'api'">
            <el-radio-group v-model="form.config.method">
              <el-radio label="GET">GET</el-radio>
              <el-radio label="POST">POST</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="SQL 语句" v-if="datasourceType === 'database'">
            <el-input v-model="form.config.sql" type="textarea" placeholder="SELECT * FROM table" />
          </el-form-item>
          <el-form-item label="文件格式" v-if="datasourceType === 'upload'">
            <el-select v-model="form.config.fileFormat" placeholder="请选择格式">
              <el-option label="CSV" value="csv" />
              <el-option label="Excel" value="excel" />
              <el-option label="JSON" value="json" />
            </el-select>
          </el-form-item>
          <el-form-item label="抓取 URL" v-if="datasourceType === 'web'">
            <el-input v-model="form.config.url" placeholder="请输入要抓取的页面 URL" />
          </el-form-item>
        </template>
      </el-form>

      <div v-if="activeStep === 2">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="数据集名称">{{ form.name }}</el-descriptions-item>
          <el-descriptions-item label="数据源">{{ selectedDatasourceName }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ form.description || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="step-actions">
        <el-button v-if="activeStep > 0" @click="activeStep--">上一步</el-button>
        <el-button v-if="activeStep < 2" type="primary" @click="handleNext">下一步</el-button>
        <el-button v-if="activeStep === 2" type="primary" @click="handleSubmit">确认创建</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import datasetApi from '@/api/dataset'
import type { DatasourceOption } from '@/api/dataset'

const router = useRouter()
const activeStep = ref(0)
const formRef = ref<FormInstance>()
const datasourceOptions = ref<DatasourceOption[]>([])

const form = ref({
  datasourceId: '',
  name: '',
  description: '',
  config: {
    method: 'GET',
    sql: '',
    fileFormat: 'csv',
    url: '',
  },
})

const rules: FormRules = {
  datasourceId: [{ required: true, message: '请选择数据源', trigger: 'change' }],
  name: [{ required: true, message: '请输入数据集名称', trigger: 'blur' }],
}

const selectedDatasource = computed(() => datasourceOptions.value.find((item) => item.id === form.value.datasourceId))
const selectedDatasourceName = computed(() => selectedDatasource.value?.name || '')
const datasourceType = computed(() => selectedDatasource.value?.type || 'api')

const handleNext = async () => {
  if (activeStep.value === 0) {
    const valid = await formRef.value?.validate()
    if (!valid) return
  }
  activeStep.value += 1
}

const handleSubmit = async () => {
  await datasetApi.create(form.value)
  ElMessage.success('创建成功')
  router.push('/dataset/list')
}

onMounted(async () => {
  datasourceOptions.value = await datasetApi.getDatasourceOptions()
})
</script>

<style scoped>
.step-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}
</style>
