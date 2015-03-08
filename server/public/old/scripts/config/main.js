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
////////////////////////////////////////////////////////////////////////////

 

    // http://blogs.msdn.com/b/davrous/archive/2011/07/21/html5-gaming-animating-sprites-in-canvas-with-easeljs.aspx
    // http://craftyjs.com/
    // http://code.createjs.com/
    // http://nokarma.org/2011/02/02/javascript-game-development-the-game-loop/index.html
    // http://jsfiddle.net/simurai/CGmCe/
STATIC_RETAIL_TAX = 0.25;
STATIC_BUILDDEFENSE_DELAY = 5000;
defese_budget = 0;  //move into closed function
var _timer_tracking_log = {};

function getUserAuthKey (clean){
    //mainly used by mobile applications when communicating with server
    var uid = CryptoJS.MD5(game_state.getUserId()) + ""; //"myuniquekey";
    if(clean){ return uid; }
    return "/"+uid+"/";
}

function handleFailure(type, error_object){
    //alert("Handling failure of " + type + " getting reason " + JSON.stringify(error_object) );
    handleException({"message": "error type " + type + (error_object.message || "")});
}

function handleException(e, level){
    //https://developers.google.com/analytics/devguides/collection/analyticsjs/exceptions
    var msg = e;
    if (typeof(e) == 'string'){

    }else{
        msg = e.message;
    }
    if(this.ga){this.ga('send', 'exception', {'exDescription': msg, 'exFatal': false});}
    if(level != -1) {
        guiAlert(_lang["gui_warning_message_g0101"] + " " + msg, {"title":_lang["gui_warning_title_error"]});
        debugger;
    }
}

function trackTimer(track_state, category, variable, text){
    /*
        Used to check how long time it takes to get data to the player
    */
    if(track_state){
        if(!_timer_tracking_log){
            _timer_tracking_log = {};
        }
        _timer_tracking_log[category+"_"+variable] = new Date().getTime();
    }else{
        var time_lapsed = new Date().getTime() - _timer_tracking_log[category+"_"+variable];
        if(this.ga){this.ga('send', 'timing', category, variable, time_lapsed, text || "");}
    }
}

function checkSocialState(){
    /* general purpuse function that runs in background checking the social status */
    var url = url_domain + "api/social/state/"+getUserAuthKey();
    $.getJSON(url, function(res){
        debugger;
    });
}

function getDefenseAttackBudget(){
    return defese_budget;
}

function isDefenseItemAffordable(details, what){
    var budget = getDefenseAttackBudget();
    if (details["price_"+what] <= budget){
        return true;
    }
    return false;
}

function getAnyDefenseBaseCamp(){
    /*var hq = inventory.getItemByType("headquarters");
    if (hq.length){
        return getBuildingActorById(hq[0].id);
    }*/
    var dbc = mmgr.actors["defend_base_camp"];
    if (!dbc){
        var hq = inventory.getItemByCategory("headquarters")[0];
        if(hq){return mmgr.actors[hq.gui.id];}
        else{ throw "Missing headquarters"; }
    }
    return dbc;
}

function getBuildingActorById(id){
    return mmgr.actors["building_actor_"+id];
}

function hideBender(){
    var bender = mmgr.actors["bender"];
    if(bender){
        bender.marker.closePopup();
        bender.translate({lat:99999999999,lng:99999999999});
    }
}

function loadBombs(){
    // loaded before each battle begins
    var image_width = 128;
    var capacity, bomb, image_nums = 49;
    var gunship_inst = inventory.getItemByType("gunboat")[0];
    var gunship_details = {"capacity_ammo_artillery": 2}; //default allow artillarty to be present (eveen without the gunship instance)
    if (gunship_inst){ //if a gunship has been built
        gunship_details = inventory.getItemDetails(gunship_inst);
    }
    //load current bomb levels
    for (var i in _battle_bombs){
        bomb = inventory.getItemById("hud_actor_manual_"+_battle_bombs[i].type);
        if(bomb){
            details = inventory.getItemDetails(bomb);
            capacity = gunship_details["capacity_ammo_" + _battle_bombs[i].type];
            if(capacity > 0){
                _battle_bombs[i].visible = true; 
                _battle_bombs[i].on = true;
                _battle_bombs[i] = $.extend({}, _battle_bombs[i], details);
            }else{ _battle_bombs[i].visible = false; }
        }
        _battle_bombs[i]._p = 0;
        _battle_bombs[i]._c = 0;
        _battle_bombs[i].capacity = capacity;
    }
    //insert into sys

    // http://samdobson.github.io/image_slicer/
    for (var i in _battle_bombs){
        bomb = _battle_bombs[i];
        if(bomb.visible){
            spriteAnimation.addSpriteSheet(bomb["sprite"], "stylesheets/"+bomb["sheet"], {width: image_width, height: image_width});
            spriteAnimation.addAnimation(bomb["sprite"], bomb["animation"], {
              duration: bomb["duration"],
              steps: image_nums,
              animate_from_x:0,
              animate_from_y:0,
              animate_to_x:-(image_width*image_nums)
            });
        }
    }
    // load car explosions
    image_width = 200;
    spriteAnimation.addSpriteSheet("car_bomb1", "stylesheets/explode_car1.png", {width: image_width, height: image_width});
    spriteAnimation.addAnimation("car_bomb1", "car_explode1", {
      duration: 1000,
      steps: image_nums,
      animate_from_x:0,
      animate_from_y:0,
      animate_to_x:-(image_width*image_nums)
    });

}
function bombSelectDrop(bomb_id){
  if(_battle_bombs[bomb_id]._p < 1){ return; } 
  if(_battle_bombs[bomb_id]._c >= _battle_bombs[bomb_id].capacity){ return; } 
  dropBomb(bomb_id);
  _battle_bombs[bomb_id]._p = 0;
  tickBombValues();
}
function tickBombValues(){
  for (var i in _battle_bombs){
    if(!_battle_bombs[i].on){ continue; }
    if(_battle_bombs[i]._p == undefined){ _battle_bombs[i]._p = 0; }
    if (_battle_bombs[i]._p >= 1){
      _battle_bombs[i]._p = 1;
    }else{
      _battle_bombs[i]._p = _battle_bombs[i]._p + _battle_bombs[i].tick;
    }
    $("#button_bomb" + i + " > div").animate({"height": 100 * (1-_battle_bombs[i]._p) + "%"}, 500);
  }
}

function dropBomb(type){
    var bomb_id = "hud_actor_"
    var bender = mmgr.actors["bender"];    
    var details = _battle_bombs[type];
    _battle_bombs[type]._c = _battle_bombs[type]._c + 1;
    details.position = bender.getPosition();
    details.bomb_id = type;
    fireGameEvent("battle_bomb_" + _battle_bombs[type].sound_alias + "_drop");
    amgr.requestAction("create_bomb_actor", details);
    hideBender();
}

function toggleBender(options){
    var bender = mmgr.actors["bender"];
    if(!bender){
        bender = mmgr.createActor("bender", {
            className: "map_bender",
            latitude: options.position.lat,
            longitude: options.position.lng,
            iconSize: [8, 8],
            type: undefined
        });
        bender.callback_selected = function(){
            setTimeout(updateDefenseVehicleMenu, 100);
        }
    }else{
        bender.translate(options.position);
    }
    var bombs = "";
    for (var i in _battle_bombs){
        if(_battle_bombs[i].visible){
            var percentage = 1;
            if (_battle_bombs[i].capacity){
                percentage = (_battle_bombs[i]._c / _battle_bombs[i].capacity)+0.01;
            }
            var percentage_available = "<div style='background-color:green;'><div style='height:12px;width:"+percentage*100+"%;display:inline-block;background-color:#A82525;border-radius:5px;'></div></div>";
            bombs = bombs + "<div class='button_bomb_container button_link' onclick='btnTE(2611, " + i + ")'><div id='button_bomb"+i+"' class='button_bomb'><img src='"+getImageURLStorage(_battle_bombs[i].preview)+"'/><div></div></div>"+percentage_available+"</div>";
        }
    }
    bender.setPopup("<div style='color:rgb(228, 228, 228);'><center>" + _lang["attack_infowindow_label_place"] + "<hr></center>" + bombs + "<br><br><div class='defense_placement_menu'></div></div>");
    bender.show(true);
    bender.marker.openPopup();
    updateDefenseVehicleMenu();
    return bender;
}

function getDefenseActorsOwners(){
    var owners = {};
    for(var i in mmgr.actors){
        var a = mmgr.actors[i];
        var o = a.properties.owner;
        if(!owners[o]){owners[o] = [];}
        owners[o].push(a);
    }
    return owners;
}

function guiGetDefenseBudget(budget){
    budget = budget || getDefenseAttackBudget();
    //return "<i style='float:left;'>"+_lang["attack_infowindow_label_budget"]+"</i> <b class='defense_budget' style='float:right;'><img src='media/images/icon_small_gold.png' style='height:15px;'>" + budget + "</b><br>";
    return "<div class='defense_budget'><img src='media/images/icon_small_gold.png' style='height: 16px;vertical-align: middle;margin-right: 5px;'>" + budget + "</div>";
}

function guiCreatePercentageButton(b, max_weapons, now_weapons){
    var unaffordable_btn = "";
    var lefts_label = "<div style='width:64px;display:block;position:absolute;text-align;center;padding-top: 4px;font-size: 12px;color: lightgray;' class='label_count'>" + now_weapons + "/" + max_weapons + "</div>";
    var percentage_available = "<div style='float:left;height:22px;width:"+(now_weapons / max_weapons)*100+"%;display:inline-block;background-color:#A82525;border-radius: 5px;'></div>";
    if(b){
        unaffordable_btn = "style='background-color:gray;color:darkgray;' class='blink_me'";
    }
    return "<div class='button_battle_item' "+unaffordable_btn+">" + lefts_label + percentage_available+"</div>"
}

function updateDefenseBombMenu(itm){
    $("#bomb_id_"+itm.bomb_id).html(guiCreatePercentageButton(itm.capacity <= itm._c, itm.capacity, itm._c));
}

function updateDefenseVehicleMenu(){
    var budget = getDefenseAttackBudget();
    var a, btn, label, html = guiGetDefenseBudget(budget);
/*    
    var defences = {}; //used to group same level type weapons into same button
    var _defences = game_state.getDefenses();
    for (var i in _defences){
        var _d =  _defences[i];
        defences[_d.type + "_"+ _d.level] = _d;
    }
*/
    var defences = game_state.getDefenses();
    var owners = getDefenseActorsOwners();
    for (var i in defences){
        var defence = defences[i];
        if (defence.level){ // if this defence has a level, or in other words that this defence has not recently been created
            var defence_details = inventory.getItemDetails(defence);
            //SECURITY: should make sure that a player can never get more defences than he deserves.
            //var count = (defence.capacity_troops || 4) - (owners[defence.id] || []).length;
            var percentage = (owners[defence.id] || []).length / (defence_details.actor_count || 0); //(owners[defence.id] || []).length/(defence_details.actor_count || 4);
            var percentage_available = "<div style='float:left;height:22px;width:"+percentage*100+"%;display:inline-block;background-color:#A82525;border-radius: 5px;'></div>";
            var unaffordable_btn = "";
            if (defence_details.price_placing > budget){
                unaffordable_btn = "style='background-color:gray;color:darkgray;' class='blink_me'";
            }
            var button =  "<span style='display:inline-block;margin:4px;'><img src='"+getItemImageURLByItemLevelAndType(defence.type, defence.level)+"' width='64' height='64'/><br><div class='button_battle_item' "+unaffordable_btn+">" + "<div style='width:64px;display:block;position:absolute;text-align;center;'>$" + defence_details.price_placing + "</div>"+percentage_available+"</div></span>" //(_lang[defence.type] || defence.type);
            if((percentage < 0.95) && isDefenseItemAffordable(defence_details, "placing")){
                button = "<a href='#' onclick='javascript:btnTE(2615, \"" + defence.id + "\")'>" + button + "</a>";
            }
            html = html + button; //"<div style='float:right;'><span style='color:gray;'>" + count  + " left</span> </div>";
        }

    }
    $(".defense_placement_menu").html(html);
}

