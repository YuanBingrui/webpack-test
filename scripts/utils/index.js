'use strict';

const chalk = require('chalk');

function clearConsole() {
  process.stdout.write(
    process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H'
  );
}

const isInteractive = process.stdout.isTTY;

function createCompiler({ config, webpack }) {
  let compiler;
  try {
    compiler = webpack(config);
  } catch (err) {
    console.log(chalk.red('Failed to compile.'));
    console.log();
    console.log(err.message || err);
    console.log();
    process.exit(1);
  }

  // "invalid" event fires when you have changed a file, and Webpack is
  // recompiling a bundle. WebpackDevServer takes care to pause serving the
  // bundle, so if you refresh, it'll wait instead of serving the old one.
  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
  compiler.hooks.invalid.tap('invalid', () => {
    if (isInteractive) {
      clearConsole();
    }
    console.log('Compiling...');
  });

  compiler.hooks.done.tap('done', async stats => {
    if (isInteractive) {
      clearConsole();
    }
    console.log(chalk.green('Compiled successfully!'));
  });

  return compiler;
}

module.exports = {
  clearConsole,
  createCompiler
};
