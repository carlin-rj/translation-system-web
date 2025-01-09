import request from '@/utils/request'
import { mockApi } from '@/mock/translation'
import type { ServerTranslation, AutoTranslation, TranslationListResponse, StatusCount } from '@/types/translation'
import type { CommonResp } from '@/types/common'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

// 实际 API 实现
const api = {
  getTranslations: (params: {
    project_key?: string
    language?: string
    page?: number
    prePage?: number
  }) => {
    return request.post<CommonResp<TranslationListResponse>>('/translation/list', params)
  },

  createTranslation: (data: {
    project_key: string
    language: string
    key: string
    sourceText: string
    targetText?: string
  }) => {
    return request.post<CommonResp<ServerTranslation>>('/translation/create', data)
  },

  updateTranslation: (id: number, data: {
    targetText: string
  }) => {
    return request.post<CommonResp<ServerTranslation>>('/translation/update', {
      id,
      ...data
    })
  },

  deleteTranslation: (id: number) => {
    return request.post<CommonResp<void>>('/translation/destroy', { id })
  },

  autoTranslate: (params: {
    sourceText: string
    targetLang: string
  }) => {
    return request.post<CommonResp<AutoTranslation[]>>('/translation/auto-translate', params)
  },

  executeTranslation: (params: {
    drive: string
    query: string
    to: string
  }) => {
    return request.post<CommonResp<string>>('/translation/executeTranslation', params)
  },

  getTranslationStatusCounts: (params: {
    project_key?: string
    language?: string
  }) => {
    return request.post<CommonResp<StatusCount[]>>('/translation/statusCounts', params)
  },

  getNextPendingTranslation: (params: {
    project_key?: string
    language?: string
  }) => {
    return request.post<CommonResp<ServerTranslation>>('/translation/nextPendingTranslation', params)
  }
}

export const {
  getTranslations,
  createTranslation,
  updateTranslation,
  deleteTranslation,
  autoTranslate,
  getLanguages,
  executeTranslation,
  getTranslationStatusCounts,
  getNextPendingTranslation
} = useMock ? mockApi : api 