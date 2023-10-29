
// 表示绝对路径src下的所有文件夹下的所有文件const path = require("ppath.resolve(__dirname, './src')t/**/*h");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPulgin = require("html-webpack-plugin");
const { DefinePlugin, webpack, optimize: { ModuleConcatenationPlugin } } = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
// 注意要解析.vue文件要使用一个vue-loader和这个vue-loader中提供的插件
// 配合vue-loader的插件
const { VueLoaderPlugin } = require("vue-loader");
// 注意react的hmr要使用两个插件一个是@pmmmwh/react-refresh-webpack-plugin用在webpack中另一个是react-refresh/babel用在babel中
// react 配置hmr的插件，同时还要在babel中配置一个react-refresh的插件来实现hmr
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
// 在optimization中使用, 用来压缩丑化js代码
const TerserPlugin = require('terser-webpack-plugin')
// 在plugin中使用，用来压缩丑化css代码
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
// 在plugin中使用，用来treeshaking css文件中的css代码，把没有使用的样式表(样式表：.wrap {...}) 删除掉
const PurgeCssPlugin = require('purgecss-webpack-plugin')
// 配合PurgeCssPlugin这个插件使用glob这个这个库，这个库是内置在webpack中的，如果使用npm或者yarn来管理node_modules依赖的话，这个库会被打平到最上层，也就是在node_modules文件夹下的一级目录中能找到glob这个库，和webpack在同级目录下
// 但是这里使用的是pnpm，不会用到npm和yarn的大屏策略，需要手动pnpm install 这个库
const glob = require('glob')
// 在plugin中使用，对所有打包生成的文件进行gzip压缩, 生成相应的gzip文件
const CompressionPlugin = require('compression-webpack-plugin')
// 在plugin中使用, 用来把webpack打包出来的一些js文件不使用<script src=...>的方式引入打html文件中，而是使用直接把js代码注入到<script></ script>标签中的方式实现
// 减少一次或多次网络请求，加大html文件的体积
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin')

