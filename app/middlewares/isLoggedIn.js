var mongoose = require('mongoose');
var User = mongoose.model('User');
const config = require('../config/config');

module.exports = function (req, res, next) {
  if (req.jwt) {
      const jwt = require('jsonwebtoken');
      const protect = req.cookies['sid'] || req.jwt.token;
        console.log(req.cookies['sid']);
      if(!protect){
          return res.forbidden("forbidden12");
      }
      const connect = protect.split(" ");
      jwt.verify(connect[0], config.jwtSecret, (err,data)=>{
          if (err) {
              return res.serverError("Token error");
          }else{

              User.findOne({login: data.login })
                  .exec((err, info)=>{
                      if (err) return next(err);
                      if (!info) return res.forbidden("forbidden3");
                      req.user = info.toObject();
                      next()
                  });
          }
      });
  } else {
    res.status(401).send("Login is required");
  }
};
