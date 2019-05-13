/* jshint node: true */
'use strict';

var mongoose = require("mongoose");
var async = require("async");

module.exports = function (options) {

  this.handler = function (err, req, res, next) {
    var self = this;

    if (!err) return next(err);

    var validationErrors = self.parseValidationError(err) || self.parseUniqueError(err);
    var acceptLanguage = req.acceptLanguage;
    if (validationErrors) {
      self.translateMessages(validationErrors, acceptLanguage, function (err, translatedErr) {
        return res.status(400).send({
          name: 'ValidationError',
          errors: translatedErr
        });
      });
    } else
      return next(err);
  };

  this.translateMessages = function (originErr, language, cb) {
    var keys = Object.keys(originErr);
    rootMongoConnection.model("RootTranslate").find({}).exec(function (err, translates) {
      if (err) return cb(err);
      var translatesTable = {};
      async.forEach(translates, function (translate, callback) {
        translatesTable[translate.name] = translate.translates.toObject();
        callback();
      }, function () {
        // console.log(language, translatesTable)
        async.forEach(keys, function (key, callback) {
          if (translatesTable[originErr[key].message] && translatesTable[originErr[key].message][language]) {
            originErr[key].message = translatesTable[originErr[key].message][language];
          } else if (translatesTable[originErr[key].message] && translatesTable[originErr[key].message]['en']) {
            originErr[key].message = translatesTable[originErr[key].message]['en'];
          }
          callback();
        }, function () {
          cb(null, originErr);
        });
      });
    });
  };

  this.parseValidationError = function (err) {
    if (!err) return null;
    if (err.name !== 'ValidationError') return null;

    var result = {};

    for (var key in err.errors) {
      var error = err.errors[key];
      var type = error.kind;
      var condition;
      var message = error.message || "";

      if (!message) {
        // cast error
        if (error.name === 'CastError') {
          type = 'cast';
          message += type;
        }

        // match or enum error
        else if (type === 'regexp' || type === 'enum') {
          var model = /(.*)\svalidation\sfailed/.exec(err.message)[1].toLowerCase();
          message += model + '.' + key + '.' + type;
        }

        // custom validation error
        else if (type.match(/user defined/)) {
          type = error.message.split(/\./g).reverse()[0];
          message += error.message;
        }

        // all other errors
        else {
          if (error.properties) condition = error.properties[type];
          message += type;
        }
      }

      result[key] = {
        type: type,
        message: message,
        value: error.value
      };
    }

    return result;
  };

  this.parseUniqueError = function (err) {
    if (!err) return null;
    if (err.name !== 'MongoError') return null;
    if (err.code !== 11000 && err.code !== 11001) return null;

    var matches = /index:\s.*\.\$(.*)_1\sdup key:\s\{\s:\s"(.*)"\s\}/.exec(err.message);

    if (!matches) return null;

    var result = {};
    result[matches[1]] = {
      type: 'unique',
      message: 'unique',
      value: matches[2]
    };
    return result;
  };
};
