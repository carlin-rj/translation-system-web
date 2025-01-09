import type { Component } from 'vue'

export interface MenuItem {
  path: string
  name: string
  icon?: Component
  children?: MenuItem[]
}

export const menuItems: MenuItem[] = [
  {
    path: '/languages',
    name: '语言管理',
    icon: Document
  }
] 