var ejs = require('ejs'),
  fs = require('fs');

var PhraseRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/phrase.ejs', 'utf-8');
  this.viewFieldTemplate = fs.readFileSync(__dirname + '/views/view/phrase.ejs', 'utf-8');

  this.render = function (next) {
    var self = this;
    next(null, ejs.render(self.fieldTemplate, {
      fieldConfig: fieldConfig,
    }));
  };

  this.renderViewForm = function (next) {
    var self = this;
    next(null, ejs.render(self.viewFieldTemplate, {
      fieldConfig: fieldConfig,
    }));
  };

  this.validate = function (formModel, next) {
    var self = this;
    if (!self.fieldConfig.isRequired)
      next(null, null);
    else if (self.fieldConfig.isRequired && formModel[self.fieldConfig.name]) {
      next(null, null);
    } else {
      var error = "error.i18n.This field is required";
      backendApp.services.TranslateService.translate(error, self.language, function (err, t) {
        if (err) return next(err);
        next(null, {
          field: self.fieldConfig.name,
          error: t
        });
      });
    }
  };

  this.renderSearchBlock = function (queryParams, next) {
    var fieldTemplate = fs.readFileSync(__dirname + '/views/search/textarea.ejs', 'utf-8');
    var html = ejs.render(fieldTemplate, {
      fieldConfig: fieldConfig,
      queryParams: queryParams
    });
    next(null, html);
  };


};

module.exports = PhraseRenderer;
