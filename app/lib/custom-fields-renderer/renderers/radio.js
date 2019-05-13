var ejs = require('ejs'),
  fs = require('fs');
var async = require("async");

var RadioRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/radio.ejs', 'utf-8');

  this.render = function (next) {
    var self = this;
    var options = this.fieldConfig.options && this.fieldConfig.options.listOptions ? this.fieldConfig.options.listOptions : [];
    next(null, ejs.render(self.fieldTemplate, {
      fieldConfig: fieldConfig,
      options: options
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

  this.viewFieldTemplate = fs.readFileSync(__dirname + '/views/view/phrase.ejs', 'utf-8');
  this.renderViewForm = function (next) {
    var self = this;
    next(null, ejs.render(self.viewFieldTemplate, {
      fieldConfig: fieldConfig,
    }));
  };

  this.renderView = function (formModel, next) {
    var self = this;
    if (formModel[self.fieldConfig.name]) {
      var dropDownItems = self.fieldConfig.options && self.fieldConfig.options.listOptions ? self.fieldConfig.options.listOptions : [];
      var needLabel = null;
      dropDownItems.forEach(function (item) {
        if (item.value == formModel[self.fieldConfig.name]) {
          needLabel = item.label;
        }
      });
      if (needLabel) {
        backendApp.services.TranslateService.translate(needLabel, self.language, function (err, translatedLabel) {
          next(err, translatedLabel);
        });
      } else {
        next(null, "");
      }
    } else {
      next(null, "");
    }
  };

  this.renderSearchBlock = function (queryParams, next) {
    var self = this;
    var fieldTemplate = fs.readFileSync(__dirname + '/views/search/dropdown.ejs', 'utf-8');
    var options = this.fieldConfig.options && this.fieldConfig.options.listOptions ? this.fieldConfig.options.listOptions : [];
    next(null, ejs.render(fieldTemplate, {
      fieldConfig: fieldConfig,
      options: options,
      queryParams: queryParams
    }));
  };

  this.renderContactWishBlock = function (next) {
    var self = this;
    var fieldTemplate = fs.readFileSync(__dirname + '/views/contactWishes/dropdown.ejs', 'utf-8');
    var options = this.fieldConfig.options && this.fieldConfig.options.listOptions ? this.fieldConfig.options.listOptions : [];
    next(null, ejs.render(fieldTemplate, {
      fieldConfig: fieldConfig,
      options: options,
    }));
  };

  this.renderContactWishViewBlock = function (contact, returnAsHtml, next) {
    var self = this;
    var fieldTemplate = fs.readFileSync(__dirname + '/views/contactWishes/viewDropdown.ejs', 'utf-8');
    var wishItems = [];
    var returnBlock = function () {
      if (returnAsHtml) {
        next(null, ejs.render(fieldTemplate, {
          fieldConfig: fieldConfig,
          wishItems: wishItems
        }));
      } else {
        next(null, {
          fieldConfig: fieldConfig,
          wish: wishItems.join(", ")
        });
      }
    };
    if (contact.productWishes && contact.productWishes[self.fieldConfig.name] && contact.productWishes[self.fieldConfig.name].values
      && contact.productWishes[self.fieldConfig.name].values instanceof Array) {
      var labels = [];
      var options = self.fieldConfig.options && self.fieldConfig.options.listOptions ? self.fieldConfig.options.listOptions : [];
      options.forEach(function (item) {
        if (contact.productWishes[self.fieldConfig.name].values.indexOf(item.value) > -1) {
          labels.push(item.label);
        }
      });
      async.map(labels, function (label, cb) {
        backendApp.services.TranslateService.translate(label, self.language, function (err, translatedLabel) {
          cb(null, translatedLabel);
        });
      }, function (err, resultLabels) {
        wishItems = resultLabels.slice();
        returnBlock();
      });
    } else {
      returnBlock();
    }
  };


};

module.exports = RadioRenderer;
