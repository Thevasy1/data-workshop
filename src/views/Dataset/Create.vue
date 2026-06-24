<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">创建数据集</span>
      <el-button @click="handleCancel">返回</el-button>
    </div>

    <el-steps :active="activeStep" finish-status="success" class="steps">
      <el-step title="选择数据源" />
      <el-step title="配置采集规则" />
      <el-step title="确认创建" />
    </el-steps>

    <el-card>
      <div v-if="activeStep === 0">
        <el-form ref="basicFormRef" :model="form" :rules="basicRules" label-width="120px">
          <el-form-item label="选择数据源" prop="datasourceId">
            <el-select
              v-model="form.datasourceId"
              placeholder="请选择数据源"
              filterable
              style="width: 420px"
            >
              <el-option
                v-for="item in datasourceOptions"
                :key="item.id"
                :label="`${item.name}（${datasourceTypeMap[item.type]}）`"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="数据集名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入数据集名称" style="width: 420px" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input
              v-model="form.description"
              type="textarea"
              placeholder="请输入描述"
              style="width: 420px"
            />
          </el-form-item>
        </el-form>
      </div>

      <div v-if="activeStep === 1">
        <el-form label-width="120px">
          <template v-if="datasourceType === 'api'">
            <el-form-item label="请求方式">
              <el-radio-group v-model="form.collectRules.sourceOptions.method">
                <el-radio value="GET">GET</el-radio>
                <el-radio value="POST">POST</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="form.collectRules.sourceOptions.method === 'POST'" label="请求体">
              <el-input
                v-model="form.collectRules.sourceOptions.requestBody"
                type="textarea"
                placeholder='{"page": 1, "pageSize": 100}'
              />
            </el-form-item>
          </template>

          <template v-if="datasourceType === 'database'">
            <el-form-item label="SQL语句">
              <el-input
                v-model="form.collectRules.sourceOptions.sql"
                type="textarea"
                placeholder="SELECT * FROM table_name"
              />
            </el-form-item>
          </template>

          <template v-if="datasourceType === 'upload'">
            <el-form-item label="文件格式">
              <el-select v-model="form.collectRules.sourceOptions.fileFormat" placeholder="请选择格式">
                <el-option label="CSV" value="csv" />
                <el-option label="Excel" value="excel" />
                <el-option label="JSON" value="json" />
              </el-select>
            </el-form-item>
          </template>

          <template v-if="datasourceType === 'web'">
            <el-form-item label="抓取URL">
              <el-input v-model="form.collectRules.sourceOptions.url" placeholder="https://example.com/list" />
            </el-form-item>
            <el-form-item label="页面选择器">
              <el-input v-model="form.collectRules.sourceOptions.selector" placeholder=".list-item" />
            </el-form-item>
          </template>

          <el-divider content-position="left">字段映射</el-divider>
          <div class="rule-table">
            <div v-for="(item, index) in form.collectRules.fieldMappings" :key="index" class="rule-row">
              <el-select v-model="item.source" placeholder="源字段" filterable>
                <el-option v-for="field in datasourceFields" :key="field.name" :label="field.name" :value="field.name" />
              </el-select>
              <el-input v-model="item.target" placeholder="目标字段名" />
              <el-button :disabled="form.collectRules.fieldMappings.length === 1" @click="removeMapping(index)">
                删除
              </el-button>
            </div>
            <el-button type="primary" plain @click="addMapping">添加字段映射</el-button>
          </div>

          <el-divider content-position="left">过滤条件</el-divider>
          <div class="rule-table">
            <div v-for="(item, index) in form.collectRules.filters" :key="index" class="rule-row">
              <el-select v-model="item.field" placeholder="字段" filterable>
                <el-option v-for="field in datasourceFields" :key="field.name" :label="field.name" :value="field.name" />
              </el-select>
              <el-select v-model="item.operator" placeholder="条件">
                <el-option label="等于" value="=" />
                <el-option label="不等于" value="!=" />
                <el-option label="大于" value=">" />
                <el-option label="小于" value="<" />
                <el-option label="包含" value="contains" />
              </el-select>
              <el-input v-model="item.value" placeholder="值" />
              <el-button @click="removeFilter(index)">删除</el-button>
            </div>
            <el-button type="primary" plain @click="addFilter">添加过滤条件</el-button>
          </div>

          <el-divider content-position="left">采集计划</el-divider>
          <el-form-item label="执行方式">
            <el-radio-group v-model="form.collectRules.schedule">
              <el-radio value="manual">手动</el-radio>
              <el-radio value="daily">每日</el-radio>
              <el-radio value="weekly">每周</el-radio>
              <el-radio value="cron">Cron</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="form.collectRules.schedule === 'cron'" label="Cron表达式">
            <el-input v-model="form.collectRules.cron" placeholder="0 0 * * *" />
          </el-form-item>
        </el-form>
      </div>

      <div v-if="activeStep === 2">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="数据集名称">{{ form.name }}</el-descriptions-item>
          <el-descriptions-item label="数据源">{{ selectedDatasource?.name }}</el-descriptions-item>
          <el-descriptions-item label="数据源类型">{{ datasourceTypeMap[datasourceType] }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ form.description || '无' }}</el-descriptions-item>
          <el-descriptions-item label="采集计划">{{ scheduleMap[form.collectRules.schedule] }}</el-descriptions-item>
        </el-descriptions>

        <el-table :data="form.collectRules.fieldMappings" border class="confirm-table">
          <el-table-column prop="source" label="源字段" />
          <el-table-column prop="target" label="目标字段" />
        </el-table>
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
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import datasetApi from '@/api/dataset'
import type {
  CreateDatasetPayload,
  DatasetField,
  DatasetSchedule,
  DatasourceOption,
  DatasourceType,
} from '@/api/dataset'

