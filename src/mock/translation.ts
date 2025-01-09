import type { ServerTranslation, AutoTranslation } from '@/types/translation'
import type { CommonResp } from '@/types/common'
import { getDictLabel } from '@/utils/dict'

// 模拟数据存储 (使用下划线格式)
const mockTranslations: ServerTranslation[] = [
  {
    id: 1,
    project_key: 'wms',
    key: 'common.submit',
    source_text: '提交',
    target_text: 'Submit',
    language: 'en',
    language_name: 'English',
    status: 1,
    status_text: '已翻译',
    created_at: '2024-03-20 10:00:00',
    updated_at: '2024-03-20 10:00:00'
  }
]

export const mockApi = {
  getTranslations: (params: {
    projectKey?: string
    language?: string
  }) => {
    return new Promise<{data: CommonResp<ServerTranslation[]>}>((resolve) => {
      setTimeout(() => {
        let filtered = [...mockTranslations]
        
        if (params.projectKey) {
          filtered = filtered.filter(t => t.project_key === params.projectKey)
        }
        
        if (params.language) {
          filtered = filtered.filter(t => t.language === params.language)
        }

        resolve({
          data: {
            state: '000001',
            msg: null,
            data: filtered,
            request_id: `mock_${Date.now()}`
          }
        })
      }, 500)
    })
  },

  createTranslation: (data: {
    projectKey: string
    language: string
    key: string
    sourceText: string
    targetText?: string
  }) => {
    return new Promise<{data: CommonResp<ServerTranslation>}>((resolve) => {
      setTimeout(() => {
        const newTranslation: ServerTranslation = {
          id: Date.now(),
          project_key: data.projectKey,
          key: data.key,
          source_text: data.sourceText,
          target_text: data.targetText || null,
          language: data.language,
          language_name: getDictLabel('languages', data.language),
          status: data.targetText ? 1 : 0,
          created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
          updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
        mockTranslations.push(newTranslation)
        resolve({
          data: {
            state: '000001',
            msg: null,
            data: newTranslation,
            request_id: `mock_${Date.now()}`
          }
        })
      }, 500)
    })
  },

  updateTranslation: (id: number, data: {
    targetText: string
  }) => {
    return new Promise<{data: CommonResp<ServerTranslation>}>((resolve, reject) => {
      setTimeout(() => {
        const index = mockTranslations.findIndex(t => t.id === id)
        if (index > -1) {
          const updated = {
            ...mockTranslations[index],
            target_text: data.targetText,
            status: data.targetText ? 1 : 0,
            updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }
          mockTranslations[index] = updated
          resolve({
            data: {
              state: '000001',
              msg: null,
              data: updated,
              request_id: `mock_${Date.now()}`
            }
          })
        } else {
          reject(new Error('翻译不存在'))
        }
      }, 500)
    })
  },

  deleteTranslation: (id: number) => {
    return new Promise<{data: CommonResp<void>}>((resolve, reject) => {
      setTimeout(() => {
        const index = mockTranslations.findIndex(t => t.id === id)
        if (index > -1) {
          mockTranslations.splice(index, 1)
          resolve({
            data: {
              state: '000001',
              msg: null,
              data: null,
              request_id: `mock_${Date.now()}`
            }
          })
        } else {
          reject(new Error('翻译不存在'))
        }
      }, 500)
    })
  },

  autoTranslate: (params: {
    sourceText: string
    targetLang: string
  }) => {
    return new Promise<{data: CommonResp<AutoTranslation[]>}>((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            state: '000001',
            msg: null,
            data: [
              { channel: 'google', text: `Google: ${params.sourceText}` },
              { channel: 'baidu', text: `Baidu: ${params.sourceText}` },
              { channel: 'youdao', text: `Youdao: ${params.sourceText}` }
            ],
            request_id: `mock_${Date.now()}`
          }
        })
      }, 1000)
    })
  }
} 