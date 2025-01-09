import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // 从环境变量获取 API 地址
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 可以在这里添加 token 等认证信息
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 如果是下载请求，直接返回响应
    if (response.config.responseType === 'blob') {
      return response
    }

    const res = response.data
    
    // 这里可以根据后端的响应格式进行调整
    if (res.state === '000001') {
      return response
    }
    
    ElMessage.error(res.msg || '请求失败')
    return Promise.reject(new Error(res.msg || '请求失败'))
  },
  (error) => {
    console.error('Response error:', error)
    ElMessage.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

// 下载文件的方法
export const downloadFile = async (url: string, data: any, fileName?: string) => {
  try {
    const response = await service.post(url, data, {
      responseType: 'blob'
    })

    // 创建 blob
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] 
    })
    
    // 获取文件名
    const downloadFileName = fileName || getFileNameFromResponse(response)
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute('download', downloadFileName)
    document.body.appendChild(link)
    link.click()
    
    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(link.href)

    return true
  } catch (error) {
    console.error('Download failed:', error)
    throw error
  }
}

// 从响应头中获取文件名
const getFileNameFromResponse = (response: AxiosResponse): string => {
  const contentDisposition = response.headers['content-disposition']
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
    if (fileNameMatch) {
      return fileNameMatch[1]
    }
  }
  return 'download.zip'
}

export default service 