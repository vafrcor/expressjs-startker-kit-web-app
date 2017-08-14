//# load ENV variables
require('dotenv').config();

//# start the express framework
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morganLogger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var cors = require('cors');
var RateLimit = require('express-rate-limit');

var monolog = require('monolog')
	, Logger = monolog.Logger
 	, StreamHandler = monolog.handler.StreamHandler;

var app = express();
var basicAuth = require('express-basic-auth');
var Twig = require('twig'), // Twig module
  twig = Twig.twig;

app.libs={};
app.libs._ = require('lodash');
app.libs.dd = require('dump-die');
app.libs.request = require('request');
app.libs.validator = require('js-validator-ext');
app.logger = new Logger('application');

app.logger.pushHandler(new StreamHandler('storages/logs/application.log',Logger.DEBUG));
app.debug = require('debug')('app:log');
app.debug.log = console.log.bind(console); // don't forget to bind to console!

app.config = require('config');

//# view engine setup
// This section is optional and used to configure twig. 
app.set("twig options", {
  strict_variables: false
});

app.set('views', path.join(__dirname, 'views'));

// app.set('view engine', 'jade');
app.set('view engine', 'twig');

//# uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));


//# API Rate Limit (reference: https://www.npmjs.com/package/express-rate-limit)
// only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc) 
app.enable('trust proxy'); 

var rateLimitConfig=app.config.get("api.rate_limit");

var apiLimiter = new RateLimit({
  windowMs: rateLimitConfig.window_in_minutes * 60 * 1000,
  max: rateLimitConfig.max_concurrency, // start blocking after total requests 
  delayAfter: rateLimitConfig.delay_after, // begin slowing down responses after the "n" request 
  delayMs: rateLimitConfig.delay_second * 1000, // slow down subsequent responses by "n" seconds per request 
  message: "Too many accounts created from this IP, please try again after "+rateLimitConfig.window_ms+" minutes."
});

//# apply middleware API limiter to requests that begin with /api/ 
app.use('/api/', apiLimiter);
app.use('/api/', function(req, res, next){
  req.app.temp={};
  req.app.temp.req_h_ua=req.headers.hasOwnProperty('user-agent')? req.headers['user-agent'] : 'unknown';
  if(process.env.APP_DEBUG_MODE === 'true'){
    // console.log('HTTP User-Agent: '+req.app.temp.req_h_ua);
  }
  next();
});

//# apply another middlewares
app.use(cors());
app.use(morganLogger('dev'));
app.use(bodyParser.text({type:'text/plain'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.raw());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//# maintenance gateway
var router = express.Router();
app.use(function (req, res, next) {
  // console.log('maintenance: '+req.app.config.get('maintenance'));
  if(req.app.config.get('maintenance')===true){
    res.status(503);
    res.send('Site was on maintenance status. Please connect later.');
  }else{
    next();
  }
});

//# protect API Docs
var apiAuthOptions={
  users: app.config.get('api.docs.users'),
  challenge: true,
  realm: app.config.get('application.name')
};

app.use('/api/docs', basicAuth(apiAuthOptions), function(req, res, next){
  next();
});

//# build routes
var routesDir='./routes/';
var routeFiles = fs.readdirSync(routesDir);

app.libs._.forEach(routeFiles, function(file){
  let length=file.length;
  let ext=file.slice((length - 3), length);
  let segment=file.slice(0, (length - 3));
  let rsegment=segment;
  if(rsegment=='index'){
    rsegment='';
  }
  app.use('/'+rsegment, require(routesDir+file));
});


//# catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//# error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  var showError=true;
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // console.log('Requrest URI: '+req.url);

  // render the error page
  res.status(err.status || 500);
  if(req.app.libs._.isUndefined(err.message) === false){
    req.app.logger.err('Error Status: '+err.status+' | Error Message: '+err.message);
    req.app.debug('Error Status: '+err.status+' | Error Message: '+err.message);
  }

  // res.render('error');
  if(showError){
    res.send('invalid request!');
  }else{
    next();
  }
});

module.exports = app;
