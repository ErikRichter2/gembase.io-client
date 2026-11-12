import './css/gembase_core.css'
import './css/index.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import { initInlineSvg } from '@/plugins/inline-svg'
import MainView from '@/views/MainView.vue'
import { useErrorHandler } from './errors/errorHandlerComposable'
import router from './router'

import { appEnv } from './appEnv'

console.log(`Env: ${appEnv.envName}, Server: ${appEnv.serverRoot}`)

const app = createApp(MainView)

app.use(createPinia())

// error handler
const errorHandler = useErrorHandler()
app.config.errorHandler = errorHandler.globalErrorHandler
export const errorDataView = errorHandler.errorDataView

// libs
initInlineSvg(app)

// routes
app.use(router)

app.mount('#app')