function buildDefenseActor (actor_id, source_id){
    //FIXME: do this here
    var defence = inventory.getItemById(actor_id);
    var details = {owner:defence.id};
    $.extend(details, inventory.getItemDetails(defence));
    actor_id = defence.type;
    console.info("Building defence actor " + actor_id);
    amgr.requestAction("build_defend_actor", {actor:actor_id, level:defence.level, properties: details});
}

function routeFetch(latlng1, latlng2, callback_success, callback_failure){
    var url = url_domain + "api/route/"+getUserAuthKey()+"?from="+latlng1[0]+","+latlng1[1]+"&to="+latlng2[0]+","+latlng2[1];
    setNetworkDataConnection(1, "route");
    $.getJSON(url, function(data){
        if(callback_failure && data.info.statuscode){
            data.info = data.info || {}; //set default if not defined
            callback_failure("request_route", {"error": data.route.routeError, "code": data.info.statuscode, "message": data.info.messages[0]});
            setNetworkDataConnection(-1, "route");
        }else{
            setNetworkDataConnection(0, "route"); 
        }
        path = [];
        var shape = data.route.shape.shapePoints;
        for (var i = 0; i < shape.length; i = i + 2){
            path.push({
                latlng:{
                    lat:shape[i],
                    lng:shape[i+1]
                }
            });
        }
        trackTimer(false, 'game_data', 'route');
        if(callback_success){callback_success(path);}
        else{
            mmgr.createPath("route", path);  //draw the path
        }
    });
}

function showResourceLocation(item, label, state){
    state = parseInt(state) || 0;
    item.building_type = _lang[getResourceTypeByStateNumber(state)];
    var desc = StringFormat(_lang["select_infowindow_label_location"], item);
    if(!item.name){ desc = StringFormat(_lang["select_infowindow_label_location_noname"], item);}
    var info = "<div class='infowindow_selectpopup'>" + desc + "<br><a class='button_link' id='"+item.id+"' href='#' onclick='btnTE(1616, this, "+state+")'>" + (_lang["select_infowindow_label_" + label] || label) + "</a> <a href='#' class='button_link'  onclick='btnTE(2636)'>" + _lang["select_infowindow_label_cancel"] + "</a></div>";
    if(!resource_locations){ resource_locations = {}; }
    resource_locations[item.id] = item;
    var param = {
        id:item.id,
        position:[item.location.lat, item.location.lng],
        type: "resource",
        base_class: "actor_select_resource",
        actor: "select",
        infowindow: info,
        properties:{},
        zIndexOffset: 1000
    };
    
    amgr.requestAction("create_actor", param);
}

function showAttackLocation(item, label, state){
    state = parseInt(state) || 0;
    $.extend(item, getBattleAttackEstimated(item.attack_level)) //merge reward info so we can display it in attack popup
    var desc = StringFormat(_lang["infowindow_label_attack"], item);
    if(!item.name){ desc = StringFormat(_lang["select_infowindow_label_location_noname"], item);}
    var info = "<div class='infowindow_selectpopup'>" + desc + "<br>";
    //info = info + "<a class='button_link'  id='"+item.id+"' href='#' onclick='btnTE(1617, this)'>" + (_lang["infowindow_button_"+label] || label) + "</a> <a href='#' class='button_link'  onclick='btnTE(2637)'>" + _lang["infowindow_button_cancel"] + "</a></div>";
    info = info + "</div>";
    if(!resource_locations){ resource_locations = {}; }
    resource_locations[item.id] = item;
    var param = {
        id:item.id,
        position:[item.location.lat, item.location.lng],
        type: "attack",
        base_class: "actor_select_enemy",
        actor: "select",
        infowindow: info,
        properties:{}
    };
    amgr.requestAction("create_actor", param);
}

function runDefendLocationEscapeRoute(location_id){
    /*
    developer starts: code bellow will create a cache
    
    cacheStorageSave("resource_locations", JSON.stringify(resource_locations))
    cacheStorageSave("location_id", JSON.stringify(location_id))
    cacheStorageSave("bounty_list", JSON.stringify(bounty_list))

    runDefendLocationEscapeRoute()
    */
    var line_options = {"color": "#ff7800", "opacity": 0.8}; // "#309018", "#60a8f0" "#ff7800" "#781818"
    resource_locations = resource_locations || JSON.parse(cacheStorageLoad("resource_locations") || "null");
    location_id = location_id || JSON.parse(cacheStorageLoad("location_id") || "null");
    bounty_list = bounty_list || JSON.parse(cacheStorageLoad("bounty_list") || "null");
    var r = mmgr.createPath("route", bounty_list[location_id].route, line_options);  //draw the path
    try{ map.fitBounds(r.getBounds()); } catch (e){ console.warn("Could not fit route bounds"); }
    /*setTimeout(function(){
        resource_locations = undefined;
        location_id = undefined;
        bounty_list = undefined;
    }, 5000);*/
    /*
    developer ends
    */

    var seconds = 3;
    setTimeout(function(){
        game_state.setGameMode("attack");
        amgr.requestAction("load_bounty", {bounty: location_id});
        mmgr.viewActors("attacker");
    }, seconds*1000);
    fireGameEvent("battle_countdown");
    smgr.playMusic(sound_events["music_battle_begin"]);
    guiShowCountDown(seconds);
    loadBombs();
}

function guiShowCountDown(seconds){
    $(".menudialog_countdown").show();
    $("#menudialog_countdown_counter").css({fontSize : '10px'}).html(4-seconds).animate({ fontSize : '40px' });
    if(seconds <= 0){
        $(".menudialog_countdown").hide();
        fireGameEvent("battle_jingle_begin");
        setTimeout(function(){smgr.playMusic(sound_events["music_battle"]);}, 500);
    }
    else{
        fireGameEvent("battle_countdown_second");
        setTimeout(function(){guiShowCountDown(seconds-1);}, 1000);
    }
}

function getLocationDetailsById(location_id){
    return resource_locations[location_id];
}

function attackLocation(location_id){
    fireGameEvent("ui_attack_confirm");
    addBounty(getLocationDetailsById(location_id), function(){
        try{
            runDefendLocationEscapeRoute(location_id);
        }catch(e){}
    }, handleFailure);
}

function mergeResourceLocation(lst){
    if (game_location_player){
        var itm = {
            "id": CryptoJS.MD5(new Date()+"")+"", //"player_location",  /// FX ME REGARDING MOBILE LOCATIONS
            "name":"Current location",
            "contact":{},
            "location":{
                "lat":game_location_player.lat,
                "lng":game_location_player.lng,
                "distance":0
            },
            "categories":[
                {"name": "Your location", "icon": {"prefix":"media/images/marker_resource_playerlocation_" , "suffix":".png"}}
            ],
            "verified":false
        };
        lst.push(itm);
    }
    // also add the captured buildings
    for (var i in mmgr.actors){
        var a = mmgr.actors[i];
        if(a.properties.item_type == "captured"){
           var p = a.getPosition();
           var itm = {
                "id": a.properties.item_id, //CryptoJS.MD5(a.properties.item_id)+"", //from our old id generate a new one
                "name": _lang["infowindow_label_captured"] + a.properties.attraction.name,
                "contact":{},
                "location":{
                    "lat": p.lat,
                    "lng":p.lng,
                    "distance":0
                },
                "categories":[
                    {"name": "Captured location", "icon": {"prefix":"media/images/marker_resource_capturedlocation_" , "suffix":".png"}}
                ],
                "verified":false
            };
            lst.push(itm);            
        }
    }
    return lst;
}

function getResourceBuildingLocationIds(used_locs, select_captured){
    var itms = inventory.getItems();
    var locs = used_locs || {};
    for (var i in itms){
        var itm = itms[i];
        if(itm.type == "captured"){
            locs[itm.id || itm.gui.location_id] = select_captured;
        }else{
            locs[itm.id || itm.gui.location_id] = true;
        }
        locs[itm.id || itm.gui.location_id] = true;
    }
    return locs;
}

function cleanResourceLocationsExplored(data){
    /*
        Will take the search result and create a structured array of locations
    */
    if(data.response.venues){ return data.response.venues; }
    else{
    /* bellow code is for results from foursequare "explore"*/
        var venues = [];    
        for (var g in data.response.groups){
            var group = data.response.groups[g];
            for (var i in group.items){
                var item = group.items[i];
                venues.push(item.venue);
            }
        }
        return venues;
    }
    
}

