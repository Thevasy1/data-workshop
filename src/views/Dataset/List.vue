<template>
  <div class="dataset-list-page">
    <section class="page-hero">
      <div>
        <div class="eyebrow">DATASET MANAGEMENT</div>
        <h1>数据集列表</h1>
      </div>
      <button class="primary-btn" type="button" @click="handleCreate">新建数据集</button>
    </section>

    <section class="metric-grid">
      <article class="metric-card">
        <span>数据集总数</span>
        <strong>{{ total }}</strong>
        <p>已接入与本地创建</p>
      </article>
      <article class="metric-card">
        <span>可用于标注</span>
        <strong>{{ availableCount }}</strong>
        <p>状态为可用的数据集</p>
      </article>
      <article class="metric-card">
        <span>今日更新</span>
        <strong>{{ todayUpdateCount }}</strong>
        <p>最近同步或创建</p>
      </article>
    </section>

    <section class="filter-panel">
      <label class="keyword-field">
        <span>关键词</span>
        <input
          v-model.trim="searchForm.keyword"
          type="text"
          placeholder="搜索数据集名称、负责人或标签"
          @keyup.enter="handleSearch"
        />
      </label>
      <label>
        <span>数据来源</span>
        <select v-model="searchForm.sourceType">
          <option value="">全部来源</option>
          <option value="upload">本地上传</option>
          <option value="api">API接口</option>
          <option value="database">数据库</option>
          <option value="web">Web抓取</option>
        </select>
      </label>
      <label>
        <span>状态</span>
        <select v-model="searchForm.status">
          <option value="">全部状态</option>
          <option value="success">可用</option>
          <option value="running">采集中</option>
          <option value="pending">待校验</option>
          <option value="failed">异常</option>
          <option value="paused">已暂停</option>
        </select>
      </label>
      <label>
        <span>类型</span>
        <select v-model="searchForm.dataType">
          <option value="">全部类型</option>
          <option value="image">图像</option>
          <option value="text">文本</option>
          <option value="audioVideo">音视频</option>
        </select>
      </label>
      <button class="ghost-btn" type="button" @click="handleReset">重置</button>
    </section>

    <section class="result-panel">
      <div class="result-head">
        <div>
          <div class="eyebrow">RESULT</div>
          <h2>数据集检索结果</h2>
        </div>
        <span>共 {{ total }} 条</span>
      </div>

      <div v-if="loading" class="empty-state">正在加载数据集...</div>
      <div v-else-if="tableData.length === 0" class="empty-state">暂无符合条件的数据集</div>
      <div v-else class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>数据集名称</th>
              <th>来源</th>
              <th>类型</th>
              <th>状态</th>
              <th>样本量</th>
              <th>负责人</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tableData" :key="row.id">
              <td>
                <strong>{{ row.name }}</strong>
                <small>{{ row.id }}</small>
              </td>
              <td>{{ sourceTypeMap[row.sourceType] || row.datasourceName }}</td>
              <td>{{ dataTypeMap[row.dataType] || row.dataType }}</td>
              <td>
                <span class="status-pill" :class="statusClass(row.collectStatus)">
                  {{ statusTextMap[row.collectStatus] || row.collectStatus }}
                </span>
              </td>
              <td>{{ formatNumber(row.recordCount) }}</td>
              <td>成员4</td>
              <td>{{ formatDate(row.updatedAt) }}</td>
              <td>
                <div class="row-actions">
                  <button type="button" @click="handlePreview(row)">预览</button>
                  <button type="button" @click="handleRules(row)">规则</button>
                  <button type="button" @click="handleEdit(row)">修改</button>
                  <button class="danger" type="button" @click="handleDelete(row)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pager">
        <span>Total {{ total }}</span>
        <select v-model.number="pageSize" @change="handlePageSizeChange">
          <option :value="5">5/page</option>
          <option :value="10">10/page</option>
          <option :value="20">20/page</option>
        </select>
        <button type="button" :disabled="page <= 1" @click="changePage(page - 1)">‹</button>
        <strong>{{ page }}</strong>
        <button type="button" :disabled="page >= totalPages" @click="changePage(page + 1)">›</button>
        <span>Go to</span>
        <input v-model.number="jumpPage" type="number" min="1" :max="totalPages" @keyup.enter="jumpToPage" />
      </div>
    </section>

    <div v-if="modalVisible" class="modal-mask" @click.self="closeModal">
      <article class="info-modal">
        <button class="modal-close" type="button" @click="closeModal">×</button>
        <template v-if="modalType === 'preview' && currentRow">
          <div class="eyebrow">PREVIEW</div>
          <h3>数据集预览</h3>
          <div class="detail-grid">
            <span>名称</span><strong>{{ currentRow.name }}</strong>
            <span>数据类型</span><strong>{{ dataTypeMap[currentRow.dataType] }}</strong>
            <span>任务类型</span><strong>{{ currentRow.taskType }}</strong>
            <span>数据来源</span><strong>{{ currentRow.datasourceName || sourceTypeMap[currentRow.sourceType] }}</strong>
            <span>样本量</span><strong>{{ formatNumber(currentRow.recordCount) }}</strong>
            <span>描述</span><strong>{{ currentRow.description || '暂无描述' }}</strong>
          </div>
        </template>
        <template v-else-if="modalType === 'rules' && currentRow">
          <div class="eyebrow">RULE CONFIG</div>
          <h3>采集规则</h3>
          <div class="detail-grid">
            <span>采集方式</span><strong>{{ collectModeMap[currentRow.ruleConfig.collectMode] }}</strong>
            <span>样本上限</span><strong>{{ formatNumber(currentRow.ruleConfig.sampleLimit) }}</strong>
            <span>质量校验</span>
            <strong>{{ currentRow.ruleConfig.qualityChecks.map((item) => qualityCheckMap[item] || item).join('、') }}</strong>
            <span>规则说明</span><strong>{{ currentRow.ruleConfig.ruleNote || '暂无说明' }}</strong>
          </div>
        </template>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import datasetApi from '@/api/dataset'
