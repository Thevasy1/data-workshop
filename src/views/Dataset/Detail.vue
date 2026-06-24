<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">数据集详情</span>
      <div class="header-actions">
        <el-button @click="router.back()">返回</el-button>
        <el-dropdown @command="handleExport">
          <el-button>
            导出<el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="csv">CSV</el-dropdown-item>
              <el-dropdown-item command="json">JSON</el-dropdown-item>
              <el-dropdown-item command="excel">Excel</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button type="primary" @click="handleLabelStatus">
          {{ detail?.isLabeled ? '取消可标注' : '标记可标注' }}
        </el-button>
        <el-button type="danger" @click="handleDelete">删除</el-button>
      </div>
    </div>

    <el-skeleton v-if="loading" :rows="8" animated />

    <template v-else-if="detail">
      <el-card class="overview-card">
        <div class="overview-header">
          <div>
            <h2>{{ detail.name }}</h2>
            <p>{{ detail.description || '暂无描述' }}</p>
          </div>
          <StatusTag :status="detail.collectStatus" type="collect" size="large" />
        </div>

        <el-descriptions :column="3" border>
          <el-descriptions-item label="数据源">{{ detail.datasourceName }}</el-descriptions-item>
          <el-descriptions-item label="记录数">{{ detail.recordCount.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="当前版本">{{ detail.version }}</el-descriptions-item>
          <el-descriptions-item label="采集进度">
            <el-progress :percentage="detail.collectProgress" />
          </el-descriptions-item>
          <el-descriptions-item label="标注状态">
            <el-tag :type="detail.isLabeled ? 'success' : 'info'">
              {{ detail.isLabeled ? '可用于标注' : '未标记' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="采集计划">
            {{ scheduleMap[detail.collectRules.schedule] }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detail.updatedAt }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="样本预览" name="samples">
          <el-table :data="sampleRows" border>
            <el-table-column
              v-for="column in samples.columns"
              :key="column"
              :prop="column"
              :label="column"
              min-width="140"
            />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="字段结构" name="fields">
          <el-table :data="fields" border>
            <el-table-column prop="name" label="字段名" min-width="140" />
            <el-table-column prop="type" label="类型" width="120">
              <template #default="{ row }">
                <el-tag>{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" min-width="160" />
            <el-table-column prop="source" label="来源" min-width="160" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="版本管理" name="versions">
          <div class="version-toolbar">
            <el-select v-model="compareForm.baseVersionId" placeholder="基准版本">
              <el-option
                v-for="item in versions"
                :key="item.id"
                :label="item.version"
                :value="item.id"
              />
            </el-select>
            <el-select v-model="compareForm.targetVersionId" placeholder="目标版本">
              <el-option
                v-for="item in versions"
                :key="item.id"
                :label="item.version"
                :value="item.id"
              />
            </el-select>
            <el-button type="primary" @click="handleCompare">版本对比</el-button>
          </div>

          <el-table :data="versions" border>
            <el-table-column prop="version" label="版本" width="100" />
            <el-table-column prop="recordCount" label="记录数" width="120">
              <template #default="{ row }">
                {{ row.recordCount.toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="fieldCount" label="字段数" width="100" />
            <el-table-column prop="description" label="说明" min-width="180" />
            <el-table-column prop="createdAt" label="创建时间" width="180" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button size="small" @click="handleRollback(row)">回滚</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </template>

    <el-empty v-else description="未找到数据集" />

    <el-dialog v-model="compareDialogVisible" title="版本对比" width="620px">
      <template v-if="compareResult">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="基准版本">{{ compareResult.baseVersion.version }}</el-descriptions-item>
          <el-descriptions-item label="目标版本">{{ compareResult.targetVersion.version }}</el-descriptions-item>
          <el-descriptions-item label="记录变化">{{ compareResult.diff.recordCount }}</el-descriptions-item>
          <el-descriptions-item label="新增字段">
            {{ compareResult.diff.addedFields.join('、') || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="移除字段">
            {{ compareResult.diff.removedFields.join('、') || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="变更字段">
            {{ compareResult.diff.changedFields.join('、') || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import StatusTag from '@/components/StatusTag.vue'
import datasetApi from '@/api/dataset'
import type {
  DatasetDetail,
  DatasetField,
  DatasetSamples,
  DatasetSchedule,
  DatasetVersion,
  VersionCompareResult,
} from '@/api/dataset'

const route = useRoute()
const router = useRouter()
const datasetId = route.params.id as string

const loading = ref(false)
const activeTab = ref('samples')
const detail = ref<DatasetDetail>()
const fields = ref<DatasetField[]>([])
const samples = ref<DatasetSamples>({ columns: [], rows: [] })
const versions = ref<DatasetVersion[]>([])
const compareResult = ref<VersionCompareResult>()
const compareDialogVisible = ref(false)
const compareForm = ref({
  baseVersionId: '',
  targetVersionId: '',
})

const scheduleMap: Record<DatasetSchedule, string> = {
  manual: '手动',
  daily: '每日',
  weekly: '每周',
  cron: 'Cron',
}

const sampleRows = computed(() => {
  return samples.value.rows.map((row, rowIndex) => {
    return samples.value.columns.reduce<Record<string, string | number | null>>((item, column, columnIndex) => {
      item[column] = row[columnIndex]
      item.id = rowIndex
      return item
    }, {})
  })
})

const fetchDetail = async () => {
  loading.value = true
  try {
    const [detailRes, fieldsRes, samplesRes, versionsRes] = await Promise.all([
      datasetApi.getDetail(datasetId),
      datasetApi.getFields(datasetId),
      datasetApi.getSamples(datasetId),
      datasetApi.getVersions(datasetId),
    ])

    detail.value = detailRes
    fields.value = fieldsRes
    samples.value = samplesRes
    versions.value = versionsRes
    compareForm.value = {
      baseVersionId: versionsRes[0]?.id || '',
      targetVersionId: versionsRes[versionsRes.length - 1]?.id || '',
    }
  } finally {
    loading.value = false
  }
}

const handleExport = async (format: 'csv' | 'json' | 'excel') => {
  const message = await datasetApi.exportDataset(datasetId, format)
  ElMessage.success(message || '导出任务已创建')
}

const handleLabelStatus = async () => {
  if (!detail.value) return

  const nextStatus = !detail.value.isLabeled
  await datasetApi.updateLabelStatus(datasetId, nextStatus)
  detail.value.isLabeled = nextStatus
  ElMessage.success(nextStatus ? '已标记为可用于标注' : '已取消可标注')
}

const handleDelete = () => {
  if (!detail.value) return

  ElMessageBox.confirm(`确认删除数据集「${detail.value.name}」？`, '提示', { type: 'warning' }).then(async () => {
    await datasetApi.delete(datasetId)
    ElMessage.success('删除成功')
    router.push('/dataset/list')
  })
}

const handleCompare = async () => {
  if (!compareForm.value.baseVersionId || !compareForm.value.targetVersionId) {
    ElMessage.warning('请选择两个版本')
    return
  }

  if (compareForm.value.baseVersionId === compareForm.value.targetVersionId) {
    ElMessage.warning('请选择不同版本进行对比')
    return
  }

  compareResult.value = await datasetApi.compareVersions(datasetId, compareForm.value)
  compareDialogVisible.value = true
}

const handleRollback = (version: DatasetVersion) => {
  ElMessageBox.confirm(`确认回滚到 ${version.version}？`, '提示', { type: 'warning' }).then(async () => {
    await datasetApi.rollbackVersion(datasetId, version.id)
    ElMessage.success('回滚成功')
    fetchDetail()
  })
}

onMounted(fetchDetail)
</script>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.overview-card {
  margin-bottom: 20px;
}

.overview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.overview-header h2 {
  margin: 0 0 8px;
  font-size: 22px;
  color: var(--text-primary);
}

.overview-header p {
  margin: 0;
  color: var(--text-secondary);
}

.detail-tabs {
  margin-top: 20px;
}

.version-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.version-toolbar .el-select {
  width: 180px;
}
</style>
