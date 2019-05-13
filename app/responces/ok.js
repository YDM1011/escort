module.exports = function (req, res) {
  console.log("asdasd")
  res.ok = function (data) {
    res.status(200).send(data);
  };
};
