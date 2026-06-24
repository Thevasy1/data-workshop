<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">新建预处理任务</span>
    </div>

    <el-card style="max-width: 840px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="130px">

        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入任务名称" />
        </el-form-item>

        <el-form-item label="源数据集" prop="datasetId">
          <el-select v-model="form.datasetId" placeholder="请选择数据集" style="width: 100%" @change="handleDatasetChange">
            <el-option
              v-for="item in datasetOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="源版本" prop="versionId" v-if="form.datasetId">
          <el-select v-model="form.versionId" placeholder="请选择版本" style="width: 100%">
            <el-option
              v-for="item in versionOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="输出版本描述" prop="outputVersionDesc">
          <el-input v-model="form.outputVersionDesc" placeholder="例：清洗去重标准化后版本" />
        </el-form-item>

        <el-form-item label="处理方式" prop="processTypes">
          <el-checkbox-group v-model="form.processTypes">
            <el-checkbox label="clean">数据清洗</el-checkbox>
            <el-checkbox label="dedup">数据去重</el-checkbox>
            <el-checkbox label="normalize">标准化</el-checkbox>
            <el-checkbox label="format">格式转换</el-checkbox>
          </el-checkbox-group>
          <div class="form-hint" v-if="form.processTypes.length > 0">
            系统将按选中顺序依次执行：{{ form.processTypes.join(' → ') }}
          </div>
        </el-form-item>

        <!-- 清洗配置 -->
        <template v-if="form.processTypes.includes('clean')">
          <el-divider content-position="left">数据清洗配置</el-divider>
          <el-form-item label="空值处理">
            <el-radio-group v-model="form.config.clean!.nullStrategy">
              <el-radio label="delete">删除空值行</el-radio>
              <el-radio label="fill">填充默认值</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="异常值过滤">
            <el-switch v-model="form.config.clean!.filterOutlier" />
          </el-form-item>
          <el-form-item label="异常值规则" v-if="form.config.clean!.filterOutlier">
            <div style="width: 100%">
              <div v-for="(rule, i) in form.config.clean!.outlierRules" :key="i" class="rule-row">
                <el-input v-model="rule.field" placeholder="字段名" style="width:140px" />
                <span style="margin:0 8px;color:var(--muted)">∈</span>
                <el-input-number v-model="rule.min" :min="0" placeholder="min" style="width:120px" />
                <span style="margin:0 8px;color:var(--muted)">~</span>
                <el-input-number v-model="rule.max" :min="0" placeholder="max" style="width:120px" />
                <el-button size="small" type="danger" text @click="removeOutlierRule(i)">删除</el-button>
              </div>
              <el-button size="small" @click="addOutlierRule">+ 添加规则</el-button>
            </div>
          </el-form-item>
        </template>

        <!-- 去重配置 -->
        <template v-if="form.processTypes.includes('dedup')">
          <el-divider content-position="left">数据去重配置</el-divider>
          <el-form-item label="去重字段">
            <el-select v-model="form.config.dedup!.dedupFields" multiple placeholder="请选择去重字段" style="width: 100%">
              <el-option label="用户ID" value="user_id" />
              <el-option label="手机号" value="phone" />
              <el-option label="邮箱" value="email" />
            </el-select>
          </el-form-item>
          <el-form-item label="保留策略">
            <el-radio-group v-model="form.config.dedup!.keepStrategy">
              <el-radio label="first">保留第一条</el-radio>
              <el-radio label="last">保留最后一条</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <!-- 标准化配置 -->
        <template v-if="form.processTypes.includes('normalize')">
          <el-divider content-position="left">标准化配置</el-divider>
          <el-form-item label="标准化方式">
            <el-select v-model="form.config.normalize!.normalizeMethod" placeholder="请选择标准化方式" style="width: 100%">
              <el-option label="Z-score 标准化" value="zscore" />
              <el-option label="Min-Max 归一化" value="minmax" />
            </el-select>
          </el-form-item>
          <el-form-item label="应用字段">
            <el-select v-model="form.config.normalize!.fields" multiple placeholder="请选择要标准化的字段" style="width: 100%">
              <el-option label="年龄" value="age" />
              <el-option label="价格" value="price" />
              <el-option label="数量" value="count" />
            </el-select>
          </el-form-item>
        </template>

        <!-- 格式转换配置 -->
        <template v-if="form.processTypes.includes('format')">
          <el-divider content-position="left">格式转换配置</el-divider>
          <el-form-item label="目标格式">
            <el-select v-model="form.config.format!.targetFormat" placeholder="请选择目标格式" style="width: 100%">
              <el-option label="CSV" value="csv" />
              <el-option label="JSON" value="json" />
              <el-option label="Excel" value="excel" />
            </el-select>
          </el-form-item>
          <el-form-item label="编码" v-if="form.config.format!.targetFormat === 'csv'">
            <el-select v-model="form.config.format!.encoding" style="width: 100%">
              <el-option label="UTF-8" value="utf-8" />
              <el-option label="GBK" value="gbk" />
            </el-select>
          </el-form-item>
          <el-form-item label="分隔符" v-if="form.config.format!.targetFormat === 'csv'">
            <el-select v-model="form.config.format!.delimiter" style="width: 100%">
              <el-option label="逗号 ," value="," />
              <el-option label="制表符 \\t" value="\t" />
              <el-option label="竖线 |" value="|" />
            </el-select>
          </el-form-item>
        </template>

      </el-form>

      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import preprocessApi from '@/api/preprocess'

