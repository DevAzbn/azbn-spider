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
		interval : 400,
		
		url : 'http://azbn.ru/',
		url_mask : false,
		url_max : 10240,
		url_get_list : '',
		//url_post_list : '',
	},
};

var argv = require('optimist').argv;

var azbn = require(cfg.path.azbnode + '/azbnode');

// включение режима разработки
azbn.isDev(argv.dev || 1);

azbn.load('azbnodeevents', new require(cfg.path.azbnode + '/azbnodeevents')(azbn));
azbn.load('webclient', new require(cfg.path.azbnode + '/azbnodewebclient')(azbn));

azbn.load('codestream.find_links', new require(cfg.path.azbnode + '/azbnodecodestream')(azbn));
//azbn.load('codestream.queue_links', new require(cfg.path.azbnode + '/azbnodecodestream')(azbn));

azbn.event('loaded_azbnode', azbn);

azbn.load('fs', require('fs'));
//azbn.load('querystring', require('querystring'));
azbn.load('path', require('path'));
azbn.load('url', require('url'));

//парсинг параметров командной строки
//azbn.parseArgv();
//azbn.event('parsed_argv', azbn);

cfg.app.dir = cfg.path.apps + '/' + (argv.app || cfg.app.dir);

if(argv.url) {
	
	cfg.app.url = argv.url || cfg.app.url;
	
} else if(argv.url_get_list) {
	
	cfg.app.url_get_list = argv.url_get_list || cfg.app.url_get_list;
	
} else {
	
	cfg.app.url = argv.url || cfg.app.url;
	
}



cfg.app.interval = parseInt(argv.interval) || cfg.app.interval;
cfg.app.url_mask = argv.url_mask ? new RegExp('(' + argv.url_mask + ')', 'ig') : false;
cfg.app.url_max = argv.url_max ? parseInt(argv.url_max) : cfg.app.url_max;

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

azbn.mdl('nedb.links').remove({}, { multi: true }, function (err, numRemoved) {});

if(azbn.mdl('cfg').app.url_get_list && azbn.mdl('cfg').app.url_get_list != '') {
	
	var urls = azbn.mdl('fs').readFileSync(azbn.mdl('cfg').app.url_get_list, 'utf8').toString().split('\n');
	
	for(var i in urls) {
		
		if(urls[i] != '') {
			azbn.mdl('app.router').addToQueue(urls[i].replace('\r', ''));
		}
		
	}
	
	azbn.mdl('app.router').parseNextAdr();
	
} else {
	
	azbn.mdl('app.router').parseRootAdr(cfg.app.url, 'index');
	
}

azbn.echo_dev('end of index.js');

/* --------- /Код здесь --------- */

//azbn.event('eval_script', azbn);