<template>
  <div class="home">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>多语言翻译管理系统</h2>
        </div>
      </template>
      <div class="card-content">
        <p>欢迎使用多语言翻译管理系统</p>
        <el-row class="mt-4">
          <el-col :span="12">
            <el-card>
              <h3>项目总数</h3>
              <div class="number">0</div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <h3>待翻译条目</h3>
              <div class="number">0</div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.home {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  text-align: center;
  margin-top: 10px;
}
.mt-4 {
  margin-top: 20px;
}
</style> 