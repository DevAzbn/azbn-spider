/*
запросы http(s) AzbNode
*/

var request = require('request').defaults({
		headers: {
			
			'User-Agent' : 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36 AzbNodeEdition',
			
			//'proxy' : 'http://localproxy.com',
			//'rejectUnauthorized' : false,
		},
	}),
	cheerio = require('cheerio')
	;

function AzbNodeWebClient(azbn) {
	//this.name = 'AzbNodeWebClient';
	var log_name = 'AzbNodeWebClient';
	
	//azbn.echo('Created', this.name);
	/*
	data = {
		formData : formData,
		headers: {
			'User-Agent': 'request'
		},
	}
	*/
	
	var ctrl = this;
	
	ctrl.r = function(method, url, data, cb){
		data.method = method;
		data.url = url;
		request(data, cb);
	};
	
	/*
	ctrl.get = function(url, data, cb){
		data.url = url;
		request.get(data, cb);
	};
	ctrl.head = function(url, data, cb){
		data.url = url;
		request.head(data, cb);
	};
	ctrl.post = function(url, data, cb){
		data.url = url;
		request.post(data, cb);
	};
	ctrl.put = function(url, data, cb){
		data.url = url;
		request.put(data, cb);
	};
	ctrl.delete = function(url, data, cb){
		data.url = url;
		request.delete(data, cb);
	};
	*/
	
	ctrl.parse = function(html) {
		return cheerio.load(html, {
			normalizeWhitespace : true,
			//xmlMode : true,
		});
	};
	ctrl.selfAPI = function(url, data, cb){
		url = 'https://localhost:' + azbn.mdl('cfg').express.sport + url;
		//request.post(data, cb);
		ctrl.r('GET', url, data, cb);
	};
	
	return ctrl;
}

module.exports = AzbNodeWebClient;