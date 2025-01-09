import type { Project } from '@/types/project'
import type { CommonResp } from '@/types/common'

export const mockApi = {
  getProjects: () => {
    return new Promise<{data: CommonResp<Project[]>}>((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            state: '000001',
            msg: null,
            data: [
              {
                id: 1,
                key: 'wms',
                name: 'WMS 系统',
                description: 'WMS 系统的多语言翻译项目',
                api_token: 'wms_token_123456789',
                created_at: '2024-03-20 10:00:00',
                updated_at: '2024-03-20 10:00:00'
              },
              {
                id: 2,
                key: 'app',
                name: 'APP 端',
                description: '移动应用的多语言翻译',
                api_token: 'app_token_987654321',
                created_at: '2024-03-20 11:00:00',
                updated_at: '2024-03-20 11:00:00'
              }
            ],
            request_id: `mock_${Date.now()}`
          }
        })
      }, 500)
    })
  },

  createProject: (data: {
    name: string
    description: string
  }) => {
    return new Promise<{data: CommonResp<Project>}>((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            state: '000001',
            msg: null,
            data: {
              id: Date.now(),
              name: data.name,
              description: data.description,
              api_token: `token_${Date.now()}`,
              created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
              updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            },
            request_id: `mock_${Date.now()}`
          }
        })
      }, 500)
    })
  },

  updateProject: (id: number, data: {
    name: string
    description: string
  }) => {
    return new Promise<{data: CommonResp<Project>}>((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            state: '000001',
            msg: null,
            data: {
              id,
              name: data.name,
              description: data.description,
              api_token: `token_${id}`,
              created_at: '2024-03-20 10:00:00',
              updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            },
            request_id: `mock_${Date.now()}`
          }
        })
      }, 500)
    })
  },

  deleteProject: (id: number) => {
    return new Promise<{data: CommonResp<void>}>((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            state: '000001',
            msg: null,
            data: null,
            request_id: `mock_${Date.now()}`
          }
        })
      }, 500)
    })
  }
} 