import path from'path';
import { build as electronBuilder } from'electron-builder';
import { writeFile } from'fs-extra';
import { Config } from './index'
import { mainProcessBuild, log, preloadBuild } from './util';

async function generatePackageJson(config: Config, dependencies) {
  // console.log(dependencies)
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
      .reduce((object, entry) => ({ ...object, [entry[0]]: entry[1] }), {}),
  }
  await writeFile(path.join(config.build.outDir, 'package.json'), JSON.stringify(result))
}

export default async function(config: Config){
  try {
    const startTime = Date.now();
    log('info', `正在打包electron...`)
    const { dependencies: preloaDependencies } = await preloadBuild(config);
    const { dependencies } = await mainProcessBuild(config)
    await generatePackageJson(config, 
      Array.from(new Set([...dependencies, ...preloaDependencies]))
    )
    // @ts-ignore
    await electronBuilder({
      config: config.pluginConfig.builderOptions}
    )
    log('info', `electron 打包完毕, 用时${(Date.now() - startTime) / 1000}s`)
  } catch (error) {
    console.log(error) 
  }
}