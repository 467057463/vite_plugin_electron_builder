# Vite white Electron

如果你喜欢 vite 也正好喜欢 electron 不妨试试本插件，无缝配置，快速的将vite 和 electron 整合在一起。

## 如何使用

### 步骤一：创建一个 Vite 项目

https://cn.vitejs.dev/guide/#scaffolding-your-first-vite-project

### 步骤二：安装 vite-plugin-electron-builder

``` bash
npm install vite-plugin-electron-builder
```

### 步骤三：配置 vite-plugin-electron-builder

1. 打开 vite.config.[ts|js] 文件引入插件并加入配置

``` js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteElectron from 'vite-plugin-electron-builder';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    viteElectron({
      mainProcessFile: 'src/background.js',
      preloadDir: 'src/preload',
      builderOptions: {
        appId: 'your.id',
        directories: {
          output: 'dist_application',
          buildResources: 'build',
          app: 'dist'
        },
        files: ['**'],
        extends: null,
        asar: true,
        win: {
          target: [
            {
              target: 'nsis',
              arch: ['x64'],
            },
          ],
          artifactName: '${productName} Setup ${version}.${ext}',
        },
        nsis: {
          oneClick: false,
          language: '2052',
          perMachine: true,
          allowToChangeInstallationDirectory: true,
          createDesktopShortcut: "always",
        },
        mac: {
          target: 'dmg',
          artifactName: '${productName} Setup ${version}.${ext}',
        },
        dmg: {
          contents: [
            {
              x: 110,
              y: 150,
            },
            {
              x: 400,
              y: 150,
              type: 'link',
              path: '/Applications',
            },
          ],
          artifactName: '${productName} Setup ${version}.${ext}',
        },
      }
    })
  ]
})
```

### 步骤四：生成electron 样板文件

``` bash
# 生成 js 格式的样板文件
npx vite-plugin-electron-builder -t js

# 生成 ts 格式的样板文件
npx vite-plugin-electron-builder -t ts
```

该命令将会生成如下文件：

1. src 目录下生成 background.[js|ts] 文件 （electron 主进程文件）
2. src/electron 目录下生成 createProtocol.[js|ts] 文件（自定义协议文件）
3. src/preload 目录下生成 test.[js|ts]文件 preload 文件

> 如何使用 ts 你还需要将下面内容复制到 `env.d.ts` 中
> @todo 后面研究如何在包中直接暴露 type 定义，各位先暂时手动复制一下。
``` ts
interface ImportMetaEnv {
  DEV_SERVER_URL: string
}

declare const __preload: string
declare const __static: string
```

### 步骤五：启动开发模式
``` bash
npm run dev
```

### 步骤六：打包
``` bash
npm run build
```

## 本插件特点

### 静态资源引用
通过 `__static` 变量，指向 `public`目录，统一了开发时、打包后主进程，渲染进程，preload 文件引用静态资源的方式。

### preload 目录
通过 `__preload` 变量，指向 `preload`目录，同意了开发时、打包后 `preload` 目录的引用。

### 在主进程、preload 中使用项目中的.env 配置
通过 `import.meta.env.VITE_XXXXX` 使用 .env 中的配置

### 在渲染进程中使用 esModule 语法引用 node 模块
由于 vite 的原因不能在网页中使用 import 引用 node 模块，本插件通过 hack 抹平了这一障碍，现在你可以。
``` js
import path from 'path';
```

## 最后

1. 本插件现在为开发版，我正在把它应用到第一个正式项目中。等开发完第一个项目，会把使用过程的一些想法再应用到本插件上。另外也会等公司的项目完成后抽取时间对项目的代码优化，和对某些功能做更深入的开发。

2. 如果你也和我一样对 vite 和 electron 感兴趣，不妨试试用本项目做个 demo(不建议直接用到正式项目中，试试本项目看能不能不满足再用), 更希望的是你在使用过程中，提交你发现的问题，或一些优化点，为我在往后的开发中提供更多方向。

3. 又或者，你对源码感兴趣（虽然源码有点乱），欢迎 fork 并提交你的代码。学习尝试开发一个开源项目，能获取的将会更多。（我是在阅读 vite 源码的过程中，有了开发本项目的想法。源码中那么多插件钩子设计的如此精妙，但是他们都是如何运作的呢？就想自动动手写个插件，看看各个钩子是如何调用，这也使得对源码的理解程度更高）


## TODO 开发计划

- [ ] 精读 electron-builder 文档，提取更多精细化配置
- [ ] 尝试更多 vite 配置，在主进程、preload 中使用这些配置
- [ ] 精读 esbuild 文档，优化现在在编辑主进程、preload 选项，用更高效的写法
- [ ] 解决一些 typescript 遗漏问题
- [ ] api 文档
- [ ] 自动化发布