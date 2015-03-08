
var CONST_BUTTON_WATCH_FALSE = "gui_battle_watch_false"; //"scan";
var CONST_BUTTON_WATCH_SEARCHING = "gui_battle_watch_searching";//'searching';
var CONST_BUTTON_WATCH_TRACKING = "gui_battle_watch_tracking"; //'<a href="#" onclick="showCameraView();">trap ghosts</a>';
var CONST_BUTTON_WATCH_ERROR_LOCATION = "gui_battle_watch_errorlocation"; //'position could not be found';
var CONST_BUTTON_WATCH_ERROR_UNAVAILABLE = "gui_battle_watch_errorunavailable"; //'geolocation is not available';
var CONST_BUTTON_WATCH_CHARGING = "gui_battle_watch_charging"; //'charging';
var CONST_BUTTON_WATCH_IDLE = "gui_battle_watch_idle"; //'ready';

var battle_state = {
  statistics: {
    bounties:{}
  },
  economy:{
    score: 0,
    money: 1000,
    XX: 0
  },
  player:{
    watch:false,
    item:{
      //all the items the player owns
    },
    rewards:[]
  },
  radar:{
    state: 0,
    charge: 10,
    drain: -1,
    power: 100,
    frequency: "1000 hz",
    range: 10
  },
  burster:{
    state: 0,
    power: 100,
    charge: 10,
    drain: -50,
    aim: null,
    damage: 50
  },
  discovered:{

  }
};
/*var battle_ghosts = {
  'discovarable': {name: 'discovarable', arimage: 'marker_actor0.png', radar_circle_width: 0.09, radar_circle_color: '#00FF00', bounty: 10, speed: 7000, altitude: undefined, random_range: 0.0001, health: 100},
  'ghost1': {name: 'ghost1', arimage: 'marker_actor1.png', radar_circle_width: 0.09, radar_circle_color: '#00FF00', bounty: 10, speed: 7000, altitude: undefined, random_range: 0.0001, health: 100},
  'ghost2': {name: 'ghost2', arimage: 'marker_actor2.png', radar_circle_width: 0.09, radar_circle_color: '#00FF00', bounty: 10, speed: 7000, altitude: undefined, random_range: 0.0001, health: 200}
};
*/
function showGhosts(){
  battle_state.player.watch = true;
  var ghosts = mmgr.getActorsByType("ghost");
  if (battle_state.radar.state === 0){//(battle_state.radar.power == 100)){
    getGhosts();
    $("#scan_label").innerHTML = CONST_BUTTON_WATCH_TRACKING;
    battle_state.radar.state = 1;
  }
  //if(battle_state.radar.state === 0){battle_state.radar.state = 1;}
  mmgr.viewActors("ghost");
}
/*
function loadControls(map){
    var scan_label = document.getElementById('scan_label');
    var scan_button = document.getElementById('scan_button');
    $("#scan_meter").val(battle_state.radar.power);
    
    if (!navigator.geolocation) {
        scan_label.innerHTML = CONST_BUTTON_WATCH_ERROR_UNAVAILABLE;
    } else {
        scan_button.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            scan_label.innerHTML = CONST_BUTTON_WATCH_SEARCHING;
            showGhosts();
        };
    }

    // Once we've got a position, zoom and center the map
    // on it, and add a single marker.
    map.on('locationfound', function(e) {
        if(!window.player){
            map.fitBounds(e.bounds);
            window.player = addUserLocation(map, e.latlng);
            // And hide the geolocation button
            //scan_label.parentNode.removeChild(scan_label);   
            showGhosts();
        }else{
            window.player.setPosition(e.latlng);
        }
        if(battle_state.player.watch){
          if(map.panTo){map.panTo(e.latlng);}
        }
    });

    // If the user chooses not to allow their location
    // to be shared, display an error message.
    map.on('locationerror', function() {
        scan_label.innerHTML = CONST_BUTTON_WATCH_ERROR_LOCATION;
    });

    // handles the disabling of follow user button
    map.on('movestart', function(){
      battle_state.player.watch = false;
      $("#scan_label").html(CONST_BUTTON_WATCH_FALSE);
    });

    setTimeout(function(){
      map.locate({
          watch: true,
          timeout: 1000,
          maximumAge: 0,
          enableHighAccuracy: true
      });      
    }, 2000);
}

function addGameItem(){
  var item_id = $(".item_view_selected").val();
  var item = game_items[item_id];
  battle_state.player.item[item_id] = 1;
  if(item.type == "weapon"){
    addPlayerEconomy("money", (-1)*item.price.amount);
    showMainMenu();
  }else{
    addPlayerEconomy("money", (-1)*item.price.amount);
    showMap();
    setTimeout(function(){
      var p = addMovableItem(item);
      p.mapZoomTo({zoom_delta:3});
    }, 500);
  }
}

function addMovableItem(item, latlng){
  var range, name = item.id;
  if (item.type == "repeller"){
    range = item.property.range;
  }
  if (item.type == "collector"){
    range = item.property.range;
  }
  latlng = latlng || window.player.getPosition();//getRandomPosition(0.009);
  var p = mmgr.createActor(name, {
      latitude : latlng.lat,
      longitude: latlng.lng,
      type: item.type,
      base_class: name,
      range_detection: range,
      draggable: true,
      map: map,
      properties: item.property
  });
  if (item.type == "repeller"){
    p.setLayerBaseCircle({
      color:'black',
      fillColor:'gray',
      fillOpacity: 0.3
    });
  }
  if (item.property.scanner_range){
    battle_state.radar.range = item.property.scanner_range;
  }
  if (item.property.charge_scanner){
    battle_state.radar.charge = battle_state.radar.charge + item.property.charge_scanner;
  }
  if (item.property.charge_burster){
    battle_state.burster.charge = battle_state.burster.charge + item.property.charge_burster;
  }
  p.show();
  return p;
}

function setMovableItemPosition(item_id){
  item_id = item_id || $(".item_view_selected").val();
  var item = mmgr.actors[item_id];
  var pos = window.player.getPosition();//getRandomPosition(0.009);
  item.setPosition(pos);
  showMap();
}
*/
/*
function addUserLocation (map, latlng){
  var p = mmgr.createActor('player', {
    latitude : latlng.lat,
    longitude: latlng.lng,
    base_class:'player',
    range_detection: battle_state.radar.range,
    iconSize: [30, 30],
    map: map
  });
  p.setLayerBaseCircle({
    color:'#7AA3CC',
    fillColor:'#99CCFF',
    fillOpacity: 0.3
  });
  p.show();
  p.click(function(e){
    showCameraView();
  });
  return p;
}
*/

