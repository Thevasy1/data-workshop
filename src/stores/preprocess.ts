import { defineStore } from 'pinia'
import { ref } from 'vue'

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

  return { list, total, loading, setList }
})
