const fs = require('fs');
const paths = require('./paths');

function getEntriesPages() {
  const files = fs.readdirSync(paths.appPagePaths);
  let entriesObj = {};
  files.forEach(file => {
    entriesObj[file] = paths.resolveApp(`${paths.appPagePaths}/${file}/index.js`)
  });
  return entriesObj;
}

module.exports = {
  getEntriesPages
}