function getBattleStateScannerProperty(attr){
  var itm = inventory.getItemByType("gunboat")[0];
  var details = shop.getItemByType("gunboat")[0]; //lets start with level 0 poperties
  if(itm){
    details = inventory.getItemDetails(itm);
  }
  if(attr){return details[attr];}
  return details;
}

function getBattleStateRadarProperty(attr){
  var itm = inventory.getItemByType("radar")[0];
  var details = shop.getItemByType("radar")[0]; //lets start with level 0 poperties
  if(itm){
    details = inventory.getItemDetails(itm);
  }
  if(attr){return details[attr];}
  return details;
}


function showCameraView(close_actors){
  var close_actors_data = [];
  var close_actors_ids = [];
  var scanner = getBattleStateScannerProperty();
  close_actors = close_actors || getClosestActors(scanner.scanner_range); //battle_state.radar.range
  var ghost_level = 0;
  var traps = inventory.getItemByCategory("defense");
  showAttackLocationsValidateFunds();

  try{ //lets try to update the player circle base for better visual feedback. The base is probably ok but just in calse
      mmgr.actors.player.circle_base.setRadius(scanner.scanner_range);
  }catch(e){};

  for (var i in close_actors){
    //freezee actors
    close_actors[i].moveHalt();
    close_actors[i].__frozen = true;
    var a = close_actors[i];
    //collect data
    if(a.type == "ghost"){ //want only close ghosts
      close_actors_data.push(getGhostData(a));
      close_actors_ids.push(a.id);
      ghost_level = Math.max(ghost_level, a.getGameProperty("level")); //get highest ghost level
    }
  }
  //check if we have any ghosts
  if(close_actors_data.length == 0){
    guiAlertHide();
    guiAlert(_lang["gui_battle_collect_missingghost_text"], {"title": _lang["gui_battle_collect_missingghost_title"]});
    return;
  }
  if (battle_state.radar.state === 0){//(battle_state.radar.power == 100)){
    $("#scan_label").innerHTML = CONST_BUTTON_WATCH_TRACKING;
    battle_state.radar.state = 1;
  }
  //check the traps
  var trap_details = {};
  var trap_accepted = false;
  for (var i in traps){
    trap_details = inventory.getItemDetails(traps[i]);
    if(trap_details["capacity_car"+ghost_level]){ trap_accepted = true; break; } //check if carx is available, find only one
  }
  if(!trap_accepted){
    guiAlert(_lang["gui_battle_collect_missingtraps_text"], {"title": _lang["gui_battle_collect_missingtraps_title"]});
    return;    
  }
  //pay the price
  var price = game_state.getAttackPrice();
  try{
    game_state.addBattleTransaction(-price.gold_budget, "battle", false);
  }catch(e){
    return;    
  }

  
  game_state.setBattleState("viewing", close_actors_ids);
  
  saveGameState();
  localStorage.setItem("close_actors", JSON.stringify(close_actors_data));
  app.showARView();
}

function getGhostData(a){
  var p = a.getPosition();
  return {
      id: a.id,
      base_class: a.base_class,
      latitude: p.lat,
      longitude: p.lng,
      properties: a.properties,
      range_detection: a.range_detection,
      type: a.type || "default",
      name: a.name || a.type,
      title: a.name || a.type,
      description: a.description || "......",
      altitude: a.altitude || 0,
      collision_detection: a.collision_detection || 10,
      rotation:a.rotation || 0
  };
}

function getClosestActors(distance){
  var a, d, close_actors = [];
  var player = getOrCreatePlayer();
  for (var i in mmgr.actors){
    a = mmgr.actors[i];
    d = player.distanceToActor(a);
    if(d < distance){
      close_actors.push(a);
    }
  }
  return close_actors;
}

function randomPositionInRange(r){
  return (r/2.0)-(Math.random()*r);
}