// console.log(1);
module.exports = {
  // 表示编译成什么环境可用的代码
  // 默认值是'browserlist'，表示编译成browserlist指定的浏览器可以运行的代码
  // target:
  // 不写mode属性，那么mode属性的值为none
  // 开发模式下使用
  mode: "development",
  // 线上环境下使用
  // mode: "production",
  // 设置了mode会自动为devtool设置默认值，但是我们还是可以显示设置，且显示设置的优先级更高
  // 不生成sourcemap, mode: "production"的默认值
  // devtool: false, // 生产环境下推荐
  // 生成完整的source-map文件，在使用babel的时候能定位到具体错误的列
  // devtool: "source-map", // 开发测试阶段推荐
  // 打包出来的js文件中使用eval函数执行，source-map的信息被通过sourceUrl的注释方式添加到打包出来的js文件中，可以定位到错误的文件错误的行错误的列
  // devtool: "eval", // mode: "development"的默认值
  // 打包出来的js文件中使用eval函数执行，source-map的信息被通过sourceUrl的注释方式添加到打包出来的js文件中（模糊
  // devtool: "eval-source-map",
  // source-map的信息以dataUrl的形式存储到打包出来的js文件中了
  // devtool: "inline-source-map",
  // 也会生成source-map文件，但是相对于devtool：source-map的区别是永远不能定位到错误的列，只能定位到错误的行
  // devtool: "cheap-source-map",
  // 也会生成source-map文件，对babel转化过的文件的报错信息有更好的展示，其他的没有module的devtool做不到（有cheap才能设置module字段）
  devtool: "cheap-module-source-map", // 开发测试阶段推荐
  // 在浏览器的console里可以看到报错文件的文件名及行数，但是在浏览器的source里面是没有具体的报错的源文件的（vite的默认选项
  // devtool: "nosources-module-source-map",

  // context用来指定entry是相对于哪个路径的，如果不写，默认值是在命令行键入npm run build或者npm run serve的那个路径(也就是package.json所在的路径, 也叫项目启动时的路径===process.cwd())
  // 要求写一个绝对路径
  context: path.resolve(__dirname, "../"), // path.resolve(__dirname, '../')是package.json所在的绝对路径
  
  // 放弃对一些模块的打包，不把这些模块打包到dist文件夹中
  // 相应的要在html模板中添加script标签，使用cdn的方式或者是什么方式引入没有被打包的模块，否则无法正常使用
  // 用处：
  // 1. 配合cdn开发前端，加速
  // 2. 在开发node服务器的时候，nodejs中require的代码是可以正常运行的所以不需要对require的内容进行打包，进一步说完全没有必要对node的内置模块进行打包，例如fs这种，你就算打包了也没法在前端运行
  // 3. 如果是使用node开发前端库的话还是要使用webpack打包所有import或者require的内容的
  // 在生产模式下才需要使用external属性，开发模式下没必要使用external属性，所以在开发模式下就不需要在打包的模板html中添加script标签了，这个时候就要在html模板中使用ejs语法判断生产还是开发环境，选择性的添加script标签
  // external: {
  // /**
  //  * 对于以import _ from "lodash"方式引入的包
  //  * 1. 不做分包处理
  //  * 2. 不引入任何lodash相关的代码(由于不引入相关的代码，也就不需要分包处理了)
  //  * 3. 不做模块化处理，不会生成相关的runtime代码
  //  * 
  //  * 属性名是from后面的名字，也是node_modules中这个库的名字
  //  * 属性值是这个库在cdn类型(rollup中iife打包方式的打包结果)的代码中导出的全局变量
  //  * 
  //  * 对于在src目录下的文件import lodash会根据import的写法不同有这么几种操作
  //  * 1. import _ from "lodash" // 源文件打包时直接删除这句话
  //  * 2. import { aaa } from "lodash" // 源文件打包时把这句话替换成 const { aaa } = _
  //  * 
  //  * 需要在打包时使用的html模板的<body>标签内部的最后面中添加上这么一段代码
  //  * <script src="lodash的cdn地址"></script>
  //  * 但是这里要考虑开发模式和生产模式的问题，对于开发模式是不会使用external的，external属性要设置到生产模式当中，所以在开发模式下就不需要在打包的模板html中添加上面的script标签了，这个时候就要在html模板中使用ejs语法判断生产还是开发环境，选择性的添加script标签
  //  */
  //  lodash: "_",
  //   /**
  //    * 对于以import dayjs from "lodash"方式引入的包
  //    * 1. 不做分包处理
  //    * 2. 不引入任何lodash相关的代码(由于不引入相关的代码，也就不需要分包处理了)
  //    * 3. 不做模块化处理，不会生成相关的runtime代码
  //    */
  //   dayjs: "dayjs"
  // }

  // entry在没有指定context属性的时候，默认相对路径相对的是package.json所在的位置
  // 编译主入口
  // entry: "./src/main.js",
  // 测试编译jsx代码
  // entry: "./src/react.js",
  // 测试编译ts代码
  // entry: "./src/typescript.ts",
  // 测试编译.vue文件
  // entry: './src/vue.js',
  // 分包的两种方法之一
  // 多入口编译
  entry: {
    // 根据下面的main与main2，webpack会有两个入口文件，同时也就会有两个出口文件（不设置分包的时候），如果设置分包那么在npm run build的时候输出的文件将大于等于两个
    // 根据下面的设置会打包出来main.bundle.js和main2.bundle.js两份文件
    main: "./src/main.js", // 在没有抽离配置的时候可以使用字符串作为属性值
    main2: "./src/main2.js",

    // 如果还需要对./src/main.js和./src/main2.js这两个文件中import的node_modules中的库进行单独打包的话就需要用下面的写法
    // 背景：使用上面的mian和mian2的写法的情况下，如果你在main和main2中都引入了import _ from 'lodash'这个库，那么lodash中的代码会被打包到main和main2中，就是同一份代码打包出来两份，这时就需要单独打包lodash这个库，让main和main2引用单独打包出来的lodash代码
    // 根据下面的设置会打包出来main.bundle.js、main2.bundle.js和lodash.bundle.js三份文件
    // 下面的写法时main与main2都只依赖了lodash的时候，没有依赖其他的库，如果依赖了其他的库可以用后面的写法
    // main: {
    //   import: "./src/main.js",
    //   // 指明main.js需要引用lodash
    //   dependOn: "lodash",
    // },
    // main2: {
    //   import: "./src/main2.js",
    //   // 指明main2.js需要引用lodash
    //   dependOn: "lodash",
    // },
    // // 单独打包lodash
    // lodash: "lodash",

    // main和main2还依赖了dayjs eg: import _ from 'lodash';import dayjs from 'dayjs'
    // 根据下面的设置会打包出来main.bundle.js、main2.bundle.js和lodash.bundle.js和dayjs.bundle.js四份文件
    // main: {
    //   import: "./src/main.js",
    //   // 指明main.js需要引用lodash
    //   dependOn: ["lodash", "dayjs"],
    // },
    // main2: {
    //   import: "./src/main2.js",
    //   // 指明main2.js需要引用lodash
    //   dependOn: ["lodash", "dayjs"],
    // },
    // // 单独打包lodash
    // lodash: "lodash",
    // // 单独打包dayjs
    // dayjs: "dayjs",

    // main和main2还依赖了dayjs eg: import _ from 'lodash';import dayjs from 'dayjs'时还有一种写法
    // 根据下面的设置会打包出来main.bundle.js、main2.bundle.js和share.bundle.js三份文件
    // main: {
    //   import: "./src/main.js",
    //   // 指明main.js需要引用lodash
    //   dependOn: "share",
    // },
    // main2: {
    //   import: "./src/main2.js",
    //   // 指明main2.js需要引用lodash
    //   dependOn: "share",
    // },
    // // 合并打包lodash和dayjs
    // share: ["lodash", "dayjs"]
  },
  output: {
    // 单入口打包时可以写死输出的文件名，但是多入口打包的时候不能写死
    // filename: "bundle.js",
    // 多入口打包的时候必须要把每个入口打包出来的结果的文件名用占位符体现出来
    // filename: "[name].bundle.js", // 这里的name对应的就是在entry属性设置多入口的时候，entry的属性值不就是一个对象了吗，那么这个对象的属性名就是这个name的值
    // 在文件名前面加上"js/"表示通过主入口文件打包出来的js文件，先放入js文件夹中，再放入path指定的文件夹(dist)中
    // filename: "js/[name].bundle.js", 
    // hash：对整个项目求哈希，整个项目中打包路径上的所有文件(这是一个依赖的森林————有多棵树组成，一个入口组成的一棵依赖树，多个入口的依赖树组成森林)中如果一个文件的内容改变了那么这个哈希值就会发生改变
    // filename: "js/[name].[hash:6].bundle.js",  // 输出：main.123456.bundle.js和main2.123456.bundle.js
    // chunkHash：对每个，注意是每个，每个入口文件都会形成一棵依赖树，将一个依赖树上的每个文件看成一个整体，对这个整体求哈希，就是这个入口对应的chunkHash，不同入口的chunkHash是不同的，比如，入口A输出的打包文件A’的chunkHash值和入口B输出的打包文件B’的chunkHash值是不同的，对应到输出的文件名中的chunkHash值就是不同的
    // 这个依赖树上的文件发生变化这个chunkHash的值才会发生变化
    // 对于output的filename常使用chunkHash
    filename: "js/[name].[chunkHash:6].bundle.js",  // 输出：main.234567.bundle.js和main2.456789.bundle.js
    // contentHash：对当前打包的文件求hash，只有这个文件中的能容发生改变contentHash的值才会变化，该文件中引入的文件发生变化不会影响
    // filename: "js/[name].[contentHash:6].bundle.js",  // 输出：main.345678.bundle.js和main2.567890.bundle.js
    // __dirname的路径是当前文件webpack.config.js所在的路径
    // 必须是绝对路径
    path: path.resolve(__dirname, "./dist"),
    // 对img类型的或者是font类型的文件的输出路径以及输出的文件名进行统一的配置，但是在module中的精确配置会先生效
    // 准确说是对除了js文件的其他类型的文件输出到dist文件夹中时做一个统一的配置
    assetModuleFilename: "img/[name].[contentHash:6][ext]", // 对于output的assetModuleFilename常使用contentHash
    // 这个值不止对最后打包出来的dist文件夹中的index.html文件起作用，而且对webpack-dev-server在npm run serve时在内存中生成的index.html也是起作用的
    // 这个值会在打包过程中被加到index.html中所有的link的href或者script的src属性的最前面，如：<script defer src="/aaa/bundle.js"></script>
    // 这个东西只做路径的字符串拼接，没有其他影响————比如打包出来的东西要放到哪个文件夹下这种影响
    // publicPath: '/aaa',
    // publicPath第二个用途就是配置cdn服务器的域名
    // 首先我们要把我们打包生成的产物都放到cdn服务器下的一个文件夹下，比如cdn文件夹
    // 然后通过配置publicPath: "https://pokemao.com/cdn/"，使得打包出来的html文件中的link和script路径前面都拼接上https://pokemao.com/cdn/这个字符串, 打开这个html文件后，link与script请求的就是cdn中的资源了

    // 在使用webpack原生提供的分包能力————对异步方式引入(import("...").then(res => {}))的代码————的时候，可以使用这个值来指定分包出来的文件名称
    // 如果不指定这个值，那么使用webpack原生提供的分包能力分出来的包的名字都会匹配filename的命名模式输出结果
    // 这里的[name]默认是使用文件的hash值，与chunkIds: "deterministic"时的hash值计算方式一致，如果想在设置[name]的值的话需要在import的地方使用魔法注释
    // import(/* webpackChunkName: "index" */ "./index").then(res => console.log(res)); // 输出的结果将从965.chunk.js变成index.chunk.js
    // chunkFilename: "[name].chunk.js",
    // 如果使用了魔法注释改变了[name]的结果，我们还想使用hash值的话怎么办呢？
    // 使用下面的这种方式[hash]来添加hash值
    // chunkFilename: "[name].[hash:6].chunk.js",
    // 在文件名前面加上"js/"表示通过这个规则————异步分包————分包出来的js文件，先放入js文件夹中，再放入path指定的文件夹(dist)中
    chunkFilename: "js/[name].[contentHash:6].chunk.js", // 对于output的chunkFilename常使用contentHash

    // 对异步引入的优化
    // 对于一般的异步引入import("xxx").then(res => {}), 只会在这段代码执行的时候才去命令浏览器异步下载这个xxx文件————这是浏览器提供的能力
    // 比如我们写这样一段代码
    /**
     * <div id="btn" @click="(function() {
     *    import('./xxx').then(res => {
     *       document.getElementById('btn').innerHTML = res;
     *    })
     * })()"
     */
    // 这个被webpack分包出去的异步文件只有在这个id为btn的div被点击的时候才会从网络中被下载然后被加载最后被执行
    // 可以优化的点在于浏览器空闲时下载，比如这个时候的浏览器render进程没有代码需要执行，那么就去下载这个文件
    // 1. prefetch   浏览器空闲时立即下载
    // import(
    // /* webpackChunkName: "index" */ 
    // /* webpackPrefetch: true */
    // "./index").then(res => console.log(res));
    // 2. preload    这个异步import的文件会随着父级文件的并行下载与加载到内存中 (父级文件就是写import的那个文件，比如在文件a里面写了import(文件b), 那么文件a就是文件b的父文件)
    // 我疑惑的点就是，这个preload就相当于时没有使用异步加载一样使用同步加载一样能达到这样的效果，其实不是的，preload可以达到并行下载父级文件和异步分包出去的异步分包文件并且同时加载，这里重点在于同时
    // 而同步import必须要先对import引入的文件进行下载并加载，如果这个import引入的文件没有加载完毕的话，这个写有import的父级文件就不能下载(可能能下载)，但是一定不能同时加载，因为父级文件中的代码依赖于这个import同步引入的文件，这种加载顺序一定要符合依赖树的拓扑结构
    // import(
    // /* webpackChunkName: "index" */ 
    // /* webpackPreload: true */
    // "./index").then(res => console.log(res));

    // 打包输出库文件
    // 首先我们要说明 一般的webpack打包生成的文件都是直接可以构成静态服务器的文件，但是不能作为库文件，原因是webpack使用的导出规范是自己实现的，不同于es module，commonjs，amd，umd这些社区规范的导出方式，所以webpack的导出方式很难作为库文件来使用
    // 所以webpack提供了让我们指定相应的导出规范来形成库文件的方法
    // 1. CommonJS: 社区规范的CommonJS模块化规范，没有规定用module对象实现
    // 2. CommonJS2: Node实现的CommonJS规范，使用module对象
    // 使用umd的规范可以支持 AMD/CommonJS/CommonJS2/浏览器, 注意这里的浏览器不是通过es module的形式导出的，而是把导出的对象挂在到window的一个属性上，这个属性的名字是什么要看下面library的值是什么
    libraryTarget: 'umd',
    // 比如这个库导出的是
    /**
     * const a = 1, b = 2;
     * export {
     *  a,
     *  b
     * }
     */
    // 1. CommonJS: 在CommonJS规范的环境下想要使用这个打包出来的库，需要通过exports.pokemaoUtils.a和exports.pokemaoUtils.b使用库文件导出的内容
    // 2. CommonJS2：在CommonJS2规范的环境下想要使用这个打包出来的库，直接使用 const {a, b} = require('npm中发布的这个库的库名称')
    // 3. 浏览器：在浏览器规范的环境下想要使用这个打包出来的库，先把这个库下载到本地或者使用cdn，然后通过window.pokemaoUtils.a和window.pokemaoUtils.b使用库文件导出的内容
    library: 'pokemaoUtils',
    // umd模式下不设置this会有问题 因为node环境下没有self这个对象，对这个库文件的解析就会出问题，其实使用globalObject: "globalThis",也可以
    globalObject: "this",
    // webpack打包库文件的原理就是
    // webpack先用自己的打包规范(_webapck__require_)进行打包，然后用库文件要求的规范(libraryTarget指定)进行导出，所以在库文件的内部使用的是webpack的规范进行模块化管理的，在库文件导出的时候才使用库要求的规范进行导出
  },
  // hmr原理: webpack-dev-server就是一个服务器，如同我们自己用vue写前端，node写后端然后部署到线上的一个服务器一样，在自己用vue写前端，node写后端然后部署服务器上时，我们要把用户获取前端页面的进程放在80端口上，把前端获取后端数据的进程部署在如3000端口上
  // 这里的80端口对应的就是webpack-dev-server开启的8080端口，而这个3000端口webpack并没有告诉我们，但是webpack一定是开启了这么一个端口的
  // webpack-dev-server在8080端口放的就是我们的dist打包之后的内容同时在里面写入了websocket服务，而webpack-dev-server在后端放的就是websocket服务
  // 当用户更改了入口文件有关联的文件时，webpack-dev-server在后端会得到这个信息，然后通过websocket把改变的内容发送给前端，前端再去响应
  // proxy原理: 之前说过webpack-dev-server会开启一个后端node服务，这个服务会使用CORS让开在8080端口的项目可以跨域访问这个webpack-dev-server开启的后端node服务
  // 这个后端node服务会把这条请求再转发到本应转发的位置，但是后端node的http请求是没有跨域问题的，因为跨域问题时浏览器的两个网络请求方法fecth和XMLHttpRequest(xhr)做的防护，而node的http模块并没有这个限制
  devServer: {
    // 在package.json中配置webpack server的script脚本默认是开启了模块热替换，如果不想使用模块热替换可以使用开启hot: false这样就表示只进行模块更新时替换，但是不是热替换
    // 只开启hot: true是不能实现热更新的必须要在入口文件中指定那些模块要进行热更新
    // hot: true, // 默认这个值就是true,
    // 在控制台报错被修复之后也不会刷新浏览器，而是走模块热替换
    // 现在这个属性被删除了使用hot: 'only'
    // hotOnly: true,
    hot: "only",
    // 把dev-server的地址固定下来，在使用npm run serve的时候固定域名'0.0.0.0'
    host: "0.0.0.0",
    // 把dev-server的端口号固定下来，在使用npm run serve的时候固定端口号'8888'，如果在npm run serve时8888被占用会报错
    port: "8898",
    // 在npm run serve之后会自动打开浏览器
    open: true,
    // 对npm run serve启动的服务器的内存中的打包文件进行gzip压缩，开发过程中的性能优化
    compress: true,
    // 这个publicPath和output配置项中的publicPath是不同的，不同点在于这个路径是用来指定webpack-dev-server在内存中生成的所有的打包文件放在那个目录下
    // 这个属性被删除了在webpack5，现在的webpack5只能在output中设置publicPath了，就是强制要求output的publicPath和devServer的publicPath相同
    // publicPath: '/aaa',
    // contentBase用来表明在html模板手写写死引入的内容（硬编码）是相对于哪个路径的, 默认值是package.json所在的路径
    // 而不表明webpack打包后写入index.html中的script或者link标签的src的相对路径是什么————这个相对路径是用output的publicPath指定的
    // 注意：这些在html模板手写写死引入的内容，可以被webpackdevserver正常使用，但是要打包的话就要使用webpackPlugin的CopyWebpackPlugin插件让这个硬编码引入的内容被正常打包到dist中
    // contentBase被废弃了，现在用的是static属性的directory
    // contentBase: path.resolve(__dirname, './public'), // 表示所有在index.html中写死的引入资源都是相对于path.resolve(__dirname, './public')这个目录的
    static: {
      directory: path.resolve(__dirname, "./public"),
      watch: true,
    },
    // 对在html模板手写写死引入的内容（硬编码）进行重新刷新浏览器，不能实现模块热替换，因为在html模板手写写死引入的内容没有走webpack的编译过程
    // watchContentBase被废弃了现在用的是static属性的watch
    // watchContentBase: true,
    // 解决history路由刷新报404错误的问题，可以设置值为一个对象让匹配更加详细
    historyApiFallback: true,
    proxy: {
      // 配合在axios的option中添加baseUrl: '/api',
      "/api": {
        target: "http://localhost:3000",
        pathRewrite: {
          "^/api": "",
        },
      },
      // 配合在axios的option中添加baseUrl: '/data',
      "/data": {
        target: "https://localhost:8567",
        pathRewrite: {
          "^/data": "",
        },
        // 如果要代理去往https的请求，就需要设置这个属性为false
        secure: false,
        // ❓❓❓❓❓❓❓❓❓❓要测试
        // 服务器为了防止有人用代理的行为爬取服务器的数据，方法就是代理到localhost:8567。所以很多服务器会开启只允许在localhost:3000的http请求获取数据
        // 当服务器只允许在localhost:3000的http请求获取数据时，我们是localhost:3000但是webpack-dev-serve会代理到localhost:8567，这时就会被服务器拦截，因为服务器会开启只允许在localhost:3000的http请求获取数据
        // 这是就要把changeOrigin属性设置为true
        changeOrigin: true,
      },
    },
  },
  resolve: {
    // modules指定对于引入模块的加载路径
    // webpack在对于浏览器环境打包时, import的加载规则和node的加载规则不同，不同点在于：1. 浏览器没有node的内置模块如fs，path，所以只要是import的内容只可能引入的是相对路径或者引入的是node_modules中的内容
    // 2. 浏览器没有node模块加载规则，所以不存在去node_module里面去找东西的规则，在webpack中能使用这个去node_module里面去找东西的规则的原因就是下面这个属性的默认值支持了（准确的说是一个第三方库支持了这个功能）
    // ❓❓❓❓❓❓❓webpack会把import的内容当成相对路径去查找还是当成node_module中的包去查找，这个问题还要再看
    // modules: ['node_modules'], // 等同于默认值
    // mainFields用来指定import...from'abc'的abc这个库的主入口从是通过package.json中的哪个字段去找
    // 在target: 'browserlist'或者'web'或者'webWorker'的时候，mainFields的默认值
    mainFields: ['browser', 'module', 'main'], // 比如使用了import...from'abc'，那么webpack会到node_modules中去找abc这个包，然后查看abc这个包中的package.json这个文件，首先看有没有名为browser的属性，如果有就用这个属性的属性值作为abc这个库的入口，如果没有就去看有没有名为module的属性，如果有就用这个属性的属性值作为abc这个库的入口，如果没有就去看有没有名为main的属性，如果有就用这个属性的属性值作为abc这个库的入口，如果没有就报错
    // 在targe: 'node'时，mainFields的默认值
    // mainFields: ['module', 'main'], // 比如使用了import...from'abc'，那么webpack会到node_modules中去找abc这个包，然后查看abc这个包中的package.json这个文件，首先去看有没有名为module的属性，如果有就用这个属性的属性值作为abc这个库的入口，如果没有就去看有没有名为main的属性，如果有就用这个属性的属性值作为abc这个库的入口，如果没有就报错
    // extensions这个属性会在路径加载时依次尝试添加后缀
    // extensions: [".wasm", '.mjs', '.js', '.json'], // 等同于默认值
    extensions: [".wasm", ".mjs", ".js", ".json", "ts", "jsx", "tsx"],
    // 设置路径中的别名
    alias: {
      // @代表src目录
      "@": path.resolve(__dirname), //等同于 '@': path.resolve(__dirname, '../src'),
      // assets代表src/assets目录
      // 我们都知道放入assets中的图片视频等资源会被webpack打包压缩，如果不知道可以看loader中的配置，
      // 但其实放入public中的图片如果在打包过程中使用import引入的话也会被压缩，不同点在于public中的内容如果在打包过程中使用import引入的话，这些引入的内容不仅会被打包，而且还会原封不动的放入打包后的dist文件夹中一次，这是由于CopyWebpackPlugin插件的效果，也就是说最终打包生成的dist文件中会存在相同的资源两次，很浪费服务器硬盘内存以及网络带宽
      // 所以放入public中的内容往往是需要在模板index.html中直接引入的东西才会放入public文件夹中
      assets: path.resolve(__dirname, "./assets"), // 注意：'./assets'的结尾没有'/'，即：别写成'./assets/'  // 等同于 path.resolve(__dirname, '../src/assets')
    },

  },
  module: {
    rules: [
      {
        test: /\.css$/,
        // loader: 'css-loader', // 单一loader
        // use: ['style-loader', 'css-loader'], // 多loader无配置时的简写方式
        use: [
          {
            loader: "style-loader",
            options: {
              // 配置选项
            },
          },
          {
            // 解析css文件，对@import引入的文件生效
            loader: "css-loader",
            options: {
              // 配置选项
              // 表示对@import引入的css文件使用css-loader之前的1个loader先处理这个@import引入**后**的css文件，之后再由css-loader处理@import引入后的css文件, 就是对于@import引入的css代码先使用'postcss-loader'处理
              importLoaders: 1,
              // 表示对@import引入的文件使用css-loader之前的1个loader先处理
              // importLoaders: 3
            },
          },
          {
            // 为css文件添加前缀的插件，注意：不对css文件中的@import引入的css文件生效
            loader: "postcss-loader",
            // 这部分配置可以抽离到单独的文件postcss.config.js中
            // options: {
            //     // postcss需要配合特有的plugin使用才能实现添加前缀的功能
            //     postcssOptions: {
            //         plugins: [
            //             // autoprefixer这个插件只负责添加前缀
            //             // require('autoprefixer'),
            //             // postcss-preset-env这个插件负责添加前缀和对一些属性值进行polyfill
            //             'postcss-preset-env' // 写成require('postcss-preset-env')
            //         ]
            //     }
            // }
          },
          // 对less文件处理时用到
          //   {
          //     // 负责把less文件转成css文件
          //     loader: "less-loader",
          //   },
        ],
      },
      {
        test: /\.png/,
        // 在 webpack5中下面url-loader的方式被取代了（官方内置了这个loader）
        // use: [
        //     {
        //         loader: 'url-loader',
        //         options: {
        //             // 所有内容被打包到dist文件中之后的文件名
        //             // img/: 输出到img文件夹下
        //             // [name]: 原来图片的名称
        //             // [hash:6]: 根据原来图片的名称计算的hash？
        //             // [ext]: 原来图片的扩展名
        //             name: 'img/[name].[hash:6][ext]',

        //             // 把所有的图片放到dist/img文件夹下
        //             // 已经被name属性中的'img/'代替了
        //             // outputPath: 'img',

        //             // 大于100KB的图片会被作为一个图片文件输出到dist/img/下
        //             // 小于100KB的图片会被用Base64编码的方式输出到index.html中
        //             limit: 100 * 1024, //单位Byte
        //         }
        //     }
        // ]
        // webpack5中的配置方式
        // 相当于配置了file-loader，所有的图片都会输出成单独的文件
        // type: 'asset/resource', // 可以配合generator属性
        generator: {
          // 相当于配置url-loader中options中的name属性
          // ！！注意: 这里是对img类型的文件输出时进行的单独配置，我们还可以在上面的output属性中做一个总的配置，配置的属性名称叫做assetModuleFilename
          filename: "img/[name].[hash:6][ext]",
        },
        // 所有的图片都会以base64编码的方式输出到index.html中
        // type: "asset/inline", // 不能配合generator属性
        // 相当于可以配置limit的url-loader
        type: "asset", // 可以配合generator和parser使用
        parser: {
          dataUrlCondition: {
            // 相当于limit选项
            maxSize: 100 * 1024,
          },
        },
      },
      {
        // 处理各种字体文件，如：阿里巴巴图标库引入的图标
        test: /\.wtff/,
        type: "asset/resource",
        generator: {
          filename: "font/[name].[hash:6][ext]",
        },
      },
      {
        test: /\.js$/,
        // 在使用babel的时候的时候防止对node_modules中的代码进行polyfill的操作
        exclude: /node_modules/, //正则表达式
        rules: [
          {
            loader: "babel-loader",
            // 这里的配置都可以写在babel.config.js中，babel-loader会自动去读这个文件中的配置
            // options: {
            //   presets: [
            //     // 可以在这里额添加多个预设
            //     [
            //       // 最基础的预设，专门用来代替babel-loader的plugins的，能根据.browserlistrc适配的浏览器自动添加转换的插件
            //       "@babel/preset-env",
            //       // // 正常情况下，这里是不用写的，因为这个预设会自动读取.browserlistrc，但是如果你想自定义一些优先级更高配置可以写在这里
            //       // {
            //       //   // 表示要对chrome 88这个浏览器进行适配
            //       //   targets: ["chrome 88"]
            //       // }
            //     ]
            //   ]
            //   // 插件不同于poly-fill，插件是把不支持的东西转化成支持的，如箭头函数就转化成绑定this的bind函数，块级作用域就转化成立即执行函数；而poly-fill是把不支持的功能实现了，如generator，promise，decorator等
            //   // plugins: [
            //   //   // 这个是用来转化箭头函数的插件
            //   //   "@babel/plugin-transform-arrow-functions"
            //   // ]
            // }
          },
          // {
          //   // 在打包每个js文件之前都验证是否符合.eslintrc.js文件中定义的规则，比如公司在eslintrc.js中配置了不让使用三元运算符的嵌套(a ? b ? c : d : e ? : f : g), 这个语法在后面babel-loader的编译过程中是可以被正常编译的并不是错误语法，但是却不能通过eslint的校验
          //   // 总的来说eslint是用来规定代码书写的，但是就算不按eslint的规则来书写代码只要符合js的书写规范也是可以进行编译执行的
          //   // 如果在eslint中没有配置允许使用生成器装饰器等最新的js语法的话，就算使用babel支持了也是不能通过eslint校验的，所以如果要支持最新的js语法要在bebel和eslint两个地方进行配置
          //   // 这样的配置只能在打包的时候校验eslint规范，但是我们可以使用vscode的插件使vscode可以对每个打开的js或者ts文件使用该文件所在项目的eslintrc.js文件进行eslint校验
          //   loader: "eslint-loader"
          // }
        ],
      },
      // {
      //   test: /\.ts$/,
      //   use: [
      //     {
      //       // 如果想要使用typescript这个库来编译ts代码的话需要在命令行使用npx tsc --init生成tsconfig.json文件
      //       // 能够根据tsconfig.json文件的配置检查ts文件中的ts语法，但是不能在编译ts代码到js代码的过程中提供polyfill功能
      //       // 最佳实践：使用babel-loader进行ts文件编译，使用typescript(tsc)对ts代码语法进行检测。
      //       // 使用babel-loader编译的方式就是直接在webpack中配上babel-loader；
      //       // 而使用tsc检查语法的方式是1. 在package.json中的script中配置一行脚本“tsc --noEmit”并在npm run build之前执行这行脚本或者2. 在package.json中的script中配置一行脚本“tsc --noEmit --watch”，在编写代码之前运行，在编写代码完毕之后要打包的时候关闭直接打包(tsc --watch这个命令会检查package.json文件所在目录下所有的ts文件中的ts语法)
      //       loader: 'ts-loader'
      //       // npx tsc 这个命令会由于没有指定入口文件而报错(使用这个命令的时候是没有走webpack的打包流程的，而是只走了typescript这个库的编译流程)，可以在命令后面指定入口文件，也可以在tsconfig.json中指定，且入口可以不唯一
      //       // 而如果是在package.json中的script中配置的"tsc": "tsc"，执行npm run tsc的命令时会把每个package.json文件所在目录下所有的ts文件都作为入口进行编译
      //     }
      //   ]
      // }，
      {
        test: /\.ts$/,
        use: [
          {
            // 想要使用babel处理ts代码需要在bebel.config.js中添加相应的预设，使用babel-loader时不会读取tsconfig.json中的配置
            // 不能检查ts语法，但是能在编译ts代码到js代码的过程中提供polyfill功能
            // 最佳实践：使用babel-loader进行ts文件编译，使用typescript(tsc)对ts代码语法进行检测
            loader: "babel-loader",
          },
          {
            // 在打包ts文件之前都会验证是否符合.eslintrc.js文件的规定，注意：要想让eslint能验证ts文件需要在配置eslint
            // loader: 'eslint-loader'
          },
        ],
      },
      {
        test: /\.vue$/,
        use: [
          {
            // 这个loader内部会使用vue-template-complier这个库，这是vue官方开发的一个库，用来编译template语法
            // 这个loader也要配合一个插件在vue-loader中的插件一起使用，在下面的plugin中添加这个插件
            loader: "vue-loader",
            // vue-loader所作的工作是把.vue文件里面的<template> 编译成render函数放入js文件; 把<style>放入到一个单独的css(或less或sass)文件中，然后走webpack的loader逻辑进行打包(进行postcss处理等); 把<script> 里面的内容，放入到js文件中走webpack的loader逻辑进行打包(进行babel-loader的处理等)
          },
        ],
      },
    ],
  },
  optimization: {
    // 下面的splitChunks设置的比较复杂，但是在真正开发的时候，只用设置splitChunks: { chunks: "all" } 就可以了，其他的配置参数使用webpack内置好的就行
    // webpack5内部已经内置了splitChunk这个插件
    splitChunks: {
      // 所有在splitChunks中的配置都可以在cacheGroup中配置，实现对每一个缓存组的更加精细的配置

      // 对所有的打包文件中的异步引入(import("...").then(res => {}))的包进行分包处理，如：import("xxx").then(res => {}))，就是对xxx进行分包处理
      // chunks: 'async',
      // 对所有的打包文件中的同步引入(import _ from 'lodash')的包进行分包处理，如：import _ from 'lodash', 就是对lodash进行分包处理
      // chunks: 'initial',
      // 对所有的打包文件中的同步和异步引入都进行分包处理，相当于上面两项的结合
      chunks: "all",
      // note: webpack本身就算不使用splitChunks分包处理情况下，也会对异步导入(import("...").then(res => {}))进行分包处理，就算是你把chunks: "all", 改成chunks: "initial", webpack也会自动的对异步导入进行处理

      // 在主入口的打包流程中拆分出来的包，即通过同步或者异步import引入的包
      // 如果这个拆分出来的包的大小是2000Byte以上，那么这个拆分出来的包就被保留
      // 否则这个拆分出来的包会被重新合并近主入口打包生成的输出文件中，人话说就是这个import的包将不被拆分出来
      minSize: 8000, // 单位是Byte
      // 这个属性将对所有build出来的包进行检查，可以理解为在webpack打包完成的最后阶段会使用这个属性进行检查，如果有哪个打包出来的包的大小大于这个maxSize的值，那么就把这个包再度拆分，知道所有build出来的包不大于这个值
      // maxSize: xxx
      // 对所有打包文件中引入了两次及以上的包进行拆分
      // minChunks: 2,
      // 如果不设置这个cacheGroups，那么只会对从node_modules中引入的内容进行分包，如果你想对自己写的一些模块(js文件)进行分包处理的话，就要使用cacheGroups去匹配
      // 分组分包，属于同一组(❗❗匹配路径符合test❗❗)的包会以相同的filename模式如"[id].nodemodules.js"作为输出名称
      // 不写这个cacheGroup时候的输出为415.bundle.js和704.bundle.js
      // 写这个cacheGroup时候的输出为415.nodemodules.js和704.nodemodules.js
      // 所以也就是说，webpack默认就会对node_modules中的内容进行分包，我们自己写这个分包逻辑的时候能够更好的分包之后输出的文件名称
      cacheGroups: {
        vendor: {
          // import时，对属于node_modules下的包都会被拆分到一个文件中，文件名用filename中配置
          test: /[\\/]node_modules[\\/]/, // 引用路径中匹配到'/node_modules/'的文件
          // [name]和[id]的值是一模一样的
          // filename: "[name].[id].nodemodules.js"
          // 一般来说对于splitChunks来说是不需要使用hash的，因为当chunkIds为"deterministic"的时候[id]的值就和contentHash的效果一样❓❓❓❓❓(没有验证)
          // filename: "[id].[hash:6]:[chunkHash:6]:[contentHash:6].nodemodules.js",
          // filename: "[id].nodemodules.js",
          // 在文件名前面加上"js/"表示通过这个规则————splitChunks分包————分包出来的js文件，先放入js文件夹中，再放入path指定的文件夹(dist)中
          filename: "js/[id].nodemodules.js",
          // 一般这个优先级都是负值，但是还是遵守值越大，打包的优先级就越高
          // 默认的priority的值应该是0 ❓❓❓❓❓❓
          // 如果一个import内容同时匹配了两个或多个cacheGroup的分包逻辑那么就会按照优先级适配优先级最高的分包逻辑
          priority: -10,
          // 如果某个包又匹配上了这个分包规则的话，就会去查找这个包之前是否已经被分包处理过了，如果分包处理过了就会对这个分出来的包进行重新使用，而不会再分一个包出来
          reuseExistingChunk: true,
        },
        // 如果不设置这个cacheGroups，那么只会对从node_modules中引入的内容进行分包，如果你想对自己写的一些模块(js文件)进行分包处理的话，就要使用cacheGroups去匹配
        // 对所有import路径中含有index这个字符串的文件进行分包处理
        index: {
          test: /index/,
          // filename: "[id].index.js",
          // 一般来说对于splitChunks来说是不需要使用hash的，因为当chunkIds为"deterministic"的时候[id]的值就和contentHash的效果一样❓❓❓❓❓(没有验证)
          // filename: "[id].[hash:6]:[chunkHash:6]:[contentHash:6].index.js",
          // 在文件名前面加上"js/"表示通过这个规则————splitChunks分包————分包出来的js文件，先放入js文件夹中，再放入path指定的文件夹(dist)中
          filename: "js/[id].index.js",
          // 如果某个包又匹配上了这个分包规则的话，就会去查找这个包之前是否已经被分包处理过了，如果分包处理过了就会对这个分出来的包进行重新使用，而不会再分一个包出来
          reuseExistingChunk: true,
        },
        default: {
          // 某一个js类型(包括ts，jsx，mjs等)的模块只要被import大于minChunks次，就会被这个逻辑打包
          minChunks: 2,
          filename: "[id].commom.js",
          priority: -20,
          // 如果某个包又匹配上了这个分包规则的话，就会去查找这个包之前是否已经被分包处理过了，如果分包处理过了就会对这个分出来的包进行重新使用，而不会再分一个包出来
          reuseExistingChunk: true,
        },
      },
    },

    // 在开发和生产环境中分包出来的文件名都由这个控制
    // splitChunks分包出来的包的filename中匹配到的[name]与[id]的值将会以自然数递增的方式呈现，
    // 即所有打包出来的文件可能是： 1.nodemodules.js
    //                            2.nodemodules.js
    //                            3.index.js
    //                            main.index.js
    //                            main2.index.js
    // 缺点: 不能见名知意，对浏览器缓存加载没有帮助
    // chunkIds: "natured",
    // splitChunks分包出来的包的filename中匹配到的[name]与[id]的值将会以分包文件所在路径加文件名的方式呈现，
    // 即所有打包出来的文件可能是： index-node_modules_pnpm_ansi-html-community_0_0_8_node_modules_ansi-html-community_index_js-n-8db8fd.index.js
    //                            index-src_index_js-node_modules_pnpm_core-js_3_32_1_node_modules_core-js_internals_to-absolut-a3f4d0.index.js
    //                            vendor-node_modules_pnpm_core-js_3_32_1_node_modules_core-js_internals_classof-raw_js-node_mo-6cb2a0.nodemodules.js
    //                            main.index.js
    //                            main2.index.js
    // 缺点: 能见名知意，见到名字就知道是从那个文件打包来的，但对浏览器缓存加载没有帮助
    // chunkIds: "named",
    // splitChunks分包出来的包的filename中匹配到的[name]与[id]的值将会以打包文件的hash值的方式呈现，
    // 即所有打包出来的文件可能是： 133.nodemodules.js
    //                            123.nodemodules.js
    //                            566.index.js
    //                            main.index.js
    //                            main2.index.js
    // 缺点: 不能见名知意，对浏览器缓存加载有帮助
    chunkIds: "deterministic",

    // runtime相关的代码抽离到单独的chunk里面，就是对runtime相关的代码进行split打包
    // 什么是runtime相关的代码呢? 就是那些webpack转换import/export或者require/module.exports的代码
    // true和"multiple"的输出结果相同
    // 有几个入口就会有几个runtime相关的文件被输出，例如
    // runtime~main1.bundle.js // output的filename名字输出的模式
    // runtime~main2.bundle.js
    runtimeChunk: true,
    // runtimeChunk: "multiple",
    // "single"的输出结果是一个文件，把所有入口的runtime文件合并成一个输出
    // runtime.bundle.js
    // runtimeChunk: "single",
    // 下面这种形式和single一样会把所有入口的runtime文件合并成一个输出，但是可以自己指定output的filename中[name]的名称
    // pokemao.bundle.js
    // runtimeChunk: {
    //   name: "pokemao"
    // },
    // 下面这种模式也是可以自己指定output的filename中[name]的名称，如果name这个方法的返回值可以区分名称就根据入口输出多个runtime文件，如果不能区分那么就还是会输出成一个
    // 具体输出几个, webpack都会校验的，尽量保证输出能正常运行的代码
    // pokemao.main1.bundle.js
    // pokemao.main2.bundle.js
    // runtimeChunk: {
    //   name(entryAttribute) {
    //     return `pokemao.${entryAttribute.name}`;
    //   }
    // }
    // runtimeChunk应该不需要使用hash值

    // treeshaking
    // 开启terser的tree shaking能力，在最后的打包文件中对导入但是没有使用的函数进行清除，就是不使用webpack提供的代码对这个函数进行导入导出！！
    // 比如我们在mathjs中export { add, mul }，但是在indexjs中import {add, mul} from './mathjs' 却只是用了add 或者说是 import * as all form './mathjs'却只是用了all.add, 这个时候mul这个函数
    // 在webpack打包出来的文件中不会被导出，即不会出现在__webpack_require__.d(__webpack_exports__, { "add": (a, b) => a + b })中
    // 具体的表现是在development模式下打包出来的文件会定义add和mul两个函数但是会用魔法注释标明mul函数需要被terser删除，并且__webpack_reuqire__只导出add
    // 在production模式下打包出来的文件不会定义mul这个函数（本质上是被terser删除了），之定义add这个函数
    // 这个功能只对ES Module形式的导入导出有效，对commonjs没有效果
    // 根本原因ES Module的import和export是V8引擎提供的语法关键字，而commonjs的require是nodejs提供的一个函数，这个函数会使用fs模块去读取文件中的字符
    // ES Module由于是V8的关键字，所以可以在解析的时候可以生成符号表(词法解析)，利用LL，LR(1)的能力构建出正确的文件之间的依赖关系，这都是在V8引擎或者说所有的js编译器在编译阶段(词法分析生成符号表，语法分析生成ast，优化生成字节码(运行时是C++代码使用switch分析字节码的含义执行相应的语句))会做的
    // 由于编译阶段不会执行js文件中的任何函数，只能使用LL或者LR的方式生成语法树，判断各个js语句之间的关系，而不能真正的执行函数，所以ES Module这种关键字就能提供编译时分析的能力，所以webpack可以利用js编译器可以生成依赖关系树，从而实现treeshaking
    // 但是commonjs是运行时才会使用node利用fs模块的能力执行require，webpack在打包阶段是不会执行我们的代码的，webpack是使用js编译器去分析我们的代码的，本质上webpack也是在处理ast，
    // 所以webpack其实是不知道我们require的文件到底有没有使用module.export={...}导出某些我们引用的函数的，如module.export={add, mul}, 但是我们使用const{abc, def} = require('./mathjs')，但是webpack分析不出，因为他没有执行require这个函数
    // 就算webpack会执行我们写的require这个函数，require中的内容也要放到ast中才能被webpack解析，这个怎么放到ast里也是个难题
    // 但是只是用usedExports和terser它的能力是不完善的，因为usedExports不能判断文件是否有副作用，所以对于一个单纯的import 'a.js'这种语句依旧会有一些残留被保存在打包出来的bundle文件中的，在bundle中保存下来的代码是a.js的全局代码，就是说运行bundle.js时依旧会执行a.js中的全局代码，因为它不能确定a.js中没有副作用
    // 要配合在package.json中配置sideEffects属性才能对import这条指令的在bundle.js中的残留进行完全删除
    // sideEffects的值可以是boolean, 也可以是对象
    // sideEffects: false，表示所有通过import的文件都没有副作用，通常会这样配置，同时也要求我们写的所有的模块都没有副作用，但是这样配置有个问题，就是import css文件的时候会有问题，我们要在配置css文件相关loader的地方进行特殊处理(加上sideEffects属性，而不是在package.json中加这个属性)
    // sideEffects: [
    //    "./src/a.js", // 路径相对的是package.json所在的文件路径
    //    "./src/b.js",
    // ] 表示a.js有副作用不能在bundle中剔除a.js的代码,b.js有副作用不能在bundle中剔除b.js的代码
    // 而c.js文件没有出现在这个数组中，表示c.js没有副作用能在bundle中剔除c.js的代码
    // sideEffects这个属性的数组中也是支持glob比配的比如:
    // sideEffects:[
    //    "**.css" // 表示所有的css文件都是具有副作用的，不能在bundle中剔除引入css文件操作的那部分的代码
    // ]
    // 我们推荐在项目中写的js文件都是纯模块没有副作用的
    // 所以我们package.json中的值常常为false
    // 这个时候项目中引入的css文件或者图片文件就会有问题(import '.css'或者import '.png'等等)
    // 这个时候可以使用sideEffects的数组模式在package.json中配置上这几个文件是有副作用的，如：sideEffects:["**.css", "**.png"]
    // 但是这种写法不是很舒服，所以我们要用另一种写法告诉webpack这几个css和图片文件是有副作用的
    // 在哪里写呢？要写在解析css文件或者图片文件的loader中
    // {
    //    test: /.css$/
    //    use: [
    //      {
    //        loader: ...
    //        options: [...]
    //      }
    //    ],
    //    sideEffects: true ❗❗❗❗
    // }
    usedExports: true,

    // 首先要声明：在mode为'production'的时候，webpack会自动调用terser这个工具对代码进行压缩(删除死代码)，丑化(改变变量名)
    // terser是一个工具，就行less、tsc、sass一样是一个可以单独使用的软件(命令)
    // 当然也可以在mode为'production'的时候，自己配置具体要进行的压缩和丑化形式
    // 表示开启丑化与压缩，只写这个属性minimize: true而不写minimizer的话，webpack会调用默认的minimizer配置进行压缩
    minimize: true, // 只有这个属性为true的时候才会应用下面minimizer中的配置
    // minimizer里面配置压缩要使用的插件，如果terser这个丑化插件还有很多别的插件的；如果不配置minimizer且minimize: true的情况下，这些插件在mode为'production'的时候，webpack会自动调用
    minimizer: [
      // webpack5可以使用teser-webpack-plugin的任何版本，在webpack4中要用pnpm安装teser-webpack-plugin@4.x.x的版本
      new TerserPlugin({
        // 与module中的use里面的test一样用来表示对哪些文件使用terser这个工具，不设置这个属性，默认值就是对所有的js文件使用这个属性
        // test:,
        // 明确包括那些文件 
        // include:,
        // 明确排除那些文件
        // exclude:,
        // 使用几个进程进行构建，默认值os.cpus().length - 1
        parallel: true, // 表示使用默认值
        // 是否把打包文件的注释抽取到单独的文件中
        extractComments: false,
        // terserplugin默认提供了默认的能力，当我们不满足于此的时候可以通过terserOptions配置
        // 具体的配置去查terser的官网
        terserOptions: {
          mangle: true,
          // 对顶层作用域中的变量名改名
          toplevel: true,
          // 不对类名进行更改
          keep_classnames: true,
          // 不对函数名进行更改
          keep_fnames: true,
          compress: {
            // 把所有使用arguments的地方改成正常参数
            arguments: true,
            // 删除死代码
            dead_code: true
          }
        }
      })
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    // 只能为html模板提供变量
    new HtmlWebpackPulgin(
      // option对象，给HtmlWebpackPulgin这个插件中默认的ejs模板使用
      {
        // 对应模板"./public/index.html"中的htmlWebpackPlugin.options.title字段
        title: "sawyer app",
        // 指定自己设置的ejs模板，表示不使用HtmlWebpackPulgin这个插件中默认的ejs模板，这时所有写在new HtmlWebpackPulgin({})中的option对象会对自己设置的ejs模板生效
        // 路径是相对于package.json所在的文件夹
        template: "./public/index.html",
        // 默认就是true，指的是把webpack打包生成的css，js等文件的路径以link或者script标签的方式注入到html文件中
        // inject: true,
        // 不注入
        // inject: false,
        // 把link和script标签注入到头部<head>标签内
        // inject: "head",
        // 把link和script标签注入到<body>标签内
        // inject: "body",
        // 模板文件及输出的bundle文件的路径和名称没有变化的话就是有缓存的结果输出
        // cache: true,
        // 打包输出的html文件是否进行压缩丑化(删除空格，删除注释等)
        // minify: true,
        // 下面这些属性在github的terser/html-minifier-terser里面看
        // minify: {
        //   // 移除注释
        //   removeComments: true,
        //   // 移除多余的属性 例如 <input type="text" /> === <input /> 所以在输出的html文件中会把type="text"删除
        //   removeRedundantAttributes: true,
        //   // 移除空属性 <div id=""> 会把id移除变成 <div>
        //   removeEmptyAttributes: true,
        //   // 删除空格
        //   collapseWhitespace: true,
        //   // 是否对<style>标签中的内容进行压缩处理
        //   minifyCSS: true,
        //   // 对<scripte>标签中的js代码进行怎样的压缩处理
        //   minifyJS: {
        //     // 这里就写minimizer里terserOptions中的内容
        //     mangle: {
        //       ...
        //     }
        //   }
        // }
      }
    ),
    // 为webpack提供全局数据，对标HtmlWebpackPulgin，DefinePlugin可以提供全局数据，这样不只是index.html模板可以用，整个的webpack打包的文件都可以用
    new DefinePlugin({
      // 这里就为public文件下的index.html文件提供了BASE_URL为'./'的数据
      // 注意最后在webpack的环境下BASE_URL的值为'./'而不是"'./'"
      BASE_URL: "'./'",
    }),
    // 把patterns数组中的文件复制到webpack打包生成的dist文件夹中
    new CopyWebpackPlugin({
      // 这是一个数组，可以写多个from和多个to
      patterns: [
        {
          // 相对于当前package.json所在的文件夹
          // 使用public、public/、./public、./public/都可以
          // 使用public/**或者public/*都会在dist文件夹中单独生成一个public文件夹，存放复制过去的东西，所以不要用
          from: "./public/", // 这是不是正则表达式❓❓❓❓❓❓
          // to的地址使用output的地址自动分配
          // to,
          globOptions: {
            ignore: [
              // **代表复制源的public文件夹
              "**/index.html",
              "**/.DS_Store",
            ],
          },
        },
      ],
    }),
    // 配合vue-loader使用的插件
    new VueLoaderPlugin(),
    new ReactRefreshWebpackPlugin(),
    // shimming   不推荐使用
    // 向全局中注入一些库文件
    // 用处: 有一些第三方的包会不引入lodash或者dayjs这些库，因为他知道在你的项目中一定会引入这两种包(它怎么知道的~~~)，这是你为了使用这些第三方的包就不得不向全局中注入lodash与dayjs了，也就是用下面的方式
    // 这些第三方包不引入lodash或者dayjs这些库的原因可能是，因为他知道在你的项目中一定会引入这两种包，为了防止两次打包导致的代码冗余❓❓❓❓❓❓❓，但是这是为什么呢? 难道他们打包的时候没有做treeshaking吗？导致代码里面有冗余代码？
    // 对于上面的问题可能是有的第三方库太老没有打包也没有模块化，这样的话建议不要使用这些第三方的库
    new webpack.ProvidePlugin({
      // const 属性名 = require("属性值"或者"属性值[0]")
      // 相当于执行代码const axios = require("axios")
      axios: "axios",
      // 相当于执行代码const get = require("axios").get
      get: ["axios", "get"]
    }),
    // 用于Css分包的插件，会把所有的css文件都提取单独打包，并且在最后输出的html文件中加上link标签来引入分包之后的css文件
    // 这个插件要配合其提供的一个loader使用，即MiniCssExtractPlugin.loader，在module->rules中对应的匹配css的rule中要求把style-loader替换成MiniCssExtractPlugin.loader
    // style-loader会把css文件中的内容以<style>标签的形式插入最后输出的html文件中而MiniCssExtractPlugin.loader会在最后输出的html文件中加上link标签来引入分包之后的css文件
    // 这样就不得不在生产和开发环境下做区分了，如果是开发环境下使用style-loader完全没有问题(当然在开发时使用MiniCssExtractPlugin.loader也是可以的)，如果是生产环境下要使用MiniCssExtractPlugin.loader
    new MiniCssExtractPlugin({
      filename: "css/[name].[contentHash:6].css" // 常使用contentHash
    }),
    // 这个插件会对css文件进行压缩————删除空格换行符什么的；但是不会对css文件的类名进行更改，因为这样要做的工作太多了
    new CssMinimizerPlugin(),
    // 这个是webpack包内提供的插件，这个插件会大量删除webpack最后打包生成的js文件中的立即执行函数————多数webpack使用的立即执行函数是为了形成块级作用域————作用域提升，减少代码变量的查找层级(编译原理意义中的)
    // 这个插件在mode为production的时候会自动添加进来
    new ModuleConcatenationPlugin(),
    // treeshaking css文件中的样式表代码
    new PurgeCssPlugin({
      // 哪个目录下的css文件要做tree shaking
      // 会自动找到css文件做处理，不会处理其他文件
      paths: glob.sync(
        `${path.resolve(__dirname, './src')}/**/*`, // 表示绝对路径src下的所有文件夹下的所有文件
        {
          nodir: true, // 表示不匹配文件夹
        }
        // 根据上面规则，glob.sync最后生成的匹配glob字符串的含义是 匹配src下不管多深层级下的所有文件，但是不匹配文件夹
        ),
      safelist() {
        return {
          // css文件中 css样式表比配规则是body的样式表不会被treeshaking删除掉
          standard: [
            // 通常都要加这两个标识，告诉PurgeCssPlugin不要删除这两个规则的样式表
            'body',
            'html'
          ]
        }
      }
    }),
    // gzip压缩
    // 这个gzip压缩只能生成static文件，但是我们不能只靠生成gzip文件就让服务器在客户端请求某个文件的时候就返回gzip文件，我没需要在服务器的代码中配置，如果客户端请求了某个文件并且客服端的content-type中有gzip这个选项(说明客户端能接受gzip类型的压缩文件，并自己进行解压展示)这样的话服务器才返回gzip类型的文件，否则正常返回未压缩的文件
    // 这里就要说到express的静态资源服务器和Nginx的静态资源服务器了
    // 众所周知，我们在部署服务器的时候都会使用nginx，那么nginx到底是什么呢
    // nginx是一个软件, 他提供了命令行工具，当我们启动nginx这个软件的时候，他会自动的去读nginx.conf这个文件中的配置，然后给我们启动一个静态服务器
    // 静态服务器监听的端口是多少，当有请求打到这个端口的时候要返回给用户什么静态文件(html, css, js, png, jpg等等各种格式的文件)都是由nginx.conf这个文件来配置的, 在nginx.conf中可以配置，返回的静态资源所在的文件路径在哪里
    // nginx这个软件会根据nginx.conf的配置来实现不同的代码逻辑，实现返回不同内容的静态服务器
    // 但是我们不能对nginx进行更加细粒度的编程，只能通过nginx.conf来配置nginx服务器
    // 相比于这种不够灵活的情况, express的静态服务器就很灵活了
    // 我们可以通过express.static()来开启静态服务器
    // 其实我们也可以使用node来自己实现一个静态服务器
    // 监听某个端口，当有人访问这个端口的时候，我们就从这个服务器磁盘的某个位置读取出来某个文件然后给客户返回回去，这就是静态资源服务器
    // 所以如果我们实现了一个自己的静态资源服务器的话，这个时候我们会控制当客户端请求某个文件的时候返回什么文件
    // 那么如果客户端在content-type中显示了他具有接受gzip格式文件的能力，这个时候我们就可以使用一个if(content-type === "gzip") return gzip文件的代码逻辑来为客户返回一个gzip压缩的文件
    // 所以当服务器监听到请求之后要返回什么样的文件 是服务器自己控制的，所以我们不能只靠生成gzip文件就让服务器拥有这样一个能力————什么能力呢？就是在客户端请求某个文件的时候就返回这个文件的gzip压缩后的问文件
    // 要想拥有这个能力就要我们自己配置
    // 刚刚说的是我们自己搭建的静态资源服务器要支持给用户返回gzip的时候的逻辑
    // 对于express提供的静态资源服务器有没有天然支持这个能力或者怎么配置就不知道了
    // 但是对于nginx提供的静态资源服务器能不能有这种细粒度的控制也有待考证，估计可以通过配置nginx.conf中的location /... { ... }来实现这个返回哪种具体文件来实现这个能力
    // 可是我还想多说的不是nginx有没有这种细粒度的控制能力，而是nginx提供了另一种返回给用户gzip压缩后的文件的方式
    // 在nginx.conf中我们可以配置gzip: on，表示开启gzip压缩，这个时候如果nginx检测到客户端能接受gzip格式的文件的时候，nginx会直接对原本要返回的文件(没有进行gzip压缩的)进行gzip压缩，然后给用户返回回去
    // 这种方式是在用户请求的时候进行gzip压缩(nginx会不会对这个压缩进行缓存就不知道了，但是缓存能提高效率，不用每次都把源文件压缩一遍在返回回去了)，不同于我们现在用的这种，我们现在用的这种是在本地先生成gzip压缩文件，然后当检测到客户端能支持gzip压缩文件的时候我们直接返回压缩好的gzip文件，而不是现场压缩在返回
    // 不传入任何的配置会有默认配置的
    // new CompressionPlugin()
    new CompressionPlugin({
      // 文件大于多少B的时候才进行压缩
      threshold: 0,
      // 对那些文件进行gzip压缩
      test: /\.(css|js)$/i,
      // minRatio === 压缩后的gzip文件的大小/源文件的大小 
      // 表示只有对文件a进行压缩后 minRatio >= 0.8的时候才对文件a进行压缩, 否则就不对文件a进行压缩了
      // 优先级大于threshold
      minRatio: 0.8,
      // include:,
      // exclude:,
    }),
    new InlineChunkHtmlPlugin(
      // 第一个参数是HtmlWebpackPulgin
      HtmlWebpackPulgin,
      // 把打包出来的那些文件直接以代码注入的方式而不是link标签href或者script标签src的方式引入进来
      // 把webpack打包好的文件名称为runtime什么什么(任意字符).js的文件直接以代码注入的方式注入到输出的html模板中
      [/runtime.*\.js/]
    )
  ],
};
