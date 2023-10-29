const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const path = require('./path')
module.exports = {
  mode: "development",
  devtool: "cheap-module-source-map",
  devServer: {
    // hot: true, // 默认这个值就是true,
    // 现在这个属性被删除了使用hot: 'only'
    // hotOnly: true,
    hot: 'only',
    host: "0.0.0.0",
    port: "8888",
    open: true,
    compress: true,
    // contentBase被废弃了，现在用的是static属性的directory
    // contentBase: path('./public'), // 表示所有在index.html中写死的引入资源都是相对于path.resolve(__dirname, './public')这个目录的
    static: {
      directory: path('./public'),
      watch: true,
    },
    // watchContentBase被废弃了现在用的是static属性的watch
    // watchContentBase: true,
    historyApiFallback: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        pathRewrite: {
          "^/api": "",
        },
      },
      "/data": {
        target: "https://localhost:8567",
        pathRewrite: {
          "^/data": "",
        },
        secure: false,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    new ReactRefreshWebpackPlugin(),
  ]
};
