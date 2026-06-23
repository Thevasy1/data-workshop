import { defineStore } from 'pinia'
import { ref } from 'vue'
import { preprocessLifecycle } from '@/utils/preprocess-lifecycle'
import type { Checkpoint } from '@/utils/preprocess-lifecycle'

export interface PreprocessTask {
  id: string
  name: string
  datasetId: string
  datasetName: string
  processType: 'clean' | 'dedup' | 'normalize' | 'format'
  status: 'pending' | 'running' | 'success' | 'failed'
  version: string
  createdAt: string
}

export const usePreprocessStore = defineStore('preprocess', () => {
  const list = ref<PreprocessTask[]>([])
  const total = ref(0)
  const loading = ref(false)

  const setList = (data: PreprocessTask[], count: number) => {
    list.value = data
    total.value = count
  }

  /**
   * 启动任务 — 触发生命周期钩子
   */
  const startTask = async (taskId: string) => {
    await preprocessLifecycle.emit('beforeStart', { taskId })
    /* TODO: 调用后端启动接口 */
    await preprocessLifecycle.emit('afterStart', { taskId })
  }

  /**
   * 完成任务 — 触发生命周期钩子
   */
  const completeTask = async (taskId: string) => {
    await preprocessLifecycle.emit('beforeComplete', { taskId })
    /* TODO: 调用后端完成确认接口 */
    await preprocessLifecycle.emit('afterComplete', { taskId })
  }

  /**
   * 报告检查点进度 — 供后端回调或轮询使用
   */
  const reportCheckpoint = async (checkpoint: Checkpoint) => {
    await preprocessLifecycle.emit('checkpoint', {
      taskId: checkpoint.taskId,
      checkpoint,
    })
  }

  /**
   * 回滚任务 — 触发生命周期钩子
   */
  const rollbackTask = async (taskId: string) => {
    await preprocessLifecycle.emit('rollback', { taskId })
    /* TODO: 调用后端回滚接口 */
  }

  return {
    list, total, loading,
    setList,
    startTask,
    completeTask,
    reportCheckpoint,
    rollbackTask,
  }
})
