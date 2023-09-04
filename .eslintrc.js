// 这个文件由npx eslint --init根据选项生成
module.exports = {
    "env": {
        "browser": true,   
        // 支持commonjs
        "common": true,
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
        "sourceType": "module"
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