function fetchResourceAttractions(lat, lng, callback_success, callback_venues, callback_mergevenues, options){
    var qapi = "";
    options = options || {};
    if(options.query){ qapi = qapi + "&query="+options.query};
    if(options.section){qapi = qapi + "&section="+options.section;}
    if(options.radius){ qapi = qapi + "&radius=" + options.radius;}
    if(options.limit){ qapi = qapi + "&limit=" + options.limit * 5;}else{ options.limit = 99;} //multiply by 5 since we will limit the result in line 600 when looping through. Reason for multiplaying is that adding a limit seems to return new locations from FQ
    if(options.categories){ qapi = qapi + "&categories=" + options.categories;}
    try{
        var user_id = game_state.getUserId();
        var query_uuid = "attr-"+CryptoJS.MD5(Math.floor(lat*10000)+Math.floor(lng*10000) + JSON.stringify(options)) + "";
        var url = url_domain + "api/attractions/" + query_uuid + "/" + user_id + getUserAuthKey() + "?latlng="+lat+","+lng+""+qapi;
        //check if we want to fetch another players position
        if(options.player_id){
            url = url_domain + "api/attractions/" + query_uuid + "/" + user_id + "/" + options.player_id + getUserAuthKey() + "?latlng="+lat+","+lng;
        }

        //var locations_used = getResourceBuildingLocationIds();

        try{
            if(options.search_circle){
                _search_circle = new L.circle([lat, lng], options.radius, options.search_circle).addTo(map);
            }
        }catch(e){ handleException(e, -1); }

        function fetchResourceAttractionsVenues(data){
            var allvenues = callback_mergevenues(data);
            var venues = [];
            for (var i in allvenues){ //used for explore
                if(i < options.limit){
                    venues.push(allvenues[i]);
                }
            }
            callback_venues(venues);
            if(options.zoom_extent !== false){
                mmgr.viewActors(options.actor_type);
            }
            return venues;
        }

        //check local session data if this query already exists (using a hashed latlng)
        var cached_data = sessionStorage.getItem(query_uuid);
        if(cached_data){
            var data = JSON.parse(cached_data);
            ///*** copy base from $.getJSON starts
            /*
            var allvenues = callback_mergevenues(data);
            var venues = [];
            for (var i in allvenues){ //used for explore
                if(i < options.limit){
                    venues.push(allvenues[i]);
                }
            }
            callback_venues(venues);
            if(options.zoom_extent !== false){
                mmgr.viewActors(options.actor_type);
            }
            */       
            var venues = fetchResourceAttractionsVenues(data);
            if(callback_success && (venues.length > 0)){
                callback_success(data);
            } 
            return;
        }
        setNetworkDataConnection(1, "attractions");
        //if no local query exists then do the server search
        $.getJSON(url, function(data){
            //search -- data.response.venues = mergeResourceLocation(data.response.venues); //search
            //search -- for (var i in data.response.venues){ //used for search
            setNetworkDataConnection(0, "attractions");
            /*
            var venues = callback_mergevenues(data);
            if(venues.length == 0){
                handleException(data.meta, -1);
                setTimeout(function(){checkAchievementEvent();}, 2000); // if we have problems lets check again after a while                    
            }
            for (var i in venues){ //used for explore
                if (options.limit > i){
                    callback_venue(venues[i]);
                }
            }
            if(options.zoom_extent !== false){
                mmgr.viewActors(options.actor_type);
            }
            */
            if(data.meta.code != 200){
                handleException(data.meta, -1);
                setTimeout(function(){checkAchievementEvent();}, 2000); // if we have problems lets check again after a while                    
                return;
            }            
            var venues = fetchResourceAttractionsVenues(data);
            if(callback_success){callback_success(data);}
            //save the result into cache
            sessionStorage.setItem(query_uuid, JSON.stringify(data));
        }).error(function(e){
            if(options.callback_failure){
                options.callback_failure(e);
            }
        });
    }catch(e){
        handleException(e);
    }
}


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
    options.actor_type = "resource";
    var locations_used = getResourceBuildingLocationIds(undefined, true);
    fetchResourceAttractions(
        latlng.lat, latlng.lng, 
        callback_success, 
        function(venues){
            for(var i in venues){
                var venue = venues[i];
                if ((!locations_used[venue.id]) || (venue.id == "player_location")){ //always allow the player to select his location
                    showResourceLocation(venue, label, options.state);
                }
            }
            if(venues.length == 1){ //if only one location to select, then auto select it
                guiSelectResourceLocation(venue.id, options.state);
            }
        }, function(data){
             return mergeResourceLocation(cleanResourceLocationsExplored(data));
        },
        options);
}
function fetchAttackLocations(latlng, callback_success, options){
    options = options || {};
    var label = options.label || "attack";
    options.categories = "4d4b7105d754a06379d81259,4d4b7105d754a06378d81259,4bf58dd8d48988d1e0931735,4d4b7105d754a06374d81259";
    options.limit = 5;
    //check if we got a radar to set the desirec attack count
    var radar = inventory.getItemByType("radar")[0];
    if(radar){
        options.limit = inventory.getItemDetails(radar).radar_count;
    }
    if(options.player_id){
        options.limit = 99;
    }
    var attack_battle_targets = JSON.parse(sessionStorage.getItem("attack_battle_targets") || '{"used_ids": {}, "venues": []}'); //***
    options.search_circle = {
        color: 'red',
        fillColor: '#990000',
        fillOpacity: 0.2
    };
    options.actor_type = "attack";
    var locations_used = getResourceBuildingLocationIds(undefined, undefined);
    fetchResourceAttractions(
        latlng.lat,
        latlng.lng,
        callback_success,
        function(venues){
            var venue_count = 0;
            var venue = null;
            for(var i in venues){
                venue = venues[i];
                if ((!locations_used[venue.id]) || (attack_battle_targets["used_ids"][venue.id])){ //avoid placeing surounding attractions over our multiplayer locations + but do place the multiplayer venue FIXME: review this, will it place 
                    if((options.player_id) && (venue.building_type == "headquarters")){
                        //here is the HQ, lets make this our center
                        use_enemy_location = venue.location;
                    }else{
                        venue.attack_level = getCalculatedAttackLevel(venue);
                        showAttackLocation(venue, label, options.state);
                        venue_count = venue_count + 1;
                    }
                }
            }
            if(venue_count == 0){ // nothing was fetched
                guiAlert(_lang["gui_menudialog_battleradarupgrade_message"], {"title":_lang["gui_menudialog_battleradarupgrade_title"], "sound_notification": "ui_action_not_possible", "error_level":"gui_menudialog_battleradarupgrade_message"});
                setTimeout(guiSelectAttackCancel, 5000); // remove the red circle
            }
        },
        function(data){
            var venues = cleanResourceLocationsExplored(data);
            $.merge(venues, attack_battle_targets["venues"]);
            return venues;
        },
        options);
}

function getCalculatedAttackLevel(attr){
    /*
    BATTLE BALANCE:
    Somehow we use the attraction data to guess if the location is popular
    Will always give 3
    This will return 0 to 13
    */
    if(attr.building_level){
        return Math.ceil(attr.building_level/2) + 3; //get a number between 3 and 13 if this is a other players building
    }else if(attr.rating){
        return Math.ceil(attr.rating/2); //get a number between 1 and 5
    }
    return 2; //if we get nothing lets say this is a medioclre building
}

function getBattleAttackEstimated(threat_level){
    /*
    BATTLE BALANCE:
    This should take into player current level
    */
    return game_state.getAttackPrice(threat_level);
}

function fetchAttackBattleLocationCount(){
    // checks how many multiplayer battles the player can take part in and caches the result (updating gui counter)
    if(hasAuthenticated()){
        setNetworkDataConnection(1, "attack");
        var regions = getResourceRegionIds(true);
        var auth = game_state.getAuthentication();
        var url = url_domain + "api/matchmaker/" + (regions["city_id"][0] || regions["state_id"][0] || regions["country_id"][0]) + "/" + auth["user_id"] + "/" + getUserAuthKey(); //find any region prioritising size (FIXME: postcode_id is skipped during initial launch of the game)
        $.getJSON(url, function(data){
            var battle_counter = 0;
            var used_ids = {};
            setNetworkDataConnection(0, "attack");
            if (data.error){ showDialogAuthenticationRequiredWarning(); return;}
            var locations_used = getResourceBuildingLocationIds();
            var venues = cleanResourceLocationsExplored(data);
            for (var i in venues){
                if (!locations_used[venues[i].id]){ //this will exclude multiplayers that has same buildings occupied as the player
                    battle_counter = battle_counter + 1;
                    used_ids[venues[i].id] = true;
                }
            }
            sessionStorage.setItem("attack_battle_targets", JSON.stringify({"used_ids": used_ids, "venues": venues}));
            updateAttackCount();
        });
    }
}

/*function fetchAttackCategories(callback_success){
    var url = "https://api.foursquare.com/v2/venues/categories?client_id=G0UUNKVZYUYWXO2PFBMEB0HRYFATL1V5K5A0MPBFZWB1SPJ4&client_secret=CWD1JJXDSA1XDRB1MN2L4JR0YVVKUYDCMMVDH4TVRX04YLZ2&v=20130815%20";
    $.getJSON(url, function(data){
            //search -- data.response.venues = mergeResourceLocation(data.response.venues); //search
            //search -- for (var i in data.response.venues){ //used for search
            var categories = data["response"]["categories"];
            for (var i in categories){ //used for explore
                console.info("ID " + categories[i]);
            }
            if(callback_success){callback_success(data);}
    });
}*/

function showMessage(msg, timeout){
    $("#label_message").html(msg);
    setTimeout(function(){
        $("#label_message").html("");
    }, timeout);
}

function extractResourceInformation(attraction, building_type){
    var icon_url = "media/images/marker_resource_defaulticon_64.png";
    try{
        if(attraction.categories[0].icon.prefix && attraction.categories[0].icon.suffix){
            icon_url = attraction.categories[0].icon.prefix+"64"+attraction.categories[0].icon.suffix;
        }
    }catch(e){}
    var param = {
        id: attraction.id,
        location_id: attraction.id,
        position: [attraction.location.lat, attraction.location.lng],
        type: building_type,
        //base_class: "actor_building_"+game_item_building,
        base_class: "actor_building",
        actor: "building",
        properties: {"attraction": {"name": attraction.name, "id": attraction.id, "icon": icon_url, "category": attraction.categories[0].name, "details":{}, "address":{} }}
    };
    // here we add the area data and names to be used by multiplayer server
    $.extend(param.properties.attraction.details, attraction);
    param.properties.attraction.details["data_source"] = "fouresquare";
    
    //bellow is also used in fixItemAddress
    if(attraction.location.country){
        param.properties.attraction.address["country_name"] = attraction.location.country;
        param.properties.attraction.address["country_id"] = CryptoJS.MD5(attraction.location.country)+"";
    }
    if(attraction.location.state){
        param.properties.attraction.address["state_name"] = attraction.location.state;
        param.properties.attraction.address["state_id"] = CryptoJS.MD5(attraction.location.state + attraction.location.country)+"";
    }
    if(attraction.location.city){
        param.properties.attraction.address["city_name"] = attraction.location.city;
        param.properties.attraction.address["city_id"] = CryptoJS.MD5(attraction.location.city + attraction.location.country)+"";
    }
    if(attraction.location.postalCode){
        param.properties.attraction.address["postcode_name"] = attraction.location.postalCode;
        param.properties.attraction.address["postcode_id"] = CryptoJS.MD5(attraction.location.postalCode + attraction.location.city + attraction.location.country)+"";
    }
    return param;
}

function setBountyResourceOvertaken(){
    var location = getBountyBattle();
    var attraction = resource_locations[bounty_index];
    item_type = "captured";
    item_level = 1;
    var item = shop.inventory[item_type][item_level];
    var transaction = ledgers.addTransactionAction('buy', item);    
    var param = extractResourceInformation(attraction, "captured", transaction);
    param.item_level = item_level;
    param.item_type = item_type;    
    param.properties.trans_id = transaction;
/*    var param = {properties:{}};
    param.item_level = item_level;
    param.item_type = item_type;
    param.position = location.source;
    param.properties.trans_id = transaction;
    param.properties.attraction = {"name": attraction.name, "id": attraction.id, "icon": attraction.categories[0].icon.prefix+"64"+attraction.categories[0].icon.suffix, "category": attraction.categories[0].name};    
*/    
    try{
        inventory.addItem(item, attraction.id, param);
    }catch(e){
        console.warn("Could not add captured building because it already was captured. Got this: " + JSON.stringify(e));
    }
}

