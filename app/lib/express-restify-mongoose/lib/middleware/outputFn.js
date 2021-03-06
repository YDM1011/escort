"use strict";

module.exports = function (isExpress) {
  return function output(req, res, next) {
    if (isExpress) {
      if (req.erm.result) {
        res.status(req.erm.statusCode).json(req.erm.result);
      } else {
        res.sendStatus(req.erm.statusCode);
      }
    } else {
      res.send(req.erm.statusCode, req.erm.result);
    }
  };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9taWRkbGV3YXJlL291dHB1dEZuLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJpc0V4cHJlc3MiLCJvdXRwdXQiLCJyZXEiLCJyZXMiLCJlcm0iLCJyZXN1bHQiLCJzdGF0dXMiLCJzdGF0dXNDb2RlIiwianNvbiIsInNlbmRTdGF0dXMiLCJzZW5kIl0sIm1hcHBpbmdzIjoiOztBQUFBQSxPQUFPQyxPQUFQLEdBQWlCLFVBQVVDLFNBQVYsRUFBcUI7QUFDcEMsU0FBTyxTQUFTQyxNQUFULENBQWlCQyxHQUFqQixFQUFzQkMsR0FBdEIsRUFBMkI7QUFDaEMsUUFBSUgsU0FBSixFQUFlO0FBQ2IsVUFBSUUsSUFBSUUsR0FBSixDQUFRQyxNQUFaLEVBQW9CO0FBQ2xCRixZQUFJRyxNQUFKLENBQVdKLElBQUlFLEdBQUosQ0FBUUcsVUFBbkIsRUFBK0JDLElBQS9CLENBQW9DTixJQUFJRSxHQUFKLENBQVFDLE1BQTVDO0FBQ0QsT0FGRCxNQUVPO0FBQ0xGLFlBQUlNLFVBQUosQ0FBZVAsSUFBSUUsR0FBSixDQUFRRyxVQUF2QjtBQUNEO0FBQ0YsS0FORCxNQU1PO0FBQ0xKLFVBQUlPLElBQUosQ0FBU1IsSUFBSUUsR0FBSixDQUFRRyxVQUFqQixFQUE2QkwsSUFBSUUsR0FBSixDQUFRQyxNQUFyQztBQUNEO0FBQ0YsR0FWRDtBQVdELENBWkQiLCJmaWxlIjoib3V0cHV0Rm4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpc0V4cHJlc3MpIHtcclxuICByZXR1cm4gZnVuY3Rpb24gb3V0cHV0IChyZXEsIHJlcykge1xyXG4gICAgaWYgKGlzRXhwcmVzcykge1xyXG4gICAgICBpZiAocmVxLmVybS5yZXN1bHQpIHtcclxuICAgICAgICByZXMuc3RhdHVzKHJlcS5lcm0uc3RhdHVzQ29kZSkuanNvbihyZXEuZXJtLnJlc3VsdClcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXMuc2VuZFN0YXR1cyhyZXEuZXJtLnN0YXR1c0NvZGUpXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJlcy5zZW5kKHJlcS5lcm0uc3RhdHVzQ29kZSwgcmVxLmVybS5yZXN1bHQpXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==
//# sourceMappingURL=outputFn.js.map