<template>
  <div class="translate-mode-container">
    <!-- 顶部操作栏 -->
    <div class="header">
      <div class="left">
        <el-select v-model="filter.project" placeholder="选择项目" clearable @change="handleFilterChange"  class="filter-item">
          <el-option
            v-for="project in projects"
            :key="project.key"
            :label="project.name"
            :value="project.key"
          />
        </el-select>
        <el-select v-model="filter.language" placeholder="选择语言" clearable @change="handleFilterChange" class="filter-item">
          <el-option
            v-for="lang in languages"
            :key="lang.code"
            :label="lang.name"
            :value="lang.code"
          />
        </el-select>
      </div>
      <div class="right">
        <el-button @click="$router.back()">返回列表</el-button>
      </div>
    </div>

    <!-- 翻译内容区 -->
    <div v-loading="loading" class="content">
      <template v-if="currentItem">
        <div class="translation-item">
          <!-- 基本信息 -->
          <div class="item-info">
            <div class="info-row">
              <span class="label">项目：</span>
              <span class="value">{{ currentItem.project_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">语种：</span>
              <span class="value">{{ currentItem.language_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">翻译Key：</span>
              <span class="value">{{ currentItem.key }}</span>
            </div>
          </div>

          <!-- 翻译内容 -->
          <div class="source-text">
            <div class="label">原文：</div>
            <div class="text">{{ currentItem.source_text }}</div>
          </div>
          <div class="translation">
            <div class="label">译文：</div>
            <el-input
              v-model="translatedText"
              type="textarea"
              :rows="4"
              placeholder="请输入译文"
            />
          </div>
          
          <!-- 机器翻译建议 -->
          <div class="auto-translations">
            <div class="section-title">
              <span>机器翻译结果</span>
            </div>
            <div v-if="translating" class="auto-translating">
              <el-icon class="is-loading"><Loading /></el-icon>
              正在获取翻译结果...
            </div>
            <template v-else-if="autoTranslations.length">
              <div 
                v-for="item in autoTranslations" 
                :key="item.channel"
                class="auto-translation-item"
                :class="{ active: translatedText === item.text }"
                @click="item.success && selectAutoTranslation(item)"
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

          <div class="actions">
            <el-button 
              type="primary" 
              :disabled="!translatedText"
              @click="handleSave"
              :loading="saving"
            >
              保存并继续
            </el-button>
          </div>
        </div>
      </template>
      <el-empty 
        v-else 
        :description="
          filter.project || filter.language 
            ? '当前筛选条件下暂无可翻译数据' 
            : '暂无可翻译数据'
        "
      >
        <template #extra>
          <el-button @click="$router.back()">返回列表</el-button>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, Warning } from '@element-plus/icons-vue'
import type { Language, Project, ServerTranslation, AutoTranslation } from '@/types/translation'
import { allLanguages } from '@/api/language'
import { getProjects } from '@/api/project'
import { 
  updateTranslation, 
  getNextPendingTranslation,
  executeTranslation
} from '@/api/translation'
import { getDictItems } from '@/utils/dict'

// 基础状态
const loading = ref(false)
const saving = ref(false)
const filter = ref({
  project: '',
  language: ''
})

// 数据
const projects = ref<Project[]>([])
const languages = ref<Language[]>([])
const currentItem = ref<ServerTranslation | null>(null)
const translatedText = ref('')
const autoTranslations = ref<AutoTranslation[]>([])

// 添加翻译中状态
const translating = ref(false)

// 添加翻译驱动状态
const currentProviderIndex = ref(0)

// 获取筛选选项
const fetchOptions = async () => {
  const [projectsRes, langsRes] = await Promise.all([
    getProjects(),
    allLanguages()
  ])
  projects.value = projectsRes.data.data
  languages.value = langsRes.data.data
}

// 获取下一条待翻译内容
const fetchNextItem = async () => {
  loading.value = true
  try {
    const res = await getNextPendingTranslation({
      project_key: filter.value.project,
      language: filter.value.language
    })
    if (res.data.data) {
      currentItem.value = res.data.data
      translatedText.value = currentItem.value.target_text || ''
      autoTranslations.value = []
      // 自动获取翻译建议
        getAutoTranslations()
    } else {
      currentItem.value = null
    }
  } catch (error) {
    console.error('获取待翻译内容失败:', error)
    ElMessage.error('获取待翻译内容失败')
  } finally {
    loading.value = false
  }
}

// 获取机器翻译建议
const getAutoTranslations = async () => {
  if (!currentItem.value) return

  translating.value = true
  autoTranslations.value = []
  currentProviderIndex.value = 0
  
  const providers = getDictItems('TranslationProviderEnum')
  if (providers.length === 0) {
    ElMessage.warning('未找到可用的翻译服务')
    translating.value = false
    return
  }
  
  const executeNextTranslation = async () => {
    if (currentProviderIndex.value >= providers.length) {
      translating.value = false
      return
    }

    const provider = providers[currentProviderIndex.value]
    try {
      const res = await executeTranslation({
        drive: provider.code as string,
        query: currentItem.value.source_text,
        to: currentItem.value.language
      })
      
      autoTranslations.value.push({
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

// 选择机器翻译结果
const selectAutoTranslation = (item: AutoTranslation) => {
  translatedText.value = item.text
}

// 保存并继续
const handleSave = async () => {
  if (!currentItem.value || !translatedText.value) return
  
  saving.value = true
  try {
    await updateTranslation(currentItem.value.id, {
      target_text: translatedText.value
    })
    ElMessage.success('保存成功')
    fetchNextItem()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 处理筛选条件变化
const handleFilterChange = () => {
  fetchNextItem()
}

// 初始化
onMounted(async () => {
  await fetchOptions()
  fetchNextItem()
})
</script>

<style scoped>
.translate-mode-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.left {
  display: flex;
  gap: 12px;
}

.content {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  padding: 24px;
}

.translation-item {
  max-width: 800px;
  margin: 0 auto;
}

.source-text,
.translation {
  margin-bottom: 24px;
}

.label {
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.source-text .text {
  font-size: 16px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.auto-translations {
  margin-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 16px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
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
  display: flex;
  align-items: center;
  gap: 4px;
}

.auto-translation-item .text {
  flex: 1;
  margin: 0 16px;
}

.item-info {
  background: var(--el-fill-color-light);
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  width: 80px;
  color: var(--el-text-color-secondary);
  font-weight: normal;
}

.info-row .value {
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.auto-translating {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  padding: 12px 0;
}

.error-icon {
  color: var(--el-color-danger);
  font-size: 16px;
}

.auto-translation-item:not(.success) {
  cursor: not-allowed;
  opacity: 0.8;
}

.filter-item {
  width: 160px;
  flex-shrink: 0;
}
</style> 