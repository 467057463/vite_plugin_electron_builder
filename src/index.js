const dev = require('./dev');

module.exports = function viteElectron(pluginConfig){
  let config;

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
    configureServer({httpServer}){
      httpServer.on('listening', (err, app) => {
        const address = httpServer.address();
        config.env.DEV_SERVER_URL = `http://${address.address}:${address.port}`;
        dev(config)
      })
    },

    // 生产模式/build
    // closeBundle(){ 
    //   build(config)
    // }
  }
}