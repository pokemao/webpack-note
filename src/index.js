// 行内使用loader的方式
// import 'style-loader!css-loader!./style.css'

// 如果babel.config.js中配置了useBuiltIns: 'entry'，那么就要手动引入polyfill文件的内容
// import 'core-js/stable'
// import 'regenerator-runtime/runtime'

import "./style.css";
import './math.js'
import './biology.js'
const a = 1;
const b = 2;
const c = 3;
console.log(a, b, c);
export { a, b, c };

// 这个module对象实在webpack打包后依旧存在于打包结果中的一个对象，但是这个对象在run build和run serve中是不一样的，run serve中会有很对webpack-dev-server配置的属性
console.log(module);
// Object
// children: []
// set exports: () => {…}
// length: 0
// name: "set"
// arguments: (...)
// caller: (...)
// [[FunctionLocation]]: harmony module decorator:6
// [[Prototype]]: ƒ ()
// [[Scopes]]: Scopes[3]
// [[Prototype]]: Object
// exports: Module
// a: (...)
// b: (...)
// __esModule: true
// Symbol(Symbol.toStringTag): "Module"
// get a: () => (/* binding */ a)
// get b: () => (/* binding */ b)
// [[Prototype]]: Object
// id: "./src/index.js"
// loaded: true
// [[Prototype]]: Object

// hot这个属性只会在npm run serve中存在，且存在于module这个对象的原型上
if(module.hot) {
    // 表示对'./math.js'这个文件及其内部引入的文件的改变进行热更新，从此以后对'./math.js'这个文件的改变只会执行这个文件中的内容，不会执行index.js这个入口文件中的内容。而且如果'./math.js'这个文件变了，但'./math.js’import的内容没有变，那么'./math.js’import的内容是不会重复执行的
    module.hot.accept("./math.js")
    // 注意下面两种写法都无法对当前的index.js文件进行热更新，如果想要对某个模块进行热更新，那么这个模块必须是入口模块的子模块，因为要在入口模块中，使用module.hot.accept去监听这个子模块
    // 而入口模块无法监听自身，所以对入口模块的改变会重新替换从入口文件开始的所有模块
    // module.hot.accept("./index.js")
    // module.hot.accept(".")
    // 注意这里没有添加module.hot.accept("./biology.js")，所以biology的改变会重新替换从入口文件开始的所有模块，即重新从入口文件"./index.js"开始执行
    // 估计create react app 和 create vue 提供的能力就是有用node读取index.js中引入的文件名并使用module.hot.accept("./math.js")这种方式插入到webpack的生命周期中
}

