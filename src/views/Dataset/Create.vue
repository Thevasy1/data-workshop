<template>
  <div class="dataset-create-page">
    <form class="create-dialog" @submit.prevent="handleSubmit">
      <button class="close-btn" type="button" @click="goBack">×</button>
      <h1>{{ isEdit ? '修改数据集' : '新建数据集' }}</h1>

      <div class="form-block">
        <div class="field-title">数据类型</div>
        <div class="type-tabs">
          <button
            v-for="item in dataTypeOptions"
            :key="item.value"
            type="button"
            :class="{ active: form.dataType === item.value }"
            @click="changeDataType(item.value)"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="task-grid" :class="`task-${form.dataType}`">
          <button
            v-for="item in taskTypeOptions"
            :key="item.value"
            class="task-card"
            :class="{ active: form.taskType === item.value }"
            type="button"
            @click="form.taskType = item.value"
          >
            <span :style="{ color: item.color }">{{ item.icon }}</span>
            <strong>{{ item.label }}</strong>
          </button>
        </div>
      </div>

      <section class="rule-panel">
        <div class="rule-head">
          <strong>采集规则配置</strong>
          <span>控制数据集创建后的采集方式和质量校验</span>
        </div>
        <div class="rule-grid">
          <label>
            <span>数据来源</span>
            <select v-model="form.sourceType">
              <option value="">请选择数据来源</option>
              <option value="upload">本地上传</option>
              <option value="api">API接口</option>
              <option value="database">数据库</option>
              <option value="web">Web抓取</option>
            </select>
          </label>
          <label>
            <span>采集方式</span>
            <select v-model="form.ruleConfig.collectMode">
              <option value="">请选择采集方式</option>
              <option value="full">全量采集</option>
              <option value="incremental">增量采集</option>
              <option value="scheduled">定时采集</option>
            </select>
          </label>
          <label>
            <span>样本上限</span>
            <input v-model.number="form.ruleConfig.sampleLimit" min="100" max="1000000" type="number" />
          </label>
          <label>
            <span>规则说明</span>
            <input v-model.trim="form.ruleConfig.ruleNote" type="text" placeholder="例如：按更新时间同步" />
          </label>
        </div>
        <div class="quality-checks">
          <span>质量校验</span>
          <label v-for="item in qualityOptions" :key="item.value">
            <input v-model="form.ruleConfig.qualityChecks" :value="item.value" type="checkbox" />
            {{ item.label }}
          </label>
        </div>
      </section>

      <label class="form-field">
        <span>数据集名称</span>
        <input v-model.trim="form.name" type="text" placeholder="请输入数据集名称" />
      </label>

      <label class="form-field">
        <span>数据集描述</span>
        <textarea v-model.trim="form.description" placeholder="请输入数据集描述" />
      </label>

      <label class="form-field">
        <span>Tag</span>
        <select v-model="selectedTag">
          <option value="">请选择Tag</option>
          <option v-for="tag in tagOptions" :key="tag" :value="tag">{{ tag }}</option>
        </select>
      </label>

      <div class="form-actions">
        <button class="cancel-btn" type="button" @click="goBack">取消</button>
        <button class="submit-btn" type="submit" :disabled="submitting">
          {{ submitting ? '提交中...' : isEdit ? '保存修改' : '新建数据集' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import datasetApi from '@/api/dataset'
import type { DatasetCreatePayload } from '@/api/dataset'

type DatasetDataType = DatasetCreatePayload['dataType']

type TaskOption = {
  label: string
  value: string
  icon: string
  color: string
}

const router = useRouter()
const route = useRoute()
const submitting = ref(false)
const editId = computed(() => String(route.params.id || ''))
const isEdit = computed(() => Boolean(editId.value))
const selectedTag = ref('')

const dataTypeOptions: Array<{ label: string; value: DatasetDataType }> = [
  { label: '图像', value: 'image' },
  { label: '文本', value: 'text' },
  { label: '音视频', value: 'audioVideo' },
]

const taskMap: Record<DatasetDataType, TaskOption[]> = {
  image: [
    { label: '2D图像', value: '2D图像', icon: '□', color: '#9b6cff' },
    { label: '2D图像连续帧', value: '2D图像连续帧', icon: '□', color: '#9b6cff' },
    { label: '合成孔径雷达(SAR)', value: '合成孔径雷达(SAR)', icon: '⊙', color: '#9b6cff' },
  ],
  text: [
    { label: '文本总结', value: '文本总结', icon: '▤', color: '#ffb24f' },
    { label: '多轮对话', value: '多轮对话', icon: '☷', color: '#ffb24f' },
    { label: '文本改写', value: '文本改写', icon: '↻', color: '#ffb24f' },
    { label: '文本思维导图', value: '文本思维导图', icon: '⌘', color: '#ffb24f' },
    { label: '文本实体识别', value: '文本实体识别', icon: '▣', color: '#ffb24f' },
    { label: '优质答案选择', value: '优质答案选择', icon: '▥', color: '#ffb24f' },
  ],
  audioVideo: [
    { label: '语音转录', value: '语音转录', icon: '▱', color: '#ff63b6' },
    { label: '语音切分', value: '语音切分', icon: '▣', color: '#ff63b6' },
    { label: '视频标注', value: '视频标注', icon: '▹', color: '#4ee7ff' },
  ],
}

const qualityOptions = [
  { label: '去除空值', value: 'empty' },
  { label: '重复样本检测', value: 'duplicate' },
  { label: '格式校验', value: 'format' },
]

const tagOptions = ['训练集', '验证集', '测试集', '标注任务', '高优先级']

const form = reactive<DatasetCreatePayload>({
  name: '',
  description: '',
  dataType: 'image',
  taskType: '2D图像',
  sourceType: '',
  tags: [],
  ruleConfig: {
    collectMode: 'full',
    sampleLimit: 5000,
    qualityChecks: ['empty', 'duplicate'],
    ruleNote: '',
  },
})

const taskTypeOptions = computed(() => taskMap[form.dataType])

watch(selectedTag, (tag) => {
  form.tags = tag ? [tag] : []
})

const changeDataType = (type: DatasetDataType) => {
  form.dataType = type
  form.taskType = taskMap[type][0]?.value || ''
}

const validateForm = () => {
  if (!form.taskType) return '请选择任务类型'
  if (!form.sourceType) return '请选择数据来源'
  if (!form.ruleConfig.collectMode) return '请选择采集方式'
  if (!form.ruleConfig.sampleLimit || form.ruleConfig.sampleLimit < 100) return '样本上限不能小于 100'
  if (form.ruleConfig.qualityChecks.length === 0) return '请至少选择一项质量校验'
  if (!form.name) return '请输入数据集名称'
  if (!form.description) return '请输入数据集描述'
  if (form.tags.length === 0) return '请选择 Tag'
  return ''
}

const loadEditData = async () => {
  if (!isEdit.value) return
  const detail = await datasetApi.getConfig(editId.value)
  Object.assign(form, {
    name: detail.name,
    description: detail.description,
    dataType: detail.dataType,
    taskType: detail.taskType,
    sourceType: detail.sourceType,
    tags: [...detail.tags],
    ruleConfig: { ...detail.ruleConfig, qualityChecks: [...detail.ruleConfig.qualityChecks] },
  })
  selectedTag.value = detail.tags[0] || ''
}

const handleSubmit = async () => {
  const error = validateForm()
  if (error) {
    ElMessage.warning(error)
    return
  }
  submitting.value = true
  try {
    if (isEdit.value) {
      await datasetApi.update(editId.value, form)
      ElMessage.success('修改成功')
    } else {
      await datasetApi.create(form)
      ElMessage.success('创建成功')
    }
    router.push('/dataset/list')
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.push('/dataset/list')
}

onMounted(loadEditData)
</script>

<style scoped>
.dataset-create-page {
  position: fixed;
  inset: 0;
  z-index: 20;
  min-height: 100vh;
  display: grid;
  place-items: start center;
  padding: 32px 24px;
  overflow: auto;
  background:
    linear-gradient(rgba(38, 101, 129, 0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(38, 101, 129, 0.16) 1px, transparent 1px),
    radial-gradient(circle at 13% 8%, rgba(33, 217, 255, 0.14), transparent 28%),
    radial-gradient(circle at 86% 10%, rgba(53, 242, 161, 0.1), transparent 30%),
    linear-gradient(135deg, #081322 0%, #0a2032 48%, #07111f 100%);
  background-size: 96px 96px, 96px 96px, auto, auto, auto;
}

.create-dialog {
  position: relative;
  width: min(730px, 100%);
  padding: 24px;
  border: 1px solid rgba(118, 218, 255, 0.28);
  border-radius: 7px;
  color: #edf8ff;
  background: #101d32;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.32);
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 20px;
  border: none;
  color: #9db5c7;
  background: transparent;
  font-size: 28px;
  cursor: pointer;
}

h1 {
  margin: 0 0 16px;
  color: #f2f8ff;
  font-size: 20px;
  font-weight: 900;
}

.form-block,
.form-field,
.rule-panel {
  margin-top: 18px;
}

.field-title,
.form-field > span,
.rule-grid label > span,
.quality-checks > span {
  display: block;
  margin-bottom: 10px;
  color: #d5e4f0;
  font-size: 14px;
}

.type-tabs {
  display: flex;
  gap: 30px;
  border-bottom: 1px solid rgba(118, 218, 255, 0.2);
}

.type-tabs button {
  position: relative;
  height: 44px;
  border: none;
  color: #d5e4f0;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
}

.type-tabs button.active {
  color: #6fffaf;
  font-weight: 900;
}

.type-tabs button.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: #62ffae;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.task-text {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.task-card {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border: 1px solid rgba(118, 218, 255, 0.24);
  border-radius: 6px;
  color: #f2f8ff;
  background: rgba(4, 15, 28, 0.72);
  text-align: left;
  cursor: pointer;
}

.task-card strong {
  font-size: 14px;
}

.task-card.active,
.task-card:hover {
  border-color: rgba(98, 255, 174, 0.74);
  background: linear-gradient(135deg, rgba(33, 217, 255, 0.1), rgba(53, 242, 161, 0.08));
}

.rule-panel {
  padding: 16px;
  border: 1px solid rgba(118, 218, 255, 0.22);
  border-radius: 7px;
  background: linear-gradient(135deg, rgba(33, 217, 255, 0.08), rgba(53, 242, 161, 0.05));
}

.rule-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.rule-head strong {
  color: #f2f8ff;
  font-size: 16px;
}

.rule-head span {
  color: #8fa8bc;
  font-size: 13px;
}

.rule-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid rgba(118, 218, 255, 0.28);
  border-radius: 6px;
  color: #f2f8ff;
  background: rgba(4, 15, 28, 0.9);
  outline: none;
}

input,
select {
  height: 32px;
  padding: 0 12px;
}

textarea {
  min-height: 106px;
  padding: 12px;
  resize: vertical;
}

input::placeholder,
textarea::placeholder {
  color: #748da1;
}

.quality-checks {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 14px;
  color: #d5e4f0;
}

.quality-checks > span {
  margin-bottom: 0;
  color: #8fa8bc;
}

.quality-checks label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.quality-checks input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: #62ffae;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 26px;
}

.cancel-btn,
.submit-btn {
  height: 34px;
  padding: 0 18px;
  border-radius: 6px;
  cursor: pointer;
}

.cancel-btn {
  border: 1px solid rgba(118, 218, 255, 0.28);
  color: #dbe9f4;
  background: transparent;
}

.submit-btn {
  border: none;
  color: #02131c;
  background: linear-gradient(135deg, #4bd7ff, #68f4a5);
  font-weight: 900;
}

.submit-btn:disabled {
  cursor: wait;
  opacity: 0.72;
}

@media (max-width: 760px) {
  .task-grid,
  .rule-grid {
    grid-template-columns: 1fr;
  }

  .quality-checks {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
