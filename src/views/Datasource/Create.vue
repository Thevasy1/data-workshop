<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">{{ isEdit ? '编辑数据源' : '新增数据源' }}</span>
    </div>

    <el-card style="max-width: 800px">
      <CommonForm ref="formRef" :model="form" :fields="formFields" :rules="rules" label-width="120px" />
      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit">保存</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import CommonForm from '@/components/CommonForm.vue'
import type { FormField } from '@/components/CommonForm.vue'
import datasourceApi from '@/api/datasource'

const route = useRoute()
const router = useRouter()
const formRef = ref<{ validate: () => Promise<boolean> }>()

const isEdit = computed(() => Boolean(route.params.id))

const form = ref<Record<string, unknown>>({
  name: '',
  type: 'api',
  description: '',
  status: 'active',
})

const formFields: FormField[] = [
  { prop: 'name', label: '名称', type: 'input', placeholder: '请输入数据源名称' },
  {
    prop: 'type',
    label: '类型',
    type: 'select',
    placeholder: '请选择数据源类型',
    options: [
      { label: 'API 接口', value: 'api' },
      { label: '本地上传', value: 'upload' },
      { label: '数据库', value: 'database' },
      { label: 'Web 页面抓取', value: 'web' },
    ],
  },
  { prop: 'description', label: '描述', type: 'textarea', placeholder: '请输入描述' },
  {
    prop: 'status',
    label: '状态',
    type: 'radio',
    options: [
      { label: '启用', value: 'active' },
      { label: '停用', value: 'inactive' },
    ],
  },
]

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  if (isEdit.value) {
    await datasourceApi.update(String(route.params.id), form.value)
    ElMessage.success('更新成功')
  } else {
    await datasourceApi.create(form.value)
    ElMessage.success('创建成功')
  }
  router.push('/datasource/list')
}

const handleCancel = () => {
  router.back()
}

onMounted(async () => {
  if (!isEdit.value) return

  const res = await datasourceApi.getDetail(String(route.params.id))
  form.value = {
    name: res.name,
    type: res.type,
    description: res.description,
    status: res.status,
  }
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
