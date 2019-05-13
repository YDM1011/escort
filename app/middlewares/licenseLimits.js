module.exports = function (req, res, next) {

  var LicenseService = require("../services/LicenseService");
  LicenseService.getCurrentLicenseData(function (err, data) {
    if (err) {
      return next(err);
    }
    req.licenseLimits = LicenseService.mergeLimits(data.licenses);
    req.applicationLicense = data.appPackage;
    req.applicationSettings = {};
    if (data.account) {
      req.applicationSettings.logoFileId = data.account.logoFileId;
      req.applicationSettings.name = data.account.customName || 'RocketChief';
      req.applicationSettings.customStyles = data.account.customStyles;
      req.applicationSettings.customScriptUserFooter = data.account.customScriptUserFooter;
    }
    req.activeLicensesCount = data.licenses.length;
    next();
  });

};
