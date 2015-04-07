
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

/*
	changes here versus the online versino
		- has jobs
		- jobs is in a dict

*/

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
	var filter_markers = {};
	var filter_users = {};
	var jobs = {};

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
		if(this._changes){this._changes.cancel();}
	}

	this.getJobs = function(){
		return jobs;
	}

	this.addJob = function(job){
		jobs[job._id] = job;
	}

	this.isJobActive = function(job){
		var job_id = job._id;
		var state = getState(job);
		if(!jobs[job_id]){ return false; }
		if(state == "canceled" || state == "completed"){ return false; }
		if(job.driver.assigned_id && (job.driver.assigned_id != gateway.getDriverAccess().account)) { return false;}
		return true;
	}

	this._fetchState = function(options){
		var url = getCompanyDatabasePath() + (options.path_view || "/_design/jobs/_view/active");
		var keys = this.getFiltered();
		if(keys.length){ url = url + "?keys=" + JSON.stringify(keys);}
		jobs = {};
		$.getJSON(url, function(res){
			if(res.error){
				callback_onerror({"statusCode": "server_errorresponse"});
				return;
			}
			for(var i in res.rows){
				var job = res.rows[i].value;
				jobs[job._id] = job;
				if(isFiltered(job) && (!options.cacheonly)){
					if(callback_changes){
						callback_changes(job, !options.update);
					}
					try{
						setMapChanged(job);
					}catch(e){}
				}
			}
			if(callback_updated){
				callback_updated();
			}							
		}).error(function(){callback_onerror({"statusCode": "network_errorgetjson"})});
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
		jobs[marker_id] = doc;
		if((doc.location) && /*(doc.doctype == "driver") ||*/ (doc.doctype == "job")){ //Disable driver for now due to bug of location
			if(!markers[marker_id]){ // missing marker create one
				try{
					markers[marker_id] = L.marker(doc.location, {icon: getStateIcon(doc)}).addTo(window.map);
					markers[marker_id].id = marker_id;
					markers[marker_id].on("click", function(e){
						handleMarkerClick(markers[marker_id]);
					});
				}catch(e){
					if(callback_onerror){
						callback_onerror({"error": 12313, "message": "Could not create marker " + marker_id, "details": e, "silent": true});
					}
				}
			}else{
				markers[marker_id].setIcon(getStateIcon(doc));
				markers[marker_id].setLatLng(doc.location);
			}
			markers[marker_id].doc = doc;
			return markers[marker_id];
		}
	}
	this.setMapChanged = setMapChanged;

	this.setFilterUser = function(id, b, restart){
		if(!id){ return; }
		if(!filter_users){ filter_users = {}; }
		filter_users[id] = b;
		if(restart){
			this.stop();
			this.start();
		}				
	}

	this.clearFilterUser = function(){
		filter_users = {};
	}
	
	this.setFilterMarkers = function(id, b, restart){4
		if(!id){return;}
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
		return filter_markers[doc._id] || options.filter_rules_all;
	}

	this.getFiltered = function(type){
		if(type == "markers"){
			return Object.keys(filter_markers);
		}
		if(type == "users"){
			return Object.keys(filter_users);
		}
		return Object.keys($.extend({}, filter_markers, filter_users));
	}

	function getState(doc){
		var current_state = "assign"; //red
		if(!doc.driver){ doc.driver = {};}
		if(!doc.client){ doc.client = {};}
		if(doc.driver.assigned_ts && doc.driver.assigned_id){
			current_state = "waiting"; //orange
		}
		if(doc.driver.arrived_ts || doc.client.arrived_ts){
			current_state = "driving"; //green
		}
		if(doc.driver.complete_ts || doc.client.complete_ts){
			current_state = "completed"; //white
		}
		if(doc.client.canceled_ts){
			current_state = "canceled"; //black, remove
		}
		return current_state;
	}

	function getStateIcon(doc){
		var selected_icon = getState(doc);
		var icons={"assign": iconCreate, "waiting": iconCreate, "driving": iconCreate, "completed": iconComplete, "canceled": iconComplete, "driver": iconDriver};
		return icons[selected_icon];
	}

	this.getStateIcon = getStateIcon;
}
