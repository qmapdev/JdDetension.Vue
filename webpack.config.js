var webpack = require('webpack');
var path = require('path');
const {
    VueLoaderPlugin
} = require('vue-loader');
const htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: { // 多文件入口
        index: "./src/main.js",
    },
    output: { // 出口
        filename: "[name].bundle.js",
        path: path.join(__dirname, "dist")
    },
    module: {
        rules: [{
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.css$/,
                loader: ['style-loader', 'css-loader']
            },
            // { 
            //     test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/, 
            //     loader: 'url-loader?name=images/[hash:8].[name].[ext]'
            // },
            {
                test: /\.(gif|jpg|png)$/,
                loader: 'file-loader?name=images/[hash:8].[name].[ext]'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new htmlWebpackPlugin({
            template: './public/index.html' //使用根目录模板
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],
    externals: {
        'qmap3d': {
            commonjs: './src/plugins/q3d-src.js',
            commonjs2: './src/plugins/q3d-src.js',
            amd: './src/plugins/q3d-src.js',
            root: 'qmap3d'
        },
        // 'qmap3d_custom': {
        //     commonjs: './src/plugins/QMap3dV2.3-custom.js',
        //     commonjs2: './src/plugins/QMap3dV2.3-custom.js',
        //     amd: './src/plugins/QMap3dV2.3-custom.js',
        //     root: 'qmap3d_custom'
        // }
    },
    devServer: {
        contentBase: './dist',
        host: 'localhost',
        port: 8000,
        open: false,
        hot: true,
        proxy: { //跨域代理
            '/api': {
                target: 'http://localhost:80',
                pathRewrite: {
                    "^/api": ""
                },
                changeOrigin: false,
                secure: false,
                bypass: function (req, res, proxyOptions) {
                    if (req.headers.accept.indexOf("html") !== -1) {
                        console.log("Skipping proxy for browser request.");
                        return "/index.html";
                    }
                }
            },
            '/jdinterface': {
                target: 'http://www.51kongkong.com:9099/api/QmapInterface/',
                pathRewrite: {
                    "^/jdinterface": ""
                },
                changeOrigin: true,
                secure: false,
                bypass: function (req, res, proxyOptions) {
                    if (req.headers.accept.indexOf("html") !== -1) {
                        console.log("Skipping proxy for browser request.");
                        return "/index.html";
                    }
                }
            },
        }
    }
}