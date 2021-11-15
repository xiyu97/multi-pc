const path = require('path');
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");//提取css到单独文件的插件
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');//压缩css插件
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')   // 处理ie8关键字



module.exports = {
    mode: 'development', // production | development
    //配置多入口
    entry: {
        common: './common.css.js',
        index: ['./pages/index/index.js', './pages/index/index.scss'],
        product: ['./pages/product/product.js', './pages/product/product.scss'],
        about: ['./pages/about/about.js', './pages/about/about.scss'],
    },
    //出口路径配置
    output: {
        filename: 'js/[name].[hash].js', //这个主要作用是将打包后的js已hash值的编码方式来生成出来
        path: path.resolve(__dirname, 'dist'),
        publicPath: './',
        // publicPath: process.env.NODE_ENV === 'development' ? '/' : './',
    },
    devServer: {
        // 将html和scss文件加入webpack依赖，使得改变html和scss也能热更新
        before(app, server, compiler) {
            const watchFiles = ['.html','.scss'];

            compiler.hooks.done.tap('done', () => {
                const changedFiles = Object.keys(compiler.watchFileSystem.watcher.mtimes);

                if (
                    this.hot &&
                    changedFiles.some(filePath => watchFiles.includes(path.parse(filePath).ext))
                ) {
                    server.sockWrite(server.sockets, 'content-changed');
                }
            });
        },
        contentBase: path.resolve(__dirname, './dist'),
        hot: true,
        publicPath: '/'
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                exclude: /node_modules/,
                uglifyOptions: {
                    ie8: true
                }
            })
        ]
    },
    // target: false,
    // devtool: process.env.NODE_ENV === 'development' ? 'source-map':'inline-source-map',
    module: {
        rules: [
            {
                // 它会应用到 .css  .scss  .sass 后缀的文件,
                // use数组loader的名字是有顺序的（从后往前链式调用），
                // 即处理顺序为sass-loader -> postcss-loader -> css-loader -> MiniCssExtractPlugin.loader
                test: /\.(sc|c|sa)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            // filename: '[name].css',
                            // chunkFilename: '[name].css',
                            publicPath: '../'   //****最后打包的时候替换引入文件路径
                        },
                    },
                    'css-loader', 'postcss-loader',
                    // 'sass-loader'
                    {
                        loader: 'sass-loader',
                        options: {
                            additionalData: '@import "./src/style/base.scss";'  // 添加全局变量
                        },
                    },
                ]
            },
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    // options: {
                    //     presets: ['@babel/preset-env'],
                    //     plugins: ['@babel/plugin-transform-runtime']
                    // }
                },
                exclude: '/node_modules/'
            },
            // {
            //     test: /\.html$/,
            //     use: [
            //         {
            //             loader: 'html-loader',
            //             options: {
            //                 // list: [
            //                 //     {
            //                 //         tag: 'link',
            //                 //         attribute: 'href',
            //                 //         type: 'src',
            //                 //     },
            //                 // ]
            //             }
            //         }
            //     ]
            // },
            {
                test: /\.(png|svg|jpg|gif|ico)$/,
                exclude: '/node_modules/',
                use: {
                    loader: 'url-loader',
                    options: {
                        esModule: false,
                        name: '[name].[ext]',   //设置抽离打包图片的名称--[ext]用来获取图片的后缀
                        limit: false,  //指定文件的最大体积（以字节为单位）。 如果文件体积等于或大于限制，默认情况下将使用 file-loader 并将所有参数传递给它
                        outputPath: 'images' //设置输出文件夹名称，这个文件夹会与主入口文件在同一路径下
                    }
                },
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts'
                    }
                },
            },
            {
                test: /\.(csv|tsv)$/,
                use: [
                    'csv-loader',
                ],
            },
            {
                test: /\.xml$/,
                use: [
                    'xml-loader',
                ],
            },
        ]
    },
    plugins: [
        //在每一次编译前清空dist文件夹
        new CleanWebpackPlugin(),
        // new webpack.ProvidePlugin({
        //     $: 'jquery'
        // }),

        // 把src下public文件夹下的所有内容直接拷贝到dist(输出目录)下
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: __dirname + '/src/images/',
                    to: 'images'
                },
                {
                    from: __dirname + '/src/icons/',
                    to: 'icons'
                },
                {
                    from: __dirname + '/src/utils/',
                    to: 'utils'
                }
            ]
        }),

        //HtmlWebpackPlugin配置
        new HtmlWebpackPlugin({
            title: '首页',
            template: './pages/index/index.html',
            filename: 'index.html',
            chunks: ['common', 'index'],
            minify: {
                collapseWhitespace: true,//删除空格、换行
            }
        }),
        new HtmlWebpackPlugin({
            title: '您的浏览器不支持此页面',
            template: './pages/product/product.html',
            filename: 'product.html',
            chunks: ['common', 'product'],
            minify: {
                collapseWhitespace: true,//删除空格、换行
            }
        }),
        new HtmlWebpackPlugin({
            title: '关于我们',
            template: './pages/about/about.html',
            filename: 'about.html',
            chunks: ['common', 'about'],
            minify: {
                collapseWhitespace: true,//删除空格、换行
            }
        }),
        new MiniCssExtractPlugin({
            filename: "css/[name]_[hash].css"//输出目录与文件
        }),
        new OptimizeCssAssetsPlugin(),
    ]
}