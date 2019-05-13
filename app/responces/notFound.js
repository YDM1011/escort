module.exports = function (req, res) {
  res.notFound = function (data) {
    res.status(404).send(data);
  };
};
