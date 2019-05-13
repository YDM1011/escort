const glob = require('glob');
const cors = require('cors');

module.exports = function (backendApp) {

  let apiControllers = glob.sync(backendApp.config.root+'/controllers/api/**/*.js');


  const originsWhitelist = [
      '*',
      'http://localhost:3000',
      'http://www.piligrim-test.top',
      'http://www.piligrim-test.top:3000',
  ];
  const corsOptions = {
      origin:originsWhitelist,
      credentials:true
  };

  backendApp.app.use('/', cors(corsOptions));

  const apiRouter = backendApp.express.Router();
  backendApp.app.use('/', apiRouter);

  apiControllers.forEach((controller) => {
    require(controller)(backendApp, apiRouter);
  });
};
