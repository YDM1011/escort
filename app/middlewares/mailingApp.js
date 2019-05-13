module.exports = function (req, res, next) {
  if (!req.query.index) {
    return res.status(400).send('Please provide email configs');
  }

  var Setting = backendApp.mongoose.model("Setting");

  Setting.getMergedList(function (err, list) {
    if (err) return res.serverError(err);
    if (!list.crm || !list.crm.integrations || !list.crm.integrations.mailAccounts || !list.crm.integrations.mailAccounts.connected) {
      return res.ok([]);
    }
    var accounts = [];
    if (req.user.integrations && req.user.integrations.mailAccount && req.user.integrations.mailAccount.connected) {
      accounts.push({
        isOwn: true,
        data: req.user.integrations.mailAccount
      });
    }
    if (list.crm.integrations.mailAccounts.groupAccounts instanceof Array && list.crm.integrations.mailAccounts.allowGroupAccounts) {
      var allowedGroupAccounts = list.crm.integrations.mailAccounts.groupAccounts.filter(function (account) {

        if (account.enableFor === 'all') {
          return true;
        } else if (account.enableFor === 'positions' && account.positions instanceof Array && req.user.position &&
          req.user.position.positionId && account.positions.indexOf(req.user.position.positionId) > -1) {
          return true;
        } else if (account.enableFor === 'users' && account.users instanceof Array &&
          account.users.indexOf(req.user._id.toString()) > -1) {
          return true;
        } else {
          return false;
        }
      });
      if (allowedGroupAccounts.length > 0) {
        accounts = accounts.concat(allowedGroupAccounts);
      }
    }

    if (accounts[req.query.index]) {
      var Services = new (require(backendApp.config.root + '/app/lib/mail'));
      var MailService = Services.getInstance(accounts[req.query.index].data.googleIntegration ? 'googleMail' : 'imapSmtpMail');
      req.mailService = MailService;

      MailService.getOauth2Client(accounts[req.query.index], req.user._id, function (err, data) {
        req.mailing = data;
        return next(err);
      });
    } else {
      res.status(404).send('Emails config not found');
    }
  });
};
