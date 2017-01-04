'use strict';
/*
Примерный файл подключения AzbNode
*/
var cfg = {
	path : {
		azbnode : './azbnode',
		apps : './apps',
	},
	app : {
		dir : 'default',
	},
	param : {
		url : 'http://www.infoorel.ru/',
	},
};

var argv = require('optimist').argv;

var azbn = require(cfg.path.azbnode + '/azbnode');

azbn.load('azbnodeevents', new require(cfg.path.azbnode + '/azbnodeevents')(azbn));
azbn.load('webclient', new require(cfg.path.azbnode + '/azbnodewebclient')(azbn));
azbn.load('codestream.find_links', new require(cfg.path.azbnode + '/azbnodecodestream')(azbn));
azbn.load('codestream.queue_links', new require(cfg.path.azbnode + '/azbnodecodestream')(azbn));

azbn.event('loaded_azbnode', azbn);

azbn.load('fs', require('fs'));
//azbn.load('querystring', require('querystring'));
azbn.load('path', require('path'));
azbn.load('url', require('url'));

//парсинг параметров командной строки
//azbn.parseArgv();
//azbn.event('parsed_argv', azbn);

cfg.app.dir = cfg.path.apps + '/' + (argv.app || cfg.app.dir);
cfg.param.url = argv.url || cfg.param.url;

azbn.load('app.router', new require(cfg.app.dir + '/router')(azbn));

var NeDB = require('nedb');
azbn.load('nedb.links', new NeDB({
	filename : cfg.app.dir + '/links.nedb.json',
	//autoload : true,
}));
azbn.mdl('nedb.links').loadDatabase();
azbn.mdl('nedb.links').ensureIndex({
	fieldName : 'url',
	unique : true,
	//sparse : false,
});

azbn.load('cfg', cfg);

azbn.event('loaded_mdls', azbn);

/* --------- Код здесь --------- */

//azbn.mdl('fs').writeFileSync('./tmp/links.txt', '');

azbn.mdl('nedb.links').remove({}, { multi: true }, function (err, numRemoved) {});

azbn.mdl('app.router').parseRootAdr(cfg.param.url, 'index');


/*
azbn.mdl('codestream.find_links')
	.add(function(next){
		
		var root_adr = 'http://www.infoorel.ru/';
		var root_url = azbn.mdl('url').parse(root_adr);
		
		azbn.mdl('webclient').r('GET', 'http://www.infoorel.ru/', {}, function(err, response, html){
			
			if(err){
				azbn.echo(err);
			}
			
			var $ = azbn.mdl('webclient').parse(html);
			
			$('a').each(function(index){
				
				var href = $(this).attr('href') || '';
				
				href = '' + href;
				
				href = href.toLowerCase();
				//console.log(href);
				
				var url = azbn.mdl('url').parse(href);
				
				if(href.length == 0) {
					
				} else if(href.indexOf('http://') > -1 || href.indexOf('https://') > -1) {
					
					if((url.hostname == root_url.hostname) || (('www.' + url.hostname) == root_url.hostname) || (url.hostname == ('www.' + root_url.hostname))) {
						
						azbn.echo(url.path);
						
						//azbn.echo(url.pathname);
						
					}
					
				} else if(href[0] == '/') {
					
					//azbn.echo(href);
					
				} else if(href[0] == '#') {
					
					//azbn.echo(href);
					
				} else {
					
					
					
				}
				
			});
			
		});
		
		next();
	}, 5000)
;
*/

/* --------- /Код здесь --------- */

//azbn.event('eval_script', azbn);