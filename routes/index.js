var express = require('express');
require('express-group-routes');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index.twig', req.app.config.get('application'));
});

/* Group: Test page */
router.group("/test", (router) => {
	router.get('/', function(req, res, next){
		res.send('It Works!');
	});
});

module.exports = router;
