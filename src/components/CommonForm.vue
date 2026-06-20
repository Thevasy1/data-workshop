<template>
  <el-form
    ref="formRef"
    :model="model"
    :rules="rules"
    :label-width="labelWidth"
    v-bind="$attrs"
  >
    <el-form-item
      v-for="field in fields"
      :key="field.prop"
      :prop="field.prop"
      :label="field.label"
    >
      <!-- 输入框 -->
      <el-input
        v-if="field.type === 'input'"
        v-model="model[field.prop]"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
        clearable
      />
      <!-- 数字输入框 -->
      <el-input-number
        v-else-if="field.type === 'number'"
        v-model="model[field.prop]"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
        :min="field.min"
        :max="field.max"
      />
      <!-- 下拉选择 -->
      <el-select
        v-else-if="field.type === 'select'"
        v-model="model[field.prop]"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
        clearable
      >
        <el-option
          v-for="opt in field.options"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <!-- 开关 -->
      <el-switch
        v-else-if="field.type === 'switch'"
        v-model="model[field.prop]"
        :disabled="field.disabled"
      />
      <!-- 文本域 -->
      <el-input
        v-else-if="field.type === 'textarea'"
        v-model="model[field.prop]"
        type="textarea"
        :rows="field.rows || 3"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
      />
      <!-- 单选 -->
      <el-radio-group
        v-else-if="field.type === 'radio'"
        v-model="model[field.prop]"
        :disabled="field.disabled"
      >
        <el-radio
          v-for="opt in field.options"
          :key="opt.value"
          :label="opt.value"
        >
          {{ opt.label }}
        </el-radio>
      </el-radio-group>
      <!-- 日期 -->
      <el-date-picker
        v-else-if="field.type === 'date'"
        v-model="model[field.prop]"
        type="datetime"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
      />
      <!-- 自定义插槽 -->
      <slot
        v-else-if="field.type === 'slot'"
        :name="field.prop"
        :model="model"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance } from 'element-plus'

interface FormField {
  prop: string
  label: string
  type: 'input' | 'number' | 'select' | 'switch' | 'textarea' | 'radio' | 'date' | 'slot'
  placeholder?: string
  disabled?: boolean
  options?: { label: string; value: any }[]
  rows?: number
  min?: number
  max?: number
}

const props = withDefaults(
  defineProps<{
    model: Record<string, any>
    fields: FormField[]
    rules?: Record<string, any>
    labelWidth?: string
  }>(),
  {
    labelWidth: '100px',
  }
)

const formRef = ref<FormInstance>()

const validate = () => formRef.value?.validate()
const resetFields = () => formRef.value?.resetFields()

defineExpose({ validate, resetFields, formRef })
</script>
