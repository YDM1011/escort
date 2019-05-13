module.exports = function (req, res) {
  res.ok = function (data) {
    res.status(200).send(data);
  };
};
