#!/usr/bin/env node
'use strict';

const { cac } = require('cac');
const cli = cac('vpeb-init')

cli
  .command('')
  .option('-t, --type <type>', `[string] js | ts`)
  .action(async (options) => {
    console.log(options)
    console.log(process.cwd())
  })

cli.help()
cli.version(require('../package.json').version)

cli.parse()