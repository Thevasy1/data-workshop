<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">新建预处理任务</span>
    </div>

    <el-card class="form-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="源数据集" prop="datasetId">
          <el-select v-model="form.datasetId" style="width: 100%" @change="loadVersions">
            <el-option v-for="item in datasetOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="源版本" prop="versionId">
          <el-select v-model="form.versionId" style="width: 100%">
            <el-option v-for="item in versionOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="输出版本描述">
          <el-input v-model="form.outputVersionDesc" />
        </el-form-item>
        <el-form-item label="处理方式" prop="processTypes">
          <el-checkbox-group v-model="form.processTypes">
            <el-checkbox label="clean">数据清洗</el-checkbox>
            <el-checkbox label="dedup">数据去重</el-checkbox>
            <el-checkbox label="normalize">标准化</el-checkbox>
            <el-checkbox label="format">格式转换</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <template v-if="form.processTypes.includes('clean')">
          <el-divider content-position="left">数据清洗配置</el-divider>
          <el-form-item label="空值策略">
            <el-radio-group v-model="cleanConfig.nullStrategy">
              <el-radio label="delete">删除空值</el-radio>
              <el-radio label="fill">默认填充</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <template v-if="form.processTypes.includes('dedup')">
          <el-divider content-position="left">数据去重配置</el-divider>
          <el-form-item label="去重字段">
            <el-select v-model="dedupConfig.dedupFields" multiple style="width: 100%">
              <el-option label="user_id" value="user_id" />
              <el-option label="email" value="email" />
            </el-select>
          </el-form-item>
        </template>

        <template v-if="form.processTypes.includes('normalize')">
          <el-divider content-position="left">标准化配置</el-divider>
          <el-form-item label="方法">
            <el-select v-model="normalizeConfig.normalizeMethod">
              <el-option label="zscore" value="zscore" />
              <el-option label="minmax" value="minmax" />
            </el-select>
          </el-form-item>
        </template>

        <template v-if="form.processTypes.includes('format')">
          <el-divider content-position="left">格式转换配置</el-divider>
          <el-form-item label="目标格式">
            <el-select v-model="formatConfig.targetFormat">
              <el-option label="csv" value="csv" />
              <el-option label="json" value="json" />
              <el-option label="excel" value="excel" />
            </el-select>
          </el-form-item>
        </template>

        <div class="form-actions">
          <el-button type="primary" @click="handleSubmit">提交</el-button>
          <el-button @click="router.back()">取消</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import preprocessApi, { type AvailableDataset, type DatasetVersionOption, type PreprocessCreatePayload } from '@/api/preprocess'

const router = useRouter()
const formRef = ref()
const datasetOptions = ref<AvailableDataset[]>([])
const versionOptions = ref<DatasetVersionOption[]>([])

type PreprocessConfigForm = {
  clean: { nullStrategy: string; filterOutlier: boolean }
  dedup: { dedupFields: string[]; keepStrategy: string }
  normalize: { normalizeMethod: string; fields: string[] }
  format: { targetFormat: string; encoding: string; delimiter: string }
}

type PreprocessCreateForm = Omit<PreprocessCreatePayload, 'config'> & {
  config: PreprocessConfigForm
}

const createDefaultConfig = (): PreprocessConfigForm => ({
  clean: { nullStrategy: 'delete', filterOutlier: true },
  dedup: { dedupFields: ['user_id'], keepStrategy: 'first' },
  normalize: { normalizeMethod: 'zscore', fields: ['age'] },
  format: { targetFormat: 'csv', encoding: 'utf-8', delimiter: ',' },
})

const form = reactive<PreprocessCreateForm>({
  name: '',
  datasetId: '',
  versionId: '',
  outputVersionDesc: '',
  processTypes: [],
  config: createDefaultConfig(),
})

const cleanConfig = form.config.clean
const dedupConfig = form.config.dedup
const normalizeConfig = form.config.normalize
const formatConfig = form.config.format

const rules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  datasetId: [{ required: true, message: '请选择数据集', trigger: 'change' }],
  versionId: [{ required: true, message: '请选择版本', trigger: 'change' }],
  processTypes: [{ type: 'array', required: true, min: 1, message: '至少选择一种处理方式', trigger: 'change' }],
}

const loadVersions = async (datasetId: string) => {
  versionOptions.value = await preprocessApi.getDatasetVersions(datasetId)
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  const payload: PreprocessCreatePayload = {
    ...form,
    config: Object.fromEntries(form.processTypes.map((type) => [type, form.config[type as keyof typeof form.config]])),
  }
  await preprocessApi.create(payload)
  ElMessage.success('创建成功')
  router.push('/preprocess/list')
}

onMounted(async () => {
  datasetOptions.value = await preprocessApi.getAvailableDatasets()
})
</script>

<style scoped>
.form-card {
  max-width: 900px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}
</style>
