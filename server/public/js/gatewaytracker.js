
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
    iconUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-create.png',
    iconRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-2x-create.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconAssign = L.icon({
    iconUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-assign.png',
    iconRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-2x-assign.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconWaiting = L.icon({
    iconUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-waiting.png',
    iconRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-2x-waiting.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconDriving = L.icon({
    iconUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-driving.png',
    iconRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-2x-driving.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconComplete = L.icon({
    iconUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-complete.png',
    iconRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-2x-complete.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconCanceled = L.icon({
    iconUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-canceled.png',
    iconRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-2x-canceled.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
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
	var markers = {};
	var options = options || {};
	var filter_markers = null;

	this.getMarkers = function(){
		return markers;		
	}

	this.start = function(){
		// fetch current state
		this._fetchState();
		// get changes
		this._track();
	}

	this.stop = function(){
		this._changes.cancel();
	}

	this._fetchState = function(){
		var url = "http://db00.taxigateway.com/" + this.dbid + "" + (options.path_view || "/_design/list/_view/jobs");
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
		});
	};

	this._track = function(){
		this.dbinst = new PouchDB('http://db00.taxigateway.com/'+this.dbid);
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
		if(doc.location){
			if(!markers[doc._id]){ // missing marker create one
				try{
					var marker_id = doc._id;
					markers[doc._id] = L.marker(doc.location, {icon: getStateIcon(doc)}).addTo(window.map);
					markers[doc._id].id = doc._id;
					markers[doc._id].on("click", function(e){
						handleMarkerClick(markers[marker_id]);
					});
				}catch(e){
					debugger;
					console.error("Map changed error " + e);
					//throw {"error": 12313, "message": "Could not create marker " + doc._id, "details": e};
				}
			}else{
				markers[doc._id].setIcon(getStateIcon(doc))
			}
			markers[doc._id].doc = doc;
		}
	}

	this.setFilterMarkers = function(id, b){
		if(!filter_markers){ filter_markers = {}; }
		filter_markers[id] = b;
	}

	this.clearFilterMarkers = function(){
		filter_markers = {};
	}

	function isFiltered (doc){
		if(!filter_markers){ return true; }
		return filter_markers[doc._id];
	}

	function getFiltered(){
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
			setMarkerHidden(doc, 10000);
		}
		if(doc.client.canceled_ts){
			selected_icon = "canceled"; //black, remove
			setMarkerHidden(doc, 30000);
		}
		var icons={"assign": iconAssign, "waiting": iconWaiting, "driving": iconDriving, "completed": iconComplete, "canceled": iconCanceled};
		return icons[selected_icon];
	}

	function setMarkerHidden(doc, ms){
		setTimeout(function(){
			window.map.removeLayer(markers[doc._id]);
		}, ms);
	}
}


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


var iconCreate = L.icon({
    iconUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-create.png',
    iconRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-2x-create.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconAssign = L.icon({
    iconUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-assign.png',
    iconRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-2x-assign.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconWaiting = L.icon({
    iconUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-waiting.png',
    iconRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-2x-waiting.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconDriving = L.icon({
    iconUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-driving.png',
    iconRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-2x-driving.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});

var iconComplete = L.icon({
    iconUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-complete.png',
    iconRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-icon-2x-complete.png',
    iconSize: [25, 41],
    iconAnchor: [13, 41],
    popupAnchor: [-3, -76],
    shadowUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowRetinaUrl: 'http://db00.ghostburster.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/gui/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [13, 41]
});


function GatewayTracker (dbid, map, callback_changes, callback_onerror, callback_location) {
	// updates defined map and its markers
    this.dbid = dbid;
    var map = map;
    var callback_changes = callback_changes;
    var callback_onerror = callback_onerror;
    var callback_location = callback_location;
	var markers = {};


	this.getMarkers = function(){
		return markers;		
	}


	this.start = function(){
		// fetch current state
		this._fetchState();
		// get changes
		this._track();
	}
	this._fetchState = function(){
		var url = "http://db00.taxigateway.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/_design/list/_view/jobs";
		$.getJSON(url, function(res){
			var rows = res.rows;
			for(var i in rows){
				setMapChanged(rows[i].value);
			}
		});
	};

	this._track = function(){
		this.dbinst = new PouchDB('http://db00.taxigateway.com/'+this.dbid);
		this._changes = this.dbinst.changes({
		  since: 'now',
		  include_docs: true,
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
		if(doc.location){
			if(!markers[doc._id]){ // missing marker create one
				try{
					var marker_id = doc._id;
					markers[doc._id] = L.marker(doc.location, {icon: getStateIcon(doc)}).addTo(map);
					markers[doc._id].id = doc._id;
					markers[doc._id].on("click", function(e){
						handleMarkerClick(markers[marker_id]);
					});
				}catch(e){
					throw {"error": 12313, "message": "Could not create marker " + doc._id, "details": JSON.stringify(e)};
				}
			}else{
				markers[doc._id].setIcon(getStateIcon(doc))
			}
			markers[doc._id].doc = doc;
		}
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
		if(doc.driver.canceled_ts || doc.client.canceled_ts){
			selected_icon = "canceled"; //black, remove
		}
		var icons={"assign": iconAssign, "waiting": iconWaiting, "driving": iconDriving, "completed": iconComplete, "canceled": iconAssign};
		return icons[selected_icon];
	}
}
*/