// 这个文件由npx eslint --init根据选项生成
// 使用7版本的eslint，8版本的eslint和eslintloader有不兼容
module.exports = {
    "env": {
        "browser": true,   
        // 支持commonjs
        "commonjs": true,
        "es2021": true
    },
    // 继承其他代码规范的配置信息
    "extends": ["standard-with-typescript",],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        // 支持esmodule
        "sourceType": "module",
        // 为eslint指定ts语法解析的config文件地址
        "project": ["./1/tsconfig.json"]
    },
    "plugins": [],
    "rules": {
        // 表示no-unused-vars的错误可以通过eslint校验
        // "no-unused-vars": "off",
        // 表示no-unused-vars的错误会报warning，不能git commit需要和husky配合，husky：负责插入git之前的回调
        // "no-unused-vars": "warn",
        // 表示no-unused-vars的错误会报error
        "no-unused-vars": "error",
    }
}
