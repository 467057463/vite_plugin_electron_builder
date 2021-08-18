// @ts-nocheck
import { build } from 'esbuild';
import path  from 'path';
import chalk from 'chalk';
import fs from 'fs/promises';

export async function mainProcessBuild(viteConfig, mode, onRebuild?){
  const define = {};
  for (const k in viteConfig.env) {
    define[`process.env.${k}`] = JSON.stringify(viteConfig.env[k])
  }
  
  const dependenciesSet = new Set()
  let buildConfig = {
    entryPoints: [
      path.join(viteConfig.root, 'src', './background.ts')
    ],
    outfile: 'dist/main.js',
    platform: 'node',
    bundle: true,
    format: 'cjs',
    define,
    plugins: [
      {
        name: 'externalize-deps',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            const id = args.path
            if (id[0] !== '.' && !path.isAbsolute(id)) {
              if(id[0] !== '@' && id.split("/").length > 1){
                id = id.split("/")[0];
              }
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
  if(mode === 'dev'){
    buildConfig = {
      ...buildConfig,
      sourcemap: 'inline',
      inject: [path.join(__dirname, '..', 'inject', 'devInject.js')],
      watch: {
        onRebuild
      }
    }
  } else {
    buildConfig = {
      ...buildConfig,
      inject: [path.join(__dirname, '..', 'inject', 'buildInject.js')],
      // minify: true,
    }
  }
  await build(buildConfig);
  // console.log([...dependenciesSet])
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

export async function preloadBuild(viteConfig, mode = 'dev'){
  const entryPoints = [];
  const preloadPath = path.join(viteConfig.root, 'src', 'preload');
  const res = await fs.readdir(preloadPath);
  for(const i of res){
    const file = await fs.stat(path.join(preloadPath, i));
    if(file.isFile() && ['.js', '.ts'].includes(path.extname(i))){
      entryPoints.push(path.join(preloadPath, i))
    }
  }
  console.log(entryPoints)
  await build({
    entryPoints,
    outdir: 'dist/preload',
    platform: 'node',
    bundle: true,
    watch: mode === 'dev',
    plugins: [
      {
        name: 'externalize-deps',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            const id = args.path
            if (id[0] !== '.' && !path.isAbsolute(id)) {
              // dependenciesSet.add(id);
              return {
                external: true
              }
            }
          })
        }
      },
    ],
  })
}