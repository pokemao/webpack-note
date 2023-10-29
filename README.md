# webpack-note
> 具体的笔记内容 
> 1. 请见config文件夹下的webpack配置中的注释
> 2. 请见src下webpack.config.js配置中的注释

# webpack打包过程及结果的分析工具
1. speed-measure-webpack-plugin 对各个部分打包时间进行分析
    ```js
        // webpack.config文件中
        const speedMeasureWebpackPlugin = require('speed-measure-webpack-plugin')
        const smp = new speedMeasureWebpackPlugin()
        module.export = smp.wrap(webpack.config文件中module.export原本导出的对象)
        或者
        module.export = (env) => {
            return smp.wrap(webpack.config文件中module.export导出的函数中原本要返回的对象)
        }
    ```
2. webpack内部提供的对打包后各个文件大小的分析
    首先在package.json的script的build的位置加上一个参数--profile --json=status.json，表示把打包后的文件信息输出到status.json文件中改写成 "build": "webpack --config ${webpack.config文件的位置} --env production --profile --json=status.json"
    然后使用 http://webpack.github.com/analyse 这个网站对status.json这个文件进行分析
    注意：status.json这个文件不需要上传到服务器
3. webpack-bundle-analyzer
    ```js
    // webpack.config文件中
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
    module.export = {
        plugins: [
            new BundleAnalyzerPlugin()
        ]
    }
    ```
    在我们npm run build打包结束之后会生成开启一个网页，里面就是各种打包的信息

# webpack实现的事件监听
```js
    
```