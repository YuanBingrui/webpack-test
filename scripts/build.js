'use strict';

process.env.NODE_ENV = 'production';

process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const chalk = require('chalk');
const webpack = require('webpack');
const configFactory = require('../config/webpack.config');
const paths = require('../config/paths');

const config = configFactory('production');

console.log('Creating an optimized production build...');

const compiler = webpack(config);
compiler.run((err, stats) => {
  if (err) {
    if (!err.message) {
      console.log(chalk.red(err.message));
    }
  }
  console.log(chalk.green('Compiled successfully.\n'));
});