/* ===== 类型定义 ===== */

interface CleanConfig {
  nullStrategy: 'delete' | 'fill'
  fillValue?: string
  filterOutlier: boolean
  outlierRules: Array<{ field: string; min?: number; max?: number }>
}
interface DedupConfig {
  dedupFields: string[]
  keepStrategy: 'first' | 'last'
}
interface NormalizeConfig {
  normalizeMethod: 'zscore' | 'minmax'
  fields: string[]
}
interface FormatConfig {
  targetFormat: 'csv' | 'json' | 'excel'
  encoding: string
  delimiter: string
}

interface PreprocessForm {
  name: string
  datasetId: string
  versionId: string
  outputVersionDesc: string
  processTypes: string[]
  config: {
    clean?: CleanConfig
    dedup?: DedupConfig
    normalize?: NormalizeConfig
    format?: FormatConfig
  }
}

/* ===== 默认配置 ===== */

const defaultClean: CleanConfig = {
  nullStrategy: 'delete',
  filterOutlier: false,
  outlierRules: [],
}
const defaultDedup: DedupConfig = { dedupFields: [], keepStrategy: 'first' }
const defaultNormalize: NormalizeConfig = { normalizeMethod: 'zscore', fields: [] }
const defaultFormat: FormatConfig = { targetFormat: 'csv', encoding: 'utf-8', delimiter: ',' }

/* ===== 响应式状态 ===== */

const router = useRouter()
const formRef = ref()

const datasetOptions = ref<{ id: string; name: string }[]>([])
const versionOptions = ref<{ id: string; name: string; recordCount: number }[]>([])

const form = ref<PreprocessForm>({
  name: '',
  datasetId: '',
  versionId: '',
  outputVersionDesc: '',
  processTypes: [],
  config: {},
})

/* ===== 计算属性 ===== */

const selectedCount = computed(() => form.value.processTypes.length)

/* ===== 方法 ===== */

/** 切换数据集时加载对应版本列表 */
const handleDatasetChange = async (datasetId: string) => {
  form.value.versionId = ''
  if (!datasetId) {
    versionOptions.value = []
    return
  }
  try {
    versionOptions.value = await preprocessApi.getDatasetVersions(datasetId)
  } catch {
    versionOptions.value = []
  }
}

const addOutlierRule = () => {
  form.value.config.clean!.outlierRules.push({ field: '', min: undefined, max: undefined })
}

const removeOutlierRule = (index: number) => {
  form.value.config.clean!.outlierRules.splice(index, 1)
}

/** 同步 config：根据 processTypes 动态添加/移除配置段 */
const syncConfig = () => {
  const types = form.value.processTypes
  const cfg = form.value.config

  if (types.includes('clean') && !cfg.clean) cfg.clean = { ...defaultClean, outlierRules: [] }
  if (!types.includes('clean') && cfg.clean) delete cfg.clean

  if (types.includes('dedup') && !cfg.dedup) cfg.dedup = { ...defaultDedup }
  if (!types.includes('dedup') && cfg.dedup) delete cfg.dedup

  if (types.includes('normalize') && !cfg.normalize) cfg.normalize = { ...defaultNormalize }
  if (!types.includes('normalize') && cfg.normalize) delete cfg.normalize

  if (types.includes('format') && !cfg.format) cfg.format = { ...defaultFormat }
  if (!types.includes('format') && cfg.format) delete cfg.format
}

/** 校验规则 */
const rules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  datasetId: [{ required: true, message: '请选择源数据集', trigger: 'change' }],
  versionId: [{ required: true, message: '请选择源版本', trigger: 'change' }],
  processTypes: [
    {
      type: 'array' as const,
      required: true,
      min: 1,
      message: '请至少选择一种处理方式',
      trigger: 'change',
    },
  ],
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  try {
    /* 根据选中的 processTypes 裁剪 config，只提交选中类型的配置 */
    const payload: Record<string, any> = {
      name: form.value.name,
      datasetId: form.value.datasetId,
      versionId: form.value.versionId,
      processTypes: form.value.processTypes,
      config: {},
    }
    if (form.value.outputVersionDesc) payload.outputVersionDesc = form.value.outputVersionDesc

    for (const type of form.value.processTypes) {
      ;(payload.config as any)[type] = form.value.config[type as keyof typeof form.value.config]
    }

    await preprocessApi.create(payload as any)
    ElMessage.success('创建成功')
    router.push('/preprocess/list')
  } catch (e) {
    console.error(e)
  }
}

const handleCancel = () => {
  router.back()
}

onMounted(async () => {
  const res = await preprocessApi.getAvailableDatasets()
  datasetOptions.value = res
})
</script>

<style scoped>
.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 24px;
}
.form-hint {
  margin-top: 6px;
  font-size: 13px;
  color: var(--muted);
}
.rule-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
</style>
