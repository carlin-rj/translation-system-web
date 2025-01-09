<template>
  <el-container class="layout-container">
    <el-header style="height: 60px;">
      <div class="header-content">
        <h1>翻译管理系统</h1>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <el-menu 
          router 
          :default-active="$route.path"
          class="el-menu-vertical">
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/projects">
            <el-icon><Folder /></el-icon>
            <span>项目管理</span>
          </el-menu-item>
          <el-menu-item index="/translations">
            <el-icon><Document /></el-icon>
            <span>翻译管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { HomeFilled, Folder, Document } from '@element-plus/icons-vue'
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.header-content {
  color: #fff;
  line-height: 60px;
}
.el-header {
  background-color: #409EFF;
  padding: 0 20px;
}
.el-aside {
  background-color: #fff;
  border-right: solid 1px #e6e6e6;
}
.el-menu {
  border-right: none;
}
.el-menu-vertical {
  height: calc(100vh - 60px);
}
</style> 