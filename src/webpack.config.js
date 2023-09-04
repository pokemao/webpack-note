const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPulgin = require("html-webpack-plugin");
const { DefinePlugin } = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
// 注意要解析.vue文件要使用一个vue-loader和这个vue-loader中提供的插件
// 配合vue-loader的插件
const {VueLoaderPlugin} = require('vue-loader')
// 注意react的hmr要使用两个插件一个是@pmmmwh/react-refresh-webpack-plugin用在webpack中另一个是react-refresh/babel用在babel中
// react 配置hmr的插件，同时还要在babel中配置一个react-refresh的插件来实现hmr
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

// console.log(1);
module.exports = {
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
  // 相对路径相对的是package.json所在的位置
  // 编译主入口
  entry: "./src/index.js",
  // 测试编译jsx代码
  // entry: "./src/react.js",
  // 测试编译ts代码
  // entry: "./src/typescript.ts",
  // 测试编译.vue文件
  // entry: './src/vue.js',
  output: {
    filename: "bundle.js",
    // __dirname的路径是当前文件webpack.config.js所在的路径
    // 必须是绝对路径
    path: path.resolve(__dirname, "./dist"),
    // 对img类型的或者是font类型的文件的输出路径以及输出的文件名进行统一的配置，但是在module中的精确配置会先生效
    // 准确说是对除了js文件的其他类型的文件输出到dist文件夹中时做一个统一的配置
    assetModuleFilename: "img/[name].[hash:6][ext]",
    // 这个值不止对最后打包出来的dist文件夹中的index.html文件起作用，而且对webpack-dev-server在npm run serve时在内存中生成的index.html也是起作用的
    // 这个值会在打包过程中被加到index.html中所有的link的href或者script的src属性的最前面，如：<script defer src="/aaa/bundle.js"></script>
    // 这个东西只做路径的字符串拼接，没有其他影响，比如打包出来的东西要放到哪个文件夹下这种影响
    publicPath: '/aaa'
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
    // 这个publicPath和output配置项中的publicPath是不同的，不同点在于这个路径是用来指定webpack-dev-server在内存中生成的所有的打包文件放在那个目录下
    publicPath: '/aaa'
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
            loader: 'babel-loader',
          },
          {
            // 在打包ts文件之前都会验证是否符合.eslintrc.js文件的规定，注意：要想让eslint能验证ts文件需要在配置eslint
            loader: 'eslint-loader'
          }
        ]
      },
      {
        test: /\.vue$/,
        use: [
          {
            // 这个loader内部会使用vue-template-complier这个库，这是vue官方开发的一个库，用来编译template语法
            // 这个loader也要配合一个插件在vue-loader中的插件一起使用，在下面的plugin中添加这个插件
            loader: "vue-loader",
            // vue-loader所作的工作是把.vue文件里面的<template> 编译成render函数放入js文件; 把<style>放入到一个单独的css(或less或sass)文件中，然后走webpack的loader逻辑进行打包(进行postcss处理等); 把<script> 里面的内容，放入到js文件中走webpack的loader逻辑进行打包(进行babel-loader的处理等)
          }
        ]
      }
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPulgin(
      // option对象，给HtmlWebpackPulgin这个插件中默认的ejs模板使用
      {
        title: "sawyer app",
        // 指定自己设置的ejs模板，表示不使用HtmlWebpackPulgin这个插件中默认的ejs模板，这时所有写在new HtmlWebpackPulgin({})中的option对象会对自己设置的ejs模板生效
        // 路径是相对于package.json所在的文件夹
        template: "./public/index.html",
      }
    ),
    // 为webpack提供全局数据
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
          from: "./public/", // 这是不是正则表达式？？？？？
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
  ],
};
