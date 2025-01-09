// 项目相关类型定义
export interface ServerProject {
  id: number
  key: string
  name: string
  description: string
  api_token: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: number
  key: string
  name: string
  description: string | null
  api_token: string | null
  translated_translations_count: number | null
  translations_count: number | null
  status: number
  created_at: string
  updated_at: string
} 