function setGameStatusBattleEnds (effort){
    var title = _lang["attack_infowindow_label_win"];
    var bounty = getBountyBattle();
    // this is to avoid that we call this more than once after a battle has finished
    if(game_state.getGameMode() == "economy"){ return; }
    $(".menudialog_battleresult center .button_image_share").hide(); //share button
    effort = effort || 0;
    if(bounty){
        if (effort < 1){
            title = _lang["attack_infowindow_label_lost"];
            if(game_state.getBattles(1).length == 0){ //if player has never won a battle lets give him some nudge to continue
                effort = 0.90;
            }
        }else{
            effort = 1;
            setBountyResourceOvertaken();
        }
        for (var i in bounty.reward.currency){ bounty.reward.currency[i] = bounty.reward.currency[i] * effort; }
        //showDialogBattleResult(title, bounty.reward); //won, win
        game_state.setGameMode("economy", {action: "battle", title:title, bounty: bounty, effort: effort});
        mmgr.viewActors("building", function(a){
            if(a.getGameProperty("item_type") == "captured"){ return false; }
            return true;
        });
        game_state.addAchivement("achivement_battlefirst", 1);
        $(".menudialog_battleresult center .button_image_share").show(); //share button

        //lets publish this and 
        if (bounty.location.owner){ //if this location has another owner then the player himself, then we let the opponent know
            //TODO FIXME: send up and create message then do a notification
            var message_type = "attack_success";
            var message_title = _lang["social_notification_attacksuccess_title"];
            var message_text = _lang["social_notification_attacksuccess_message"];
            if(effort < 1){
                message_type = "attack_failed";
                message_title = _lang["social_notification_attackfailed_title"];
                message_text = _lang["social_notification_attackfailed_message"];
            } 
            sendSocialMessage(message_type, message_title, message_text, [bounty.location.owner], {"bounty":bounty, "xp_level": game_state.getXPLevel()}, {});
            var auth = game_state.getAuthentication();
            if((auth) && (auth.facebook)){
                addSocialNotification(auth.facebook.id, StringFormat(message_text, bounty.location));
            }
        }

    }else{
        title = _lang["attack_infowindow_label_cancel"];
        game_state.setGameMode("economy", {action: "battle", title:title});
    }
    smgr.playMusic(sound_events["music_building"]);
    updateAttackCount();
    use_enemy_location = null;
}

function showBattleMessage(msg, display_time){
        //showMessage(wave.message, wave.delay);
        $("#battle_hud_message").html(msg).fadeIn(800);
        if(display_time){
            setTimeout(function(){
                $("#battle_hud_message").html(msg).fadeOut(2200);
            }, display_time);
        }
}

function addEnemyBountyHunter(bounty, wave_index, hunter_index){
    if(game_state.getGameMode() != "attack") { return; }
    var wave = bounty.waves[wave_index][hunter_index];
    bounty.attacker = bounty.attacker - 1;
    if (wave.actor != "message"){
        var details = {actor:wave.actor, attack:true, position:bounty.source, level:wave.level};
        $.extend(details, {"properties":shop.getItemByType(wave.actor)[wave.level]});
        amgr.requestAction("create_enemy_actor", details);
        $("#battle_hud_enemy_image").attr("src", getItemImageURLByItemLevelAndType(details.properties.type, details.properties.level));
        $("#battle_hud_enemy_count").html(hunter_index + "/" + bounty.waves[wave_index].length-1);
        if((hunter_index / (bounty.waves[wave_index].length-1)) > 0.95){
            if((wave_index  / (bounty.waves.length-1)) < 0.95){
                showBattleMessage(_lang["attack_wave_waitingnext"], 0);
            }
        }
    }else{
        showBattleMessage(_lang[wave.data], 3000);
    }
    setProgressBar("creeps", hunter_index, bounty.waves[wave_index].length-1, "wave " + wave_index + " / " + (bounty.waves.length-1))
    hunter_index = hunter_index + 1;
    if (bounty.waves[wave_index].length > (hunter_index)){
        setTimeout(function() {addEnemyBountyHunter(bounty, wave_index, hunter_index);}, wave.delay);
    }
}

function game_logic(){
    //these functions go to server
    //idea is that the game developer implmenets all logic here
/*
    this.rotate_canon = function(param){
        console.info("calculate rotation of canon");
        return param;
    };
  */  
    this.create_actor = function(param){
        param.properties = param.properties || {};
        //set default values
        var param = $.extend(true, param, inventory_battle_actors[param.actor]);
        return param;
    };
}

