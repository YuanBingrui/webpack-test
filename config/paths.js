'use strict';

const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const BUILD_DIR_NAME = 'dist';

module.exports = {
  resolveApp,
  dotenv: resolveApp('.env'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.ejs'),
  appIndexJs: resolveApp('src/index.js'),
  appBuild: resolveApp(BUILD_DIR_NAME),
  appDll: resolveApp(`dll`),
  appPackageJson: resolveApp('package.json')
}
