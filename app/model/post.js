const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var CustomFieldValidator = require(__dirname + "/../lib/custom-fields-validator");

const schema = new Schema({
    createdBy: {itemId:{
            type: Schema.Types.ObjectId,
            ref: "User"
        }},
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
    strict: false,

});
// require("./model_methods/object/user")(user);
// schema.plugin(CustomFieldValidator, {});
const Post = mongoose.model('Post', schema);