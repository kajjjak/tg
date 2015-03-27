
function getJSON(url, callback_success, callback_failure){
	$.getJSON(url, callback_success).fail(function(e) {
    	if(callback_failure){callback_failure(e);}
		if(handleNetworkError(e)){return;}
  	});
}

function getPOST(url, data, callback_success, callback_failure){
	$.post(url, data, callback_success).fail(function(e) {
    	if(callback_failure){callback_failure(e);}
		if(handleNetworkError(e)){return;}
  	});
}

function handleNetworkError(error){
	if(error.status == 500) {showAlert(error.statusText);}
	if(error.status == 404) {showAlert("Cannot connect through network");}
	if(error.status == 403) {showAlert("Session was reset due to security resons. Please <a href='/login'>login again</a> ");}
	if(error.status == 0) {showAlert("Session was reset due to server maintainance. Please <a href='/login'>login again</a> ");}
	console.warn(JSON.stringify(error));	
}

function handleError(error){
	showAlert(error)
	console.warn(JSON.stringify(error));

}

function showAlert(message){
	$('#mdlAlert').modal('show');
	$("#mdlAlertMessage").html(message);
}

function showEditMemberPassword(id){ 
	$("#mdlMemberEditPassword").modal('show');
	$("#txtEditMemberPasswordId").val(id || "");
}

function saveEditMemberPassword(){
	var id = $("#txtEditMemberPasswordId").val();
	var mbmr = {};
	var url = "/api/client/user/" + id + "/password";

	mbmr["id"] = id;
	mbmr["password1"] = $("#pwdNew1").val();
	mbmr["password2"] = $("#pwdNew2").val();

	getPOST(url, mbmr, function(res){
		if(res.error){
			if(res.error == 403){ res.error = "You need to login again."; }
			showAlert(res.error || res.error.message);
		}else{
			showAlert("Successfully changed password");
		}
	});
}
 
function filterByUser(user_id){
	console.info( 'You clicked on '+user_id+'\'s list row' );
	if(window.vt){
		var mrkr, mrks = window.vt.getMarkers();
		for(var i in mrks){
			mrkr = mrks[i];
			if((mrkr.doc.driver.assigned_id == user_id) || (!user_id)){
				mrkr.setOpacity(1);
			}else{
				mrkr.setOpacity(0.5);
			}
		}
	}
}


function fetchJobLocation(address, callback_result){
  var url = "/api/geocode/address/mapquest";
  getPOST(url, address, function(res){
  	if(res.error){
  		callback_result({street: "not found", latlng: map.getCenter()});
  	}else{
  		callback_result(res);
  	}
  });
}

function iterate(obj, stack, fn) {
	var r = null;
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == "object") {
                iterate(obj[property], stack + '-' + property, fn);
            } else {
                r = fn(stack + '-' + property, obj[property]);
                if(r){
                	obj[property] = r;
                }
            }
        }
    }
}
