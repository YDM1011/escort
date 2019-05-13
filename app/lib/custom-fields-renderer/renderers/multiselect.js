var ejs = require('ejs'),
  fs = require('fs'),
  async = require('async');

var MultiselectRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/multiselect.ejs', 'utf-8');

  this.render = function (next) {
    var self = this;
    var options = this.fieldConfig.options && this.fieldConfig.options.listOptions ? this.fieldConfig.options.listOptions : [];
    next(null, ejs.render(self.fieldTemplate, {
      fieldConfig: fieldConfig,
      options: options
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
        else if (self.fieldConfig.isRequired && formModel[self.fieldConfig.name] && formModel[self.fieldConfig.name].length > 0) {
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

  this.renderView = function (formModel, next) {
    var self = this;
    if (formModel[self.fieldConfig.name] && Object.prototype.toString.call(formModel[self.fieldConfig.name]) === '[object Array]' && formModel[self.fieldConfig.name].length > 0) {
      var dropDownItems = self.fieldConfig.options && self.fieldConfig.options.listOptions ? self.fieldConfig.options.listOptions : [];
      async.map(formModel[self.fieldConfig.name], function (item, cb) {
        var needLabel = null;
        dropDownItems.forEach(function (option) {
          if (option.value == item) {
            needLabel = option.label;
          }
        });
        if (needLabel) {
          backendApp.services.TranslateService.translate(needLabel, self.language, function (err, translatedLabel) {
            cb(err, translatedLabel);
          });
        } else {
          cb(null, null);
        }
      }, function (err, resultLabels) {
        if (err) return next(err);
        var foundLabels = resultLabels.filter(function (item) {
          return item !== null;
        });
        next(null, foundLabels.join(', '));
      });
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

  this.renderContactWishBlock = function (next) {
    var self = this;
    var fieldTemplate = fs.readFileSync(__dirname + '/views/contactWishes/dropdown.ejs', 'utf-8');
    var options = this.fieldConfig.options && this.fieldConfig.options.listOptions ? this.fieldConfig.options.listOptions : [];
    next(null, ejs.render(fieldTemplate, {
      fieldConfig: fieldConfig,
      options: options,
    }));
  };

};

module.exports = MultiselectRenderer;
