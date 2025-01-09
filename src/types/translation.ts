export interface ServerTranslation {
  id: number
  project_key: string
  key: string
  source_text: string
  target_text: string | null
  language: string
  language_name: string
  status: number
  status_text: string
  created_at: string
  updated_at: string
}

export interface TranslationListResponse {
  list: ServerTranslation[]
  total: number
  page: number
  prePage: number
}

// 自动翻译结果
export interface AutoTranslation {
  channel: string
  text: string
  success: boolean
  error?: string
}

// 添加新的请求类型
export interface ExecuteTranslationParams {
  drive: string
  query: string
  to: string
  from?: string
}

// 更新 API 函数的参数类型
export interface TranslationParams {
  projectKey?: string
  language?: string
}

export interface CreateTranslationData {
  projectKey: string
  language: string
  key: string
  sourceText: string
  targetText?: string
}

export interface UpdateTranslationData {
  id: number
  targetText: string
}

export interface AutoTranslateParams {
  sourceText: string
  targetLang: string
}

export interface Language {
  code: string
  name: string
} 

export interface StatusCount {
  code: number
  name: string
  count: number
}

// 修改翻译执行结果类型
export interface ExecuteTranslationResult {
  success: boolean
  text: string
  error?: string
}
