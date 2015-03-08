
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
