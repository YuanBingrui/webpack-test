const paths = require('./paths');

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const host = process.env.HOST || '0.0.0.0';

module.exports = function() {
  return {
    // 定义host
    host,
    https: protocol === 'https',
    // 本地服务启动时自动打开浏览器
    open: true,
    // 当打开浏览器时指定打开的页面
    // openPage: '/index',
    // 开启热模块替换
    hot: true,
    // Enable gzip compression of generated files.
    compress: true,
    // 用来配置暴露本地文件的规则
    contentBase: paths.appBuild,
    // By default files from `contentBase` will not trigger a page reload.
    watchContentBase: true,
    // For example, the dev-server is proxied by nginx, and available on myapp.test:
    // public: 'myapp.test'
    // The bundled files will be available in the browser under this path
    publicPath: '/',
    // 是否使用本地ip
    useLocalIp: true,
    // 设置数据传输模式
    transportMode: 'ws',
    // devServer.clientLogLevel may be too verbose, you can turn logging off by setting it to 'silent'.
    clientLogLevel: 'silent',
    injectClient: true,
    // 与编译输出的日志有关
    quiet: true,
    // 监听模式运行时的参数
    watchOptions: {
      // 不监听的文件和文件夹
      ignored: /node_modules/
    },
    // Shows a full-screen overlay in the browser when there are compiler errors or warnings
    overlay: false,
    // 使用了H5 History API的SPA应用,配置任何路由都返回index.html文件, 当应用有多个页面时,使用 rewrites 属性
    historyApiFallback: {
      // Paths with dots should still use the history fallback.
      disableDotRule: true,
    },
    // writeToDisk: true
  }
}