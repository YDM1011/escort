const express = require('express');
const glob = require('glob');
const fs = require('fs');

const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const jwt = require('jwt-express');
const flash = require('connect-flash');

const init = (app, config) =>{

    app.set('views', 'views');
    app.set('view engine', 'ejs');

    app.use(logger('dev'));
    app.use(bodyParser.json({limit: '50mb', "strict": false,}));
    app.use(bodyParser.urlencoded({ extended: true, limit: '50mb'}));
    app.use(cookieParser());
    app.use(compress());
    app.use(flash());
    app.use(express.static(config.root + 'public'));
    app.use('/upload', express.static(config.root + 'upload'));
    app.use(methodOverride());
    app.use(function (req, res, next) {
        if (req.query.accessToken) {
            req.headers.authorization = "Bearer " + req.query.accessToken;
        }
        next();
    });
    app.use(jwt.init(config.jwtSecret, {
        cookies: false
    }));

    app.use(function (req, res, next) {
        /** Params for cookie auth form angular 7 */
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Origin', req.headers.origin || config.site.domain || '*');
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookies, Cookie, Content-Length, PortalRequest, X-Requested-With');
        //intercepts OPTIONS method
        if ('OPTIONS' === req.method) {
            //respond with 200
            res.send();
        }
        else {
            //move on
            next();
        }
    });
    app.use(require("../../app/responces"));
    let backendApp = {
        app: app,
        config: config,
        mongoose: mongoose,
        express: express
    };
    global.backendApp = backendApp;
    backendApp.middlewares = require('../middlewares')(backendApp, config);
    backendApp.customEndPoints = [];
    require('../controllers')(backendApp);
    require('./mongooseRestApi')(backendApp);



// catch 404 and forward to error handler
    app.use((req, res, next) => {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

// error handler
    app.use((err, req, res, next) => {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });

    return app;
};


module.exports = init;