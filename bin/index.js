#!/usr/bin/env node
'use strict';

const fs = require('fs');
const { ensureDir } = require('fs-extra')
const { cac } = require('cac');
const path = require('path');
const cli = cac('vpeb-init')
const ejs = require("ejs")

// 模板目录
const tmplDir = path.join(__dirname,'../template');
const destDir = path.join(process.cwd(), 'src');

// 处理配置
function resolvedConfig(options){
  let config = {}
  if(!options.type){
    config.type = 'js'
  }else {
    config.type = options.type;
  }
  return config;
}

// 复制主进程文件
function createMainFile(options){
  const fileName = `background.${options.type}`;
  if(fs.existsSync(path.join(process.cwd(), `src/${fileName}`))){
    return console.log('主进程文件已存在')
  }
  ejs.renderFile(path.join(tmplDir, options.type, fileName), {}, function(error, res){
    fs.writeFileSync(path.join(destDir, fileName), res)
  })
}

// 复制自定义协议文件
async function createProtocol(options){
  const fileName = `createProtocol.${options.type}`;
  const destPath = path.join(destDir, 'electron')
  try{
    await ensureDir(destPath);
    ejs.renderFile(path.join(tmplDir, options.type, fileName), {}, function(error, res){
      fs.writeFileSync(path.join(destPath, fileName), res)
    })
  } catch (err){
    console.error(err)
  }
}

// 复制 preload 文件
async function createPreload(options){
  const fileName = `test.${options.type}`;
  const destPath = path.join(destDir, 'preload')
  try{
    await ensureDir(destPath);
    ejs.renderFile(path.join(tmplDir, options.type, fileName), {}, function(error, res){
      fs.writeFileSync(path.join(destPath, fileName), res)
    })
  } catch (err){
    console.error(err)
  }
}

function createTemplate(options){
  createMainFile(options)
  createProtocol(options)
  createPreload(options)
}

cli
  .command('')
  .option('-t, --type <type>', `[string] js | ts`)
  .action(async (options) => {
    const config = resolvedConfig(options)
    createTemplate(config)
    // console.log(config)
    // console.log(process.cwd())
  })

cli.help()
cli.version(require('../package.json').version)
cli.parse()