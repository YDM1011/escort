var glob = require('glob');
var async = require('async');
var path = require('path');
var _ = require('underscore');

var ejs = require('ejs'),
  fs = require('fs');

var CustomFieldProcessor = function (module, language) {

  this.module = module;
  this.language = language;

  this.renderers = {};
  var self = this;
  var renderers = glob.sync(__dirname + '/renderers/*.js');

  renderers.forEach(function (file) {
    var rendererFileInfo = path.parse(file);
    self.renderers[rendererFileInfo.name] = require(file);
  });

  this.getRenderClassByType = function (type) {
    if (typeof this.renderers[type] !== "undefined") {
      return this.renderers[type];
    } else {
      return null;
    }
  };

  this.renderForm = function (next) {
    var _self = this;
    var CustomField = backendApp.mongoose.model("CustomField");
    var FormSchema = backendApp.mongoose.model("FormSchema");
    CustomField.getMergeList({
      module: _self.module,
      status: true,
      showOnForm: true
    }, function (err, list) {
      if (err) return next(err);
      FormSchema.getFormSchema(_self.module, function (err, formSchema) {
        if (err) return next(err);
        var customFieldsConfigTable = {};
        list.sortedList.forEach(function (customItem) {
          customFieldsConfigTable[customItem.name] = customItem;
        });
        async.mapSeries(formSchema.formData, function (formItem, cb) {
          if (!formItem.isSection) {
            if (!customFieldsConfigTable[formItem.name]) return cb(null, "");
            var fieldConfig = customFieldsConfigTable[formItem.name];
            fieldConfig.colSize = formItem.gridWidth || 12;
            fieldConfig.minHeigth = formItem.minHeigth || null;
            var rendererClass = _self.getRenderClassByType(fieldConfig.type);
            if (!rendererClass) {
              return cb(null, "");
            }
            var renderer = new rendererClass(fieldConfig, _self.language);
            renderer.render(function (err, html) {
              cb(err, html);
            });
          } else {
            async.mapSeries(formItem.fields, function (sectionField, innerCb) {
              if (!customFieldsConfigTable[sectionField.name]) return cb(null, "");
              var fieldConfig = customFieldsConfigTable[sectionField.name];
              fieldConfig.colSize = sectionField.gridWidth || 12;
              fieldConfig.minHeigth = sectionField.minHeigth || null;
              var rendererClass = _self.getRenderClassByType(fieldConfig.type);
              if (!rendererClass) {
                return cb(null, "");
              }
              var renderer = new rendererClass(fieldConfig, _self.language);
              renderer.render(function (err, html) {
                innerCb(err, html);
              });
            }, function (err, sectionRenderedFields) {
              if (err) return cb(err);
              var innerSectionContent = sectionRenderedFields.join("");
              cb(null, _self.renderSection(formItem, innerSectionContent));
            });
          }
        }, function (err, renderedFields) {
          return next(err, renderedFields.join(""));
        });
      });
    });
  };

  this.renderViewForm = function (next) {
    var _self = this;
    var CustomField = backendApp.mongoose.model("CustomField");
    var FormSchema = backendApp.mongoose.model("FormSchema");
    CustomField.getMergeList({
      module: _self.module,
      status: true,
      showOnForm: true
    }, function (err, list) {
      if (err) return next(err);
      FormSchema.getFormSchema(_self.module, function (err, formSchema) {
        if (err) return next(err);
        var customFieldsConfigTable = {};
        list.sortedList.forEach(function (customItem) {
          customFieldsConfigTable[customItem.name] = customItem;
        });
        async.mapSeries(formSchema.formData, function (formItem, cb) {
          if (!formItem.isSection) {
            if (!customFieldsConfigTable[formItem.name]) return cb(null, "");
            var fieldConfig = customFieldsConfigTable[formItem.name];
            fieldConfig.colSize = formItem.gridWidth || 12;
            fieldConfig.minHeigth = formItem.minHeigth || null;
            var rendererClass = _self.getRenderClassByType(fieldConfig.type);
            if (!rendererClass) {
              return cb(null, "");
            }
            var renderer = new rendererClass(fieldConfig, _self.language);
            if (typeof renderer.renderViewForm === "function")
              renderer.renderViewForm(function (err, html) {
                cb(err, html);
              });
            else {
              cb(null, "");
            }
          } else {
            async.mapSeries(formItem.fields, function (sectionField, innerCb) {
              if (!customFieldsConfigTable[sectionField.name]) return cb(null, "");
              var fieldConfig = customFieldsConfigTable[sectionField.name];
              fieldConfig.colSize = sectionField.gridWidth || 12;
              fieldConfig.minHeigth = sectionField.minHeigth || null;
              var rendererClass = _self.getRenderClassByType(fieldConfig.type);
              if (!rendererClass) {
                return cb(null, "");
              }
              var renderer = new rendererClass(fieldConfig, _self.language);
              if (typeof renderer.renderViewForm === "function")
                renderer.renderViewForm(function (err, html) {
                  innerCb(err, html);
                });
              else {
                innerCb(null, "");
              }
            }, function (err, sectionRenderedFields) {
              if (err) return cb(err);
              var innerSectionContent = sectionRenderedFields.join("");
              cb(null, _self.renderSection(formItem, innerSectionContent));
            });
          }
        }, function (err, renderedFields) {
          return next(err, renderedFields.join(""));
        });
      });
    });
  };

  this.renderSection = function (sectionConfig, innerContent) {
    var template = fs.readFileSync(__dirname + '/renderers/views/section.ejs', 'utf-8');
    return ejs.render(template, {
      sectionConfig: sectionConfig,
      innerContent: innerContent
    })
  };

  this.validateFormData = function (formModel, next) {
    var _self = this;
    var CustomField = backendApp.mongoose.model("CustomField");
    CustomField.getMergeList({
      module: _self.module,
      status: true,
      showOnForm: true
    }, function (err, list) {
      if (err) return next(err);
      async.mapSeries(list.sortedList, function (field, cb) {
        var rendererClass = _self.getRenderClassByType(field.type);
        if (!rendererClass) {
          return cb();
        }
        var renderer = new rendererClass(field, _self.language);
        renderer.validate(formModel, function (sysError, validationError) {
          if (sysError) return cb(sysError);
          return cb(null, validationError);
        });
      }, function (err, fieldsErrorsList) {
        var validationErrors = {};
        fieldsErrorsList.forEach(function (error) {
          if (error && error.field) {
            validationErrors[error.field] = error.error;
          }
        });
        next(null, validationErrors);
      });
    });
  };

  this.afterSave = function (formData, next) {
    var inputFormData = formData;
    var _self = this;
    var CustomField = backendApp.mongoose.model("CustomField");
    CustomField.getMergeList({
      module: _self.module,
      status: true,
      showOnForm: true,
      // isSystemField: false
    }, function (err, list) {
      if (err) return next(err);
      async.eachSeries(list.sortedList, function (field, cb) {
        var rendererClass = _self.getRenderClassByType(field.type);
        if (!rendererClass) {
          return cb();
        }
        var renderer = new rendererClass(field);
        if (typeof renderer.afterSave !== "function") {
          return cb();
        }
        renderer.afterSave(inputFormData, function (err) {
          cb(err);
        });
      }, function (err) {
        return next(err, inputFormData);
      })
    });
  };

  this.getViewValue = function (fieldConfig, formModel, language, next) {
    var self = this;
    var rendererClass = self.getRenderClassByType(fieldConfig.type !== "template" && fieldConfig.options && fieldConfig.options.customType  ? fieldConfig.options.customType : fieldConfig.type);
    if (!rendererClass) {
      console.log("Field type not found", fieldConfig.type, fieldConfig.name);
      return next(null, formModel[fieldConfig.name] || "");
    }
    var renderer = new rendererClass(fieldConfig, language);
    if (typeof renderer.renderView === "function") {
      renderer.renderView(formModel, next);
    } else {
      next(null, formModel[fieldConfig.name] || "");
    }
  };

  this.renderFilterPanel = function (params, next) {
    if (typeof params.excludeFields === "string") {
      params.excludeFields = [params.excludeFields];
    }
    if (typeof params.initFields === "string") {
      params.initFields = [params.initFields];
    }
    if (typeof params.textField === "string") {
      params.textField = [params.textField];
    }
    if (typeof params.autocompleteField === "string") {
      params.autocompleteField = [params.autocompleteField];
    }
    var CustomField = backendApp.mongoose.model("CustomField");
    var _self = this;
    CustomField.getMergeList({
      module: _self.module,
      status: true,
    }, function (err, list) {
      if (err) return next(err);
      var filterFields = list.sortedList.filter(function (item) {
        return item.filterInList && (typeof params.excludeFields === "undefined" || params.excludeFields.indexOf(item.name) === -1);
      });
      if (params.initFields instanceof Array && params.initFields.length > 0) {
        filterFields = filterFields.sort(function (a, b) {
          if (params.initFields.indexOf(a.name) > -1 && params.initFields.indexOf(b.name) === -1) {
            return -1;
          } else if (params.initFields.indexOf(b.name) > -1 && params.initFields.indexOf(a.name) === -1) {
            return 1;
          } else {
            return 0;
          }
        });
      }
      // async.mapSeries(filterFields, function (field, cb) {
      //   var rendererClass = _self.getRenderClassByType(field.type);
      //   if (!rendererClass) {
      //     return cb(null, "");
      //   }
      //   var renderer = new rendererClass(field, _self.language);
      //   if (typeof renderer.renderSearchBlock === "function") {
      //     renderer.renderSearchBlock(params, function (err, html) {
      //       cb(err, html);
      //     });
      //   } else {
      //     cb(null, "");
      //   }
      // }, function (err, rendered) {
      //   if (err) return next(err);
        // var template = fs.readFileSync(__dirname + '/renderers/views/search/container.ejs', 'utf-8');
        // var container = ejs.render(template, {
        //   filterFields: filterFields,
        //   elements: rendered.join(""),
        //   module: _self.module,
        //   frontendParams: params
        // });
        next(null, {
          html: '', //container, // @todo remove after finish CRM update
          filterFields: filterFields
        });
      // });
    });
  }

  this.modifyBody = function (originalBody, next) {
    var _self = this;
    // var CustomField = backendApp.mongoose.model("CustomField");
    var body = _.clone(originalBody);
      async.mapSeries( function (field, cb) {
          var rendererClass = _self.getRenderClassByType(field.type);
          if (!rendererClass) {
              return cb(null, "");
          }
          var renderer = new rendererClass(field, _self.language);
          if (typeof renderer.modifyBody === "function") {
              renderer.modifyBody(body, function (err, changedBody) {
                  body = _.clone(changedBody);
                  cb(err);
              });
          } else {
              cb(null);
          }
      }, function (err, rendered) {
          if (err) return next(err);
          next(null, body);
      });
  };

  this.renderContactWishesFields = function (next) {
    var CustomField = backendApp.mongoose.model("CustomField");
    var _self = this;
    CustomField.getMergeList({
      module: "Product",
      fieldIsProductWish: true,
      status: true,
    }, function (err, list) {
      if (err) return next(err);

      async.mapSeries(list.sortedList, function (field, cb) {
        var rendererClass = _self.getRenderClassByType(field.type);
        if (!rendererClass) {
          return cb(null, "");
        }
        var renderer = new rendererClass(field, _self.language);
        if (typeof renderer.renderContactWishBlock === "function") {
          renderer.renderContactWishBlock(function (err, html) {
            cb(err, html);
          });
        } else {
          cb(null, "");
        }
      }, function (err, rendered) {
        if (err) return next(err);
        next(null, rendered.join(""));
      });
    });
  };

  this.renderContactWishesView = function (contact, returnAsHtml, next) {
    var CustomField = backendApp.mongoose.model("CustomField");
    var _self = this;
    CustomField.getMergeList({
      module: "Product",
      fieldIsProductWish: true,
      status: true,
      type: {$nin: ['colors', 'price']}
    }, function (err, list) {
      if (err) return next(err);

      async.mapSeries(list.sortedList, function (field, cb) {
        var rendererClass = _self.getRenderClassByType(field.type);
        if (!rendererClass) {
          return cb(null, "");
        }
        var renderer = new rendererClass(field, _self.language);
        if (typeof renderer.renderContactWishViewBlock === "function") {
          renderer.renderContactWishViewBlock(contact, returnAsHtml, function (err, html) {
            cb(err, html);
          });
        } else {
          cb(null, "");
        }
      }, function (err, rendered) {
        if (err) return next(err);
        next(null, returnAsHtml ? rendered.join("") : rendered);
      });
    });
  };


  this.getDropdownOptions = function (fieldName, next) {
    var _self = this;
    var CustomField = backendApp.mongoose.model("CustomField");
    CustomField.getMergeList({
      module: _self.module,
      name: fieldName
    }, function (err, list) {
      if (err) return next(err);
      if (list.sortedList.length === 0 || ['dropdown', 'radio', 'multiselect'].indexOf(list.sortedList[0].type) === -1) {
        return next(null, []);
      }
      var rendererClass = _self.getRenderClassByType(list.sortedList[0].type);
      var renderer = new rendererClass(list.sortedList[0], _self.language);
      if (typeof renderer.getOptionsList === "function") {
        renderer.getOptionsList(function (err, list) {
          if (err) return next(err);
          return next(err, list);
        });
      } else {
        return next(null, []);
      }
    })
  }

  this.processFields = function (fields, formModel, next) {
    var CustomField = backendApp.mongoose.model("CustomField");
    var self = this;
    var cloneItem = typeof formModel.toObject === "function" ? formModel.toObject() : _.clone(formModel);
    CustomField.getMergeList({
      module: self.module,
      showOnForm: true,
      name: fields
    }, function (err, list) {
      if (err) {
        return next(err);
      }
      async.eachSeries(list.sortedList, function (customField, innerCb) {
        self.getViewValue(customField, cloneItem, self.language, function (err, value) {
          if (err) return innerCb(err);
          cloneItem[customField.name] = value;
          innerCb();
        });
      }, function (err) {
        next(err, cloneItem);
      });
    });
  }

  this.formatNumber = function (value, next) {
    var rendererClass = self.getRenderClassByType("number");
    var renderer = new rendererClass(null, this.language);
    renderer.formatNumber(value, function (err, formattedNumber) {
      next(err, formattedNumber);
    });
  };

  this.formatPrice = function (value, currency, next) {
    var rendererClass = self.getRenderClassByType("price");
    var renderer = new rendererClass(null, this.language);
    renderer.formatPrice(value, currency, function (err, formattedPrice) {
      next(err, formattedPrice);
    });
  };

  this.formatDate = function (date, showTime, next) {
    var rendererClass = self.getRenderClassByType("datefield");
    var renderer = new rendererClass(null, this.language);
    renderer.formatDate(date, showTime, function (err, formattedDate) {
      next(err, formattedDate);
    });
  };

  this.renderList = function (options, next) {
    var self = this;
    var RootListSchema = rootMongoConnection.model('RootListSchema');
    RootListSchema.getFormSchema(self.module, function (err, listSchema) {
      if (err) return next(err);
      if (!listSchema) return next();
      var listSchemaObject = typeof listSchema.toObject === "function" ? listSchema.toObject() : listSchema;
      var template = fs.readFileSync(__dirname + "/renderers//views/list/list.ejs", 'utf-8');
      next(null, ejs.render(template, {
        listSchema: listSchemaObject,
        options: options,
        calculatePercentWidth: function (percent, options) {
          if (options.showOperations) {
            return percent * 0.9;
          } else {
            return percent;
          }
        }
      }));
    })
  }
};

module.exports = CustomFieldProcessor;
