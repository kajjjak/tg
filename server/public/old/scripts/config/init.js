/** Copyright 2012 kajjjak
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
     http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/


function startProgressLoader(){
  if(guiUpdateInitProgress){guiUpdateInitProgress(1/5, "Preload images");}
  preLoadImages([
      'stylesheets/defense_map_splash.jpg',
      'stylesheets/ui_frame_dark.png',
      'stylesheets/ui_frame_dark_title.png',
      'stylesheets/ui_frame_dark_title_infowindow.png',
      'stylesheets/gui_slidersectionbuttons_economy_selected.png',
      'stylesheets/gui_slidersectionbuttons_defense_selected.png',
      'stylesheets/gui_slidersectionbuttons_support_selected.png',
      'stylesheets/gui_slidersectionbuttons_economy.png',
      'stylesheets/gui_slidersectionbuttons_defense.png',
      'stylesheets/gui_slidersectionbuttons_support.png'
  ]); 
}    

function initGame(){
  /* --- using mapbox *
  L.mapbox.accessToken = "pk.eyJ1Ijoia2FqamphayIsImEiOiJyTl9FTVFvIn0.MqbD9otpK68am30fGnHYjA";
  map = L.mapbox.map('map', 'kajjjak.map-wgrdoudp', {}); // {minZoom: 15, maxZoom: 17}
  */

  console.log("************** init game **************")

  startProgressLoader();

  /*
  map.on('load', function(){
    /// map location - start: this will ensoure that the map will load on users last location, fixing map loading issues
    map.on('moveend', function(e){
      var latlng = e.target.getCenter();
      cacheStorageSave("center_view", "["+latlng.lat+", "+latlng.lng+"]")
    });
    // map location - ends
    mmgr = new SceneManager();
    mmgr.init(map);
    setTimeout(function(){

        amgr.init();
        amgr.requestAction("load_scene");
      
    }, 100);
  });
  */
  if(guiUpdateInitProgress){guiUpdateInitProgress(2/5, "Starting manager");}

  function getPhoneGapPath() {
      'use strict';
      var path = window.location.pathname;
      var phoneGapPath = path.substring(0, path.lastIndexOf('/') + 1);
      return phoneGapPath;
  }

  amgr = new ActionManager(new game_logic(), new game_render(), function(){    
      if(guiUpdateInitProgress){guiUpdateInitProgress(3/5, "Starting sound");}
      try{
          smgr.init(sound_tracks, {"categorized": true, "directory": getPhoneGapPath() + "/media/sounds/", "phonegap": false, "enabled": true, "music_fadeout": 1000, "load_track_delay": 2000, "extension":".mp3"});
          if(guiUpdateInitProgress){guiUpdateInitProgress(4/5, "Setting preferences");}
          //show the loader here
          loadGUIEffects();
          loadUserPreferences();
          smgr.play(sound_events["ui_jingle_intro"]);
          smgr.setEnabled(false); //this will allow play requests to be played
          setTimeout(function(){
              smgr.setEnabled(true);
              //checks user preferences if we should play music and ambiance
              fireGameEvent("ambience_default");
              fireGameEvent("ambience_default_layer1");
              fireGameEvent("ambience_default_layer2");
              if(guiUpdateInitProgress){guiUpdateInitProgress(5/5, "Loading map");}
              map.setView(JSON.parse(cacheStorageLoad("center_view") || "[64.135337999999990000, -21.895210000000020000]"), 16);
              smgr.playMusic(sound_events["music_building"]);
          }, 4000);
          smgr.setPlayLists(sound_lists);
          if(ga){
            ga('set', 'userId', game_state.getUserId());
          }
      }catch(e){ console.error("Could not load sound"); }
      mmgr.loadScene();
      mmgr.map.on('zoomend',
          function(e){
              if (e.target._zoom){
                  mapResizeIconsByZoom(e.target._zoom);
              }
          }
      );

  });
  //map.on('popupclose', guiPopupCloseCallback);
  /**/

  /* --- using mapquest *
  map = L.map('map', {layers: MQ.mapLayer()}); 
  
  /* --- using mapquest and OSM */
  // designs: http://leaflet-extras.github.io/leaflet-providers/preview/
  map = L.map('map'); //{layers: MQ.mapLayer()}); 
  var osmUrl='http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';// 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osmAttrib='&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>';//'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
  var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});   
  map.addLayer(osm);
  /* */
  // --- CONT (disable if using mapbox) - starts
  map.on('moveend', function(e){
    var latlng = e.target.getCenter();
    cacheStorageSave("center_view", "["+latlng.lat+", "+latlng.lng+"]")
  });
  // map location - ends
  mmgr = new SceneManager();
  mmgr.init(map);
  amgr.init();
  setTimeout(function(){
      
      amgr.requestAction("load_scene");
      setInterval(ticker, 1000);   
  }, 6000);

  // --- CONT (disable if using mapbox) - ends
  /**/

}
/*
if(!isPhoneGap()){
  $( document ).ready(function() { // load map when dom is ready
    app.receivedEvent('deviceready'); //fake start browser as a device
  });
}
*/

