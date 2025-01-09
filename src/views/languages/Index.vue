<template>
  <div class="languages-container">
    <div class="page-header">
      <div class="left">
        <div class="search-group">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索语言"
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="handleSearch">
            搜索
          </el-button>
        </div>
      </div>
      <div class="right">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>添加语言
        </el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="languages"
      border
      style="width: 100%"
    >
      <el-table-column prop="code" label="语言代码" width="120" />
      <el-table-column prop="name" label="语言名称" min-width="150" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑语言对话框 -->
    <el-dialog
      v-model="showDialog"
      :title="isEdit ? '编辑语言' : '添加语言'"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="语言代码" prop="code">
          <el-input v-model="form.code" placeholder="例如：en" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="语言名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：英语" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import type { Language } from '@/types/translation'
import { getLanguages, createLanguage, updateLanguage, deleteLanguage } from '@/api/language'

// 基础状态
const loading = ref(false)
const languages = ref<Language[]>([])
const searchKeyword = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 表单相关
const showDialog = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = ref({
  code: '',
  name: '',
})

// 表单校验规则
const rules = {
  code: [
    { required: true, message: '请输入语言代码', trigger: 'blur' },
    { pattern: /^[a-z]{2}(-[A-Z]{2})?$/, message: '语言代码格式不正确', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入语言名称', trigger: 'blur' }
  ]
}

// 获取语言列表
const fetchLanguages = async () => {
  loading.value = true
  try {
    const res = await getLanguages({
      keyword: searchKeyword.value,
      page: currentPage.value,
      per_page: pageSize.value
    })
    if (res.data.data) {
      languages.value = res.data.data.list
      total.value = res.data.data.total
    }
  } catch (error) {
    console.error('获取语言列表失败:', error)
    ElMessage.error('获取语言列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchLanguages()
}

// 添加语言
const handleAdd = () => {
  isEdit.value = false
  showDialog.value = true
  form.value = {
    code: '',
    name: '',
  }
}

// 编辑语言
const handleEdit = (row: Language) => {
  isEdit.value = true
  showDialog.value = true
  form.value = {
    code: row.code,
    name: row.name,
  }
}

// 删除语言
const handleDelete = async (row: Language) => {
  try {
    await ElMessageBox.confirm('确定要删除该语言吗？', '提示', {
      type: 'warning'
    })
    await deleteLanguage(row.code)
    ElMessage.success('删除成功')
    fetchLanguages()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value) {
          await updateLanguage(form.value.code, {
            name: form.value.name,
          })
        } else {
          await createLanguage(form.value)
        }
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
        showDialog.value = false
        fetchLanguages()
      } catch (error) {
        console.error(isEdit.value ? '更新失败:' : '创建失败:', error)
        ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 处理分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchLanguages()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchLanguages()
}

// 初始化
onMounted(() => {
  fetchLanguages()
})
</script>

<style scoped>
.languages-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.search-group {
  display: flex;
  gap: 8px;
}

.search-input {
  width: 300px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding: 0 20px;
}
</style> 