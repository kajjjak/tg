
/*
	Uses PouchDB changes feed to update the map
	Fetch only changes on jobs (and personel)
	Security:
		If there is no security issue with access to changes feed to a database then this can be used
		Need access to changes
		No write access required

{
	"doctype": "job",
	"location": [0,0],
	"time": 1424219775643,
	"client_alias": null,
}
*/

var iconCreate = L.icon({
    iconUrl: getCompanyDatabasePath() + '/gui/marker-icon-create.png',
    iconRetinaUrl: getCompanyDatabasePath() + '/gui/marker-icon-2x-create.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getCompanyDatabasePath() + '/gui/marker-shadow.png',
    shadowRetinaUrl: getCompanyDatabasePath() + '/gui/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconAssign = L.icon({
    iconUrl: getCompanyDatabasePath() + '/gui/marker-icon-assign.png',
    iconRetinaUrl: getCompanyDatabasePath() + '/gui/marker-icon-2x-assign.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getCompanyDatabasePath() + '/gui/marker-shadow.png',
    shadowRetinaUrl: getCompanyDatabasePath() + '/gui/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconWaiting = L.icon({
    iconUrl: getCompanyDatabasePath() + '/gui/marker-icon-waiting.png',
    iconRetinaUrl: getCompanyDatabasePath() + '/gui/marker-icon-2x-waiting.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getCompanyDatabasePath() + '/gui/marker-shadow.png',
    shadowRetinaUrl: getCompanyDatabasePath() + '/gui/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconDriving = L.icon({
    iconUrl: getCompanyDatabasePath() + '/gui/marker-icon-driving.png',
    iconRetinaUrl: getCompanyDatabasePath() + '/gui/marker-icon-2x-driving.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getCompanyDatabasePath() + '/gui/marker-shadow.png',
    shadowRetinaUrl: getCompanyDatabasePath() + '/gui/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconComplete = L.icon({
    iconUrl: getCompanyDatabasePath() + '/gui/marker-icon-complete.png',
    iconRetinaUrl: getCompanyDatabasePath() + '/gui/marker-icon-2x-complete.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getCompanyDatabasePath() + '/gui/marker-shadow.png',
    shadowRetinaUrl: getCompanyDatabasePath() + '/gui/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});


function GatewayTracker (dbid, map, callback_changes, callback_onerror, callback_location, options) {
	// updates defined map and its markers
    this.dbid = dbid;
    var map = map;
    var callback_changes = callback_changes;
    var callback_onerror = callback_onerror;
    var callback_location = callback_location;
    var callback_updated = null;
	var markers = {};
	var options = options || {};
	var filter_markers = null;
	var jobs = [];

	this.getMarkers = function(){
		return markers;		
	}

	this.init = function(_options){
		_options = _options || {update: false, cacheonly: true};
		// fetch current state
		callback_updated = options.callback_updated;
		$.extend(options, _options)
		this._fetchState(options);
	}

	this.start = function(options){
		options = options || {update: false};
		// fetch current state
		callback_updated = options.callback_updated;
		this._fetchState(options);
		// get changes
		this._track();
	}

	this.stop = function(){
		if(this._changes){this._changes.cancel();}
	}

	this.getJobs = function(){
		return jobs;
	}

	this._fetchState = function(options){
		var url = getCompanyDatabasePath() + (options.path_view || "/_design/list/_view/jobs");
		$.getJSON(url, function(res){
			jobs = res.rows;
			for(var i in jobs){
				if(isFiltered(jobs[i].value) && (!options.cacheonly)){
					if(callback_changes){
						callback_changes(jobs[i].value, !options.update);
					}
					try{
						setMapChanged(jobs[i].value);
					}catch(e){}
				}
			}
			if(callback_updated){
				callback_updated();
			}							
		});
	};

	this._track = function(){
		var self = this;
		this.dbinst = new PouchDB(getCompanyDatabasePath());
		this._changes = this.dbinst.changes({
		  since: 'now',
		  include_docs: true,
		  live: true
		}).on('change', function(change) {
			// we get 
			// {"seq":4,"id":"a11b32e4b11b4d3272f5d9df62003ac9","changes":[{"rev":"3-a6e46ba86c10a7c19abf0860174cb322"}],"doc":{"_id":"a11b32e4b11b4d3272f5d9df62003ac9","_rev":"3-a6e46ba86c10a7c19abf0860174cb322","doctype":"job","location":[-64,-21.12312313],"time":1424219775643,"client_alias":null}}
			//console.info("Change " + JSON.stringify(change));
			var filter = self.getFiltered();
			if ($.inArray(change.id, filter) == -1){ return; }
			try{
				setMapChanged(change.doc);
			}catch(e){
				if(callback_onerror){
					callback_onerror(e);
				}
			}
			if(callback_changes){
				callback_changes(change.doc);
			}
		});
	}

	function handleMarkerClick (marker){
		console.info("Selected job: " + marker.id);
		if(callback_location){
			callback_location(marker);
		}
	}

	function setMapChanged(doc){
		// update the map markers (creating them if they do not exist then applying state)
		// marker name is id
		console.info("Map changed: " + JSON.stringify(doc));
		var marker_id = doc._id || doc.id;
		if(doc.location){
			if(!markers[marker_id]){ // missing marker create one
				try{
					markers[marker_id] = L.marker(doc.location, {icon: getStateIcon(doc)}).addTo(window.map);
					markers[marker_id].id = marker_id;
					markers[marker_id].on("click", function(e){
						handleMarkerClick(markers[marker_id]);
					});
				}catch(e){
					throw {"error": 12313, "message": "Could not create marker " + marker_id, "details": JSON.stringify(e)};
				}
			}else{
				markers[marker_id].setIcon(getStateIcon(doc))
			}
			markers[marker_id].doc = doc;
			return markers[marker_id];
		}
	}
	this.setMapChanged = setMapChanged;

	this.setFilterMarkers = function(id, b){
		if(!filter_markers){ filter_markers = {}; }
		filter_markers[id] = b;
	}

	this.clearFilterMarkers = function(){
		filter_markers = null;
	}

	function isFiltered (doc){
		if(!filter_markers){ return true; }
		return filter_markers[doc._id];
	}

	this.getFiltered = function(){
		if(filter_markers){
			return Object.keys(filter_markers);
		}
		return undefined;
	}

	function getStateIcon(doc){
		var selected_icon = "assign"; //red
		if(!doc.driver){ doc.driver = {};}
		if(!doc.client){ doc.client = {};}
		if(doc.driver.assigned_ts && doc.driver.assigned_id){
			selected_icon = "waiting"; //orange
		}
		if(doc.driver.arrived_ts || doc.client.arrived_ts){
			selected_icon = "driving"; //green
		}
		if(doc.driver.complete_ts || doc.client.complete_ts){
			selected_icon = "completed"; //white
		}
		if(doc.client.canceled_ts){
			selected_icon = "canceled"; //black, remove
		}
		var icons={"assign": iconAssign, "waiting": iconWaiting, "driving": iconDriving, "completed": iconComplete, "canceled": iconAssign};
		return icons[selected_icon];
	}

	this.getStateIcon = getStateIcon;
}
