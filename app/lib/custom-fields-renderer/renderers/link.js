var ejs = require('ejs'),
  fs = require('fs');
var async = require("async");

var PhraseRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/link.ejs', 'utf-8');

  this.render = function (next) {
    var self = this;
    var labelField = self.fieldConfig.options && self.fieldConfig.options.field ? self.fieldConfig.options.field : "_id";
    var multiple = self.fieldConfig.options && self.fieldConfig.options.multiple ? self.fieldConfig.options.multiple : false;
    next(null, ejs.render(self.fieldTemplate, {
      fieldConfig: fieldConfig,
      labelField: labelField,
      multiple: multiple
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
        else if ((!self.fieldConfig.options || !self.fieldConfig.options.multiple) && self.fieldConfig.isRequired && formModel[self.fieldConfig.name] && formModel[self.fieldConfig.name].itemId) {
          cb(null, null);
        } else if (self.fieldConfig.options && self.fieldConfig.options.multiple && self.fieldConfig.isRequired && formModel[self.fieldConfig.name] && formModel[self.fieldConfig.name].itemId && formModel[self.fieldConfig.name].itemId.length > 0) {
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
    var module = self.fieldConfig.options && self.fieldConfig.options.module ? self.fieldConfig.options.module : "";
    var labelField = self.fieldConfig.options && self.fieldConfig.options.field ? self.fieldConfig.options.field : "_id";
    var multiple = self.fieldConfig.options && self.fieldConfig.options.multiple ? self.fieldConfig.options.multiple : false;
    if (!module) {
      return next(null, "");
    }
    if (multiple) {
      if (formModel[self.fieldConfig.name] && formModel[self.fieldConfig.name].itemId && Object.prototype.toString.call(formModel[self.fieldConfig.name].itemId) === '[object Array]' && formModel[self.fieldConfig.name].itemId.length > 0) {
        var Model = module.indexOf('Root') === -1 ? backendApp.mongoose.model(module) : rootMongoConnection.model(module);
        Model.find({_id: [].concat(formModel[self.fieldConfig.name].itemId)}).exec(function (err, items) {
          if (err) return next(err);
          var labels = [];
          items.forEach(function (item) {
            var obj = item.toObject();
            if (obj[labelField]) {
              labels.push(obj[labelField]);
            }
          });
          return next(null, labels.join(", "));
        });
      } else {
        return next(null, "");
      }
    } else {
      if (formModel[self.fieldConfig.name] && formModel[self.fieldConfig.name].itemId) {
        var Model = module.indexOf('Root') === -1 ? backendApp.mongoose.model(module) : rootMongoConnection.model(module);
        Model.findOne({_id: formModel[self.fieldConfig.name].itemId}).exec(function (err, linkItem) {
          if (err) return next(err);
          if (!linkItem) return next(null, "");
          var obj = linkItem.toObject();
          if (self.fieldConfig.options && self.fieldConfig.options.renderAsBadge) {
            var label = obj[labelField] || "";
            if (self.fieldConfig.options.hasTranslates) {
              if (obj.translates && obj.translates[self.language]) {
                label = obj.translates[self.language];
              } else if (obj.translates['en']) {
                label = obj.translates['en'];
              }
            }
            var bgColor = obj.bgColor || "#d1dade";
            var color = obj.color || "#5e5e5e";
            var html = '<span class="badge" style="color: ' + color + '; background-color: ' + bgColor + '">' + label + '</span>';
            return next(null, html);
          } else {
            return next(null, obj[labelField] || "");
          }
        });
      } else {
        return next(null, "");
      }
    }
  };

  this.renderSearchBlock = function (queryParams, next) {
    var self = this;
    var fieldTemplate = fs.readFileSync(__dirname + '/views/search/link.ejs', 'utf-8');
    var labelField = self.fieldConfig.options && self.fieldConfig.options.field ? self.fieldConfig.options.field : "_id";
    next(null, ejs.render(fieldTemplate, {
      fieldConfig: fieldConfig,
      labelField: labelField,
      queryParams: queryParams,
      isInitField: queryParams.initFields && queryParams.initFields instanceof Array && queryParams.initFields.indexOf(fieldConfig.name) > -1
    }));
  };

  this.renderContactWishViewBlock = function (contact, returnAsHtml, next) {
    var self = this;
    var fieldTemplate = fs.readFileSync(__dirname + '/views/contactWishes/viewLink.ejs', 'utf-8');
    var module = self.fieldConfig.options && self.fieldConfig.options.module ? self.fieldConfig.options.module : "";
    var labelField = self.fieldConfig.options && self.fieldConfig.options.field ? self.fieldConfig.options.field : "_id";
    if (!module) {
      return next(null, "");
    }
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
          wish: wishItems
        });
      }
    };
    if (contact.productWishes && contact.productWishes[self.fieldConfig.name] && contact.productWishes[self.fieldConfig.name].values
      && contact.productWishes[self.fieldConfig.name].values instanceof Array) {

      var Model = module.indexOf('Root') === -1 ? backendApp.mongoose.model(module) : rootMongoConnection.model(module);
      Model.find({_id: [].concat(contact.productWishes[self.fieldConfig.name].values)}).exec(function (err, items) {
        if (err) return next(err);
        var labels = [];
        items.forEach(function (item) {
          var obj = item.toObject();
          if (obj[labelField]) {
            wishItems.push(obj[labelField]);
          }
        });
        returnBlock();
      });

    } else {
      returnBlock();
    }
  };

  this.renderContactWishBlock = function (next) {
    var self = this;
    var fieldTemplate = fs.readFileSync(__dirname + '/views/contactWishes/link.ejs', 'utf-8');
    var labelField = self.fieldConfig.options && self.fieldConfig.options.field ? self.fieldConfig.options.field : "_id";
    next(null, ejs.render(fieldTemplate, {
      fieldConfig: fieldConfig,
      labelField: labelField,
    }));
  };


};

module.exports = PhraseRenderer;
