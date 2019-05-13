var ejs = require('ejs'),
  fs = require('fs'),
  async = require("async");

var ImageRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/image.ejs', 'utf-8');

  this.render = function (next) {
    var self = this;
    var hasPreview = self.fieldConfig.options && self.fieldConfig.options.preview ? self.fieldConfig.options.preview : false;
    var hasCrop = self.fieldConfig.options && self.fieldConfig.options.crop ? self.fieldConfig.options.crop : false;
    next(null, ejs.render(self.fieldTemplate, {
      fieldConfig: self.fieldConfig,
      hasPreview: hasPreview,
      hasCrop: hasCrop
    }));
  };

  this.viewFieldTemplate = fs.readFileSync(__dirname + '/views/view/image.ejs', 'utf-8');
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
        else if (self.fieldConfig.isRequired && typeof formModel[self.fieldConfig.name] !== "undefined" && (formModel[self.fieldConfig.name].tempFile || formModel[self.fieldConfig.name].saved)) {
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
    var imageData = modelData._doc[this.fieldConfig.name];
    var model = backendApp.mongoose.model(this.fieldConfig.module);
    var TempFile = backendApp.mongoose.model("TempFile");
    if (!imageData || !imageData.tempFile) {
      return next();
    }
    var setData = {};
    setData[this.fieldConfig.name] = {tempFile: null};
    setData[this.fieldConfig.name] = {saved: imageData.tempFile};
    if (imageData.croppedImage) {
      setData[this.fieldConfig.name].croppedImage = imageData.croppedImage;
    }

    model.findByIdAndUpdate(modelData._id, {$set: setData}, function (err, updated) {
      if (err) return next(err);
      TempFile.findOneAndRemove({_id: imageData.tempFile._id}).exec(function () {
        modelData.set(self.fieldConfig.name, setData);
        next();
      });
    })
  };

  this.renderView = function (formModel, next) {
    var self = this;
    if (typeof formModel[this.fieldConfig.name] === "undefined" || !formModel[this.fieldConfig.name].saved) {
      return next(null, "");
    }
    var params = {
      module: self.fieldConfig.module,
      field: self.fieldConfig.name,
      itemId: formModel._id,
    };
    var imageUrl = backendApp.config.site.domain + "/api/uploadedImage/" + backendApp.services.SecurityService.generateToken(params);
    var imgTag = "<img src='" + imageUrl + "' style='width: 100%; height: auto;'>";
    return next(null, imgTag);
  };

};

module.exports = ImageRenderer;
