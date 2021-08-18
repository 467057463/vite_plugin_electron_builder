import { Plugin } from 'vite'

import handleDev from './handleDev';
import handleBuild from './handleBuild';

// plugin 配置项
export interface Options{
  mainProcessFile?: string
  preloadDir?: string
  builderOptions?: any
}

export default function viteElectron(pluginConfig: Options = {}): Plugin {
  let config:any;
  return{
    name: 'vite-plugin-electron-builder',

    // 存储 config 变量
    configResolved(resolvedConfig) {
      config = {
        ...resolvedConfig,
        pluginConfig
      }
    },

    // 开发模式/dev
    configureServer({ httpServer }: {httpServer: any}) {
      httpServer.on('listening', () => {
        const address: any = httpServer.address();
        config.env.DEV_SERVER_URL = `http://${address.address}:${address.port}`;
        handleDev(config)
      })
    },

    // 生产模式/build
    closeBundle(): void { 
      handleBuild(config)
    }
  }
}