const router = useRouter()
const activeStep = ref(0)
const basicFormRef = ref<FormInstance>()
const datasourceOptions = ref<DatasourceOption[]>([])
const datasourceFields = ref<DatasetField[]>([])

const form = ref<CreateDatasetPayload>({
  datasourceId: '',
  name: '',
  description: '',
  collectRules: {
    fieldMappings: [{ source: '', target: '' }],
    filters: [],
    schedule: 'manual',
    cron: '',
    sourceOptions: {
      method: 'GET',
      fileFormat: 'csv',
      sql: '',
      url: '',
      selector: '',
      requestBody: '',
    },
  },
})

const datasourceTypeMap: Record<DatasourceType, string> = {
  api: 'API接口',
  upload: '本地上传',
  database: '数据库',
  web: 'Web页面抓取',
}

const scheduleMap: Record<DatasetSchedule, string> = {
  manual: '手动',
  daily: '每日',
  weekly: '每周',
  cron: 'Cron',
}

const basicRules: FormRules = {
  datasourceId: [{ required: true, message: '请选择数据源', trigger: 'change' }],
  name: [{ required: true, message: '请输入数据集名称', trigger: 'blur' }],
}

const selectedDatasource = computed(() => {
  return datasourceOptions.value.find((item) => item.id === form.value.datasourceId)
})

const datasourceType = computed<DatasourceType>(() => selectedDatasource.value?.type || 'api')

const loadDatasourceFields = async (datasourceId: string) => {
  if (!datasourceId) {
    datasourceFields.value = []
    return
  }

  datasourceFields.value = await datasetApi.getDatasourceFields(datasourceId)
  form.value.collectRules.fieldMappings = datasourceFields.value.slice(0, 3).map((field) => ({
    source: field.name,
    target: field.description || field.name,
  }))
}

const addMapping = () => {
  form.value.collectRules.fieldMappings.push({ source: '', target: '' })
}

const removeMapping = (index: number) => {
  form.value.collectRules.fieldMappings.splice(index, 1)
}

const addFilter = () => {
  form.value.collectRules.filters.push({ field: '', operator: '=', value: '' })
}

const removeFilter = (index: number) => {
  form.value.collectRules.filters.splice(index, 1)
}

const validateRules = () => {
  const validMappings = form.value.collectRules.fieldMappings.filter((item) => item.source && item.target)
  if (!validMappings.length) {
    ElMessage.warning('请至少配置一个字段映射')
    return false
  }

  if (datasourceType.value === 'database' && !form.value.collectRules.sourceOptions.sql) {
    ElMessage.warning('请输入SQL语句')
    return false
  }

  if (datasourceType.value === 'web' && !form.value.collectRules.sourceOptions.url) {
    ElMessage.warning('请输入抓取URL')
    return false
  }

  if (form.value.collectRules.schedule === 'cron' && !form.value.collectRules.cron) {
    ElMessage.warning('请输入Cron表达式')
    return false
  }

  form.value.collectRules.fieldMappings = validMappings
  form.value.collectRules.filters = form.value.collectRules.filters.filter((item) => item.field && item.operator && item.value)
  return true
}

const handleNext = async () => {
  if (activeStep.value === 0) {
    const valid = await basicFormRef.value?.validate()
    if (!valid) return
  }

  if (activeStep.value === 1 && !validateRules()) return

  activeStep.value += 1
}

const handleSubmit = async () => {
  try {
    await datasetApi.create(form.value)
    ElMessage.success('创建成功')
    router.push('/dataset/list')
  } catch (e) {
    console.error(e)
  }
}

const handleCancel = () => {
  router.back()
}

watch(() => form.value.datasourceId, loadDatasourceFields)

onMounted(async () => {
  datasourceOptions.value = await datasetApi.getDatasourceOptions()
})
</script>

<style scoped>
.steps {
  margin-bottom: 30px;
}

.rule-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.rule-row {
  display: grid;
  grid-template-columns: minmax(160px, 1fr) minmax(160px, 1fr) minmax(140px, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.rule-row:has(> .el-input:nth-child(2):last-of-type) {
  grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) auto;
}

.confirm-table {
  margin-top: 20px;
}

.step-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .rule-row {
    grid-template-columns: 1fr;
  }

  .rule-row:has(> .el-input:nth-child(2):last-of-type) {
    grid-template-columns: 1fr;
  }
}
</style>
