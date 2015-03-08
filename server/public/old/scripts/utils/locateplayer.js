var _locating_position_active, watch_id;
function locatePlayer(map, setUserLocationSuccess, setUserLocationFailure){
  
  if (_locating_position_active){ return; }
  _locating_position_active = true; //do this only once


  if (navigator.geolocation){
    logMessage("Using browser location");
    map.locate({
      watch: true,
      timeout: 1000,
      maximumAge: 0,
      enableHighAccuracy: true
    });
    map.on('locationfound', setUserLocationSuccess);
    map.on('locationerror', setUserLocationFailure);
  }else{
    logMessage("Using native location");
    //clear any ongoing watches (reset watch)
    var watch_id = cacheStorageLoad("watch_id");
    if (watch_id){
      navigator.geolocation.clearWatch(watch_id);
      if(game_state.location_error){
        refreshPage();
      }
    }
    //lets watch for the user
    if (!watch_id){
      watch_id = navigator.geolocation.watchPosition(function(position){
        setUserLocationSuccess({
          accuracy: position.coords.accuracy,
          latlng: [
            position.coords.latitude,
            position.coords.longitude
          ]
        });
      }, setUserLocationFailure, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
      cacheStorageSave("watch_id", watch_id);
    }
  }
}