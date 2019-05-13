var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var ValidationError = mongoose.Error.ValidationError;
var MongooseError = mongoose.Error;
var _ = require('lodash');
var async = require('async');
var CustomFieldRenderer = require(__dirname + "/../custom-fields-renderer");

function ValidatorError(path, message) {
  var msg = message
    ? message
    : '';
  MongooseError.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'ValidatorError';
  this.path = path;
  this.type = message;
};

ValidatorError.prototype.toString = function () {
  return this.message;
}

ValidatorError.prototype.__proto__ = MongooseError.prototype;

/* start plugin */

module.exports = function (schema, options) {

  schema.statics.customValidation = function (model, language, body, next) {
    var self = this;

    function depopulate(src) {
      var dst = {};

      for (var key in src) {
        var path = self.schema.path(key);

        if (path && path.caster && path.caster.instance === 'ObjectID') {
          if (_.isArray(src[key])) {
            for (var j = 0; j < src[key].length; ++j) {
              if (typeof(src[key][j]) === 'object') {
                dst[key] = dst[key] || {};
                dst[key][j] = src[key][j]._id;
              }
            }
          } else if (_.isPlainObject(src[key])) {
            dst[key] = src[key]._id;
          }
        } else if (_.isPlainObject(src[key])) {
          if (path && path.instance === 'ObjectID') {
            dst[key] = src[key]._id;
          } else {
            dst[key] = depopulate(src[key]);
          }
        }

        if (_.isUndefined(dst[key])) {
          dst[key] = src[key];
        }
      }

      return dst;
    }

    var cleanBody = depopulate(body);
    async.parallel({
      getModel: function (cb) {
        if (!model) {
          var className = mongoose.model(self.modelName);
          model = new className();
          cb(null, model);
        } else {
          self.findOne({_id: model._id}).exec(function (err, item) {
            cb(err, item);
          });
        }
      }
    }, function (err, result) {
      var modelItem = result.getModel;
      for (var key in cleanBody) {
        modelItem.set(key, cleanBody[key]);
      }
      async.parallel({
        ownValidationErrors: function (cb) {
          modelItem.validate(function (err) {
            cb(null, err);
          })
        },
        customFieldValidation: function (cb) {
          var renderer = new CustomFieldRenderer(self.modelName, language);
          renderer.validateFormData(modelItem.toObject(), function (sysError, errObj) {
            var invalidFields = Object.keys(errObj);
            if (invalidFields.length === 0) {
              cb(null, null);
            } else {
              var error = new ValidationError(modelItem);
              invalidFields.forEach(function (errorField) {
                error.errors[errorField] = new ValidatorError(errorField, errObj[errorField]);
              });
              cb(null, error);
            }
          });
        }
      }, function (err, result) {
        if (result.ownValidationErrors && result.customFieldValidation)
          return next(_.merge(result.ownValidationErrors, result.customFieldValidation))
        else if (result.ownValidationErrors) {
          return next(result.ownValidationErrors);
        } else if (result.customFieldValidation) {
          return next(result.customFieldValidation);
        } else {
          return next(null);
        }
      });
    });
  };

  schema.methods.customValidation = function (language, body, next) {
    this.constructor.customValidation(this, language, body, next);
  };

  schema.statics.modifyBody = function (originalBody, next) {
    var self = this;
    var renderer = new CustomFieldRenderer(self.modelName, "en");
    renderer.modifyBody(originalBody, next);
  };

  schema.methods.modifyBody = function (originalBody, next) {
    this.constructor.modifyBody(originalBody, next);
  };

  schema.pre("save", function (next) {
    var formModel = this;
    var CustomField = backendApp.mongoose.model("CustomField");
    CustomField.getMergeList({
      module: formModel.constructor.modelName,
      type: "link",
      status: true
    }, function (err, fields) {
      if (err) return next(err);
      async.forEach(fields.sortedList, function (fieldItem, cb) {
        if (formModel.get(fieldItem.name + ".itemId")) {
          if (!fieldItem.options || !fieldItem.options.module) {
            return cb();
          }
          var Model = fieldItem.options.module.indexOf('Root') === -1 ? backendApp.mongoose.model(fieldItem.options.module) : rootMongoConnection.model(fieldItem.options.module);
          if (!fieldItem.options.multiple) {
            Model.findOne({_id: formModel.get(fieldItem.name + ".itemId")}).exec(function (err, linkItem) {
              if (err) return cb(err);
              if (!linkItem) return cb();
              var itemObj = linkItem.toObject();
              var label = fieldItem.options.field || "_id";
              formModel.set(fieldItem.name + ".itemName", itemObj[label], {strict: false});
              cb();
            });
          } else if (fieldItem.options.multiple && Object.prototype.toString.call(formModel.get(fieldItem.name + ".itemId")) === '[object Array]') {

            Model.find({_id: formModel.get(fieldItem.name + ".itemId")}).exec(function (err, linkItems) {
              if (err) return cb(err);
              var labels = linkItems.map(function (linkItem) {
                var itemObj = linkItem.toObject();
                var label = fieldItem.options.field || "_id";
                return itemObj[label];
              });
              formModel.set(fieldItem.name + ".itemName", labels.join(", "), {strict: false});
              cb();
            });
          } else {
            cb();
          }
        } else {
          cb();
        }
      }, function (err) {
        next(err);
      })
    });
  });

  schema.post("save", function (doc, next) {
    var formModel = this;
    var CustomFieldRendererLib = require(backendApp.config.root + "/app/lib/custom-fields-renderer");
    var CustomFieldRenderer = new CustomFieldRendererLib(formModel.constructor.modelName);
    CustomFieldRenderer.afterSave(doc, function (err) {
      next(err);
    });
  });

  schema.post("save", function (doc, next) {
    var self = this;
    var CustomField = backendApp.mongoose.model("CustomField");
    CustomField.getMergeList({
      type: "link",
      status: true,
      "options.module": this.constructor.modelName,
      module: {$ne: this.constructor.modelName}
    }, function (err, fields) {
      if (err) return next(err);
      async.forEach(fields.sortedList, function (fieldItem, cb) {
        if (!fieldItem.options || !fieldItem.options.module) {
          return cb();
        }
        var Model = backendApp.mongoose.model(fieldItem.module);
        var label = fieldItem.options.field || "_id";
        if (!fieldItem.options.multiple) {
          var query = {$or: []};
          var update = {
            $set: {}
          };
          var orSubQueryOne = {};
          var orSubQueryTwo = {};
          orSubQueryOne[fieldItem.name + ".itemId"] = backendApp.mongoose.Types.ObjectId(doc._id.toString());
          orSubQueryTwo[fieldItem.name + ".itemId"] = doc._id.toString();
          query.$or.push(orSubQueryOne);
          query.$or.push(orSubQueryTwo);
          update.$set[fieldItem.name + ".itemName"] = doc.get(label);
          Model.update(query, update, {multi: true}, function (err, updated) {
            console.log(query, update, updated);
            cb(err);
          });
        } else if (fieldItem.options.multiple) {
          var query = {};
          query[fieldItem.name + ".itemId"] = {$in: [doc._id.toString()]};
          Model.find(query).exec(function (err, items) {
            if (err) return cb(err);
            async.forEach(items, function (item, innerCb) {
              var itemObj = item.toObject();
              var ids = itemObj[fieldItem.name].itemId.map(function (id) {
                return backendApp.mongoose.Types.ObjectId(id.toString())
              });
              var label = fieldItem.options.field || "_id";
              self.constructor.find({_id: {$in: ids}}, "_id " + label).exec(function (err, linkItems) {
                if (err) return innerCb(err);
                var labels = linkItems.map(function (linkItem) {
                  var itemObj = linkItem.toObject();
                  return itemObj[label];
                });
                var update = {
                  $set: {}
                };
                update.$set[fieldItem.name + ".itemName"] = labels.join(", ");
                Model.update({_id: backendApp.mongoose.Types.ObjectId(itemObj._id)}, update, function (err, updated) {
                  innerCb(err);
                });
              });
            }, function (innerError) {
              cb(innerError);
            })
          });
        }
      }, function (err) {
        next(err);
      });
    });
  });

};
