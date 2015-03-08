function getJobSelected(){
	var markers = vt.getMarkers();
	var job = markers[window.job_selected];
	if(!job){
		showAlert("Select a job to edit");
		throw "Select a job";
	}
	return job;
}

function getJobVehiclesName(vehicles_id, vehicles){
	var pickup_type = vehicles[1].title; //1 is default
	for(var i in vehicles){
		if(vehicles[i].id == vehicles_id){
			pickup_type = vehicles[i].title;
		}
	}
	return pickup_type;
}

function setJobLabelDetails(job){
	window.gapi.getAppConfig(function(res){
		var vehicles = res.service.vehicles;
		var pickup_type = getJobVehiclesName(job.vehicles, vehicles);
		var pickup_time = new Date(job.pickup_time || job.datetime).toLocaleString();
		$(".selected-job-details").html("<b>"+pickup_time+"</b> vehicle type " + pickup_type + " at <b>" + (job.address.formated || job.address.street) + "</b>");
	});
}

function setJobToolbarState(state){
	//TODO: show the selection visually
	window.job_selected = state._id || state.id;
	var job_marker = getJobSelected();
	var position = job_marker.getLatLng();
	if(!window.job_circleselect){
		window.job_circleselect = L.circle(position, 50, {
		    color: 'blue',
		    fillColor: 'blue',
		    fillOpacity: 0.5
		}).addTo(map);
	}
	window.job_circleselect.setLatLng(position);
	setJobLabelDetails(job_marker.doc);
}

function showJobState(self){
	//$("#maptoolbar_create").attr("disabled", "disabled");
	if(self.id == "maptoolbar_create") {
		$("#servicepicker").html("");
		gapi.getAppConfig(function(doc){
			for(var i in doc.service.vehicles){
				var vehicle = doc.service.vehicles[i];
				var selected = "";
				if(vehicle.selected){ selected = " selected " }
				$("#servicepicker").append("<option value='" + vehicle.id + "' " + selected + ">" + vehicle.title + "</option>");
			}
		});
		$('#mdlJobCreate').modal('show');
	}else if(self.id == "maptoolbar_assign") {
		getJobSelected();
		var tbl = "";
		gapi.getDriverList(function(drivers){
			var driver;
			window.gapi.getAppConfig(function(res){
				var vehicles = res.service.vehicles;

				for(var i in drivers){
					driver = drivers[i].value;
					tbl = tbl + "<tr id='" + driver._id + "'><td>" + driver.name + "</td><td>" + getJobVehiclesName(driver.vehicles, vehicles) + "</td></tr>";
				}
				$('#lstJobAssignDrivers').html('<table class="table table-striped">'+tbl+'</table>');
				$('#lstJobAssignDrivers tr').click(function(sel) {
				    window.driver_selected = sel.currentTarget.id;
				});
			});			
		});
		$('#lstJobAssignDrivers').html("... updating drivers list");
		$('#mdlJobAssign').modal('show');
	}else if(self.id == "maptoolbar_pickup") {
		getJobSelected();
		$('#mdlJobPickup').modal('show');
	}else if(self.id == "maptoolbar_driving") {
		getJobSelected();
		$('#mdlJobDriving').modal('show');
	}else if(self.id == "maptoolbar_complete") {
		getJobSelected();
		$('#mdlJobComplete').modal('show');
	}
}

function getPickupTime(){
	return $('#datetimepicker').datetimepicker().data('DateTimePicker').date();
}

function getPickupVehicle(){
	return $("#servicepicker").val();
}

function getPickupAddress(address){
	address.pinpoint = JSON.parse(sessionStorage.getItem("job_address") || "null") || address;
	if(!address.formated){
		address.formated = address.street;
		if(address.pinpoint.formated){
			address.formated = address.pinpoint.formated;
		}
	}
	return address;
}

function showModalCancel(type){
	var btnreason = "";
	var reasons = {};
	if(type == -1){
		var reasons = {"No reason": 1, "Mistake": 2, "Change of mind": 3, "Testing app": 4};
	}
	if(type == -2){
		var reasons = {"No reason": 1, "Other job": 2, "Difficult client": 3};
	}
	for(var n in reasons){
		btnreason = btnreason + '<button type="button" class="btn btn-primary" data-dismiss="modal" onclick="setJobState(' + type + ', {reason:' + reasons[n] + '})">' + n + '</button>';
	}
	$("#lstJobCanceledReason").html(btnreason);
	$('#mdlJobCancel').modal('show');	
}

