var express = require('express');
require('express-group-routes');
var router = express.Router();
var routeCache = require('route-cache');

/* GET API Docs. */
router.get('/docs', function(req, res, next) {
	var fs=require('fs');
	fs.readFile('./public/swagger-ui/index.html', 'utf8', function (err,data) {
	  if (err) {
	   	console.log(err);
	   	res.status(404);
	   	res.send('404 - Not Found');
	  }else{
	  	res.set('Content-Type', 'text/html');
	  	res.send(data);
	  }
	});
	// res.send('API Docs!');
});

router.get('/docs/swagger.json', function(req, res, next) {
	var fs=require('fs');
	var filePath='./public/swagger-ui/specifications';
	switch(process.env.NODE_ENV){
		case 'uat':
			filePath+='/swagger-uat.json';
			break;
		case 'production':
			filePath+='/swagger-production.json';
			break;
		default:
			// development-environment
			filePath+='/swagger.json';
			break;
	}

	fs.readFile(filePath, 'utf8', function (err,data) {
	  if (err) {
	    console.log(err);
	   	res.status(404);
	   	res.send('404 - Not Found');
	  }else{
	  	res.set('Content-Type', 'application/json');
	  	res.send(data);
	  }
	});
});

/* Group: API V1 */
router.group("/v1", (router) => {
	router.get('/', function(req, res, next) {
		res.send('it works!');
	});
});


module.exports = router;
