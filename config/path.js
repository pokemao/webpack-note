const path = require('path')

// 获取当前项目package.json所在的绝对路径
const pathOfPackageJson = process.cwd()
// 即在命令行中键入npm run build或者npm run serve时所在的目录


// 需要传入的参数都是相对于package.json所在的绝对路径的相对路径
module.exports = (relativePath = '') => {
    return path.resolve(pathOfPackageJson, relativePath);
}
