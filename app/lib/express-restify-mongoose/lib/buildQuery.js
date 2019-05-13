'use strict';

var Promise = require('bluebird');

module.exports = function (options) {
  return function (query, queryOptions) {
    var promise = new Promise(function (resolve, reject) {
      if (!queryOptions) {
        return resolve(query);
      }

      if (queryOptions.query) {
        query.where(queryOptions.query);
      }

      if (queryOptions.skip) {
        query.skip(queryOptions.skip);
      }

      if (options.limit && (!queryOptions.limit || queryOptions.limit === '0' || queryOptions.limit > options.limit)) {
        queryOptions.limit = options.limit;
      }

      if (queryOptions.limit && query.op !== 'count' && !queryOptions.distinct) {
        query.limit(queryOptions.limit);
      }

      if (queryOptions.sort) {
        query.sort(queryOptions.sort);
      }

      if (queryOptions.populate) {
        if (queryOptions.populate instanceof Array) {
          queryOptions.populate.forEach(function (populate) {
            if (typeof populate === "string") {
              try {
                query.populate(JSON.parse(populate));
              } catch(e) {
                console.log(e);
              }
            } else {
              query.populate(populate);
            }
          })
        } else
          query.populate(queryOptions.populate);
      }

      if (queryOptions.fill && typeof query.fill === "function") {
        console.log("queryOptions.fill", queryOptions.fill)
        query.fill(queryOptions.fill);
      }

      if (queryOptions.select) {
        query.select(queryOptions.select);
      }

      if (queryOptions.distinct) {
        query.distinct(queryOptions.distinct);
      }

      if (options.readPreference) {
        query.read(options.readPreference);
      }

      if (options.lean) {
        query.lean(options.lean);
      }

      resolve(query);
    });

    return promise;
  };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9idWlsZFF1ZXJ5LmpzIl0sIm5hbWVzIjpbIlByb21pc2UiLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsIm9wdGlvbnMiLCJxdWVyeSIsInF1ZXJ5T3B0aW9ucyIsInByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwid2hlcmUiLCJza2lwIiwibGltaXQiLCJvcCIsImRpc3RpbmN0Iiwic29ydCIsInBvcHVsYXRlIiwic2VsZWN0IiwicmVhZFByZWZlcmVuY2UiLCJyZWFkIiwibGVhbiJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFNQSxVQUFVQyxRQUFRLFVBQVIsQ0FBaEI7O0FBRUFDLE9BQU9DLE9BQVAsR0FBaUIsVUFBVUMsT0FBVixFQUFtQjtBQUNsQyxTQUFPLFVBQVVDLEtBQVYsRUFBaUJDLFlBQWpCLEVBQStCO0FBQ3BDLFFBQU1DLFVBQVUsSUFBSVAsT0FBSixDQUFZLFVBQUNRLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUMvQyxVQUFJLENBQUNILFlBQUwsRUFBbUI7QUFDakIsZUFBT0UsUUFBUUgsS0FBUixDQUFQO0FBQ0Q7O0FBRUQsVUFBSUMsYUFBYUQsS0FBakIsRUFBd0I7QUFDdEJBLGNBQU1LLEtBQU4sQ0FBWUosYUFBYUQsS0FBekI7QUFDRDs7QUFFRCxVQUFJQyxhQUFhSyxJQUFqQixFQUF1QjtBQUNyQk4sY0FBTU0sSUFBTixDQUFXTCxhQUFhSyxJQUF4QjtBQUNEOztBQUVELFVBQUlQLFFBQVFRLEtBQVIsS0FBa0IsQ0FBQ04sYUFBYU0sS0FBZCxJQUF1Qk4sYUFBYU0sS0FBYixLQUF1QixHQUE5QyxJQUFxRE4sYUFBYU0sS0FBYixHQUFxQlIsUUFBUVEsS0FBcEcsQ0FBSixFQUFnSDtBQUM5R04scUJBQWFNLEtBQWIsR0FBcUJSLFFBQVFRLEtBQTdCO0FBQ0Q7O0FBRUQsVUFBSU4sYUFBYU0sS0FBYixJQUFzQlAsTUFBTVEsRUFBTixLQUFhLE9BQW5DLElBQThDLENBQUNQLGFBQWFRLFFBQWhFLEVBQTBFO0FBQ3hFVCxjQUFNTyxLQUFOLENBQVlOLGFBQWFNLEtBQXpCO0FBQ0Q7O0FBRUQsVUFBSU4sYUFBYVMsSUFBakIsRUFBdUI7QUFDckJWLGNBQU1VLElBQU4sQ0FBV1QsYUFBYVMsSUFBeEI7QUFDRDs7QUFFRCxVQUFJVCxhQUFhVSxRQUFqQixFQUEyQjtBQUN6QlgsY0FBTVcsUUFBTixDQUFlVixhQUFhVSxRQUE1QjtBQUNEOztBQUVELFVBQUlWLGFBQWFXLE1BQWpCLEVBQXlCO0FBQ3ZCWixjQUFNWSxNQUFOLENBQWFYLGFBQWFXLE1BQTFCO0FBQ0Q7O0FBRUQsVUFBSVgsYUFBYVEsUUFBakIsRUFBMkI7QUFDekJULGNBQU1TLFFBQU4sQ0FBZVIsYUFBYVEsUUFBNUI7QUFDRDs7QUFFRCxVQUFJVixRQUFRYyxjQUFaLEVBQTRCO0FBQzFCYixjQUFNYyxJQUFOLENBQVdmLFFBQVFjLGNBQW5CO0FBQ0Q7O0FBRUQsVUFBSWQsUUFBUWdCLElBQVosRUFBa0I7QUFDaEJmLGNBQU1lLElBQU4sQ0FBV2hCLFFBQVFnQixJQUFuQjtBQUNEOztBQUVEWixjQUFRSCxLQUFSO0FBQ0QsS0E5Q2UsQ0FBaEI7O0FBZ0RBLFdBQU9FLE9BQVA7QUFDRCxHQWxERDtBQW1ERCxDQXBERCIsImZpbGUiOiJidWlsZFF1ZXJ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gKHF1ZXJ5LCBxdWVyeU9wdGlvbnMpIHtcclxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIGlmICghcXVlcnlPcHRpb25zKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc29sdmUocXVlcnkpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChxdWVyeU9wdGlvbnMucXVlcnkpIHtcclxuICAgICAgICBxdWVyeS53aGVyZShxdWVyeU9wdGlvbnMucXVlcnkpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChxdWVyeU9wdGlvbnMuc2tpcCkge1xyXG4gICAgICAgIHF1ZXJ5LnNraXAocXVlcnlPcHRpb25zLnNraXApXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChvcHRpb25zLmxpbWl0ICYmICghcXVlcnlPcHRpb25zLmxpbWl0IHx8IHF1ZXJ5T3B0aW9ucy5saW1pdCA9PT0gJzAnIHx8IHF1ZXJ5T3B0aW9ucy5saW1pdCA+IG9wdGlvbnMubGltaXQpKSB7XHJcbiAgICAgICAgcXVlcnlPcHRpb25zLmxpbWl0ID0gb3B0aW9ucy5saW1pdFxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAocXVlcnlPcHRpb25zLmxpbWl0ICYmIHF1ZXJ5Lm9wICE9PSAnY291bnQnICYmICFxdWVyeU9wdGlvbnMuZGlzdGluY3QpIHtcclxuICAgICAgICBxdWVyeS5saW1pdChxdWVyeU9wdGlvbnMubGltaXQpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChxdWVyeU9wdGlvbnMuc29ydCkge1xyXG4gICAgICAgIHF1ZXJ5LnNvcnQocXVlcnlPcHRpb25zLnNvcnQpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChxdWVyeU9wdGlvbnMucG9wdWxhdGUpIHtcclxuICAgICAgICBxdWVyeS5wb3B1bGF0ZShxdWVyeU9wdGlvbnMucG9wdWxhdGUpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChxdWVyeU9wdGlvbnMuc2VsZWN0KSB7XHJcbiAgICAgICAgcXVlcnkuc2VsZWN0KHF1ZXJ5T3B0aW9ucy5zZWxlY3QpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChxdWVyeU9wdGlvbnMuZGlzdGluY3QpIHtcclxuICAgICAgICBxdWVyeS5kaXN0aW5jdChxdWVyeU9wdGlvbnMuZGlzdGluY3QpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChvcHRpb25zLnJlYWRQcmVmZXJlbmNlKSB7XHJcbiAgICAgICAgcXVlcnkucmVhZChvcHRpb25zLnJlYWRQcmVmZXJlbmNlKVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAob3B0aW9ucy5sZWFuKSB7XHJcbiAgICAgICAgcXVlcnkubGVhbihvcHRpb25zLmxlYW4pXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlc29sdmUocXVlcnkpXHJcbiAgICB9KVxyXG5cclxuICAgIHJldHVybiBwcm9taXNlXHJcbiAgfVxyXG59XHJcbiJdfQ==
//# sourceMappingURL=buildQuery.js.map
