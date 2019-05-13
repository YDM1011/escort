module.exports = function (req, res) {
  res.forbidden = function (data) {
    res.status(403).send(data);
  };
};
