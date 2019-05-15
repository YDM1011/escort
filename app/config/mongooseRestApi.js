
module.exports = function (backendApp) {

    // const restify = require('express-restify-mongoose');
    var restify = require('../lib/express-restify-mongoose/lib/express-restify-mongoose');
    var modelNames = backendApp.mongoose.modelNames();
    modelNames.forEach(function (modelName) {
        var model = backendApp.mongoose.model(modelName);
        if (model.schema.options.createRestApi) {
            var router = backendApp.express.Router();
            console.log(modelName);
            restify.serve(router, model, {
                prefix: "",
                version: "",
                runValidators: true,
                totalCountHeader: true,
                lean: false,
                findOneAndUpdate: true,
                findOneAndRemove: true,
                postRead: model.schema.options.postRead || function (req, res, next) {
                    next(null);
                },
                // preRead: (req,res,next)=>{preRead(model,req,res,next)},
                // for access rights control
                // preMiddleware: backendApp.middlewares.isLoggedIn,
                preRead: preRead,
                preCreate: backendApp.middlewares.isLoggedIn,
                preUpdate: backendApp.middlewares.isLoggedIn,
                preDelete: backendApp.middlewares.isLoggedIn,
                // preCustomLink: backendApp.middlewares.isLoggedIn
            });
            backendApp.app.use("/api", router);
        }
    });
};

const preRead = (req,res,next) => {
    if (req.query.skip){
        req.query.skip = req.query.skip * req.query.limit;
        next()
    }else{
        next()
    }

};