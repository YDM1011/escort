
/***********************************/

const express = require('express');
const config = require('./app/config/config');
const glob = require('glob');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect(config.db);
const db = mongoose.connection;
db.on('error', function () {
    throw new Error('unable to connect to database at ' + config.db);
});

let models = glob.sync('./app/model/*.js');
console.log(models);
models.forEach(function (model) {
    if (model.indexOf('model_methods') > -1)
        return;
    require(model);
});
/*********************/
let app = express();

module.exports = require('./app/config/express')(app, config);

/********************************/
// view engine setup

// module.exports = app;
