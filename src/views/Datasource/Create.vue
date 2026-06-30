<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">{{ isEdit ? '编辑数据源' : '新增数据源' }}</span>
    </div>

    <el-card v-loading="loading" style="max-width: 820px">
      <!-- 基础信息区 -->
      <div class="section-title">基础信息</div>
      <CommonForm
        ref="baseFormRef"
        :model="form"
        :fields="baseFields"
        :rules="baseRules"
        label-width="120px"
      />

      <!-- 动态配置区 -->
      <div class="section-title">数据源配置</div>
      <ApiConfigForm v-if="form.type === 'api'" ref="apiRef" :config="form.config.api!" />
      <UploadConfigForm
        v-else-if="form.type === 'upload'"
        ref="uploadRef"
        :config="form.config.upload!"
      />
      <DatabaseConfigForm
        v-else-if="form.type === 'database'"
        ref="dbRef"
        :config="form.config.database!"
      />
      <WebConfigForm v-else-if="form.type === 'web'" ref="webRef" :config="form.config.web!" />

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
        <el-button type="success" :loading="testing" @click="handleSaveAndTest">
          保存并测试
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </el-card>

    <!-- 测试结果弹窗 -->
    <el-dialog v-model="testDialogVisible" title="连接测试结果" width="600px">
      <div v-if="testResult">
        <el-alert
          :title="testResult.message"
          :type="testResult.success ? 'success' : 'error'"
          :closable="false"
          show-icon
        />
        <el-table
          v-if="testResult.success && testResult.sampleData && testResult.sampleData.length"
          :data="testResult.sampleData"
          border
          max-height="300"
          style="margin-top: 16px"
        >
          <el-table-column
            v-for="col in sampleColumns"
            :key="col"
            :prop="col"
            :label="col"
            min-width="120"
          />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import CommonForm from '@/components/CommonForm.vue'
import ApiConfigForm from './components/ApiConfigForm.vue'
import UploadConfigForm from './components/UploadConfigForm.vue'
import DatabaseConfigForm from './components/DatabaseConfigForm.vue'
import WebConfigForm from './components/WebConfigForm.vue'
import datasourceApi from '@/api/datasource'
import type {
  DatasourceFormData,
  ApiConfig,
  UploadConfig,
  DatabaseConfig,
  WebConfig,
  TestConnectionResult,
} from '@/api/datasource'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)

// 默认配置工厂函数（避免引用污染）
const defaultApiConfig = (): ApiConfig => ({
  url: '',
  method: 'GET',
  headers: [],
  params: [],
  authType: 'none',
  authValue: '',
})
const defaultUploadConfig = (): UploadConfig => ({
  fileFormat: [],
  maxSize: 100,
  maxSizeUnit: 'MB',
  encoding: 'utf-8',
  delimiter: ',',
})
const defaultDatabaseConfig = (): DatabaseConfig => ({
  dbType: 'mysql',
  host: '',
  port: 3306,
  username: '',
  password: '',
  dbName: '',
  tableName: '',
  charset: 'utf8mb4',
})
const defaultWebConfig = (): WebConfig => ({
  url: '',
  selector: '',
  crawlFrequency: 'daily',
  cron: '0 0 * * *',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  timeout: 30,
  maxPages: 10,
})

const form = reactive<DatasourceFormData>({
  name: '',
  type: 'api',
  description: '',
  config: {
    api: defaultApiConfig(),
    upload: defaultUploadConfig(),
    database: defaultDatabaseConfig(),
    web: defaultWebConfig(),
  },
})

type BaseField = {
  prop: string
  label: string
  type: 'input' | 'select' | 'textarea'
  placeholder?: string
  options?: { label: string; value: string }[]
}

