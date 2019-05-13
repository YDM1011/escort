'use strict';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {value: value, enumerable: true, configurable: true, writable: true});
  } else {
    obj[key] = value;
  }
  return obj;
}

var http = require('http');

module.exports = function (model, options) {
  var errorHandler = require('../errorHandler')(options);

  return function (req, res, next) {
    if (!req.params.id) {
      return next();
    }

    options.contextFilter(model, req, function (filteredContext) {
      filteredContext.findOne().and(_defineProperty({}, options.idProperty, req.params.id)).lean(false).read(options.readPreference).exec().then(function (doc) {
        if (!doc) {
          return errorHandler(req, res, next)(new Error(http.STATUS_CODES[404]));
        }

        req.erm.document = doc;

        next();
      }, errorHandler(req, res, next));
    });
  };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9taWRkbGV3YXJlL2ZpbHRlckFuZEZpbmRCeUlkLmpzIl0sIm5hbWVzIjpbImh0dHAiLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsIm1vZGVsIiwib3B0aW9ucyIsImVycm9ySGFuZGxlciIsInJlcSIsInJlcyIsIm5leHQiLCJwYXJhbXMiLCJpZCIsImNvbnRleHRGaWx0ZXIiLCJmaWx0ZXJlZENvbnRleHQiLCJmaW5kT25lIiwiYW5kIiwiaWRQcm9wZXJ0eSIsImxlYW4iLCJyZWFkIiwicmVhZFByZWZlcmVuY2UiLCJleGVjIiwidGhlbiIsImRvYyIsIkVycm9yIiwiU1RBVFVTX0NPREVTIiwiZXJtIiwiZG9jdW1lbnQiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxJQUFNQSxPQUFPQyxRQUFRLE1BQVIsQ0FBYjs7QUFFQUMsT0FBT0MsT0FBUCxHQUFpQixVQUFVQyxLQUFWLEVBQWlCQyxPQUFqQixFQUEwQjtBQUN6QyxNQUFNQyxlQUFlTCxRQUFRLGlCQUFSLEVBQTJCSSxPQUEzQixDQUFyQjs7QUFFQSxTQUFPLFVBQVVFLEdBQVYsRUFBZUMsR0FBZixFQUFvQkMsSUFBcEIsRUFBMEI7QUFDL0IsUUFBSSxDQUFDRixJQUFJRyxNQUFKLENBQVdDLEVBQWhCLEVBQW9CO0FBQ2xCLGFBQU9GLE1BQVA7QUFDRDs7QUFFREosWUFBUU8sYUFBUixDQUFzQlIsS0FBdEIsRUFBNkJHLEdBQTdCLEVBQWtDLFVBQUNNLGVBQUQsRUFBcUI7QUFDckRBLHNCQUFnQkMsT0FBaEIsR0FBMEJDLEdBQTFCLHFCQUNHVixRQUFRVyxVQURYLEVBQ3dCVCxJQUFJRyxNQUFKLENBQVdDLEVBRG5DLEdBRUdNLElBRkgsQ0FFUSxLQUZSLEVBRWVDLElBRmYsQ0FFb0JiLFFBQVFjLGNBRjVCLEVBRTRDQyxJQUY1QyxHQUVtREMsSUFGbkQsQ0FFd0QsVUFBQ0MsR0FBRCxFQUFTO0FBQy9ELFlBQUksQ0FBQ0EsR0FBTCxFQUFVO0FBQ1IsaUJBQU9oQixhQUFhQyxHQUFiLEVBQWtCQyxHQUFsQixFQUF1QkMsSUFBdkIsRUFBNkIsSUFBSWMsS0FBSixDQUFVdkIsS0FBS3dCLFlBQUwsQ0FBa0IsR0FBbEIsQ0FBVixDQUE3QixDQUFQO0FBQ0Q7O0FBRURqQixZQUFJa0IsR0FBSixDQUFRQyxRQUFSLEdBQW1CSixHQUFuQjs7QUFFQWI7QUFDRCxPQVZELEVBVUdILGFBQWFDLEdBQWIsRUFBa0JDLEdBQWxCLEVBQXVCQyxJQUF2QixDQVZIO0FBV0QsS0FaRDtBQWFELEdBbEJEO0FBbUJELENBdEJEIiwiZmlsZSI6ImZpbHRlckFuZEZpbmRCeUlkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobW9kZWwsIG9wdGlvbnMpIHtcclxuICBjb25zdCBlcnJvckhhbmRsZXIgPSByZXF1aXJlKCcuLi9lcnJvckhhbmRsZXInKShvcHRpb25zKVxyXG5cclxuICByZXR1cm4gZnVuY3Rpb24gKHJlcSwgcmVzLCBuZXh0KSB7XHJcbiAgICBpZiAoIXJlcS5wYXJhbXMuaWQpIHtcclxuICAgICAgcmV0dXJuIG5leHQoKVxyXG4gICAgfVxyXG5cclxuICAgIG9wdGlvbnMuY29udGV4dEZpbHRlcihtb2RlbCwgcmVxLCAoZmlsdGVyZWRDb250ZXh0KSA9PiB7XHJcbiAgICAgIGZpbHRlcmVkQ29udGV4dC5maW5kT25lKCkuYW5kKHtcclxuICAgICAgICBbb3B0aW9ucy5pZFByb3BlcnR5XTogcmVxLnBhcmFtcy5pZFxyXG4gICAgICB9KS5sZWFuKGZhbHNlKS5yZWFkKG9wdGlvbnMucmVhZFByZWZlcmVuY2UpLmV4ZWMoKS50aGVuKChkb2MpID0+IHtcclxuICAgICAgICBpZiAoIWRvYykge1xyXG4gICAgICAgICAgcmV0dXJuIGVycm9ySGFuZGxlcihyZXEsIHJlcywgbmV4dCkobmV3IEVycm9yKGh0dHAuU1RBVFVTX0NPREVTWzQwNF0pKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmVxLmVybS5kb2N1bWVudCA9IGRvY1xyXG5cclxuICAgICAgICBuZXh0KClcclxuICAgICAgfSwgZXJyb3JIYW5kbGVyKHJlcSwgcmVzLCBuZXh0KSlcclxuICAgIH0pXHJcbiAgfVxyXG59XHJcbiJdfQ==
//# sourceMappingURL=filterAndFindById.js.map
