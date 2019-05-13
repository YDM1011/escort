var _ = require('lodash');
var async = require('async');

module.exports = function (req, res, next) {
  if (req.query && !req.query.processFields) {
    return next();
  }

  var processFields = function (items, listView, callback) {
    var results = items.slice();
    var CustomField = backendApp.mongoose.model("CustomField");
    var requestLanguage = req.acceptLanguage || "en";
    CustomField.getMergeList({
      module: req.erm.model.modelName,
      showOnForm: true
    }, function (err, list) {
      if (err) return next(err);
      var getNamesOfProcessedFields = function (next) {
        if (!req.query.useFormSchema) {
          rootMongoConnection.model('RootListSchema').getFormSchema(req.erm.model.modelName, function (err, listSchema) {
            if (err) return next(err);
            var needToProcessFields = [];
            if (!listSchema && listView) {
              // process all fields
              needToProcessFields = list.sortedList;
            } else {
              // process only fields, which we show in list
              var listFieldNames = listView ? listSchema.listData.map(function (item) {
                return item.name;
              }) : [];
              if (req.query.requireProcessFields && req.query.requireProcessFields instanceof Array) {
                listFieldNames = listFieldNames.concat(req.query.requireProcessFields);
              }
              needToProcessFields = list.sortedList.filter(function (item) {
                return listFieldNames.indexOf(item.name) > -1;
              });
            }
            next(null, needToProcessFields);
          });
        } else {
          var FormSchema = backendApp.mongoose.model("FormSchema");
          FormSchema.getFormSchema(req.erm.model.modelName, function (err, formSchema) {
            if (err) return next(err);
            var fieldsNames = [];
            var needToProcessFields = [];
            formSchema.formData.forEach(function (formItem) {
              if (!formItem.isSection) {
                fieldsNames.push(formItem.name);
              } else {
                formItem.fields.forEach(function (sectionField) {
                  fieldsNames.push(sectionField.name);
                });
              }
            });
            if (req.query.requireProcessFields && req.query.requireProcessFields instanceof Array) {
              fieldsNames = fieldsNames.concat(req.query.requireProcessFields);
            }
            needToProcessFields = list.sortedList.filter(function (item) {
              return fieldsNames.indexOf(item.name) > -1;
            });
            next(null, needToProcessFields);
          });
        }
      };
      var customFieldRenderer = new (require(backendApp.config.root + "/app/lib/custom-fields-renderer"))(req.erm.model.modelName, requestLanguage);
      getNamesOfProcessedFields(function (err, needToProcessFields) {
        if (err) return callback(err);
        async.map(results, function (item, cb) {
          var cloneItem = typeof item.toObject === "function" ? item.toObject() : _.clone(item);
          var originalValues = {};
          async.eachSeries(needToProcessFields, function (customField, innerCb) {
            customFieldRenderer.getViewValue(customField, cloneItem, requestLanguage, function (err, value) {
              if (err) return innerCb(err);
              originalValues[customField.name] = cloneItem[customField.name];
              cloneItem[customField.name] = value;
              innerCb()
            });
          }, function (err) {
            cloneItem._originalValues = originalValues;
            cb(err, cloneItem);
          });
        }, function (err, mappedResult) {
          callback(err, mappedResult);
        });
      })

    });
  }

  if (req.erm.result && _.isArray(req.erm.result)) {
    processFields(req.erm.result, true, function (err, results) {
      if (err) return next(err);
      req.erm.result = results;
      next();
    })
  } else if (req.erm.result && typeof req.erm.result === "object") {
    processFields([req.erm.result], false, function (err, results) {
      if (err) return next(err);
      req.erm.result = results[0];
      next();
    })
  } else {
    next();
  }
};
