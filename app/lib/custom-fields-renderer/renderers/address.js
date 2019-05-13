var ejs = require('ejs'),
  fs = require('fs');

var AddressRenderer = function (fieldConfig, language) {

  this.fieldConfig = fieldConfig;
  this.language = language;

  this.fieldTemplate = fs.readFileSync(__dirname + '/views/address.ejs', 'utf-8');

  this.render = function (next) {
    var self = this;
    var Setting = backendApp.mongoose.model("Setting");
    var RootCountry = rootMongoConnection.model("RootCountry");
    Setting.getMergedList(function (err, list) {
      if (err) return next(err);
      var default_language = list.crm.general ? list.crm.general.default_language : "";
      next(null, ejs.render(self.fieldTemplate, {
        fieldConfig: self.fieldConfig,
        default_language: default_language,
      }));
    });
  };

  this.viewFieldTemplate = fs.readFileSync(__dirname + '/views/view/phrase.ejs', 'utf-8');
  this.renderViewForm = function (next) {
    var self = this;
    next(null, ejs.render(self.viewFieldTemplate, {
      fieldConfig: fieldConfig,
    }));
  };

  this.validate = function (formModel, next) {
    var self = this;
    next(null, null);
  };


  this.renderView = function (formModel, next) {
    var self = this;
    if (typeof formModel[self.fieldConfig.name] !== "undefined") {
      var Setting = backendApp.mongoose.model("Setting");
      Setting.getMergedList(function (err, list) {
        if (err) return next(err);
        var default_language = list.crm.general ? list.crm.general.default_language : "";
        var countryCode = formModel[self.fieldConfig.name].country || null;
        var street = formModel[self.fieldConfig.name].street || null;
        var state = formModel[self.fieldConfig.name].state || null;
        var city = formModel[self.fieldConfig.name].city || null;
        var zip = formModel[self.fieldConfig.name].zip || null;
        var countryName = null;
        var generateAddressString = function () {
          var addressItems = [];
          if (street) addressItems.push(street);
          if (city) addressItems.push(city);
          if (state && default_language !== 'fr') addressItems.push(state);
          if (countryName) addressItems.push(countryName);
          if (zip) addressItems.push(zip);
          next(null, addressItems.join(', '));
        };
        if (countryCode) {
          var RootCountry = rootMongoConnection.model("RootCountry");
          RootCountry.findOne({code: countryCode}).exec(function (err, country) {
            if (err) return next(err);
            if (!country) {
              countryName = countryCode;
              generateAddressString();
            } else {
              var countryObj = country.toObject();
              if (countryObj.name[self.language]) {
                countryName = countryObj.name[self.language];
              } else if (countryObj.name['en']) {
                countryName = countryObj.name['en'];
              } else {
                countryName = countryCode;
              }
              generateAddressString();
            }
          });
        } else {
          generateAddressString();
        }
      });
    } else {
      next(null, "");
    }
  };

};

module.exports = AddressRenderer;
