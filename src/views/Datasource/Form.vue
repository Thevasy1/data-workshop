<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ isEdit ? '编辑数据源' : '新建数据源' }}</h1>
        <p class="page-desc">支持 API、本地上传、数据库、Web 抓取 4 类数据源配置，可保存并进行连接测试。</p>
      </div>
    </div>

    <el-card class="form-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="128px">
        <el-form-item label="数据源名称" prop="name">
          <el-input v-model.trim="form.name" placeholder="例如：用户行为 API" />
        </el-form-item>
        <el-form-item label="数据源类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio-button label="API" />
            <el-radio-button label="本地上传" />
            <el-radio-button label="数据库" />
            <el-radio-button label="Web抓取" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="负责人" prop="owner">
          <el-input v-model.trim="form.owner" placeholder="请输入负责人或小组名称" />
        </el-form-item>
        <el-form-item :label="addressLabel" prop="address">
          <el-input v-model.trim="form.address" :placeholder="addressPlaceholder" />
        </el-form-item>

        <el-row :gutter="16" v-if="form.type === 'API'">
          <el-col :span="12">
            <el-form-item label="请求方式">
              <el-select v-model="extra.method" style="width: 100%">
                <el-option label="GET" value="GET" />
                <el-option label="POST" value="POST" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="鉴权方式">
              <el-select v-model="extra.auth" style="width: 100%">
                <el-option label="Token" value="Token" />
                <el-option label="AppKey" value="AppKey" />
                <el-option label="无" value="无" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16" v-if="form.type === '本地上传'">
          <el-col :span="8">
            <el-form-item label="文件格式">
              <el-select v-model="extra.fileFormat" style="width: 100%">
                <el-option label="Excel" value="Excel" />
                <el-option label="CSV" value="CSV" />
                <el-option label="JSON" value="JSON" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="文件编码">
              <el-select v-model="extra.encoding" style="width: 100%">
                <el-option label="UTF-8" value="UTF-8" />
                <el-option label="GBK" value="GBK" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="首行表头">
              <el-switch v-model="extra.hasHeader" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16" v-if="form.type === '数据库'">
          <el-col :span="12">
            <el-form-item label="数据库类型">
              <el-select v-model="extra.dbType" style="width: 100%">
                <el-option label="MySQL" value="MySQL" />
                <el-option label="PostgreSQL" value="PostgreSQL" />
                <el-option label="Oracle" value="Oracle" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="同步表名">
              <el-input v-model="extra.tableName" placeholder="例如：dwd_order_detail" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16" v-if="form.type === 'Web抓取'">
          <el-col :span="8">
            <el-form-item label="抓取深度">
              <el-input-number v-model="extra.crawlDepth" :min="1" :max="5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="列表选择器">
              <el-input v-model="extra.listSelector" placeholder=".news-list .item" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="抓取频率">
              <el-select v-model="extra.crawlRate" style="width: 100%">
                <el-option label="每小时" value="每小时" />
                <el-option label="每 6 小时" value="每 6 小时" />
                <el-option label="每日" value="每日" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="说明" prop="description">
          <el-input v-model.trim="form.description" type="textarea" :rows="4" placeholder="描述数据来源、字段范围、更新频率等" />
        </el-form-item>

        <div class="form-actions">
          <div></div>
          <div>
            <el-button @click="router.back()">取消</el-button>
            <el-button @click="saveOnly">保存</el-button>
            <el-button type="primary" @click="saveAndTest">保存并测试</el-button>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useWorkshopStore, type SourceStatus, type SourceType } from '@/stores/workshop'

const route = useRoute()
const router = useRouter()
const store = useWorkshopStore()
const formRef = ref<FormInstance>()
const isEdit = computed(() => Boolean(route.params.id))

const form = reactive({
  id: '',
  name: '',
  type: 'API' as SourceType,
  owner: '',
  status: 'connected' as SourceStatus,
  address: '',
  description: '',
})

const extra = reactive({
  method: 'GET',
  auth: 'Token',
  dbType: 'MySQL',
  tableName: '',
  fileFormat: 'Excel',
  encoding: 'UTF-8',
  hasHeader: true,
  crawlDepth: 2,
  listSelector: '.list .item',
  crawlRate: '每 6 小时',
})

const addressLabel = computed(() => {
  if (form.type === '本地上传') return '文件路径'
  if (form.type === '数据库') return '连接地址'
  if (form.type === 'Web抓取') return '抓取地址'
  return '接口地址'
})

const addressPlaceholder = computed(() => {
  if (form.type === '本地上传') return '/upload/data.xlsx'
  if (form.type === '数据库') return 'jdbc:mysql://host:3306/database'
  if (form.type === 'Web抓取') return 'https://example.com/list'
  return 'https://api.example.com/data'
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择数据源类型', trigger: 'change' }],
  owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  address: [{ required: true, message: '请输入接入地址', trigger: 'blur' }],
  description: [{ required: true, message: '请输入数据源说明', trigger: 'blur' }],
}

const submit = async (withTest: boolean) => {
  await formRef.value?.validate()
  const id = store.saveDatasource({ ...form })
  ElMessage.success(withTest ? '保存成功，连接测试通过' : '保存成功')
  router.push(`/datasource/detail/${id}`)
}

const saveOnly = () => submit(false)
const saveAndTest = () => submit(true)

onMounted(() => {
  const id = String(route.params.id || '')
  if (!id) return
  const current = store.findDatasource(id)
  if (!current) return
  Object.assign(form, {
    id: current.id,
    name: current.name,
    type: current.type,
    owner: current.owner,
    status: current.status,
    address: current.address,
    description: current.description,
  })
})
</script>
