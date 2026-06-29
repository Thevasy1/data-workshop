import request from '@/utils/request'

export interface StatsData {
  datasourceCount: number
  datasetCount: number
  preprocessCount: number
  todayTaskCount: number
  successRate: number
  failedTaskCount: number
}

export interface TrendData {
  dates: string[]
  datasetCreated: number[]
  preprocessCompleted: number[]
}

export interface DistributionData {
  datasourceTypeStats: Array<{ type: string; count: number }>
  datasetStatusStats: Array<{ status: string; count: number }>
  preprocessStatusStats: Array<{ status: string; count: number }>
}

export interface RecentTask {
  id: string
  name: string
  type: string
  status: string
  createdAt: string
  owner?: string
}

// 由于响应拦截器已解包，直接返回泛型 T，而不是 AxiosResponse<T>
export const getStats = () => request.get<StatsData>('/dashboard/stats')
export const getTrend = () => request.get<TrendData>('/dashboard/trend')
export const getDistribution = () => request.get<DistributionData>('/dashboard/distribution')
export const getRecentTasks = () => request.get<RecentTask[]>('/dashboard/recent-tasks')
