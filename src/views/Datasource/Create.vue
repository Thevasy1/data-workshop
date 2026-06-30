<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">{{ isEdit ? '编辑数据源' : '新建数据源' }}</span>
    </div>

    <el-card class="form-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" @change="resetCurrentConfig">
            <el-option label="API" value="api" />
            <el-option label="Upload" value="upload" />
            <el-option label="Database" value="database" />
            <el-option label="Web" value="web" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>

        <template v-if="form.type === 'api'">
          <el-divider content-position="left">API 配置</el-divider>
          <el-form-item label="URL">
            <el-input v-model="apiConfig.url" />
          </el-form-item>
          <el-form-item label="Method">
            <el-select v-model="apiConfig.method">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
            </el-select>
          </el-form-item>
          <el-form-item label="认证类型">
            <el-select v-model="apiConfig.authType">
              <el-option label="None" value="none" />
              <el-option label="Bearer" value="bearer" />
              <el-option label="Basic" value="basic" />
            </el-select>
          </el-form-item>
        </template>

        <template v-if="form.type === 'upload'">
          <el-divider content-position="left">上传配置</el-divider>
          <el-form-item label="文件格式">
            <el-select v-model="uploadConfig.fileFormat" multiple>
              <el-option label="CSV" value="csv" />
              <el-option label="JSON" value="json" />
              <el-option label="Excel" value="excel" />
            </el-select>
          </el-form-item>
          <el-form-item label="大小上限">
            <el-input-number v-model="uploadConfig.maxSize" :min="1" />
          </el-form-item>
        </template>

        <template v-if="form.type === 'database'">
          <el-divider content-position="left">数据库配置</el-divider>
          <el-form-item label="DB Type">
            <el-input v-model="databaseConfig.dbType" />
          </el-form-item>
          <el-form-item label="Host">
            <el-input v-model="databaseConfig.host" />
          </el-form-item>
          <el-form-item label="Port">
            <el-input-number v-model="databaseConfig.port" :min="1" />
          </el-form-item>
          <el-form-item label="DB Name">
            <el-input v-model="databaseConfig.dbName" />
          </el-form-item>
          <el-form-item label="Table">
            <el-input v-model="databaseConfig.tableName" />
          </el-form-item>
        </template>

        <template v-if="form.type === 'web'">
          <el-divider content-position="left">Web 抓取配置</el-divider>
          <el-form-item label="URL">
            <el-input v-model="webConfig.url" />
          </el-form-item>
          <el-form-item label="Selector">
            <el-input v-model="webConfig.selector" />
          </el-form-item>
          <el-form-item label="频率">
            <el-input v-model="webConfig.crawlFrequency" />
          </el-form-item>
        </template>

        <div class="form-actions">
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button type="success" @click="handleTest">保存并测试</el-button>
          <el-button @click="router.back()">取消</el-button>
        </div>
      </el-form>
    </el-card>

    <el-dialog v-model="testDialogVisible" title="连接测试" width="640px">
      <el-alert
        v-if="testResult"
        :title="testResult.message"
        :type="testResult.success ? 'success' : 'error'"
        :closable="false"
        show-icon
      />
      <el-table
        v-if="testResult?.sampleData?.length"
        :data="testResult.sampleData"
        border
        max-height="280"
        style="margin-top: 16px"
      >
        <el-table-column v-for="column in sampleColumns" :key="column" :prop="column" :label="column" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import datasourceApi, { type DatasourceFormData, type TestConnectionResult } from '@/api/datasource'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const isEdit = computed(() => Boolean(route.params.id))
const testDialogVisible = ref(false)
const testResult = ref<TestConnectionResult | null>(null)

const createDefaultForm = (): DatasourceFormData => ({
  name: '',
  type: 'api',
  description: '',
  config: {
    api: { url: '', method: 'GET', headers: [], params: [], authType: 'none' },
    upload: { fileFormat: ['csv'], maxSize: 100, maxSizeUnit: 'MB', encoding: 'utf-8', delimiter: ',' },
    database: { dbType: 'mysql', host: '', port: 3306, username: '', dbName: '', tableName: '', charset: 'utf8mb4' },
    web: { url: '', selector: '', crawlFrequency: 'daily', cron: '0 0 * * *', userAgent: 'Mozilla/5.0', timeout: 30, maxPages: 10 },
  },
})

const form = reactive<DatasourceFormData>(createDefaultForm())
const sampleColumns = computed(() => (testResult.value?.sampleData?.[0] ? Object.keys(testResult.value.sampleData[0]) : []))
const apiConfig = computed(() => form.config.api || createDefaultForm().config.api!)
const uploadConfig = computed(() => form.config.upload || createDefaultForm().config.upload!)
const databaseConfig = computed(() => form.config.database || createDefaultForm().config.database!)
const webConfig = computed(() => form.config.web || createDefaultForm().config.web!)

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
}

const resetCurrentConfig = () => {
  form.config = createDefaultForm().config
}

const buildPayload = (): DatasourceFormData => ({
  name: form.name,
  type: form.type,
  description: form.description,
  config: { [form.type]: form.config[form.type] } as DatasourceFormData['config'],
})

const saveForm = async () => {
  await formRef.value?.validate()
  if (form.type === 'api' && !form.config.api?.url) {
    throw new Error('API URL is required')
  }
  const payload = buildPayload()
  if (isEdit.value) {
    await datasourceApi.update(route.params.id as string, payload)
  } else {
    await datasourceApi.create(payload)
  }
}

const handleSubmit = async () => {
  await saveForm()
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
  router.push('/datasource/list')
}

const handleTest = async () => {
  await saveForm()
  testResult.value = await datasourceApi.testConnection({
    type: form.type,
    config: { [form.type]: form.config[form.type] },
  })
  testDialogVisible.value = true
}

onMounted(async () => {
  if (!isEdit.value) return
  const detail = await datasourceApi.getDetail(route.params.id as string)
  const next = createDefaultForm()
  Object.assign(form, next, detail, {
    config: {
      ...next.config,
      ...detail.config,
    },
  })
})
</script>

<style scoped>
.form-card {
  max-width: 860px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}
</style>
