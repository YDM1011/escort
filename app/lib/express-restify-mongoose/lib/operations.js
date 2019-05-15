'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {value: value, enumerable: true, configurable: true, writable: true});
  } else {
    obj[key] = value;
  }
  return obj;
}

var _ = require('lodash');
var http = require('http');
var moredots = require('moredots');

module.exports = function (model, options, excludedMap) {
  var buildQuery = require('./buildQuery')(options);
  var errorHandler = require('./errorHandler')(options);

  function findById(filteredContext, id) {
    return filteredContext.findOne().and(_defineProperty({}, options.idProperty, id));
  }

  var accessDenied = function (req, res, next) {

    var language = req.acceptLanguage;
    var accessError = "error.i18n.Access denied!";
    backendApp.services.TranslateService.translate(accessError, language, function (err, t) {
      if (err) return next(err);
      res.status(403).send({
        status: "ACCESS_DENIED",
        message: t
      });
    })

  };

  function isDistinctExcluded(req) {
    return options.filter.isExcluded(req._ermQueryOptions['distinct'], {
      access: req.access,
      excludedMap: excludedMap
    });
  }

  function getItems(req, res, next) {
    if (isDistinctExcluded(req)) {
      req.erm.result = [];
      req.erm.statusCode = 200;
      return next();
    }

    if (req.actionAccessPermision === "own") {
      if (req._ermQueryOptions.query) {
        req._ermQueryOptions.query.createdBy = {itemId: req.user._id};
      } else {
        req._ermQueryOptions.query = {
          createdBy: {itemId: req.user._id}
        };
      }
    }

    options.contextFilter(model, req, function (filteredContext) {
      buildQuery(filteredContext.find(), req._ermQueryOptions).then(function (items) {
        req.erm.result = items;
        req.erm.statusCode = 200;

        if (options.totalCountHeader && !req._ermQueryOptions['distinct']) {
          options.contextFilter(model, req, function (countFilteredContext) {
            buildQuery(countFilteredContext.count(), _.assign(req._ermQueryOptions, {
              skip: 0,
              limit: 0
            })).then(function (count) {
              req.erm.totalCount = count;
              next();
            }, errorHandler(req, res, next));
          });
        } else {
          next();
        }
      }, errorHandler(req, res, next));
    });
  }

  function getCustomLinkItems(req, res, next) {
    if (isDistinctExcluded(req)) {
      req.erm.result = [];
      req.erm.statusCode = 200;
      return next();
    }

    options.contextFilter(model, req, function (filteredContext) {
      buildQuery(filteredContext.find(), req._ermQueryOptions).then(function (items) {
        req.erm.result = items;
        req.erm.statusCode = 200;

        if (options.totalCountHeader && !req._ermQueryOptions['distinct']) {
          options.contextFilter(model, req, function (countFilteredContext) {
            buildQuery(countFilteredContext.count(), _.assign(req._ermQueryOptions, {
              skip: 0,
              limit: 0
            })).then(function (count) {
              req.erm.totalCount = count;
              next();
            }, errorHandler(req, res, next));
          });
        } else {
          next();
        }
      }, errorHandler(req, res, next));
    });
  }

  function getCount(req, res, next) {
    options.contextFilter(model, req, function (filteredContext) {
      if (req.actionAccessPermision === "own") {
        if (req._ermQueryOptions.query) {
          req._ermQueryOptions.query.createdBy = {itemId: req.user._id};
        } else {
          req._ermQueryOptions.query = {
            createdBy: {itemId: req.user._id}
          };
        }
      }
      buildQuery(filteredContext.count(), req._ermQueryOptions).then(function (count) {
        req.erm.result = {count: count};
        req.erm.statusCode = 200;

        next();
      }, errorHandler(req, res, next));
    });
  }

  function getShallow(req, res, next) {
    options.contextFilter(model, req, function (filteredContext) {
      buildQuery(findById(filteredContext, req.params.id), req._ermQueryOptions).then(function (item) {
        if (!item) {
          return errorHandler(req, res, next)(new Error(http.STATUS_CODES[404]));
        }

        for (var prop in item) {
          item[prop] = _typeof(item[prop]) === 'object' && prop !== '_id' ? true : item[prop];
        }

        req.erm.result = item;
        req.erm.statusCode = 200;

        next();
      }, errorHandler(req, res, next));
    });
  }

  function deleteItems(req, res, next) {
    options.contextFilter(model, req, function (filteredContext) {
      if (req.actionAccessPermision === "own") {
        if (req._ermQueryOptions.query) {
          req._ermQueryOptions.query.createdBy = {itemId: req.user._id};
        } else {
          req._ermQueryOptions.query = {
            createdBy: {itemId: req.user._id}
          };
        }
      }
      buildQuery(filteredContext.remove(), req._ermQueryOptions).then(function () {
        req.erm.statusCode = 204;

        next();
      }, errorHandler(req, res, next));
    });
  }

  function getItem(req, res, next) {
    if (isDistinctExcluded(req)) {
      req.erm.result = [];
      req.erm.statusCode = 200;
      return next();
    }

    options.contextFilter(model, req, function (filteredContext) {
      buildQuery(findById(filteredContext, req.params.id), req._ermQueryOptions).then(function (item) {
        if (!item) {
          return errorHandler(req, res, next)(new Error(http.STATUS_CODES[404]));
        }

        if (typeof model.schema.paths.deleted !== "undefined" && item.deleted === true) {
          return errorHandler(req, res, next)(new Error(http.STATUS_CODES[404]));
        }

        if (req.actionAccessPermision === "own" && typeof item.constructor.schema.paths['createdBy.itemId'] !== "undefined" && item.createdBy.itemId.toString() !== req.user._id.toString()) {
          return errorHandler(req, res, next)(new Error(http.STATUS_CODES[404]));
        }

        req.erm.result = item;
        req.erm.statusCode = 200;

        next();
      }, errorHandler(req, res, next));
    });
  }

  function deleteItem(req, res, next) {
    if (options.findOneAndRemove) {
      options.contextFilter(model, req, function (filteredContext) {
        findById(filteredContext, req.params.id).findOneAndRemove().then(function (item) {
          if (!item) {
            return errorHandler(req, res, next)(new Error(http.STATUS_CODES[404]));
          }

          req.erm.statusCode = 204;

          next();
        }, errorHandler(req, res, next));
      });
    } else {
      if (typeof model.schema.paths.deleted !== "undefined" && req.erm.document.deleted === true) {
        return errorHandler(req, res, next)(new Error(http.STATUS_CODES[404]));
      }

      if (req.actionAccessPermision === "own" && typeof req.erm.document.constructor.schema.paths['createdBy.itemId'] !== "undefined" && req.erm.document.createdBy.itemId.toString() !== req.user._id.toString()) {
        return accessDenied(req, res, next);
      }

      if (typeof model.schema.virtuals.activityLogUserId !== "undefined") {
        req.erm.document.set('activityLogUserId', req.user ? req.user._id : null);
      }

      req.erm.document.remove().then(function () {
        req.erm.statusCode = 204;
        next();
      }, errorHandler(req, res, next));
    }
  }

  function createObject(req, res, next) {
    req.body = options.filter.filterObject(req.body || {}, {
      access: req.access,
      populate: req._ermQueryOptions.populate
    });

    if (model.schema.options._id) {
      delete req.body._id;
    }

    if (model.schema.options.versionKey) {
      delete req.body[model.schema.options.versionKey];
    }

    if (typeof model.schema.paths['createdBy.itemId'] !== "undefined" && (!req.body['createdBy'] || !req.body['createdBy']['itemId'])) {
      req.body['createdBy'] = {itemId: req.user ? req.user._id : null};
    }

    if (typeof model.schema.paths['assignedUser.itemId'] !== "undefined" && (!req.body['assignedUser'] || !req.body['assignedUser']['itemId'])) {
      req.body['assignedUser'] = {itemId: req.user ? req.user._id : null};
    }

    if (typeof model.schema.paths['updatedBy.itemId'] !== "undefined" && (!req.body['updatedBy'] || !req.body['updatedBy']['itemId'])) {
      req.body['updatedBy'] = {itemId: req.user ? req.user._id : null};
    }

    if (typeof model.schema.virtuals.activityLogUserId !== "undefined") {
      req.body['activityLogUserId'] = req.user ? req.user._id : null;
    }
    let body = req.body;
      // req.erm.result = req.body;
      // req.erm.statusCode = 201;
      // next()
    // model.modifyBody(req.body, function (err, body) {
    //   model.customValidation(null, req.acceptLanguage, body, function (err) {
    //     if (err) return errorHandler(req, res, next)(err);
        model.create(body).then(function (item) {
          return model.populate(item, req._ermQueryOptions.populate || []);
        }).then(function (item) {
          req.erm.result = item;
          req.erm.statusCode = 201;
          next();
        }, errorHandler(req, res, next));
      // });
    // });

  }

  function validateObject(req, res, next) {
      console.log("OK!!!!!!!!!!!" + options)
    req.body = options.filter.filterObject(req.body || {}, {
      access: req.access,
      populate: req._ermQueryOptions.populate
    });

    if (model.schema.options._id) {
      delete req.body._id;
    }

    if (model.schema.options.versionKey) {
      delete req.body[model.schema.options.versionKey];
    }

    if (typeof model.schema.paths['createdBy.itemId'] !== "undefined" && (!req.body['createdBy'] || !req.body['createdBy']['itemId'])) {
      req.body['createdBy'] = {itemId: req.user ? req.user._id : null};
    }

    if (typeof model.schema.paths['updatedBy.itemId'] !== "undefined" && (!req.body['updatedBy'] || !req.body['updatedBy']['itemId'])) {
      req.body['updatedBy'] = {itemId: req.user ? req.user._id : null};
    }

    if (typeof model.schema.paths['assignedUser.itemId'] !== "undefined" && (!req.body['assignedUser'] || !req.body['assignedUser']['itemId'])) {
      req.body['assignedUser'] = {itemId: req.user ? req.user._id : null};
    }

    function depopulate(src) {
      var dst = {};

      for (var key in src) {
        var path = model.schema.path(key);

        if (path && path.caster && path.caster.instance === 'ObjectID') {
          if (_.isArray(src[key])) {
            for (var j = 0; j < src[key].length; ++j) {
              if (_typeof(src[key][j]) === 'object') {
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

    model.modifyBody(req.body, function (err, body) {
      model.customValidation(null, req.acceptLanguage, body, function (err) {
        if (err) return errorHandler(req, res, next)(err);
        var modelObject = new model();
        var cleanBody = depopulate(req.body);
        for (var key in body) {
          modelObject.set(key, body[key]);
        }
        modelObject.validate(function (err) {
          if (err) {
            return errorHandler(req, res, next)(err);
          } else {
            res.ok();
          }
        });
      });
    });

  }

  function modifyObject(req, res, next) {

    req.body = options.filter.filterObject(req.body || {}, {
      access: req.access,
      populate: req._ermQueryOptions.populate
    });

    delete req.body._id;

    if (model.schema.options.versionKey) {
      delete req.body[model.schema.options.versionKey];
    }

    function depopulate(src) {
      var dst = {};

      for (var key in src) {
        var path = model.schema.path(key);

        if (path && path.caster && path.caster.instance === 'ObjectID') {
          if (_.isArray(src[key])) {
            for (var j = 0; j < src[key].length; ++j) {
              if (_typeof(src[key][j]) === 'object') {
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

    // var cleanBody = moredots(depopulate(req.body)); // was commented because doesn't work with embedded documents
    if (options.findOneAndUpdate) {

      options.contextFilter(model, req, function (filteredContext) {
        findById(filteredContext, req.params.id).findOneAndUpdate({}, {
          $set: cleanBody
        }, {
          new: true,
          runValidators: options.runValidators
        }).exec().then(function (item) {
          return model.populate(item, req._ermQueryOptions.populate || []);
        }).then(function (item) {
          if (!item) {
            return errorHandler(req, res, next)(new Error(http.STATUS_CODES[404]));
          }

          req.erm.result = item;
          req.erm.statusCode = 200;

          next();
        }, errorHandler(req, res, next));
      });
    } else {
      if (typeof model.schema.paths['updatedBy.itemId'] !== "undefined") {
        req.body['updatedBy'] = {itemId: req.user ? req.user._id : null};
      }
      if (typeof model.schema.virtuals.activityLogUserId !== "undefined") {
        req.body['activityLogUserId'] = req.user ? req.user._id : null;
      }
      var cleanBody = depopulate(req.body);
      if (req.actionAccessPermision === "own" && typeof req.erm.document.constructor.schema.paths['createdBy.itemId'] !== "undefined" && req.erm.document.createdBy.itemId.toString() !== req.user._id.toString()) {
        return accessDenied(req, res, next);
      }
      req.erm.document.modifyBody(cleanBody, function (err, body) {
        if (typeof model.schema.paths.deleted !== "undefined" && req.erm.document.deleted === true) {
          return errorHandler(req, res, next)(new Error(http.STATUS_CODES[404]));
        }
        for (var key in body) {
          req.erm.document.set(key, body[key]);
        }
        req.erm.document.customValidation(req.acceptLanguage, body, function (err) {
          if (err) return errorHandler(req, res, next)(err);
          req.erm.document.save().then(function (item) {
            return model.populate(item, req._ermQueryOptions.populate || []);
          }).then(function (item) {
            req.erm.result = item;
            req.erm.statusCode = 200;
            next();
          }, errorHandler(req, res, next));
        });
      });
    }
  }

  return {
    getItems: getItems,
    getCount: getCount,
    getItem: getItem,
    getShallow: getShallow,
    createObject: createObject,
    modifyObject: modifyObject,
    deleteItems: deleteItems,
    deleteItem: deleteItem,
    getCustomLinkItems: getCustomLinkItems,
    validateObject: validateObject
  };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9vcGVyYXRpb25zLmpzIl0sIm5hbWVzIjpbIl8iLCJyZXF1aXJlIiwiaHR0cCIsIm1vcmVkb3RzIiwibW9kdWxlIiwiZXhwb3J0cyIsIm1vZGVsIiwib3B0aW9ucyIsImV4Y2x1ZGVkTWFwIiwiYnVpbGRRdWVyeSIsImVycm9ySGFuZGxlciIsImZpbmRCeUlkIiwiZmlsdGVyZWRDb250ZXh0IiwiaWQiLCJmaW5kT25lIiwiYW5kIiwiaWRQcm9wZXJ0eSIsImlzRGlzdGluY3RFeGNsdWRlZCIsInJlcSIsImZpbHRlciIsImlzRXhjbHVkZWQiLCJfZXJtUXVlcnlPcHRpb25zIiwiYWNjZXNzIiwiZ2V0SXRlbXMiLCJyZXMiLCJuZXh0IiwiZXJtIiwicmVzdWx0Iiwic3RhdHVzQ29kZSIsImNvbnRleHRGaWx0ZXIiLCJmaW5kIiwidGhlbiIsIml0ZW1zIiwidG90YWxDb3VudEhlYWRlciIsImNvdW50RmlsdGVyZWRDb250ZXh0IiwiY291bnQiLCJhc3NpZ24iLCJza2lwIiwibGltaXQiLCJ0b3RhbENvdW50IiwiZ2V0Q291bnQiLCJnZXRTaGFsbG93IiwicGFyYW1zIiwiaXRlbSIsIkVycm9yIiwiU1RBVFVTX0NPREVTIiwicHJvcCIsImRlbGV0ZUl0ZW1zIiwicmVtb3ZlIiwiZ2V0SXRlbSIsImRlbGV0ZUl0ZW0iLCJmaW5kT25lQW5kUmVtb3ZlIiwiZG9jdW1lbnQiLCJjcmVhdGVPYmplY3QiLCJib2R5IiwiZmlsdGVyT2JqZWN0IiwicG9wdWxhdGUiLCJzY2hlbWEiLCJfaWQiLCJ2ZXJzaW9uS2V5IiwiY3JlYXRlIiwibW9kaWZ5T2JqZWN0IiwiZGVwb3B1bGF0ZSIsInNyYyIsImRzdCIsImtleSIsInBhdGgiLCJjYXN0ZXIiLCJpbnN0YW5jZSIsImlzQXJyYXkiLCJqIiwibGVuZ3RoIiwiaXNQbGFpbk9iamVjdCIsImlzVW5kZWZpbmVkIiwiY2xlYW5Cb2R5IiwiZmluZE9uZUFuZFVwZGF0ZSIsIiRzZXQiLCJuZXciLCJydW5WYWxpZGF0b3Jz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QixrQkFBWixFQUFzQlMsZ0JBQXRCLEVBQStCUixzQkFBL0IsRUFBMkNZLDBCQUEzQyxFQUF5RFEsMEJBQXpELEVBQXVFZCx3QkFBdkUsRUFBb0ZHLHNCQUFwRixFQUFQO0FBQ0QsQ0F2T0QiLCJmaWxlIjoib3BlcmF0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKVxyXG5jb25zdCBodHRwID0gcmVxdWlyZSgnaHR0cCcpXHJcbmNvbnN0IG1vcmVkb3RzID0gcmVxdWlyZSgnbW9yZWRvdHMnKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobW9kZWwsIG9wdGlvbnMsIGV4Y2x1ZGVkTWFwKSB7XHJcbiAgY29uc3QgYnVpbGRRdWVyeSA9IHJlcXVpcmUoJy4vYnVpbGRRdWVyeScpKG9wdGlvbnMpXHJcbiAgY29uc3QgZXJyb3JIYW5kbGVyID0gcmVxdWlyZSgnLi9lcnJvckhhbmRsZXInKShvcHRpb25zKVxyXG5cclxuICBmdW5jdGlvbiBmaW5kQnlJZCAoZmlsdGVyZWRDb250ZXh0LCBpZCkge1xyXG4gICAgcmV0dXJuIGZpbHRlcmVkQ29udGV4dC5maW5kT25lKCkuYW5kKHtcclxuICAgICAgW29wdGlvbnMuaWRQcm9wZXJ0eV06IGlkXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaXNEaXN0aW5jdEV4Y2x1ZGVkIChyZXEpIHtcclxuICAgIHJldHVybiBvcHRpb25zLmZpbHRlci5pc0V4Y2x1ZGVkKHJlcS5fZXJtUXVlcnlPcHRpb25zWydkaXN0aW5jdCddLCB7XHJcbiAgICAgIGFjY2VzczogcmVxLmFjY2VzcyxcclxuICAgICAgZXhjbHVkZWRNYXA6IGV4Y2x1ZGVkTWFwXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0SXRlbXMgKHJlcSwgcmVzLCBuZXh0KSB7XHJcbiAgICBpZiAoaXNEaXN0aW5jdEV4Y2x1ZGVkKHJlcSkpIHtcclxuICAgICAgcmVxLmVybS5yZXN1bHQgPSBbXVxyXG4gICAgICByZXEuZXJtLnN0YXR1c0NvZGUgPSAyMDBcclxuICAgICAgcmV0dXJuIG5leHQoKVxyXG4gICAgfVxyXG5cclxuICAgIG9wdGlvbnMuY29udGV4dEZpbHRlcihtb2RlbCwgcmVxLCAoZmlsdGVyZWRDb250ZXh0KSA9PiB7XHJcbiAgICAgIGJ1aWxkUXVlcnkoZmlsdGVyZWRDb250ZXh0LmZpbmQoKSwgcmVxLl9lcm1RdWVyeU9wdGlvbnMpLnRoZW4oKGl0ZW1zKSA9PiB7XHJcbiAgICAgICAgcmVxLmVybS5yZXN1bHQgPSBpdGVtc1xyXG4gICAgICAgIHJlcS5lcm0uc3RhdHVzQ29kZSA9IDIwMFxyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy50b3RhbENvdW50SGVhZGVyICYmICFyZXEuX2VybVF1ZXJ5T3B0aW9uc1snZGlzdGluY3QnXSkge1xyXG4gICAgICAgICAgb3B0aW9ucy5jb250ZXh0RmlsdGVyKG1vZGVsLCByZXEsIChjb3VudEZpbHRlcmVkQ29udGV4dCkgPT4ge1xyXG4gICAgICAgICAgICBidWlsZFF1ZXJ5KGNvdW50RmlsdGVyZWRDb250ZXh0LmNvdW50KCksIF8uYXNzaWduKHJlcS5fZXJtUXVlcnlPcHRpb25zLCB7XHJcbiAgICAgICAgICAgICAgc2tpcDogMCxcclxuICAgICAgICAgICAgICBsaW1pdDogMFxyXG4gICAgICAgICAgICB9KSkudGhlbigoY291bnQpID0+IHtcclxuICAgICAgICAgICAgICByZXEuZXJtLnRvdGFsQ291bnQgPSBjb3VudFxyXG4gICAgICAgICAgICAgIG5leHQoKVxyXG4gICAgICAgICAgICB9LCBlcnJvckhhbmRsZXIocmVxLCByZXMsIG5leHQpKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbmV4dCgpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LCBlcnJvckhhbmRsZXIocmVxLCByZXMsIG5leHQpKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldENvdW50IChyZXEsIHJlcywgbmV4dCkge1xyXG4gICAgb3B0aW9ucy5jb250ZXh0RmlsdGVyKG1vZGVsLCByZXEsIChmaWx0ZXJlZENvbnRleHQpID0+IHtcclxuICAgICAgYnVpbGRRdWVyeShmaWx0ZXJlZENvbnRleHQuY291bnQoKSwgcmVxLl9lcm1RdWVyeU9wdGlvbnMpLnRoZW4oKGNvdW50KSA9PiB7XHJcbiAgICAgICAgcmVxLmVybS5yZXN1bHQgPSB7IGNvdW50OiBjb3VudCB9XHJcbiAgICAgICAgcmVxLmVybS5zdGF0dXNDb2RlID0gMjAwXHJcblxyXG4gICAgICAgIG5leHQoKVxyXG4gICAgICB9LCBlcnJvckhhbmRsZXIocmVxLCByZXMsIG5leHQpKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFNoYWxsb3cgKHJlcSwgcmVzLCBuZXh0KSB7XHJcbiAgICBvcHRpb25zLmNvbnRleHRGaWx0ZXIobW9kZWwsIHJlcSwgKGZpbHRlcmVkQ29udGV4dCkgPT4ge1xyXG4gICAgICBidWlsZFF1ZXJ5KGZpbmRCeUlkKGZpbHRlcmVkQ29udGV4dCwgcmVxLnBhcmFtcy5pZCksIHJlcS5fZXJtUXVlcnlPcHRpb25zKS50aGVuKChpdGVtKSA9PiB7XHJcbiAgICAgICAgaWYgKCFpdGVtKSB7XHJcbiAgICAgICAgICByZXR1cm4gZXJyb3JIYW5kbGVyKHJlcSwgcmVzLCBuZXh0KShuZXcgRXJyb3IoaHR0cC5TVEFUVVNfQ09ERVNbNDA0XSkpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBwcm9wIGluIGl0ZW0pIHtcclxuICAgICAgICAgIGl0ZW1bcHJvcF0gPSB0eXBlb2YgaXRlbVtwcm9wXSA9PT0gJ29iamVjdCcgJiYgcHJvcCAhPT0gJ19pZCcgPyB0cnVlIDogaXRlbVtwcm9wXVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVxLmVybS5yZXN1bHQgPSBpdGVtXHJcbiAgICAgICAgcmVxLmVybS5zdGF0dXNDb2RlID0gMjAwXHJcblxyXG4gICAgICAgIG5leHQoKVxyXG4gICAgICB9LCBlcnJvckhhbmRsZXIocmVxLCByZXMsIG5leHQpKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRlbGV0ZUl0ZW1zIChyZXEsIHJlcywgbmV4dCkge1xyXG4gICAgb3B0aW9ucy5jb250ZXh0RmlsdGVyKG1vZGVsLCByZXEsIChmaWx0ZXJlZENvbnRleHQpID0+IHtcclxuICAgICAgYnVpbGRRdWVyeShmaWx0ZXJlZENvbnRleHQucmVtb3ZlKCksIHJlcS5fZXJtUXVlcnlPcHRpb25zKS50aGVuKCgpID0+IHtcclxuICAgICAgICByZXEuZXJtLnN0YXR1c0NvZGUgPSAyMDRcclxuXHJcbiAgICAgICAgbmV4dCgpXHJcbiAgICAgIH0sIGVycm9ySGFuZGxlcihyZXEsIHJlcywgbmV4dCkpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0SXRlbSAocmVxLCByZXMsIG5leHQpIHtcclxuICAgIGlmIChpc0Rpc3RpbmN0RXhjbHVkZWQocmVxKSkge1xyXG4gICAgICByZXEuZXJtLnJlc3VsdCA9IFtdXHJcbiAgICAgIHJlcS5lcm0uc3RhdHVzQ29kZSA9IDIwMFxyXG4gICAgICByZXR1cm4gbmV4dCgpXHJcbiAgICB9XHJcblxyXG4gICAgb3B0aW9ucy5jb250ZXh0RmlsdGVyKG1vZGVsLCByZXEsIChmaWx0ZXJlZENvbnRleHQpID0+IHtcclxuICAgICAgYnVpbGRRdWVyeShmaW5kQnlJZChmaWx0ZXJlZENvbnRleHQsIHJlcS5wYXJhbXMuaWQpLCByZXEuX2VybVF1ZXJ5T3B0aW9ucykudGhlbigoaXRlbSkgPT4ge1xyXG4gICAgICAgIGlmICghaXRlbSkge1xyXG4gICAgICAgICAgcmV0dXJuIGVycm9ySGFuZGxlcihyZXEsIHJlcywgbmV4dCkobmV3IEVycm9yKGh0dHAuU1RBVFVTX0NPREVTWzQwNF0pKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVxLmVybS5yZXN1bHQgPSBpdGVtXHJcbiAgICAgICAgcmVxLmVybS5zdGF0dXNDb2RlID0gMjAwXHJcblxyXG4gICAgICAgIG5leHQoKVxyXG4gICAgICB9LCBlcnJvckhhbmRsZXIocmVxLCByZXMsIG5leHQpKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRlbGV0ZUl0ZW0gKHJlcSwgcmVzLCBuZXh0KSB7XHJcbiAgICBpZiAob3B0aW9ucy5maW5kT25lQW5kUmVtb3ZlKSB7XHJcbiAgICAgIG9wdGlvbnMuY29udGV4dEZpbHRlcihtb2RlbCwgcmVxLCAoZmlsdGVyZWRDb250ZXh0KSA9PiB7XHJcbiAgICAgICAgZmluZEJ5SWQoZmlsdGVyZWRDb250ZXh0LCByZXEucGFyYW1zLmlkKS5maW5kT25lQW5kUmVtb3ZlKCkudGhlbigoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgaWYgKCFpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBlcnJvckhhbmRsZXIocmVxLCByZXMsIG5leHQpKG5ldyBFcnJvcihodHRwLlNUQVRVU19DT0RFU1s0MDRdKSlcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXEuZXJtLnN0YXR1c0NvZGUgPSAyMDRcclxuXHJcbiAgICAgICAgICBuZXh0KClcclxuICAgICAgICB9LCBlcnJvckhhbmRsZXIocmVxLCByZXMsIG5leHQpKVxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVxLmVybS5kb2N1bWVudC5yZW1vdmUoKS50aGVuKCgpID0+IHtcclxuICAgICAgICByZXEuZXJtLnN0YXR1c0NvZGUgPSAyMDRcclxuXHJcbiAgICAgICAgbmV4dCgpXHJcbiAgICAgIH0sIGVycm9ySGFuZGxlcihyZXEsIHJlcywgbmV4dCkpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjcmVhdGVPYmplY3QgKHJlcSwgcmVzLCBuZXh0KSB7XHJcbiAgICByZXEuYm9keSA9IG9wdGlvbnMuZmlsdGVyLmZpbHRlck9iamVjdChyZXEuYm9keSB8fCB7fSwge1xyXG4gICAgICBhY2Nlc3M6IHJlcS5hY2Nlc3MsXHJcbiAgICAgIHBvcHVsYXRlOiByZXEuX2VybVF1ZXJ5T3B0aW9ucy5wb3B1bGF0ZVxyXG4gICAgfSlcclxuXHJcbiAgICBpZiAobW9kZWwuc2NoZW1hLm9wdGlvbnMuX2lkKSB7XHJcbiAgICAgIGRlbGV0ZSByZXEuYm9keS5faWRcclxuICAgIH1cclxuXHJcbiAgICBpZiAobW9kZWwuc2NoZW1hLm9wdGlvbnMudmVyc2lvbktleSkge1xyXG4gICAgICBkZWxldGUgcmVxLmJvZHlbbW9kZWwuc2NoZW1hLm9wdGlvbnMudmVyc2lvbktleV1cclxuICAgIH1cclxuXHJcbiAgICBtb2RlbC5jcmVhdGUocmVxLmJvZHkpLnRoZW4oKGl0ZW0pID0+IG1vZGVsLnBvcHVsYXRlKGl0ZW0sIHJlcS5fZXJtUXVlcnlPcHRpb25zLnBvcHVsYXRlIHx8IFtdKSkudGhlbigoaXRlbSkgPT4ge1xyXG4gICAgICByZXEuZXJtLnJlc3VsdCA9IGl0ZW1cclxuICAgICAgcmVxLmVybS5zdGF0dXNDb2RlID0gMjAxXHJcblxyXG4gICAgICBuZXh0KClcclxuICAgIH0sIGVycm9ySGFuZGxlcihyZXEsIHJlcywgbmV4dCkpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtb2RpZnlPYmplY3QgKHJlcSwgcmVzLCBuZXh0KSB7XHJcbiAgICByZXEuYm9keSA9IG9wdGlvbnMuZmlsdGVyLmZpbHRlck9iamVjdChyZXEuYm9keSB8fCB7fSwge1xyXG4gICAgICBhY2Nlc3M6IHJlcS5hY2Nlc3MsXHJcbiAgICAgIHBvcHVsYXRlOiByZXEuX2VybVF1ZXJ5T3B0aW9ucy5wb3B1bGF0ZVxyXG4gICAgfSlcclxuXHJcbiAgICBkZWxldGUgcmVxLmJvZHkuX2lkXHJcblxyXG4gICAgaWYgKG1vZGVsLnNjaGVtYS5vcHRpb25zLnZlcnNpb25LZXkpIHtcclxuICAgICAgZGVsZXRlIHJlcS5ib2R5W21vZGVsLnNjaGVtYS5vcHRpb25zLnZlcnNpb25LZXldXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVwb3B1bGF0ZSAoc3JjKSB7XHJcbiAgICAgIGxldCBkc3QgPSB7fVxyXG5cclxuICAgICAgZm9yIChsZXQga2V5IGluIHNyYykge1xyXG4gICAgICAgIGNvbnN0IHBhdGggPSBtb2RlbC5zY2hlbWEucGF0aChrZXkpXHJcblxyXG4gICAgICAgIGlmIChwYXRoICYmIHBhdGguY2FzdGVyICYmIHBhdGguY2FzdGVyLmluc3RhbmNlID09PSAnT2JqZWN0SUQnKSB7XHJcbiAgICAgICAgICBpZiAoXy5pc0FycmF5KHNyY1trZXldKSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNyY1trZXldLmxlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzcmNba2V5XVtqXSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgICAgICAgIGRzdFtrZXldID0gZHN0W2tleV0gfHwge31cclxuICAgICAgICAgICAgICAgIGRzdFtrZXldW2pdID0gc3JjW2tleV1bal0uX2lkXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKF8uaXNQbGFpbk9iamVjdChzcmNba2V5XSkpIHtcclxuICAgICAgICAgICAgZHN0W2tleV0gPSBzcmNba2V5XS5faWRcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKF8uaXNQbGFpbk9iamVjdChzcmNba2V5XSkpIHtcclxuICAgICAgICAgIGlmIChwYXRoICYmIHBhdGguaW5zdGFuY2UgPT09ICdPYmplY3RJRCcpIHtcclxuICAgICAgICAgICAgZHN0W2tleV0gPSBzcmNba2V5XS5faWRcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGRzdFtrZXldID0gZGVwb3B1bGF0ZShzcmNba2V5XSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChfLmlzVW5kZWZpbmVkKGRzdFtrZXldKSkge1xyXG4gICAgICAgICAgZHN0W2tleV0gPSBzcmNba2V5XVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGRzdFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNsZWFuQm9keSA9IG1vcmVkb3RzKGRlcG9wdWxhdGUocmVxLmJvZHkpKVxyXG5cclxuICAgIGlmIChvcHRpb25zLmZpbmRPbmVBbmRVcGRhdGUpIHtcclxuICAgICAgb3B0aW9ucy5jb250ZXh0RmlsdGVyKG1vZGVsLCByZXEsIChmaWx0ZXJlZENvbnRleHQpID0+IHtcclxuICAgICAgICBmaW5kQnlJZChmaWx0ZXJlZENvbnRleHQsIHJlcS5wYXJhbXMuaWQpLmZpbmRPbmVBbmRVcGRhdGUoe30sIHtcclxuICAgICAgICAgICRzZXQ6IGNsZWFuQm9keVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgIG5ldzogdHJ1ZSxcclxuICAgICAgICAgIHJ1blZhbGlkYXRvcnM6IG9wdGlvbnMucnVuVmFsaWRhdG9yc1xyXG4gICAgICAgIH0pLmV4ZWMoKS50aGVuKChpdGVtKSA9PiBtb2RlbC5wb3B1bGF0ZShpdGVtLCByZXEuX2VybVF1ZXJ5T3B0aW9ucy5wb3B1bGF0ZSB8fCBbXSkpLnRoZW4oKGl0ZW0pID0+IHtcclxuICAgICAgICAgIGlmICghaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZXJyb3JIYW5kbGVyKHJlcSwgcmVzLCBuZXh0KShuZXcgRXJyb3IoaHR0cC5TVEFUVVNfQ09ERVNbNDA0XSkpXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmVxLmVybS5yZXN1bHQgPSBpdGVtXHJcbiAgICAgICAgICByZXEuZXJtLnN0YXR1c0NvZGUgPSAyMDBcclxuXHJcbiAgICAgICAgICBuZXh0KClcclxuICAgICAgICB9LCBlcnJvckhhbmRsZXIocmVxLCByZXMsIG5leHQpKVxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yIChsZXQga2V5IGluIGNsZWFuQm9keSkge1xyXG4gICAgICAgIHJlcS5lcm0uZG9jdW1lbnQuc2V0KGtleSwgY2xlYW5Cb2R5W2tleV0pXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlcS5lcm0uZG9jdW1lbnQuc2F2ZSgpLnRoZW4oKGl0ZW0pID0+IG1vZGVsLnBvcHVsYXRlKGl0ZW0sIHJlcS5fZXJtUXVlcnlPcHRpb25zLnBvcHVsYXRlIHx8IFtdKSkudGhlbigoaXRlbSkgPT4ge1xyXG4gICAgICAgIHJlcS5lcm0ucmVzdWx0ID0gaXRlbVxyXG4gICAgICAgIHJlcS5lcm0uc3RhdHVzQ29kZSA9IDIwMFxyXG5cclxuICAgICAgICBuZXh0KClcclxuICAgICAgfSwgZXJyb3JIYW5kbGVyKHJlcSwgcmVzLCBuZXh0KSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7IGdldEl0ZW1zLCBnZXRDb3VudCwgZ2V0SXRlbSwgZ2V0U2hhbGxvdywgY3JlYXRlT2JqZWN0LCBtb2RpZnlPYmplY3QsIGRlbGV0ZUl0ZW1zLCBkZWxldGVJdGVtIH1cclxufVxyXG4iXX0=
//# sourceMappingURL=operations.js.map
