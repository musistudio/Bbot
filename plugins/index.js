const fs = require('fs');
const path = require('path');
const filePath = __dirname;

let plugins = [];
try {
  let files = fs.readdirSync(filePath);
  files.forEach((file) => {
    if (file.endsWith('Plugin.js')) {
      let name = file.split('.js')[0];
      let plugin = require(path.join(filePath, name));
      plugins.push(new plugin[name]());
    }
  })
} catch (e) {
  console.log(e);
}

function findPlugin(Plugins, service) {
  let plugins = Plugins.filter((plg) => plg.service == service);
  return plugins.length ? plugins[0] : null;
}

exports.Plugins = plugins;
exports.findPlugin = findPlugin;
