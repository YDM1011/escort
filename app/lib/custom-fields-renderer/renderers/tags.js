var ejs = require('ejs'),
  fs = require('fs');
var async = require("async");
var mongoose = require("mongoose");

var TagsRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/tags.ejs', 'utf-8');

  this.render = function (next) {
    var self = this;
    next(null, ejs.render(self.fieldTemplate, {
      fieldConfig: fieldConfig,
    }));
  };

  this.viewFieldTemplate = fs.readFileSync(__dirname + '/views/view/image.ejs', 'utf-8');
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
      var values = formModel[self.fieldConfig.name].map(function (item) {
        return item.text;
      });
      var Setting = backendApp.mongoose.model("Setting");
      Setting.getMergedList(function (err, settings) {
        if (err) {
          return next(err);
        }
        var colorsString = settings && settings.root && settings.root.crmColors && settings.root.crmColors.tagsColors ? settings.root.crmColors.tagsColors : "";
        var cssClasses = [
          'tag_warning',
          'tag_active',
          'tag_skin',
          'tag_royal',
          'tag_lightpurple',
          'tag_greyscale',
          'tag_lightpink'
        ];
        if (!colorsString) {
          return next(null, values.join(", "));
        } else {
          var colors = colorsString.split(";");
          if (colors.length === 0) {
            return next(null, values.join(", "));
          }
          var labels = values.map(function (tagText) {
            var stringLettersSum = 0,
              strLength = tagText ? tagText.length : 0,
              i;
            for (i = 0; i < strLength; i++) {
              stringLettersSum += (i*tagText.toLowerCase().charCodeAt(i));
            }
            var colorIndex = stringLettersSum % colors.length;
            return '<span class="tag tag-item '+ cssClasses[stringLettersSum % cssClasses.length] +
              '" style="color: white; background-color: '+ colors[colorIndex] + ';">' + tagText + '</span>';
          });
          var container = '<div class="contact-tags">' + labels.join("") +'</div>';
          next(null, container);
        }
      })
    } else {
      return next(null, "");
    }
  };

  this.renderSearchBlock = function (queryParams, next) {
    var self = this;
    var fieldTemplate = fs.readFileSync(__dirname + '/views/search/dropdown.ejs', 'utf-8');
    var Model = mongoose.model(self.fieldConfig.module);
    Model.find({}, self.fieldConfig.name).exec(function (err, records) {
      if (err) return next(err);
      var tags = [];
      records.forEach(function (item) {
        var obj = item.toObject();
        if (obj[self.fieldConfig.name] instanceof Array) {
          obj[self.fieldConfig.name].forEach(function (tag) {
            if (tags.indexOf(tag.text) === -1) {
              tags.push(tag.text);
            }
          })
        }
      });
      var options = [];
      tags.forEach(function (tag) {
        options.push({
          value: tag,
          label: tag
        })
      });
      next(null, ejs.render(fieldTemplate, {
        fieldConfig: fieldConfig,
        options: options,
        queryParams: queryParams,
        isInitField: queryParams.initFields && queryParams.initFields instanceof Array && queryParams.initFields.indexOf(fieldConfig.name) > -1
      }));
    });
  };

  this.renderContactWishBlock = function (next) {
    var self = this;
    var fieldTemplate = fs.readFileSync(__dirname + '/views/contactWishes/dropdown.ejs', 'utf-8');
    var Model = mongoose.model(self.fieldConfig.module);
    Model.find({}, self.fieldConfig.name).exec(function (err, records) {
      if (err) return next(err);
      var tags = [];
      records.forEach(function (item) {
        var obj = item.toObject();
        if (obj[self.fieldConfig.name] instanceof Array) {
          obj[self.fieldConfig.name].forEach(function (tag) {
            if (tags.indexOf(tag.text) === -1) {
              tags.push(tag.text);
            }
          })
        }
      });
      var options = [];
      tags.forEach(function (tag) {
        options.push({
          value: tag,
          label: tag
        })
      });
      next(null, ejs.render(fieldTemplate, {
        fieldConfig: fieldConfig,
        options: options,
      }));
    });
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
      wishItems = contact.productWishes[self.fieldConfig.name].values.slice();
      returnBlock();
    } else {
      returnBlock();
    }
  };

};

module.exports = TagsRenderer;
