const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  // devtools: false,
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./public/", // 这是不是正则表达式？？？？？, 应该不是，这个可能是和gitignore一种语言
          globOptions: {
            ignore: [
              "**/index.html",
              "**/.DS_Store",
            ],
          },
        },
      ],
    }),
  ],
};
