module.exports = function (schema) {

  schema.methods.signin = function (req,res,backendApp) {
      res.cookie('sid',this.token,
          {
              domain: backendApp.config.site.sidDomain,
              path:"/",
              maxAge: 0,
              httpOnly: true
          });
      res.cookie('useriId', String(this._id),
          {
              domain: backendApp.config.site.sidDomain,
              path:"/",
              maxAge: 0,
              httpOnly: false
          });
      res.ok({sid:this.token,userId:this._id, user: this.toObject()})
  };
/*
  schema.methods.pictureUrl = function () {
    var self = this;
    var picture = this.picture;
    return new Promise(function (resolve, reject) {
      if (picture && picture.croppedImage) {
        var base64Data = picture.croppedImage.replace(/^data:image\/png;base64,/, "");
        require("fs").writeFile(backendApp.config.root + "/upload/user_" + self.id + ".png", base64Data, 'base64', function (err) {
          resolve(backendApp.config.site.domain + "/img/user_no_image.png");
        });
      }
      return resolve(backendApp.config.site.domain + "/upload/user_" + self.id + ".png");
    });
  };

  schema.methods.userSalutation = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
      if (self.salutation) {
        var RootSalutation = rootMongoConnection.model('RootSalutation');
        RootSalutation.findOne({_id: self.salutation}).exec(function (err, salutation) {
          if (err || !salutation) return resolve("");
          var s = salutation.toObject();
          if (self.language && s.translates) {
            resolve(s.translates[self.language] || s.name);
          } else {
            var Setting = backendApp.mongoose.model("Setting");
            Setting.getMergedList(function (err, list) {
              if (err) return resolve(s.name);
              if (s.translates && list.crm.general && list.crm.general.default_language) {
                resolve(s.translates[list.crm.general.default_language] || s.name);
              } else {
                resolve(s.name);
              }
            });
          }
        });
      } else {
        resolve("");
      }
    })
  };

  schema.methods.userPosition = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
      if (self.position && self.position.positionId && !self.position.name) {
        var RootStaffPosition = rootMongoConnection.model('RootStaffPosition');
        RootStaffPosition.findOne({_id: self.position.positionId}).exec(function (err, position) {
          if (err || !position) return resolve("");
          var p = position.toObject();
          if (self.language) {
            resolve(position.translates[self.language] || position.name);
          } else {
            var Setting = backendApp.mongoose.model("Setting");
            Setting.getMergedList(function (err, list) {
              if (err) return resolve(position.name);
              if (list.crm.general && list.crm.general.default_language) {
                resolve(position.translates[list.crm.general.default_language] || position.name);
              } else {
                resolve(position.name);
              }
            });
          }
        });
      } else if (self.position.name) {
        resolve(self.position.name);
      } else {
        resolve("");
      }
    })
  };


  schema.methods.resetPasswordUrl = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
      resolve(backendApp.config.site.baseUrl + backendApp.config.site.resetPasswordUrl + self.restorePasswordHash);
    })
  };

  schema.methods.setPasswordUrl = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
      resolve(backendApp.config.site.baseUrl + backendApp.config.site.setPasswordUrl + self.restorePasswordHash);
    })
  };

  schema.methods.sendWelcomeEmail = function () {
    var self = this;
    self.model(self.constructor.modelName).findOne({_id: self._id}).exec(function (err, latestUser) {
      if (!err) {
        backendApp.services.EmailService.sendTemplateEmail(
          "userNewAccount",
          latestUser.language,
          latestUser.email,
          [latestUser],
          [],
          function () {
          }
        )
      }
    });
  };

  schema.methods.verifyCode = function () {
    var self = this;
    var token = speakeasy.hotp({
      secret: self.twoFactorLoginHash,
      encoding: 'base32',
      counter: 1
    });
    return token;
  };

  schema.methods.validateVerifyCode = function (code) {
    var self = this;
    var tokenValidates = speakeasy.hotp.verify({
      secret: self.twoFactorLoginHash,
      encoding: 'base32',
      token: code,
      counter: 1
    });
    return tokenValidates;
  };

  schema.methods.sendTwoFactorLoginEmail = function (next) {
    var self = this;
    backendApp.services.EmailService.sendTemplateEmail(
      "userTwoFactorAuthentificationCode",
      backendApp.config.defaultLanguage,
      self.email,
      [self],
      [],
      next
    );
  };
  */
};
