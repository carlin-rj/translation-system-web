import { defineStore } from 'pinia'

interface TagView {
  title: string
  name: string
  path: string
}

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: [] as TagView[],
    cachedViews: [] as string[]
  }),

  actions: {
    addView(view: TagView) {
      // 添加到已访问视图
      if (!this.visitedViews.some(v => v.path === view.path)) {
        this.visitedViews.push(view)
      }
      // 添加到缓存视图
      if (!this.cachedViews.includes(view.name)) {
        if (view.name) {
          this.cachedViews.push(view.name)
        }
      }
    },

    delView(path: string) {
      // 从已访问视图中删除
      const index = this.visitedViews.findIndex(v => v.path === path)
      if (index > -1) {
        const view = this.visitedViews[index]
        this.visitedViews.splice(index, 1)
        // 从缓存视图中删除
        const cacheIndex = this.cachedViews.indexOf(view.name)
        if (cacheIndex > -1) {
          this.cachedViews.splice(cacheIndex, 1)
        }
      }
    },

    delOthersViews(path: string) {
      this.visitedViews = this.visitedViews.filter(
        item => item.path === path
      )
      this.cachedViews = this.cachedViews.filter(
        name => this.visitedViews.some(v => v.name === name)
      )
    },

    delAllViews() {
      this.visitedViews = []
      this.cachedViews = []
    }
  }
}) 