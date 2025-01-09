import type { Dict, DictItem } from '@/types/dict'

// 字典缓存
let dictCache: Dict[] = []

// 初始化字典数据
export const initDictCache = (dicts: Dict[]) => {
  dictCache = dicts
}

// 获取字典项
export const getDictItems = (name: string): DictItem[] => {
  const dict = dictCache.find(d => d.name === name)
  return dict?.data || []
}

// 获取字典项的标签
export const getDictLabel = (name: string, value: string | number): string => {
  const items = getDictItems(name)
  return items.find(item => item.code === value)?.name || ''
} 