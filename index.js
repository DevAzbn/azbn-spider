'use strict';

var
	request = require('request'),
	cheerio = require('cheerio')
;

var url = 'http://www.infoorel.ru/';

request(url, function(err, res, body) {
	
	if(err){
		console.log(err);
	}
	
	var $ = cheerio.load(body);
	
	$('a').each(function(index){
		var href = $(this).attr('href') || '';
		
		href = '' + href;
		
		href = href.toLowerCase();
		//console.log(href);
		
		if(href.length == 0) {
			
		} else if(href.indexOf('http://') > -1 || href.indexOf('https://') > -1) {
			
			console.log(href);
			
		} else if(href[0] == '/') {
			
			//console.log(href);
			
		} else if(href[0] == '#') {
			
			//console.log(href);
			
		} else {
			
		}
		
	});
	
})