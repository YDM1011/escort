
module.exports = function (req, res) {
  res.badRequest = function (data) {
      res.status(400).send(data);
  };
};
