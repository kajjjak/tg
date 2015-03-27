
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
        data.author = "router"; 
		getPOST(url, data, function(result){
            if(result.error){
                handleError(result.error);
            }else{
                call_success(result);
            }
    	});
    };

    this.getUser = function(){
        //should use this for getting user instead of directly using it
        return window.user || {}; 
    }

    this.getDriverList = function(callback_result){
        var url = getCompanyDatabasePath() + "/_design/list/_view/drivers";
        getJSON(url, function(res){
			if(callback_result){
				callback_result(res["rows"]);
			}
        });
    };

    this.getAppConfig = function(callback_success, options){
        options = options || {};
        if(options.clear_cache){sessionStorage.removeItem("config");}
        return getClientDoc(function(info){
            if(callback_success){callback_success(info.app_config);}
        }).app_config;
    };

    this.setupClientDatabase = function(info, callback_state){
        var st = {"request": true};
        callback_state(st);
        getPOST("/api/company/configure", {}, function(res){
            console.info("Created database " + res);
            st["createddb"] = true;
            callback_state(st);
            getPOST("/api/company/configure/dbuser", {}, function(res){
                st["createduser"] = true;
                callback_state(st);
                getPOST("/api/company/information", info, function(res){
                    st["storedinfo"] = true;
                    callback_state(st);
                });
            });
        });
    }

    this.getAppDetails = function(callback_success){
        return getClientDoc(function(info){
            callback_success(info.app_details);
        }); 
    };

    function setClientDoc(info, callback_result){
        getPOST("/api/client/mobile/info", info, function(res){
            sessionStorage.removeItem("config");
            getClientDoc();            
            callback_result(res);
        });
    }

    function getClientDoc(callback_success){
        //checks cache or fetches new version
        var cache = JSON.parse(sessionStorage.getItem("config") || "null");
        if(cache){
            console.info("Using company info cache " + new Date(cache._fetched));
            if(callback_success){callback_success(cache);}
            return cache;
        }else{
            getJSON("/api/client/", function(res){
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
        return {};
    }


    function setCompanyConfig(info, callback_success, callback_failure){
      var url = "/api/company/information"
      getPOST(url, info, function(res){
        if(res.success){
          callback_success(res);
        }else{
          callback_failure(res);
        }
      }, callback_failure);
    }

    this.getClientDoc = getClientDoc;
    this.setClientDoc = setClientDoc;

    this.getReport = function(options, callback_success){
        var url = "/api/client/" + this.getUser().company_id + "/report";
        getJSON(url, callback_success);
    }
};

$(function () {
    window.gapi = new GatewayAPI(user.company_id, function(e){
    	console.warn("GATEWAY API: " + JSON.stringify(e));
    });
});