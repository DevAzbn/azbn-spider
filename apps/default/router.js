'use strict';

function _(azbn) {
	var log_name = 'app.router';
	
	var _period = 333;
	
	var ctrl = {
		
	};
	
	ctrl.addToQueue = function(link) {
		
		//azbn.mdl('fs').appendFileSync('./tmp/links.txt', link + "\n");
		
		//azbn.mdl('sqlite').run("INSERT INTO links VALUES(NULL, '" + link + "')");
		//.writeFileSync
		
		azbn.mdl('nedb.links').findOne({ url : link }, function (err, doc) {
			
			if(err) {
				
				azbn.echo(err);
				
			} else if(doc != null && typeof doc != 'undefined') {
				
				//azbn.echo(doc);
				
			} else {
				
				var m = azbn.now();
				
				azbn.mdl('nedb.links').insert({
					created_at : m,
					created_at_str : azbn.formattime(m),
					loaded : 0,
					is404 : 0,
					url : link,
				}, function (_err, _doc) {
					
					if(_err) {
						
						azbn.echo(_err);
						
					}
					
					/*
					else if(!_doc.is404) {
						
						azbn.mdl('app.router').parseAdr(link, _doc._id);
						
					}
					*/
					
				});
				
			}
			
		});
		
	};
	
	ctrl.analLink = function(href, link) {
		
		//azbn.mdl('codestream.anal_links')
		//	.add(function(next){
				
				var href_p = azbn.mdl('url').parse(href);
				
				var link_p = azbn.mdl('url').parse(link);
				
				if(href.length == 0) {
					
					// пустая ссылка
					
					
					
				} else if(href_p.protocol == 'http:' || href_p.protocol == 'https:') { // } else if(href.indexOf('http://') > -1 || href.indexOf('https://') > -1) {
					
					// найдены абсолютные пути с указанием протокола
					
					if((href_p.hostname == link_p.hostname) || (('www.' + href_p.hostname) == link_p.hostname) || (href_p.hostname == ('www.' + link_p.hostname))) {
						
						//azbn.echo(href_p.pathname);
						
						azbn.mdl('app.router').addToQueue(href);
						
						//azbn.echo(url.path);
						
					}
					
				} else if(href[0] == '/' && href[1] != '/') {
					
					// найден абсолютный путь на сайте
					
					//azbn.echo(href);
					
					azbn.mdl('app.router').addToQueue(link_p.protocol + '//' + link_p.host + href);
					
				} else if(href[0] == '/' && href[1] == '/') {
					
					// найден абсолютный путь без протокола
					
					//azbn.echo(href);
					
					azbn.mdl('app.router').addToQueue(link_p.protocol + href);
					
				} else if(href[0] == '#') {
					
					// ссылка-якорь
					
					//azbn.echo(href);
					
					
					
				} else if(href_p.protocol == 'callto:' || href_p.protocol == 'mailto:' || href_p.protocol == 'skype:' || href_p.protocol == 'tel:' ) {
					
					// не http-протоколы
					
				} else {
					
					// найден путь к файлу в той же папке
					
					if(link_p.pathname[link_p.pathname.length - 1] == '/') {
						
						azbn.mdl('app.router').addToQueue(link_p.protocol + '//' + link_p.host + link_p.pathname + href);
						
					} else {
						
						var _dir = azbn.mdl('path').dirname(link_p.pathname);
						
						if(_dir.length > 1) {
							
						} else {
							
							_dir = '';
							
						}
						
						azbn.mdl('app.router').addToQueue(link_p.protocol + '//' + link_p.host + _dir + '/' + href);
						
					}
					
				}
				
		//		next();
		//		
		//	}, 32)
		//;
		
	};
	
	ctrl.parseAdr = function(link, uid) {
		
		azbn.mdl('codestream.find_links')
			.add(function(next){
				
				//azbn.mdl('nedb.links').update({ url : link }, { $set : { loaded : 1 } }, { multi: true }, function (err, numReplaced) {
				//	
				//	if(err) {
				//		
				//		azbn.echo(err);
				//		
				//	}
					
					var link_p = azbn.mdl('url').parse(link);
					
					//azbn.echo(JSON.stringify(link_p));
					
					azbn.mdl('webclient').r('GET', link, {}, function(err, response, html){
						
						if(err){
							
							azbn.echo(err);
							
							return;
							
						}
						
						//azbn.echo(response.headers['content-type'].toLowerCase());
						
						if(response.statusCode == 200 && response.headers['content-type'].toLowerCase().indexOf('text/html') > -1) {
							
							azbn.echo(link);
							
							azbn.mdl('fs').writeFileSync(azbn.mdl('cfg').app.dir + '/loaded/' + uid + '.html', html);
							
							var $ = azbn.mdl('webclient').parse(html);
							
							/*
							$('a').each(function(index){
								
								var href = $(this).attr('href') || '';
								
								href = '' + href;
								
								href = href.toLowerCase();
								//console.log(href);
								
								azbn.mdl('app.router').analLink(href, link);
								
							});
							*/
							
							var _a = [];
							
							$('a').each(function(index){
								
								var href = $(this).attr('href') || '';
								
								href = '' + href;
								
								href = href.toLowerCase();
								
								_a.push(href);
								
							});
							
							_a.reduce(function(prevValue, item, index, arr){
								
								azbn.mdl('app.router').analLink(item, link);
								
							}, null);
							
						} else if(response.statusCode == 404) {
							
							azbn.mdl('nedb.links').update({ url : link }, { $set : { is404 : 1 } }, { multi: true }, function (_err, numReplaced) {
								
								if(_err) {
									
									azbn.echo(_err);
									
								}
								
							});
							
						}
						
					});
					
				//});
				
				next();
				
			}, _period)
		;
		
	};
	
	ctrl.parseRootAdr = function(link, uid) {
		
		azbn.mdl('app.router').parseAdr(link, uid);
		
		ctrl.parseInterval = setInterval(function(){
			
			ctrl.parseNextAdr();
			
		}, _period);
		
	}
	
	ctrl.parseNextAdr = function() {
		
		//azbn.mdl('fs').appendFileSync('./tmp/links.txt', link + "\n");
		
		//azbn.mdl('sqlite').run("INSERT INTO links VALUES(NULL, '" + link + "')");
		//.writeFileSync
		
		azbn.mdl('nedb.links').findOne({ loaded : 0, is404 : 0, }, function (err, doc) {
			
			if(err) {
				
				azbn.echo(err);
				
			} else if(doc != null && typeof doc != 'undefined') {
				
				azbn.mdl('nedb.links').update({ url : doc.url }, { $set : { loaded : 1 } }, { multi: true }, function (err, numReplaced) {});
				
				azbn.echo('Waiting ... ' + doc.url);
				
				azbn.mdl('app.router').parseAdr(doc.url, doc._id);
				
			}
			
		});
		
	};
	
	return ctrl;
};

module.exports = _;