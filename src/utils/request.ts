import axios, { type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

service.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob') {
      return response.data
    }

    const { code, data, message } = response.data
    if (code !== 0) {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message))
    }
    return data
  },
  (error) => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

type RequestMethod = <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>
type RequestMethodWithData = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>

const request = {
  request<T = any>(config: AxiosRequestConfig) {
    return service.request<any, T>(config)
  },
  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return service.get<any, T>(url, config)
  },
  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return service.delete<any, T>(url, config)
  },
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return service.post<any, T>(url, data, config)
  },
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return service.put<any, T>(url, data, config)
  },
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return service.patch<any, T>(url, data, config)
  },
} as {
  request: <T = any>(config: AxiosRequestConfig) => Promise<T>
  get: RequestMethod
  delete: RequestMethod
  post: RequestMethodWithData
  put: RequestMethodWithData
  patch: RequestMethodWithData
}

export default request