function avoidRepellersRange(pos){
  /*TODO: when adding repeller we can use this function*/
/*  for (var j in battle_state.player.item){
    var item = mmgr.actors[j];
    if ((item) && (item.type == "repeller")){
      pos = getPositionOutsideOfRange(pos, item.getPosition(), item.properties.range_havsine);
    }
  }
*/
  return pos;
}
/*
function keepActorsMoving(){
  var a, pos;
  var ghosts = mmgr.getActorsByType("ghost");
  for (var i in ghosts){
    a = ghosts[i];
    if (!a.isMoving() && (!a.__frozen)){
      //lets try to find a target pos in our actors
      var a_type = a.base_class;
//      if(battle_actors[a_type]){
//        for (var i in battle_actors[a_type]["actors"]){
//          if(battle_actors[a_type]["actors"][a.id]){
//            if(battle_actors[a_type]["actors"][a.id]["target"]){
//              pos = battle_actors[a_type]["actors"][a.id]["target"]
//            }
//          }
//        }
//      }
      if(!pos){ //ok our ghost does not have a target positions, lets make him walk around randomly
        var radom_range = a.getGameProperty("random_range");
        if(radom_range === undefined){ continue; }
        var dis;
        var pos1 = a.getRandomPosition(radom_range);
        var dis1 = a.distanceTo(pos1);
        var pos2 = a.getRandomPosition(radom_range);
        var dis2 = a.distanceTo(pos2);
        var pos3 = a.getRandomPosition(radom_range);
        var dis3 = a.distanceTo(pos3);
        var pos4 = a.getRandomPosition(radom_range);
        var dis4 = a.distanceTo(pos4);
        if (dis1 < dis2){ //second try to move the ghost more near user
          pos = pos1;
          dis = dis1;
        }else{
          pos = pos2;
          dis = dis2;
        }
        if (dis3 < dis){
          pos = pos3;
          dis = dis3;
        }
        if (dis4 < dis){
          pos = pos4;
          dis = dis4;
        }
        pos = avoidRepellersRange(pos);
      }
      if(pos){a.moveTo(pos, {speed:a.getGameProperty("speed")});}
    }
  }
}
*/
function ticker(){
  //keepActorsMoving();
  addScannerPower();
}

function showScannerPower(power, state){
  if(state != null){
    $("#scan_label").html(_lang[state]);
  }
  $("#scan_meter").val(power);
  if(app.wikitudePlugin){
    app.wikitudePlugin.callJavaScript('setTimerProgress('+power+');');
  }
}

function setActionAttackGhosts(){
  if (battle_state.radar.state == 0){
    showCameraView();
  }else if (battle_state.radar.state == 1){ //is showing ghosts, lets now allow to view in AR
    showCameraView();
  }else if (battle_state.radar.state == -1){ //is showing ghosts, lets now allow to view in AR
    guiAlert(_lang["gui_battle_message_charging_text"], {"title": _lang["gui_battle_message_charging_title"]});
  }
}

function addScannerPower(){
  var s = null;
  var radar = getBattleStateRadarProperty();
  var power = 100;
  //use upgraded item configuration before applying state changes
  battle_state.radar.drain = -(power/radar.drain_time);
  battle_state.radar.charge = power/radar.charge_time;
  //manage state change for scanner
  if (battle_state.radar.state == 0){
    d = 0;
    s = CONST_BUTTON_WATCH_IDLE;
    game_state.setGameMode("economy");
  }
  if (battle_state.radar.state == 1){
    d = battle_state.radar.drain;
    s = CONST_BUTTON_WATCH_TRACKING;
    game_state.setGameMode("attack_countdown");
  }
  if (battle_state.radar.state ==-1){
    d = battle_state.radar.charge;
    s = CONST_BUTTON_WATCH_CHARGING;
  }
  battle_state.radar.power = battle_state.radar.power + d;
  
  if ((battle_state.radar.power <= 0)){
    battle_state.radar.power = 0;
    app.hideARView(true);
    battle_state.radar.state = -1; //recharge mode
    
  }
  if (battle_state.radar.power >= power){
    battle_state.radar.power = power;
    battle_state.radar.state = 0; //idle mode
    game_state.setGameMode("economy");
  }
  showScannerPower(battle_state.radar.power, s);

}
/*
function sellBonds(){
  if (getPlayerEconomy("bonds")){
    addPlayerEconomy("bonds", -1);
    addPlayerEconomy("money", 1000);
  }
}

function addBonds(){
  addPlayerEconomy("bonds", 1);
}

function getPlayerEconomy(type){
  return battle_state.economy[type] || 0;
}

function addPlayerEconomy(type, value){
  if(battle_state.economy[type] === undefined){
    battle_state.economy[type] = 0;
  }
  battle_state.economy[type] = battle_state.economy[type] + value;
  if(type == "money"){
    $(".stats_money").html("$" + battle_state.economy[type]);
  }
  if(type == "power"){
    $(".stats_power").html(battle_state.economy[type] + "%");
  }
  if(type == "bonds"){
    $(".stats_bonds").html(battle_state.economy[type] + " bonds");
  }
  saveGameState();
  reward.setScore(app.player_id, type, battle_state.economy[type], this.receaveReward);
}
*/
function saveGameState () {
  localStorage.setItem("battle_state", JSON.stringify(battle_state));
}

function setViewportChanged(timeout){
  timeout = timeout || 100;
  setTimeout(function(){
    map.invalidateSize();
  }, timeout);
}
/*
function showScanner(){
    //$("#scanner_property_state").html(battle_state.radar.state);
    $("#scanner_property_charge").html(battle_state.radar.charge);
    $("#scanner_property_drain").html(battle_state.radar.drain);
    $("#scanner_property_range").html(battle_state.radar.range);
    $("#scanner_property_frequency").html(battle_state.radar.frequency);
}

function showMap(){
  window.location.href = "#page_map";
  setViewportChanged(1000);
  showScanner();
}

*/

