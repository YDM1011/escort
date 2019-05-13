var ejs = require('ejs'),
  fs = require('fs');
var striptags = require("striptags");
var async = require("async");

var EditorRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/editor.ejs', 'utf-8');

  this.render = function (next) {
    var self = this;
    var editorOptions = {
      language: "en",
      allowedContent: true,
      entities: false,
      height: fieldConfig.options && fieldConfig.options.height ? fieldConfig.options.height + "px" : "400px",
      resize_minHeight: fieldConfig.options && fieldConfig.options.minHeight ? fieldConfig.options.minHeight + "px" : "400px",
    };
    next(null, ejs.render(self.fieldTemplate, {
      fieldConfig: fieldConfig,
      editorOptions: editorOptions
    }));
  };

  this.viewFieldTemplate = fs.readFileSync(__dirname + '/views/view/editor.ejs', 'utf-8');
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
        else if (self.fieldConfig.isRequired && striptags(formModel[self.fieldConfig.name])) {
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
        if (formModel[self.fieldConfig.name] && striptags(formModel[self.fieldConfig.name]).length > self.fieldConfig.options.maxLength) {
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

module.exports = EditorRenderer;
