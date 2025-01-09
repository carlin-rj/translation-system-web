import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/styles/global.scss'
import App from './App.vue'
import router from './router'
import { getDicts } from '@/api/dict'
import { initDictCache } from '@/utils/dict'

const init = async () => {
  // 获取并初始化字典数据
  const res = await getDicts()
  if (res.data.data) {
    initDictCache(res.data.data)
  }

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)
  app.use(ElementPlus)
  app.mount('#app')
}

init()
