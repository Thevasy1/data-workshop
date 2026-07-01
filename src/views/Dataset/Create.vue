<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">创建数据集</h1>
        <p class="page-desc">选择数据源，配置字段映射、过滤条件和调度规则，完成数据集创建流程控制。</p>
      </div>
    </div>

    <el-card class="form-card">
      <el-steps :active="step" finish-status="success" align-center>
        <el-step title="基础信息" />
        <el-step title="采集规则" />
        <el-step title="确认创建" />
      </el-steps>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="126px" class="dataset-form">
        <template v-if="step === 0">
          <el-form-item label="数据集名称" prop="name">
            <el-input v-model.trim="form.name" placeholder="例如：用户行为宽表" />
          </el-form-item>
          <el-form-item label="负责人" prop="owner">
            <el-input v-model.trim="form.owner" placeholder="请输入负责人" />
          </el-form-item>
          <el-form-item label="数据源" prop="datasourceId">
            <el-select v-model="form.datasourceId" style="width: 100%" placeholder="请选择数据源" @change="loadFields">
              <el-option v-for="item in store.datasources" :key="item.id" :label="`${item.name}（${item.type}）`" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="数据集说明" prop="description">
            <el-input v-model.trim="form.description" type="textarea" :rows="4" />
          </el-form-item>
        </template>

        <template v-if="step === 1">
          <el-form-item label="字段映射">
            <el-table :data="selectedFields" stripe>
              <el-table-column prop="source" label="源字段" />
              <el-table-column prop="type" label="类型" width="140" />
              <el-table-column label="目标字段">
                <template #default="{ row }"><el-input v-model="row.target" /></template>
              </el-table-column>
              <el-table-column prop="comment" label="说明" />
            </el-table>
          </el-form-item>
          <el-form-item label="过滤条件">
            <div class="rule-list">
              <div v-for="(item, index) in form.filters" :key="index" class="rule-row">
                <el-input v-model="form.filters[index]" placeholder="例如：event_time >= 最近30天" />
                <el-button type="danger" text @click="form.filters.splice(index, 1)">删除</el-button>
              </div>
              <el-button @click="form.filters.push('')">新增过滤条件</el-button>
            </div>
          </el-form-item>
          <el-form-item label="调度规则" prop="schedule">
            <el-select v-model="form.schedule" style="width: 260px">
              <el-option label="手动执行" value="手动执行" />
              <el-option label="每日 02:00" value="每日 02:00" />
              <el-option label="每周一 01:00" value="每周一 01:00" />
              <el-option label="每 6 小时" value="每 6 小时" />
            </el-select>
          </el-form-item>
        </template>

        <template v-if="step === 2">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="数据集名称">{{ form.name }}</el-descriptions-item>
            <el-descriptions-item label="负责人">{{ form.owner }}</el-descriptions-item>
            <el-descriptions-item label="数据源">{{ datasourceName }}</el-descriptions-item>
            <el-descriptions-item label="调度规则">{{ form.schedule }}</el-descriptions-item>
            <el-descriptions-item label="过滤条件">{{ form.filters.filter(Boolean).join('；') || '无' }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <div class="form-actions">
          <el-button @click="step === 0 ? router.back() : step--">{{ step === 0 ? '取消' : '上一步' }}</el-button>
          <el-button v-if="step < 2" type="primary" @click="next">下一步</el-button>
          <el-button v-else type="primary" @click="submit">确认创建</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useWorkshopStore } from '@/stores/workshop'

const router = useRouter()
const store = useWorkshopStore()
const formRef = ref<FormInstance>()
const step = ref(0)
const selectedFields = ref<Array<{ source: string; target: string; type: string; comment: string }>>([])

const form = reactive({
  name: '',
  owner: '',
  datasourceId: '',
  description: '',
  schedule: '每日 02:00',
  filters: [''],
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入数据集名称', trigger: 'blur' }],
  owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  datasourceId: [{ required: true, message: '请选择数据源', trigger: 'change' }],
  description: [{ required: true, message: '请输入数据集说明', trigger: 'blur' }],
}

const datasourceName = computed(() => store.findDatasource(form.datasourceId)?.name || '-')

const loadFields = () => {
  selectedFields.value = (store.findDatasource(form.datasourceId)?.fields || []).map((item) => ({
    source: item.name,
    target: item.name,
    type: item.type,
    comment: item.comment,
  }))
}

const next = async () => {
  if (step.value === 0) await formRef.value?.validate()
  if (step.value === 1 && selectedFields.value.some((field) => !field.target.trim())) {
    ElMessage.warning('目标字段不能为空')
    return
  }
  step.value += 1
}

const submit = () => {
  const id = store.createDataset({
    name: form.name,
    owner: form.owner,
    datasourceId: form.datasourceId,
    description: form.description,
    schedule: form.schedule,
    filters: form.filters.filter(Boolean),
    fieldMappings: selectedFields.value,
  })
  ElMessage.success('数据集创建成功')
  router.push(`/dataset/detail/${id}`)
}
</script>

<style scoped>
.dataset-form {
  margin-top: 28px;
}

.rule-list {
  display: grid;
  gap: 10px;
  width: 100%;
}

.rule-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.form-actions {
  justify-content: center;
  margin-top: 26px;
}
</style>
