var ejs = require('ejs'),
  fs = require('fs'),
  async = require('async');

var DropDownRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/dropdown.ejs', 'utf-8');

  this.render = function (next) {
    var self = this;
    var options = this.fieldConfig.options && this.fieldConfig.options.listOptions ? this.fieldConfig.options.listOptions : [];
    self.getOptionsList(function (err, options) {
      next(null, ejs.render(self.fieldTemplate, {
        fieldConfig: fieldConfig,
        options: options
      }));
    })
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
    if (formModel[self.fieldConfig.name] !== undefined) {
      self.getOptionsList(function (err, dropDownItems) {
        var needOption = null;
        dropDownItems.forEach(function (item) {
          if (item.value == formModel[self.fieldConfig.name]) {
            needOption = item;
          }
        });
        if (needOption) {
          var processLabel = function (label, next) {
            var Model = backendApp.mongoose.model(self.fieldConfig.module);
            if (self.fieldConfig.options && self.fieldConfig.options.processLabelMethod && typeof Model[self.fieldConfig.options.processLabelMethod] === "function") {
              Model[self.fieldConfig.options.processLabelMethod](formModel, label, next);
            } else {
              next(null, label);
            }
          };
          backendApp.services.TranslateService.translate(needOption.label, self.language, function (err, translatedLabel) {
            var renderAsBadge = self.fieldConfig.options && self.fieldConfig.options.renderAsBadge === true;
            processLabel(translatedLabel, function (err, processedLabel) {
              if (renderAsBadge) {
                var bgColor = needOption.bgColor || "#d1dade";
                var color = needOption.color || "#5e5e5e";
                var style = '';
                //style for statuses
                if (self.fieldConfig.name == 'status') {
                  var tag = '';
                  if (needOption.tagClass) {
                    tag = needOption.tagClass;
                  } else if (needOption.value == 1) {
                    tag = 'tag_active';
                  } else if (needOption.value == 0) {
                    tag = 'tag_warning';
                  } else {
                    tag = 'tag_skin';
                    if(needOption.bgColor || needOption.color){
                      var bg = needOption.bgColor ? needOption.bgColor : 'rgba(251, 155, 52, 0.15)';
                      var color = needOption.color ? needOption.color : 'rgba(251, 155, 52, 0.8)';
                      style = needOption.bgColor ? 'style="background-color:'+bg+'; color:'+color+'"' : '';
                    }
                  }

                  var renderHtml = '<span class="tag ' + tag + '" '+style+'>' + processedLabel + '</span>';
                  return next(null, renderHtml);
                }
                var html = '<span class="tag tag-item" style="color: ' + color + '; background-color: ' + bgColor + '">' + processedLabel + '</span>';
                return next(null, html);
              } else {
                next(err, processedLabel);
              }
            });

          });
        } else if (self.fieldConfig.options && self.fieldConfig.options.alternativeValueField && formModel[self.fieldConfig.options.alternativeValueField]) {
          next(null, formModel[self.fieldConfig.options.alternativeValueField]);
        } else {
          next(null, "");
        }
      });
    } else {
      next(null, "");
    }
  };

  this.renderSearchBlock = function (queryParams, next) {
    var self = this;
    var fieldTemplate = fs.readFileSync(__dirname + '/views/search/dropdown.ejs', 'utf-8');
    self.getOptionsList(function (err, options) {
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
    self.getOptionsList(function (err, options) {
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
      self.getOptionsList(function (err, options) {
        var labels = [];
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
      });
    } else {
      returnBlock();
    }
  };

  this.getOptionsList = function (next) {
    var list = [];
    var self = this;
    if (self.fieldConfig.options && self.fieldConfig.options.listOptions) {
      list = self.fieldConfig.options.listOptions.slice();
    }

    if (self.fieldConfig.options && self.fieldConfig.options.rootList && self.fieldConfig.options.rootList.module && self.fieldConfig.options.rootList.field) {
      var Model = self.fieldConfig.options.rootList.module.indexOf('Root') === -1 ? backendApp.mongoose.model(self.fieldConfig.options.rootList.module) : rootMongoConnection.model(self.fieldConfig.options.rootList.module);
      Model.find({}).exec(function (err, dbList) {
        if (err) return next(err);
        var hasTranslates = self.fieldConfig.options && self.fieldConfig.options.rootList && self.fieldConfig.options.rootList.hasTranslates === true;
        var renderAsBadge = self.fieldConfig.options && self.fieldConfig.options.renderAsBadge === true;
        dbList.forEach(function (item) {
          var t = item.toObject();
          var option = {
            value: t._id
          };
          option.label = t[self.fieldConfig.options.rootList.field];
          if (hasTranslates) {
            if (typeof t.translates === "object") {
              if (t.translates && t.translates[self.language]) {
                option.label = t.translates[self.language];
              } else if (t.translates['en']) {
                option.label = t.translates['en'];
              }
            }
            if (typeof t.translates !== "object" && typeof t[self.fieldConfig.options.rootList.field] === "object") {
              if (t[self.fieldConfig.options.rootList.field] && t[self.fieldConfig.options.rootList.field][self.language]) {
                option.label = t[self.fieldConfig.options.rootList.field][self.language];
              } else if (t[self.fieldConfig.options.rootList.field]['en']) {
                option.label = t[self.fieldConfig.options.rootList.field]['en'];
              }
            }
          }
          if (renderAsBadge) {
            option.bgColor = t.bgColor || "#d1dade";
            option.color = t.color || "#5e5e5e";
          }
          list.push(option);
        });
        list.sort(function (a, b) {
          if (a.label < b.label)
            return -1;
          if (a.label > b.label)
            return 1;
          return 0;
        });
        next(null, list);
      })
    } else if (self.fieldConfig.options && self.fieldConfig.options.rootList && self.fieldConfig.options.rootList.module && self.fieldConfig.options.rootList.method) {
      var Model = self.fieldConfig.options.rootList.module.indexOf('Root') === -1 ? backendApp.mongoose.model(self.fieldConfig.options.rootList.module) : rootMongoConnection.model(self.fieldConfig.options.rootList.module);
      Model[self.fieldConfig.options.rootList.method](self.language, function (err, dbList) {
        if (err) return next(null, list);
        dbList.forEach(function (t) {
          var option = {
            value: t._id,
            label: t[self.fieldConfig.options.rootList.labelField]
          };
          list.push(option);
        });
        return next(null, list);
      })
    } else {
      next(null, list);
    }
  }
};

module.exports = DropDownRenderer;

