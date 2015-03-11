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

	$.post(url, mbmr, function(res){
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
