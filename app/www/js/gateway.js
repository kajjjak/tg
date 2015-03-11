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

    this.setCallbackChange = function(fn, fn2){
      this.callback_change = fn;
      this.callback_addjob = fn2;
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

    this.getJobData = function(){
      var data = JSON.parse(localStorage.getItem("cache") || "{}");
      return data;
    };

    this.setUserLocation = function(pos){
      localStorage.setItem("location", JSON.stringify(pos));
    };

    this.getUserLocation = function(){
      return JSON.parse((localStorage.getItem("location") || "null")) || window.config.map.position;
    };
    
    // couch db interface begins

    this.init = function(device_id) {
      //http://pouchdb.com/api.html
      Gateway.db = new PouchDB(config.database.host + config.database.name);
      localStorage.setItem("uid", CryptoJS.MD5(device_id) + "");
    };


    this.setDocument = function(doc_id, dict){
      dict = dict || {};
      Gateway.db.get(doc_id, function(err, old_doc) {
        old_doc = old_doc || {_id: doc_id};
        //merge values
        $.extend(old_doc, dict);
        Gateway.db.put(old_doc, function(err, response) {
          if(err){handleException(err);}
        });
      });      
    };

    this.addDocument = function(dict){
      Gateway.db.post(dict, function(err, response) {
        if(gateway.callback_addjob){
          dict.id = response.id;
          gateway.callback_addjob(dict);//{err:err, response:response, doc: dict});
        }
        /*
        console.info("Added document response  " + JSON.stringify({err:err, response:response}));
        localStorage.setItem("order_id", response.id);
        guiShowFeedbackState(dict);*/
      });
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

    this.sync = function(username, passkey, callback_result){
      var company_id = window.config.database.name;
      var device_id = this.getUserIdentifier();
      var data = {"username": username, "passkey": passkey};
      var url = "http://taxigateway.com/api/client/" + company_id + "/sync/" + device_id;
      $.post(url, data, function(result){
        callback_result(result);
      });
    };


  };
  window.gateway = new Gateway();
}(window));
