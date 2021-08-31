import { Config } from './index';
import { build } from 'esbuild';
import path  from 'path';
import chalk from 'chalk';
import fs from 'fs';

export async function mainProcessBuild(config: Config, onRebuild?){
  // esbuild deine 注入到 import.meta.env
  const define = Object.entries(config.env).reduce((acc, [key, value]) => ({
    ...acc,
    [`import.meta.env.${key}`]: JSON.stringify(value)
  }), {})
  
  const dependenciesSet = new Set()
  let buildConfig = {
    entryPoints: [
      // @ts-ignore
      path.join(config.root, config.pluginConfig.mainProcessFile)
    ],
    outfile: path.join(config.build.outDir, 'main.js'),
    platform: 'node',
    bundle: true,
    format: 'cjs',
    define,
    sourcemap: config.command === 'serve' ? true : false,
    inject: [ 
      path.join(
        __dirname, 
        '../inject', 
        `${config.command === 'serve' ? 'devInject.js' : 'buildInject.js'}`
      )
    ],
    watch: config.command === 'serve' ? { onRebuild } : false,
    plugins: [
      {
        name: 'externalize-deps',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            const id = args.path
            if (id[0] !== '.' && !path.isAbsolute(id)) {
              dependenciesSet.add(id);
              return {
                external: true 
              }
            }
          })
        }
      },
    ],
  }
  // @ts-ignore
  await build(buildConfig);
  return {
    dependencies: [...dependenciesSet]
  }
}

const logLevelMap = {
  info: 'blue',
  warning: 'yellow',
  error: 'red'
}
export function log(logLevel, message){
  const color = logLevelMap[logLevel]
  console.log(
    `${chalk[color].bold(`[vite_plugin_electron_builder]`)} ${message}`
  )
}

// 递归读取 preload 文件夹中的js/ts文件
function readDir(dir, res = []){
  fs.readdirSync(dir).forEach(item => {
    const filePath = path.join(dir, item);
    var stat = fs.lstatSync(filePath);
    if(!stat.isDirectory()){
      if(['.ts', '.js'].includes(path.extname(filePath))){
        // @ts-ignore
        res.push(filePath)
      }
    } else{
      readDir(filePath, res)
    }
  });
  return res;
}

export async function preloadBuild(config: Config){
  const define = Object.entries(config.env).reduce((acc, [key, value]) => ({
    ...acc,
    [`import.meta.env.${key}`]: JSON.stringify(value)
  }), {})

  // 读取 preload 文件
  // @ts-ignore
  const preloadDir = path.join(config.root, config.pluginConfig.preloadDir);  
  const entryPoints = readDir(preloadDir);
  const dependenciesSet = new Set()
  await build({
    entryPoints,
    outdir: path.join(config.build.outDir, 'preload'),
    platform: 'node',
    bundle: true,
    define,
    watch: config.command === 'serve',
    sourcemap: config.command === 'serve' ? true : false,
    inject: [ 
      path.join(
        __dirname, 
        '../inject', 
        `${config.command === 'serve' ? 'devInject.js' : 'buildPreloadInject.js'}`
      )
    ],
    plugins: [
      {
        name: 'externalize-deps',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            const id = args.path
            if (id[0] !== '.' && !path.isAbsolute(id)) {
              dependenciesSet.add(id);
              return {
                external: true 
              }
            }
          })
        }
      },
    ],
  })
  return {
    dependencies: [...dependenciesSet]
  }
}

// 渲染进程注入define
export function injectDefine(command){
  const __static = command === 'serve' ? 
    JSON.stringify(path.join(process.cwd(), 'public')) : 
    JSON.stringify(path.join(__dirname, '../../app.asar'));

  const __preload = command === 'serve' ?
    JSON.stringify(path.join(process.cwd(), 'dist/preload')) : 
    JSON.stringify(path.join(__dirname, '../../app.asar/preload'));

  return {
    __static,
    __preload
  }
}

export function injectGlobalVariable(command){
  const __static = command === 'serve' ?
    `path.join(process.cwd(), 'public')` :
    `path.join(__dirname, '../../app.asar')`;
  
  const __preload = command === 'serve' ?
    `path.join(process.cwd(), 'dist/preload')` :
    `path.join(__dirname, '../../app.asar/preload')`
  
  return `
    <script>
      const path = require('path');
      window.__static = ${__static};
      window.__preload = ${__preload};
    </script>
  </head>
  `
}