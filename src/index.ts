import { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import { Configuration as ElectronBuilderOptions } from 'electron-builder';

import { resolvePuglinConfig } from './config';
import handleDev from './handleDev';
import handleBuild from './handleBuild';

// plugin 配置项
export interface PluginConfig{
  mainProcessFile?: string
  preloadDir?: string
  builderOptions?: ElectronBuilderOptions
}

// 合并 vite confing 和 插件 config
export interface Config extends ResolvedConfig{ 
  pluginConfig: PluginConfig
}

export default function viteElectron(pluginConfig: PluginConfig = {}): Plugin {
  let config: Config;
  
  return{
    name: 'vite-plugin-electron-builder',

    // 存储 config 变量
    configResolved(resolvedConfig: ResolvedConfig) {
      config = {
        ...resolvedConfig,
        pluginConfig: resolvePuglinConfig(pluginConfig)
      }
    },

    // 开发模式/dev
    // @todo httpServer 
    configureServer({ httpServer }: ViteDevServer) {
      httpServer?.on('listening', () => {
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

