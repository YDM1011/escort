var ejs = require('ejs'),
  fs = require('fs');
var async = require("async");
var format = require('format-number');

var PriceRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/price.ejs', 'utf-8');

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
      var leftPosition = list.crm.finance && list.crm.finance.currencyPlacement ? list.crm.finance.currencyPlacement === "left" : true;
      var defaultCurrency = list.crm.general && list.crm.general.default_currency && list.crm.general.default_currency.code ? list.crm.general.default_currency.code : "USD";
      next(null, ejs.render(self.fieldTemplate, {
        fieldConfig: fieldConfig,
        numberOptions: numberOptions,
        leftPosition: leftPosition,
        defaultCurrency: defaultCurrency
      }));
    });
  };

  this.viewFieldTemplate = fs.readFileSync(__dirname + '/views/view/price.ejs', 'utf-8');
  this.renderViewForm = function (next) {
    var self = this;
    var Setting = backendApp.mongoose.model("Setting");
    Setting.getMergedList(function (err, list) {
      if (err) return next(err);
      var leftPosition = list.crm.finance && list.crm.finance.currencyPlacement ? list.crm.finance.currencyPlacement === "left" : true;
      var defaultCurrency = list.crm.general && list.crm.general.default_currency && list.crm.general.default_currency.code ? list.crm.general.default_currency.code : "USD";
      next(null, ejs.render(self.viewFieldTemplate, {
        fieldConfig: fieldConfig,
        leftPosition: leftPosition,
      }));
    });
  };

  this.validate = function (formModel, next) {
    var self = this;
    async.parallel({
      validateRequire: function (cb) {
        var isnumReg = /^\d+(\.\d+)?$/;
        if (!self.fieldConfig.isRequired)
          cb(null, null);
        else if (self.fieldConfig.isRequired && typeof formModel[self.fieldConfig.name] !== "undefined" && typeof formModel[self.fieldConfig.name].price !== "undefined" && isnumReg.test(formModel[self.fieldConfig.name].price.toString())) {
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
      validateCurrency: function (cb) {
        var isnumReg = /^\d+(\.\d+)?$/;
        if (typeof formModel[self.fieldConfig.name] === "undefined" || formModel[self.fieldConfig.name].currency || typeof formModel[self.fieldConfig.name].price === 'undefined' || !isnumReg.test(formModel[self.fieldConfig.name].price.toString())) {
          cb(null, null);
        } else {
          var error = "error.i18n.Currency is required";
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
        if (typeof formModel[self.fieldConfig.name] !== "undefined" && typeof formModel[self.fieldConfig.name].price !== "undefined" && isnumReg.test(formModel[self.fieldConfig.name].price.toString()) && parseFloat(formModel[self.fieldConfig.name].price) < self.fieldConfig.options.min) {
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
        if (typeof formModel[self.fieldConfig.name] !== "undefined" && typeof formModel[self.fieldConfig.name].price !== "undefined" && isnumReg.test(formModel[self.fieldConfig.name].price.toString()) && parseFloat(formModel[self.fieldConfig.name].price) > self.fieldConfig.options.max) {
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

  this.formatPrice = function (value, currency, next) {
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
      var leftPosition = list.crm.finance && list.crm.finance.currencyPlacement ? list.crm.finance.currencyPlacement === "left" : true;
      var currencyCode = currency;
      if (!currencyCode && list.crm.general && list.crm.general.default_currency && list.crm.general.default_currency.code) {
        currencyCode = list.crm.general.default_currency.symbol;
      }
      var price = parseFloat((parseFloat(value)).toFixed(2));
      var formattedNumber = format({
        prefix: '',
        suffix: '',
        decimal: numberOptions.numeralDecimalMark,
        integerSeparator: numberOptions.delimiter,
      })(price, {});
      if (leftPosition) {
        formattedNumber = currencyCode + " " + formattedNumber;
      } else {
        formattedNumber = formattedNumber + " " + currencyCode;
      }
      return next(err, formattedNumber);
    });
  };

  this.renderView = function (formModel, next) {
    var self = this;
    if (typeof formModel[self.fieldConfig.name] !== "undefined" && typeof formModel[self.fieldConfig.name].price !== "undefined" && formModel[self.fieldConfig.name].price.toString().length > 0) {
      self.formatPrice(formModel[self.fieldConfig.name].price, formModel[self.fieldConfig.name].currency || "", function (err, formattedNumber) {
        if (err) return next(err);
        if (self.fieldConfig.options && self.fieldConfig.options.renderWithColors) {
          var color = "#1CB208";
          // var cssClass = 'c-positive';
          var price = parseFloat(formModel[self.fieldConfig.name].price);
          if (price < 0) {
            color = "#FF5B92";
            // cssClass = 'c-negative';
          }
          var Model = backendApp.mongoose.model(self.fieldConfig.module);
          // if (self.fieldConfig.options.generateColorMethod && typeof Model[self.fieldConfig.options.generateColorMethod] === "function") {
          //   Model[self.fieldConfig.options.generateColorMethod](formModel, price, function (err, color, sign) {
          //     next(err, '<span class="' + cssClass + '" style="color: ' + color + '">' + sign + formattedNumber + '</span>');
          //   })
          // } else {
            next(err, '<span style="color: ' + color + '">' + formattedNumber + '</span>');
          // }
        } else {
          next(err, formattedNumber);
        }
      });
    } else {
      next(null, "");
    }
  };

  this.renderSearchBlock = function (queryParams, next, returnOptions) {
    var fieldTemplate = fs.readFileSync(__dirname + '/views/search/price.ejs', 'utf-8');
    var Model = require("mongoose").model(fieldConfig.module);
    async.parallel({
      maxPrice: function (cb) {
        var sort = {};
        sort[fieldConfig.name + ".price"] = -1;
        var query = {};
        query[fieldConfig.name] = {$exists: true};
        Model.findOne(query, fieldConfig.name).sort(sort).exec(function (err, doc) {
          if (err) return cb(err);
          if (!doc) return cb(null, null);
          var obj = doc.toObject();
          var max = obj[fieldConfig.name] ? obj[fieldConfig.name].price : null;
          cb(null, max);
        });
      },
      minPrice: function (cb) {
        var sort = {};
        sort[fieldConfig.name + ".price"] = 1;
        var query = {};
        query[fieldConfig.name] = {$exists: true};
        Model.findOne(query, fieldConfig.name).sort(sort).exec(function (err, doc) {
          if (err) return cb(err);
          if (!doc) return cb(null, null);
          var obj = doc.toObject();
          var max = obj[fieldConfig.name] ? obj[fieldConfig.name].price : null;
          cb(null, max);
        });
      }
    }, function (err, result) {
      if (err) return next(err);
      var min, max;
      if (result.minPrice === null && result.maxPrice === null) {
        return next(null, null);
      } else if (result.minPrice === null && result.maxPrice !== null) {
        min = max = result.maxPrice;
      } else if (result.minPrice !== null && result.maxPrice === null) {
        min = max = result.minPrice;
      } else {
        min = result.minPrice;
        max = result.maxPrice;
      }

      if (min == 0 && min == max) {
        max = 10;
      } else if (min == max) {
        max = 2 * min;
      }
      min = Math.floor(min);
      max = Math.ceil(max);
      var sliderOptions = {
        min: min,
        max: max,
        type: 'double',
        maxPostfix: "+",
        prettify: false,
        hasGrid: false,
        grid: false,
        from_fixed: false
      };
      if (returnOptions) {
        return next(null, sliderOptions);
      }
      var html = ejs.render(fieldTemplate, {
        fieldConfig: fieldConfig,
        sliderOptions: sliderOptions,
        queryParams: queryParams,
        isInitField: queryParams.initFields && queryParams.initFields instanceof Array && queryParams.initFields.indexOf(fieldConfig.name) > -1
      });
      next(null, html);
    });
  };

  this.modifyBody = function (body, next) {
    var isNumber = function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    };
    if (body[this.fieldConfig.name] && isNumber(body[this.fieldConfig.name].price)) {
      body[this.fieldConfig.name].price = parseFloat(body[this.fieldConfig.name].price);
    }
    next(null, body);
  };

  this.getMinMaxPrices = function (next) {
    var Model = require("mongoose").model(fieldConfig.module);
    async.parallel({
      maxPrice: function (cb) {
        var sort = {};
        sort[fieldConfig.name + ".price"] = -1;
        var query = {};
        query[fieldConfig.name] = {$exists: true};
        Model.findOne(query, fieldConfig.name).sort(sort).exec(function (err, doc) {
          if (err) return cb(err);
          if (!doc) return cb(null, null);
          var obj = doc.toObject();
          var max = obj[fieldConfig.name] ? obj[fieldConfig.name].price : null;
          cb(null, max);
        });
      },
      minPrice: function (cb) {
        var sort = {};
        sort[fieldConfig.name + ".price"] = 1;
        var query = {};
        query[fieldConfig.name] = {$exists: true};
        Model.findOne(query, fieldConfig.name).sort(sort).exec(function (err, doc) {
          if (err) return cb(err);
          if (!doc) return cb(null, null);
          var obj = doc.toObject();
          var max = obj[fieldConfig.name] ? obj[fieldConfig.name].price : null;
          cb(null, max);
        });
      }
    }, function (err, result) {
      if (err) return next(err);
      var min, max;
      if (result.minPrice === null && result.maxPrice === null) {
        return next(null, null);
      } else if (result.minPrice === null && result.maxPrice !== null) {
        min = max = result.maxPrice;
      } else if (result.minPrice !== null && result.maxPrice === null) {
        min = max = result.minPrice;
      } else {
        min = result.minPrice;
        max = result.maxPrice;
      }

      if (min == 0 && min == max) {
        max = 10;
      } else if (min == max) {
        max = 2 * min;
      }
      next(null, {
        min: min,
        max: max
      })
    });
  };

  this.renderContactWishBlock = function (next) {
    var self = this;
    var fieldTemplate = fs.readFileSync(__dirname + '/views/contactWishes/price.ejs', 'utf-8');
    var Model = require("mongoose").model(fieldConfig.module);
    async.parallel({
      maxPrice: function (cb) {
        var sort = {};
        sort[fieldConfig.name + ".price"] = -1;
        var query = {};
        query[fieldConfig.name] = {$exists: true};
        Model.findOne(query, fieldConfig.name).sort(sort).exec(function (err, doc) {
          if (err) return cb(err);
          if (!doc) return cb(null, null);
          var obj = doc.toObject();
          var max = obj[fieldConfig.name] ? obj[fieldConfig.name].price : null;
          cb(null, max);
        });
      },
      minPrice: function (cb) {
        var sort = {};
        sort[fieldConfig.name + ".price"] = 1;
        var query = {};
        query[fieldConfig.name] = {$exists: true};
        Model.findOne(query, fieldConfig.name).sort(sort).exec(function (err, doc) {
          if (err) return cb(err);
          if (!doc) return cb(null, null);
          var obj = doc.toObject();
          var max = obj[fieldConfig.name] ? obj[fieldConfig.name].price : null;
          cb(null, max);
        });
      }
    }, function (err, result) {
      if (err) return next(err);
      var min, max;
      if (result.minPrice === null && result.maxPrice === null) {
        return next(null, null);
      } else if (result.minPrice === null && result.maxPrice !== null) {
        min = max = result.maxPrice;
      } else if (result.minPrice !== null && result.maxPrice === null) {
        min = max = result.minPrice;
      } else {
        min = result.minPrice;
        max = result.maxPrice;
      }

      if (min == 0 && min == max) {
        max = 10;
      } else if (min == max) {
        max = 2 * min;
      }
      var sliderOptions = {
        min: min,
        max: max,
        type: 'double',
        maxPostfix: "+",
        prettify: false,
        hasGrid: false,
      };
      var html = ejs.render(fieldTemplate, {
        fieldConfig: fieldConfig,
        sliderOptions: sliderOptions,
      });
      next(null, html);
    });
  };


  this.renderContactWishViewBlock = function (contact, returnAsHtml, next) {
    var self = this;
    var fieldTemplate = fs.readFileSync(__dirname + '/views/contactWishes/viewPrice.ejs', 'utf-8');
    var min = null, max = null;
    var returnBlock = function () {
      if (returnAsHtml) {
        next(null, ejs.render(fieldTemplate, {
          fieldConfig: fieldConfig,
          min: min,
          max: max
        }));
      } else {
        next(null, {
          fieldConfig: fieldConfig,
          wish: (!isNaN(parseFloat(min)) && !isNaN(parseFloat(max))) ? (min + " - " + max) : null
        });
      }
    };
    if (contact.productWishes && contact.productWishes[self.fieldConfig.name] && contact.productWishes[self.fieldConfig.name].enable) {
      self.getMinMaxPrices(function (err, values) {
        if (err) return next(err);
        if (contact.productWishes[self.fieldConfig.name].values && !isNaN(parseFloat(contact.productWishes[self.fieldConfig.name].values.min))) {
          min = parseFloat(contact.productWishes[self.fieldConfig.name].values.min);
        } else {
          min = values.min;
        }
        if (contact.productWishes[self.fieldConfig.name].values && !isNaN(parseFloat(contact.productWishes[self.fieldConfig.name].values.max))) {
          max = parseFloat(contact.productWishes[self.fieldConfig.name].values.max);
        } else {
          max = values.max;
        }
        returnBlock();
      });
    } else {
      returnBlock();
    }
  };

};

module.exports = PriceRenderer;
