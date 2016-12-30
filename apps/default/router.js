'use strict';

function _(azbn) {
	var log_name = 'app.router';
	
	var ctrl = {
		
	};
	
	ctrl.addToQueue = function(link) {
		
		azbn.mdl('fs').appendFileSync('./links.txt', link + "\n");
		
	};
	
	ctrl.parseAdr = function(link) {
		
		azbn.mdl('codestream.find_links')
			.add(function(next){
				
				var link_p = azbn.mdl('url').parse(link);
				
				//azbn.echo(JSON.stringify(link_p));
				azbn.echo(link);
				
				azbn.mdl('webclient').r('GET', link, {}, function(err, response, html){
					
					if(err){
						
						azbn.echo(err);
						
						return;
						
					}
					
					var $ = azbn.mdl('webclient').parse(html);
					
					$('a').each(function(index){
						
						var href = $(this).attr('href') || '';
						
						href = '' + href;
						
						href = href.toLowerCase();
						//console.log(href);
						
						var href_p = azbn.mdl('url').parse(href);
						
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
						
					});
					
				});
				
				next();
				
			}, 3000)
		;
		
	};
	
	return ctrl;
};

module.exports = _;