function addStatistics(a){
  var stat = getGhostData(a);
  stat.timeofdeath = new Date().getTime();
  if(!battle_state.statistics.bounties[a.base_class]){
    battle_state.statistics.bounties[a.base_class] = [];
  }
  battle_state.statistics.bounties[a.base_class].push(stat);
}
/*
function setBattleStateDiscovered(id, val){
  //battle_state.discovered[id] = val;
  var bsd = game_state.getItem("discovered") || {};
  bsd[id] = val;
  game_state.setItem("discovered", bsd);
}
*/
function getBattleStateDiscovered(id){
/*  if(id){
    return battle_state.discovered[id];
  }else{
    return battle_state.discovered;
  }
*/
  var bsd = game_state.getItem("discovered") || {};
  if(id){return bsd[id];}else{return bsd;}
}

function nowCollectTheDead(){
    var dead = JSON.parse(localStorage.getItem("actor_hits") || "{}");
    var a,gid,killed = {};
    var phonecalls = game_state.getBattleState("phonecalls") || {};
    //var discovered = [];
    for (var gid in dead){
        a = mmgr.actors[gid];
        if (a){
          //bounty = bounty + parseFloat(a.getGameProperty("bounty"));
          addStatistics(a);
          if((phonecalls) && (phonecalls[gid])){
            phonecalls[gid]["killed"] = new Date().getTime();
            killed[gid] = phonecalls[gid];
          }else{
            killed[gid] = {"type": a.getGameProperty("car") || "car1", "location": {}};
          }
          a.destroy(); //TO ADD SENSE OF ACCOMPLISMENT WE COULD HIDE GHOST SETTING THE GAMEPROPERTY TO KILLED (CHECKING THIS EVERY TIME WE SHOW GHOSTS, SHOWING THE GHOSTS IF TIMOUT IS OVER)
          /*
          if(a.base_class == "discovarable"){ //check what was discovered
            discovered.push(a.id); 
            setBattleStateDiscovered(a.id, new Date().getTime());
          }
          */
        }
     }
     if((Object.keys(phonecalls).length) && (a)){game_state.setBattleState("phonecalls", phonecalls);}
     setGameStatusBattleEnds(killed);
     localStorage.removeItem("actor_hits");
     removeAttackAROnlyTempActors(); //if any
     updateAttackCount();
}
/*
function hideGhosts(){
  var ghosts = mmgr.getActorsByType("ghost");
  saveGhosts(ghosts);
  for (var i =0 ; i < ghosts.length; i++){
    ghosts[i].show(false, {fade:{duration:1000}});
  }
}

function getPositionOutsideOfRange(position, point, range){
  var lat_min, lat_max, lng_min, lng_max;
  var half_range = range;
  lat_max = point.lat+range;
  lat_min = point.lat-range;
  range = range / 2.0;
  lng_max = point.lng+range;
  lng_min = point.lng-range;
  if ((lat_max > position.lat) && (position.lat > lat_min)){
    if ((lat_max - position.lat) > (position.lat - lat_min)){position.lat = lat_min;}else{position.lat = lat_max;}
  }else{
    if ((lng_max > position.lng) && (position.lng > lng_min)){
      //position.lng = Math.random() < 0.5 ? lng_min : lng_max;  //place outside
      if ((lng_max - position.lng) > (position.lng - lng_min)){position.lng = lng_min;}else{position.lng = lng_max;}
    }
  }
  return position;
}

function positionWithinRangeOf(position, point, range){
  //not used
  var lat_min, lat_max, lng_min, lng_max;
  var half_range = range;
  lat_max = point.lat+range;
  lat_min = point.lat-range;
  range = range / 2.0;
  lng_max = point.lng+range;
  lng_min = point.lng-range;
  if ((lat_max > position.lat) && (position.lat > lat_min)){
    if ((lng_max > position.lng) && (position.lng > lng_min)){
      return true;
    }
  }
  return false;
}

function getGhosts(){
  var lat, lng, a;
  var avoid_range = 0.00008;
  var mrkr = null;
  var CONST = 0.00005;
  var battle_actor_count, battle_radar_range;
  loadGhosts();
  // trying to get radar specs
  var battle_radar_details = {"radar_range": 50, "radar_count": 2, "level": 1}; //default ghost behaviour if no radar has been created
  try {
    var mrkritm = inventory.getItemByType("radar")[0];
    mrkr = mmgr.getOrCreateActor(mrkritm.gui.id);
    battle_radar_details = inventory.getItemDetails(mrkritm);
  }catch(e){
    mrkr = mmgr.getOrCreateActor("player");
  }
  var discovarable = battle_discoverable[battle_radar_details.level]; // OR HQ game_state.getHeadQuarterLevel()
  // got radar specs lets create the missing ghosts
  var battle_state_discovered = getBattleStateDiscovered();
  for(var i in battle_state_discovered){
    battle_actor_count = discovarable[i]; //battle_radar_details.radar_count; //take count from discoverable type or ask for default radar or actual radar
    battle_radar_range = CONST * 10; //RESTORE ME !!!! (battle_radar_details.radar_range || 100);
    //createMissingByTypeAroundActor(i, mrkr, battle_actor_count, battle_radar_range, battle_actors[i]);
    var p = null;
    for (var c = 0; c < battle_actor_count; c++){
      p = mrkr.getRandomPosition(Math.random() * battle_radar_range, [0, Math.PI*2]);
      createMissingGhost("ghost_" + i + "_" + c, p.lat, p.lng, battle_actors[i]); //will get or create the ghost
    }    
  }

  // create discoverable ghosts
  for(var i in discovarable){
    if((battle_state_discovered[i]) || (discovarable[i] == 0) || (battle_actors[i] === undefined)){continue;} //skip creating discovered ghosts
    battle_radar_range = CONST * (battle_radar_details.radar_range || 100);
    p = mrkr.getRandomPosition(Math.random() * battle_radar_range, [0, Math.PI*2]);
    var cpy = JSON.parse(JSON.stringify(battle_actors[i])); //create copy avoiding wrinting the instance ... must be better way to do this
    cpy.name = "discovarable";
    createMissingGhost(i, p.lat, p.lng, cpy); //will get or create the ghost
  }  

  keepActorsMoving();
  saveGhosts();
  return mmgr.getActorsByType("ghost");
}

var battle_ghosts = {
  'discovarable': {name: 'discovarable', arimage: 'marker_actor0.png', radar_circle_width: 0.09, radar_circle_color: '#00FF00', bounty: 10, speed: 7000, altitude: undefined, random_range: 0.0001, health: 100},
  'ghost1': {name: 'ghost1', arimage: 'marker_actor1.png', radar_circle_width: 0.09, radar_circle_color: '#00FF00', bounty: 10, speed: 7000, altitude: undefined, random_range: 0.0001, health: 100},
  'ghost2': {name: 'ghost2', arimage: 'marker_actor2.png', radar_circle_width: 0.09, radar_circle_color: '#00FF00', bounty: 10, speed: 7000, altitude: undefined, random_range: 0.0001, health: 200}
};
*/


