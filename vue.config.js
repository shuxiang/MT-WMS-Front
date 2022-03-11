const webpack = require('webpack')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

function formatDate(time, format='YY-MM-DD_hh:mm:ss'){
    var date = new Date(time);
    var year = date.getFullYear(),
        month = date.getMonth()+1,//月份是从0开始的
        day = date.getDate(),
        hour = date.getHours(),
        min = date.getMinutes(),
        sec = date.getSeconds();
    var preArr = Array.apply(null,Array(10)).map(function(elem, index) {
        return '0'+index;
    });
    var newTime = format.replace(/YY/g,year)
                        .replace(/MM/g,preArr[month]||month)
                        .replace(/DD/g,preArr[day]||day)
                        .replace(/hh/g,preArr[hour]||hour)
                        .replace(/mm/g,preArr[min]||min)
                        .replace(/ss/g,preArr[sec]||sec);
    return newTime;         
}
const datestr = formatDate(new Date().getTime());//2017-05-12 10:05:44

module.exports = {
    /** 区分打包环境与开发环境
     * process.env.NODE_ENV==='production'  (打包环境)
     * process.env.NODE_ENV==='development' (开发环境)
     * publicPath: process.env.NODE_ENV==='production'?"https://cdn.aliyun.com/front/":'front/',
     */
    // 基本路径
    publicPath: '/',//从 Vue CLI 3.3 起baseUrl已弃用，请使用publicPath
    // 输出文件目录
    // outputDir: 'dist',
    // eslint-loader 是否在保存的时候检查
    // lintOnSave: true,
    // use the full build with in-browser compiler?
    // https://vuejs.org/v2/guide/installation.html#Runtime-Compiler-vs-Runtime-only
    //compiler: false,
    // webpack配置
    // see https://github.com/vuejs/vue-cli/blob/dev/docs/webpack.md
    // chainWebpack: () => { },
    chainWebpack: (config) => {
          // 在chainWebpack中添加下面的代码
          config.entry('main').add('babel-polyfill') // main是入口js文件
          config.plugin('ignore').use(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));//忽略/moment/locale下的所有文件
    },
    // configureWebpack: () => { },
    //如果想要引入babel-polyfill可以这样写
    configureWebpack: (config) => {
      // config.entry = ["babel-polyfill", "./src/main.js"]
      if (process.env.NODE_ENV === 'production') {
            config.externals = {
                // 'vue': 'Vue',
                // 'vuex': 'Vuex',
                // 'vue-router': 'VueRouter',
                // 'echarts': 'echarts',
                'jquery': 'jquery',
                // 'axios': 'axios',
                // 'moment': 'moment',
            }
            // // 清除其他语言
            // config.plugins = [
            //     new MomentLocalesPlugin({
            //         localesToKeep: ['zh-cn',]
            //     })
            // ]
            // 输出重构  打包编译后的 文件名称  【模块名称.版本号.时间戳】
            config.output.filename = `js/[name].${datestr}.js`
            config.output.chunkFilename = `js/[name].${datestr}.js`

            // // 清楚注释
            // config.optimization = {
            //     minimize: true,
            //     minimizer: [new TerserPlugin({
            //         parallel: true,
            //         terserOptions: {
            //             output: {
            //                 comments: false,
            //             },
            //             format: {
            //                 comments: false,
            //             },
            //             extractComments: false,
            //         },
            //     })]
            // }
        }
    },
    // vue-loader 配置项
    // https://vue-loader.vuejs.org/en/options.html
    //vueLoader: {},
    // 生产环境是否生成 sourceMap 文件
    // sourceMap就是一个文件，里面储存着位置信息。有了它，出错的时候，通过断点工具可以直接显示原始代码，而不是转换后的代码。
    productionSourceMap: false,
    // css相关配置
    //css: {
    // 是否使用css分离插件 ExtractTextPlugin
    //   extract: true,
    // 开启 CSS source maps?
    //   sourceMap: false,
    // css预设器配置项
    //   loaderOptions: {},
    // 启用 CSS modules for all css / pre-processor files.
    // modules: false
    // },
    css: {
        loaderOptions: {
            less: {
                lessOptions:{
                    modifyVars: {
                        'font-family': 'PingFang SC, Microsoft YaHei',
                        'font-size-base': '15px',
                        'text-color': 'fade(@black, 90%)',
                        'text-color-secondary': 'fade(@black, 75%)',
                        'text-color-dark': 'fade(@white, 90%)',
                        'text-color-secondary-dark': 'fade(@white, 75%)',
                        'btn-danger-bg': '#0eb83a',
                        'btn-padding-base': '0 9px',
                    },
                    javascriptEnabled: true,
                },
            },
        },
        // extract: false, // 避免 Error: No module factory available for dependency type: CssDependency
        // requireModuleExtension: true,
        // modules:false,
    },
    // use thread-loader for babel & TS in production build
    // enabled by default if the machine has more than 1 cores
    //parallel: require('os').cpus().length > 1,
    // 是否启用dll
    // See https://github.com/vuejs/vue-cli/blob/dev/docs/cli-service.md#dll-mode
    // dll: false,
    // PWA 插件相关配置
    // see https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-pwa
    //   pwa: {},
    // webpack-dev-server 相关配置
    devServer: {
        open: process.platform === 'vue',
        host: '127.0.0.1',
        port: 9090,
        https: false,
        hotOnly: false,
        proxy: { // 设置代理
            '/': {
                target: 'http://127.0.0.1:5002/',
                changeOrigin: true,
                pathRewrite: {
                    '^/': '/'
                }
            }
        },
        disableHostCheck: true
    },
    // 第三方插件配置
    // pluginOptions: {
    //     // ...
    // }
}