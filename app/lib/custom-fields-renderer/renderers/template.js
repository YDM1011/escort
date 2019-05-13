var ejs = require('ejs'),
  fs = require('fs');

var TemplateRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.render = function (next) {
    var self = this;
    fs.readFile(__dirname + '/partials/' + self.fieldConfig.module + '/_' + self.fieldConfig.name + '.html', 'utf-8', function (err, content) {
      if (err) return next(err);
      next(null, ejs.render(content, {
        fieldConfig: self.fieldConfig
      }))
    });
  };

  this.renderViewForm = function (next) {
    var self = this;
    fs.readFile(__dirname + '/partials/view/' + self.fieldConfig.module + '/_' + self.fieldConfig.name + '.html', 'utf-8', function (err, content) {
      if (err) return next(err);
      next(null, ejs.render(content, {
        fieldConfig: self.fieldConfig
      }))
    });
  };

  this.validate = function (formModel, next) {
    var self = this;
    next(null, null);
  };


};

module.exports = TemplateRenderer;
