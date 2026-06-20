import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Datasource {
  id: string
  name: string
  type: 'api' | 'upload' | 'database' | 'web'
  sourceUrl: string
  status: 'active' | 'inactive'
  description?: string
  createdAt: string
  updatedAt: string
}

export const useDatasourceStore = defineStore('datasource', () => {
  const list = ref<Datasource[]>([])
  const total = ref(0)
  const loading = ref(false)

  const setList = (data: Datasource[], count: number) => {
    list.value = data
    total.value = count
  }

  return { list, total, loading, setList }
})
