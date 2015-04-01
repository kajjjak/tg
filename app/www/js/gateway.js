(function(global) {
  "use strict";
  var Gateway = function(callback_change) {

    var tasks = {};

    if ( Gateway.prototype._singletonInstance ) {
      return Gateway.prototype._singletonInstance;
    }
    Gateway.prototype._singletonInstance = this;


    // utility functions
    this.guid = (function() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                   .toString(16)
                   .substring(1);
      }
      return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
               s4() + '-' + s4() + s4() + s4();
      };
    })();        

    this.setCallbackChange = function(fn){
      this.callback_change = fn;
      //this.callback_addjob = fn2;
    }

    this.getUserIdentifier = function(){
      var uid = localStorage.getItem("uid");
      return uid;
    };

    this.setUserSetting = function(what, value){
      // used both to popuplate driver and user doc (currently main focus is on driver)
      var setting = JSON.parse(localStorage.getItem("setting") || "{}");
      setting[what] = value;
      localStorage.setItem("setting", JSON.stringify(setting));
      this.setUserDocument(setting);
    };

    this.getUserSettings = function(){
      return JSON.parse(localStorage.getItem("setting") || "{}");
    }

    this.setJobData = function(dict){
      //expects dict to have 'type' which we use as property and id or data attribute that we use as value (data has precidence)
      if(!dict.type){handleException(3242);}
      //if((dict.id == undefined) && (!dict.data)){handleException(3243);}
      var cache = JSON.parse(localStorage.getItem("cache") || "{}");
      cache[dict.type] = dict.data || dict.id;
      localStorage.setItem("cache", JSON.stringify(cache));
      if(this.callback_change){
        this.callback_change(dict.type, dict.data || dict.id);
      }
    };

    function getJobData(){
      var data = JSON.parse(localStorage.getItem("cache") || "{}");
      return data;
    };

    this.getJobData = getJobData;

    this.runUserLogon = function(){
      // run when the driver / customer starts the app
      var doc = this.getUserSettings();
      doc = $.extend(doc, this.getJobData());
      doc.client_ts = new Date().getTime();
      doc.location = this.getUserLocation();
      if (gateway.getDriverAccess().account){ doc.doctype = "driver"; }
      else{ doc.doctype = "customer";}
      this.setUserDocument(doc);
    }

    this.setUserLocation = function(pos){
      localStorage.setItem("location", JSON.stringify(pos));
      if(window.config.setup.driver.position && this.hasDriverAccess()){
        this.setUserDocument({"doctype":"driver","location":{"lat": pos[0], "lng":pos[1]}});
      } 
    };

    this.getUserLocation = function(force_gps){
      if(force_gps){
        return JSON.parse((localStorage.getItem("location") || "null"));
      }else{
        return JSON.parse((localStorage.getItem("location") || "null")) || window.config.map.position;
      }
    };
    
    // couch db interface begins

    this.init = function(device_id) {
      //http://pouchdb.com/api.html
      Gateway.db = new PouchDB(config.database.host + config.database.name);
      localStorage.setItem("uid", CryptoJS.MD5(device_id) + "");
    };


    this.setDocument = function(doc_id, dict, callback_success){
      dict = dict || {};
      var company_id = window.config.database.name;
      var url = getServerAPIPath() + "api/client/" + company_id + "/mobile/doc";
      dict.doc_id = doc_id;
      $.post(url, dict, function(result){
        console.info("Saved document result " + JSON.stringify(result));
        if(result.error){
          handleException(result.error);
        }else{
          if(callback_success){callback_success(result);}
        }
      });
/*      
      Gateway.db.get(doc_id, function(err, old_doc) {
        old_doc = old_doc || {_id: doc_id};
        //merge values
        $.extend(old_doc, dict);
        Gateway.db.put(old_doc, function(err, response) {
          if(err){handleException(err);}
        });
      });
*/      

    };

    this.addJobData = function(dict){
      // NOT USED
/*      
      var doc_id = "job-" + CryptoJS.MD5(JSON.stringify(dict));
      this.setDocument(doc_id, dict, function(response){
        if(response.error){
          //{"status":500,"name":"unknown_error","message":"Database encountered an unknown error","error":true}
          handleException(response.error);
          return;
        }
        if(gateway.callback_addjob){
          dict.id = response.id;
          gateway.callback_addjob(dict);//{err:err, response:response, doc: dict});
        }
        
        //console.info("Added document response  " + JSON.stringify({err:err, response:response}));
        //localStorage.setItem("order_id", response.id);
        //guiShowFeedbackState(dict);        

      });
*/
/*      
      Gateway.db.post(dict, function(err, response) {
        if(err && err.error){
          //{"status":500,"name":"unknown_error","message":"Database encountered an unknown error","error":true}
          handleException(err);
          return;
        }
        if(gateway.callback_addjob){
          dict.id = response.id;
          gateway.callback_addjob(dict);//{err:err, response:response, doc: dict});
        }
        
        //console.info("Added document response  " + JSON.stringify({err:err, response:response}));
        //localStorage.setItem("order_id", response.id);
        //guiShowFeedbackState(dict);
      });
*/
    };

    this.setUserDocument = function(dict){
      var uid = this.getUserIdentifier();
      dict.client_ts = new Date().getTime();
      this.setDocument(uid, dict);
    };

    this.getTasks = function(){
      var t = [];
      for(var i in tasks){
        if (tasks[i]){
          t.push({title: i});
        }
      }
      return t;
    };

    this.setTask = function(task_id, state){
      tasks[task_id] = state;
      window.location.href="/#/app/request"; //refresh view
    };

    function setAccountAccessKey(data){
      localStorage.setItem("access_passkey", JSON.stringify(data));
    }

    function getAccountAccessKey(){
      return JSON.parse(localStorage.getItem("access_passkey") || "{}");
    }

    this.hasDriverAccess = function(){
      return Object.keys(getAccountAccessKey()).length ? true : false;
    }

    this.getDriverAccess = function(){
      return getAccountAccessKey();
    }

    this.sync = function(username, passkey, callback_result){
      var company_id = window.config.database.name;
      var device_id = this.getUserIdentifier();
      var data = {"username": username, "passkey": passkey};
      data.notification_apn = getJobData().notification_apn;
      data.notification_gcm = getJobData().notification_gcm;      
      var url = getServerAPIPath() + "api/client/" + company_id + "/sync/" + device_id;
      localStorage.removeItem("access_passkey");
      $.post(url, data, function(result){
        console.info("Sync result " + JSON.stringify(result));
        if(result.error){
          setAccountAccessKey({});
        }else{
          setAccountAccessKey(result);
        }
        callback_result(result);
      });
    };

    this.setJobState = function(state, callback_success, job_id, data){
      //gateway.setJobState("arrived", function(d){console.info(d);}, "", {})
      //if job_id is not set then we use the last one selected
      data = data || {};
      data.access_passkey = getAccountAccessKey();//{"user_id": "e3d56304c5288ccd6dd6c4a0bb8c3d57", "passkey": "7e4a4da8-e7de-8d3d-c4b3-174d7e0d2a9a"}
      var call_success = callback_success;
      var url = getServerAPIPath() + "api/client/"+window.config.database.name+"/job"; // "/" +job_id+"/"+state;
      if(state != "create"){
          //expects {"client_ts": new Date().getTime(), "time": time, "location": location};
          url = url + "/"+job_id+"/"+state;
      }      
      if(data.access_passkey.account){ // if this is a driver
        //always append the drivers/client device token id if available (so we can send him notifications)
        data.driver_notification_apn = this.getJobData().notification_apn;
        data.driver_notification_gcm = this.getJobData().notification_gcm;
        data.driver_name = gateway.getDriverAccess().name;
        data.driver_language = getSelectedLanguage();
      }else{
        data.client_notification_apn = this.getJobData().notification_apn;
        data.client_notification_gcm = this.getJobData().notification_gcm;        
        data.client_language = getSelectedLanguage();
      }
      $.post(url, data, function(result){
        if(result.error){
            handleError(result.error);
        }else{
            call_success(result);
        }
      }).fail(function(e){
        debugger;
      });
    };
  };

  window.gateway = new Gateway();
}(window));
