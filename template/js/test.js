import path from 'path';
import fs from 'fs';
const fileLocation = path.join(__static, 'static', 'test.txt')
console.log(path)
console.log(fs)
console.log(fileLocation)
const fileContents = fs.readFileSync(fileLocation, 'utf8')
console.log(fileContents)

console.log(import.meta.env.VITE_NAME)
console.log('cwd', process.cwd())
console.log('__dirname', __dirname)
console.log('__static', __static)
console.log('__preload', __preload)

console.log('abcdefg')