function game_render(){
    //this functions go to clients
    //idea is that the game developer implmenets all vislals here
/*
    this.rotate_canon = function(param){
        var a = mmgr.actors[param.id];
        var r = a.getShortestRotation(a.rotation["cockpit"], param.degrees);
        a.rotate(-a.rotation.undefined + r, {"layer":"cockpit", duration:param.duration, completed:param.completed});
    };
    
*/  

    function getEnemyCount (){ return $('[id^="enemy_actor_"]').length; }

    function guiBattleTransaction(amount, type, debet){
        //console.info({amount:amount, type:type, debet:debet});
        //game_state.addBattleTransaction(amount, type, debet);
        if (!isNaN(amount)){
            defese_budget = defese_budget + amount;
        }
        //updateDefenseVehicleMenu();
        $(".defense_budget").html("<img src='media/images/icon_small_gold.png' style='height:10px;'>" + defese_budget);
        $("#battle_hud_budget").html(guiGetDefenseBudget());        
    }


    this.create_route = function(param){
        amgr.render.route_start = param.source;
        routeFetch(param.source, param.target);
    };
    
    this.getPathPosition = function(index){
        if (index == "start"){
            return path[0].latlng;
        }
        if (index == "stop"){
            return path[path.length-1].latlng;
        }
    };
    
    this.buildDefendActorShow = function(param){
        var pathend = {lat:amgr.render.route_start[0], lng:amgr.render.route_start[1]}; 
        var ry = Math.floor(Math.random() * 2) ? 1: -1;
        var rx = Math.floor(Math.random() * 2) ? 1: -1;
        var position = {lat:pathend.lat+Math.random()*0.0008*rx, lng:pathend.lng+Math.random()*0.0008*ry};
        param.id = "defend_actor_" + parseInt(Math.random()*1000);
        param.position = [pathend.lat, pathend.lng];
        amgr.requestAction("create_defend_actor", param);
        setTimeout(function(){
            amgr.requestAction("move_to_position", {position:position, id:param.id});
        }, 1000);
    };
    
    this.build_actor = function(param){
        param.base_class = param.base_class || "actor_soldier1";
        amgr.render.buildDefendActorShow(param);
    };
    
    this.attack_route = function(param){
        var a = mmgr.actors[param.id];
        amgr.render.moveAlong(a, 0); //drive the tank along the path
        setTimeout(fireGameEventItem, 800, a.properties.sound_actor_move, a.id);
        fireGameEventItem(a.properties.sound_actor_spawn, a.id);
    };
    
    this.move_to_position = function(param){
        var a = mmgr.actors[param.id];
        a.moveHalt();
        a.moveTo(param.position, {speed:100, completed:function(){
            console.info ("I rock!!");
        }});
    };

    callback_infowindow = function(self){
        var item_id = self.properties.item_id;
        var item = inventory.getItemById(item_id);
        if(item){
            item.callback(item.id);
            fireGameEvent("building_" + item.category + "_" + item.type + "_select");
        }
    };

    this.create_actor = function(param){
        if (!param.id){ throw "Could not create actor because param.id was not set"; }
        var actor = null;
        try{
            actor = mmgr.createActor(param.id, {
                className: "map_marker",
                latitude: param.position[0],
                longitude: param.position[1],
                type: param.type,
                base_class: param.base_class,
                actor_class: param.actor,
                collision_detection: true,
                range_detection: 30,
                rotate_mode: "image",
                callback_infowindow: callback_infowindow,
                selectable: param.selectable,
                draggable: param.draggable,
                callback_visible: param.callback_visible,
                zIndexOffset: param.zIndexOffset
            });
        }catch(e){ //igonre if we already have an actor with this id (because of ability to convert captured buildings)
            if(e.code == 2101){
                actor = mmgr.actors[param.id];
            }else{
                throw "Exception creating actor. Got this reason: " + JSON.stringify(e);
            }
        }
        actor._retarget_first = true; //this will find the first target in the queue, if false we will select last target in queue
        
        if(param.properties.sound_loop){
            actor.sound_loop = fireGameEventItem(param.properties.sound_loop, param.id);
        }
        if(!param.hidden){actor.show(true);}
        if((actor.type != "building") && (actor.id != "enemy_base_camp") && (actor.id != "defend_base_camp")){
            $("#"+actor.id + " .body").append('<div class="cockpit"  style="display:none;background-image:url(' + param.weapon_fired + ');"></div>');
            $("#"+actor.id + " .cockpit").append('<div class="projectile_gunfire" style="display:none;background-image:url(' + param.weapon_block + ');"></div>');
            //$("#"+actor.id).append('<div class="actor_explodes" style="display:block;"></div>');
        }
        $("#"+actor.id).append('<div class="actor_movable" style="display:block;background-size:cover;"></div>');
        if (param.infowindow){
            actor.setPopup(param.infowindow, {});
        }
        actor.setGameProperty(param.properties);
        if(param.icon_level){mapApplyIconImage(param.id, param.icon_level);}
        /*actor.callback_selected = function(map_actor){
            if(actor.type == "building"){
                guiUpdateItemsProgress();
            }
        };*/
        actor.callback_collision_detected = function(enemy_actor){
            var itm = inventory.getItemById(enemy_actor.properties.item_id);
            if (itm.category == "defense"){ //if there is a collision detection between defense and a moving actor (headquarters) then collect the ghosts
                btnItemPayout(enemy_actor.properties.item_id);
            }           
        };
        actor.callback_collision_distant = function(enemy_actor){
            if((enemy_actor.id == "bender") || (this.id == "bender")){ return; }
            if((enemy_actor.id != "enemy_base_camp") && (this.id != "enemy_base_camp") && (enemy_actor.type != this.type)){
                if(mmgr.actors[this.id]){
                    mmgr.actors[this.id]._my_target = undefined;
                    $("#" + this.id + " .projectile_gunfire").finish(); // stop and flush all animation
                    mmgr.actors[this.id].retarget();
                }
            }
        };
        actor.callback_property_changed = function(prop){
            var progressbar = $( "#" + actor.id + " .label");
            var kill_delay = 1000;
            var color_red = "#78c060";
            var color_green = "#78c060";
            progress_bar_damage = (prop.damage_now/prop.damage_max);
            if(isNaN(progress_bar_damage)){ return; } //this will avoid displaying progress bar, is done because we sometimes fetch an item two times and no property is change but the progress bar id displayed
            if (actor.type != "building"){
                progress_bar_color = color_red;
                progress_bar_damage = 1-progress_bar_damage;
                if(progress_bar_damage > 0.95){
                    progress_bar_color = color_green;
                }
            }else{
                progress_bar_color = "#ff7800"; //building color is yellowish color_green;
            }
            progressbar.progressbar({value: progress_bar_damage*100, label:"damage_now"});
            progressbarValue = progressbar.find( ".ui-progressbar-value" );
            progressbarValue.css({
              "background": progress_bar_color
            });
            if (prop.damage_now >= prop.damage_max){
                if (actor.type == "building"){
                    progressbar.hide();
                }else{
                    //soldier dies
                    if(actor.sound_loop){
                        actor.sound_loop.stop();
                        actor.sound_loop = undefined;
                    }
                    this.properties.transition_speed = 99999999999; // slow actor down
                    this._my_target = undefined;
                    if (!this._me_dying){
                        this._me_dying = true;
                        progressbar.hide();
                        $("#"+this.id+" .body").fadeOut(500);
                        if(this.id != "defend_base_camp"){
                            kill_delay = 10000;
                            spriteAnimation.play("#"+actor.id +" .actor_explodes", "car_bomb1", "car_explode1");       
                            if((actor.type == "defender") || (actor.type == "attacker")){
                                fireGameEvent(this.properties.sound_actor_death);
                            }          
                        }
                        setTimeout(function(){
                            amgr.requestAction("destroy", {id:actor.id});
                        }, kill_delay);
                        
                        guiBattleTransaction(Math.floor(prop.price_corpse), "kills", false);  //RESTORE ME: hardcoding 10% of price_corpse
                    }
                }
            }
        };
        actor.retarget = function(){
            //tell the this actor that has killed me that there are more enemies
            if ((Object.keys(this.cds).length) && (this.type == "defender")){
                for (var i in this.cds){
                    if( (this.cds[i]) && (this.cds[i].type == "attacker") && (!this.cds[i]._me_dying) && (this.cds[i].id != "enemy_base_camp")){
                        this._my_target = this.cds[i].id;
                        if(this._retarget_first){return;}
                    }
                }
            }            
        };
        actor.isItemDraggable = function(){
            return this.isDraggable();
        }
        actor.setItemDraggable = function(b){
            /* set all NONE draggable */
            for(var i in mmgr.actors){
                mmgr.actors[i].setDraggable(false);
            }
            $(".actor_movable").css('background-image', 'none');
            /* set this draggable */
            if(b){
                this.setDraggable(b);
                //if we want to set as draggable then show bg image
                $("#" + actor.id + " .actor_movable").css('background-image', 'url("media/images/marker-move-512.png")')
            }
            this.setPopupVisible(false);
        };
        actor.callback_removed = function(){
        };
        actor.callback_destroyed = function(actor){
            var prop = actor.getGameProperty();
            if (prop.actor_type == "actor_select_enemy"){ return; } //dont care if it is a selector
            if (prop.actor_type == "defend_camp"){ //Ends game with player losing
                setGameStatusBattleEnds(0);
                return;
            }
            if(actor.sound_loop){
                actor.sound_loop.stop();
                actor.sound_loop = undefined;
            }

            setTimeout(function(){
                if(((getEnemyCount() == 0) || (!amgr.render.wave_index)) && (game_state.getGameMode() == "attack")){ //start next wave
                    amgr.requestAction("next_wave", {wave_index:(amgr.render.wave_index || 0)});
                    fireGameEvent("battle_jingle_begin");
                }                
            }, 1000);
        };
        setTimeout(function(){mapResizeIconsByZoom();}, 10);
    };
    
    this.clearScene = function(){
        var a;
        for (var i in mmgr.actors){
            a = mmgr.actors[i];
            if(( a.type == "defender" ) || (a.type == "attacker")){
                a.destroy();
            }
        }
        mmgr.removePath();
    };

    this.destroy = function(param){
        var a = mmgr.actors[param.id];
        if(a){a.destroy();}
    };
    
    this.build_defend_actor = function(param){
        if(!param.position){
            var p  = mmgr.actors["bender"].getPosition();
            param.position = [p.lat, p.lng];
        }
        param.draggable = true;
        //param.zIndexOffset = 9999 + actors.length;
        param.range_circle = {};
        var actor_settings = param.properties;
        guiBattleTransaction(actor_settings.price_placing*(-1), "build", false);
        hideBender();
        setTimeout(function(){
            amgr.requestAction("create_defend_actor", param);
            fireGameEvent(actor_settings.sound_build_done); //smgr.play(actor_settings.placement_sound_complete);
        }, 10);
        fireGameEvent(actor_settings.sound_build_start); //smgr.play(actor_settings.placement_sound);
    };
    
    /*
    this.upgrade_defend_actor = function(param){
        console.info("upgrade_defend_actor");
        var a = mmgr.actors[param.id];
    };
    */

    this.repair_defend_actor = function(param){
        //console.info("repair_defend_actor " + JSON.stringify(param));
        var a = mmgr.actors[param.id];
        var d = a.getGameProperty();
        if(d.damage_now > 0){
            guiBattleTransaction(-d.price_reperation, "repair", false);
            a.setGameProperty("damage_now", 0);
            fireGameEventItem(d.sound_actor_repair, a.id);
        }
    };
    
    this.sell_defend_actor = function(param){
        var a = mmgr.actors[param.id];
        var props = a.getGameProperty();
        var value = props.price_removing*(props.damage_now/props.damage_max);
        if (!props.damage_now){ value = props.price_removing; }
        a.destroy();
        guiBattleTransaction(Math.floor(value*(1-STATIC_RETAIL_TAX)), "sold", true);
        fireGameEventItem(props.sound_actor_sold, a.id);
    };

    this.create_defend_actor = function(param){
        if(game_state.getGameMode() != "attack") { return; }
        if (!param.actor || !param.level){ throw "Missing type or level in properties when creating defend actor"; }
        var icon_level =parseInt(param.properties.icon_level);
        var actor_name = param.id || "defend_actor_" + parseInt(Math.random()*1000);
        var button_upgrade = "";// "<a href='javascript:amgr.requestAction(\"upgrade_defend_actor\",{id:\"" + actor_name + "\",amount:1});'>upgrade</a>" + " $" + param.properties.price_building;
        var button_repair = "<a href='javascript:amgr.requestAction(\"repair_defend_actor\",{id:\"" + actor_name + "\",amount:1});'>repair</a>" + " $" + param.properties.price_reperation;
        var button_sell = "<a href='javascript:amgr.requestAction(\"sell_defend_actor\",{id:\"" + actor_name + "\"});'>sell</a>" + " $" + param.properties.price_removing;
        param.icon_level = getItemImageURLByLevelAndType(param.actor, icon_level, "_body");
        param.id = actor_name;
        param.type = "defender";
        param.infowindow = "<div style='color:white;'>Drag or drop it here?<div style='text-align:center;'><a class='button_link' onclick='btnTE(2711, \"" + param.id + "\", 1)'>Drop</a>  <a class='button_link' onclick='btnTE(2711, \"" + param.id + "\", 0)'>Cancel</a> </div></div>";
        /*
        'damage_now': 0,
        'damage_max': 4,
        'weapon_damage': 1,
        'weapon_sound': 'gunshot2',
        'price_placing': 8,
        'price_corpse': 2,
        'price_building': 2,
        'price_reperation': 20,
        'price_removing': 4,
        'rotation_offset': 0,
        'rotation_transition': true,
        'rotation_speed': 500,
        'placement_duration': 1000,
        'placement_sound': null,
        'placement_sound_complete': null,
        'transition_speed': 100,
        'actor_count': 3,
        */

/*        ///developer start
        var developer_config = JSON.parse(cacheStorageLoad("battle_defender") || "null") || {};
        for(var i in developer_config[param.actor]){ param.properties[i] = developer_config[param.actor][i]; }
        ///developer ends
*/
        //override defense values
        param.properties.damage_now = 0;
        param.properties.damage_max = param.properties.hit_points || 100; //default for camps
        param.properties.weapon_damage = (param.properties.dps/(param.properties.rpm/60)) || 99999999; //max damage for camps
        param.base_class = "actor_" + param.actor;
        //param.infowindow = guiGetDefenseBudget() + "Here is info on defender. <br><br>"+button_upgrade+"<br>"+button_repair+"<br>"+button_sell;
        /* weapon image */
        param.weapon_fired = getItemImageURLByLevelAndType(param.actor, icon_level, "_weapon"); //'/images/image_heavy_level_01_weapon.png';
        param.weapon_block = getItemImageURLByLevelAndType(param.actor, icon_level, "_fire"); //'/images/image_heavy_level_01_fire.png';

        /* sound start */
        param.properties.sound_build_done = "battle_tower_spawn";
        param.properties.sound_build_start = "battle_tower_place";
        param.properties.sound_actor_repair = "battle_tower_repair";
        param.properties.sound_actor_sold = "battle_tower_sell";
        param.properties.sound_actor_attack = "battle_tower_" + param.properties.type + "_attack";
        param.properties.sound_actor_spawn = "battle_tower_place";
        param.properties.sound_actor_death = "battle_tower_" + param.properties.type + "_death";
        /* sound ends */
        amgr.requestAction("create_actor", param);
    };
    
    this.create_building_actor = function(param){
        if (!param.properties.item_level || !param.properties.item_type){ throw "Missing type or level in properties when creating building actor"; }
        var actor_name = param.id || "building_actor_" + parseInt(Math.random()*1000);
        param.icon_level = getItemImageURLByLevelAndType(param.properties.item_type, param.properties.item_level);
        param.id = actor_name;
        //param.selectable = true;
        param.type = "building";
        param.properties = $.extend(param.properties || {}, {
            "damage_now": 0,
            "damage_max": 1,
            "weapon_damage": 0,
            "price_placing": 10,
            "price_corpse": 0,
            "price_building": 0,
            "price_reperation": 0,
            "price_removing": 0,
            "rotation_offset": 0,
            "rotation_transition": true,
            "rotation_speed": 0,
            "placement_duration": 0,
            "placement_sound": null,
            "placement_sound_complete": null,
            "transition_speed": 0,            
            "actor_type": "building"
        });
        var inv = inventory.getItemById(param.properties.item_id);        
        /* sound start  building_defense_snipertower_construction_start */
        param.properties.sound_build_done = "building_" + inv.category + "_" + inv.type + "_spawn"; //"battle_tower_" + param.properties.type + "_done";
        param.properties.sound_build_start = "building_" + inv.category + "_" + inv.type + "_start"; //"battle_tower_" + param.properties.type + "_start";
        param.properties.sound_build_done = "building_" + inv.category + "_" + inv.type + "_done";
        param.properties.sound_build_upgrade = "building_" + inv.category + "_" + inv.type + "_upgrade";
        param.properties.sound_build_done = "building_" + inv.category + "_" + inv.type + "_complete"; //"ui_jingle_building_complete";
        param.properties.sound_actor_death = "building_" + inv.category + "_" + inv.type + "_death";  //"battle_building_" + param.properties.type + "_death";
        /* sound ends */        
        if(inv.category == "defense"){
            param.draggable = false;
        }

        amgr.requestAction("create_actor", param);
    };

    this.create_bomb_actor = function(param){
        if(game_state.getGameMode() != "attack") { return; }
        var bomb_type = "bomb" + param.bomb_id; //"bomb"; //can be napalm, gas, bomb1, bomb2
        var expl_type = "explode" + param.bomb_id; //"bomb"; //can be napalm, gas, bomb1, bomb2
        var actor_name = "bomb_actor_" + parseInt(Math.random()*1000);
        amgr.requestAction("create_actor", {
            actor: "actor_" + bomb_type, 
            id: actor_name, 
            base_class: "bomb_base", 
            position: [param.position.lat, param.position.lng], 
            level: param.level,
            properties: {"weapon_damage": param.damage},
            callback_visible: function(){
                spriteAnimation.play("#"+actor_name, bomb_type, expl_type);
            }
        });
        setTimeout(function(){ mmgr.actors[actor_name].destroy();}, 2000);
    };
    
    this.create_enemy_actor = function(param){
        if(game_state.getGameMode() != "attack") { return; }
        if (!param.actor || !param.level){ throw "Missing type or level in properties when enemy building actor"; }
        var actor_name = param.id || "enemy_actor_" + parseInt(Math.random()*1000);
        var icon_level = parseInt(param.properties.icon_level);
        param.icon_level = getItemImageURLByLevelAndType(param.actor, icon_level, "_body");
        param.id = actor_name;
        param.type = "attacker";
        param.actor = param.actor;

        /*
        'health': 140,
        'dps': 30,
        'weapon_sound': 'gunshot1',
        'price_placing': 10,
        'price_corpse': 2,
        'price_building': 2,
        'price_reperation': 2,
        'price_removing': 0,
        'rotation_offset': 0,
        'rotation_transition': true,
        'rotation_speed': 500,
        'placement_duration': 1000,
        'placement_sound': null,
        'placement_sound_complete': null,
        'transition_speed': 100,
        */
        
        //override enemy values
        param.properties.damage_now = 0;
        param.properties.damage_max = param.properties.health;
        param.properties.weapon_damage = param.properties.dps/(param.properties.rpm/60);
        param.selectable = false;

        //TEST SPEED param.properties.transition_speed = 420;
        //param.properties.damage_max = 10000; 
        //param.properties.weapon_damage = 0.0000001; 
        

        /* weapon image */
        param.weapon_fired = getItemImageURLByLevelAndType(param.actor, icon_level, "_weapon");//'/images/image_heavy_level_01_weapon.png';
        param.weapon_block = getItemImageURLByLevelAndType(param.actor, icon_level, "_fire");//'/images/image_heavy_level_01_fire.png';
        /* sound start */
        param.properties.sound_build_start = "battle_enemy_" + param.properties.type + "_start";
        param.properties.sound_actor_move = "battle_enemy_" + param.properties.type + "_move";
        param.properties.sound_actor_turn = "battle_enemy_" + param.properties.type + "_turn";
        param.properties.sound_actor_attack = "battle_enemy_" + param.properties.type + "_attack";
        param.properties.sound_actor_spawn = "battle_enemy_" + param.properties.type + "_spawn";
        param.properties.sound_actor_death = "battle_enemy_" + param.properties.type + "_death";
        /* sound ends */
        param.sound_loop = param.properties.sound_actor_move;
        amgr.requestAction("create_actor", param);
        if(param.attack){
            setTimeout(function(){
                amgr.requestAction("attack_route", {id:actor_name});
            }, 1000);
            
        }
    };


    /* attack / defense */

    this.shoot_enemy = function(param){
        var e = mmgr.actors[param.enemy];
        var d = mmgr.actors[param.defender];
        var eprops = e.getGameProperty();
        var dprops = d.getGameProperty();
        layer = undefined; //base layer
        var rotation_duration = 1;
        var projectile = "rocket";
        if ((!e.type) || (!d.type)){ return; }
        if (dprops.actor_type == "tank"){ //game validation
            layer = "cockpit";
            rotation_duration = 1000;
            projectile = "canon";
        }
        if (dprops.actor_type == "chopper"){ //game validation
            layer = undefined;
            rotation_duration = 2000;
            projectile = "canon";
        }
        /*var r = d.getShortestRotation(d.rotation[layer], d.getBearingTo(e.getPosition()));
        d.rotate(-d.rotation.undefined + r + dprops.rotation_offset, {"layer":layer, duration:rotation_duration, completed:function(){
            shootProjectile(e, d, projectile, dprops);
        }});*/
        shootProjectile(e, d, projectile, dprops);
    }
    
    this.attack_enemy = function(param){
        var e = mmgr.actors[param.enemy];
        var d = mmgr.actors[param.defender];
        if ((!e) || (!d)){ return; }
        if (e.type == d.type){ return; } //validation code

        //amgr.render._attack_select_target(d);
        amgr.requestAction("shoot_enemy", param);
    };
/*
    this._attack_select_target = function(d){
        // selects a target, called when a target is dead or a new cd is detected 
        // 1. if no target selected then find one
        //    _my_target is used when enumerating all the fighters applying dps on their enemy (every second)
        
        //only search for a new target if it is undefined or does not exist any more
        if((d._my_target === undefined) || (!mmgr.actors[d._my_target])){
            d._my_target = undefined; //reset in case no legal target can be found
            // select first in cds list
            for (var c in d.cds){
                var t = d.cds[c].type;
                if ((d.type != t) && (!!t) && (t != "building")){ //avoid undefindes and buildings
                    //got a target that is this defenders enemy
                    //lets make sure it exists and if it does select it
                    if (mmgr.actors[d.cds[c].id]){
                        mmgr.actors[d.id]._my_target = d.cds[c].id;
                        return mmgr.actors[d.id]; //lets stop the search
                    }
                }
            }
        }
    };
*/
    this.next_wave = function(param){
        if(game_state.getGameMode() != "attack") { return; }
        if(param && param.wave_index){
            param.bounty = param.bounty || getBountyBattle();
            if(!param.bounty){return;}
            if (param.wave_index >= param.bounty.waves.length){
                if ((getEnemyCount() === 0) && (param.bounty.attacker <= 0)){
                    setTimeout(function(){ //need this timeout since I loosing game is called first then this is called
                        if (getAnyDefenseBaseCamp()){
                            setGameStatusBattleEnds(1); //winner
                        }
                    }, 1000);
                }
            }else{
                addEnemyBountyHunter(param.bounty, param.wave_index, 0);
            }
            amgr.render.wave_index = param.wave_index + 1;
        }
    };

    this.load_bounty = function(param){
        var actor, i, bounty = getBountyBattle(param.bounty);
        bounty_index = param.bounty;
        path = bounty.route;
        defese_budget = -bounty.budget.currency.gold;
        var defense_position_latlng = path[path.length-1].latlng;
        var defense_position = [defense_position_latlng.lat, defense_position_latlng.lng];
        amgr.requestAction("create_actor", {actor: "actor_enemy_camp1", id: "enemy_base_camp", position: bounty.source, properties:{}}); 
        amgr.requestAction("create_actor", {actor: "actor_defend_camp1", id: "defend_base_camp", position: defense_position, properties:{}});
        amgr.render.wave_index = 0;
        amgr.requestAction("next_wave", {bounty: bounty, wave_index: 1});
        game_state.addBattleTransaction(bounty.budget.currency.gold, "battle", false);
    };
    
    this.load_scene = function(param){
        initGUI();
        loadResearchDefaults();
    };

    this.moveAlong = function(a, i, options){
        //handles walking along a path
        //rotation_transition, rotation_speed, transition_speed    
        var self = this;
        if (i > path.length){ return; }
        var step = path[i];
        if (!step){ return; }
        //handles rotation of the object towards the goal
        var props = a.getGameProperty();
        var meters = a.distanceTo(step.latlng);
        if (meters <= 0){ amgr.render.moveAlong(a, i+1, options); return; }
        var duration = (props.transition_speed || 100) * meters; //ms * meters
        //fireGameEventItem(props.sound_actor_turn, a.id);
        a.rotateTo(step.latlng, {duration:(props.rotation_speed || 1000), completed:function(){
        }});
        props.rotation_transition = 1;
        setTimeout(function(){
            a.translate(step.latlng, {duration:duration, completed:function(){
                amgr.render.moveAlong(a, i+1, options);
            }});
        }, props.rotation_transition);
    };
}
function shootProjectile (e, d, projectile, dprops){
    var delay_shooting = 1;
    var eid = e.id;
    var did = d.id;
    if((e.type == "building") || (d.type == "building")){ return; }
    if((e.id == "enemy_base_camp") || (d.id == "enemy_base_camp")){ return; }
    if(e.id == "defend_base_camp"){ setTimeout(overrunByEnemyAttack, 1600, d.id); return; } 
    if(d.id == "defend_base_camp"){ setTimeout(overrunByEnemyAttack, 1600, e.id); return; } 
    //FIXME: allow defenders to get some shoots in!!!
    if(e.type == "defender"){ delay_shooting = 10+Math.random()*1000; } //if enemy is defenders (we do not allow attackers to shoots us)
    if ((!mmgr.actors[e.id]) || (!mmgr.actors[d.id])){return;}
    //shootProjectileReq(e.id, d.id);
    setTimeout(shootProjectileReq, delay_shooting, e.id, d.id);
}
function shootProjectileReq (enemy_id, defender_id){
    var delay_reload_fadeout = 800;
    //if the targets are remove then ignore this
    if ((!mmgr.actors[enemy_id]) || (!mmgr.actors[defender_id])){return;} 
    //if the target exists
    if (mmgr.actors[defender_id]._my_target){
        if(mmgr.actors[mmgr.actors[defender_id]._my_target]){
            enemy_id = mmgr.actors[defender_id]._my_target;
        }
    }else{ //retarget
        if(mmgr.actors[enemy_id].type == "defender"){
            mmgr.actors[enemy_id].retarget(); 
        }
    }
    if(mmgr.actors[enemy_id]._me_dying){ return; } //if the target is already dying the skip killing it
    mmgr.actors[defender_id]._my_target = enemy_id;
    if(!mmgr.actors[enemy_id]){ return; }
    if(mmgr.actors[enemy_id]._me_dying || mmgr.actors[defender_id]._me_dying){ return; }
    var dprops = mmgr.actors[defender_id].getGameProperty();
    var delay_reload = 1000 / (dprops.rpm/60); //(dprops.weapon_reload || 1000);
    var fadeout_dealy = Math.min(delay_reload, delay_reload_fadeout)-10;
    if(dprops.type == "cannon"){ // is flamethrower
        fadeout_dealy = fadeout_dealy * 1.2;
    }
    if(dprops.type == "rocketlauncher"){ // is rocketlauncher
        //creates a "bomb on the target location"
        var details = {};
        var type = 1; // should be something more sexy
        details.position = mmgr.actors[enemy_id].getPosition();
        details.bomb_id = type;
        fireGameEvent("battle_bomb_" + _battle_bombs[type].sound_alias + "_drop");
        amgr.requestAction("create_bomb_actor", details);

    }    
    //if(fadeout_dealy < 100){ fadeout_dealy = fadeout_dealy / 2; } //ugly hack to speed up projectile animation
    //gui effect shooting weapon - start
    var a = mmgr.actors[defender_id];
    var rot = a.getBearingTo(mmgr.actors[enemy_id].getPosition());
    a.rotate(-a.rotation.undefined + rot, {"element_id": "#" +a.id+ " .cockpit", "duration": 100});
    //a.rotate(rot, {"element_id": "#" +a.id+ " .projectile_gunfire", "duration": 10});
    fireGameEventItem(dprops.sound_actor_attack, defender_id);
    $("#" +a.id+ " .projectile_gunfire").fadeIn(10).fadeOut(fadeout_dealy);
    //gui effect shooting weapon - ends
    try{
        mmgr.actors[enemy_id].setGameProperty("damage_now", dprops.weapon_damage, true); 
        if (!mmgr.actors[enemy_id].cds[defender_id]){ return; } //if no longer in range
    }catch(e){
        return;
    }
    setTimeout(shootProjectileReq, delay_reload, enemy_id, defender_id);
}
function overrunByEnemyAttack(enemy_id){
    var overrun_by_enemy_damage = 100;
    var defend_base_camp = mmgr.actors["defend_base_camp"];
    fireGameEvent("battle_enemy_reached_base");
    if(defend_base_camp){
        defend_base_camp.setGameProperty("damage_now", overrun_by_enemy_damage, true); 
    }
    if(mmgr.actors[enemy_id]){mmgr.actors[enemy_id].destroy();}
}