function createMissingGhost(id, lat, lng, info, prop){
  var param = {
    id:id,
    type: 'ghost',
    position: [lat,lng],
    description: 'This is the description of POI#' + id,
    altitude : prop.altitude || 0,
    name: 'Ghost #' + id,
    base_class : prop.name,
    properties : prop,
    iconSize : [30, 30],
    map : map,
    infowindow: info,
    selectable: true,
    hidden: prop.hidden,
    zIndexOffset: 9999
  };
  /*
  var a = mmgr.getOrCreateActor(id, param);
  a.show();
  */
  amgr.requestAction("create_actor", param);
}

/************** overwrite main.js functions begins  *************/

function fetchResourceLocations(latlng, callback_success, options){
    //https://developer.foursquare.com/docs/venues/search
    //https://developer.foursquare.com/docs/venues/explore
    options = options || {};
    var label = options.label || "select";
    options.search_circle = {
        color: 'green',
        fillColor: '#006200',
        fillOpacity: 0.2
    };
    //this should fetch random static location around the player
    var player = getOrCreatePlayer();
    var positions = [];
    if(options.state == 1301){ //if this is HQ then allow only players current position
      var itm = {
        "id": "resource_"+Math.floor(Math.random()*1000), 
        "name": "current location",
        "location": player.getPosition(),
        "categories": [{
          "name":"current location",
          "icon":{
            "prefix": null,
            "suffix": null
          }
        }]
      };
      positions.push(itm);
      showResourceLocation(itm, label, options.state);
      mmgr.viewActors("resource");
      guiSelectResourceLocation(itm.id, options.state);
    }else{
      for(var i=0; i < 10; i++){
        var itm = {
          "id": "resource_"+Math.floor(Math.random()*1000), 
          "name": null,
          "location": player.getRandomPosition(Math.random()*0.005, [0, Math.PI*2]),
          "categories": [{
            "name":"current location",
            "icon":{
              "prefix": null,
              "suffix": null
            }
          }]
        };
        positions.push(itm);
        showResourceLocation(itm, label, options.state);
      }
    }
    mmgr.viewActors("resource");
    /*    
    options.actor_type = "resource";
    var locations_used = getResourceBuildingLocationIds(undefined, true);
    fetchResourceAttractions(
        latlng.lat, latlng.lng, 
        callback_success, 
        function(venue){
            if ((!locations_used[venue.id]) || (venue.id == "player_location")){ //always allow the player to select his location
                showResourceLocation(venue, label, options.state);
            }
        }, function(data){
             return mergeResourceLocation(cleanResourceLocationsExplored(data));
        },
        options);*/
}

