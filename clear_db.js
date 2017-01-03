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
};

var argv = require('optimist').argv;

var azbn = require(cfg.path.azbnode + '/azbnode');

azbn.load('azbnodeevents', new require(cfg.path.azbnode + '/azbnodeevents')(azbn));

azbn.event('loaded_azbnode', azbn);

cfg.app.dir = cfg.path.apps + '/' + (argv.app || cfg.app.dir);

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

azbn.mdl('nedb.links').remove({is404 : 1}, { multi: true }, function (err, numRemoved) {});

azbn.event('loaded_mdls', azbn);

azbn.event('eval_script', azbn);