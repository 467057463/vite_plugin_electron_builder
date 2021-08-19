import { PluginConfig } from './index';

// 默认配置
let defaultOptions: PluginConfig  = {
  mainProcessFile: 'src/background.js',
  preloadDir: 'src/preload',
  builderOptions: {
    appId: '',
    productName: '',
    copyright: '',    
    directories: {
      output: 'dist_application',
      buildResources: 'build',
      app: 'dist'
    }
  }
};

// @todo 按照自定义规则合并
export function resolvePuglinConfig(pluginConfig: PluginConfig) :PluginConfig{
  return {
    ...defaultOptions,
    ...pluginConfig,
  }
}