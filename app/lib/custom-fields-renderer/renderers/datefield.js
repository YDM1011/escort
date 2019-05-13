var ejs = require('ejs'),
  fs = require('fs');
var async = require("async");
var moment = require('moment-timezone');

var DateRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/datefield.ejs', 'utf-8');

  var formatsMap = {
    'd-m-Y': "DD-MM-YYYY",
    'd/m/Y': "DD/MM/YYYY",
    'm-d-Y': "MM/DD/YYYY",
    'm.d.Y': "MM.DD.YYYY",
    'm/d/Y': "MM/DD/YYYY",
    'Y-m-d': "YYYY-MM-DD",
    'd.m.Y': "DD.MM.YYYY",
  };

  this.render = function (next) {
    var self = this;
    var Setting = backendApp.mongoose.model("Setting");
    Setting.getMergedList(function (err, list) {
      if (err) return next(err);
      var dateFormat = list.crm.general && list.crm.general.date_format && formatsMap[list.crm.general.date_format] ? formatsMap[list.crm.general.date_format] : "DD/MM/YYYY";
      var timezone = list.crm.general && list.crm.general.timezone ? list.crm.general.timezone : "Europe/Dublin";
      var minView = "date";
      var showTime = self.fieldConfig.options && self.fieldConfig.options.showTimeSelect === true;
      next(null, ejs.render(self.fieldTemplate, {
        fieldConfig: self.fieldConfig,
        dateFormat: dateFormat,
        timezone: timezone,
        options: self.fieldConfig.options || {},
        minView: minView,
        showTime: showTime
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
      validateBefore: function (cb) {
        if (!self.fieldConfig.options || !self.fieldConfig.options.before) {
          return cb(null, null);
        }
        if (!formModel[self.fieldConfig.options.before] || !formModel[self.fieldConfig.name]) {
          return cb(null, null);
        }
        var beforeDate = moment(formModel[self.fieldConfig.options.before]);
        var currentFieldDate = moment(formModel[self.fieldConfig.name]);
        if (!beforeDate.isValid() || !currentFieldDate.isValid()) {
          return cb(null, null);
        }
        if (currentFieldDate.unix() <= beforeDate.unix()) {
          // valid field
          return next(null, null)
        } else {
          var Setting = backendApp.mongoose.model("Setting");
          Setting.getMergedList(function (err, list) {
            if (err) return next(err);
            var dateFormat = list.crm.general && list.crm.general.date_format && formatsMap[list.crm.general.date_format] ? formatsMap[list.crm.general.date_format] : "DD/MM/YYYY";
            var timezone = list.crm.general && list.crm.general.timezone ? list.crm.general.timezone : "Europe/Dublin";
            var error = {
              message: "error.i18n.Date should be before {afterDate}",
              params: {
                '{afterDate}': beforeDate.tz(timezone).format(dateFormat)
              }
            };
            backendApp.services.TranslateService.translate(error, self.language, function (err, t) {
              if (err) return cb(err);
              cb(null, {
                field: self.fieldConfig.name,
                error: t
              });
            });
          });
        }
      },
      validateAfter: function (cb) {
        if (!self.fieldConfig.options || !self.fieldConfig.options.after) {
          return cb(null, null);
        }
        if (!formModel[self.fieldConfig.options.after] || !formModel[self.fieldConfig.name]) {
          return cb(null, null);
        }
        var afterDate = moment(formModel[self.fieldConfig.options.after]);
        var currentFieldDate = moment(formModel[self.fieldConfig.name]);
        if (!afterDate.isValid() || !currentFieldDate.isValid()) {
          return cb(null, null);
        }
        if (currentFieldDate.unix() >= afterDate.unix()) {
          // valid field
          return next(null, null)
        } else {
          var Setting = backendApp.mongoose.model("Setting");
          Setting.getMergedList(function (err, list) {
            if (err) return next(err);
            var dateFormat = list.crm.general && list.crm.general.date_format && formatsMap[list.crm.general.date_format] ? formatsMap[list.crm.general.date_format] : "DD/MM/YYYY";
            var timezone = list.crm.general && list.crm.general.timezone ? list.crm.general.timezone : "Europe/Dublin";
            var error = {
              message: "error.i18n.Date should be after {afterDate}",
              params: {
                '{afterDate}': afterDate.tz(timezone).format(dateFormat)
              }
            };
            backendApp.services.TranslateService.translate(error, self.language, function (err, t) {
              if (err) return cb(err);
              cb(null, {
                field: self.fieldConfig.name,
                error: t
              });
            });
          });
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

  this.formatDate = function (value, showTime, next) {
    var Setting = backendApp.mongoose.model("Setting");
    Setting.getMergedList(function (err, list) {
      if (err) return next(err);
      var dateFormat = list.crm.general && list.crm.general.date_format && formatsMap[list.crm.general.date_format] ? formatsMap[list.crm.general.date_format] : "DD/MM/YYYY";
      var timezone = list.crm.general && list.crm.general.timezone ? list.crm.general.timezone : "Europe/Dublin";
      var date = moment(value);
      if (showTime) {
        dateFormat = dateFormat + " HH:mm";
      }
      if (!date.isValid()) {
        return next(null, "");
      }
      return next(null, date.tz(timezone).format(dateFormat));
    });
  };

  this.renderView = function (formModel, next) {
    var self = this;
    if (formModel[self.fieldConfig.name]) {
      var Setting = backendApp.mongoose.model("Setting");
      var showTime = self.fieldConfig.options && self.fieldConfig.options.showTimeSelect === true;
      self.formatDate(formModel[self.fieldConfig.name], showTime, function (err, formattedDate) {
        next(err, formattedDate);
      })
    } else {
      next(null, "");
    }
  };

  this.renderSearchBlock = function (queryParams, next) {
    var self = this;
    var fieldTemplate = fs.readFileSync(__dirname + '/views/search/datefield.ejs', 'utf-8');
    var Setting = backendApp.mongoose.model("Setting");
    Setting.getMergedList(function (err, list) {
      if (err) return next(err);
      var dateFormat = list.crm.general && list.crm.general.date_format && formatsMap[list.crm.general.date_format] ? formatsMap[list.crm.general.date_format] : "DD/MM/YYYY";
      var timezone = list.crm.general && list.crm.general.timezone ? list.crm.general.timezone : "Europe/Dublin";
      var minView = "date";
      var showTime = self.fieldConfig.options && self.fieldConfig.options.showTimeSelect === true;
      next(null, ejs.render(fieldTemplate, {
        fieldConfig: self.fieldConfig,
        dateFormat: dateFormat,
        timezone: timezone,
        options: self.fieldConfig.options || {},
        minView: minView,
        showTime: false,
        queryParams: queryParams
      }));
    });
  };

  this.modifyBody = function (body, next) {
    if (body[this.fieldConfig.name]) {
      var time = moment(body[this.fieldConfig.name]);
      if (time.isValid()) {
        body[this.fieldConfig.name] = time.toDate();
      }
    }
    next(null, body);
  };


};

module.exports = DateRenderer;
