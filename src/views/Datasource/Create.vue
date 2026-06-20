<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">{{ isEdit ? '编辑数据源' : '新增数据源' }}</span>
    </div>

    <el-card style="max-width: 800px">
      <CommonForm
        ref="formRef"
        :model="form"
        :fields="formFields"
        :rules="rules"
        label-width="120px"
      />
      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit">保存</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CommonForm from '@/components/CommonForm.vue'
import datasourceApi from '@/api/datasource'

const route = useRoute()
const router = useRouter()
const formRef = ref()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  name: '',
  type: 'api',
  sourceUrl: '',
  description: '',
  status: 'active',
})

const formFields = [
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
  { prop: 'sourceUrl', label: '来源地址', type: 'input', placeholder: '请输入来源地址或上传文件' },
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
  sourceUrl: [{ required: true, message: '请输入来源地址', trigger: 'blur' }],
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  try {
    if (isEdit.value) {
      await datasourceApi.update(route.params.id as string, form.value)
      ElMessage.success('更新成功')
    } else {
      await datasourceApi.create(form.value)
      ElMessage.success('创建成功')
    }
    router.push('/datasource/list')
  } catch (e) {
    console.error(e)
  }
}

const handleCancel = () => {
  router.back()
}

onMounted(async () => {
  if (isEdit.value) {
    const res = await datasourceApi.getDetail(route.params.id as string)
    form.value = { ...form.value, ...res }
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