/*var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
      app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
      initGame();
      console.log('Received Event: ' + id);
    }
};
*/


var app = {
    actors: [],
    isActorsLoaded: false,
    isDeviceSupported: false,
    player_id: null,
    // Application Constructor
    initialize: function() {
      this.bindEvents();
      if((!isPhoneGap()) && ((window.location.host.indexOf("localhost") == 0) || (window.location.host == ""))){
        app.receivedEvent('deviceready'); //fake start browser as a device
      }
    },
    showStoreItems: function(validProducts, invalidProductIds){
      //should use the prices that app store uses, enumerate and update
      //DONT DO THIS, JUST UPDATE CORE VALUES AND FULL MENU UPDATE $("#item_detail_iap01 p").html("blu")
    },
    showStorePurchase: function(productId, transactionId, receipt){
      //show popup that the purchase has been made and in this call also notify server
      var url = url_domain + "api/payment/purchase"+getUserAuthKey(); //changed order 
      var purchase_info = {"purchases": [{"type":productId.replace("currency.ghostburster.", ""), "count":1, "raw":{"productId":productId, "transactionId":transactionId, "receipt": receipt}}]};
      $.post(url, purchase_info, function(result){
        console.log("Completed purchase validation, doing a server/client sync correction");
        if(result.error){
          guiAlert("Could not complete purchase. Dont worry we will be able to restore it by restoring purchases. This error has been logged and we have notified the developer. Reason was: " + result.error);
        }else{
          showDialogPurchasedIAPItem(result["item_id"], result);
          runPurchaseIAPCorrection();          
        }
      });
    },
    showStoreRestore: function(productId, transactionId, receipt){
      //FIXME: should accumilate all and send to server
    },
    showStoreFailure: function(code, messages){
      //FIXME: show the error to the user
      alert("Error shopping " + JSON.stringify({"code":code, "messages":messages}));
    },
    getPushNotificationIds: function(state_instance){
      // adds to dictionary having keys of identifiers we can send to, the APN stands for target platform being a apple server
      var pns = state_instance.getAuthentication("pushnotification") || {};
      var apn = localStorage.getItem("config_device_token_apn");
      if(apn){
        pns[apn] = "APN";
      }
      return pns;
    },
    onPushNotificationErrorHandler: function(e){
      // result contains any error description text returned from the plugin call
    },
    onPushNotificationTokenHandler: function(result){
      // Your iOS push server needs to know the token before it can push to this device
      // here is where you might want to send it the token for later use.
      console.log('device token = ' + result);
      localStorage.setItem("config_device_token_apn", result); //save this for next time we save the game state
      //pushNotification.setApplicationIconBadgeNumber(successCallback, errorCallback, badgeCount);
    },
    loadPushNotification: function(){
      //https://github.com/phonegap-build/PushPlugin
      if(window.plugins && window.plugins.pushNotification){
        pushNotification = window.plugins.pushNotification;
        console.log("Registering Push Notification for platform " + device.platform + "");
        if ( device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos" ){
          /*
            pushNotification.register(
            successHandler,
            errorHandler,
            {
                "senderID":"replace_with_sender_id",
                "ecb":"onNotification"
            });
          */
        } else if ( device.platform == 'blackberry10'){
          /*
            pushNotification.register(
            successHandler,
            errorHandler,
            {
                invokeTargetId : "replace_with_invoke_target_id",
                appId: "replace_with_app_id",
                ppgUrl:"replace_with_ppg_url", //remove for BES pushes
                ecb: "pushNotificationHandler",
                simChangeCallback: replace_with_simChange_callback,
                pushTransportReadyCallback: replace_with_pushTransportReady_callback,
                launchApplicationOnPush: true
            });
          */
        } else {
            pushNotification.register(
            app.onPushNotificationTokenHandler,
            app.onPushNotificationErrorHandler,
            {
                "badge":"true",
                "sound":"true",
                "alert":"true",
                "ecb":"onNotificationAPN"
            });
        }
      }      
    },      
    loadStore: function(){
      //call this with a timer
      //http://www.gamedonia.com/game-development/solve-invalid-product-ids
      this.store = new IAPStoreManager();
      this.store.initialize({inventory:[
        "currency.ghostburster.iap01",
        "currency.ghostburster.iap02",
        "currency.ghostburster.iap03",
        "currency.ghostburster.iap04",
        "currency.ghostburster.iap05"
      ]}, app.showStoreItems, app.showStorePurchase, app.showStoreRestore, app.showStoreFailure);
    },
    showARView: function() {
      if(!app.wikitudePlugin){ return; }
      if (!app.isActorsLoaded){
        app.isActorsLoaded = true;
        app.loadARchitectWorld("www/world/ghosts/index.html");
      }else{
        //app.loadARchitectWorld("www/world/ghosts/index.html");
        //TODO: check if the plugin has fozen if so then (reload by) close it and do a app.loadARchitectWorld("www/world/ghosts/index.html");
        app.wikitudePlugin.show();
        app.wikitudePlugin.callJavaScript('updateGhosts();');
      }
    },
    hideARView: function(hard){
      //if hard then we close else we hide
      if(!app.wikitudePlugin){ return; }
      if(hard){
        app.wikitudePlugin.close();
        app.isActorsLoaded = false;
      }else{
        app.wikitudePlugin.hide();
      }
    },
    fireWeapon: function(w, url){
      hit_param_name = "actor=";
      var actor_id = url.substring(url.indexOf(hit_param_name)+hit_param_name.length);
      this.addActorDamage(actor_id);
    },
    addActorDamage: function(actor_id){
      var hits = JSON.parse(localStorage.getItem("actor_hits") || "{}");
      hits[actor_id] = new Date().getTime();
      localStorage.setItem("actor_hits", JSON.stringify(hits));
    },
    /**
     *  This function extracts an url parameter
     */
    getUrlParameterForKey: function(url, requestedParam) {
      requestedParam = requestedParam.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regexS = "[\\?&]" + requestedParam + "=([^&#]*)";
      var regex = new RegExp(regexS);
      var results = regex.exec(url);
      
      if (results == null){return "";}
      else {
        var result = decodeURIComponent(results[1]);
        return result;
      }
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
      document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // --- Wikitude Plugin ---
    /**
     *  This function gets called if you call "document.location = architectsdk://" in your ARchitect World
     *  @param url The url which was called in ARchitect World
     */
    onWikitudeError: function(e){
      var msg = "********* INIT.JS wikitude error " + JSON.stringify(e);
      $("#error_messages").append("<p>"+msg+"</p>");
      console.log(msg);
    },
    onWikitudePause: function(a,b,c){
      var msg = "********* INIT.JS wikitude error " + JSON.stringify([a,b,c]);
      $("#error_messages").append("<p>"+msg+"</p>");
      console.log(msg);
    },
    onWikitudeResume: function(a,b,c){
      var msg = "********* INIT.JS wikitude error " + JSON.stringify([a,b,c]);
      $("#error_messages").append("<p>"+msg+"</p>");
      console.log(msg);
    },    
    onClickInARchitectWorld: function(url) {
      app.report('url: ' + url);
      if (app.getUrlParameterForKey(url, 'text')) {
        app.report("you clicked on a label with text: " + app.getUrlParameterForKey(url, 'text'));
      } else if (app.getUrlParameterForKey(url, 'action')) {
        app.wikitudePlugin.onBackButton();
      } else if (app.getUrlParameterForKey(url, 'status')) {
        app.wikitudePlugin.hide();
      }
    },
    // A callback which gets called if the device is able to launch ARchitect Worlds
    onDeviceSupportedCallback: function() {
      app.isDeviceSupported = true;
    },
    
    // A callback which gets called if the device is not able to start ARchitect Worlds
    onDeviceNotSupportedCallback: function() {
      app.receivedEvent('Unable to launch ARchitect Worlds on this device');
    },
    addScreenShot: function(path){
      var lst = JSON.parse(sessionStorage.getItem("snapshots") || "[]");
      lst.push({url:path, time:new Date().getTime()});
      sessionStorage.setItem("snapshots", JSON.stringify(lst));
    },
    clearScreenShots: function(){
      sessionStorage.setItem("snapshots", "[]");
    },
    showSightingsMenu: function(){
      setTimeout(nowCollectTheDead, 1000); 
    },
    shareDocumentedSighting: function(file_index){
      if(!hasAuthenticated()){
        showDialogSocial();
        return;
      }
      var file_name = "ghostdocumentation_" + new Date().getTime() + ".png";
      var lst = JSON.parse(sessionStorage.getItem("snapshots") || "[]");
      navigator.upload_attempt = 0;
      $("#menudialog_shareimage_progress").show();
      uploadPhoto(lst[file_index].url, file_name, function(status, options){
        $("#menudialog_shareimage_progress").html("Storing");
        addSocialShareSighting(file_name);
      }, function(progressEvent){
          if (progressEvent.lengthComputable) {
            var progr = 100*(progressEvent.loaded / progressEvent.total);
            console.log("Uploading file progress " + progressEvent.loaded / progressEvent.total);
            $("#menudialog_shareimage_progress").html("Saving " + progr.toFixed(0));
          } else {
            loadingStatus.increment();
          }        
      });
    },
    onExitingWikitude: function(){
      app.showSightingsMenu();
    },
    onScreenCaptured: function (absoluteFilePath) {
      //TODO: TEST
      app.addScreenShot(absoluteFilePath);
    },
    
    onScreenCapturedError: function (errorMessage) {
      if(errorMessage){
        console.warn(errorMessage);
      }
    },
    
    onUrlInvoke: function (url) {
      if (url.indexOf('captureScreen') > -1) {
        var snapshot_path = "snapshot_"+new Date().getTime()+".png";
        $(".snapshot_hidden").hide();
        app.wikitudePlugin.captureScreen(true, snapshot_path, app.onScreenCaptured, app.onScreenCapturedError);
        $(".snapshot_hidden").fadeIn(800);
      }
      if (url.indexOf('hideCamera') > -1) {
        app.wikitudePlugin.hide();
        app.onExitingWikitude();
      }
      if (url.indexOf('fireWeapon1') > -1) {
        app.fireWeapon(1, url);
      }
      if (url.indexOf('fireWeapon2') > -1) {
        app.fireWeapon(2, url);
      }
  },
    
  loadARchitectWorld: function(samplePath) {
    app.clearScreenShots();
    if(app.wikitudePlugin){
      app.wikitudePlugin.setOnUrlInvokeCallback(app.onUrlInvoke);
      if (app.isDeviceSupported) {
        app.wikitudePlugin.loadARchitectWorld(samplePath);
      } else {
        alert("Device is not supported");
      }
    }
  },
  // --- End Wikitude Plugin ---
  getGameCenterUser: function(){
    /* this simply returns the authentication against gamecenter with the id (that is generated if missing) */
    if(app.player_id){
      if(!app.player_id.id){
        app.player_id.id = CryptoJS.MD5(app.player_id.playerID + "") + "";
      }
      return app.player_id;
    }
    return null;
  },
  onGameCenterSuccessCallback: function (user) {
    console.log("Game center user: " + JSON.stringify(user));
    app.player_id = user;
    // user.alias, user.playerID, user.displayName
    var gamecenter_auth = app.getGameCenterUser();
    // ask server for newest data
    addAuthenticationCache("gamecenter", gamecenter_auth);
    getGameStateSnapshot(gamecenter_auth.id, function(doc){
      var state_online = doc["game_state"];
      var state_cached = game_state.getStateCopy();
      if(state_online && state_cached){
        if(state_online.changed > state_cached.changed){ //if the cache is newer than the online one we must as the user
          cacheStorageSave("state", JSON.stringify(state_online));
        }else{
          //guiAlert("Your current version is newer, we will use your online version.");
          cacheStorageSave("state", JSON.stringify(state_online)); //overwriting 
        }
      }
      //when we know about the user credentials we continue load
      initGame();
    });
  },
  onGameCenterFailureCallback: function (error, errorMessage) {
    var message = "Game center failure " + JSON.stringify(error);
    handleException(message, -1);
    initGame(); // continue loading even if player is not authenticated
  },

  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicity call 'app.receivedEvent(...);'
  onDeviceReady: function() {
    console.log("Device is ready");   
    app.receivedEvent('deviceready');
    console.log("Device is ready ended");
  },
  // Update DOM on a Received Event
  receivedEvent: function(id) {
    console.log('Received Event: ' + id);
    if (id === 'deviceready'){
      this.actors = [];      
      // check if the current device is able to launch ARchitect Worlds
      try{
        app.wikitudePlugin = cordova.require("com.wikitude.phonegap.WikitudePlugin.WikitudePlugin");
        app.wikitudePlugin.onWikitudeError = app.onWikitudeError;
        app.wikitudePlugin.onPause = app.onWikitudePause;
        app.wikitudePlugin.onResume = app.onWikitudeResume;
        console.log("Detected Wikitude");
        app.wikitudePlugin.isDeviceSupported(app.onDeviceSupportedCallback, app.onDeviceNotSupportedCallback);
      }catch(e){
        console.log("Could not load the wikitude plugin. Reason was " + JSON.stringify(e));
      }
      //load notification
      app.loadPushNotification();
      //check for game center
      try{
        window.gamecenter.auth(app.onGameCenterSuccessCallback, app.onGameCenterFailureCallback);
      }catch(e){
        console.log("Failed loading Game center plugin. Reason was " + JSON.stringify(e));
        initGame();
      }      
      //load the store
      try{
        app.loadStore();
      }catch(e){
        console.log("Failed loading Storekit plugin. Reason was " + JSON.stringify(e));
      }

      /*
      fixDeviceHeaders();
      setViewportChanged();
      if (window.device){
        if (parseFloat(window.device.version) === 7.0) {
          document.body.style.marginTop = "20px";
        }
      }
      */                
    }
  },
  report: function(id) {
    console.log("report:" + id);
  }
};


(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

if(ga){
  ga('create', 'UA-30724037-3', 'auto');
  ga('send', 'pageview');
  setTimeout(function(){
  ga('require', 'ecommerce');
  }, 5000);
  //ga('set', 'campaignName', '(direct)');
}

/*
window.fbAsyncInit = function() {
  FB.init({
    appId      : '489334897870038',
    xfbml      : true,
    cookie     : true,
    status     : true,
    version    : 'v2.1',
    //display_mode: 'page'
  });

  FB.Event.subscribe('auth.statusChange', function(response) {
    if (response.status === 'connected') {
    // the user is logged in and has authenticated your
    // app, and response.authResponse supplies
    // the user's ID, a valid access token, a signed
    // request, and the time the access token 
    // and signed request each expire
    //var uid = response.authResponse.userID;
    //var accessToken = response.authResponse.accessToken;
    console.info("User auth and authorized app, checking if already authorized ...");
      if(!sessionStorage.getItem("auth")){
        console.info("User auth and authorized app, fetching from server");
        window.top.location.href = "/auth/facebook/";
      }
    } else if (response.status === 'not_authorized') {
      console.info("User auth and NOT authorized app, ignoring and continue");
      // the user is logged in to Facebook, 
      // but has not authenticated your app
    } else {
      // the user isn't logged in to Facebook.
      console.info("User NOT auth, ignoring and continue");
    }
    //if(!isPhoneGap()){
    //  app.receivedEvent('deviceready'); //fake start browser as a device
    //}
  });
};

(function(d, s, id){
 var js, fjs = d.getElementsByTagName(s)[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement(s); js.id = id;
 js.src = "https://connect.facebook.net/en_US/sdk.js";
 fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
*/

app.initialize();
