import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { Document, Folder } from '@element-plus/icons-vue'
import type { Component } from 'vue'

export interface RouteMetaType {
  title: string
  icon?: Component
  hidden?: boolean
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      redirect: '/translations',
      children: [
        {
          path: '/translations',
          name: 'translations',
          component: () => import('@/views/translations/Index.vue'),
          meta: {
            title: '翻译管理',
            icon: Document
          }
        },
        {
          path: '/projects',
          name: 'projects',
          component: () => import('@/views/projects/Index.vue'),
          meta: {
            title: '项目管理',
            icon: Folder
          }
        },
        {
          path: '/languages',
          name: 'languages',
          component: () => import('@/views/languages/Index.vue'),
          meta: {
            title: '语言管理',
            icon: Document
          }
        },
        {
          path: '/translate-mode',
          name: 'translate-mode',
          component: () => import('@/views/translate-mode/Index.vue'),
          meta: {
            title: '翻译模式',
            hidden: true
          }
        }
      ]
    }
  ]
})

export default router 