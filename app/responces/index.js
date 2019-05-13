module.exports = function (req, res, next) {

  require("./ok")(req, res);
  require("./notFound")(req, res);
  require("./serverError")(req, res);
  require("./forbidden")(req, res);
  require("./badRequest")(req, res);
  next();

};
