<template>
  <div class="filter-container">

    <!-- 其他筛选项 -->
    <div class="filter-group">
      <el-select 
        v-model="projectValue" 
        placeholder="选择项目" 
        class="filter-item project-select" 
        clearable
        @change="handleProjectChange"
      >
        <el-option
          v-for="project in projects"
          :key="project.key"
          :label="project.name"
          :value="project.key"
        />
      </el-select>
      <el-select 
        v-model="languageValue" 
        placeholder="选择语言" 
        class="filter-item language-select" 
        clearable
        @change="handleLanguageChange"
      >
        <el-option
          v-for="lang in languages"
          :key="lang.code"
          :label="lang.name"
          :value="lang.code"
        />
      </el-select>
      <div class="search-group">
        <el-input
          v-model="searchValue"
          placeholder="搜索翻译"
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

        <!-- 状态筛选 radio buttons -->
    <div class="status-filter">
      <el-radio-group v-model="statusValue" @change="handleStatusChange" size="small">
        <el-radio-button 
          v-for="item in statusCounts"
          :key="item.code"
          :label="item.code"
        >
          {{ item.name }} ({{ item.count }})
        </el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import type { Project, Language, StatusCount } from '@/types/translation'
import { getTranslationStatusCounts } from '@/api/translation'

const props = defineProps<{
  projects: Project[]
  languages: Language[]
  modelValue: {
    project: string
    language: string
    status: number
    keyword: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: typeof props.modelValue): void
  (e: 'search'): void
}>()

// 本地状态
const projectValue = ref(props.modelValue.project)
const languageValue = ref(props.modelValue.language)
const statusValue = ref(-1)
const searchValue = ref(props.modelValue.keyword)

// 翻译状态选项

// 状态统计
const statusCounts = ref<StatusCount[]>([])

// 获取状态统计
const fetchStatusCounts = async () => {
  try {
    const res = await getTranslationStatusCounts({ 
      project_key: projectValue.value || undefined,
      language: languageValue.value || undefined,
      keyword: searchValue.value || undefined
    })
    if (res.data.data) {
      statusCounts.value = res.data.data
      if (!statusCounts.value.find(item => item.code === statusValue.value)) {
        statusValue.value = -1
      }
    }
  } catch (error) {
    console.error('获取状态统计失败:', error)
  }
}

// 监听项目和语言变化，重新获取状态统计
watch([projectValue, languageValue], () => {
  fetchStatusCounts()
})

// 监听搜索关键词变化
watch(searchValue, () => {
  // 当清空搜索框时，重新获取状态统计
  if (!searchValue.value) {
    fetchStatusCounts()
  }
})

// 初始化时获取状态统计
onMounted(() => {
  fetchStatusCounts()
})

// 处理变更
const emitChange = async (triggerSearch = false) => {
  emit('update:modelValue', {
    project: projectValue.value,
    language: languageValue.value,
    status: statusValue.value,
    keyword: searchValue.value
  })
  
  // 搜索时更新状态统计
  if (triggerSearch) {
    await fetchStatusCounts()
    emit('search')
  }
}

const handleProjectChange = () => emitChange(true)
const handleLanguageChange = () => emitChange(true)
const handleStatusChange = () => emitChange(true)
const handleSearch = () => emitChange(true)
</script>

<style scoped>
.filter-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-filter {
  margin-bottom: 4px;
}

:deep(.el-radio-button__inner) {
  padding: 6px 16px;
  font-size: 13px;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: 1px solid var(--el-border-color);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-item {
  width: 160px;
  flex-shrink: 0;
}

.search-group {
  display: flex;
  gap: 8px;
  width: 280px;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
}
</style> 