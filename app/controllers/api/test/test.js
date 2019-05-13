module.exports = function (backendApp, router) {

    router.get('/tests', [backendApp.middlewares.isLoggedIn], function (req, res, next) {
        console.log("ok2");
        res.ok({info:"ok"})
    });

};
