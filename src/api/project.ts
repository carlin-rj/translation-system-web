import request from '@/utils/request'
import { mockApi } from '@/mock/project'
import type { Project } from '@/types/project'
import type { CommonResp } from '@/types/common'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

// 实际 API 实现
const api = {
  getProjects: () => {
    return request.post<CommonResp<Project[]>>('/translation/project/all')
  },

  createProject: (data: {
    key: string
    name: string
    description: string
  }) => {
    return request.post<CommonResp<Project>>('/translation/project/create', data)
  },

  updateProject: (id: number, data: {
    name: string
    description: string
  }) => {
    return request.post<CommonResp<void>>('/translation/project/update', {
      id,
      ...data
    })
  },

  deleteProject: (id: number) => {
    return request.post<CommonResp<void>>('/translation/project/destroy', { id })
  }
}

export const {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} = useMock ? mockApi : api 