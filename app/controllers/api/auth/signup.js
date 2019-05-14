const md5 = require('md5');
const jwt = require('jsonwebtoken');
module.exports = (backendApp, router) => {

    const getToken = login =>{
        console.log(backendApp.config.jwtSecret)
        return jwt.sign({login: login}, backendApp.config.jwtSecret);
    };

    const signup = (req,res,next) => {
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
            $or:[
                {login: req.body.login},
                {email: req.body.login}
            ]
        }, (err, user) => {
            if (err) return res.serverError(err);
            if (user) return res.notFound("User with this login created");
            if (!user){
                req.body.token = getToken(req.body.login);
                req.body.pass = md5(req.body.pass);
                req.body.email = req.body.email ? req.body.email : req.body.login;
                User.create(req.body, (e,r)=>{
                    if (e) return res.serverError(e);
                    if (!r) return res.badRequest();
                    r.signin(req,res,backendApp)
                })
            }
        });
    };

    router.post('/signup', [], signup);
};
