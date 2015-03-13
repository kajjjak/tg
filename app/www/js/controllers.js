/*openPage = function(name){
  window.location.href="#/app/"+name;
}
*/
angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state, $ionicHistory, $ionicPlatform, $ionicModal, $timeout, $cordovaGeolocation, $cordovaDatePicker, $cordovaPush, $cordovaDevice, $cordovaMedia, $cordovaVibration, $cordovaDialogs) {
  // Form data for the login modal
  $scope.loginData = {};

  window.lang = $scope.lang = lang_support[getSelectedLanguage()];


  $scope.$on('$ionicView.enter', function(trans, e){
    if(e.stateName == "app.home"){
      showUserVisualLocation();
    }
  });

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.mdlLogin = modal;
  });

  // Create the revoke job modal that we will use later
  $ionicModal.fromTemplateUrl('templates/revoke.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.mdlRevoke = modal;
  });

  $scope.closeRevoke = function(){
    $scope.mdlRevoke.hide();
  }

  window.openRevoke = $scope.openRevoke = function(){
    $scope.mdlRevoke.show();
  }

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.mdlLogin.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.mdlLogin.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    gateway.sync($scope.loginData.username, $scope.loginData.password, function(result){
      if(result.error == "1443"){
        alert("Username not found, check spelling or contact manager");
      }else{
        $scope.closeLogin();
      }
    });
  };

  // call station
  $scope.callRequest = function(){
    window.location.href="tel:" + window.config.client.number;
  };

  // make the service request
  $scope.makeRequest = function(){
    //open more details window
    $state.go('app.request'); //openPage("request");
  };

  $scope.askNewFeedbackState = function(){
    guiNewFeedbackState();
    //$ionicHistory.currentView($ionicHistory.backView());
    $state.go('app.home', {}, {location: 'replace'});
  }

  // make the service request
  $scope.confirmRequest = function(){
    var job_state = guiHasFeedbackState();
    if(job_state == "active"){openRevoke(); return;}
    if(job_state == "complete"){
      guiNewFeedbackState();
      //$ionicHistory.currentView($ionicHistory.backView());
      $state.go('app.home',{}, {location: 'replace'}); //$state.go('app.home', {}, {"reload": true}); //should move one parent up after requesting new state
      return;
    }
    var data = gateway.getJobData();
    //lets collect all the info
    if(!window.map){  $state.go('app.home'); /*openPage("home");*/ }
    //validate data required
    data.location = window.map.getCenter();
    data.address = getJobAddress();
    if(!data.location){  $state.go('app.home'); /*openPage("home");*/ }
    data.pickup_time = data.pickup_time || new Date().getTime(); //should be set by UI
    data.doctype = "job";
    data.client = {};
    data.driver = {};
    data.notify = {};
    data.client.alias = new Date().getTime();
    data.client.id = gateway.getUserIdentifier();
    data.client.assigned_id = null;
    data.driver.assigned_id = null;
    data.driver.assigned_ts = null;
    data.driver.accepted_ts = null;
    data.notify.accepted_ts = null;
    data.client.accepted_ts = null;
    data.driver.arrives_ts = null;
    data.driver.arrived_ts = null;
    data.notify.arrived_ts = null;
    data.client.arrived_ts = null;
    data.driver.complete_ts = null;
    data.client.complete_ts = null;
    data.client.payment_ts = null;
    data.driver.payment_ts = null;
    data.driver.canceled_ts = null;
    data.notify.canceled_ts = null;
    data.client.canceled_ts = null;
    data.destination = null;
    data.price = null;
    data.route = null;
    //saves the request to server
    gateway.addDocument(data);
    //open communication window    
  };

  $scope.setSelectedJob = function(doc_job){
    //http://stackoverflow.com/questions/25464306/angularjs-ng-click-to-go-to-another-page-with-ionic-framework
    var job = doc_job.value;
    setCurrentGatewayJob(job);
    //$state.go('app.home', {}, {"location": true, "inherit": false, "reload": true});
    $state.go('app.home');
    if(job.location){
      setTimeout(function(){
        if(window.map && window.marker){
          window.marker.setIcon(window.vt.getStateIcon(job));
          window.marker.setLatLng(job.location);
          window.map.setView(job.location);
          $(".job_address").html(job.address.formated)
        }
      }, 100);
    }
  };

  $scope.setRequestProperty = function(val){
    //{type: x, data:y}
    gateway.setJobData(val);
  };

  $scope.setDriverProperty = function(val){
    gateway.setUserSetting(val.type, val.id);
  };

  $scope.showServicePicker = function(){
    if(guiHasFeedbackState()){openRevoke(); return;}
    //window.location.href="#/app/service";
    $state.go('app.service');
  };

  $scope.showDatePicker = function(){
    if(guiHasFeedbackState()){openRevoke(); return;}
    $cordovaDatePicker.show({
        date: new Date(),
        mode: 'time'
    }).then(function (date) {
        gateway.setJobData({type: 'pickup_time', data: new Date(date).getTime()});
    });  
  };

  $scope.showUserCurrentLocation = function(){
    var p = gateway.getUserLocation();
    window.map.setView(p);
  };

  $scope.watchUserLocation = function(){
    console.log("Registering geolocation plugin");
    var watchOptions = {
      frequency : 1000,
      timeout : 3000,
      enableHighAccuracy: true //false // may cause errors if true
    };

    var watch = $cordovaGeolocation.watchPosition(watchOptions);
    watch.then(
      null,
      function(err) {
        // error
        console.log("Geo location failure: " + JSON.stringify(err));
      },
      function(position) {
        console.log("Geo location success: " + JSON.stringify(position));
        var lat  = position.coords.latitude;
        var lng = position.coords.longitude;
        var dist = position.coords.accuracy || 100;
        gateway.setUserLocation([lat, lng]);
        showUserVisualLocation([lat, lng], dist);
    });

  }

  // REGISTER PUSH NOTIFICATION
    $scope.notifications = [];

    // Register
    $scope.registerPushNotification = function () {
        var config = null;
        if (ionic.Platform.isAndroid()) {
            config = {
                "senderID": "449629838087" // REPLACE THIS WITH YOURS FROM GCM CONSOLE - also in the project URL like: https://console.developers.google.com/project/434205989073
            };
        }
        else if (ionic.Platform.isIOS()) {
            config = {
                "badge": "true",
                "sound": "true",
                "alert": "true"
            }
        }

        $cordovaPush.register(config).then(function (result) {
            console.log("Registering push notification success " + result);

            $scope.registerDisabled=true;
            // ** NOTE: Android regid result comes back in the pushNotificationReceived, only iOS returned here
            if (ionic.Platform.isIOS()) {
                $scope.regId = result;
                storeDeviceToken("apn");
            }
        }, function (err) {
            console.log("Register error " + err)
        });
    }

    // Notification Received
    $scope.$on('$cordovaPush:notificationReceived', function (event, notification) {
        console.log(JSON.stringify([notification]));
        if (ionic.Platform.isAndroid()) {
            handleAndroid(notification);
        }
        else if (ionic.Platform.isIOS()) {
            handleIOS(notification);
            $scope.$apply(function () {
                $scope.notifications.push(JSON.stringify(notification.alert));
            })
        }
    });

    // Android Notification Received Handler
    function handleAndroid(notification) {
        // ** NOTE: ** You could add code for when app is in foreground or not, or coming from coldstart here too
        //             via the console fields as shown.
        console.log("In foreground " + notification.foreground  + " Coldstart " + notification.coldstart);
        if (notification.event == "registered") {
            $scope.regId = notification.regid;
            storeDeviceToken("gcm");
        }
        else if (notification.event == "message") {
            $cordovaDialogs.alert(notification.message, "Push Notification Received");
            $scope.$apply(function () {
                $scope.notifications.push(JSON.stringify(notification.message));
            })
        }
        else if (notification.event == "error")
            $cordovaDialogs.alert(notification.msg, "Push notification error event");
        else $cordovaDialogs.alert(notification.event, "Push notification handler - Unprocessed Event");
    }

    // IOS Notification Received Handler
    function handleIOS(notification) {
        // The app was already open but we'll still show the alert and sound the tone received this way. If you didn't check
        // for foreground here it would make a sound twice, once when received in background and upon opening it from clicking
        // the notification when this code runs (weird).
        
        var alert_dialog = null;
        if (notification.sound) {
          alert_dialog = window.lang.notification[notification.sound] || {"title": "Alert", "message": "Notification was receaved"};
        }

        if (notification.foreground == "1") {

            if (alert_dialog) {
              if (alert_dialog.vibrate){$cordovaVibration.vibrate(alert_dialog.vibrate);}            
              $cordovaDialogs.alert(alert_dialog.message, alert_dialog.title);
            }

            if (notification.badge) {
                $cordovaPush.setBadgeNumber(notification.badge).then(function (result) {
                    console.log("Set badge success " + result)
                }, function (err) {
                    console.log("Set badge error " + err)
                });
            }

            // Play custom audio if a sound specified.
            if (notification.sound) {
                var mediaSrc = $cordovaMedia.newMedia("sound/" + notification.sound + ".mp3");
                mediaSrc.play();
            }
        }
        // Otherwise it was received in the background and reopened from the push notification. Badge is automatically cleared
        // in this case. You probably wouldn't be displaying anything at this point, this is here to show that you can process
        // the data in this situation.
        else {
            if (alert_dialog) {
                $cordovaDialogs.alert(alert_dialog.message, alert_dialog.title);
            }
        }
    }

    // Stores the device token in a db using node-pushserver (running locally in this case)
    //
    // type:  Platform type (ios, android etc)
    function storeDeviceToken(type) {
        // Create a random userid to store with it
        var data = {"type": "notification_" + type, "data": $scope.regId};
        console.log("Store token for registered device with data " + JSON.stringify(data));
        $scope.setRequestProperty(data);
    }

    // Unregister - Unregister your device token from APNS or GCM
    // Not recommended:  See http://developer.android.com/google/gcm/adv.html#unreg-why
    //                   and https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplication_Class/index.html#//apple_ref/occ/instm/UIApplication/unregisterForRemoteNotifications
    //
    // ** Instead, just remove the device token from your db and stop sending notifications **
    $scope.unregister = function () {
        console.log("Unregister called");
        removeDeviceToken();
        $scope.registerDisabled=false;
        //need to define options here, not sure what that needs to be but this is not recommended anyway
//        $cordovaPush.unregister(options).then(function(result) {
//            console.log("Unregister success " + result);//
//        }, function(err) {
//            console.log("Unregister error " + err)
//        });
    }


  //document.addEventListener("deviceready", function () {
  $ionicPlatform.ready(function() {

    gateway.init($cordovaDevice.getUUID());
    gateway.setCallbackChange(guiCallbackGatewayProperty, setCurrentGatewayJob);
    try{
      $scope.watchUserLocation();
      $scope.registerPushNotification();
    }catch(e){
      console.log("Error registering watch or notification. Got: " + JSON.stringify(e));
    }
    setTimeout(function(){
      window.vt = new GatewayTracker(config.database.name, window.map, guiShowFeedbackState, function(e){
          alert(JSON.stringify(e));
        }, function(marker){
        }, {"path_view": "/_design/jobs/_view/user?keys=[\"" + gateway.getUserIdentifier() + "\"]"});
      window.vt.init();
    }, 1000);
 
    document.addEventListener("resume", function() {
      //https://blog.nraboy.com/2014/09/handling-apache-cordova-events-ionicframework/
      if(window.vt){
        window.vt.stop();
        window.vt.start();
      }
    }, false);

  });


})

