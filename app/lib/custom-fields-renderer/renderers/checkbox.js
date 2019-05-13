var ejs = require('ejs'),
  fs = require('fs');

var CheckboxRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/checkbox.ejs', 'utf-8');

  this.render = function (next) {
    var self = this;
    next(null, ejs.render(self.fieldTemplate, {
      fieldConfig: fieldConfig,
    }));
  };

  this.validate = function (formModel, next) {
    var self = this;
    next(null, null);
  };

  this.viewFieldTemplate = fs.readFileSync(__dirname + '/views/view/phrase.ejs', 'utf-8');
  this.renderViewForm = function (next) {
    var self = this;
    next(null, ejs.render(self.viewFieldTemplate, {
      fieldConfig: fieldConfig,
    }));
  };

  this.renderView = function (formModel, next) {
    var self = this;
    var valueLabel = "token.Off";
    if (formModel[self.fieldConfig.name]) {
      valueLabel = "token.switcher.On";
    }

    backendApp.services.TranslateService.translate(valueLabel, self.language, function (err, translatedLabel) {
      next(err, translatedLabel);
    });
  };

  this.renderSearchBlock = function (queryParams, next) {
    var fieldTemplate = fs.readFileSync(__dirname + '/views/search/checkbox.ejs', 'utf-8');
    var html = ejs.render(fieldTemplate, {
      fieldConfig: fieldConfig,
      isInitField: queryParams.initFields && queryParams.initFields instanceof Array && queryParams.initFields.indexOf(fieldConfig.name) > -1,
      queryParams: queryParams
    });
    next(null, html);
  };

  this.renderContactWishBlock = function (next) {
    var fieldTemplate = fs.readFileSync(__dirname + '/views/contactWishes/checkbox.ejs', 'utf-8');
    var html = ejs.render(fieldTemplate, {
      fieldConfig: fieldConfig,
    });
    next(null, html);
  };

  this.renderContactWishViewBlock = function (contact, returnAsHtml, next) {
    var self = this;
    var fieldTemplate = fs.readFileSync(__dirname + '/views/contactWishes/viewCheckbox.ejs', 'utf-8');
    var wishItems = [];
    var returnBlock = function (value) {
      if (returnAsHtml) {
        next(null, ejs.render(fieldTemplate, {
          fieldConfig: fieldConfig,
          value: value
        }));
      } else {
        next(null, {
          fieldConfig: fieldConfig,
          value: value
        });
      }
    };
    var value = "token.Off";
    if (contact.productWishes && contact.productWishes[self.fieldConfig.name] && contact.productWishes[self.fieldConfig.name].value) {
      value = "token.switcher.On";
    }
    backendApp.services.TranslateService.translate(value, self.language, function (err, translatedLabel) {
      returnBlock(translatedLabel);
    });
  };
};

module.exports = CheckboxRenderer;
