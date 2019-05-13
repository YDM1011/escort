var glob = require('glob');
var path = require('path');

module.exports = function (backendApp, config) {
  var middlewares = {};
  var middlewaFunctions = glob.sync(backendApp.config.root + '/middlewares/*.js');
    console.log("OK!!!!!", middlewaFunctions, backendApp.config.root);
  middlewaFunctions.forEach(function (middlewarePath) {
    var middlewareFileInfo = path.parse(middlewarePath);
    if (middlewareFileInfo.name !== "index") {
      middlewares[middlewareFileInfo.name] = require(middlewarePath);
    }

  });
  return middlewares;
};
