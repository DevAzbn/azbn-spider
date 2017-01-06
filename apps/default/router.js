'use strict';

var data = {
	links : {
		queue : [],
		queue_status : {
			
		},
		loaded : {
			
		},
		error : {
			403 : [],
			404 : [],
			500 : [],
			501 : [],
			502 : [],
			503 : [],
			504 : [],
		},
		redirect : {
			301 : [],
			302 : [],
		},
	},
	structure : {},
};

function _(azbn) {
	var log_name = 'app.router';
	
	var counter = 0;
	var counter_url_max = 0;
	
	var ctrl = {
		
	};
	
	
	
	ctrl.addToQueue = function(link, uid) {
		
		if(azbn.is_def(data.links.loaded[link])) {
			
		} else if(azbn.is_def(data.links.queue_status[link])) {
			
		} else {
			
			var m = azbn.now();
			
			var p = {
				_id : uid || (Math.random().toString(36).split('.'))[1],
				created_at : m,
				url : link,
			};
			
			data.links.queue.push(p);
			
			data.links.queue_status[link] = true;
			
			azbn.echo_dev('Add to queue: ' + link, log_name);
			
		}
		
	};
	
	
	
	ctrl.analLink = function(href, link) {
		
		var href_p = azbn.mdl('url').parse(href);
		
		var link_p = azbn.mdl('url').parse(link);
		
		if(href.length == 0) {
			
			// пустая ссылка
			
			
			
		} else if(href_p.protocol == 'http:' || href_p.protocol == 'https:') { // } else if(href.indexOf('http://') > -1 || href.indexOf('https://') > -1) {
			
			// найдены абсолютные пути с указанием протокола
			
			if((href_p.hostname == link_p.hostname) || (('www.' + href_p.hostname) == link_p.hostname) || (href_p.hostname == ('www.' + link_p.hostname))) {
				
				//azbn.echo(href_p.pathname, log_name);
				
				azbn.mdl('app.router').addToQueue(href);
				
				//azbn.echo(url.path, log_name);
				
			}
		
		} else if(href[0] == '/' && href[1] != '/') {
			
			// найден абсолютный путь на сайте
			
			//azbn.echo(href, log_name);
			
			azbn.mdl('app.router').addToQueue(link_p.protocol + '//' + link_p.host + href);
			
		} else if(href[0] == '/' && href[1] == '/') {
			
			// найден абсолютный путь без протокола
			
			//azbn.echo(href, log_name);
			
			azbn.mdl('app.router').addToQueue(link_p.protocol + href);
			
		} else if(href[0] == '#') {
			
			// ссылка-якорь
			
			//azbn.echo(href, log_name);
			
			
			
		} else if(href_p.protocol == 'callto:' || href_p.protocol == 'mailto:' || href_p.protocol == 'skype:' || href_p.protocol == 'tel:' || href_p.protocol == 'javascript:') {
			
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
		
	};
	
	
	
	ctrl.parseAdr = function(link, uid) {
		
		azbn.mdl('codestream.find_links')
			.add(function(next){
					
					//var link_p = azbn.mdl('url').parse(link);
					
					azbn.mdl('webclient').r('GET', link, {}, function(err, response, html){
						
						if(err){
							
							azbn.echo(err, log_name);
							
							return;
							
						} else {
							
							counter++;
							
							switch(response.statusCode) {
								
								case 200 : {
									
									if(response.headers['content-type'].toLowerCase().indexOf('text/html') > -1) {
										
										azbn.echo('Loading (' + counter + '): ' + link, log_name);
										
										azbn.mdl('fs').writeFileSync(azbn.mdl('cfg').app.dir + '/loaded/' + uid + '.html', html);
										
										var $ = azbn.mdl('webclient').parse(html);
										
										var _a = [];
										var __a = {};
										
										$('a').each(function(index){
											
											var href = $(this).attr('href') || '';
											
											href = '' + href;
											
											href = href.toLowerCase();
											
											//_a.push(href);
											
											if(azbn.mdl('cfg').app.url_mask == false) {
												
												__a[href]++;
												
											} else {
												
												if(href.search(azbn.mdl('cfg').app.url_mask) > -1) {
													
													__a[href]++;
													
												} else {
													
												}
												
											}
											
										});
										
										for(var i in __a) {
											_a.push(i);
										}
										
										azbn.echo_dev('[On page ' + link + ' finded ' + _a.length + ' links]', log_name);
										
										_a.reduce(function(prevValue, item, index, arr){
											
											azbn.mdl('app.router').analLink(item, link);
											
										}, null);
										
										var m = azbn.now();
										
										data.links.loaded[link] = {
											_id : uid,
											created_at : m,
											created_at_str : azbn.formattime(m),
											url : link,
										};
										
										azbn.mdl('nedb.links').insert(data.links.loaded[link], function(_err, _doc){
											
										});
										
									} else {
										
										azbn.echo('Not HTML (' + counter + '): ' + link, log_name);
										
									}
									
								}
								break;
								
								case 403 :
								case 404 :
								case 500 :
								case 501 :
								case 503 :
								case 504 : {
									
									azbn.echo('Error ' + response.statusCode + ' (' + counter + '): ' + link, log_name);
									
									data.links.error[response.statusCode].push(link);
									
								}
								break;
								
								case 301 :
								case 302 : {
									
									azbn.echo('Redirect ' + response.statusCode + ' (' + counter + '): ' + link, log_name);
									
									data.links.redirect[response.statusCode].push(link);
									
								}
								break;
								
								default : {
									
								}
								break;
								
							}
							
							//azbn.mdl('fs').writeFileSync(azbn.mdl('cfg').app.dir + '/data.json', JSON.stringify(data));
							
							counter_url_max++;
							
							azbn.mdl('app.router').parseNextAdr();
							
						}
						
					});
					
				//});
				
				next();
				
			}, azbn.mdl('cfg').app.interval)
		;
		
	};
	
	
	
	ctrl.parseRootAdr = function(link, _id) {
		
		azbn.mdl('app.router').addToQueue(link, _id);
		
		azbn.mdl('app.router').parseNextAdr();
		
	};
	
	
	
	ctrl.parseNextAdr = function() {
		
		if((data.links.queue.length > 0) && (counter_url_max < azbn.mdl('cfg').app.url_max)) {
			
			var doc = data.links.queue.shift();
			
			data.links.queue_status[doc.url] = true;
			
			azbn.mdl('app.router').parseAdr(doc.url, doc._id);
			
		} else {
			
			azbn.echo_dev('Finish link-queue', log_name);
			
			for(var i in data.links.loaded) {
				
				var link_p = azbn.mdl('url').parse(data.links.loaded[i].url);
				
				var path = link_p.pathname;
				var path_arr = path.split('/');
				
				var __path
				
				if(data.structure[link_p.host]) {
					
				} else {
					
					data.structure[link_p.host] = {
						'/' : {},
					};
					
				}
				
				__path = data.structure[link_p.host]['/'];
				
				for(var j = 1; j < path_arr.length; j++) {
					
					var __item = path_arr[j];
					
					if(__item == '') {
						
						//__path = data.links.loaded[i];
						__path._id = data.links.loaded[i]._id;
						
					} else {
						
						//azbn.echo(JSON.stringify(__path));
						
						if(__path[__item]) {
							
						} else {
							
							__path[__item] = {};
							
						}
						
						if(j == (path_arr.length - 1)) {
							
							__path[__item]._id = data.links.loaded[i]._id;
							
						}
						
					}
					
					__path = __path[__item];
					
				}
				
			}
			
			azbn.mdl('fs').writeFileSync(azbn.mdl('cfg').app.dir + '/data.json', JSON.stringify(data));
			
			azbn.echo_dev('Saved result to file', log_name);
			
		}
		
	};
	
	
	
	return ctrl;
	
};

module.exports = _;