<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">创建数据集</span>
    </div>

    <el-card class="form-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="数据集名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="数据源" prop="datasourceId">
          <el-select v-model="form.datasourceId" style="width: 100%" @change="loadFields">
            <el-option v-for="item in datasourceOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="字段映射">
          <div class="mapping-list">
            <div v-for="(item, index) in form.collectRules.fieldMappings" :key="index" class="mapping-row">
              <el-select v-model="item.source" placeholder="源字段">
                <el-option v-for="field in datasourceFields" :key="field.name" :label="field.name" :value="field.name" />
              </el-select>
              <el-input v-model="item.target" placeholder="目标字段名" />
              <el-button text type="danger" @click="removeMapping(index)">删除</el-button>
            </div>
            <el-button @click="addMapping">新增映射</el-button>
          </div>
        </el-form-item>
        <el-form-item label="过滤规则">
          <div class="mapping-list">
            <div v-for="(item, index) in form.collectRules.filters" :key="index" class="mapping-row">
              <el-select v-model="item.field" placeholder="字段">
                <el-option v-for="field in datasourceFields" :key="field.name" :label="field.name" :value="field.name" />
              </el-select>
              <el-select v-model="item.operator" placeholder="运算符">
                <el-option label=">" value=">" />
                <el-option label="<" value="<" />
                <el-option label="=" value="=" />
              </el-select>
              <el-input v-model="item.value" placeholder="值" />
              <el-button text type="danger" @click="removeFilter(index)">删除</el-button>
            </div>
            <el-button @click="addFilter">新增过滤条件</el-button>
          </div>
        </el-form-item>
        <el-form-item label="调度频率">
          <el-select v-model="form.collectRules.schedule">
            <el-option label="Manual" value="manual" />
            <el-option label="Daily" value="daily" />
            <el-option label="Weekly" value="weekly" />
            <el-option label="Cron" value="cron" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.collectRules.schedule === 'cron'" label="Cron 表达式">
          <el-input v-model="form.collectRules.cron" />
        </el-form-item>

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
import datasetApi, { type CreateDatasetPayload, type DatasourceOption, type DatasetField } from '@/api/dataset'

const router = useRouter()
const formRef = ref()
const datasourceOptions = ref<DatasourceOption[]>([])
const datasourceFields = ref<DatasetField[]>([])

const form = reactive<CreateDatasetPayload>({
  name: '',
  datasourceId: '',
  description: '',
  collectRules: {
    fieldMappings: [{ source: '', target: '' }],
    filters: [],
    schedule: 'daily',
    cron: '0 0 * * *',
  },
})

const rules = {
  name: [{ required: true, message: '请输入数据集名称', trigger: 'blur' }],
  datasourceId: [{ required: true, message: '请选择数据源', trigger: 'change' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
}

const addMapping = () => form.collectRules.fieldMappings.push({ source: '', target: '' })
const removeMapping = (index: number) => form.collectRules.fieldMappings.splice(index, 1)
const addFilter = () => form.collectRules.filters.push({ field: '', operator: '>', value: '' })
const removeFilter = (index: number) => form.collectRules.filters.splice(index, 1)

const loadFields = async (datasourceId: string) => {
  datasourceFields.value = await datasetApi.getDatasourceFields(datasourceId)
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  await datasetApi.create(form)
  ElMessage.success('创建成功')
  router.push('/dataset/list')
}

onMounted(async () => {
  datasourceOptions.value = await datasetApi.getDatasourceOptions()
})
</script>

<style scoped>
.form-card {
  max-width: 900px;
}

.mapping-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mapping-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: 12px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}
</style>
