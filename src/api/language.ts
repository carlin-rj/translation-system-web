import request from '@/utils/request'
import type { CommonResp } from '@/types/common'
import type { Language } from '@/types/translation'

export interface LanguageListResponse {
  list: Language[]
  total: number
}

export const getLanguages = (params: {
  keyword?: string
  page?: number
  per_page?: number
}) => {
  return request.post<CommonResp<LanguageListResponse>>('/translation/language/list', params)
}

export const createLanguage = (data: {
  code: string
  name: string
  description?: string
}) => {
  return request.post<CommonResp<Language>>('/translation/language/create', data)
}

export const updateLanguage = (code: string, data: {
  name: string
  description?: string
}) => {
  return request.post<CommonResp<Language>>('/translation/language/update', {
    code,
    ...data
  })
}

export const deleteLanguage = (code: string) => {
  return request.post<CommonResp<void>>('/translation/language/destroy', { code })
} 

export const allLanguages = () => {
    return request.post<CommonResp<Language[]>>('/translation/language/all')
}