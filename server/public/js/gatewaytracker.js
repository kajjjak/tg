
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
    iconUrl: getMediaSourceURL() + 'marker-icon-create.png',
    iconRetinaUrl: getMediaSourceURL() + 'marker-icon-2x-create.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowRetinaUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconAssign = L.icon({
    iconUrl: getMediaSourceURL() + 'marker-icon-assign.png',
    iconRetinaUrl: getMediaSourceURL() + 'marker-icon-2x-assign.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowRetinaUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconWaiting = L.icon({
    iconUrl: getMediaSourceURL() + 'marker-icon-waiting.png',
    iconRetinaUrl: getMediaSourceURL() + 'marker-icon-2x-waiting.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowRetinaUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconDriving = L.icon({
    iconUrl: getMediaSourceURL() + 'marker-icon-driving.png',
    iconRetinaUrl: getMediaSourceURL() + 'marker-icon-2x-driving.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowRetinaUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconComplete = L.icon({
    iconUrl: getMediaSourceURL() + 'marker-icon-complete.png',
    iconRetinaUrl: getMediaSourceURL() + 'marker-icon-2x-complete.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowRetinaUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconCanceled = L.icon({
    iconUrl: getMediaSourceURL() + 'marker-icon-canceled.png',
    iconRetinaUrl: getMediaSourceURL() + 'marker-icon-2x-canceled.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowRetinaUrl: getMediaSourceURL() + 'marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconDriver = L.icon({
    iconUrl: getMediaSourceURL() + 'marker-icon-driver.png',
    iconRetinaUrl: getMediaSourceURL() + 'marker-icon-2x-driver.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: getMediaSourceURL() + 'marker-shadow-driver.png',
    shadowRetinaUrl: getMediaSourceURL() + 'marker-shadow-driver.png',
    shadowSize: [46, 41],
    shadowAnchor: [10, 41]
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
	var options = options || {	};
	var filter_markers = {};
	var filter_users = {};

	this.getMarkers = function(){
		return markers;		
	}

	this.start = function(opts){
		$.extend(options, opts || {update: false});
		// fetch current state
		if(options.callback_updated){
			callback_updated = options.callback_updated;
		}
		this._fetchState(options);
		// get changes
		this._track();
	}

	this.stop = function(){
		this._changes.cancel();
	}

	this._fetchState = function(){
		var url = getCompanyDatabasePath() + (options.path_view || "/_design/jobs/_view/active");
		$.getJSON(url, function(res){
			var rows = res.rows;
			for(var i in rows){
				if(isFiltered(rows[i].value)){
					setMapChanged(rows[i].value);
					if(callback_changes){
						callback_changes(rows[i].value);
					}					
				}

			}
			if(callback_updated){
				callback_updated();
			}										
		});
	};

	this._track = function(){
		this.dbinst = new PouchDB(getCompanyDatabasePath());
		this._changes = this.dbinst.changes({
		  since: 'now',
		  include_docs: true,
		  doc_ids: getFiltered(),//options.doc_ids,
		  live: true
		}).on('change', function(change) {
			// we get 
			// {"seq":4,"id":"a11b32e4b11b4d3272f5d9df62003ac9","changes":[{"rev":"3-a6e46ba86c10a7c19abf0860174cb322"}],"doc":{"_id":"a11b32e4b11b4d3272f5d9df62003ac9","_rev":"3-a6e46ba86c10a7c19abf0860174cb322","doctype":"job","location":[-64,-21.12312313],"time":1424219775643,"client_alias":null}}
			//console.info("Change " + JSON.stringify(change));
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
			/*
			if(!doc.driver){ doc.driver = {};}
			if(doc.driver.id){ 
				console.info("WHOOHOHOOOOO got driver id "+doc.driver.arrives_id+", new we need to save it and restart the tracker !!!!!! ");
			}
			*/
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
				markers[marker_id].setIcon(getStateIcon(doc));
				markers[marker_id].setLatLng(doc.location);
			}
			markers[marker_id].doc = doc;
			if(doc.doctype == "driver"){
				var driver_timeoutmax = 10;
				var driver_sinceupdate = ((new Date().getTime()) - doc.client_ts)/(1000*60);
				var driver_opacity = Math.max(0, (1 - (driver_sinceupdate/driver_timeoutmax)));
				console.info("Minutes since driver update " + driver_sinceupdate);
				markers[marker_id].setOpacity(driver_opacity);
			}
			return markers[marker_id];
		}
	}

	this.setMapChanged = setMapChanged;

	this.setFilterUser = function(id, b, restart){
		if(!filter_users){ filter_users = {}; }
		filter_users[id] = b;
		if(restart){
			this.stop();
			this.start();
		}				
	}

	this.setFilterMarkers = function(id, b, restart){
		if(!filter_markers){ filter_markers = {}; }
		filter_markers[id] = b;
		if(restart){
			this.stop();
			this.start();
		}
	}

	this.clearFilterMarkers = function(){
		filter_markers = {};
	}

	function isFiltered (doc){
		return true;
	}

	function getFiltered(){
		var filter = Object.keys(filter_markers)
		if(filter.length){
			return filter;
		}
		return undefined;
	}

	function getStateIcon(doc){
		var selected_icon = "assign"; //red
		if(!doc.driver){ doc.driver = {};}
		if(!doc.client){ doc.client = {};}
		if(doc.doctype == "driver"){
			selected_icon = "driver"; //driver icon
		}
		if(doc.driver.assigned_ts && doc.driver.assigned_id){
			selected_icon = "waiting"; //orange
		}
		if(doc.driver.arrived_ts || doc.client.arrived_ts){
			selected_icon = "driving"; //green
		}
		if(doc.driver.complete_ts || doc.client.complete_ts){
			selected_icon = "completed"; //white
			setMarkerHidden(doc, 10000);
		}
		if(doc.client.canceled_ts){
			selected_icon = "canceled"; //black, remove
			setMarkerHidden(doc, 30000);
		}
		var icons={"assign": iconAssign, "waiting": iconWaiting, "driving": iconDriving, "completed": iconComplete, "canceled": iconCanceled, "driver": iconDriver};
		return icons[selected_icon];
	}

	function setMarkerHidden(doc, ms){
		setTimeout(function(){
			window.map.removeLayer(markers[doc._id]);
		}, ms);
	}
}