function setJobState(nr, data){
	var find_address = {		
		street: $("#job_street").val(),
		postalCode: $("#job_postcode").val(),
		city: $("#job_city").val(),
		state: $("#job_state").val(),
		country: $("#job_country").val()
	};

	if(nr == 0){  // lookup
		fetchJobLocation(find_address, function(address){
			formated = "";
			if(address.street){ formated = formated + address.street; }
			if(address.postcode){ formated = formated + ", " + address.postcode; }
			if(address.city){ formated = formated + ", " + address.city; }
			if(address.country){ formated = formated + ", " + address.country; }
			L.popup()
			    .setLatLng(address.latlng)
			    .setContent(formated)
			    .openOn(window.map);			
		});

	}
	if(nr == 1){ // create a new job marker
		fetchJobLocation(find_address, function(address){
			if(window.job_newlocation){
				map.setView(window.job_newlocation.getLatLng());
			}else{
				var options = {
					draggable: true,
					riseOnHover: true
				}
				window.job_newlocation = L.marker(map.getCenter(), options).addTo(map);
				window.job_newlocation.bindPopup("<center><div class='job_address'>Drag me to street number</div><button class='btn btn-primary' onclick='setJobState(3)'>Save</button><button class='btn btn-warning' onclick='setJobState(2)'>Cancel</button></center>");
				window.job_newlocation.on('dragend', function(){
					var latlng = window.job_newlocation.getLatLng();
					window.job_newlocation.openPopup();
					fetchJobAddress(latlng.lat, latlng.lng);
				});
			}
			if(address){ window.job_newlocation.setLatLng(address.latlng); }
			window.job_newlocation.pickup_time = getPickupTime();
			window.job_newlocation.pickup_vehicle = getPickupVehicle();
			window.job_newlocation.pickup_address = find_address;
			window.job_newlocation.openPopup();
		});
		return;
	}
	if(nr == 2){  // cancel create new job marker
		if(window.job_newlocation){
			map.removeLayer(window.job_newlocation);
			window.job_newlocation = null;
		}
	}
	if(nr == 3){  // confirm new job marker (sending to server), then remove the edit marker from map
		var latlng = window.job_newlocation.getLatLng();
		var data = {
			"client_ts": new Date().getTime(), 
			"pickup_time": window.job_newlocation.pickup_time.toDate().getTime(), 
			"vehicles": window.job_newlocation.pickup_vehicle,
			"address": getPickupAddress(window.job_newlocation.pickup_address),
			"location": [latlng.lat, latlng.lng]
		};
		gapi.setJobState("create", function(res){
			console.info("Create new job result " + JSON.stringify(res));
			setJobState(2);
			setJobToolbarState(res.job);
		}, undefined, data);
		return;
	}
	if(nr == 4){  // set driver assigned (and if time is set send "driver_arrives" as well as "assign")
		var job = getJobSelected().doc || {"client": {"id": null}};
		var data = {"client_id": job.client.id || null, "driver_id": window.driver_selected};
		gapi.setJobState("assigned", function(res){
			console.info("Assigning driver/client to client/driver " + JSON.stringify(res));
		}, window.job_selected, data);		
	}
	if(nr == 5){  // the driver has arrived
		gapi.setJobState("driver_arrived", function(res){
			console.info("Notified that driver has arrived " + JSON.stringify(res));
		}, window.job_selected, data);
	}
	if(nr == 6){  // the driver is driving
		gapi.setJobState("driver_occupied", function(res){
			console.info("Notified that driver is occupied " + JSON.stringify(res));
		}, window.job_selected, data);
	}
	if(nr == 7){  // the driver has completed
		gapi.setJobState("driver_completed", function(res){
			console.info("Notified that driver has completed " + JSON.stringify(res));
		}, window.job_selected, data);
	}
	if(nr == -1){
		gapi.setJobState("client_canceled", function(res){
			console.info("Notified that client has canceled " + JSON.stringify(res));
		}, window.job_selected, data);
	}
	if(nr == -2){
		gapi.setJobState("driver_canceled", function(res){
			console.info("Notified that driver has canceled " + JSON.stringify(res));
		}, window.job_selected, data);
	}
}

function fetchJobLocation(address, callback_result){
  var url = "/api/geocode/address/mapquest";
  $.post(url, address, function(res){
  	if(res.error){
  		callback_result({street: "not found", latlng: map.getCenter()});
  	}else{
  		callback_result(res);
  	}
  });
}


function fetchJobAddress(lat, lng){
  window.timedid = new Date().getTime();
  $(".job_address").html("finding address ...");
  setTimeout("_fetchJobAddress("+lat+", "+lng+", "+timedid+")", 2000);
}

function _fetchJobAddress(lat, lng, passed_timedid){
  if(passed_timedid != window.timedid){ return; } //then we recently asked for a new location (when moving the map)
  var url = "/api/geocode/reverse/"+lat+"/"+lng+"/mapquest";
  $.getJSON(url, function(res){
    var address = res.street;
    if(res.street_number){ address = address + " " + res.street_number; }
    if(res.city){ address = address + ", " + res.city; }
    res.formated = address;
    sessionStorage.setItem("job_address", JSON.stringify(res));
    $(".job_address").html(address);
  });
}


$(function(){
	$("#job_city").val("Reykjavik");
	$("#job_state").val("");
	$("#job_country").val("Iceland");	
	
	window.vt = new GatewayTracker("tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57", map, function(){},function(e){
	    alert(JSON.stringify(e));
	  }, function(marker){
	    setJobToolbarState(marker.doc);
	  });
	window.vt.start();
});