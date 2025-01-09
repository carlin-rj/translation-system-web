<template>
  <div class="translations-container">
    <div class="page-header">
      <div class="left">
        <translation-filter
          v-model="filter"
          :projects="projects"
          :languages="languages"
          :translations="translations"
          @search="handleSearch"
        />
      </div>
      <div class="right">
        <el-dropdown @command="handleExport" trigger="click">
          <el-button type="primary">
            <el-icon><Download /></el-icon>
             翻译导出
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item 
                v-for="item in exportTypes" 
                :key="item.code" 
                :command="item.code"
              >
                {{ item.name }}
              </el-dropdown-item>

              <!-- <el-dropdown-item command="laravel">Laravel</el-dropdown-item>
              <el-dropdown-item command="vue">Vue</el-dropdown-item>
              <el-dropdown-item command="android">Android</el-dropdown-item>
              <el-dropdown-item command="ios">iOS</el-dropdown-item> -->
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button type="primary" @click="$router.push('/translate-mode')">
          <el-icon><Edit /></el-icon>进入翻译模式
        </el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>添加翻译
        </el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="filteredTranslations"
      border
      style="width: 100%"
    >
    <el-table-column prop="project_name" label="项目" min-width="150" />
      <el-table-column prop="key" label="翻译 Key" min-width="150" />
      <el-table-column prop="source_text" label="原文" min-width="200" show-overflow-tooltip />
      <el-table-column prop="language_name" label="语种" width="100" />
      <el-table-column label="译文" min-width="300">
        <template #default="{ row }">
          <template v-if="row.editing">
            <div class="translation-edit">
              <div class="edit-header">
                <span class="title">当前译文</span>
                <div class="button-group">
                  <el-button 
                    type="default" 
                    link 
                    @click="cancelEditing(row)"
                  >
                    取消
                  </el-button>
                  <el-button 
                    type="primary" 
                    link 
                    @click="handleSaveTranslation(row)"
                    :disabled="!row.editingText"
                  >
                    保存
                  </el-button>
                </div>
              </div>
              <el-input
                v-model="row.editingText"
                type="textarea"
                :rows="2"
              />
            </div>
            
            <div class="auto-translations">
              <div class="section-title">
                <span>机器翻译结果</span>
                <el-button v-if="!row.autoTranslations" type="primary" link size="small" @click="getEditAutoTranslations(row)">
                  获取翻译建议
                </el-button>
              </div>
              <div v-if="row.autoTranslating" class="auto-translating">
                <el-icon class="is-loading"><Loading /></el-icon>
                正在获取翻译结果...
              </div>
              <template v-else-if="row.autoTranslations?.length">
                <div 
                  v-for="item in row.autoTranslations" 
                  :key="item.channel"
                  class="auto-translation-item"
                  :class="{ active: row.editingText === item.text }"
                  @click="selectEditAutoTranslation(row, item)"
                >
                  <div class="channel">
                    {{ item.channel }}
                    <el-tooltip v-if="!item.success" :content="item.error" placement="top">
                      <el-icon class="error-icon"><Warning /></el-icon>
                    </el-tooltip>
                  </div>
                  <div class="text">{{ item.success ? item.text : '翻译失败' }}</div>
                  <el-button 
                    v-if="item.success"
                    type="primary" 
                    link 
                    size="small"
                  >
                    使用此译文
                  </el-button>
                </div>
              </template>
            </div>
          </template>
          <div v-else class="translation-text" @click="startEditing(row)">
            {{ row.target_text || '点击添加翻译' }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status_text" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'warning'">
            {{ row.status_text }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column prop="updated_at" label="更新时间" width="180" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" link @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加翻译对话框 -->
    <el-dialog
      v-model="showCreate"
      title="添加翻译"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="项目" prop="project_key">
          <el-select v-model="createForm.project_key" placeholder="选择项目">
            <el-option
              v-for="project in projects"
              :key="project.key"
              :label="project.name"
              :value="project.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="翻译Key" prop="key">
          <el-input v-model="createForm.key" placeholder="例如：common.submit" />
        </el-form-item>
        <el-form-item label="源文本" prop="source_text">
          <el-input
            v-model="createForm.source_text"
            type="textarea"
            :rows="2"
            placeholder="请输入中文文本"
          />
        </el-form-item>
        <el-form-item label="目标语种" prop="languages">
          <el-select
            v-model="createForm.languages"
            multiple
            filterable
            placeholder="选择目标语种"
            @change="handleLanguagesChange"
          >
            <el-option
              v-for="lang in languages"
              :key="lang.code"
              :label="lang.name"
              :value="lang.code"
            >
              <span>{{ lang.name }}</span>
              <span class="language-description">{{ lang.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 多语种翻译结果 -->
        <template v-if="createForm.languages.length">
          <div class="translations-preview">
            <div class="translations-header">
              <h3>翻译预览</h3>
              <el-button 
                type="primary" 
                link 
                :loading="isGettingAllTranslations"
                @click="getAllAutoTranslations"
              >
                一键获取所有翻译建议
              </el-button>
            </div>

            <div v-for="lang in createForm.languages" :key="lang" class="lang-group">
              <div class="lang-header">
                <span class="lang-title">{{ languages.find(l => l.code === lang)?.name || lang }}</span>
                <el-button type="primary" link size="small" @click="getCreateAutoTranslations(lang)">
                  获取翻译建议
                </el-button>
              </div>
              
              <el-input
                v-model="createForm.translations[lang]"
                type="textarea"
                :rows="2"
                :placeholder="`请输入${languages.find(l => l.code === lang)?.name || lang}译文`"
              />

              <!-- 自动翻译结果 -->
              <div v-if="createForm.autoTranslations[lang]?.length" class="auto-translations">
                <div 
                  v-for="item in createForm.autoTranslations[lang]"
                  :key="item.channel"
                  class="auto-translation-item"
                  :class="{ active: createForm.translations[lang] === item.text }"
                  @click="selectCreateAutoTranslation(lang, item)"
                >
                  <div class="channel">
                    {{ item.channel }}
                    <el-tooltip v-if="!item.success" :content="item.error" placement="top">
                      <el-icon class="error-icon"><Warning /></el-icon>
                    </el-tooltip>
                  </div>
                  <div class="text">{{ item.success ? item.text : '翻译失败' }}</div>
                  <el-button 
                    v-if="item.success"
                    type="primary" 
                    link 
                    size="small"
                  >
                    使用此译文
                  </el-button>
                </div>
              </div>

              <div v-if="createForm.translating[lang]" class="translating">
                <el-icon class="is-loading"><Loading /></el-icon>
                正在获取翻译结果...
              </div>
            </div>
          </div>
        </template>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreate = false">取消</el-button>
          <el-button type="primary" @click="handleCreate" :loading="creating">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 在表格后添加分页组件 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Plus, Loading, Edit, Warning, Download, ArrowDown } from '@element-plus/icons-vue'
import type { Project } from '@/types/project'
import type { ServerTranslation, AutoTranslation, Language } from '@/types/translation'
import { getDictItems } from '@/utils/dict'
import { getProjects } from '@/api/project'
import { 
  getTranslations, 
  createTranslation, 
  updateTranslation, 
  deleteTranslation,
  executeTranslation
} from '@/api/translation'
import { allLanguages } from '@/api/language'
import TranslationFilter from './components/TranslationFilter.vue'
import { downloadFile } from '@/utils/request'


// 基础状态
const loading = ref(false)
const translations = ref<ServerTranslation[]>([])
const projects = ref<Project[]>([])

// 添加翻译相关的状态
const showCreate = ref(false)
const createFormRef = ref<FormInstance>()
const creating = ref(false)
const createForm = ref({
  project_key: '',
  key: '',
  source_text: '',
  languages: [] as string[],
  translations: {} as Record<string, string>,
  autoTranslations: {} as Record<string, AutoTranslation[]>,
  translating: {} as Record<string, boolean>
})
const exportTypes = getDictItems('ExportTypeEnum')


// 过滤后的翻译列表
const filteredTranslations = computed(() => {
  if (!translations.value) return []
  let result = translations.value
  
  // 按状态筛选
  if (filter.value.status !== -1) {
    result = result.filter(item => item.status === filter.value.status)
  }
  
  // 按关键词搜索
  if (filter.value.keyword) {
    const keyword = filter.value.keyword.toLowerCase()
    result = result.filter(item => 
      item.key.toLowerCase().includes(keyword) ||
      item.source_text.toLowerCase().includes(keyword) ||
      (item.targetText && item.targetText.toLowerCase().includes(keyword))
    )
  }
  
  return result
})

// 获取项目列表
const fetchProjects = async () => {
  try {
    const res = await getProjects()
    if (res.data.data) {
      projects.value = res.data.data
      if (projects.value.length > 0 && !filter.value.project) {
        filter.value.project = projects.value[0].key
      }
    }
  } catch (error) {
    console.error('获取项目列表失败:', error)
  }
}

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 获取翻译列表
const fetchTranslations = async () => {
  loading.value = true
  try {
    const res = await getTranslations({
      project_key: filter.value.project || undefined,
      language: filter.value.language || undefined,
      status: filter.value.status >= 0 ? filter.value.status : undefined,
      page: currentPage.value,
      per_page: pageSize.value
    })
    if (res.data.data) {
      translations.value = res.data.data.list.map(item => ({
        ...item,
        editing: false,
        editingText: undefined,
        autoTranslations: undefined
      }))
      total.value = res.data.data.total
    }
  } catch (error) {
    console.error('获取翻译列表失败:', error)
    ElMessage.error('获取翻译列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索功能
const handleSearch = () => {
  currentPage.value = 1
  fetchTranslations()
}

// 开始编辑
const startEditing = (row: ServerTranslation & { 
  editing?: boolean
  editingText?: string
  autoTranslations?: AutoTranslation[]
  autoTranslating?: boolean
}) => {
  row.editing = true
  row.editingText = row.target_text || ''
  // 不再自动获取翻译，改为手动触发
}

// 添加翻译驱动状态
const currentProviderIndex = ref(0)

// 获取翻译建议 - 编辑模式
const getEditAutoTranslations = async (row: ServerTranslation & {
  editingText?: string
  autoTranslations?: AutoTranslation[]
  autoTranslating?: boolean
}) => {
  row.autoTranslating = true
  row.autoTranslations = []
  currentProviderIndex.value = 0
  
  const providers = getDictItems('TranslationProviderEnum')
  
  const executeNextTranslation = async () => {
    if (currentProviderIndex.value >= providers.length) {
      row.autoTranslating = false
      return
    }

    const provider = providers[currentProviderIndex.value]
    try {
      const res = await executeTranslation({
        drive: provider.code as string,
        query: row.source_text,
        to: row.language
      })
      
      row.autoTranslations?.push({
        channel: provider.name as string,
        text: res.data.data.text,
        success: res.data.data.success,
        error: res.data.data.error
      })
    } catch (error) {
      console.error(`${provider.name}翻译失败:`, error)
    } finally {
      currentProviderIndex.value++
      await executeNextTranslation()
    }
  }

  await executeNextTranslation()
}

// 获取翻译建议 - 创建模式
const getCreateAutoTranslations = async (lang: string) => {
  createForm.value.translating[lang] = true
  createForm.value.autoTranslations[lang] = []
  currentProviderIndex.value = 0

  const providers = getDictItems('TranslationProviderEnum')
  const executeNextTranslation = async () => {
    if (currentProviderIndex.value >= providers.length) {
      createForm.value.translating[lang] = false
      return
    }

    const provider = providers[currentProviderIndex.value]
    try {
      const res = await executeTranslation({
        drive: provider.code as string,
        query: createForm.value.source_text,
        to: lang
      })
      
      createForm.value.autoTranslations[lang].push({
        channel: provider.name as string,
        text: res.data.data.text,
        success: res.data.data.success,
        error: res.data.data.error
      })
    } catch (error) {
      console.error(`${provider.name}翻译失败:`, error)
    } finally {
      currentProviderIndex.value++
      await executeNextTranslation()
    }
  }

  await executeNextTranslation()
}

// 编辑时选择自动翻译结果
const selectEditAutoTranslation = (row: ServerTranslation & {
  editingText?: string
}, translation: AutoTranslation) => {
  if (translation.success) {
    row.editingText = translation.text
  }
}

// 添加时选择自动翻译结果
const selectCreateAutoTranslation = (lang: string, translation: AutoTranslation) => {
  if (translation.success) {
    createForm.value.translations[lang] = translation.text
  }
}

// 保存译文
const handleSaveTranslation = async (row: ServerTranslation & { 
  editing?: boolean
  editingText?: string
  autoTranslations?: AutoTranslation[]
}) => {
  if (!row.editingText) return
  
  try {
    await updateTranslation(row.id, {
      target_text: row.editingText
    })
    
    // 更新本地数据
    row.target_text = row.editingText
    row.status = row.editingText ? 1 : 0
    row.editing = false
    row.autoTranslations = undefined  // 清除自动翻译结果
    
    ElMessage.success('更新成功')
  } catch (error) {
    console.error('更新翻译失败:', error)
    ElMessage.error('更新失败')
  }
}

// 删除翻译
const handleDelete = async (row: Translation) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条翻译吗？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await deleteTranslation(row.id)
    ElMessage.success('删除成功')
    
    // 如果当前页只有一条数据且不是第一页，则跳转到上一页
    if (translations.value.length === 1 && currentPage.value > 1) {
      currentPage.value--
    }
    fetchTranslations()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除翻译失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 添加语言列表状态
const languages = ref<Language[]>([])

// 获取语言列表
const fetchLanguages = async () => {
  try {
    const res = await allLanguages()
    if (res.data.data) {
      languages.value = res.data.data
    }
  } catch (error) {
    console.error('获取语言列表失败:', error)
    ElMessage.error('获取语言列表失败')
  }
}

// 初始化时获取语言列表
onMounted(async () => {
  await fetchLanguages()
  await fetchProjects()
  await fetchTranslations()
})

// 表单校验规则
const createRules = {
  project_key: [{ required: true, message: '请选择项目', trigger: 'change' }],
  key: [{ required: true, message: '请输入翻译Key', trigger: 'blur' }],
  source_text: [{ required: true, message: '请输入源文本', trigger: 'blur' }],
  languages: [{ required: true, message: '请选择目标语种', trigger: 'change' }]
}

// 处理语种变化
const handleLanguagesChange = (langs: string[]) => {
  // 初始化新语种的翻译
  langs.forEach(lang => {
    if (!createForm.value.translations[lang]) {
      createForm.value.translations[lang] = ''
    }
  })
  // 清理已移除的语种
  Object.keys(createForm.value.translations).forEach(lang => {
    if (!langs.includes(lang)) {
      delete createForm.value.translations[lang]
      delete createForm.value.autoTranslations[lang]
    }
  })
}

// 创建翻译
const handleCreate = async () => {
  const formRef = createFormRef.value
  if (!formRef) return
  
  try {
    await formRef.validate()
    
    creating.value = true
    // 为每个选中的语种创建翻译
    const promises = createForm.value.languages.map(lang => 
      createTranslation({
        project_key: createForm.value.project_key,
        key: createForm.value.key,
        source_text: createForm.value.source_text,
        language: lang,
        target_text: createForm.value.translations[lang]
      })
    )
    
    await Promise.all(promises)
    ElMessage.success('创建成功')
    showCreate.value = false
    fetchTranslations()
    
    // 重置表单
    createForm.value = {
      project_key: '',
      key: '',
      source_text: '',
      languages: [],
      translations: {},
      autoTranslations: {},
      translating: {}
    }
    currentPage.value = 1
    fetchTranslations()
  } catch (error) {
    console.error('创建失败:', error)
    ElMessage.error('创建失败')
  } finally {
    creating.value = false
  }
}

// 打开添加翻译对话框
const handleAdd = () => {
  console.log('handleAdd clicked') // 添加调试日志
  showCreate.value = true
  createForm.value = {
    project_key: filter.value.project || '',
    key: '',
    source_text: '',
    languages: [],
    translations: {},
    autoTranslations: {},
    translating: {}
  }
}

// 添加状态
const isGettingAllTranslations = ref(false)

// 一键获取所有语种的翻译
const getAllAutoTranslations = async () => {
  if (!createForm.value.source_text) {
    ElMessage.warning('请先输入源文本')
    return
  }

  isGettingAllTranslations.value = true
  try {
    // 获取所有翻译提供商
    const providers = getDictItems('TranslationProviderEnum')
    
    // 初始化每个语种的翻译结果数组
    createForm.value.languages.forEach(lang => {
      createForm.value.autoTranslations[lang] = []
    })
    
    // 按照提供商顺序依次获取每个语种的翻译
    for (const provider of providers) {
      await Promise.all(
        createForm.value.languages.map(async (lang) => {
          try {
            const res = await executeTranslation({
              drive: provider.code as string,
              query: createForm.value.source_text,
              to: lang
            })

            createForm.value.autoTranslations[lang].push({
              channel: provider.name as string,
              text: res.data.data.text,
              success: res.data.data.success,
              error: res.data.data.error
            })
          } catch (error) {
            console.error(`${provider.name}翻译失败:`, error)
            // 即使失败也添加一个结果，保持顺序一致
            createForm.value.autoTranslations[lang].push({
              channel: provider.name as string,
              text: '',
              success: false,
              error: error.message || '翻译失败'
            })
          }
        })
      )
    }

    ElMessage.success('获取完成')
  } catch (error) {
    console.error('获取翻译建议失败:', error)
    ElMessage.error('获取翻译建议失败')
  } finally {
    isGettingAllTranslations.value = false
  }
}

// 取消编辑
const cancelEditing = (row: ServerTranslation & { 
  editing?: boolean
  editingText?: string
  autoTranslations?: AutoTranslation[]
}) => {
  row.editing = false
  row.editingText = undefined
  row.autoTranslations = undefined
}

// 处理每页条数变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页
  fetchTranslations()
}

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchTranslations()
}

// 筛选状态
const filter = ref({
  project: '',
  language: '',
  status: -1,
  keyword: ''
})

// 处理导出
const handleExport = async (type: string) => {
  if (!filter.value.project) {
    ElMessage.warning('请先选择项目')
    return
  }

  try {
    await downloadFile('/translation/export', {
      project_key: filter.value.project,
      type
    }, `translation_${type}.zip`)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败')
  }
}
</script>

<style scoped>
.translations-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.page-header .left {
  flex: 1;
  min-width: 0;
}

.page-header .right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.stats {
  display: flex;
  gap: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-item {
  width: 160px;
  flex-shrink: 0;
}

.search-group {
  display: flex;
  gap: 8px;
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
}

.translation-text {
  min-height: 40px;
  padding: 8px;
  cursor: pointer;
  color: var(--el-text-color-regular);
}

.translation-text:hover {
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

.auto-translations {
  margin-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 8px;
}

.auto-translation-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
}

.auto-translation-item:hover {
  background-color: var(--el-fill-color-light);
}

.auto-translation-item .channel {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-right: 8px;
  min-width: 80px;
}

.auto-translation-item .text {
  flex: 1;
  color: var(--el-text-color-regular);
}

.translation-edit {
  margin-bottom: 16px;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.edit-header .title {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.auto-translations {
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 12px;
  margin-top: 12px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.auto-translating {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  padding: 12px 0;
}

.auto-translation-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.auto-translation-item:hover {
  border-color: var(--el-border-color);
  background-color: var(--el-fill-color-light);
}

.auto-translation-item.active {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.auto-translation-item .channel {
  width: 100px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.auto-translation-item .text {
  flex: 1;
  margin: 0 16px;
  color: var(--el-text-color-primary);
}

.translations-preview {
  margin-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 20px;
}

.lang-group {
  margin-bottom: 24px;
}

.lang-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.lang-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.translating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: var(--el-text-color-secondary);
}

.language-description {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 调整选择器的宽度以适应更多内容 */
.el-select {
  width: 100%;
}

.translations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.translations-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.button-group {
  display: flex;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding: 0 20px;
}

.error-icon {
  color: var(--el-color-danger);
  font-size: 16px;
}

/* 调整右侧按钮组样式 */
.page-header .right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* 确保下拉菜单图标对齐 */
.el-dropdown {
  display: inline-flex;
  align-items: center;
}
</style> 