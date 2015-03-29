$(document).ready(function(){
	/* ---------- Datable ---------- */
	window.membertable = $('#tblMembers').dataTable();
	window.memberlist = $('#lstMembers').dataTable({
		 "aoColumns": [{"bVisible": true}, {"bVisible": true}]
	});

    $('#tblMembers tbody').on( 'click', 'tr', function () {
    	membertable.$('.selected-row-table').removeClass('selected-row-table');
        if ( $(this).hasClass('selected-row-table') ) {
            $(this).removeClass('selected-row-table');
        } else {
            membertable.$('tr .selected-row-table').removeClass('selected-row-table');
            $(this).addClass('selected-row-table');
        }
        //https://datatables.net/examples/advanced_init/events_live.html
		console.info( 'You clicked on '+this.id+'\'s row' ); 
    } );

    $('#lstMembers tbody').on( 'click', 'tr', function () {
    	memberlist.$('.selected-row-table').removeClass('selected-row-table');
        if ( $(this).hasClass('selected-row-table') ) {
            $(this).removeClass('selected-row-table');
        } else {
            memberlist.$('tr .selected-row-table').removeClass('selected-row-table');
            $(this).addClass('selected-row-table');
        }
        filterByUser(this.id);
    } );

	window.gu = new GatewayUsers();
	gu.init(function(users){
		for(var i in users){
			addMemberRow(users[i]);
		}
	});	
	//ugly hack to remove the search from member list
	$("#lstMembers_wrapper .row:first-child").hide();
	$("#lstMembers_wrapper .row:last-child").hide();

	//add select None
	addMemberRow({name: "<i>All</i>", role:{driver:1}, email:"", created:"", group:"", status:"", buttons:""}, true);
});

function showEditMember(id){
	$("#mdlMemberEdit").modal('show');
	$("#txtEditMemberId").val(id || "");
}

function addMemberRow(member, onlylist){
	var buttons = '<td class="center"><a class="btn btn-success" href="#" onclick="showEditMemberPassword(\'' + member._id + '\');"><i class="fa fa-shield "></i></a><!-- a class="btn btn-info" href="table.html#"><i class="fa fa-edit "></i></a --><a class="btn btn-danger" href="#" onclick="gu.removeUser(\'' + member._id + '\');"><i class="fa fa-trash-o "></i> </a></td>';
	member.status = '<span class="label label-success">Active</span>';
	member.created_label = new Date(member.created).toLocaleDateString();
	if(!onlylist){
		var ri = $('#tblMembers').dataTable().api().row.add([
			member.name,
			member.email,
			member.created_label,
			member.group,
			member.status,
			buttons
		]).draw();
		var row = $('#tblMembers').dataTable().fnGetNodes(ri[0]);
		$(row).attr('id', "tbl-" + member._id);
	}

	if(member.role.driver){
		ri = $('#lstMembers').dataTable().api().row.add([
			"", //member.status,
			member.name
		]).draw();	
		var row = $('#lstMembers').dataTable().fnGetNodes(ri[0]);
		$(row).attr('id', member._id);
	}
}

function saveEditMember(){

	var mbmr = {};
	var url = "/api/client/user/";

	mbmr["id"] = $("#txtEditMemberId").val();
	mbmr["name"] = $("#txtEditMemberName").val();
	mbmr["email"] = $("#txtEditMemberEmail").val();
	mbmr["created"] = new Date().getTime();
	mbmr["group"] = $("#txtEditMemberRole").val();

	getPOST(url, mbmr, function(res){
		if(res.error){
			if(res.error == 403){ res.error = "You need to login again."; }
			showAlert(res.error || res.error.message);
		}else{
			addMemberRow(res);
		}
	});
}

function GatewayUsers (dbid) {

	var users = {};

	this.init = function(callback_loaded){
		var path = getSystemDatabasePath();
		var users = {};
		if(path){
			var url = path + "/_design/users/_view/list";

			getJSON(url, function(res){
				var row;
				for (var i in res.rows){
					users[res.rows[i].value._id] = res.rows[i].value;
				}
				if(callback_loaded){
					callback_loaded(users);
				}
			});
		}
	}

	this.getUsers = function(){ return users; }

	this.removeUser = function(user_id){
		$.ajax({
		    url: '/api/client/user/' + user_id,
		    type: 'DELETE',
		    success: function(result) {
		        // Do something with the result
		        if(result.error){
		        	showAlert(result.error);	
		        }else{
		        	showAlert("Successfully removed member");
		        	$('#tblMembers').dataTable().api().row('.selected-row-table').remove().draw( false );
		        }
		    },
		    error: function(e){
		    	if(handleNetworkError(e)){return;}
		    	showAlert("Could not remove member. The request failed.");
		    }
		});
	}

	this.hasUserGroup = function(user_id, group_name){
		if(users[user_id]){
			if(users[user_id].group == group_name){
				return true;
			}
		}
		return false;
	}

};
