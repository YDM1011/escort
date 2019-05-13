var ejs = require('ejs'),
  fs = require('fs');
var async = require("async");
var format = require('format-number');

var NumberRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/number.ejs', 'utf-8');

  this.render = function (next) {
    var self = this;
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
      next(null, ejs.render(self.fieldTemplate, {
        fieldConfig: fieldConfig,
        numberOptions: numberOptions
      }));
    });
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

  this.formatNumber = function (value, next) {
    var self = this;
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
      var number = parseFloat(parseFloat(value).toFixed(2));
      if (number === parseInt(value) && numberOptions.removeZero) {
        number = parseInt(value);
      }
      var formattedNumber = format({
        prefix: '',
        suffix: '',
        decimal: numberOptions.numeralDecimalMark,
        integerSeparator: numberOptions.delimiter,
      })(number, {});
      next(err, formattedNumber);
    });
  };

  this.renderView = function (formModel, next) {
    var self = this;
    if (typeof formModel[self.fieldConfig.name] !== "undefined" && formModel[self.fieldConfig.name].toString().length > 0) {
      self.formatNumber(formModel[self.fieldConfig.name], function (err, formattedNumber) {
        next(err, formattedNumber || "");
      });
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
      next(null, ejs.render(fieldTemplate, {
        fieldConfig: self.fieldConfig,
        numberOptions: numberOptions,
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

module.exports = NumberRenderer;
