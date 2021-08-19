// @ts-nocheck
import electron from 'electron';
import path  from 'path';
import * as child from 'child_process';
import { log, mainProcessBuild, preloadBuild }  from './util';
import { Config } from './index';

const startTime = Date.now();
let electronProcess: null | child.ChildProcess = null;
let manualRestart = false;

// 编译主进程文件
async function buildMain(config: Config){
  function onRebuild(error, result){
    if (error){
      throw(error)
    }
    if(electronProcess && electronProcess.kill){      
      log('info',  `electron 即将重启...`)
      manualRestart = true
      process.kill(electronProcess.pid)
      electronProcess = null

      startElectron(config)
      setTimeout(() => {
        manualRestart = false
      }, 5000)
    }
  }  
  await mainProcessBuild(config, 'dev', onRebuild)
}
// 启动/重新启动 electron
function startElectron(config: Config){
  const args = [
    '--inspect=5858',
    path.join(config.root, 'dist', './main.js')
  ]

  electronProcess = child.spawn(electron, args)
  electronProcess.stdout.on('data', data => {
    log('info', data)
  })
  electronProcess.stderr.on('data', data => {
    log('info', data)
  })
  electronProcess.on('close', () => {
    if (!manualRestart) process.exit()
  })
}

export default async function(config: Config){
  // remove(path.join(config.root, config.build.outDir))
  // build preload 文件和主进程文件
  await Promise.all([
    preloadBuild(config),
    buildMain(config)
  ])
  await startElectron(config);
  log('info',  `electron 开发模式启动完成, 用时${(Date.now() - startTime) / 1000}s`)
}

