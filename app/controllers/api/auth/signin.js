const md5 = require('md5');
module.exports = (backendApp, router) => {

    const signin = (req,res,next) => {

        var User = backendApp.mongoose.model("User");
        var errors = {};
        if (!req.body.login) {
            errors.login = "Login is required";
        }
        if (!req.body.pass) {
            errors.password = "Password is required";
        }
        if (Object.keys(errors).length > 0) {
            return res.badRequest(errors);
        }
        User.findOne({
            $and:[{
                $or:[
                    {login: req.body.login},
                    {email: req.body.login}
                ]
            },{pass:md5(req.body.pass)}],
        }).exec(function (err, user) {
            if (err) return res.serverError(err);
            if (!user) return res.notFound("User not found");
            user.signin(req,res,backendApp)
        });
    };

    router.post('/signin', [], signin);
};