import type { DatasetItem } from '@/api/dataset'

const router = useRouter()
const loading = ref(false)
const tableData = ref<DatasetItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const jumpPage = ref(1)
const modalVisible = ref(false)
const modalType = ref<'preview' | 'rules'>('preview')
const currentRow = ref<DatasetItem | null>(null)

const searchForm = ref({
  keyword: '',
  status: '',
  dataType: '',
  sourceType: '',
})

const dataTypeMap: Record<string, string> = {
  image: '图像',
  text: '文本',
  audioVideo: '音视频',
}

const sourceTypeMap: Record<string, string> = {
  upload: '本地上传',
  api: 'API接口',
  database: '数据库',
  web: 'Web抓取',
}

const statusTextMap: Record<string, string> = {
  success: '可用',
  running: '采集中',
  pending: '待校验',
  failed: '异常',
  paused: '已暂停',
}

const collectModeMap: Record<string, string> = {
  full: '全量采集',
  incremental: '增量采集',
  scheduled: '定时采集',
}

const qualityCheckMap: Record<string, string> = {
  empty: '去除空值',
  duplicate: '重复样本检测',
  format: '格式校验',
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const availableCount = computed(() => tableData.value.filter((item) => item.collectStatus === 'success').length)
const todayUpdateCount = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return tableData.value.filter((item) => item.updatedAt?.startsWith(today)).length
})

const fetchList = async () => {
  loading.value = true
  try {
    const res = await datasetApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: searchForm.value.keyword,
      status: searchForm.value.status,
      dataType: searchForm.value.dataType,
      sourceType: searchForm.value.sourceType,
    })
    tableData.value = res.list
    total.value = res.total
    jumpPage.value = page.value
  } finally {
    loading.value = false
  }
}

const formatNumber = (value: number) => value.toLocaleString('zh-CN')
const formatDate = (value: string) => value?.slice(0, 10) || '-'
const statusClass = (status: string) => `status-${status}`

const handleSearch = () => {
  page.value = 1
  fetchList()
  ElMessage.success('查询完成')
}

const handleReset = () => {
  searchForm.value = { keyword: '', status: '', dataType: '', sourceType: '' }
  page.value = 1
  fetchList()
  ElMessage.info('筛选条件已重置')
}

const handleCreate = () => {
  router.push('/dataset/create')
}

const handlePreview = (row: DatasetItem) => {
  currentRow.value = row
  modalType.value = 'preview'
  modalVisible.value = true
}

const handleRules = async (row: DatasetItem) => {
  const detail = await datasetApi.getConfig(row.id)
  currentRow.value = detail
  modalType.value = 'rules'
  modalVisible.value = true
}

const handleEdit = (row: DatasetItem) => {
  router.push(`/dataset/edit/${row.id}`)
}

