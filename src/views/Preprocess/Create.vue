<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">创建预处理任务</h1>
        <p class="page-desc">配置数据清洗、去重、标准化和格式转换规则，生成新的可用数据集版本。</p>
      </div>
    </div>

    <el-card class="form-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="136px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model.trim="form.name" placeholder="例如：用户行为宽表清洗任务" />
        </el-form-item>
        <el-form-item label="源数据集" prop="datasetId">
          <el-select v-model="form.datasetId" style="width: 100%" placeholder="请选择数据集">
            <el-option v-for="item in store.datasets" :key="item.id" :label="`${item.name} / ${item.version}`" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="清洗规则">
          <el-checkbox-group v-model="form.cleanRules">
            <el-checkbox label="空值填充" />
            <el-checkbox label="异常值过滤" />
            <el-checkbox label="非法字符清理" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="去重规则">
          <el-checkbox-group v-model="form.dedupRules">
            <el-checkbox label="主键去重" />
            <el-checkbox label="相似文本去重" />
            <el-checkbox label="时间窗口去重" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="标准化规则">
          <el-checkbox-group v-model="form.standardRules">
            <el-checkbox label="大小写统一" />
            <el-checkbox label="地区名称标准化" />
            <el-checkbox label="日期格式标准化" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="格式转换">
          <el-checkbox-group v-model="form.convertRules">
            <el-checkbox label="金额转数值" />
            <el-checkbox label="JSON 展平" />
            <el-checkbox label="文本分词字段生成" />
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="规则摘要">
          <pre class="code-box">{{ summary }}</pre>
        </el-form-item>

        <div class="form-actions">
          <el-button @click="router.back()">取消</el-button>
          <el-button type="primary" @click="submit">创建任务</el-button>
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
const form = reactive({
  name: '',
  datasetId: '',
  cleanRules: ['空值填充'],
  dedupRules: ['主键去重'],
  standardRules: ['大小写统一'],
  convertRules: [] as string[],
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  datasetId: [{ required: true, message: '请选择源数据集', trigger: 'change' }],
}

const allRules = computed(() => [...form.cleanRules, ...form.dedupRules, ...form.standardRules, ...form.convertRules])
const summary = computed(() => allRules.value.map((item, index) => `${index + 1}. ${item}`).join('\n') || '暂未选择规则')

const submit = async () => {
  await formRef.value?.validate()
  const id = store.createPreprocessTask({ name: form.name, datasetId: form.datasetId, rules: allRules.value })
  ElMessage.success('预处理任务创建成功')
  router.push(`/preprocess/detail/${id}`)
}
</script>

<style scoped>
.form-actions {
  justify-content: center;
}
</style>
