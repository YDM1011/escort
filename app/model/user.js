const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    login: {type: String, unique: true, required: [true, "Login must be created"]},
    pass: {type: String, required: [true, "Password must be created"]},
    firstName: {type: String},
    lastName: {type: String},
    email: String,
    token: String,
    data: {type: Date, default: new Date()}
},{
    toJSON: {
        transform: function (doc, ret) {
            delete ret.pass;
            delete ret.token;
        }
    },
    toObject: {
        transform: function (doc, ret) {
            delete ret.pass;
            delete ret.token;
        }
    },
    preRead: (doc,ret)=> {
        console.log("gg")
    },
    createRestApi: true,
    strict: true,

});
require("./model_methods/object/user")(user);

const User = mongoose.model('User', user);
const glob = require('glob');
const preUpdate = (req,res,next)=>{
    require("../responces/ok")(req, res);
    require("../responces/notFound")(req, res);
    require("../responces/badRequest")(req, res);
    delete req.body.mobile;
    delete req.body.pass;
    delete req.body.token;
    delete req.body.hash;
    mongoose.model('User')
        .findOneAndUpdate({_id: req.userId}, req.body)
        .select('-pass -token -_id -hashLink')
        .exec((err, info) => {
            if(err) return res.badRequest(err);
            if(!info) return res.notFound('You are not valid');
            return res.ok(info)
        });
};
const oth = (req,res)=>{
    User.count({}, function(err, c) {
        if(err) return res.badRequest(err);
        if(!c) return res.notFound("");
        res.ok({count: c})
    });
};
const preRead = (req,res,next)=>{
    require("../responces/ok")(req, res);
    require("../responces/notFound")(req, res);
    require("../responces/badRequest")(req, res);
    if (req.query.populate || req.params || req.query.select){
        return next();
    }else
    if (!req.query.query){
        mongoose.model('User')
            .find({})
            .where({verify: true})
            .select('-pass -token -login -hashLink')
            .populate({path:'photo'})
            .populate({path:'bg'})
            .exec((err, info) => {
                if(err) return res.badRequest('Something broke!');
                if(!info) return res.notFound('You are not valid');
                return res.ok(info)
            });
    }else if(req.query.query){
        let id = (JSON.parse(req.query.query)._id);
        mongoose.model('User')
            .findOne({_id: id})
            .where({verify: true})
            .select('-pass -token -login -hashLink')
            .populate({path:'photo'})
            .populate({path:'bg'})
            .exec((err, info) => {
                if(err) return res.badRequest('Something broke!');
                if(!info) return res.notFound('You are not valid');
                return res.ok(info)
            });
    }
};

//
// glob.restify.serve(
//     glob.route,
//     mongoose.model('User'),
//     {
//         preUpdate: [glob.jsonParser, glob.cookieParser, glob.isProfile, preUpdate],
//         preRead: [glob.jsonParser, glob.cookieParser, preRead],
//         outputFn: async (req, res) => {
//             const result = [];
//             const statusCode = req.erm.statusCode;
//             if (req.erm.result.length > 0){
//                 req.erm.result.forEach( (item)=>{
//                     delete item.pass;
//                     delete item.token;
//                     delete item.hash;
//                     if (item.login != 'admin'){
//                         result.push(item)
//                     }
//                 });
//                 return await res.status(statusCode).json(result)
//             }else{
//                 return await res.status(statusCode).json(req.erm.result)
//             }
//
//
//
//         }
//     });