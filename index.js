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
		url_mask : false,
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
cfg.param.url = argv.url || cfg.param.url;
cfg.app.interval = parseInt(argv.interval) || cfg.app.interval;
cfg.app.url_mask = argv.url_mask ? new RegExp('(' + argv.url_mask + ')', 'ig') : false;

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

azbn.mdl('app.router').parseRootAdr(cfg.param.url, 'index');

/* --------- /Код здесь --------- */

//azbn.event('eval_script', azbn);