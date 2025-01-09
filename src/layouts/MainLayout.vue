<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <div class="navbar">
      <div class="logo">
        <el-icon><Platform /></el-icon>
        翻译管理系统
      </div>
      <el-menu
        mode="horizontal"
        :router="true"
        :default-active="activeMenu"
        class="main-menu"
      >
        <el-menu-item 
          v-for="route in menuRoutes" 
          :key="route.path"
          :index="route.path"
        >
          <el-icon v-if="route.meta?.icon">
            <component :is="route.meta.icon" />
          </el-icon>
          <span>{{ route.meta?.title }}</span>
        </el-menu-item>
      </el-menu>
      <div class="navbar-right">
        <el-dropdown>
          <span class="user-dropdown">
            <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <span class="username">管理员</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <el-icon><User /></el-icon>个人信息
              </el-dropdown-item>
              <el-dropdown-item divided>
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 多标签页 -->
    <div class="tabs-view">
      <el-tabs
        v-model="activeTab"
        type="card"
        closable
        @tab-remove="closeTab"
        @tab-click="handleTabClick"
      >
        <el-tab-pane
          v-for="tab in visitedViews"
          :key="tab.path"
          :label="tab.title"
          :name="tab.path"
          :closable="tab.path !== '/dashboard'"
        />
      </el-tabs>
    </div>

    <!-- 内容区域 -->
    <div class="main-content">
      <router-view v-slot="{ Component }">
        <keep-alive :include="cachedViews">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/stores/tagsView'
import { Platform, User, SwitchButton } from '@element-plus/icons-vue'
const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()

// 获取菜单路由
const menuRoutes = computed(() => {
  const routes = router.options.routes
  // 获取主布局下的子路由
  const mainRoute = routes.find(r => r.path === '/')
  return mainRoute?.children?.filter(child => !child.meta?.hidden) || []
})

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 当前激活的标签页
const activeTab = computed({
  get: () => route.path,
  set: (path) => {
    router.push(path)
  }
})

// 已访问的视图
const visitedViews = computed(() => tagsViewStore.visitedViews)

// 缓存的视图
const cachedViews = computed(() => tagsViewStore.cachedViews)

// 监听路由变化，添加标签页
watch(
  () => route.path,
  () => {
    const { name, path, meta } = route
    if (name) {
      tagsViewStore.addView({
        title: meta.title as string,
        name: name as string,
        path
      })
    }
  },
  { immediate: true }
)

// 关闭标签页
const closeTab = (path: string) => {
  tagsViewStore.delView(path)
  if (path === route.path) {
    const latestView = visitedViews.value.slice(-1)[0]
    if (latestView) {
      router.push(latestView.path)
    } else {
      router.push('/')
    }
  }
}

// 点击标签页
const handleTabClick = (tab: any) => {
  router.push(tab.props.name)
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 56px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-primary);
  padding-right: 24px;
  border-right: 1px solid var(--el-border-color-light);
}

.logo .el-icon {
  font-size: 24px;
}

.main-menu {
  flex: 1;
  border-bottom: none;
  margin-left: 24px;
}

.main-menu :deep(.el-menu-item) {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 56px;
  line-height: 56px;
  padding: 0 20px;
}

.main-menu :deep(.el-menu-item.is-active) {
  background-color: var(--el-color-primary-light-9);
  border-bottom-color: var(--el-color-primary);
}

.navbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0 12px;
  height: 56px;
}

.user-dropdown:hover {
  background: var(--el-color-primary-light-9);
}

.username {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.tabs-view {
  padding: 6px 16px;
  background-color: #fff;
  border-bottom: 1px solid var(--el-border-color-light);
}

.main-content {
  flex: 1;
  overflow: auto;
  background-color: var(--el-bg-color-page);
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 0;
}
</style> 