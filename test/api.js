//# During the test the env variable is set to test
// process.env.NODE_ENV = 'test';

//# Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../bin/www');
let should = chai.should();
let baseAPISegment= '/api/v1';
let fakeUserAgent= 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:54.0) Gecko/20100101 Firefox/54.0';
chai.use(chaiHttp);

// Our parent block
describe('API', () => {
	/*
  beforeEach((done) => { //Before each test we empty the database
		// do something here    
	});
	*/

	/*
	 * Test the /GET routes
	 */
	describe('/GET Test API Page', () => {
		it('it should GET "It works!" result', (done) => {
	   	chai.request(server)
	    	.get(`${baseAPISegment}/`)
	    	.set('User-Agent', fakeUserAgent)
	    	.end((err, res) => {
	       	res.should.have.status(200);
	   		});
	 	});
	});
});