/*
function showAttackLocations(){
    var m = game_state.getGameMode();
    if (1){ //((m == "economy") || (m == "tutorial")){
        guiSelectResetMapClear();
        showAttackLocationsValidateFunds();
        setActionAttackGhosts();
        //TODO : app.showARView();
        fireGameEvent("ui_attack_click");
        setTimeout(function(){
            smgr.playMusic(sound_events["music_battle_suspense"]);
        }, 1000);
    }
}
*/
function testKillingTheDead(){
  /// used as a test function to kill the ghosts randomly
  var ghosts = mmgr.getActorsByType("ghost");
  var killed = JSON.parse(localStorage.getItem("actor_hits") || "{}");
  for (var i in ghosts){
    if(!killed[ghosts[i].id]){
      killed[ghosts[i].id] = new Date().getTime();
      break;
    }
  }
  game_state.setBattleState("viewing", killed);
  localStorage.setItem("actor_hits", JSON.stringify(killed));
}
function testCapturingTheDead(){
  var choosen_actor = [];
  var close_actors = getClosestActors(100000);
  var phonecall, phonecalls = game_state.getBattleState("phonecalls") || {};
  for(var i in close_actors){
    phonecall = phonecalls[close_actors[i].id];
    if(phonecall){
      choosen_actor.push(close_actors[i]);
      break;
    }
  }
  showCameraView(choosen_actor);
  hideDialogPreferences();
}
/*
function setGameStatusBattleEnds (score, discovered){
    var title = _lang["attack_infowindow_label_win"];
    var effort = 1;
    $(".menudialog_battleresult center .button_image_share").hide(); //share button
    $(".gui_label_battledone").html("");
    if(score){
        for(var i in discovered){
          $(".gui_label_battledone").append("<p>You discovered ghost " + discovered[i] + "</p>");
        }
        //format the reward to a dict that we know and understand
        var bounty = {"reward":{"currency":{"gold":10, "wood":1}}};
        for (var i in bounty.reward.currency){ bounty.reward.currency[i] = bounty.reward.currency[i] * effort; }
        //showDialogBattleResult(title, bounty.reward); //won, win
        game_state.setGameMode("economy", {action: "battle", title:title, bounty: bounty, effort: effort});
        game_state.addAchivement("achivement_battlefirst", 1);
        $(".menudialog_battleresult center .button_image_share").show(); //share button
    }else{
        title = _lang["attack_infowindow_label_cancel"];
        game_state.setGameMode("economy", {action: "battle", title:title});
    }
    smgr.playMusic(sound_events["music_building"]);
    updateAttackCount();
}
*/
/*
function updateCollectorsSlot(n, a, collecting_type){
  var collector_slot = "collector_slot_" + n;
  var s = a.getGameProperty(collector_slot);
  if((!s) || (!mmgr.actors[s])){ //this slot is not used or actor has been destroyed
    //lets find any ghost to collect (should select the shorters to this location)
//    for(var i in battle_actors){
//      if(i == collecting_type){
//        for(var j in battle_actors[i]["actors"]){
//          var ja = battle_actors[i]["actors"][j];
//          if (!ja.collector){ // here we found an ghost that is not being collected
//            ja.target = a.getRandomPosition(Math.random()*0.0005, [0, Math.PI*2]);
//            ja.collector = a.id;
//          }
//        }
//      }
//    }
    //a.setGameProperty(n, );
  }
}

function updateCollectors(){
  var collectors = inventory.getItemByCategory("defense");
  for (var c in collectors){
    var d = inventory.getItemDetails(collectors[c]);
    var a = mmgr.actors[collectors[c].gui.id];
    for(var i = 0; i <= d.actor_count; i++){
      updateCollectorsSlot(i, a, d.effects_type);
    }
  }
}
*/

////////////////////
/*
capacity_ghost1 = 1000;
create_ghost1 = 100;
function getResourceBuildTimeXXX(item_inst){  //game_state.js, gui.js, 
    var max = capacity_ghost1;
    var cph = create_ghost1;
    return (max/cph)*60*60*1000;
}

function getItemCurrencyTypeXXX(item){
  return "ghost1";
}

function getResourcePayoutXXX(inst, time_now){
        if(!time_now){time_now = new Date().getTime();}
        var item = inventory.getItemDetails(inst);

        item.capacity_ghost1 = capacity_ghost1;
        item.create_ghost1 = create_ghost1;

        var endtime = time_now;
        if (inst._time_builder_ends <= time_now){
            time_now = inst._time_builder_ends;
        }
        var seconds = (endtime - inst._time_builder_starts)/1000; //amount of seconds since we started
        var payment_type = getItemCurrencyTypeXXX(item);
        var payment_persecond = item["create_"+payment_type]/(60*60);
        //console.info("------------get resource payout --------------" + JSON.stringify({"seconds":seconds, "payment_type":payment_type}));
        return {"count":Math.min(item["capacity_" + getItemCurrencyTypeXXX(item)], Math.floor(seconds*payment_persecond) || 0), "type":payment_type, "persecond":payment_persecond};
    }
*/

//////
function showDialogCollectGhostTraps(){
  //collectGhostScore();
  var gs = game_state.getStateCopy();
  var sc = gs.storage_contents;
  var ss = gs.storage_capacity;
  var score_html = "";
  var score_table = "";
  var attack_rewards = getLevelSettings();
  var score_type = {
    "car1": attack_rewards.car1, 
    "car2": attack_rewards.car2, 
    "car3": attack_rewards.car3, 
    "car4": attack_rewards.car4,
    "car5": attack_rewards.car5,
    "car6": attack_rewards.car6,
    "car7": attack_rewards.car7,
    "car8": attack_rewards.car8,
    "car9": attack_rewards.car9
  };  
  var score_val, score_collc, score_posib;
  for(var i in score_type){
    if(score_type[i]){
      if (sc[i]){
        score_table = score_table + StringFormat(_lang["gui_battle_collect_ghosttypes_text"], {"type": i, "score":score_type[i] * sc[i], "ghost_count": sc[i], "ghost_max": ss[i]});
      }
    }
  }
  if(score_table == ""){
    guiAlert(_lang["gui_battle_collect_ghostsnone_text"], {"title": _lang["gui_battle_collect_ghostsnone_title"]});        
  }else{
    //show dialog
    score_html = score_table + StringFormat(_lang["gui_battle_collect_ghosts_text"]);
    guiAlert(score_html, {"title": _lang["gui_battle_collect_ghosts_title"]});        
  }
}

function collectGhostScore(){
  //player collects the ghosts and sees progress, when done he can collect the score
  var gs = game_state.getStateCopy();
  var sc = gs.storage_contents;
  var attack_rewards = getLevelSettings();
  var score_type = {
    "car1": "ghost1", 
    "car2": "ghost2", 
    "car3": "ghost3", 
    "car4": "ghost4", 
    "car5": "ghost5", 
    "car6": "ghost6", 
    "car7": "ghost7", 
    "car8": "ghost8", 
    "car9": "ghost9"
  };  
  var collected = {};
  for(var i in score_type){
    if (sc[i]){
      collected[score_type[i]] = sc[i];
      game_state.addBattleTransaction(0, "battle", i, -sc[i]); // CLEAR THE TRAPS
    }
  }
  showAttackViewOnly(collected);
}

