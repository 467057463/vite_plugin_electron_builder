import { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import { Configuration as ElectronBuilderOptions } from 'electron-builder';
import handleDev from './handleDev';
import handleBuild from './handleBuild';

// plugin 配置项
export interface PluginOptions{
  mainProcessFile?: string
  preloadDir?: string
  builderOptions?: ElectronBuilderOptions
}

// 合并 vite confing 和 插件 config
export interface Config extends ResolvedConfig{ 
  pluginConfig: PluginOptions
}

export default function viteElectron(pluginConfig: PluginOptions = {}): Plugin {
  let config: Config;

  return{
    name: 'vite-plugin-electron-builder',

    // 存储 config 变量
    configResolved(resolvedConfig: ResolvedConfig) {
      config = {
        ...resolvedConfig,
        pluginConfig
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

