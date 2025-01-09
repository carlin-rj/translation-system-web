// 通用响应结构
export interface CommonResp<T> {
  state: string
  msg: string | null
  data: T | null
  request_id: string | null
} 