const baseFields: BaseField[] = [
  { prop: 'name', label: '名称', type: 'input', placeholder: '请输入数据源名称' },
  {
    prop: 'type',
    label: '类型',
    type: 'select',
    placeholder: '请选择数据源类型',
    options: [
      { label: 'API接口', value: 'api' },
      { label: '本地上传', value: 'upload' },
      { label: '数据库', value: 'database' },
      { label: 'Web页面抓取', value: 'web' },
    ],
  },
  { prop: 'description', label: '描述', type: 'textarea', placeholder: '请输入描述' },
]

const baseRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
}

// refs
const baseFormRef = ref()
const apiRef = ref()
const uploadRef = ref()
const dbRef = ref()
const webRef = ref()

const loading = ref(false)
const saving = ref(false)
const testing = ref(false)

// 当前激活的子组件实例（用于校验）
const currentConfigRef = computed(() => {
  switch (form.type) {
    case 'api':
      return apiRef.value
    case 'upload':
      return uploadRef.value
    case 'database':
      return dbRef.value
    case 'web':
      return webRef.value
    default:
      return undefined
  }
})

// 当前 config 值
const currentConfig = computed(() => form.config[form.type] as Record<string, any>)

// 校验基础信息 + 当前配置
const validateAll = async (): Promise<boolean> => {
  try {
    await baseFormRef.value?.validate()
  } catch {
    return false
  }
  const instance = currentConfigRef.value
  if (instance?.validate) {
    try {
      await instance.validate()
    } catch {
      return false
    }
  }
  return true
}

// 组装提交体（按 API 文档 1.3 结构）
const buildPayload = (): DatasourceFormData => {
  const configValue: Record<string, any> = { ...currentConfig.value }
  // database 类型：密码留空时提交体不带 password
  if (form.type === 'database' && !configValue.password) {
    delete configValue.password
  }
  return {
    name: form.name,
    type: form.type,
    description: form.description,
    config: { [form.type]: configValue } as DatasourceFormData['config'],
  }
}

// 保存
const handleSubmit = async () => {
  if (!(await validateAll())) return
  saving.value = true
  try {
    const payload = buildPayload()
    if (isEdit.value) {
      await datasourceApi.update(route.params.id as string, payload)
      ElMessage.success('更新成功')
    } else {
      await datasourceApi.create(payload)
      ElMessage.success('创建成功')
    }
    router.push('/datasource/list')
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

// 保存并测试（先保存再测试，弹窗展示结果）
const testDialogVisible = ref(false)
const testResult = ref<TestConnectionResult | null>(null)
const sampleColumns = computed(() => {
  if (!testResult.value?.sampleData?.length) return []
  return Object.keys(testResult.value.sampleData[0])
})

const handleSaveAndTest = async () => {
  if (!(await validateAll())) return
  testing.value = true
  try {
    const payload = buildPayload()
    // 1. 先保存
    if (isEdit.value) {
      await datasourceApi.update(route.params.id as string, payload)
    } else {
      await datasourceApi.create(payload)
    }
    ElMessage.success('保存成功，正在测试连接...')
    // 2. 再测试（请求体只含 type + config）
    const testPayload = {
      type: form.type,
      config: { [form.type]: { ...currentConfig.value } },
    } as Partial<DatasourceFormData>
    const res = (await datasourceApi.testConnection(testPayload)) as unknown as TestConnectionResult
    testResult.value = res
    testDialogVisible.value = true
  } catch (e) {
    console.error(e)
  } finally {
    testing.value = false
  }
}

const handleCancel = () => {
  router.back()
}

// 编辑回显
onMounted(async () => {
  if (!isEdit.value) return
  loading.value = true
  try {
    const res = (await datasourceApi.getDetail(route.params.id as string)) as any
    form.name = res.name
    form.type = res.type
    form.description = res.description
    // 按 type 回填 config（文档 1.10）
    const typeKey = res.type as keyof typeof form.config
    if (res.config && res.config[typeKey]) {
      form.config[typeKey] = res.config[typeKey]
    }
    // database 密码留空占位
    if (res.type === 'database' && form.config.database) {
      form.config.database.password = ''
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.section-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}
.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
