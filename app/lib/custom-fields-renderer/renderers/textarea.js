var ejs = require('ejs'),
  fs = require('fs'),
  async = require('async');

var TextAreaRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/textarea.ejs', 'utf-8');

  this.render = function (next) {
    var self = this;
    var rows = self.fieldConfig.options && self.fieldConfig.options.rows ? self.fieldConfig.options.rows : 4;
    next(null, ejs.render(self.fieldTemplate, {
      fieldConfig: fieldConfig,
      rows: rows
    }));
  };

  this.viewFieldTemplate = fs.readFileSync(__dirname + '/views/view/phrase.ejs', 'utf-8');
  this.renderViewForm = function (next) {
    var self = this;
    next(null, ejs.render(self.viewFieldTemplate, {
      fieldConfig: fieldConfig,
    }));
  };

  this.validate = function (formModel, next) {
    var self = this;
    async.parallel({
      validateRequire: function (cb) {
        if (!self.fieldConfig.isRequired)
          cb(null, null);
        else if (self.fieldConfig.isRequired && formModel[self.fieldConfig.name]) {
          cb(null, null);
        } else {
          var error = "error.i18n.This field is required";
          backendApp.services.TranslateService.translate(error, self.language, function (err, t) {
            if (err) return cb(err);
            cb(null, {
              field: self.fieldConfig.name,
              error: t
            });
          });
        }
      },
      validateMaxLength: function (cb) {
        if (!self.fieldConfig.options || !self.fieldConfig.options.maxLength) {
          return cb(null, null);
        }
        if (formModel[self.fieldConfig.name] && formModel[self.fieldConfig.name].length > self.fieldConfig.options.maxLength) {
          var error = {
            message: "error.i18n.Text is too long. Max length is {n} symbols",
            params: {
              '{n}': self.fieldConfig.options.maxLength
            }
          };
          backendApp.services.TranslateService.translate(error, self.language, function (err, t) {
            if (err) return cb(err);
            cb(null, {
              field: self.fieldConfig.name,
              error: t
            });
          });
        } else {
          cb(null, null);
        }
      }
    }, function (err, results) {
      if (err) return next(err);
      var resultKeys = Object.keys(results);
      var resultError = null;
      resultKeys.forEach(function (key) {
        if (results[key] !== null && resultError === null) {
          resultError = results[key];
        }
      });
      next(null, resultError);
    });
  };

  this.renderSearchBlock = function (queryParams, next) {
    var fieldTemplate = fs.readFileSync(__dirname + '/views/search/textarea.ejs', 'utf-8');
    var html = ejs.render(fieldTemplate, {
      fieldConfig: fieldConfig,
      queryParams: queryParams
    });
    next(null, html);
  };
};

module.exports = TextAreaRenderer;
