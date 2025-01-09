import request from '@/utils/request'
import { mockApi } from '@/mock/dict'
import type { Dict } from '@/types/dict'
import type { CommonResp } from '@/types/common'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

const api = {
  getDicts: () => {
    return request.post<CommonResp<Dict[]>>('/common/dict/all')
  }
}

export const { getDicts } = useMock ? mockApi : api 