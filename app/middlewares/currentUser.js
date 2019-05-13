var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function (req, res, next) {

  if (req.jwt && req.jwt.payload && req.jwt.payload.id && req.jwt.valid) {
    User.findOne({_id: req.jwt.payload.id}).exec(function (err, user) {
      if (err) return next(err);
      if (user) {
        req.user = user.toObject();
        if (req.user.role && req.user.role.roleId) {
          var model = null;
          var criteria = {};
          if (req.user.role.globalRole) {
            criteria = {_id: req.user.role.roleId, status: true};
          } else {
            model = mongoose.model('Role');
            criteria = {_id: req.user.role.roleId};
          }
          model.findOne(criteria).exec(function (err, role) {
            if (err) return next(err);
            if (!role) {
              req.user.role.access = {};
            } else {
              req.user.role.access = role.toObject().accessSpecs;
            }
            next();
          });
        } else {
          next();
        }
      } else {

      }
    });
  } else {
    next();
  }
};
