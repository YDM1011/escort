var ejs = require('ejs'),
  fs = require('fs');
var async = require("async");

var TouchspinRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/touchspin.ejs', 'utf-8');

  this.render = function (next) {
    var self = this;
    var inputOptions = self.fieldConfig.options ? self.fieldConfig.options : {};
    var pluginConfig = {
      step: inputOptions.step ? parseFloat(inputOptions.step) : 1,
      postfix: inputOptions.postfix ? inputOptions.postfix : ""
    };

    if (pluginConfig.step % 1 !== 0) {
      pluginConfig.decimals = 2;
    }

    if (inputOptions.min) {
      pluginConfig.min = parseFloat(inputOptions.min);
    }
    if (inputOptions.max) {
      pluginConfig.max = parseFloat(inputOptions.max);
    }

    next(null, ejs.render(self.fieldTemplate, {
      fieldConfig: fieldConfig,
      pluginConfig: pluginConfig
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
        var isnumReg = /^\d+(\.\d+)?$/;
        if (!self.fieldConfig.isRequired)
          cb(null, null);
        else if (self.fieldConfig.isRequired && typeof formModel[self.fieldConfig.name] !== "undefined" && isnumReg.test(formModel[self.fieldConfig.name].toString())) {
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
      validateMin: function (cb) {
        var isnumReg = /^\d+(\.\d+)?$/;
        if (!self.fieldConfig.options || typeof self.fieldConfig.options.min === "undefined" || !isnumReg.test(self.fieldConfig.options.min)) {
          return cb(null, null);
        }
        if (typeof formModel[self.fieldConfig.name] !== "undefined" && isnumReg.test(formModel[self.fieldConfig.name].toString()) && parseFloat(formModel[self.fieldConfig.name]) < self.fieldConfig.options.min) {
          var error = {
            message: "error.i18n.Value should be bigger than {n}",
            params: {
              '{n}': self.fieldConfig.options.min
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
      },
      validateMax: function (cb) {
        var isnumReg = /^\d+(\.\d+)?$/;
        if (!self.fieldConfig.options || typeof self.fieldConfig.options.max === "undefined" || !isnumReg.test(self.fieldConfig.options.max)) {
          return cb(null, null);
        }
        if (typeof formModel[self.fieldConfig.name] !== "undefined" && isnumReg.test(formModel[self.fieldConfig.name].toString()) && parseFloat(formModel[self.fieldConfig.name]) > self.fieldConfig.options.max) {
          var error = {
            message: "error.i18n.Value should be less than {n}",
            params: {
              '{n}': self.fieldConfig.options.max
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
      },
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
    if (typeof formModel[self.fieldConfig.name] !== "undefined" && formModel[self.fieldConfig.name].toString().length > 0) {
      var value = formModel[self.fieldConfig.name].toString();
      if (self.fieldConfig.options && self.fieldConfig.options.postfix) {
        value = value + self.fieldConfig.options.postfix;
      }
      next(null, value);
    } else {
      next(null, "");
    }
  };

  this.renderSearchBlock = function (queryParams, next) {
    var self = this;
    var fieldTemplate = fs.readFileSync(__dirname + '/views/search/number.ejs', 'utf-8');
    var Setting = backendApp.mongoose.model("Setting");
    Setting.getMergedList(function (err, list) {
      if (err) return next(err);
      var numberOptions = {
        numeral: true,
        numeralThousandsGroupStyle: "thousand",
        numeralDecimalMark: list.crm.finance && list.crm.finance.decimalSeparator ? list.crm.finance.decimalSeparator : ".",
        delimiter: list.crm.finance && list.crm.finance.thousandSeparator !== undefined ? list.crm.finance.thousandSeparator : ",",
        removeZero: list.crm.finance && list.crm.finance.removeZero !== undefined ? list.crm.finance.removeZero : false,
      };
      var inputOptions = self.fieldConfig.options ? self.fieldConfig.options : {};
      var postfix = inputOptions.postfix ? inputOptions.postfix : false;
      next(null, ejs.render(fieldTemplate, {
        fieldConfig: self.fieldConfig,
        numberOptions: numberOptions,
        postfix: postfix,
        queryParams: queryParams
      }));
    });
  };

  this.modifyBody = function (body, next) {
    var isNumber = function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    };
    if (isNumber(body[this.fieldConfig.name])) {
      body[this.fieldConfig.name] = parseFloat(body[this.fieldConfig.name]);
    }
    next(null, body);
  };

};

module.exports = TouchspinRenderer;
