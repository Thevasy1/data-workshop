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
      <!-- Step 1: 选择数据源 -->
      <div v-if="activeStep === 0">
        <el-form :model="form" label-width="120px">
          <el-form-item label="选择数据源" prop="datasourceId" required>
            <el-select v-model="form.datasourceId" placeholder="请选择数据源" style="width: 400px">
              <el-option
                v-for="item in datasourceOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="数据集名称" prop="name" required>
            <el-input v-model="form.name" placeholder="请输入数据集名称" style="width: 400px" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="form.description" type="textarea" placeholder="请输入描述" style="width: 400px" />
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 2: 配置参数（简化版） -->
      <div v-if="activeStep === 1">
        <el-form :model="form.config" label-width="120px">
          <el-form-item label="请求方式" v-if="datasourceType === 'api'">
            <el-radio-group v-model="form.config.method">
              <el-radio label="GET">GET</el-radio>
              <el-radio label="POST">POST</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="SQL语句" v-if="datasourceType === 'database'">
            <el-input v-model="form.config.sql" type="textarea" placeholder="SELECT * FROM table" />
          </el-form-item>
          <el-form-item label="文件格式" v-if="datasourceType === 'upload'">
            <el-select v-model="form.config.fileFormat" placeholder="请选择格式">
              <el-option label="CSV" value="csv" />
              <el-option label="Excel" value="excel" />
              <el-option label="JSON" value="json" />
            </el-select>
          </el-form-item>
          <el-form-item label="抓取URL" v-if="datasourceType === 'web'">
            <el-input v-model="form.config.url" placeholder="请输入要抓取的页面URL" />
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 3: 确认 -->
      <div v-if="activeStep === 2">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="数据集名称">{{ form.name }}</el-descriptions-item>
          <el-descriptions-item label="数据源">{{ selectedDatasourceName }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ form.description || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="step-actions">
        <el-button v-if="activeStep > 0" @click="activeStep--">上一步</el-button>
        <el-button v-if="activeStep < 2" type="primary" @click="activeStep++">下一步</el-button>
        <el-button v-if="activeStep === 2" type="primary" @click="handleSubmit">确认创建</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import datasetApi from '@/api/dataset'

const router = useRouter()
const activeStep = ref(0)
const datasourceOptions = ref<{ id: string; name: string }[]>([])

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

const selectedDatasourceName = computed(() => {
  const item = datasourceOptions.value.find((d) => d.id === form.value.datasourceId)
  return item?.name || ''
})

const datasourceType = computed(() => {
  // 模拟根据数据源ID获取类型，实际应根据选中数据源获取
  return 'api'
})

const handleSubmit = async () => {
  try {
    await datasetApi.create(form.value)
    ElMessage.success('创建成功')
    router.push('/dataset/list')
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  const res = await datasetApi.getDatasourceOptions()
  datasourceOptions.value = res
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
