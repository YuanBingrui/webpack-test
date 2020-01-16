const paths = require('./paths');
const webpack = require('webpack');
// 将生成的chunk注入到html文件中
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 将js文件的内容插入到html中
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
// 将生成的dll文件注入html文件中
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
// 关联生成dll文件
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');
// 把css从js中提取到单独的文件中
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// 压缩js
const TerserPlugin = require('terser-webpack-plugin');
// 压缩css
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// PostCSS的容错CSS解析器，它将查找并修复语法错误，能够解析任何输入
const safePostCssParser = require('postcss-safe-parser');
// 删除上一步生成的编译文件
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// 多个子进程并行处理
const HappyPack = require('happypack');

// 是否生成SourceMap
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';

// url-loader中的limit,大于直接调用file-loader, 小于等于转成base64,减少http请求
const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
);

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const lessRegex = /\.(less)$/;
const lessModuleRegex = /\.module\.(less)$/;

module.exports = function(webpackEnv) {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';

  // common function to get style loaders
  const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      isEnvDevelopment && require.resolve('style-loader'),
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader
      },
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: require.resolve('postcss-loader'),
        options: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          ident: 'postcss',
          plugins: () => [
            require('postcss-flexbugs-fixes'),  // 修复css flex 相关的bug
            require('postcss-preset-env')({  // 转化css,兼容低版本浏览器
              autoprefixer: {  // 添加浏览器相关的前缀
                flexbox: 'no-2009',
              },
              stage: 3, // "This idea is becoming part of the web.” https://cssdb.org/#staging-process
            }),
            // Adds PostCSS Normalize as the reset css with default options,
            // so that it honors browserslist config in package.json
            // which in turn let's users customize the target behavior as per their needs.
            require('postcss-normalize')(),  // 添加normalize.css
          ],
          sourceMap: isEnvProduction && shouldUseSourceMap,
        },
      },
    ].filter(Boolean);
    if (preProcessor) {
      loaders.push(
        {
          loader: require.resolve('resolve-url-loader'), //重写preProcessor中的url路径
          options: {
            sourceMap: isEnvProduction && shouldUseSourceMap,
          },
        },
        {
          loader: require.resolve(preProcessor), // css预编译器
          options: {
            sourceMap: true,
          },
        }
      );
    }
    return loaders;
  };

  return {
    mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
    devtool: isEnvProduction
      ? shouldUseSourceMap
        ? 'source-map'
        : false
      : isEnvDevelopment && 'cheap-module-source-map',
    entry: paths.appIndexJs,
    output: {
      filename: isEnvProduction
        ? 'js/[name].[contenthash:8].js'
        : isEnvDevelopment && 'js/[name].js',
      chunkFilename: isEnvProduction
        ? 'js/[name].[contenthash:8].chunk.js'
        : isEnvDevelopment && 'js/[name].chunk.js',
      path: isEnvProduction ? paths.appBuild : undefined,
    },
    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        // https://github.com/terser/terser
        new TerserPlugin({
          parallel: true, // 并行处理
          terserOptions: {
            parse: {
              // We want terser to parse ecma 8 code. However, we don't want it
              // to apply any minification steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8,
            },
            compress: {
              ecma: 5,
              warnings: false,
              // Disabled because of an issue with Uglify breaking seemingly valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,
              // Disabled because of an issue with Terser breaking valid code:
              // https://github.com/facebook/create-react-app/issues/5250
              // Pending further investigation:
              // https://github.com/terser-js/terser/issues/120
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              // Turned on because emoji and regex is not minified properly using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true,
            },
          }
        }),
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            parser: safePostCssParser
          },
          cssProcessorPluginOptions: {
            preset: ['default', { minifyFontValues: { removeQuotes: false } }]
          }
        })
      ],
      // 自动分割vendor和commons
      ...(isEnvProduction ?
        {
          splitChunks: {
            chunks: 'all', // 这意味着即使在异步和非异步块之间也可以共享块
            name: false, // 分割块的name, 官方建议production设置为false
          }
        } : {}
      ),
      // 实现长期缓存, 将webpack模块解析和加载,与模块信息分开打包
      runtimeChunk: {
        name: entrypoint => `runtime~${entrypoint.name}`,
      },
    },
    resolve: {
      extensions: ['jsx', 'js', 'json'],
      alias: {
        '@': paths.appSrc
      },
    },
    module: {
      // makes missing exports an error instead of warning
      strictExportPresence: true,
      rules: [
        {
          // "oneOf" will traverse all following loaders until one will
          // match the requirements. When no loader matches it will fall
          // back to the "file" loader at the end of the loader list.
          oneOf: [
            // "url" loader works like "file" loader except that it embeds assets
            // smaller than specified limit in bytes as data URLs to avoid requests.
            // A missing `test` is equivalent to a match.
            {
              test: [/\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: imageInlineSizeLimit,
                name: 'assets/imgs/[name].[hash:8].[ext]',
              },
            },
            {
              test: /\.js/,
              use: require.resolve('babel-loader'),
              // use: 'happypack/loader?id=babel' // 把对 .js 文件的处理转交给 id 为 js 的 HappyPack 实例
            },
            // "postcss" loader applies autoprefixer to our CSS.
            // "css" loader resolves paths in CSS and adds assets as dependencies.
            // "style" loader turns CSS into JS modules that inject <style> tags.
            // In production, we use MiniCSSExtractPlugin to extract that CSS
            // to a file, but in development "style" loader enables hot editing
            // of CSS.
            // By default we support CSS Modules with the extension .module.css
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction && shouldUseSourceMap,
              }),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            {
              test: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction && shouldUseSourceMap,
                modules: {
                  localIdentName: isEnvDevelopment ? '[name]__[local]--[hash:base64:5]' : '[hash:base64]',
                },
              }),
            },
            // Opt-in support for LESS (using .scss or .less extensions).
            // By default we support LESS Modules with the
            // extensions .module.less or .module.less
            {
              test: lessRegex,
              exclude: lessModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: isEnvProduction && shouldUseSourceMap,
                },
                'less-loader'
              ),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            // Adds support for CSS Modules, but using LESS
            // using the extension .module.less or .module.less
            {
              test: lessModuleRegex,
              use: getStyleLoaders(
                {
                  importLoaders: 2,
                  sourceMap: isEnvProduction && shouldUseSourceMap,
                  modules: {
                    localIdentName: isEnvDevelopment ? '[name]__[local]--[hash:base64:5]' : '[hash:base64]',
                  },
                },
                'less-loader'
              ),
            },
            // "file" loader makes sure those assets get served by WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
              loader: require.resolve('file-loader'),
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.(js|jsx|ejs)$/, /\.html$/, /\.json$/],
              options: {
                name: 'assets/[name].[hash:8].[ext]'
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      // 告诉 Webpack 使用了哪些动态链接库
      new DllReferencePlugin({
        // 描述 react 动态链接库的文件内容
        manifest: paths.resolveApp(`${paths.appDll}/react.manifest.json`)
      }),
      // 将生成的chunk注入到index.html中
      new HtmlWebpackPlugin({
        // 传到index.ejs的参数
        templateParameters: {
          title: 'webpack-test'
        },
        template: paths.appHtml,
        favicon: paths.resolveApp(`${paths.appPublic}/favicon.ico`),
        ...(isEnvProduction ?
          {
            minify: {
              removeComments: true, // 删除注释
              collapseWhitespace: true, // 折叠DOM树text节点的空白
              removeRedundantAttributes: true, // 当值匹配默认值时删除属性
              useShortDoctype: true, // 用(HTML5）文档类型替换文档类型
              removeEmptyAttributes: true, // 删除属性值为空的属性
              removeStyleLinkTypeAttributes: true, // 删除style和link的 type="text/css". 其它不变
              keepClosingSlash: true, // 保持尾斜杠
              minifyJS: true, // 压缩script元素的js
              minifyCSS: true, // 压缩style元素的css
              minifyURLs: true, // 压缩url
            }
          } : {}
        ),
        ...(isEnvProduction ? { inlineSource: 'runtime~.+\\.js' } : {}),
      }),
      // 将inlineSource参数匹配到的js文件的内容插入到html中
      isEnvProduction && new HtmlWebpackInlineSourcePlugin(),
      // 将生成的dll文件注入index.html中
      new AddAssetHtmlPlugin({
        filepath: paths.resolveApp(`${paths.appDll}/*.dll.js`)
      }),
      // // 用唯一的标识符 id 来代表当前的 HappyPack 是用来处理一类特定的文件
      // new HappyPack({
      //   id: 'babel',
      //   threads: 2,
      //   loaders: ['babel-loader']
      // }),
      // // 目前好像只支持extract-text-webpack-plugin插件
      // new HappyPack({
      //   id: 'styles',
      //   threads: 2,
      //   loaders: [
      //     'style-loader',
      //     'css-loader',
      //   ]
      // }),
      // 将css文件提取到单独的文件中
      isEnvProduction && new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: 'css/[name].[contenthash:8].css',
        chunkFilename: 'css/[name].[contenthash:8].chunk.css',
      })
    ].filter(Boolean)
  }
}