function addSocialShareSighting(image_url){
  var location_data = {};
  try{ location_data = getBountyBattle().location; }catch(e){}; //GET BOUNTY BATTLE GETS ALL LOCATION DATA NEEDED FOR A NICE STRING
  var title = StringFormat(_lang["gui_dialogiteminfo_label_sharescreenshot_title"], location_data);
  var message = StringFormat(_lang["gui_dialogiteminfo_label_sharescreenshot_message"], location_data);
  addSocialShare(title, message, image_url);
  $(".menudialog_shareimage_progress").hide();
}

function chooseSocialShareSighting(){
  //sessionStorage.setItem("share", JSON.stringify([{"url":"http://media.agamecompany.com/ghostbursters/ghostdocumentation_1423044777192.png"},{"url":"http://media.agamecompany.com/ghostbursters/ghostdocumentation_1423044777192.png"}]));
  var images = JSON.parse(sessionStorage.getItem("snapshots") || "[]");
  if(images.length){
    fireGameEvent("ui_shareimage_open");
    $("#menudialog_shareimage_progress").hide();
    if(images.length){
      //showDialogBattleSceenshots();
      var content = "";
      //var width = (100/images.length)-5 + "%";
      var width = "100px";
      for(var i in images){
        content = content + "<div class='gui_battle_sharedialog_image' style='width:"+width+";' onclick='app.shareDocumentedSighting("+i+")'><img src='" + images[i].url + "' style='display:block;width:100%;'/><br><a href='#' class='button_link' style='width: 90%;display: block;margin: 0 auto;'>share</a></div>";
      }
      $("#menudialog_shareimage_content").html(content);
      $(".menudialog_shareimage").show();
    }
  }
  return images.length;
}

function showAttackLocation(item, label, state){
    state = parseInt(state) || 0;
    $.extend(item, getBattleAttackEstimated(item.attack_level)) //merge reward info so we can display it in attack popup
    var desc = StringFormat(_lang["infowindow_label_attack"], item);
    if(!item.name){ desc = StringFormat(_lang["select_infowindow_label_location_noname"], item);}
    var info = "<br><div class='infowindow_selectpopup'>" + desc + "<br>";
    var prop = {};
    //info = info + "<a class='button_link'  id='"+item.id+"' href='#' onclick='btnTE(1617, this)'>" + (_lang["infowindow_button_"+label] || label) + "</a> <a href='#' class='button_link'  onclick='btnTE(2637)'>" + _lang["infowindow_button_cancel"] + "</a></div>";
    info = info + "</div>";
    if(!resource_locations){ resource_locations = {}; }
    resource_locations[item.id] = item;
    var ghost_template = battle_actors["ghost" + (item.attack_level || "1")];
    createMissingGhost(item.id, item.location.lat, item.location.lng, info, ghost_template); //will get or create the ghost
    if(mmgr.actors[item.id]){
      mmgr.actors[item.id].show(true);
    }
}

function showAttackViewOnly(ghost_traps){
  var a, close_actors = [];
  var player = getOrCreatePlayer();
  for (var t in ghost_traps){
    for (var i = 0; i < ghost_traps[t]; i++){
      a = getAttackAROnlyTempActor(t, player.getRandomPosition(0.001));
      close_actors.push(a);
    }
  }
  showCameraView(close_actors);
}

function removeAttackAROnlyTempActors(){
  var a;
  for(var i in mmgr.actors){
    if(i.indexOf("tmpactr_") == 0){
      a = mmgr.actors[i];
      a.remove();
    }
  }
}

function getAttackAROnlyTempActor(ghost_type, latlng){
    var ghost_template = battle_actors[ghost_type];
    var ghost_id = "tmpactr_"+guid();
    ghost_template.hidden = true;
    createMissingGhost(ghost_id, latlng.lat, latlng.lng, "", ghost_template); //will get or create the ghost  
    return mmgr.actors[ghost_id];
}

function getGhostReward(difficulty_level){
  // just converts the car level to the ghost level,
  // expect car_type to be "car1" -> "car9"
  difficulty_level = parseInt(difficulty_level);
  if (difficulty_level < 1){ difficulty_level = 1;} //lets make sure we never go lower than 1
  if (difficulty_level > 20){ difficulty_level = 20;} 
  return ii_actors[difficulty_level-1]; //array starts at 0
}

