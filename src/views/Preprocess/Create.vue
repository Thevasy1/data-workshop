<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">新建预处理任务</span>
    </div>

    <el-card style="max-width: 800px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入任务名称" />
        </el-form-item>

        <el-form-item label="源数据集" prop="datasetId">
          <el-select v-model="form.datasetId" placeholder="请选择数据集" style="width: 100%">
            <el-option
              v-for="item in datasetOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="处理方式" prop="processType">
          <el-radio-group v-model="form.processType">
            <el-radio label="clean">数据清洗</el-radio>
            <el-radio label="dedup">数据去重</el-radio>
            <el-radio label="normalize">标准化</el-radio>
            <el-radio label="format">格式转换</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 清洗配置 -->
        <template v-if="form.processType === 'clean'">
          <el-form-item label="空值处理">
            <el-radio-group v-model="form.config.nullStrategy">
              <el-radio label="delete">删除空值行</el-radio>
              <el-radio label="fill">填充默认值</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="异常值过滤">
            <el-switch v-model="form.config.filterOutlier" />
          </el-form-item>
        </template>

        <!-- 去重配置 -->
        <template v-if="form.processType === 'dedup'">
          <el-form-item label="去重字段">
            <el-select v-model="form.config.dedupFields" multiple placeholder="请选择去重字段" style="width: 100%">
              <el-option label="用户ID" value="user_id" />
              <el-option label="手机号" value="phone" />
              <el-option label="邮箱" value="email" />
            </el-select>
          </el-form-item>
          <el-form-item label="保留策略">
            <el-radio-group v-model="form.config.keepStrategy">
              <el-radio label="first">保留第一条</el-radio>
              <el-radio label="last">保留最后一条</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <!-- 标准化配置 -->
        <template v-if="form.processType === 'normalize'">
          <el-form-item label="标准化方式">
            <el-select v-model="form.config.normalizeMethod" placeholder="请选择标准化方式" style="width: 100%">
              <el-option label="Z-score 标准化" value="zscore" />
              <el-option label="Min-Max 归一化" value="minmax" />
            </el-select>
          </el-form-item>
        </template>

        <!-- 格式转换配置 -->
        <template v-if="form.processType === 'format'">
          <el-form-item label="目标格式">
            <el-select v-model="form.config.targetFormat" placeholder="请选择目标格式" style="width: 100%">
              <el-option label="CSV" value="csv" />
              <el-option label="JSON" value="json" />
              <el-option label="Excel" value="excel" />
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
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import preprocessApi from '@/api/preprocess'

/* 各处理方式的配置类型 */
interface CleanConfig {
  nullStrategy: 'delete' | 'fill'
  filterOutlier: boolean
}
interface DedupConfig {
  dedupFields: string[]
  keepStrategy: 'first' | 'last'
}
interface NormalizeConfig {
  normalizeMethod: 'zscore' | 'minmax'
}
interface FormatConfig {
  targetFormat: 'csv' | 'json' | 'excel'
}

type ProcessConfig = CleanConfig | DedupConfig | NormalizeConfig | FormatConfig

const defaultConfigs: Record<string, ProcessConfig> = {
  clean: { nullStrategy: 'delete', filterOutlier: false },
  dedup: { dedupFields: [], keepStrategy: 'first' },
  normalize: { normalizeMethod: 'zscore' },
  format: { targetFormat: 'csv' },
}

const router = useRouter()
const formRef = ref()

const datasetOptions = ref<{ id: string; name: string }[]>([])

interface PreprocessForm {
  name: string
  datasetId: string
  processType: string
  config: ProcessConfig
}

const form = ref<PreprocessForm>({
  name: '',
  datasetId: '',
  processType: 'clean',
  config: { ...defaultConfigs.clean },
})

/* 切换处理方式时重置配置 */
watch(
  () => form.value.processType,
  (newType) => {
    form.value.config = { ...defaultConfigs[newType] }
  }
)

const rules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  datasetId: [{ required: true, message: '请选择源数据集', trigger: 'change' }],
  processType: [{ required: true, message: '请选择处理方式', trigger: 'change' }],
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  try {
    /* 只提交当前处理方式对应的配置字段 */
    const payload = {
      name: form.value.name,
      datasetId: form.value.datasetId,
      processType: form.value.processType,
      config: form.value.config,
    }
    await preprocessApi.create(payload)
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
  margin-top: 20px;
}
</style>
