var ejs = require('ejs'),
  fs = require('fs'),
  async = require("async");

var MultiFileRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/multiattachment.ejs', 'utf-8');

  this.render = function (next) {
    var self = this;
    var Setting = backendApp.mongoose.model("Setting");
    Setting.getMergedList(function (err, list) {
      if (err) return next(err);

      next(null, ejs.render(self.fieldTemplate, {
        fieldConfig: self.fieldConfig,
      }));
    });
  };

  this.viewFieldTemplate = fs.readFileSync(__dirname + '/views/view/multiattachment.ejs', 'utf-8');
  this.renderViewForm = function (next) {
    var self = this;
    next(null, ejs.render(self.viewFieldTemplate, {
      fieldConfig: fieldConfig,
    }));
  };

  this.validate = function (formModel, next) {
    var self = this;
    async.parallel({
      validateRequire: function (cb) {
        if (!self.fieldConfig.isRequired)
          cb(null, null);
        else if (self.fieldConfig.isRequired && typeof formModel[self.fieldConfig.name] !== "undefined" && (formModel[self.fieldConfig.name].tempFiles && formModel[self.fieldConfig.name].tempFiles.length || formModel[self.fieldConfig.name].saved && formModel[self.fieldConfig.name].saved.length)) {
          cb(null, null);
        } else {
          var error = "error.i18n.This field is required";
          backendApp.services.TranslateService.translate(error, self.language, function (err, t) {
            if (err) return cb(err);
            cb(null, {
              field: self.fieldConfig.name,
              error: t
            });
          });
        }
      }
    }, function (err, results) {
      if (err) return next(err);
      var resultKeys = Object.keys(results);
      var resultError = null;
      resultKeys.forEach(function (key) {
        if (results[key] !== null && resultError === null) {
          resultError = results[key];
        }
      });
      next(null, resultError);
    });
  };


  this.afterSave = function (modelData, next) {
    var self = this;
    var files = modelData._doc[this.fieldConfig.name];
    var model = backendApp.mongoose.model(this.fieldConfig.module);
    var TempFile = backendApp.mongoose.model("TempFile");
    if (!files || !files.tempFiles) {
      return next();
    }
    var setData = {};
    var pushData = {};
    var updateData = {};
    if (modelData._doc[this.fieldConfig.name] !== undefined && modelData._doc[this.fieldConfig.name].saved !== undefined) {
      setData[this.fieldConfig.name] = {tempFiles: []};
      setData[this.fieldConfig.name] = {saved: modelData._doc[this.fieldConfig.name].saved.concat(files.tempFiles)};
      updateData = {$set: setData};
    } else {
      setData[this.fieldConfig.name] = {tempFiles: []};
      setData[this.fieldConfig.name] = {saved: files.tempFiles};
      updateData = {$set: setData};
    }

    model.findByIdAndUpdate(modelData._id, updateData, function (err, updated) {
      if (err) return next(err);
      modelData.set(self.fieldConfig.name, setData[self.fieldConfig.name]);
      async.forEach(files.tempFiles, function (file, cb) {
        TempFile.findOneAndRemove({_id: file._id}).exec(function () {
          cb();
        });
      }, function () {
        next();
      })
    })
  };

  this.renderView = function (formModel, next) {
    var self = this;
    if (typeof formModel[this.fieldConfig.name] !== "undefined" && Object.prototype.toString.call(formModel[self.fieldConfig.name].saved) === '[object Array]' && formModel[self.fieldConfig.name].saved.length > 0) {
      var fileLinks = formModel[self.fieldConfig.name].saved.map(function (savedFile) {
        var params = {
          fd: savedFile.fd,
          name: savedFile.fileName,
          type: savedFile.type
        };
        var linkUrl = backendApp.config.site.domain + "/api/uploadedFile/" + backendApp.services.SecurityService.generateToken(params);
        var linkTag = "<a class='rc-table__link-file' href='" + linkUrl + "'></a>";
        return linkTag;
      });
      return next(null, fileLinks.join(", "));
    } else {
      return next(null, "");
    }
  };
};

module.exports = MultiFileRenderer;
