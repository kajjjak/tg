
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

function GatewayAPI (dbid, callback_error) {
	// updates defined map and its markers
    var dbid = dbid;
    var callback_error = callback_error;

    this.setJobState = function(state, callback_success, job_id, data){
    	//if job_id is not set then we use the last one selected
        if (!job_id){ state = "create"; }
    	data = data || {};
        var url = "/api/client/"+dbid+"/job";
        var call_success = callback_success;
        if(state != "create"){
            //expects {"client_ts": new Date().getTime(), "time": time, "location": location};
            url = url + "/"+job_id+"/"+state;
        }
		$.post(url, data, function(result){
            if(result.error){
                handleError(result.error);
            }else{
                call_success(result);
            }
    	}).fail(callback_error);
    };

    this.getDriverList = function(callback_result){
        var url = "http://db00.taxigateway.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/_design/list/_view/drivers";
        $.getJSON(url, function(res){
			if(callback_result){
				callback_result(res["rows"]);
			}
        });
    };

    this.getAppConfig = function(callback_success){
        getClientDoc(function(info){
            callback_success(info.app_config);
        });
    };

    this.getAppDetails = function(callback_success){
        getClientDoc(function(info){
            callback_success(info.app_details);
        });
    };

    function getClientDoc(callback_success){
        //checks cache or fetches new version
        var cache = JSON.parse(sessionStorage.getItem("config") || "null");
        if(cache){
            console.info("Using company info cache " + new Date(cache._fetched));
            if(callback_success){callback_success(cache);}
        }else{
            $.getJSON("/api/client/", function(res){
                if(res.error){ //error occured, lets notify user
                    callback_error(res.error);
                }else{
                    res._fetched = new Date().getTime(); // save the date
                    sessionStorage.setItem("config", JSON.stringify(res));
                    if(callback_success){callback_success(res);}
                    console.info("Using company info fresh " + new Date(res._fetched));
                }
            });            
        }
    }

    this.getClientDoc = getClientDoc;
};

$(function () {
    window.gapi = new GatewayAPI("tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57", function(e){
    	console.warn("GATEWAY API: " + JSON.stringify(e));
    });
});