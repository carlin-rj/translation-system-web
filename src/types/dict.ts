// 字典项
export interface DictItem {
  description: string
  value: string | number
}

// 字典
export interface Dict {
  name: string
  description: string
  data: DictItem[]
} 