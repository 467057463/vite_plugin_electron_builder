// import { build } from'esbuild';
import path from'path';
import { build } from'electron-builder';
import { stat, remove, writeFile } from'fs-extra';
import { mainProcessBuild, log, preloadBuild } from './util';

async function generatePackageJson(config, dependencies) {
  const original = require(path.join(config.root, './package.json'))
  const result = {
    name: original.name,
    author: original.author,
    version: original.version,
    license: original.license,
    description: original.description,
    main: './main.js',
    dependencies: 
      Object.entries(original.dependencies)
      .filter(item => dependencies.includes(item[0]))
      .reduce((object, entry) => ({ ...object, [entry[0]]: entry[1] }), {})
  }
  await writeFile('dist/package.json', JSON.stringify(result))
}

export default async function(config){
  const startTime = Date.now();
  log('info', `正在打包electron...`)
  await preloadBuild(config, 'build');
  const { dependencies } = await mainProcessBuild(config, 'build')
  // console.log(dependencies)
  await generatePackageJson(config, dependencies)
  await build({
    // publish: 'never',
    config: {
      appId: '',
      productName: '',
      copyright: 'Copyright © 2021',
      directories: {
        output: 'dist_application',
        buildResources: 'build',
        app: 'dist'
      },
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
      // nsis: {
      //   oneClick: false,
      //   language: '2052',
      //   perMachine: true,
      //   allowToChangeInstallationDirectory: true,
      //   include: "build/installer.nsh"
      // },
    }
  })
  log('info', `electron 打包完毕, 用时${(Date.now() - startTime) / 1000}s`)
}