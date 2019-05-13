var ejs = require('ejs'),
  fs = require('fs');
var async = require("async");
var moment = require('moment-timezone');

var DateRangeRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/daterange.ejs', 'utf-8');

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
      var rangeOptions = {
        format: dateFormat,
        timezone: timezone
      };
      next(null, ejs.render(self.fieldTemplate, {
        fieldConfig: self.fieldConfig,
        dateFormat: dateFormat,
        timezone: timezone,
        options: self.fieldConfig.options || {},
        rangeOptions: rangeOptions
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
        else if (self.fieldConfig.isRequired && typeof formModel[self.fieldConfig.name] !== "undefined" && formModel[self.fieldConfig.name].startDate && formModel[self.fieldConfig.name].endDate) {
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
    if (typeof formModel[self.fieldConfig.name] !== "undefined" && formModel[self.fieldConfig.name].startDate && formModel[self.fieldConfig.name].endDate) {
      var Setting = backendApp.mongoose.model("Setting");
      Setting.getMergedList(function (err, list) {
        if (err) return next(err);
        var dateFormat = list.crm.general && list.crm.general.date_format && formatsMap[list.crm.general.date_format] ? formatsMap[list.crm.general.date_format] : "DD/MM/YYYY";
        var timezone = list.crm.general && list.crm.general.timezone ? list.crm.general.timezone : "Europe/Dublin";
        var startDate = moment(formModel[self.fieldConfig.name].startDate);
        var endDate = moment(formModel[self.fieldConfig.name].endDate);
        if (!startDate.isValid() || !endDate.isValid()) {
          return next(null, "");
        }
        return next(null, startDate.tz(timezone).format(dateFormat) + " - " + endDate.tz(timezone).format(dateFormat));
      });
    } else {
      next(null, "");
    }
  };


};

module.exports = DateRangeRenderer;
