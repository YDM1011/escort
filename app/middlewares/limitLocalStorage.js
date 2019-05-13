module.exports = function (req, res, next) {

  var User = backendApp.mongoose.model("User");
  var LicenseService = require("../services/LicenseService");
  console.log(req.licenseLimits.storageCount)
  if (isNaN(parseFloat(req.licenseLimits.storageCount)) || (!isNaN(parseFloat(req.licenseLimits.storageCount)) && parseFloat(req.licenseLimits.storageCount) === 0)) {
    // unlimited storage
    return next();
  }
  LicenseService.calculateUsage(LicenseService.STORAGE_USAGE, function (err, usage) {
    if (err) {
      return next(err);
    }
    var limitSize = parseFloat(req.licenseLimits.storageCount) * 1024 * 1024 * 1024;
    console.log(usage.storage, limitSize, usage.storage/limitSize*100, (usage.storage + req.file.size)/limitSize*100, 'LIMITS');
    if (usage.storage/limitSize*100 < 90 && (usage.storage + req.file.size)/limitSize*100 > 90) {
      User.sendSpaceLeftMessage('freeSpaceLimitWarning', next);
      console.log('freeSpaceLIMTWarning send');
    } else if (req.file && (limitSize - usage.storage) < req.file.size) {
      console.log('freeSpaceENDWarning send');
      User.sendSpaceLeftMessage('freeSpaceEndError', function(err){
        console.log('freeSpaceEndError', err);
      });
      // error by size
      return res.serverError({
        name: "LicenseError",
        error: "error.i18n.Storage limit is reached"
      });
    } else {
      next();
    }
  })
};
