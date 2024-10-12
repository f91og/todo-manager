import { defineConfig, externalizeDepsPlugin, } from 'electron-vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },  // electron主进程的build配置
  preload: {
    plugins: [externalizeDepsPlugin()]
  }, // 预加载脚本的build配置
  renderer: { // render进程build的配置
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
});