/*function rotateActorTowardsTarget(){
    //enumerate actors looking for moving ones.
    var i, j, a, t;
    for (i in mmgr.actors){
        a = mmgr.actors[i];
        for (j in a.cds){
            t = a.cds[j];
            console.info(t.id + " targetting " + a.id);
        }
    }
    //for those moving we want to get the cds 
    //enumerate those cds making sure they orient towards our moving actor
}
*/

function loadResearchDefaults(){
    //get all affordable items
    var itms = shop.getAffordable();
    var n, typs = {};
    for (var i in itms){
        if (itms[i].category == "manual"){
            typs[itms[i].type] = itms[i].category;
        }
    }
    //create all affordable troops and manual
    for (var i in typs){
        var n = "hud_actor_" + typs[i] + "_" + i;
        var shop_item = shop.getItemByType(i)[0];
        var live_item = guiResearchDialogItemShow(shop_item, n); //({"category": typs[i], "type": i, "id": "hud_actor_" + typs[i] + "_" + i, "preview": shop_item.preview, "level": shop_item.level});
        if(!live_item){//lets check if this item exist before creating it
            try{//if we fail getting the upgrade time or adding the purchase lets just ignore it
                if((shop_item.upgrade_time == 0) && (shop_item.armory == 0)){
                    game_state.addPurchase(i, 1, {hud_item: true, "id":n});
                }
            }catch(e){}
        }
    }
    return typs;
}