.controller('JobsCtrl', function($scope) {

  $scope.doRefreshJobs = function() {
    if(window.vt){
      window.vt.stop();
      window.vt.start({
        callback_updated: function(){
          //TODO UPDATE VIEW
          $scope.jobs = getNiceJobFormat(window.vt.getJobs());
          $scope.$broadcast('scroll.refreshComplete');
          $scope.$apply()
        }
      });
    }else{
      $scope.$broadcast('scroll.refreshComplete');
      $scope.$apply()      
    }
  };

  if(window.vt){
    $scope.jobs = getNiceJobFormat(window.vt.getJobs());
  }

})

.controller('ServiceCtrl', function($scope) {
  $scope.vechicles = config.service.vehicles;
  $scope.services = config.service.options;  
  $scope.vechicles[(window.gateway.getJobData().vehicles || 1) + ""].selected = true;
})

.controller('DriverCtrl', function($scope) {
  $scope.vechicles = config.service.vehicles;
  $scope.services = config.service.options;  
  $scope.vechicles[(window.gateway.getUserSettings().vehicles || 1) + ""].selected = true;

})

.controller('RequestCtrl', function($scope) {
  $scope.vehicle = window.config.service.vehicles[gateway.getJobData().vehicles || 2];
  guiShowFeedbackState();
})

