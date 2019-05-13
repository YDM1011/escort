var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';
var _ = require("underscore");

var config = {
  development: require("./env/development"),
  test: require("./env/test"),
  production: require("./env/production"),
  raw: require("./env/raw"),
};

var envConfig = config[env] ? config[env] : config.development;

module.exports = _.extend({
  instanceCreatedAt: "escort",
  NODE_ENV: env,
  IS_PRODUCTION: env === "production",
  RC_VERSION: process.env.RC_VERSION || "1.0.0"
}, envConfig);
console.log(env);