function loadGUIEffects(){
    //load coin, ... explosinos
    var image_width = 128;
    var image_nums = 49;
    spriteAnimation.addSpriteSheet("explode_coins", "stylesheets/explosion_coins.png", {width: image_width, height: image_width});
    spriteAnimation.addAnimation("explode_coins", "explode_coins", {
      duration: 2000,
      steps: image_nums,
      animate_from_x:0,
      animate_from_y:0,
      animate_to_x:-(image_width*image_nums)
    });
    spriteAnimation.addSpriteSheet("explode_stars", "stylesheets/explosion_stars.png", {width: image_width, height: image_width});
    spriteAnimation.addAnimation("explode_stars", "explode_stars", {
      duration: 2000,
      steps: image_nums,
      animate_from_x:0,
      animate_from_y:0,
      animate_to_x:-(image_width*image_nums)
    });

}

function addBounty(item, callback_success, callback_failure){
    var base_position = getGameLocation();  //bla
    var target = [base_position.lat, base_position.lng];
    var source = [item.location.lat, item.location.lng];
    if((item.target) && (item.target.lat) && (item.target.lng)){
        target = item.target;
    }
    routeFetch(source, target, function(route){
        //route.push({latlng:{lat:target[0], lng:target[1]}});
        route.unshift({latlng:{lat:source[0], lng:source[1]}});
        var bounty = {};
        bounty.route = route; //[{"latlng":{"lat":64.135185,"lng":-21.895694}},{"latlng":{"lat":64.134963,"lng":-21.894384}},{"latlng":{"lat":64.134941,"lng":-21.89426}},{"latlng":{"lat":64.134941,"lng":-21.89426}},{"latlng":{"lat":64.135452,"lng":-21.893831}},{"latlng":{"lat":64.135597,"lng":-21.893711}},{"latlng":{"lat":64.135597,"lng":-21.893711}},{"latlng":{"lat":64.135437,"lng":-21.892629}},{"latlng":{"lat":64.135406,"lng":-21.892339}},{"latlng":{"lat":64.135391,"lng":-21.891687}},{"latlng":{"lat":64.135452,"lng":-21.890823}},{"latlng":{"lat":64.135452,"lng":-21.890823}},{"latlng":{"lat":64.135559,"lng":-21.890878}},{"latlng":{"lat":64.135726,"lng":-21.890932}},{"latlng":{"lat":64.135948,"lng":-21.890949}},{"latlng":{"lat":64.136047,"lng":-21.890941}},{"latlng":{"lat":64.136199,"lng":-21.890892}},{"latlng":{"lat":64.136474,"lng":-21.890739}},{"latlng":{"lat":64.136672,"lng":-21.890544}},{"latlng":{"lat":64.136848,"lng":-21.890325}},{"latlng":{"lat":64.13713,"lng":-21.889888}},{"latlng":{"lat":64.137359,"lng":-21.889425}},{"latlng":{"lat":64.137474,"lng":-21.889213}},{"latlng":{"lat":64.137474,"lng":-21.889213}},{"latlng":{"lat":64.137664,"lng":-21.890047}},{"latlng":{"lat":64.13771,"lng":-21.890331}},{"latlng":{"lat":64.138031,"lng":-21.892316}},{"latlng":{"lat":64.138137,"lng":-21.89298}},{"latlng":{"lat":64.138137,"lng":-21.89298}},{"latlng":{"lat":64.138275,"lng":-21.893329}},{"latlng":{"lat":64.138359,"lng":-21.893493}},{"latlng":{"lat":64.138412,"lng":-21.893531}},{"latlng":{"lat":64.138473,"lng":-21.893552}},{"latlng":{"lat":64.138862,"lng":-21.893362}},{"latlng":{"lat":64.139518,"lng":-21.893119}},{"latlng":{"lat":64.139648,"lng":-21.893083}},{"latlng":{"lat":64.139648,"lng":-21.893083}},{"latlng":{"lat":64.139808,"lng":-21.892883}},{"latlng":{"lat":64.139892,"lng":-21.892747}},{"latlng":{"lat":64.139945,"lng":-21.892599}},{"latlng":{"lat":64.139999,"lng":-21.89232}},{"latlng":{"lat":64.139991,"lng":-21.891937}},{"latlng":{"lat":64.14006,"lng":-21.890829}},{"latlng":{"lat":64.140174,"lng":-21.889238}},{"latlng":{"lat":64.140205,"lng":-21.888336}},{"latlng":{"lat":64.140205,"lng":-21.887376}},{"latlng":{"lat":64.140197,"lng":-21.885082}},{"latlng":{"lat":64.140174,"lng":-21.88467}},{"latlng":{"lat":64.140075,"lng":-21.883644}},{"latlng":{"lat":64.139953,"lng":-21.882896}},{"latlng":{"lat":64.139778,"lng":-21.882047}},{"latlng":{"lat":64.139541,"lng":-21.88116}},{"latlng":{"lat":64.139404,"lng":-21.880706}},{"latlng":{"lat":64.139106,"lng":-21.879892}},{"latlng":{"lat":64.138786,"lng":-21.87907}},{"latlng":{"lat":64.138626,"lng":-21.878732}},{"latlng":{"lat":64.138549,"lng":-21.878568}},{"latlng":{"lat":64.138465,"lng":-21.878383}},{"latlng":{"lat":64.138389,"lng":-21.878223}},{"latlng":{"lat":64.138221,"lng":-21.877853}},{"latlng":{"lat":64.137939,"lng":-21.877321}},{"latlng":{"lat":64.137893,"lng":-21.87722}},{"latlng":{"lat":64.136711,"lng":-21.875171}},{"latlng":{"lat":64.135986,"lng":-21.873899}},{"latlng":{"lat":64.13552,"lng":-21.873098}},{"latlng":{"lat":64.134552,"lng":-21.871431}},{"latlng":{"lat":64.1343,"lng":-21.871004}},{"latlng":{"lat":64.134246,"lng":-21.870908}},{"latlng":{"lat":64.134162,"lng":-21.870769}},{"latlng":{"lat":64.134094,"lng":-21.870645}},{"latlng":{"lat":64.133934,"lng":-21.870361}},{"latlng":{"lat":64.132965,"lng":-21.868671}},{"latlng":{"lat":64.132865,"lng":-21.868505}},{"latlng":{"lat":64.132865,"lng":-21.868505}},{"latlng":{"lat":64.132942,"lng":-21.868318}},{"latlng":{"lat":64.13298,"lng":-21.868202}},{"latlng":{"lat":64.133148,"lng":-21.867784}},{"latlng":{"lat":64.133193,"lng":-21.867664}},{"latlng":{"lat":64.133613,"lng":-21.866525}},{"latlng":{"lat":64.133872,"lng":-21.865819}},{"latlng":{"lat":64.134086,"lng":-21.865228}},{"latlng":{"lat":64.134201,"lng":-21.864923}},{"latlng":{"lat":64.13446,"lng":-21.864282}},{"latlng":{"lat":64.134605,"lng":-21.863979}},{"latlng":{"lat":64.134826,"lng":-21.863618}},{"latlng":{"lat":64.135131,"lng":-21.863229}},{"latlng":{"lat":64.135627,"lng":-21.86272}},{"latlng":{"lat":64.135864,"lng":-21.862472}},{"latlng":{"lat":64.136024,"lng":-21.862266}},{"latlng":{"lat":64.136207,"lng":-21.862007}},{"latlng":{"lat":64.136375,"lng":-21.861707}},{"latlng":{"lat":64.136566,"lng":-21.861324}},{"latlng":{"lat":64.136672,"lng":-21.861042}},{"latlng":{"lat":64.136764,"lng":-21.860811}},{"latlng":{"lat":64.136901,"lng":-21.860374}},{"latlng":{"lat":64.137046,"lng":-21.859855}},{"latlng":{"lat":64.1371,"lng":-21.859609}},{"latlng":{"lat":64.137191,"lng":-21.859214}},{"latlng":{"lat":64.137229,"lng":-21.858997}},{"latlng":{"lat":64.13739,"lng":-21.85815}},{"latlng":{"lat":64.137428,"lng":-21.85794}},{"latlng":{"lat":64.137428,"lng":-21.85794}},{"latlng":{"lat":64.137336,"lng":-21.857843}},{"latlng":{"lat":64.136177,"lng":-21.856685}},{"latlng":{"lat":64.136177,"lng":-21.856685}},{"latlng":{"lat":64.136375,"lng":-21.855171}},{"latlng":{"lat":64.136543,"lng":-21.853712}},{"latlng":{"lat":64.136543,"lng":-21.853712}},{"latlng":{"lat":64.137184,"lng":-21.854356}}];
        bounty.target = target;
        bounty.source = source;
        bounty.attacker = 7; //is used to make sure that we have handle all the attackers

        var price_and_rewards = getBattleAttackEstimated(item.attack_level);
        bounty.reward = {"currency":{"gold": price_and_rewards.gold, "wood":price_and_rewards.wood, "xp":price_and_rewards.xp}};
        bounty.budget = {"currency":{"gold":-price_and_rewards.gold_budget}};



        // lets create the array
        var game_xp = game_state.getXP();
        var game_levels = _dictArray2dictByLevelWave(level_waves);

        //FIXME: this is a hack so we can easilly replace type of trooper attacking
        if (!item.owner){ //check if this item has another owner then our self (if not this is not multiplayer, just taking ower a shop)
            var game_levels_str = JSON.stringify(game_levels);
            game_levels_str = game_levels_str.replace(/rifleman/g, "prechar1a");
            game_levels_str = game_levels_str.replace(/heavy/g, "prechar2a");
            game_levels_str = game_levels_str.replace(/zooka/g, "prechar3a");
            game_levels = JSON.parse(game_levels_str);
        }

        bounty.waves = game_levels[Math.min(game_xp.level-1, game_levels.length-1)]; //either fetch the last level we created or the level that has the same index as the xp.level
        bounty.waves.unshift([{message:_lang["attack_wave_startingin"], delay:0}]); //add the first waves (that we omit for some reason)

        if(!bounty_list){ bounty_list = {}; }
        bounty_list[item.id] = bounty;
        bounty_list[item.id].location = item; //lets remember the target information
        callback_success();
    }, callback_failure);
    
}
function getBountyList(){
    return bounty_list;
}
function getBountyBattle(indx){
    var lst = getBountyList();
    if (lst){
        return lst[ indx || bounty_index];
    }
    return null;
}

