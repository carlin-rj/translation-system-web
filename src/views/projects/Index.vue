<template>
  <div class="projects-container">
    <div class="page-header">
      <div class="left">
        <h2>项目管理</h2>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索项目名称"
          class="search-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>创建项目
      </el-button>
    </div>

    <div class="projects-grid">
      <el-card v-for="project in filteredProjects || []" 
               :key="project?.id" 
               class="project-card"
               :body-style="{ padding: '0px' }">
        <div class="card-header">
          <h3>{{ project.name }}({{project.key}})</h3>
          <div class="actions">
            <el-dropdown trigger="click">
              <el-icon class="more-icon"><MoreFilled /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="showEditDialog(project)">
                    <el-icon><Edit /></el-icon>编辑
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleDelete(project)" divided>
                    <el-icon><Delete /></el-icon>删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <div class="card-content">
          <p class="description">{{ project.description }}</p>
          <div class="token-section">
            <div class="token-label">API Token:</div>
            <el-input 
              v-model="project.api_token" 
              readonly
              size="small"
              class="token-input"
            >
              <template #append>
                <el-button @click="copyToken(project.api_token)">复制</el-button>
              </template>
            </el-input>
          </div>
          <div class="card-footer">
            <div class="stats">
              <div class="stat-item">
                <el-icon><Clock /></el-icon>
                <span>创建于: {{ formatDate(project.created_at) }}</span>
              </div>
              <div class="stat-item">
                <el-icon><Document /></el-icon>
                <span>待翻译: {{ project.translations_count }}</span>
                <el-icon><Document /></el-icon>
                <span>已翻译: {{ project.translated_translations_count }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'create' ? '创建项目' : '编辑项目'"
      v-model="dialogVisible"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        status-icon
      >
        <el-form-item 
          label="项目标识" 
          prop="key"
          v-if="dialogType === 'create'"
        >
          <el-input 
            v-model="form.key" 
            placeholder="请输入项目标识，如：wms、app"
            :maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Search, Plus, Edit, Delete, MoreFilled, Clock, Document } from '@element-plus/icons-vue'
import { getProjects, createProject, updateProject, deleteProject } from '@/api/project'
import type { Project } from '@/api/project'

const projects = ref<Project[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const searchKeyword = ref('')

const form = ref({
  id: 0,
  key: '',
  name: '',
  description: ''
})

const rules = {
  key: [
    { required: true, message: '请输入项目标识', trigger: 'blur' },
    { pattern: /^[a-z0-9_]+$/, message: '只能包含小写字母、数字和下划线', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入项目描述', trigger: 'blur' },
    { max: 200, message: '最多 200 个字符', trigger: 'blur' }
  ]
}

const filteredProjects = computed(() => {
  if (!projects.value) return []
  if (!searchKeyword.value) return projects.value
  const keyword = searchKeyword.value.toLowerCase()
  return projects.value.filter(project => 
    project.name.toLowerCase().includes(keyword) ||
    project.description.toLowerCase().includes(keyword)
  )
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 获取项目列表
const fetchProjects = async () => {
  loading.value = true
  try {
    const res = await getProjects()
    projects.value = res.data.data
    console.log(projects.value)
  } catch (error) {
    console.error('Error:', error)
    ElMessage.error('获取项目列表失败')
  } finally {
    loading.value = false
  }
}

// 显示创建对话框
const showCreateDialog = () => {
  dialogType.value = 'create'
  form.value = {
    id: 0,
    key: '',
    name: '',
    description: ''
  }
  dialogVisible.value = true
}

// 显示编辑对话框
const showEditDialog = (row: Project) => {
  dialogType.value = 'edit'
  form.value = {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description
  }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (dialogType.value === 'create') {
          await createProject(form.value)
          ElMessage.success('创建成功')
        } else {
          await updateProject(form.value.id, form.value)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchProjects()
      } catch (error) {
        ElMessage.error(dialogType.value === 'create' ? '创建失败' : '更新失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 删除项目
const handleDelete = async (row: Project) => {
  try {
    await ElMessageBox.confirm(
      '删除后将无法恢复，是否确认删除？', 
      '警告', 
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await deleteProject(row.id)
    ElMessage.success('删除成功')
    fetchProjects()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 复制 API Token
const copyToken = async (token: string) => {
  try {
    await navigator.clipboard.writeText(token)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

fetchProjects()
</script>

<style scoped>
.projects-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header .left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

.search-input {
  width: 300px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.project-card {
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: #f5f7fa;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: 0.25px;
}

.card-content {
  padding: 16px;
}

.description {
  color: var(--text-regular);
  margin-bottom: 16px;
  min-height: 40px;
  line-height: 1.6;
  font-size: 0.875rem;
}

.token-section {
  margin-bottom: 16px;
}

.token-label {
  font-size: 0.875rem;
  color: var(--text-regular);
  margin-bottom: 8px;
  font-weight: 500;
}

.token-input :deep(.el-input__wrapper) {
  background-color: #f5f7fa;
}

.card-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.stats {
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
  font-size: 0.813rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.more-icon {
  font-size: 20px;
  color: #909399;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.more-icon:hover {
  background-color: #e4e7ed;
  color: #409EFF;
}

:deep(.el-dropdown-menu__item i) {
  margin-right: 8px;
}
</style> 