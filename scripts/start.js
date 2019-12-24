'use strict';

process.env.NODE_ENV = 'development';

process.on('unhandledRejection', err => {
  throw err;
});

require('../config/env');

const chalk = require('chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const configFactory = require('../config/webpack.config');
const createDevServerConfig = require('../config/webpackDevServer.config');

const { createCompiler, clearConsole } = require('./utils');

const isInteractive = process.stdout.isTTY;

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  );
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
  );
  console.log();
}

const config = configFactory('development');

const compiler = createCompiler({ config, webpack });

const serverConfig = createDevServerConfig();

const devServer = new WebpackDevServer(compiler, serverConfig);

 // Launch WebpackDevServer.
devServer.listen(DEFAULT_PORT, HOST, err => {
  if (err) {
    return console.log(err);
  }
  if (isInteractive) {
    clearConsole();
  }

  console.log(chalk.cyan('Starting the development server...\n'));
});

['SIGINT', 'SIGTERM'].forEach(function(sig) {
  process.on(sig, function() {
    devServer.close();
    process.exit();
  });
});