///STATIC TEST DATA
/*
var bounty1 = {"hunter":{"name":"NSA"}, "reward":10000, "cost": 1000, "distance": 1000};
bounty1.route = [{"latlng":{"lat":64.135185,"lng":-21.895694}},{"latlng":{"lat":64.134963,"lng":-21.894384}},{"latlng":{"lat":64.134941,"lng":-21.89426}},{"latlng":{"lat":64.134941,"lng":-21.89426}},{"latlng":{"lat":64.135452,"lng":-21.893831}},{"latlng":{"lat":64.135597,"lng":-21.893711}},{"latlng":{"lat":64.135597,"lng":-21.893711}},{"latlng":{"lat":64.135437,"lng":-21.892629}},{"latlng":{"lat":64.135406,"lng":-21.892339}},{"latlng":{"lat":64.135391,"lng":-21.891687}},{"latlng":{"lat":64.135452,"lng":-21.890823}},{"latlng":{"lat":64.135452,"lng":-21.890823}},{"latlng":{"lat":64.135559,"lng":-21.890878}},{"latlng":{"lat":64.135726,"lng":-21.890932}},{"latlng":{"lat":64.135948,"lng":-21.890949}},{"latlng":{"lat":64.136047,"lng":-21.890941}},{"latlng":{"lat":64.136199,"lng":-21.890892}},{"latlng":{"lat":64.136474,"lng":-21.890739}},{"latlng":{"lat":64.136672,"lng":-21.890544}},{"latlng":{"lat":64.136848,"lng":-21.890325}},{"latlng":{"lat":64.13713,"lng":-21.889888}},{"latlng":{"lat":64.137359,"lng":-21.889425}},{"latlng":{"lat":64.137474,"lng":-21.889213}},{"latlng":{"lat":64.137474,"lng":-21.889213}},{"latlng":{"lat":64.137664,"lng":-21.890047}},{"latlng":{"lat":64.13771,"lng":-21.890331}},{"latlng":{"lat":64.138031,"lng":-21.892316}},{"latlng":{"lat":64.138137,"lng":-21.89298}},{"latlng":{"lat":64.138137,"lng":-21.89298}},{"latlng":{"lat":64.138275,"lng":-21.893329}},{"latlng":{"lat":64.138359,"lng":-21.893493}},{"latlng":{"lat":64.138412,"lng":-21.893531}},{"latlng":{"lat":64.138473,"lng":-21.893552}},{"latlng":{"lat":64.138862,"lng":-21.893362}},{"latlng":{"lat":64.139518,"lng":-21.893119}},{"latlng":{"lat":64.139648,"lng":-21.893083}},{"latlng":{"lat":64.139648,"lng":-21.893083}},{"latlng":{"lat":64.139808,"lng":-21.892883}},{"latlng":{"lat":64.139892,"lng":-21.892747}},{"latlng":{"lat":64.139945,"lng":-21.892599}},{"latlng":{"lat":64.139999,"lng":-21.89232}},{"latlng":{"lat":64.139991,"lng":-21.891937}},{"latlng":{"lat":64.14006,"lng":-21.890829}},{"latlng":{"lat":64.140174,"lng":-21.889238}},{"latlng":{"lat":64.140205,"lng":-21.888336}},{"latlng":{"lat":64.140205,"lng":-21.887376}},{"latlng":{"lat":64.140197,"lng":-21.885082}},{"latlng":{"lat":64.140174,"lng":-21.88467}},{"latlng":{"lat":64.140075,"lng":-21.883644}},{"latlng":{"lat":64.139953,"lng":-21.882896}},{"latlng":{"lat":64.139778,"lng":-21.882047}},{"latlng":{"lat":64.139541,"lng":-21.88116}},{"latlng":{"lat":64.139404,"lng":-21.880706}},{"latlng":{"lat":64.139106,"lng":-21.879892}},{"latlng":{"lat":64.138786,"lng":-21.87907}},{"latlng":{"lat":64.138626,"lng":-21.878732}},{"latlng":{"lat":64.138549,"lng":-21.878568}},{"latlng":{"lat":64.138465,"lng":-21.878383}},{"latlng":{"lat":64.138389,"lng":-21.878223}},{"latlng":{"lat":64.138221,"lng":-21.877853}},{"latlng":{"lat":64.137939,"lng":-21.877321}},{"latlng":{"lat":64.137893,"lng":-21.87722}},{"latlng":{"lat":64.136711,"lng":-21.875171}},{"latlng":{"lat":64.135986,"lng":-21.873899}},{"latlng":{"lat":64.13552,"lng":-21.873098}},{"latlng":{"lat":64.134552,"lng":-21.871431}},{"latlng":{"lat":64.1343,"lng":-21.871004}},{"latlng":{"lat":64.134246,"lng":-21.870908}},{"latlng":{"lat":64.134162,"lng":-21.870769}},{"latlng":{"lat":64.134094,"lng":-21.870645}},{"latlng":{"lat":64.133934,"lng":-21.870361}},{"latlng":{"lat":64.132965,"lng":-21.868671}},{"latlng":{"lat":64.132865,"lng":-21.868505}},{"latlng":{"lat":64.132865,"lng":-21.868505}},{"latlng":{"lat":64.132942,"lng":-21.868318}},{"latlng":{"lat":64.13298,"lng":-21.868202}},{"latlng":{"lat":64.133148,"lng":-21.867784}},{"latlng":{"lat":64.133193,"lng":-21.867664}},{"latlng":{"lat":64.133613,"lng":-21.866525}},{"latlng":{"lat":64.133872,"lng":-21.865819}},{"latlng":{"lat":64.134086,"lng":-21.865228}},{"latlng":{"lat":64.134201,"lng":-21.864923}},{"latlng":{"lat":64.13446,"lng":-21.864282}},{"latlng":{"lat":64.134605,"lng":-21.863979}},{"latlng":{"lat":64.134826,"lng":-21.863618}},{"latlng":{"lat":64.135131,"lng":-21.863229}},{"latlng":{"lat":64.135627,"lng":-21.86272}},{"latlng":{"lat":64.135864,"lng":-21.862472}},{"latlng":{"lat":64.136024,"lng":-21.862266}},{"latlng":{"lat":64.136207,"lng":-21.862007}},{"latlng":{"lat":64.136375,"lng":-21.861707}},{"latlng":{"lat":64.136566,"lng":-21.861324}},{"latlng":{"lat":64.136672,"lng":-21.861042}},{"latlng":{"lat":64.136764,"lng":-21.860811}},{"latlng":{"lat":64.136901,"lng":-21.860374}},{"latlng":{"lat":64.137046,"lng":-21.859855}},{"latlng":{"lat":64.1371,"lng":-21.859609}},{"latlng":{"lat":64.137191,"lng":-21.859214}},{"latlng":{"lat":64.137229,"lng":-21.858997}},{"latlng":{"lat":64.13739,"lng":-21.85815}},{"latlng":{"lat":64.137428,"lng":-21.85794}},{"latlng":{"lat":64.137428,"lng":-21.85794}},{"latlng":{"lat":64.137336,"lng":-21.857843}},{"latlng":{"lat":64.136177,"lng":-21.856685}},{"latlng":{"lat":64.136177,"lng":-21.856685}},{"latlng":{"lat":64.136375,"lng":-21.855171}},{"latlng":{"lat":64.136543,"lng":-21.853712}},{"latlng":{"lat":64.136543,"lng":-21.853712}},{"latlng":{"lat":64.137184,"lng":-21.854356}}];
bounty1.target = [64.13701543201262,-21.854529082775116];
bounty1.source = [64.13543584028008,-21.896068453788757];
bounty1.waves = [
    [{actor:"attacker_chopper", delay:1000}],
    [{message:_lang["attack_wave_startingin"], delay:1000}, {actor:"attacker_chopper", delay:3000}, {actor:"attacker_tank2", delay:3000}]
];
var bounty2 = {"hunter":{"name":"NSA"}, "reward": 1000, "cost": 100, "distance":100};
bounty2.target = [64.1371,-21.854272];
bounty2.source = [64.133407,-21.853879];
bounty2.route = [{"latlng":{"lat":64.133407,"lng":-21.853879}},{"latlng":{"lat":64.133445,"lng":-21.853918}},{"latlng":{"lat":64.136177,"lng":-21.856685}},{"latlng":{"lat":64.136177,"lng":-21.856685}},{"latlng":{"lat":64.136375,"lng":-21.855171}},{"latlng":{"lat":64.136543,"lng":-21.853712}},{"latlng":{"lat":64.136543,"lng":-21.853712}},{"latlng":{"lat":64.1371,"lng":-21.854272}}];
bounty2.waves = [
    [{message:"I will get you now", delay:1000}, {actor:"attacker_soldier1", delay:3000}, {actor:"attacker_soldier2", delay:3000}, {actor:"attacker_truck", delay:3000}, {actor:"attacker_tank1", delay:3000}, {actor:"attacker_tank2", delay:3000}, {actor:"attacker_chopper", delay:3000}],
    [{message:"I will get you now", delay:1000}, {actor:"attacker_soldier1", delay:200}, {actor:"attacker_soldier2", delay:100},{actor:"attacker_soldier1", delay:300}, {actor:"attacker_soldier2", delay:3000},{actor:"attacker_soldier1", delay:3000}, {actor:"attacker_soldier2", delay:3000}]

];
*/
bounty_list = undefined; //{"1":bounty1, "2":bounty2};

function setWalkingSpeed(){
    for (var i in mmgr.actors){ var a = mmgr.actors[i]; a.properties.transition_speed = 10000; }
}


/************** GUI Code ***************/


function updateAttackCount(){
    var c = getAttackCount();
    setActionsAvailableCount("attack_count", c);
    if(c){
        smgr.playMusic(sound_events["music_battle_suspense"]);
    }
}
function getAttackCount(){
    var c = 0;
    var calls = game_state.getBattleState("phonecalls");
    for (var i in calls){
        if(!calls[i].killed){c = c + 1;}
    }
    return c;    
}
function guiAttackButton(){
    var attack_count = getAttackCount();
    /*
    if(attack_count){ //we have specifict targets, lets show a dialog box about them to the player
        guiAlert(StringFormat(_lang["gui_attack_button_targets_message"], {"attack_count": attack_count}), {"title":_lang["gui_attack_button_targets_title"]});
    }
    */
    setActionAttackGhosts();
}

function showAttackLocations(user_id){
    /* if user_id is not set we ask foursquare, else we fetch a players locations and return it in foursquare format */
    var game_mode = game_state.getGameMode();
    if((game_mode == "economy") || (game_mode == "tutorial")){
        guiSelectResetMapClear();
        var position = game_state.getAttackLocation();
        //var defence_weapons = game_state.getDefenses();
        //if (!defence_weapons.length){ guiAlert(_lang["gui_warning_message_a2312"], {"level": -1, "title": "Ops ...", "sound_notification": "ui_action_not_possible", "error_level":"gui_warning_message_a2312"}); return; }
        fetchAttackLocations(position, function(){
                mmgr.viewActors("ghost");
                updateAttackCount();
        }, {state: -666, radius: game_state.getSearchRadius(), player_id: user_id});    
        fireGameEvent("ui_attack_click");
        //game_state.setGameMode("attack_countdown");
        setTimeout(function(){
            smgr.playMusic(sound_events["music_battle_suspense"]);
        }, 1000);
    }
}

