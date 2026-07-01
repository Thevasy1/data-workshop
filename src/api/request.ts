import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 8000,
})

request.interceptors.response.use((response) => response.data)

export default request
