import {defineConfig, UserConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import tsconfigPaths from 'vite-tsconfig-paths'
import {getBuildTime, increaseBuildVersion, postBuildCommands} from "./server/Build";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }): UserConfig => {
  return {
    publicDir: "public",
    plugins: [
      vue(),
      tsconfigPaths(),
      {
        name: 'postbuild-commands', // the name of your custom plugin. Could be anything.
        closeBundle: async () => {
          await postBuildCommands(command, mode); // run during closeBundle hook. https://rollupjs.org/guide/en/#closebundle
        }
      }
    ],
    define: {
      'process.env': {
        GB_BUILD_TIMESTAMP: getBuildTime(),
        GB_BUILD_VERSION: increaseBuildVersion(command, mode)
      }
    },
    build: {
      sourcemap: false,
      assetsDir: "static/assets",
      rollupOptions: {
        output: {
          manualChunks: {
            vue_core: ['vue', 'pinia', 'vue-router', 'axios'],
            amcharts: ['@amcharts/amcharts5'],
          }
        }
      }
    },
  }
})
