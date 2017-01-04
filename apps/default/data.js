'use strict';

var data = {
	links : {
		to_load : {
			
		},
		loaded : {
			
		},
	},
};

function _(azbn) {
	var log_name = 'app.data';
	
	var ctrl = {
		
	};
	
	ctrl.load = function() {
		data = JSON.parse(azbn.mdl('fs').readFileSync('./data.json', 'utf8'));
	}
	
	ctrl.save = function() {
		azbn.mdl('fs').writeFileSync('./data.json', JSON.stringify(data));
	};
	
	ctrl.linkToLoad = function(link, p) {
		if(azbn.is_def(data.links.loaded[link])) {
			
			
			
		} else if(azbn.is_def(data.links.to_load[link])) {
			
			
			
		} else {
			
			data.links.to_load[link] = p;
			
		}
	};
	
	ctrl.linkLoaded = function(link, p) {
		
		data.links.loaded[link] = p;
		
		if(azbn.is_def(data.links.to_load[link])) {
			delete data.links.to_load[link];
		}
		
	}
	
	ctrl.getLinkToload = function() {
		return data.links.to_load.shift();
	};
	
	ctrl.load();
	
	return ctrl;
};

module.exports = _;