.controller('SettingsCtrl', function($scope, $state, $window) {
  
  $scope.languages = window.config.internationalization; //[{"title": "English", "id":"en"}, {"title": "Íslensku", "id": "is"}];
  $scope.languages[getSelectedLanguage()].selected = true;

  $scope.setLanguage = function(lang_id){
    localStorage.setItem("lang", lang_id);
    //$state.go('app.home', {}, {"reload": true}); 
    $window.location.reload(true); //http://stackoverflow.com/questions/25192172/force-view-to-reload-in-ionic-framework
  }

  $scope.showDriverPage = function(){
    $state.go('app.driver');
  }
})

.controller("MapCtrl", [ '$scope', function($scope) {
  
  window.map = L.map('map').setView(window.config.map.position, window.config.map.zoom);
  
  // add an OpenStreetMap tile layer
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  //create our marker
  window.marker = L.marker(map.getCenter()).addTo(map);   

  var setCenterMarker = function(){
    var latlng = map.getCenter();
    if(!window.vt.getFiltered()){
      window.marker.setLatLng (latlng);
    }
    return latlng;
  };

  var setDraggedEnd = function(){
    if(!window.vt.getFiltered()){
      var latlng = window.marker.getLatLng();
      fetchJobAddress(latlng.lat, latlng.lng);
    }
  }

  window.map.on('move', setCenterMarker);
  window.map.on('zoomend ', setCenterMarker);
  window.map.on('moveend ', setDraggedEnd);

}]);

