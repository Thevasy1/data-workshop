import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Dataset {
  id: string
  name: string
  datasourceId: string
  datasourceName: string
  collectStatus: 'pending' | 'running' | 'success' | 'failed' | 'paused'
  collectProgress: number
  recordCount: number
  createdAt: string
}

export const useDatasetStore = defineStore('dataset', () => {
  const list = ref<Dataset[]>([])
  const total = ref(0)
  const loading = ref(false)

  const setList = (data: Dataset[], count: number) => {
    list.value = data
    total.value = count
  }

  return { list, total, loading, setList }
})