function setGameStatusBattleEnds (ghost_killed){
   /* if more than one is killed we give 50% less wood to each */
    var title = _lang["attack_infowindow_label_win"];
    //var bounty = getBountyBattle();
    // this is to avoid that we call this more than once after a battle has finished
    //if(game_state.getGameMode() == "economy"){ return; }
    $(".menudialog_battleresult center .button_image_share").hide(); //share button
    
    if(ghost_killed){
        var kill_count = Object.keys(ghost_killed).length;
        var discount = 1;
        if(kill_count > 0){
          if (kill_count > 1){ discount = 0.25; }
          game_state.setGameMode("economy", {action: "battle", "title":title, "effort": kill_count}); //game_state.setGameMode("economy", {action: "battle", title:title, effort: difficulty_level});
          game_state.addScore("ghost_count", kill_count);
          mmgr.viewActors("building", function(a){
              if(a.getGameProperty("item_type") == "captured"){ return false; }
              return true;
          });
          game_state.addAchivement("achivement_battlefirst", 1);
          $(".menudialog_battleresult center .button_image_share").show(); //share button

          var rewards = {"gold": 0, "wood": 0, "stone": 0, "iron": 0, "xp": 0};
          for(var g in ghost_killed){
            rewarded_currency = getGhostReward(ghost_killed[g].type.replace("car", ""));
            for(var r in rewards){
              if(r == "wood"){
                rewards[r] = rewards[r] + Math.ceil(rewarded_currency[r]*discount);
              }else{
                rewards[r] = rewards[r] + rewarded_currency[r];                
              }
            }
          }
          /*
          var rewarded_currency = getGhostReward(difficulty_level);
          var rewards = {
            "action": "battle", 
            "title":title, 
            "bounty":{
              "reward":{
                "currency":{
                  "gold": rewarded_currency.gold, 
                  "wood": rewarded_currency.wood, 
                  "stone": rewarded_currency.stone, 
                  "iron": rewarded_currency.iron, 
                  "xp": rewarded_currency.xp
                }
              }
            }
          };
          */
          showDialogBattleResult({
            "action": "battle", 
            "title":title, 
            "bounty":{
              "reward":{
                "currency":rewards
              }
            }
          });
       }else{
         return; //probabley a dud 
       }
    }else{
       showDialogBattleResult({action: "battle", title: _lang["attack_infowindow_label_cancel"]});
    }
    smgr.playMusic(sound_events["music_building"]);
    updateAttackCount();
    use_enemy_location = null;

}
function showAttackLocationsPhoneCalls(){
  var ghosts = mmgr.getActorsByType("ghost");
  if(ghosts.length < 4){
    showAttackLocations();
  }
}

function getLevelSettings(){
  return ii_attack[game_state.getXPLevel()-1];
}

function fetchAttackLocations(latlng, callback_success, options){
    options = options || {};
    var label = options.label || "attack";
    options.categories = "4d4b7105d754a06379d81259,4d4b7105d754a06378d81259,4bf58dd8d48988d1e0931735,4d4b7105d754a06374d81259";
    options.limit = 99;
    //check if we got a radar to set the desirec attack count
    var radar = inventory.getItemByType("radar")[0];
    if(radar){
        options.limit = inventory.getItemDetails(radar).radar_count;
    }
    if(options.player_id){
        options.limit = 99;
    }
    var attack_battle_targets = game_state.getBattleState("phonecalls") || {}; //***
    options.actor_type = "attack";
    var locations_used = getResourceBuildingLocationIds(undefined, undefined);

    //get what is expected at this difficlty level
    var attack_rewards = getLevelSettings();
    var phonecalltypes = {
      "car1": attack_rewards.car1, 
      "car2": attack_rewards.car2, 
      "car3": attack_rewards.car3, 
      "car4": attack_rewards.car4,
      "car5": attack_rewards.car5,
      "car6": attack_rewards.car6,
      "car7": attack_rewards.car7,
      "car8": attack_rewards.car8,
      "car9": attack_rewards.car9
    }; 

    fetchResourceAttractions(
        latlng.lat,
        latlng.lng,
        callback_success,
        function(venues){
            var venue_count = 0;
            var venue = null;
            var time_now = new Date().getTime();
            var time_nextcall = 5; //60*12 //after 12 hours we allow ghost to populate again
            //check what we currently have
            var phonecallsleft = attack_battle_targets || {};
            for(var i in phonecallsleft){
              phonecalltypes[phonecallsleft[i]["type"]] = phonecalltypes[phonecallsleft[i]["type"]] - 1;
            }
            //lets create an array of missing types
            var phonecallsnow = [];
            for(var i in phonecalltypes){
              for(var j=0; j < phonecalltypes[i]; j++){
                phonecallsnow.push(i); 
              }
            }

            for(var i in venues){
                venue = venues[i];
                if (!locations_used[venue.id]){ //avoid placeing surounding attractions over our multiplayer locations + but do place the multiplayer venue FIXME: review this, will it place 
                    if((options.player_id) && (venue.building_type == "headquarters")){
                        //here is the HQ, lets make this our center
                        use_enemy_location = venue.location;
                    }else{
                        var ghost_level = null;
                        if(attack_battle_targets[venue.id]){
                          ghost_level = attack_battle_targets[venue.id]["type"]; //reset the old ones
                          if(attack_battle_targets[venue.id]["killed"]){
                            if(addTimeMinutes(attack_battle_targets[venue.id]["killed"], time_nextcall) > time_now){
                              ghost_level = null;  
                            }
                          } //ignore if already killed (future version should check the time as well)
                        }else{
                          ghost_level = phonecallsnow.pop();  
                        }
                        if(ghost_level){ //show if not already killed and has a ghost level
                          venue.attack_level = ghost_level.replace("car", "");
                          showAttackLocation(venue, label, options.state);
                          attack_battle_targets[venue.id] = {"type":ghost_level, "location": venue};
                        }
                    }
                }
            }
            
            //restore the rest of the items
            for(var i in attack_battle_targets){
              venue = attack_battle_targets[i];
              //venue.attack_level = venue.type.replace("car", "");
              showAttackLocation(venue.location, label, options.state); 
            }
            
            game_state.setBattleState("phonecalls", attack_battle_targets);
            mmgr.viewActors("ghost"); //REMOVEME: for testing
        },
        function(data){
            var venues = cleanResourceLocationsExplored(data);
            $.merge(venues, attack_battle_targets);
            return venues;
        },
        options);
}

function getBountyBattle(){
  var result = {"location": {}};
  var viewing = game_state.getBattleState("viewing");
  var phonecalls = game_state.getBattleState("phonecalls");
  var keys = Object.keys(viewing);
  if(keys.length){
    return phonecalls[keys[0]]; //just take one bounty
  }
}