const handleDelete = async (row: DatasetItem) => {
  try {
    await ElMessageBox.confirm(`确认删除数据集「${row.name}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await datasetApi.delete(row.id)
    ElMessage.success('删除成功')
    if (tableData.value.length === 1 && page.value > 1) page.value -= 1
    await fetchList()
  } catch {
    ElMessage.info('已取消删除')
  }
}

const closeModal = () => {
  modalVisible.value = false
  currentRow.value = null
}

const changePage = (nextPage: number) => {
  page.value = Math.min(Math.max(nextPage, 1), totalPages.value)
}

const jumpToPage = () => {
  changePage(jumpPage.value || 1)
}

const handlePageSizeChange = () => {
  page.value = 1
}

watch(page, fetchList)
watch(pageSize, fetchList)
onMounted(fetchList)
</script>

<style scoped>
.dataset-list-page {
  min-height: 100vh;
  padding: 30px 28px 18px;
}

.page-hero,
.result-head,
.metric-grid,
.filter-panel,
.pager,
.row-actions {
  display: flex;
  align-items: center;
}

.page-hero {
  justify-content: space-between;
  margin-bottom: 24px;
}

.eyebrow {
  color: #73ffb4;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0;
}

h1,
h2,
h3 {
  margin: 0;
  color: #f3fbff;
  font-weight: 900;
}

h1 {
  margin-top: 8px;
  font-size: 34px;
  line-height: 1.1;
}

h2 {
  margin-top: 8px;
  font-size: 26px;
}

h3 {
  margin: 8px 0 18px;
  font-size: 22px;
}

.primary-btn,
.ghost-btn,
.row-actions button,
.pager button {
  border: 1px solid rgba(118, 218, 255, 0.36);
  border-radius: 7px;
  cursor: pointer;
}

.primary-btn {
  height: 40px;
  padding: 0 22px;
  border: none;
  color: #02131c;
  background: linear-gradient(135deg, #4bd7ff, #68f4a5);
  font-weight: 800;
}

.metric-grid {
  gap: 16px;
  margin-bottom: 18px;
}

.metric-card {
  flex: 1;
  min-height: 150px;
  padding: 26px 20px;
  border: 1px solid rgba(118, 218, 255, 0.24);
  border-radius: 7px;
  background: rgba(12, 28, 48, 0.72);
}

.metric-card span {
  color: #6fe8ff;
  font-size: 13px;
  font-weight: 800;
}

.metric-card strong {
  display: block;
  margin-top: 14px;
  color: #7dffb3;
  font-size: 34px;
  line-height: 1;
}

.metric-card p {
  margin: 16px 0 0;
  color: #a7b8c7;
  font-size: 13px;
}

.filter-panel,
.result-panel {
  border: 1px solid rgba(118, 218, 255, 0.24);
  border-radius: 7px;
  background: rgba(10, 26, 45, 0.72);
}

.filter-panel {
  gap: 14px;
  margin-bottom: 18px;
  padding: 20px;
}

.filter-panel label {
  display: grid;
  gap: 8px;
  min-width: 108px;
}

.filter-panel .keyword-field {
  flex: 1;
}

label span {
  color: #b8cbe0;
  font-size: 13px;
}

input,
select,
textarea {
  height: 42px;
  border: 1px solid rgba(118, 218, 255, 0.28);
  border-radius: 7px;
  color: #f2f9ff;
  background: rgba(4, 15, 28, 0.9);
  outline: none;
}

input,
select {
  padding: 0 12px;
}

input::placeholder,
textarea::placeholder {
  color: #758da1;
}

.ghost-btn {
  align-self: end;
  height: 42px;
  padding: 0 18px;
  color: #dbe9f4;
  background: rgba(7, 18, 34, 0.82);
}

.result-panel {
  padding: 20px;
}

.result-head {
  justify-content: space-between;
  margin-bottom: 22px;
}

.result-head > span {
  color: #a8bdcf;
}

.data-table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  color: #e9f5ff;
}

.data-table th {
  padding: 13px 12px;
  border-bottom: 1px solid rgba(118, 218, 255, 0.2);
  color: #a9bed1;
  font-size: 13px;
  text-align: left;
}

.data-table td {
  padding: 16px 12px;
  border-bottom: 1px solid rgba(118, 218, 255, 0.16);
  color: #e9f5ff;
}

.data-table td strong {
  display: block;
  color: #f4fbff;
  font-size: 16px;
}

.data-table td small {
  display: block;
  margin-top: 4px;
  color: #c7d7e4;
  font-size: 13px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  background: rgba(118, 218, 255, 0.12);
}

.status-pill::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.status-success {
  color: #6df3a5;
}

.status-running {
  color: #54dfff;
}

.status-pending {
  color: #ffd85a;
}

.status-failed {
  color: #ff7b93;
}

.status-paused {
  color: #a7b8c7;
}

.row-actions {
  gap: 8px;
  white-space: nowrap;
}

.row-actions button {
  height: 28px;
  padding: 0 10px;
  color: #dff4ff;
  background: rgba(7, 18, 34, 0.8);
}

.row-actions button:hover {
  border-color: rgba(83, 213, 245, 0.8);
  color: #73ffb4;
}

.row-actions .danger:hover {
  border-color: rgba(255, 123, 147, 0.72);
  color: #ff8ea2;
}

.empty-state {
  display: grid;
  place-items: center;
  min-height: 220px;
  color: #8fa8bc;
}

.pager {
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  color: #9eb3c5;
}

.pager select,
.pager input,
.pager button {
  height: 32px;
}

.pager input {
  width: 58px;
  text-align: center;
}

.pager button {
  min-width: 34px;
  color: #0c1a27;
  background: #f2f7ff;
}

.pager button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.pager strong {
  color: #62ffae;
}

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(2, 8, 16, 0.68);
  backdrop-filter: blur(6px);
}

.info-modal {
  position: relative;
  width: min(620px, 100%);
  padding: 28px;
  border: 1px solid rgba(118, 218, 255, 0.34);
  border-radius: 8px;
  background: #101d32;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.36);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 18px;
  border: none;
  color: #9eb3c5;
  background: transparent;
  font-size: 28px;
  cursor: pointer;
}

.detail-grid {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 14px 18px;
}

.detail-grid span {
  color: #8fa8bc;
}

.detail-grid strong {
  color: #eef8ff;
  font-weight: 700;
}

@media (max-width: 1000px) {
  .metric-grid,
  .filter-panel {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