/// gui functions

function guiGetTimeString(mstime){
  var dt = new Date(mstime);
  var hours   = dt.getHours();
  var minutes = dt.getMinutes();

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  var time    = hours+':'+minutes;
  return time;  
}

function setCurrentGatewayJob(doc){
  console.info("Selected job " + JSON.stringify(doc));
  guiShowFeedbackState(doc);
  window.vt.stop();
  window.vt.clearFilterMarkers();
  window.vt.setFilterMarkers(doc._id, true);
  window.vt.start();
}

function guiCallbackGatewayProperty(attr, val){
  if((attr == "pickup_time") && (val)){
    $("#request_time").html(guiGetTimeString(val));
  }
  if((attr == "vehicles") && (val !== undefined)){
    for(var i in config.service.vehicles){
      var itm = config.service.vehicles[i];
      if(itm.id == val){
        itm.selected = false;
        $("#request_service").html(itm.title);
         itm.selected = true;
      }
    }
  }
}

function guiShowFeedbackStateItem(txt, checked){
  //return '<li class="item">' + txt + '</li>';
  var chkd ='<label class="checkbox"><input type="checkbox" disabled></label>';
  if(checked){chkd ='<label class="checkbox"><input type="checkbox" checked disabled></label>';}
  return '<li class="item item-checkbox">' + chkd + txt + '</li>';
}

function guiShowFeedbackState (doc, fetched_server){
  if(fetched_server){ return; }
  $("#request_action").addClass("button-calm").html(window.lang.page.request.btn_confirm);
  doc = doc || JSON.parse(localStorage.getItem("request_state") || '{"driver":{}, "client":{}}');
  //if(!doc.address){ doc.address = getJobAddress() || {"formated": window.lang.page.request.lbl_address}; }
  var address = getJobAddress() || {"formated": window.lang.page.request.lbl_address};
  var address_html = address.formated;
  var update_time = new Date().toLocaleTimeString(config.locale.datetime);
  var completed_job = false; 
  try{completed_job = (doc.driver.complete_ts || doc.client.complete_ts); }catch(e){}
  var html = "";
  if(doc.pickup_time || doc.datetime){
    if(!doc.address){ doc.address = {"formated": "unknown"}; }
    address_html = doc.address.formated;
    html = html + guiShowFeedbackStateItem(window.lang.page.request.feedback_states.request, true);
    html = html + guiShowFeedbackStateItem(window.lang.page.request.feedback_states.assigned, (doc.driver.assigned_ts && doc.driver.assigned_id));
    html = html + guiShowFeedbackStateItem(window.lang.page.request.feedback_states.arrived, (doc.driver.arrived_ts));
    html = html + guiShowFeedbackStateItem(window.lang.page.request.feedback_states.complete, completed_job);
    html = html + '<center><button id="btn_update_feedbackstate" class="button button-clear button-stable" onclick="guiUpdateJob()">' + lang.page.request.lbl_updated + ' ' + update_time + '</button></center>'; //add button
    $("#request_action").addClass("button-dark").html(window.lang.page.request.btn_cancel);
    var mrkr = window.vt.setMapChanged(doc);
    mrkr.addTo(window.map);
    mrkr.update();
  }
  try{$("#request_service").html(window.config.service.vehicles[(window.gateway.getJobData().vehicles || 1) + ""].title)}catch(e){}
  $("#state_address").html(address_html);
  $("#state_feedback").html('<ul class="list">'+html+'</ul>');
  localStorage.setItem("request_state", JSON.stringify(doc));
  if(completed_job || doc.driver.canceled_ts || doc.client.canceled_ts){
    $("#request_action").removeClass("button-dark").addClass("button-calm").html(lang.page.request.btn_complete);
  }
  /*
  if(completed_job || doc.driver.canceled_ts || doc.client.canceled_ts){
    guiHideFeedbackState(doc);
  }
  */
}

