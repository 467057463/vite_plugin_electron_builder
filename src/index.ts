import handleDev from './handleDev';
import handleBuild from './handleBuild';

export default function viteElectron(pluginConfig:any):any{
  let config:any;
  return{
    name: 'vite-plugin-electron-builder',

    // 存储 config 变量
    configResolved(resolvedConfig:any) {
      config = {
        ...resolvedConfig,
        pluginConfig
      }
    },

    // 开发模式/dev
    configureServer({ httpServer }){
      httpServer.on('listening', (err:any, app:any) => {
        const address = httpServer.address();
        config.env.DEV_SERVER_URL = `http://${address.address}:${address.port}`;
        handleDev(config)
      })
    },

    // 生产模式/build
    closeBundle(){ 
      handleBuild(config)
    }
  }
}

