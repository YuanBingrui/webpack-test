process.on('unhandledRejection', err => {
  throw err;
});

const chalk = require('chalk');
const webpack = require('webpack');
const configDll = require('../config/webpack.dll.config');


console.log(chalk.yellow('dll file generated...'));

webpack(configDll, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.log(chalk.red(err.message || stats.hasErrors().message));
    return;
  }
  console.log(chalk.green('dll file generated successfully!!!'));
});