function guiHasFeedbackState(doc){
  doc = doc || JSON.parse(localStorage.getItem("request_state") || '{"driver":{}, "client":{}}');
  if(doc.pickup_time || doc.datetime){
    var completed_job = (doc.driver.complete_ts || doc.client.complete_ts);
    if(completed_job || doc.driver.canceled_ts || doc.client.canceled_ts){
      return "complete"; //means that the job has ended
    }
    return "active"; //means that it exists and active
  }
  return null; //means no state
}

function guiHideFeedbackState(doc){
  $("#request_action").removeClass("button-dark").addClass("button-positive").html(lang.page.request.btn_complete);
  localStorage.removeItem("request_state");
}

function guiNewFeedbackState(doc){
  doc = doc || {};
  localStorage.removeItem("request_state");
  window.vt.clearFilterMarkers();
  window.vt.setFilterMarkers(undefined, true); //show nothing
  window.vt.start();
  pan2UserVisualLocation();
}

function getNiceJobFormat(jobs){
  var d;
  jobs.sort(function(a, b){return (b.value.pickup_time || b.value.datetime)-(a.value.pickup_time || a.value.datetime)});
  for(var i in jobs){
    d = new Date(jobs[i].value.pickup_time || jobs[i].value.datetime);
    jobs[i].value.pickuptime_str = d.toLocaleString();
    jobs[i].value.state_str = lang.page.request.state_map[guiHasFeedbackState(jobs[i].value) || "waiting"];
    jobs[i].value.address_label = jobs[i].value.address.formated;
  }
  return jobs;
}

function guiUpdateJob(){
  $("#btn_update_feedbackstate").html(lang.page.request.lbl_updating);
  window.vt.start({update:true});
}

function getSelectedLanguage(){
  return localStorage.getItem("lang") || window.config.language;
}

function fetchJobAddress(lat, lng){
  window.timedid = new Date().getTime();
  $(".job_address").html(lang.page.map.lbl_fetchingaddress);
  setTimeout("_fetchJobAddress("+lat+", "+lng+", "+timedid+")", 2000);
}

function _fetchJobAddress(lat, lng, passed_timedid){
  if(passed_timedid != window.timedid){ return; } //then we recently asked for a new location (when moving the map)
  var url = "http://taxigateway.com/api/geocode/reverse/"+lat+"/"+lng+"/mapquest";
  $.getJSON(url, function(res){
    var address = res.street;
    if(res.street_number){ address = address + " " + res.street_number; }
    if(res.city){ address = address + ", " + res.city; }
    res.formated = address;
    sessionStorage.setItem("job_address", JSON.stringify(res));
    $(".job_address").html(address);
  });
}

function getJobAddress(){
  return JSON.parse(sessionStorage.getItem("job_address") || "null");
}
function handleException(e){
  console.log(e);
}

function showUserVisualLocation(loc, dist){
  if(!window.map){ return ; }
  loc = loc || gateway.getUserLocation();
  dist = dist || 100;
  if(window.user_location_marker){
    try{ //it exists but something is wrong
      dist = window.user_location_marker.getRadius() || 100;
      window.user_location_marker.addTo(window.map);
    }catch(e){ window.user_location_marker = undefined; }
  }else{ //first location lset move our marker there
    pan2UserVisualLocation();
  }
  if(!window.user_location_marker){
    window.user_location_marker = L.circle(loc, dist, {
      color: 'blue',
      fillColor: 'blue',
      fillOpacity: 0.2
    }).addTo(window.map);
  }
  window.user_location_marker.setLatLng(loc);
  if(dist){window.user_location_marker.setRadius(dist);}
}

function pan2UserVisualLocation(){
  setTimeout(function(){
    window.map.panTo(window.user_location_marker.getLatLng());
  }, 2000);

}