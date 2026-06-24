import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 可在此添加 token 等统一请求头
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data as ApiResponse<unknown>
    if (code !== 0) {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message))
    }
    return data as any
  },
  (error) => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return service.get<unknown, T>(url, config)
  },
  post<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig) {
    return service.post<unknown, T>(url, data, config)
  },
  put<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig) {
    return service.put<unknown, T>(url, data, config)
  },
  patch<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig) {
    return service.patch<unknown, T>(url, data, config)
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return service.delete<unknown, T>(url, config)
  },
}

export default request
