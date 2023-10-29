const plugins = [
  //     ["@babel/plugin-transform-runtime", {
  //         useBuiltIns: 'usage', // 默认值
  //         // corejs为3的时候要依赖于一个插件@babel/runtime-corejs3 --save，只需要安装但是不用显示引入
  //         corejs: 3.8,
  //     }],
  // 在webpack的config文件中为当前打包进程添加属于生产环境还是开发环境的标识
  // 只有在开发换进中才引入react-refresh/babel这个插件],
];
if (
  process.mode === "development" ||
  process.mode === "none" ||
  !process.mode
) {
  plugins.push([
    // 这个是react-refresh专门给babel提供的插件，用来告知babel在解析jsx时什么时候要用hmr重新渲染组件
    "react-refresh/babel",
  ]);
}

// 插件不同于poly-fill，插件是把不支持的东西转化成支持的，如箭头函数就转化成绑定this的bind函数，块级作用域就转化成立即执行函数；而poly-fill是把不支持的功能实现了，如generator，promise，decorator等
module.exports = {
  presets: [
    // "@babel/preset-env", // 等同于写: ['@babel/preset-env'] 或者 ['@babel/preset-env', {...}]
    // 使用polyfill时的@babel/preset-env
    [
      "@babel/preset-env",
      {
        // 下面使用polyfill的方式是在开发项目的时候使用的方式，这种方式添加的polyfill会被添加到全局中，不适用于开发工具库的时候使用，因为在工具库中的全局代码可能会污染别人的代码，要使用下面@babel/plugin-transform-runtime插件的方式
        // 要使用useBuiltIns也就是polyfill首先要下载polyfill的插件（npm i），但是不需要在webpack.config.js或者babel.config.js中手动引入（属性值为'entry'是个例外
        // 表示不使用polyfill
        // useBuiltIns: false,
        // 表示在使用到目标浏览器不支持的内容时再自动引入polyfill的内容
        useBuiltIns: "usage", // 默认值
        // 表示需要在入口文件中手动引入polyfill
        // useBuiltIns: 'entry',
        // 根据babel的版本的不同，我们下载的polyfill的内容也是不同的，早期版本直接下载@babel/polyfill就可以了
        // 但是新版本中要求下载core-js --save和regenerator-runtime --save并且要配置core-js的版本如下
        corejs: 3.8,
      },
    ],
    // 用于解析jsx的babel预设，安装了这个预设就能解析react的jsx代码了，直接将jsx代码转变成React.createElemet
    ["@babel/preset-react"],
    // 用于解析ts的babel预设
    ["@babel/preset-typescript"],
  ],
  plugins
};
