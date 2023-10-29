// 这个文件将对ts react vue 都做支持 使用main.js作为入口，而不是对src/webpack.config.js的照搬
const path = require("./path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { DefinePlugin } = require("webpack");
const { VueLoaderPlugin } = require("vue-loader");
const { merge } = require("webpack-merge");
const productionConfig = require("./webpack.production.config");
const developmentConfig = require("./webpack.development.config");

const commonConfig = {
  // entry: {index: "./src/index.js"},
  // context: path(),  // path.resolve(__dirname, '../')是package.json所在的绝对路径
  entry: {
    main: "./src/main.js", // 在没有抽离配置的时候可以使用字符串作为属性值
    main2: "./src/main2.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path("./config/dist"),
  },
  resolve: {
    extensions: [".wasm", ".mjs", ".js", ".json", "ts", "jsx", "tsx"],
    alias: {
      "@": path("./src"),
      assets: path("./src/assets"),
    },
  },
  module: {
    rules: [
      {
        // 不论是开发环境还是生产环境都要编译css
        test: /\.css$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: "postcss-loader",
          },
        ],
      },
      {
        // 不论是开发环境还是生产环境都要对js(x)，ts(x)文件做babel适配，比如react的适配，ts的适配以及poly-fill的适配
        // test: /\.[jt]sx?$/,
        test: /\.js$/,
        // 在这里排除node_modules是非常重要的，如果不排除会导致大量的报错，应该是babel对node_modules中的文件做了操作引起的
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
          },
          // {
          // 关闭eslint校验
          // loader: "eslint-loader",
          // },
        ],
      },
      {
        // 支持vue
        test: /\.vue/,
        use: [
          {
            loader: "vue-loader",
          },
        ],
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      minSize: 800, // 单位是Byte
      // 不写这个cacheGroup时候的输出为415.bundle.js和704.bundle.js
      // 写这个cacheGroup时候的输出为415.nodemodules.js和704.nodemodules.js
      // 所以也就是说，webpack默认就会对node_modules中的内容进行分包，我们自己写这个分包逻辑的时候能够更好的分包之后输出的文件名称
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          // test: /[\\/]node_modules[\\/]/,
          filename: "[id].nodemodules.js",
          priority: -10,
          reuseExistingChunk: true,
        }, 
        index: {
          test: /index/,
          filename: "[id].index.js",
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
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "sawyer app",
      template: "./public/index.html",
    }),
    new DefinePlugin({
      BASE_URL: "'./'",
    }),
    // 由于vue的插件不仅支持hmr，所以要在common中配置
    new VueLoaderPlugin(),
  ],
};

module.exports = (webpackEnv) => {
  // { WEBPACK_BUNDLE: true, WEBPACK_BUILD: true, production: true }
  // 在package.json中指定--env production后 这个webpackEnv的值里面就会有production: true
  console.log(webpackEnv);
  // 由于我们可以在webpackEnv这个变量的属性里面判断当前是生产环境还是开发环境，所以我们可以在这个common webpack里面配置开发和生产都需要的配置
  // 在development webpack中配置development需要的配置，在production webpack中配置production需要的配置，然后使用webpack的库webpack-merge将development或production的配置和common的配置merge在一起

  // 这里直接在process进程对象上添加标识符，目的是让babel.config.js或者eslint.config.js等这些loader配置文件也可以获取当前打包时是生产环境还是开发环境
  // 然后这些loader配置文件可以根据不同的环境做不同的配置
  // 这个标识符必须在loader被调用之前就加到进程上，所以在return之前添加到进程上是最好的选择，也可以在webpack.development.config.js或者webpack.production.config.js中module.exports一个函数，在函数返回之前添加标识符，看自己想怎么设计了
  process.mode = "none";
  if (webpackEnv.production) {
    process.mode = "production";
  } else if (webpackEnv.development) {
    process.mode = "development";
  }

  // 在项目中获取环境的方式
  // 1. 在webpack.config.js中需要使用webpackEnv来获取环境是development还是production，从而确定要使用的mode是development还是production
  // 2. 在webpack打包文件(如js，ts文件等)(在index.html这个ejs模板中也是使用这个逻辑去获取环境信息)的中使用process.env.NODE_ENV确定当前环境，process.env.NODE_ENV的值是webpack通过配置文件中mode属性的值添加的,
  //    注意：在webpack打包文件中的不要使用手动在进程对象process上添加的mode属性，因为webpack可能是多进程编译的，不确定webpack有没有把主进程的mode属性传递给子进程
  // 3. 在loader的配置文件中需要使用在webpack的配置文件手动添加的process.mode属性来判断是开发环境还是生产环境

  // 根据不同的环境将通用的webpack配置commonConfig和相应的环境webpack配置合并
  if (webpackEnv.production) {
    // 这个merge函数是webpack团队的一个独立于webpack的包提供的能力
    return merge(commonConfig, productionConfig);
  } else if (webpackEnv.development) {
    return merge(commonConfig, developmentConfig);
  }
  return merge(commonConfig, developmentConfig);
};
