const fs = require('fs');
module.exports = function (backendApp, router) {

    router.post('/', [], function (req, res, next) {
        console.log("ok2");
        console.log(req.headers);
        console.log(req.body);
        let filePath = `upload/test`;
        fs.writeFile(filePath, (req.body), function(err) {
            if (err) { console.log(err) }
            res.send('ok').status(200)
        });
    });

};
const convertation = b64string =>{
    let buf;
    if (typeof Buffer.from === "function") {
        buf = Buffer.from(b64string, 'base64'); // Ta-da
    } else {
        buf = new Buffer(b64string, 'base64'); // Ta-da
    }
    return buf;
};