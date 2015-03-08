var game_location_player = null;
var _delayed_call_refreshshopitems = null;
var resource_available = {};
var _search_circle = undefined;
var resource_locations = {};
var check_achivement_ts = 0;
var _user_preferences = {};
var use_enemy_location = null;
ledgers.callback = game_state.handleCallbackLedgerChange;

inventory.callback = function(item_added, param){
    param = param || {};
    if(item_added){
        if(!param.properties){ param.properties = {}; }
/*        //param.damage_max = 1;
        param.properties.damage_max = 1;
        param.properties.damage_now = 0; //FIXME: change to progress_max
*/        
        param.properties.item_id = item_added.id;
        param.properties.item_level = param.item_level;
        param.properties.item_type = param.item_type;

        if(param.hud_item){
            guiResearchDialogItemShow(item_added, item_added.id);
        }else{
            var btn_action = "";
            var name = "";
            var label =  StringCapitalise(_lang[item_added.type] || item_added.type);
            
            if(param.item_type !== "headquarters"){
                btn_action = "<img title='"+_lang["infowindow_buttons_attack_tooltip"]+"' class='infowindow_buttons infowindow_buttons_attack' src='media/images/icon_popup_attack.png' onclick='btnTE(1052, this)'/>";
            }
            if(param.item_type === "armory"){
                btn_action = "<img title='"+_lang["infowindow_buttons_research_tooltip"]+"' class='infowindow_buttons infowindow_buttons_research' src='media/images/icon_popup_research.png' onclick='btnTE(1053, this)'/>";
            }
            if (param.properties.attraction.name){
                name = "<img src='" + param.properties.attraction.icon + "' class='infowindow_geoicon'> "  + param.properties.attraction.name; //CAN NOT ADD LEVEL INFO SINCE THIS IS ALWAYS CREATED DURING LOAD var label =  StringCapitalise(_lang[item_added.type] || item_added.typ 
            }
            param.id = "building_actor_" + item_added.id;
            if(param.properties.attraction){
                 label = "<h4 class='infowindow_attraction_icon font-effect-outline font-bright' style='background-color: rgb(172, 172, 172);color: white;'>" + label + "</h4><div title='"+_lang["infowindow_buttons_payout_tooltip"]+"' class='infowindow_payoutbutton' onclick='btnTE(1056, this)'><span class='item_state'>&nbsp</span></div>" + name ;
            }
            var infowindow_buttons = "<img title='"+_lang["infowindow_buttons_details_tooltip"]+"' class='infowindow_buttons infowindow_buttons_details' onclick='btnTE(1054, this)' src='media/images/icon_popup_info.png'/> <img title='"+_lang["infowindow_buttons_upgrade_tooltip"]+"' class='infowindow_buttons infowindow_buttons_upgrade'  onclick='btnTE(1055, this)' src='media/images/icon_popup_upgrade.png'/> " + btn_action;
            param.infowindow = "<center><div id='" + item_added.id + "' class='ui_border_frame infowindow_background'>" + label + "<span class='progress'>&nbsp</span><br>" + infowindow_buttons + "</center></div>";
            amgr.requestAction("create_building_actor", param);
            var item_descr = inventory.getItemDetails(item_added);
            mapApplyIconImage(item_added.gui.id, getItemIconURL(item_descr));
        }
/*
        // popup window events
        $("body").delegate(".infowindow_buttons_attack", 'click', btnAttackFromItem); // using jquery http://api.jquery.com/delegate/
        $("body").delegate(".infowindow_buttons_research", 'click', showDialogResearch);
        $("body").delegate(".infowindow_buttons_details", 'click', btnDetailsItem);
        $("body").delegate(".infowindow_buttons_upgrade", 'click', btnUpgradeItem);
        $("body").delegate(".infowindow_payoutbutton", 'click', btnItemPayout);
*/
    }
};
game_state.callback_changed_gamemode = function(mode, param){
    /*
    if (mode == "economy"){
        hideBender(); //from main.js
        $(".economy_hud").fadeIn(1000);
        $(".battle_hud").fadeOut(800);   
        use_enemy_location = null; //used for multiplayer to setup temp home base
    }
    if (mode == "attack"){
        $(".economy_hud").fadeOut(800);   
        $(".battle_hud").fadeIn(800);   
    }
    */
};
game_state.callback_changed_storage = function(content, capacity){
    refreshShopItems();
};

game_state.callback_changed_xp = function(xp){
    $("#xp_value").html(xp.level);
    setProgressBar("xp", xp.count || 0, xp.required || 1, xp.old || 0);
    refreshShopItems();
    setTimeout(function(){checkAchievementEvent();}, 1000);
};

game_state.callback_changed_level = function(level){
    fireGameEvent("ui_jingle_levelup");
    showAttackLocations(); //fetch more calls
};

inventory.callback_item = function(item_id){
    guiUpdateItemsProgress();
    var time_now = new Date().getTime();
    item_id = item_id || this.id;
    if (!item_id){ throw "Inventory id missing"; }
    var item = inventory.getItem(item_id);
    if (!item){ throw "Resource not found using id " + item_id; }
    console.info("Callback " + item.type + " state:" + item.state);
    if (item.category == "iap"){
        return;
    }
    if (item.category == "storage"){
        game_state.handleCallbackItemStorage(item, time_now);
    }else if (item.category == "builder"){
        game_state.handleCallbackItemBuilder(item, time_now);
    }else if (item.category == "protect"){
        game_state.handleCallbackItemProtect(item, time_now);
    }else if (item.category == "support"){
        game_state.handleCallbackItemSupport(item, time_now);
    }else if (item.category == "defense"){
        game_state.handleCallbackItemDefense(item, time_now);
    }else if (item.category == "headquarters"){
        game_state.handleCallbackItemHeadquarter(item, time_now);
    }else if (item.category == "manual"){
        game_state.handleCallbackItemManual(item, time_now);
    }else if (item.category == "troops"){
        game_state.handleCallbackItemTroops(item, time_now);        
    }else{
        console.warn("Unhandled callback for item category " + item.category);
    }
};

function logUserInteractionByEventName (event_name, options){
    // do google analytics
    var analyze = game_event_analysis[event_name];
    if((!!analyze) && (analyze.analyze != 0)){
        logUserInteraction(analyze, options);
    }    
}

function fireGameEventItem(event_name, item_id){
    //do google analytics here
    //console.info("Triggering event " + event_name);
    console.info("Triggering event " + event_name + " for item " + item_id);
    logUserInteractionByEventName(event_name);
    return fireEventSoundItem(event_name, item_id);
}

function fireGameEvent(event_name, options){
    //do google analytics here
    console.info("Triggering event " + event_name);
    logUserInteractionByEventName(event_name, options);
    return fireGameSoundEvent(event_name);
}

function fireEventSoundItem(sound_name, item_id){ //main.js, game_state.js
    if(smgr.hasDebug()){
        if(sound_events[sound_name] === undefined){
            console.error("[ERROR] Sound event: '" + sound_name + "' has not been defined");
        }else{
            return smgr.playItem(sound_events[sound_name], item_id);
        }
    }
}

function fireGameSoundEvent(sound_name){ //main.js, gui.js 
    //if(sound_name == "battle_countdown"){ console.warn("BUUUUUUU "); }
    if(smgr.hasDebug()){
        if(sound_events[sound_name] === undefined){
            console.error("[ERROR] Sound event: '" + sound_name + "' has not been defined");
        }else{
            return smgr.play(sound_events[sound_name]);
        }
    }
}

function guiResearchDialogItemShow(item_info, id){
    //var hud_item = "<div onclick='btnItemPayout(this)'><span class='item_state'>&nbsp</span></div> <span class='progress'>&nbsp</span>";
    var hud_item = "<div onclick='btnTE(1056, this)'><span class='item_state'></span></div> <span class='progress'></span>";
    var live_item = inventory.getItemById(id);
    if(live_item){  // if we own this artifact
        var live_data = live_item || {};
        var live_details = inventory.getItemDetails(live_item);
        $("#" + id + " h2").html(_lang[item_info.type]);
        $("#" + id + " img").attr("src", "media/images/" + (live_details.preview || item_info.preview));
        $("#" + id + " .research_item_progress").html(hud_item);
        $("#" + id + " p").html(live_data.level || item_info.level);
        return live_item;
    }
    return null;
}

function showCurrencyProgressBars(content, capacity){ //gui.js
    //var currency = {"gold":null, "wood":null, "stone":null, "iron":null, "diamonds":null, "car1":null, "car2":null, "car3":null, "car4":null, "car5":null, "car6":null, "car7":null};
    var currency = game_state.getCurrencies();
    if ((!content) || (!capacity)){return;}
    for (var i in currency){
        if(content[i] || capacity[i]){
            var t=$("#progressbar_"+i).show();
            if(i.indexOf("car") >= 0){t.css("display", "inline-block");} //the car should be inline blocks
        }
    }
}

function doubleDigit(n){  //gui.js, 
    if (typeof(n) == "string"){
        n = n.trim();
        if(n.length == 0){
            n = "00";
        }
        if(n.length == 1){
            n = "0" + n;
        }
    }else{
        if (n < 10){ n = "0"+n;}
    }
    return n;
}
function getImageURLStorage(img, full){
    var path =  "media/images/" + img;
    if(full){
        path = location.protocol + "//" + location.host + "/" + path; 
    }
    return path;
}
function getItemImageURLByItemLevelAndType(type, level, postfix){ // main.js
    var itm = shop.getItemByType(type)[level];
    return getItemImageURLByLevelAndType(type, itm.image_level || itm.level);
}
function getItemImageURLByLevelAndType(type, level, postfix, full){ //gui.js, main.js
    postfix = postfix || "";
    var file_extension = ".png";
    if ((type == "cannon") && (postfix == "_fire")) {
        file_extension = ".gif";
    }
    return getImageURLStorage("image_"+type+"_level_"+doubleDigit(level)+postfix+file_extension, full);
}
function getItemImageURL(itm, postfix, full){ //gui.js, main.js 
    return getItemImageURLByLevelAndType(itm.type, itm.image_level || itm.level, postfix, full);
}
getItemIconURL = getItemImageURL;
function preloadImages() {  //gui.js, main.js
    //used to validate image resources
    var image_array = [];
    for(var i in shop.inventory){
        var inv = shop.inventory[i];
        for (var j in inv){
            image_array.push(getItemImageURL(inv[j])); //image_armory_level_02
        }
    }
    var preload_pictures = function(picture_urls, callback)
    {
        var loaded  = 0;
        for(var i = 0, j = picture_urls.length; i < j; i++)
        {
            var img     = new Image();
            img.onload  = function()
            {                               
                if(++loaded == picture_urls.length && callback){callback();}
            }
            img.onerror = function(){
                console.error("Loading image failed " + img.src);
            }
            img.src = picture_urls[i];
        }
    };
    //image_array = ["media/images/100px-Headquarters_lvl1.png"];
    preload_pictures(image_array, function(){
        console.log('Loaded all pictures');
    });
}

function setProgressBar(currency, amount, max, old){ //gui.js, main.js
    max = max || amount;
    var p = amount/max;
    var w = 100; //width of the progressbar
    var duration = 1000;
    if(p > 1){ p = 1;}
    $("#progressbar_"+currency+" .progressbar_bar").animate({"width": (p*100)+"%"}, duration);
    if(typeof(old) == "number"){
        old = old || 0; //parseInt($("#progressbar_"+currency+" .progressbar_value").html()) || 0;
        jQuery(function($) {
            $("#progressbar_"+currency+" .progressbar_value").countTo({
                from: old,
                to: Math.abs(amount),
                speed: duration,
                refreshInterval: 50,
                onComplete: function(value) {
                    //console.debug(this);
                }
            });
        });
        if (amount != old){
            if(amount > old){
                fireGameEvent("ui_collect_" + currency);
            }else{
                fireGameEvent("ui_counting_" + currency);
            }
        }        
    }else{
        $("#progressbar_"+currency+" .progressbar_value").html(old);
    }
}

function logMessage(msg){
    console.info(msg);
}

function updatePlayerLocation(loc){  //gui.js
    var latlng = loc.latlng;
    
    var p = getOrCreatePlayer(latlng);
    p.setPosition(latlng);

    game_location_player = latlng;
    game_state.setAttackLocation(latlng);
    if((latlng.lat + latlng.lng) > 0){
        if(!window.HQ) {
            var HQitm = inventory.getItemByType("headquarters")[0];
            if(HQitm){
                window.HQ = mmgr.getOrCreateActor(HQitm.gui.id);
            }
            useFacebookPictureForItem(window.HQ, game_state.getAuthentication());            
            setTimeout(nowCollectTheDead, 3000); //lets collect the dead if (due to facebook plugin creates a reload)
            setTimeout(chooseSocialShareSighting, 10000);
            setTimeout(function(){
                showAttackLocationsPhoneCalls();
                mmgr.viewActors("building");
            }, 2000);
        }
        if(window.HQ){
            window.HQ.setPosition({"lat":latlng.lat, "lng":latlng.lng});
        }
    }
}

function displayPlayerLocation(){ //gui.js
    locatePlayer(mmgr.map, updatePlayerLocation, function(){
        console.info(_lang["gui_warning_message_a2313"]);

    });
}

function setNetworkDataConnection(state, label){ //gui.js, main.js 
    var message = "";
    var el = $(".main_networkprogress");
    if (state == 1){ message = _lang["main_networkprogress_"+label+"_loading"]; el.fadeIn(500); }
    if (state == -1){ message = _lang["main_networkprogress_"+label+"_error"]; }
    if (state == 0){ message = ""; el.fadeOut(800); }
    el.html(message);
    trackTimer(state, 'game_data', label);
}

/*
Data specific functions
*/


function btnUpgradeItem(item_id){  // gui.js
    runDialogUpgradeItem(item_id);
}

function runDialogUpgradeItem(item_id){
    try{
        //lets try to do the actual upgrade 
        game_state.addUpgrade(inventory.getItem(item_id));
        hideDialogItemInfo();
    }catch(e){
        //when doing any upgrade and we get error lets show the upgrade dialog
        showDialogUpgradeItem(item_id);
    }
}

function showDialogUpgradeItem(item_id){  // gui.js
    var item_inst = inventory.getItem(item_id);
    showDialogItemInfo("upgrade", inventory.getItemDetails(item_inst), inventory.getItemDetails({type: item_inst.type, level: item_inst.level+1}), item_inst);
    fireGameEvent("ui_upgrade_open");
}

function btnDetailsItem(item_id){ // gui.js
    var item_inst = inventory.getItem(item_id);
    showDialogItemInfo("info", inventory.getItemDetails(item_inst), undefined, item_inst);
    fireGameEvent("ui_info_open");
}


function btnItemPayout(item_id){  //gui.js, main.js
    var item = inventory.getItemById(item_id);
    /*if(item.state == 1){
      item.state = 2;
    }*/
    game_state.setItemState(item, 5, 100);
    if (item.type == "residence"){
        spriteAnimation.play("#"+item.gui.id +" .actor_explodes", "explode_coins", "explode_coins");
    }else{
        spriteAnimation.play("#"+item.gui.id +" .actor_explodes", "explode_stars", "explode_stars");
    }
    
    //item.callback(item.id);
};

function guiFormatTimeString(ms, lang){  //gui.js
    // get total seconds between the times
    lang = lang || {};
    var delta = ms / 1000;
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    var seconds = Math.floor(delta % 60);  // in theory the modulus is not required    
    if(0 >= (days+hours+minutes+seconds)){ return _lang["gui_format_time_string_ready"];}
    var str = "";
    if (days){ str = str + days + (lang.d || "d") + " "; }
    if (hours){ str = str + hours + (lang.h || "h") + " ";; }
    if (minutes){ str = str + minutes + (lang.m || "m") + " "; }
    if (seconds){ str = str + seconds + (lang.s || "s") + " "; }
    /*if(!(days+hours+minutes)){ return seconds + "s"; }
    if(!(days+hours)){ return minutes + "m " + seconds + "s"; }
    if(!(days)){ return hours + "h " + minutes + "m " + seconds + "s"; }
    return days + "d " + hours + "h " + minutes + "m " + seconds + "s";
    */
    return str;
}

function showAttackLocationsValidateFunds(){  //gui.js
    //check if we have enough currency for a fight
    var payment = game_state.getStorageContents();
    var cheapest = game_state.getAttackPrice().gold_budget;
    if(payment["gold"] < cheapest){
        guiAlert(StringCapitalise(StringFormat(_lang["gui_warning_message_e1052"], {"currency":_lang["gold"], "attack_price": cheapest, "currency_amount": payment["gold"]})), _lang["dialog_title_resourcemissingattack"], {"message": "Missing resources", "sound_notification": "ui_action_funds_notenough"});
        throw "Currency gold is not enough";
    }   
}

function guiResearchItem(self){
    // this will only be called by the research dialog
    var elid = $(self).parent()[0].id; 
    var item_id = elid;  
    var item_upgrade = inventory.getItem(item_id);
    if(item_upgrade){ 
        //if we have it then flaunt it
        showDialogItemInfo("info", inventory.getItemDetails(item_upgrade), undefined, item_upgrade);
        fireGameEvent("ui_info_open");
    }else{
        
        //if we dont have it lets buy it
        d = item_id.replace("hud_actor_", "").split("_");
        try{
            game_state.addPurchase(d[1], 1, {hud_item: true, "id": item_id});
        }catch(e){
            guiAlert(StringCapitalise(StringFormat(_lang["gui_warning_message_a6101"], {"message": e.message || e})));
        }
    }

    /* FIXING RESEARCH
    var elid = self.id;
    var item_upgrade = inventory.getItemById(elid);
    var d = {};
    try{
        if(!item_upgrade){
            d = elid.replace("hud_actor_", "").split("_");
            game_state.addPurchase(d[1], 1, {hud_item: true, "id":elid});
        }else{
            game_state.addUpgrade(item_upgrade);
        }
    }catch(e){
        if(!item_upgrade){
            item_upgrade = shop.getItemByType(d[1])[1];
        }
        showDialogItemInfo("upgrade", inventory.getItemDetails(item_upgrade), inventory.getItemDetails({type: d[1] || item_upgrade.type, level: item_upgrade.level+1}), item_upgrade);
        fireGameEvent("ui_upgrade_open");
    }
    */
}

function showDialogBattleDetails(location_id){
    var info = resource_locations[location_id];
    var battle_count = game_state.getBattles(1).length;
    info.distance = info.location.distance; // move information regarding the distance so we can display it in our gui
    $(".menudialog_battledetails h2").html(_lang["attack_details_title"]);
    $(".menudialog_battledetails p").html(StringFormat(_lang["attack_details_message"], info));
    $(".menudialog_battledetails input").val(location_id);
    $(".menudialog_battledetails").show();
    fireGameEvent("ui_battle_details_open");
    showDialogBattleRewards(".menudialog_battleresult_currency_frame", {currency: info}); //FIXME: should clean up the info passed
    if(battle_count){
        $(".menudialog_battledetails .gui_button_battletutorial").hide();
        $(".menudialog_battledetails .gui_button_battleattack").show();
        $(".menudialog_battledetails .gui_button_battledelagate").show();        
    }else{
        $(".menudialog_battledetails .gui_button_battletutorial").show();
        $(".menudialog_battledetails .gui_button_battleattack").hide();
        $(".menudialog_battledetails .gui_button_battledelagate").hide();        
    }
    /*
        hide all and show only the right one
          ".menudialog_battledetails .gui_button_battletutorial": "confirm attack"
          ".menudialog_battledetails .gui_button_battleattack": "confirm",
          ".menudialog_battledetails .gui_button_battledelagate": "delegete"        
    */
}

function hideDialogBattleDetails(ignore_close_event){
    $(".menudialog_battledetails").hide();
    if(!ignore_close_event){
        fireGameEvent("ui_battle_details_close");
    }
}

function guiSelectAttackLocation(item_id){
    showDialogBattleDetails(item_id);
}

function runSelectAttackLocationConfirmed(location_id){
    attackLocation(location_id);
    guiSelectAttackHideActors();
    hideDialogBattleDetails(true);
}

function guiSelectAttackLocationConfirmed(){
    //fireGameEvent("ui_battle_confirm");
    location_id = $(".menudialog_battledetails input").val();
    runSelectAttackLocationConfirmed(location_id);
}

function guiSelectAttackLocationTutorial(){
    hideDialogBattleDetails(true);   
    showTutorial({"id": "tutorial_battletutoralstarts"});
}

function guiSelectAttackLocationDelagate(){
    fireGameEvent("ui_battle_delegate");
    var location_id = $(".menudialog_battledetails input").val();
    //attackLocation(location_id);
    //guiSelectAttackHideActors();
    //hideDialogBattleDetails(true);
    var location_details = getLocationDetailsById(location_id) || null;
    if(!location_details){ throw "Location details was not found"; }
    var base_position = getGameLocation();  //bla
    if (game_state.getAuthentication("facebook")){
        hideDialogBattleDetails(true);
/* DO NOT NEED TO DO THIS ANY MORE SINCE WE USE DATABASE
        // lets cut out the crap because we must limit the request to 250
        if(location_details.name.length > 16){
            location_details.name = location_details.name.substring(0, 12) + " ...";
        }
*/
        var message = StringFormat(_lang["social_request_delegate_message"], {"name": location_details.name, "street_name": location_details.location.address || _lang["social_request_delegate_defaultstreet"]});
        if (!location_details.location.address){
            message = StringFormat(_lang["social_request_delegate_message_noaddress"], {"name": location_details.name});
        }
        addSocialRequest(StringFormat(_lang["social_request_delegate_title"], {"name": location_details.name}), message, "attack_request",
            {
                "name": location_details.name,
                "attack_level": location_details.attack_level,
                "gold": location_details.gold,
                "wood": location_details.wood,
                "xp": location_details.xp,
                "gold_budget": location_details.gold_budget,
                "id": location_details.id,
                "details": " ", //fixme
                "categories": [location_details.categories[0]],
                "location": {
                    "lat": location_details.location.lat,
                    "lng": location_details.location.lng
                },
                "target": [base_position.lat, base_position.lng]
            });
    }else{
        showDialogSocial();
    }
}

function btnAttackFromItem(item_id){
    guiSelectResetMapClear();
    var item_upgrade = inventory.getItem(item_id);
    var p = item_upgrade.gui.position;
    game_state.setAttackLocation({lat:p[0], lng:p[1]});
    showAttackLocations();
}

function btnMoveForItem(item_id){
    guiSelectResetMapClear();
    var item_upgrade = inventory.getItem(item_id);
    var p = item_upgrade.gui.position;
    /*
    game_state.setAttackLocation({lat:p[0], lng:p[1]});
    showAttackLocations();
    */
    var a = mmgr.getOrCreateActor(item_upgrade.gui.id)
    a.setItemDraggable(!a.isItemDraggable());
}

function btnCompleteBuildingItem(item_id){
    showDialogInstantBuild(item_id);
    fireGameEvent("ui_instant"); //or ui_upgrade_instantly
}
function guiAlertHide(){
    $(".menudialog_message").hide();
}
function guiAlert(msg, options){
    options = options || {};
    var title = options.title || "Message";
    if(options.sound_notification){fireGameEvent(options.sound_notification);}
    $(".menudialog_message").show();
    $("#menudialog_message_title").html(title);
    $("#menudialog_message_description").html(msg);
    if (options.error_level){
        handleException(options.error_level, -1);
    }
}
function guiUpdateInitProgress(percentage, message){
    //called during init and removes splash when percentage is larger than 1
    /*
    var timout = 1000;
    $("#progressbar_init .progressbar_bar").animate({"width": percentage*100+"%"}, timout);
    if(message){
        $("#progressbar_init .progressbar_loadinginfo").html(message);
    }
    */
    setProgressBar("init", percentage*100, 100, message);
    var timout = 1000;
    if (percentage >= 1){
        setTimeout(function(){$(".menudialog_splash").fadeOut(500);}, timout);
    }
}
function guiUpdateItemProgress(itm){
    progress = "";
    //$("#"+itm.id+" .progress").html(Math.ceil(itm.progress*100)+"%");
    if (itm.state == 0){
        if (itm.ms >= 0){
            var instant_cost = iapgems.getGems4Resource(itm.ms/1000, "time");
            progress = "<br>" + guiFormatTimeString(itm.ms) + "<br><a href='#' class='button_link' onclick='btnTE(1126, this)'>" + (_lang["gui_button_label_instantupgrade"] || "Instant") + "</a><br>(" + instant_cost + " " + _lang["diamonds"] + ")";
            $("#"+itm.id+" .progress").html(progress); //instant button needs to call this when done
        }else{
            $("#"+itm.id+" .progress").html("");
        }
        actor = mmgr.actors["building_actor_"+itm.id];
        if(actor && itm.progress){
            actor.setGameProperty("damage_now", itm.progress);
        }
    }
}
function guiUpdateItemsProgress(){
    var progress, itm, actor, itms = inventory.getProgress();
    for (var i in itms){
        guiUpdateItemProgress(itms[i]);
    }
    if (game_state.getGameMode() == "attack"){tickBombValues();}    
}

function guiAnimateProgressbarCurrency(latlng){
    //FIXME: this is used to animate the coins when clicking on the building. The coins should flow from location to progressbar
    //latlng = mmgr.actors.building_actor_1398811438239.marker.getLatLng() --> s.Point {x: 524, y: 287, clone: functi
    var p = mmgr.map.latLngToContainerPoint(latlng);
    console.info("--- " + JSON.stringify(p));
}

function refreshShopItems(nodelay){
    if (!nodelay){//this will make sure we only call this function once (even if requrested often)
        if(!_delayed_call_refreshshopitems){
            _delayed_call_refreshshopitems = (new Date()).getTime() + 1000; //one second into the future
            setTimeout(function(){refreshShopItems(true);}, 1000);
        }
        if(_delayed_call_refreshshopitems < (new Date().getTime())){
            return; //if this is a delayed call that has not been timed yeat
        }
    }
    _delayed_call_refreshshopitems = undefined;
    var state_copy = game_state.getStateCopy();
    if(!resource_available){resource_available = {};} //FIXME:  should be this.
    showCurrencyProgressBars(state_copy.storage_contents, state_copy.storage_capacity);
    for (var l in state_copy.storage_contents){
      //$("#ledger_"+l).html(state_copy.storage_contents[l]);
      setProgressBar(l, state_copy.storage_contents[l], state_copy.storage_capacity[l], resource_available["upgrade_"+l]);
      resource_available["upgrade_"+l] = state_copy.storage_contents[l];
    }
    resource_available["head_quarter"] = game_state.getHeadQuarterLevel();
    resource_available["xp_level"] = game_state.getXP().level;
    //refresh shop_shelf
    $("#shop_shelf").html("");
    var item, items = shop.getAffordable(resource_available);
    var allowed_count, hq_level = game_state.getHeadQuarterLevel();
    purchase = {"iap":0, "troops":0, "manual":0, "headquarters":0, "storage":0, "builder":0, "protect":0, "support":0, "defense":0};
    for(var i in items){
        //test better if(item.level != 1){ continue;}
        item = items[i];
        allowed_count = inventory.getAllowedCount(item.type, hq_level);
        if((allowed_count == undefined) || (allowed_count > inventory.getItemByType(item.type).length)){
            $("#item_detail_"+item.type+" .purchase").html(_lang["purchase"] || "purchase");
            if(item.level == 1){
                if(item.type != "captured"){
                    purchase[item.category] = purchase[item.category] + 1;
                }
            }
        }
        //$("#shop_shelf").append("<option>"+item.type + " " + item.level +"</option>");
    }    
    // menu actions available
    setActionsAvailableCount("purchase_count", purchase["builder"]+purchase["storage"]+purchase["protect"]+purchase["support"]+purchase["defense"]); //purchase["total"]);
    $(".menuitems_button_economy .purchase_count").html(purchase["builder"]+purchase["storage"]+purchase["protect"]);
    $(".menuitems_button_support .purchase_count").html(purchase["support"]);
    $(".menuitems_button_defense .purchase_count").html(purchase["defense"]);
    return purchase;
}
function menuItemsCreateShelfItems(){
    for (var i in shop.inventory){
        menuItemsCreateShelfItem(i, shop.inventory[i]);
    }
    refreshShopItems();
    $(".menuitems_container").hide();
}
function menuItemsCreateShelfItem(item_type, items){
    var item = items[1] || items[0]; //get level 1 (where it all starts) or level 0 (for IAP)
    var nice_name = _lang[item_type] || item_type.replace("_", " ");
    $("#item_detail_"+item_type+" h2").html(nice_name);
    $("#item_detail_"+item_type+" img").attr("src", getItemImageURL(item));
    $("#item_detail_"+item_type+" .purchase").html(_lang["missing_resources"] || "missing resources");
    $("#item_detail_"+item_type+" .purchase").on("click tap", function(event){
        btnAddResourceItem(item_type);
    });
    $("#item_detail_"+item_type+" img").on("click tap", function(event){
        guiShowShelfItemDialog(item_type);
    });
    $("#item_detail_"+item_type+" .item_detail_info").doubletap(function(event){
        guiShowShelfItemDialog(item_type);
    });    
}

function menuItemsHideShelfItems(){
    $(".menuitems_container").hide();
    fireGameEvent("ui_dialog_close");    
}

function menuItemsShowShelfItems(){
    for (var i in shop.inventory){
        menuItemsUpdateShelfItem(i, shop.inventory[i]);
    }
    var r = refreshShopItems(true);
    $(".menuitems_container").fadeIn(300);
    return r;
}

function menuItemsUpdateShelfItem(item_type, items){
    var item = items[1] || items[0]; //get level 1 (where it all starts) or level 0 (for IAP)
    var type = _lang["gold"];
    var cost = item.upgrade_gold;
    var details = "";
    var item_max = inventory.getAllowedCount(item_type, game_state.getHeadQuarterLevel());
    var item_count = inventory.getItemByType(item_type).length;
    if (item.upgrade_wood){ type = _lang["wood"]; cost = item.upgrade_wood; }
    if (item.upgrade_stone){ type = _lang["stone"]; cost = item.upgrade_stone; }
    if (item.upgrade_iron){ type = _lang["iron"]; cost = item.upgrade_iron; }
    /*if (item.upgrade_cash){ type = _lang["cash"]; cost = item.upgrade_cash; }*/
    if (item.diamonds){ //special case iap
        details = StringFormat(_lang["menuitems_shelf_iap_details"], item);
    }else{
        details = "" + type + " " + cost + "<br>" + _lang["menuitems_shelf_iap_details_time"] + guiFormatTimeString(item.upgrade_time*1000) + details;
    }
    if(item_max != undefined){
        details = details + " <br>" + _lang["menuitems_shelf_iap_details_maxcount"] + item_count + "/" + item_max;
        if (item_max > item_count){ //if the player can not build the building lets make it gray
            $("#item_detail_"+item_type+" img").removeClass("desaturate_img").attr("title", _lang["menuitems_shelf_details_title_nowavailable"]);
            $("#item_detail_"+item_type+" .purchase").html(_lang["missing_resources_nowavailable"]);
        }else{
            $("#item_detail_"+item_type+" img").addClass("desaturate_img").attr("title", _lang["menuitems_shelf_details_title_notavailable"]);
            $("#item_detail_"+item_type+" .purchase").html(_lang["missing_resources_notavailable"]);
        }
    }
    $("#item_detail_"+item_type+" p").html(details);
}

function menuItemsShow(shelf_id, skip_sound){
    //set default button (where image is up)
    $(".menuitems_button_economy").css("background-image", "url('stylesheets/gui_slidersectionbuttons_economy.png')");
    $(".menuitems_button_defense").css("background-image", "url('stylesheets/gui_slidersectionbuttons_defense.png')");
    $(".menuitems_button_support").css("background-image", "url('stylesheets/gui_slidersectionbuttons_support.png')");
    //set selected button (where image is down)
    if(shelf_id.indexOf("iap") == -1){
        $(".menuitems_button_" + shelf_id).css("background-image", "url('stylesheets/gui_slidersectionbuttons_" + shelf_id + "_selected.png')");
    }
    //pupulate 
    $(".menuitems_container_message").html("");
    $(".menuitems_slider_container").hide();    
    $("#menuitems_slider_content_"+shelf_id).parent().show();

    var shelf_item_width = 1900/9;
    var shelf_slider_width = shelf_item_width*9; //regular width of drag handle  1680/9 = 
    if (shelf_id == "support"){ shelf_slider_width = shelf_item_width*3; }
    if (shelf_id == "defense"){ shelf_slider_width = shelf_item_width*7; }
    if (shelf_id == "iap"){ shelf_slider_width = shelf_item_width*5; }
    $("#menuitems_slider .handle").css({"width": shelf_slider_width});
    dragdealer.reflow();
    if(!skip_sound){fireGameEvent("ui_" + shelf_id);}
}

function guiShowShelfItemDialog(item_type){
    //var item_type = $(self).parent().parent().attr("id").replace("item_detail_", ""); //"item_detail_quarry"
    var item_level = 1; //always level 1    
    var msg = null;
    var items = shop.getItemByType(item_type);
    if(items){
        showDialogItemInfo("create", {}, items[item_level]);
        fireGameEvent("ui_create_open");
    }
}

function runPurchaseIAPCorrection(){
    /*
        should be hidden 
        "iditem-diamons00": {"account":"resource", "name": "Startup of diamonds", "diamonds":155, "time":20, "iap":-2},
        "iditem-iap": {"account":"resource", "name": "IAP", "iap":20},        
    */
    var url = url_domain + "payment/total"+getUserAuthKey()+"?ts="+(new Date().getTime());
    $.getJSON(url, function(data){
        if(data.error){ showDialogAuthenticationRequiredWarning(); return; }
        var server_plus = data.value; //this is what the server says the player should have
        var client_plus = 0;
        var client_minus = 0; //this is a summary of all added transactions we have had (all plus transactions)
        var client_total = 0;
        var trans = ledgers.currencies.diamonds.records;
        for (var i in trans){
            if(trans[i].item.diamonds > 0){
                client_plus = client_plus + trans[i].item.diamonds;
            }else{
                client_minus = client_minus + trans[i].item.diamonds;
            }
            client_total = client_total + trans[i].item.diamonds; //we could use a summary but this is more correct
        }
        var diff = server_plus-client_plus; //should be 0 on regular checkups, should be plus when a client bought some diamonds (should be minus if the player has cheated: LOGME)
        //WAS if(diff){ledgers.addTransactionAction('buy', {"account":"resource", "name": "IAP Correction", "diamonds":server_plus+client_minus+diff, "time":20, "iap":2});}
        t = 0;
        try{ t = iapgems.getResource4Gems(diff, "time"); }catch(e){}
        if(diff){ledgers.addTransactionAction('buy', {"account":"resource", "name": "IAP Correction", "diamonds":diff, "time": t, "iap": 0});}
    });     
}

function guiAddResourceItem(item_id, item_level, nolocation){
    try{
        game_state.canUpgradeItemException(item_id, item_level); //can we purchase level 1 of this item type
        var building = ii_resources[item_id];
        if((!building.typeid) || nolocation){ //if a build id has been specified. then we want to add to map 
            game_state.addPurchase(item_id, item_level, {});
        }else{
            fetchResourceLocations(getGameLocation(true), null, {state: building.typeid, categories: building.category, query:building.query, radius: game_state.getSearchRadius()});
        }
        $(".menuitems_container").hide();
    }catch(e){
        guiShowShelfItemDialog(item_id);
    }
}

function btnAddResourceItem(item_type, nolocation){
    //var item_id = $(self).parent().parent().attr("id").replace("item_detail_", ""); //example: "item_detail_quarry"
    guiSelectResetMapClear();
    var item_level = 1; //always level 1
    guiAddResourceItem(item_type, item_level, nolocation);
    fireGameEvent("ui_purchase_resource");
}

function guiSelectResourceCancel(skip_sound){
    //remove search circle
    if(!skip_sound){fireGameEvent("ui_purchase_resource_cancel");}
    guiSelectResetMapClear();
    setTimeout(function(){checkAchievementEvent();}, 1000);
}

function guiSelectAttackHideActors(){
    guiSelectResetMapClear();
}

function guiSelectResetMapClear(){
    if(_search_circle){map.removeLayer(_search_circle); _search_circle = undefined;}
    //remove resource locations (if visible)
    var resources = mmgr.getActorsByType("resource");
    for(var i in resources){resources[i].destroy();}
    //remove attack locations (if visible)
    var resources = mmgr.getActorsByType("attack");
    for(var i in resources){resources[i].destroy();}
}

function guiSelectAttackCancel(){
    //remove search circle
    guiSelectResetMapClear();
    fireGameEvent("ui_attack_resource_cancel");
    setGameStatusBattleEnds(0);
}
function getResourceTypeByStateNumber(state_nr){
    for(var i in ii_resources){
        if(ii_resources[i]["typeid"] == state_nr){return i;}
    }
    return null; 
}
function guiSelectResourceLocation(item_id, state){
    /* this is a callback on all unused resource locations on map, the state decides what to do next */
    //remove all resources from the map
    guiSelectResourceCancel(true);
    var game_item_building = null;
    //handle state    
    if (state === -666){
        fireGameEvent("ui_attack_resource_select");
        attackLocation(item_id);
        return;
    }

    //find state
    game_item_building = getResourceTypeByStateNumber(state);

    if (game_item_building === null){ throw "Building state not found " + state; }
/*    var attraction = resource_locations[item_id];
    var icon_url = undefined;
    if (attraction.categories){
        icon_url = attraction.categories[0].icon.prefix+"64"+attraction.categories[0].icon.suffix;
    }
    var param = {
        id: attraction.id,
        location_id: attraction.id,
        position: [attraction.location.lat, attraction.location.lng],
        type: "building",
        //base_class: "actor_building_"+game_item_building,
        base_class: "actor_building",
        actor: "building",
        properties: {"attraction": {"name": attraction.name, "id": attraction.id, "icon": icon_url, "category": attraction.categories[0].name, "details":{}, "address":{} }}
    };
    // here we add the area data and names to be used by multiplayer server
    $.extend(param.properties.attraction.details, attraction);
    param.properties.attraction.details["data_source"] = "fouresquare";
    
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
*/  
    var param = extractResourceInformation(resource_locations[item_id], "building");  
    // register the purchase
    game_state.addPurchase(game_item_building, 1, param);
    fireGameEvent("ui_purchase_resource_select");
}

function showDialogAuthenticationRequiredWarning(){
    guiAlert(_lang["gui_warning_message_a6102"], {"title": _lang["gui_warning_heading_a6102"] || "Authentication", "sound_notification": "ui_action_not_possible", "error_level":"gui_warning_message_a6102"});
}

function hideDialogPurchasedIAPItem(data){
  fireGameEvent("ui_boughtaip_close");
  $(".menudialog_buyaipframe").hide();
}

function showDialogPurchasedIAPItem(item_id, data){
  /*
    Will query the server about the recent purchase (validating from payment source).
    Then send us some nice display data (and at the same time updates server with purchase information).
    Should be called by the currency platform validation url and handle here.
    We simply show our gratitude and run a "correct diamond purchase".
    data parameter has the following object
    {
        amount: "6.26"
        currency: "USD"
        payment_id: 510620569068342
        quantity: "1"
        status: "completed"
    }
  */
  menuItemsHideShelfItems(); //hide shelf
  //say thanks
  fireGameEvent("ui_boughtaip_open");
  $(".menudialog_buyaipframe").show();
  //run a validation (wich will automatically do a correction)
  data = data || {};
  var iap_item = shop.getItemByType(item_id || "iap01")["1"];
  var count = data.amount || 1;
  var amount = (data.amount || iap_item.upgrade_cash) * count;
  var preview = getItemImageURL(iap_item) || iap_item.preview;
  $("#menudialog_buyiapframe_content").html(StringFormat(_lang["gui_dialogiappurchase_complete"], {"name":iap_item.name, "price": parseFloat(amount).toFixed(2), "count":iap_item.diamonds, "preview":preview, "amount":data.amount || 1, "currency":data.currency || "USD"}));
  logUserPurchase(iap_item, amount, count);
}

function hideDialogSocial(){
    fireGameEvent("ui_social_close");
    $(".menudialog_socialframe").hide();
}

function showDialogSocial(){
    fireGameEvent("ui_social_open");
    $(".menudialog_socialframe").show();
 /*
    FB.login(function(response) {
        debugger;
      if (response.status === 'connected') {
        // Logged into your app and Facebook.
      } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
      } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
      }
    });*/

}

function updateMessageCount(c){
    if(c == undefined){
        c = 0;
        var msgs = getMessages();
        var read = game_state.getItem("messages_read");
        for(var i in msgs){
            if(!read[msgs[i].mid]){
                c = c + 1;
            }
        }
    }
    setActionsAvailableCount("messages_count", c);
}

function acceptPlayerMessage(message_id, accept_type){
    //accept_type can be 1 (accept) or -1 (attack), 0 is open and close
    var msgs = getMessages();
    var read = game_state.getItem("messages_read") || {};
    //find the message in the list
    for (var i in msgs){
        if(("message_created_" + msgs[i].created) == message_id){            //found it, lets extract the data about this message to see what to do
            msg = msgs[i];
            break;
        }
    }     
    if(accept_type == 0){ //just open and close
        var message_opened = $(".menudialog_messages_text").filter(":visible");
        message_opened.slideUp(400, function(){
           $("#" + message_id + " .menudialog_messages_text").slideDown(400); 
        });
        if(message_opened.length == 0){
            $("#" + message_id + " .menudialog_messages_text").slideDown(400); 
        }
        read[msg.mid] = new Date().getTime();
        game_state.setItem("messages_read", read);
        $("#" + message_id + "").removeClass("menudialog_messages_row_unread").addClass("menudialog_messages_row_isread");
        updateMessageCount();
        return;
    }
    // do an action 1 or -1
    hideDialogMessages(true);
    var msgtbl = "";
    if (msg){ //we found the message, lits find out what to do 
        if(accept_type == 1){
            var md = msg.data;
            if(true){
                resource_locations[md.id] = md; //fill the resource_locations
                runSelectAttackLocationConfirmed(md.id);
            }
            return;            
        }else if(accept_type == -1){
            if(msg.xp_level == undefined){ showAttackLocations(msg.from.id); } 
            else{
                // lets match make players and promote leveling 
                var xp_mine = game_state.getXPLevel();
                var xp_their = msg.xp_level;
                var xp_recomended = xp_their-2;
                if(xp_recomended < xp_their){
                    guiAlert(StringFormat(_lang["gui_warning_message_m1002"], {"xp_mine": xp_mine, "xp_their": xp_their, "xp_recomended": xp_recomended}), {"title": _lang["gui_warning_heading_m1002"], "error_level": "gui_warning_message_m1002"});
                }else{
                    showAttackLocations(msg.from.id);    
                }
            }
        }

    }
}

function hideDialogMessages(accepted){
    $(".menudialog_messages").hide();
    if(accepted){
        fireGameEvent("ui_message_accept");
    }else{
        fireGameEvent("ui_message_close");
    }
}

function showDialogMessages(){
    fireGameEvent("ui_messages_open");
    //if(!hasAuthenticated()){showDialogSocial(); return;}
    $(".menudialog_messages").show();
    updateDialogMessages();
}

function runAchivement(self){
    game_achivements[self.id];
    showTutorial(self);
    hideDialogAchivements(true);
}

function collectAchivement(achivement_group_id){
    game_state.collectAchivementGroup(achivement_group_id);
    $("#"+achivement_group_id).html(_lang["achivement_accepted"]).removeClass("blink_me");
}

function hideDialogAchivements(accepted){
    $(".menudialog_achivements").hide();
    if(accepted){
        fireGameEvent("ui_achievement_accept");
    }else{
        fireGameEvent("ui_achievement_close");
    }
}

function showDialogAchivements(){
    fireGameEvent("ui_achievement_open");
    /* dynamically loads a list of possible achivements */
    var handle = $("#menudialog_achivements_container .handle");
    handle.html("");
    $(".menudialog_achivements").show();
    var c = 0;
    for (var i in game_achivement_groups){
        var g = game_achivement_groups[i];
        var s = 0;
        btn = '<i class="font-effect-outline">' + _lang["achivement_complete"] + '</i>';
        var rev = {"diamonds":0, "xp":0};
        var nextachivement = null;
        var description = "";
        for (var j=g.achivements.length-1; j >= 0; j--){ //back to front
            var a = game_achivements[g.achivements[j]];
            var achivment = game_state.getAchivement(g.achivements[j]) || {};
            if((achivment) && (achivment.complete)){
                s = s + 1;
                if(!achivment.collected){
                    rev.diamonds = rev.diamonds + a.rewards.diamonds;
                    rev.xp = rev.xp + a.rewards.xp;
                    btn = '<a class="button_link" href="#" id="'+i+'"" onclick="btnTE(2011, \''+i+'\')">'+_lang["achivement_accept"]+'</a>';
                    description = description + a.description + "<br>";
                }
            }else{
                nextachivement = g.achivements[j];
            }
        }
        if(s == 3){ description = g.description; }
        if((rev.diamonds == 0) && (nextachivement != null)){
            //btn = '<a class="button_link" href="#" id="'+nextachivement+'"" onclick="btnTE(1212, this)">'+_lang["achivement_queued"]+'</a>'
            btn = '<b class="font-effect-outline">'+game_achivements[nextachivement].title+'</b>';
            rev.diamonds = game_achivements[nextachivement].rewards.diamonds;
            rev.xp = game_achivements[nextachivement].rewards.xp;
            description = game_achivements[nextachivement].description;
        }
        //menudialog_achivements_colum
        var columns = '<div class="menudialog_achivements_colums"><span class="menudialog_achivements_colum_left">'+btn+'</span><span class="menudialog_achivements_colum_right font-effect-outline">'+rev.diamonds+' <img class="menudialog_achivement_item_currency" src="media/images/icon_small_diamond.png"/></span><span class="menudialog_achivements_colum_right font-effect-outline">'+rev.xp+' <img class="menudialog_achivement_item_currency" src="media/images/icon_small_xp.png"/></span></div>';
        achivement_stars = "<center><img class='menudialog_achivement_image' src='media/images/image_achivements_"+s+".png'/></center>";
        //handle.append('<div class="menudialog_achivement_item"><h4 class="font-effect-outline font-bright">'+g.title+'</h4><p>'+g.description+'</p><div class="menudialog_achivement_item_currency"><img src="media/images/icon_small_xp.png"/>'+a.rewards.xp+'<img src="media/images/icon_small_diamond.png"/>'+a.rewards.diamonds+'</div>'+btn+'</div>')
        handle.append('<div class="menudialog_achivement_item"><div class="menudialog_achivements_block">'+achivement_stars+'<h4 class="font-effect-outline font-bright">'+g.title+'</h4>'+columns+'<p>'+description+'</p></div></div>')
        c = c + 1;
    }
    handle.css({"width": 202*c}); /* each is appox 144px in width*/
    dragdealer_achivments.reflow();
}

function showDialogFeedback(){
    $(".menudialog_feedback").show()
    var content = '<center><p>In developing this game we are testing the idea "games on maps". Any feedback would be helpful</p><a class="button_link" href="/feedback.html" target="feedback">Open the feedback window</a></center>';
    $("#menudialog_feedback_content").html(content);
}

function showDialogPreferences(){
    if(!hasAuthenticated()){
        $("#menudialog_preferences_socialaccount_button").show();
        $("#menudialog_preferences_logout_button").hide();
    }else{
        $("#menudialog_preferences_socialaccount_button").hide();
        //$("#menudialog_preferences_logout_button").show();
    }
    $(".menudialog_preferences").show();
    $('#menudialog_preferences_soundvolume_slider').sGlide('startAt', smgr.getVolume()*100, true);
    $('#menudialog_preferences_musicvolume_slider').sGlide('startAt', smgr.getVolume("music")*100, true);
    fireGameEvent("ui_settings_open");
    showDialogPreferencesInfo();
}

function showDialogPreferencesInfo(){
    $("#menudialog_preferences_soundvolume").val(smgr.getVolume());
    $("#menudialog_preferences_soundmuted").prop('checked', smgr.hasMuted());
    $("#menudialog_preferences_musicmuted").prop('checked', !smgr.hasMusic());    
}

function hideDialogPreferences(){
    $(".menudialog_preferences").hide();
    fireGameEvent("ui_settings_close");
}

function hideDialogCharacter(){
    $(".menudialog_character").hide();
    fireGameEvent("ui_tutor_close");
}
function showDialogCharacter(say, options){
    $(".menudialog_character").show();
    $(".menudialog_character #menudialog_character_say").html(say);
    var character_answer = "";
    if(options.inputs){
        var inp;
        for (var i in options.inputs){
            inp = options.inputs[i];
            character_answer = character_answer + "<input id='"+inp.action+"' type='"+inp.type+"' value='"+(inp.value || "")+"'/><br><br>";
        }
    }
    if(options.buttons){
        var btn;
        for (var b in options.buttons){
            btn = options.buttons[b];
            character_answer = character_answer + "<a class='button_link button_size_dialog' href='#' id='"+btn.action+"' onclick='btnTE(1212 , this)'>"+btn.text+"</a> ";
        }
    }
    $("#menudialog_character_answer").html(character_answer);
    fireGameEvent("ui_tutor_open");
}

function hideDialogShareimage(){
    $(".menudialog_shareimage").hide();
    fireGameEvent("ui_shareimage_close");
    nowCollectTheDead(); 
}

function hideDialogResearch(){
    $(".menudialog_research").hide();
    fireGameEvent("ui_armory_close");
}
function showDialogResearch(){
    $(".menudialog_research").show();
    fireGameEvent("ui_armory_open");
}

function hideDialogInstantBuild(){
    $(".menudialog_instantcomplete").hide();
    fireGameEvent("ui_instant_close");
}

function showDialogInstantBuild(item_identity_type, level){
    var price = getInstantBuildCost(item_identity_type, level);
    var contents = game_state.getStorageContents();
    $("#menudialog_instantcomplete_itemid").val(item_identity_type);
    $("#menudialog_instantcomplete_itemlevel").val(level);
    $(".menudialog_instantcomplete").show();
    if (contents.diamonds < price.diamonds){
        $("#menudialog_instantcomplete_content").html(StringFormat(_lang["gui_dialoginstant_upgrade_nofund"], {"price": price.diamonds, "left": contents.diamonds}));
    }else{
        $("#menudialog_instantcomplete_content").html(StringFormat(_lang["gui_dialoginstant_upgrade_okfund"], {"price": price.diamonds}));
    }
    
    fireGameEvent("ui_instant_open");
}

function executeInstantBuild(item_identity_type, level){
    item_identity_type = $("#menudialog_instantcomplete_itemid").val();
    level = $("#menudialog_instantcomplete_itemlevel").val();
    var price = getInstantBuildCost(item_identity_type, level);
    //get the price to instantly build the item
    //check that we have enough gems
    for (var currency in price){
        var transaction = {"account": "resource", "name": currency};
        transaction[currency] = price[currency];
        if(currency == "diamonds"){
            transaction[currency] = price[currency] * -1;
        }
        try{
            ledgers.addTransactionAction("instant", transaction);
            game_state.addAchivement("achivement_usediamonds", 1);
        }catch(e){ //if fails it will most likely be because there is no diamonds in storage. Lets open up purchase menu
            hideDialogInstantBuild();
            menuItemsShowShelfItems();
            hideDialogItemInfo();
            menuItemsShow('iap');
            return;
        }

    }
    //lets do what the player payed for
    var item_upgrade = inventory.getItem(item_identity_type);
    if (item_upgrade){ //if this was a instant item then we want to clear the time
        //get the object that we fetched/created and shorten the development time to 3 seconds
        if (item_upgrade.state == 0){
            item_upgrade._time_callback_ends = new Date().getTime() + (2 * 1000); //time now with additional 3 seconds to wait (for showmanship)
            item_upgrade.constructed = null;
        }else{
            setTimeout(function(){game_state.addUpgrade(item_upgrade, true);}, 2000); //lets wait for the resource payout before starting to build
        }
    }else{
        //make transactions taking those gems and converting them to resource currency
        console.info("Purchasing " + JSON.stringify(price));
        //finaly do the actual purchase
        guiAddResourceItem(item_identity_type, 1, undefined);
    }
    $(".menudialog_instantcomplete").hide();
    $(".menudialog_container").hide();
    fireGameEvent("ui_build_now", {"value":price.diamonds});
}

function getInstantBuildCost(item_identity_type, level){
    var item_upgrade = inventory.getItem(item_identity_type);
    var price = {"diamonds":0};
    if (item_upgrade){ //if this was a instant item then we want to clear the time
        if (item_upgrade.state == 0){
            var timeleft = new Date(item_upgrade._time_callback_ends - (new Date().getTime()));
            if (timeleft.getYear() != 69){ //if not invalid date
                price["diamonds"] = iapgems.getGems4Resource(timeleft/1000, "time");
            }
        }else{
            price = game_state.getUpgradeBuildingCost(item_upgrade.type, level);
        }
    }else{ //lets get the type
        price = game_state.getUpgradeBuildingCost(item_identity_type, level);
    }    
    return price;
}

function btnShowDialogInstantBuild(item_id, level){
    var item_type = item_id.replace("instant_build_button_", "");
    showDialogInstantBuild(item_type, level); 
    fireGameEvent("ui_buy_resources");
}

function hideDialogItemInfo(){
    $(".menudialog_container").hide();
    fireGameEvent("ui_dialog_close");    
}

function addSocialShareItem(instance_id){
    var instance = inventory.getItemById(instance_id);
    var title = StringFormat(_lang["gui_dialogiteminfo_label_shareitem_title"], {"type": _lang[instance.type], "name": instance.gui.properties.attraction.name});
    var message = StringFormat(_lang["gui_dialogiteminfo_label_shareitem_message"], {"type": _lang[instance.type], "name": instance.gui.properties.attraction.name});
    addSocialShare(title, message, getItemImageURL(instance, undefined, true));
}
function addSocialShareBattle(){
    var bounty = getBountyBattle();
    var location = bounty.location;
    var title = StringFormat(_lang["gui_menudialog_battleresult_title"], {"name": location.name});
    var message = StringFormat(_lang["gui_menudialog_battleresult_message"], {"name": location.name});
    addSocialShare(title, message);    
}

function showDialogItemInfo(view_type, item_current, item_upgrade, instance){
    //TODO: REMOVE MISSING_RESOURCE_MESSAGE, DO CHECK IN HERE USING RAW ERROR HANDLING
    var title = "";    
    var upgrade_time = "";
    var current_level = 1;
    var item_upgrade_level = 1;
    if(item_upgrade && (item_upgrade["upgrade_time"] != undefined)){
        upgrade_time = (_lang["gui_dialogiteminfo_label_constructiontime"] || "Construction time: ") + " " + guiFormatTimeString(item_upgrade["upgrade_time"]*1000, {"h":_lang["time_format_hours"], "m":_lang["time_format_minutes"], "s":_lang["time_format_seconds"], "d": _lang["time_format_days"]});
    }
    var item_info = item_current;
    var item_upgrade_id = null;
    if (JSON.stringify(item_current) == "{}"){ 
        // if this is a purchase (not a upgrade defining an instance) we start at level 1 where the item_upgrade_level = 1
        item_info = item_upgrade;
        current_level = item_upgrade.level;
        //item_upgrade_level = current_level + 1;
        item_upgrade_id = item_upgrade.type;
    }else{
        current_level = item_current.level;
        item_upgrade_level = current_level;
        item_upgrade_id = item_current.type;
        if(item_upgrade){
            current_level = item_upgrade_level = item_upgrade.level || item_current.level;
        }else{item_upgrade = {};}
    }
    var details = "<b>"+_lang[item_upgrade_id+"_details"]+"</b><table width='100%' style='font-size:x-small;'>";
    for (var i in item_info){
        if((item_info[i] != null) && (item_info[i] != undefined) && (item_info[i] != "")){
            var tmp = ((item_upgrade[i] || 0) - (item_current[i] || 0));
            //if (tmp < 0) { tmp = 0; }
            if(item_upgrade && (!isNaN(tmp)) && (view_type != "info")){                
                change = "<td> + " + tmp + "</td>";
            }else{
                change = "<td></td>";
            }
            if (i.indexOf("capacity") != -1){
                details = details + "<tr><td>" + (_lang["gui_dialogiteminfo_label_"+i] || i.replace("_", " ")) + "</td><td>" + (item_current[i] || "") + "</td>"+change+"</tr>";
            }
            if ((i.indexOf("upgrade") != -1) && (i.indexOf("time") == -1)){
                details = details + "<tr><td>" + (_lang["gui_dialogiteminfo_label_"+i] || i.replace("_", " ")) + "</td><td>" + (item_current[i] || "") + "</td>"+change+"</tr>";
            }
            //support extra info
            /*
            if (i.indexOf("charge") != -1){ //taken from radar
                details = details + "<tr><td>" + (_lang["gui_dialogiteminfo_label_"+i] || i.replace("_", " ")) + "</td><td>" + (item_current[i] || "") + "</td>"+change+"</tr>";
            }
            if (i.indexOf("drain") != -1){ //taken from radar
                details = details + "<tr><td>" + (_lang["gui_dialogiteminfo_label_"+i] || i.replace("_", " ")) + "</td><td>" + (item_current[i] || "") + "</td>"+change+"</tr>";
            }
            */
            if (i.indexOf("range") != -1){ //taken from radar
                details = details + "<tr><td>" + (_lang["gui_dialogiteminfo_label_"+i] || i.replace("_", " ")) + "</td><td>" + (item_current[i] || "") + "</td>"+change+"</tr>";
            }
            if (i.indexOf("radar_count") != -1){ //taken from radar
                details = details + "<tr><td>" + (_lang["gui_dialogiteminfo_label_"+i] || i.replace("_", " ")) + "</td><td>" + (item_current[i] || "") + "</td>"+change+"</tr>";
            }            
            
            //towers extra info
/*            if (i == "hit_points"){ //taken from tower weapons
                details = details + "<tr><td>" + (_lang["gui_dialogiteminfo_label_"+i] || i.replace("_", " ")) + "</td><td>" + (item_current[i] || "") + "</td>"+change+"</tr>";
            }
            if (i == "dps"){ //taken from tower weapons
                details = details + "<tr><td>" + (_lang["gui_dialogiteminfo_label_"+i] || i.replace("_", " ")) + "</td><td>" + (item_current[i] || "") + "</td>"+change+"</tr>";
            }
            if (i == "rpm"){ //taken from tower weapons
                details = details + "<tr><td>" + (_lang["gui_dialogiteminfo_label_"+i] || i.replace("_", " ")) + "</td><td>" + (item_current[i] || "") + "</td>"+change+"</tr>";
            }
            if (i == "price_placing"){ //taken from tower weapons
                details = details + "<tr><td>" + (_lang["gui_dialogiteminfo_label_"+i] || i.replace("_", " ")) + "</td><td>" + (item_current[i] || "") + "</td>"+change+"</tr>";
            }
            if (i == "actor_count"){ //taken from tower weapons
                details = details + "<tr><td>" + (_lang["gui_dialogiteminfo_label_"+i] || i.replace("_", " ")) + "</td><td>" + (item_current[i] || "") + "</td>"+change+"</tr>";
            }
            if (i == "capacity_ammo"){ //taken from tower weapons
                details = details + "<tr><td>" + (_lang["gui_dialogiteminfo_label_"+i] || i.replace("_", " ")) + "</td><td>" + (item_current[i] || "") + "</td>"+change+"</tr>";
            }
            //artillary extra info
            if (i == "damage"){ 
                details = details + "<tr><td>" + (_lang["gui_dialogiteminfo_label_"+i] || i.replace("_", " ")) + "</td><td>" + (item_current[i] || "") + "</td>"+change+"</tr>";
            }
            if (i == "reload"){ 
                details = details + "<tr><td>" + (_lang["gui_dialogiteminfo_label_"+i] || i.replace("_", " ")) + "</td><td>" + (item_current[i] || "") + "</td>"+change+"</tr>";
            }
            //troops extra info
            if (i == "transition_speed"){
                details = details + "<tr><td>" + (_lang["gui_dialogiteminfo_label_"+i] || i.replace("_", " ")) + "</td><td>" + (item_current[i] || "") + "</td>"+change+"</tr>";
            }
*/
        }
    }
    details = details + "</table>";
    var button_attribution = "";
    if((instance) && (instance.category != "troops") && (instance.category != "manual")){
        button_attribution = "";
        try{
            button_attribution = button_attribution + "<a href='#' onclick='btnTE(2012, \"" + instance.id + "\")' class='button_image_share'><div></div>"+_lang["gui_dialogiteminfo_label_shareitem_button"]+"</a>";
        }catch(e){
            //ignore this error
        }
    }
    details = details + "<br>" + button_attribution;
    var button_buyresource = "";
    if((!!instance) && view_type == "info"){
        button_buyresource = "<a class='button_link' href='#' onclick='btnTE(2013, \"" + instance.id + "\")'>" + (_lang["gui_dialogiteminfo_label_upgradeitem"] || "Upgrade") + "</a>";
    }
    missing_resource_message = "";
    if (item_upgrade && (view_type != "info") && (item_info.category != "iap") ){
        try{
            game_state.canUpgrade(item_upgrade_id, current_level);
            // allow upgrade
            if ((!!item_current.type) && (!!instance)){
                item_upgrade_id = instance.id;
                button_buyresource = "<a class='button_link' href='#' onclick='btnTE(2014, \"" + item_upgrade_id + "\");'>" + (_lang["gui_dialogiteminfo_label_upgraderesources"] || "Upgrade") + "</a>";            
            }
        }catch(e){
            missing_resource_message = StringCapitalise(e.message);
            if(e.code == 1007){
                //display the cost of building instantly (only if we are dealing with resources)
                var cost = game_state.getUpgradeBuildingCost(item_upgrade_id, parseInt(item_upgrade_level), instance);
                if (item_upgrade && instance){item_upgrade_id = instance.id;}
                button_buyresource = "<a title='" + _lang["gui_dialogiteminfo_label_buyresources_tooltip"] + "' class='blink_me button_link' id='instant_build_button_" + item_upgrade_id + "' href='#' onclick='btnTE(1015, this, " + (item_upgrade_level) + ");'>" + (_lang["gui_dialogiteminfo_label_buyresources"] || "Buy resources") + "</a><br><br>(<div class='icon_diamonds' style='background-image:url(media/images/icon_small_diamond.png);'/> " + cost["diamonds"] + " " + (_lang["diamonds"] || "diamonds") + ")";
            }            
        }
    }/*else{
        if((view_type == "info") && (item_upgrade_id == "armory")){
            var armory_items = shop.getItemByCategory("troops");
            for (var i in armory_items){
                button_buyresource = button_buyresource + " " + armory_items[i].type;
            }
        }        
    }*/
    $(".menudialog_container").show();
    $("#menudialog_iteminfo h2").html(_lang["dialog_title_" + view_type] + " " + _lang[item_upgrade.type || item_current.type]);
    if (item_upgrade.category == "iap"){ $("#menudialog_iteminfo h2").html(_lang["dialog_title_iap"] + " " + _lang[item_upgrade.type || item_current.type]); } //override if this is a IAP item
    $("#menudialog_iteminfo i").html(missing_resource_message);
    $("#menudialog_iteminfo .iteminfo_textcol span").html(details);
    $("#menudialog_iteminfo .iteminfo_constrtime").html(upgrade_time);
    $("#menudialog_iteminfo .purchase_instant").html(button_buyresource);
    //$("#menudialog_iteminfo img").attr("src", getItemImageURLByLevelAndType(item_upgrade.type || item_current.type, item_upgrade.image_level || item_current.image_level));//getItemImageURL(item_upgrade || item_current));
    $("#menudialog_iteminfo img").attr("src", getImageURLStorage(item_info.preview));
    $("#menudialog_iteminfo .preview_level_title").html("<div class='font-effect-outline font-bright'>" + (_lang["gui_dialogiteminfo_label_level"] || "Level") + " "+current_level + "</div>");
    $("#menudialog_iteminfo input").val(item_upgrade_id);
    $("#menudialog_iteminfo .purchase").html("");
    //fireGameEvent("menu_dialog_show");
    fireGameEvent("ui_building_" + item_info.category + "_" + item_info.type + "_" + view_type + "_open");
}

function showDialogBattleRewards(elem, rewards, speed){
    speed = speed || 500;
    $(elem + "_image").hide();
    $(elem + "_value").hide();
    for (var i in rewards.currency){
        if((rewards.currency[i] !== undefined) && (!isNaN(rewards.currency[i]))){
            $(elem + "_image." + i).show();
            $(elem + "_value." + i).show();
            $(elem + "_value." + i).countTo({
                from: 0,
                to: rewards.currency[i],
                speed: speed,
                refreshInterval: 50,
                onComplete: function(value) {
                    //console.debug(this);
                }
            });
        }
    }
}

function hideDialogBattleResult(){
    $(".menudialog_battleresult").hide();
    fireGameEvent("ui_attack_result_close");
    chooseSocialShareSighting();
}
function showDialogBattleResult(options){
    if (!options){options = {"title":"Battle result"};}
    if (!options.bounty){options.bounty = {"reward": {"currency": {}}};}
    var title = options.title || " ";
    var rewards = options.bounty.reward;
    $(".menudialog_battleresult .gui_title_label_m").html(title);
    $(".menudialog_battleresult").show();
    //show the reward
    showDialogBattleRewards(".menudialog_battleresult_currency_frame", rewards, 3000);
    for (var i in rewards.currency){
        //do the actual payout (this could be added into a timeout)
        if(!isNaN(rewards.currency[i])){
            if (i == "xp"){
                game_state.addXP(rewards.currency.xp);
            }else{
                if(rewards.currency[i] > 0){
                    game_state._addCurrencyPayout(i, rewards.currency[i], "buy");//"reward");
                }
            }
        }
    }

    if ((options.effort != undefined) && (options.effort == 1)){
        fireGameEvent("battle_jingle_win");
    }else{
        fireGameEvent("battle_jingle_lose");
    }
    setTimeout(function(){
        amgr.render.clearScene();
    }, 2000);
}

function isMobile(){
    return is_mobile;
}

/* prefrences begin */
function loadUserPreferences(){
    _user_preferences = {};
    setUserPreferences(JSON.parse( cacheStorageLoad("preferences") || "{}" ));
}

function setUserPreferences(preferences){
    if(!_user_preferences){ _user_preferences = {}; }
    for(var attrib in preferences){
        var value = preferences[attrib];
        if(attrib == "sound_volume"){
            smgr.setVolume(value);
        }
        if(attrib == "music_volume"){
            smgr.setVolume(value, 'music');
        }
        if(attrib == "music_muted"){
            var sound_name = "music_building";
            if(smgr.hasDebug()){
                if(sound_events[sound_name]){console.info("[DEBUG] Sound event: '" + sound_name + "' playing '" + sound_events[sound_name] + "'");}
                else{console.error("[ERROR] Sound event: '" + sound_name + "' missing sound");}
            }
            if (value){smgr.disableMusic(false);}else{smgr.disableMusic(true);}
        }

        _user_preferences[attrib] = value;
    }
    smgr.setMute(_user_preferences["sound_muted"] || false); // set this property outside loop since volume property overrided this one
    cacheStorageSave("preferences", JSON.stringify(_user_preferences));
}
/* preferences ends */

function initGUI(){
    is_mobile = false;
    is_loading = true;
    if (matchMedia("only screen and (max-width: 760px)").matches) {
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            is_mobile = true;
        }
    }

    setInterval(guiUpdateItemsProgress, 1000);


    $(".mainitems_button").bind('click', function(){
        var r = menuItemsShowShelfItems();
        if(r["defense"] > (purchase["builder"]+purchase["storage"]+purchase["protect"])){ //choose between showing economy or defence menu (this is mainly done for tutorial)
            menuItemsShow('defense', true);
        }else{
            menuItemsShow('economy', true);
        }
        fireGameEvent('ui_build_open');
    });
    $(".menuitems_button_economy").bind("click", function(event){ event.stopPropagation(); menuItemsShow('economy'); });
    $(".menuitems_button_defense").bind("click", function(event){ event.stopPropagation(); menuItemsShow('defense'); });
    $(".menuitems_button_support").bind("click", function(event){ event.stopPropagation(); menuItemsShow('support'); });
    $(".menuitems_button_iap").bind("click", function(event){ event.stopPropagation(); menuItemsShowShelfItems(); menuItemsShow('iap'); });
    $(".menuitems_container").bind("click", function(event){  event.stopPropagation(); menuItemsHideShelfItems(); });

    $(".dragdealer").bind("click", function(event){ 
        var el_id =  $(event.target).attr("id") || $(event.target).parent().attr("id");
        event.stopPropagation();
    });

    dragdealer = new Dragdealer('menuitems_slider', {
        vertical: false,
        speed: 0.2,
        loose: true});

    dragdealer_achivments = new Dragdealer('menudialog_achivements_container', {
        vertical: false,
        speed: 0.2,
        loose: true});

    $("#menudialog_iteminfo .purchase").on("click tap", function(){
        btnAddResourceItem($("#menudialog_iteminfo input").val());
        hideDialogItemInfo();
    });

    $(".menudialog_socialframe").bind("click", function(event){
        event.stopPropagation();
        hideDialogSocial();
    });

    $(".menudialog_buyaipframe").bind("click", function(event){
        event.stopPropagation();
        hideDialogPurchasedIAPItem();
    });

    $(".menudialog_achivements").bind("click", function(event){
        event.stopPropagation();
        hideDialogAchivements();
    });

    $(".menudialog_messages").bind("click", function(event){
        event.stopPropagation();
        hideDialogMessages();
    });

    $(".menudialog_message").bind("click", function(event){
        event.stopPropagation();
        guiAlertHide();
    });

    $(".menudialog_instantcomplete").bind("click", function(event){
        event.stopPropagation();
        hideDialogInstantBuild();
    });

    $(".menudialog_container").bind("click", function(event){
        event.stopPropagation();
        hideDialogItemInfo();
    });

    $(".mainconfig_button").bind("click", function(event){
        event.stopPropagation();
        showDialogPreferences();
    });

    $(".mainachivements_button").bind("click", function(event){
        event.stopPropagation();
        showDialogAchivements();
    });

    $(".mainmessages_button").bind("click", function(event){
        event.stopPropagation();
        showDialogMessages();
    });

    $(".menudialog_preferences").bind("click", function(event){
        event.stopPropagation();
        hideDialogPreferences();
    });

    $(".menudialog_research").bind("click", function(){
        event.stopPropagation();
        hideDialogResearch();
    });


    $(".menudialog_shareimage").bind("click", function(){
        event.stopPropagation();
        hideDialogShareimage();
    });    

    $("#menudialog_preferences_logout_button").bind("click", function(event){
        event.stopPropagation();
        clearPlayerSession();
        top.location.href="/logout";
    });

    $("#menudialog_preferences_soundvolume").bind("change", function(event){
        setUserPreferences({"sound_volume": parseFloat($("#menudialog_preferences_soundvolume").val())});
    });

    $("#menudialog_preferences_soundmuted").bind("change", function(event){
        setUserPreferences({"sound_muted": $("#menudialog_preferences_soundmuted").prop("checked")});
        showDialogPreferencesInfo();
    });

    $("#menudialog_preferences_musicmuted").bind("change", function(event){
        setUserPreferences({"music_muted": $("#menudialog_preferences_musicmuted").prop("checked")});
    });

    $(".menudialog_battleresult").bind("click", function(event){
        event.stopPropagation();
        hideDialogBattleResult();
    });

    $(".menudialog_frame").bind("click", function(event){
        event.stopPropagation();
    });

    $(".mainattack_button").bind("click", guiAttackButton);

    $(".purchase_iap").click(addPurchaseIAP);


    $("#battle_hud_cancel_button").click(setGameStatusBattleEnds);
    $(".menudialog_research  .menudialog_frame_x").click(hideDialogResearch);
    $(".menudialog_shareimage .menudialog_frame_x").click(hideDialogShareimage);
    $(".menudialog_achivements  .menudialog_frame_x").click(hideDialogAchivements);
    $(".menudialog_messages  .menudialog_frame_x").click(hideDialogMessages);
    $(".menudialog_message  .menudialog_frame_x").click(guiAlertHide);
    $(".menudialog_instantcomplete .menudialog_frame_x").click(hideDialogInstantBuild);
    $(".menudialog_buyaipframe .menudialog_frame_x").click(hideDialogPurchasedIAPItem);
    $(".menudialog_socialframe .menudialog_frame_x").click(hideDialogSocial);
    $(".menudialog_container .menudialog_frame_x").click(hideDialogItemInfo);
    $(".menudialog_preferences .menudialog_frame_x").click(hideDialogPreferences);
    $(".menudialog_battleresult .menudialog_frame_x").click(hideDialogBattleResult);
    $(".menudialog_battledetails .menudialog_frame_x").click(hideDialogBattleDetails);
    $("#menudialog_preferences_socialaccount_button").click(showDialogSocial);
    $(".menudialog_battleresult .button_image_share").click(addSocialShareBattle);
    $(".menudialog_battleresult .gui_button_battledone").click(hideDialogBattleResult);
    $(".menudialog_research_item_img").click(guiResearchItem);
    $(".menudialog_battledetails .gui_button_battleattack").click(guiSelectAttackLocationConfirmed);
    $(".menudialog_battledetails .gui_button_battledelagate").click(guiSelectAttackLocationDelagate);
    $(".menudialog_battledetails .gui_button_battletutorial").click(guiSelectAttackLocationTutorial);
    $(".menudialog_instantcomplete .button_link").click(executeInstantBuild);    


    $("body").on("e1052", function(event_id, p1, p2){
        btnMoveForItem(p1);
    }); 
    $("body").on("e1053", function(event_id, p1, p2){
        showDialogResearch();
    }); 
    $("body").on("e1054", function(event_id, p1, p2){
        btnDetailsItem(p1);
    }); 
    $("body").on("e1055", function(event_id, p1, p2){
        btnUpgradeItem(p1);
    }); 
    $("body").on("e1056", function(event_id, p1, p2){
        btnItemPayout(p1);
    }); 
    $("body").on("e1126", function(event_id, p1, p2){
        btnCompleteBuildingItem(p1);
    });
    $("body").on("e1212", function(event_id, p1, p2){
        runAchivement({id: p1});
    });
    $("body").on("e1221", function(event_id, p1, p2){
        showTutorial({id: p1}); 
    });
    $("body").on("e1301", function(event_id, p1, p2){
        acceptPlayerMessage(p1, p2);
    });

    $("body").on("e2011", function(event_id, p1, p2, p3){ collectAchivement(p1, p2, p3); }); 
    $("body").on("e2012", function(event_id, p1, p2, p3){  addSocialShareItem(p1, p2, p3); }); 
    $("body").on("e2013", function(event_id, p1, p2, p3){  showDialogUpgradeItem(p1, p2, p3); }); 
    $("body").on("e2014", function(event_id, p1, p2, p3){  runDialogUpgradeItem(p1, p2, p3); }); 
    $("body").on("e1015", function(event_id, p1, p2, p3){  btnShowDialogInstantBuild(p1, p2, p3); });     
    $("body").on("e2611", function(event_id, p1, p2, p3){ bombSelectDrop(p1, p2, p3); }); 
    $("body").on("e2615", function(event_id, p1, p2, p3){ buildDefenseActor(p1, p2, p3); }); 
    $("body").on("e1616", function(event_id, p1, p2, p3){ guiSelectResourceLocation(p1, p2, p3); }); 
    $("body").on("e1617", function(event_id, p1, p2, p3){ guiSelectAttackLocation(p1, p2, p3); }); 
    $("body").on("e2636", function(event_id, p1, p2, p3){ guiSelectResourceCancel(p1, p2, p3); }); 
    $("body").on("e2637", function(event_id, p1, p2, p3){ guiSelectAttackCancel(p1, p2, p3); }); 

    $("body").on("e2711", function(event_id, p1, p2, p3){ setWeaponReady(p1, p2, p3); });


    //GHOST BURSTER SPECIFICS
    $(".progress_collected").click(showDialogCollectGhostTraps);      
    $("#menudialog_socialframe_fbbtn").click(nowSocialLoginFacebook);

    /*SPECIAL CASE BROWERS STARTS*/

    /*NO LONGER NEEDED, WE HARD CODE THIS 
    if(getBrowserType() == "firefox" ){ //Firefox does not listen to my x-frame-option to allow facebook as allow-from. So we will just target _top in firefox
        $(".menudialog_socialframe .btn_image").attr("target", "_top");
    }*/
    /*SPECIAL CASE BROWERS ENDS*/

    /*
    onbeforeunload = function (evt) {
        var un = game_state.getItem("changed") || 0; //new Date().getTime();
        var ul = game_state.getItem("updated") || 0;
        var auth = game_state.getAuthentication();
        var message = _lang["gui_warning_message_g0111"];
        if (game_state.getGameMode() == "tutorial"){ return; };
        if (sessionStorage.getItem("redirect_safe")){ return; }
        if(auth){
            if(un > ul){ //means that we need to promise a new save
                putGameStateSnapshot();
            }else{
                return;
            }
        }else{
            message = _lang["gui_warning_message_g0110"];
            setTimeout(showDialogSocial, 1000);
        }
        if (typeof evt == 'undefined') {
            evt = event;
        }
        if (evt) {
            evt.returnValue = message;
        }
        return message;
    }
    */
    $(function() {
        FastClick.attach(document.body);
    });

    game_state.initialize(function(profile){
        //console.info("Loading profile " + JSON.$stringify(profile));
    }, function(){
        checkAchievementEvent();
    }, {
        "callback_achivement": function(achivements, achivement_added){
            // find out how many achivements we have completed (and not collected)
            var c = 0;
            for(var i in achivements){
                if((achivements[i].complete) && (!achivements[i].collected)){ c = c + 1; }
            }
            setActionsAvailableCount("achivement_count", c);
            if((!!achivement_added) && (!!game_achivements[achivement_added])){
                //if we have details on the added achivment lets check if it was recently recevied so we can notify our friends
                var social_message = game_achivements[achivement_added].social;
                var auth = game_state.getAuthentication();
                var facebook_id = game_state.getAlias();
                if(social_message){
                    try{
                        facebook_id = "@[" + auth.facebook.id + "]";
                    }catch(e){} //skip error handling since fallback is the alias
                    addSocialNotification(facebook_id, StringFormat(social_message.notification_facebook, {player_name: facebook_id }));
                }
            }
        }
    });
    ii_resources = shop._dictArray2dictByType(ii_resources);
    
    menuItemsCreateShelfItems();

    setTimeout(function(){updateDialogMessages();}, 2000);

    setTimeout(function(){
        if (game_state.getHeadQuarterLevel()){
            displayPlayerLocation();
        }
    }, 4000);

    for (var guiel in _langgui_en){
        $(guiel).html(_langgui_en[guiel]);
    }

    for (var guiel in _langguitooltips){
        $(guiel).attr("title", _langguitooltips[guiel]);
    }


    // preferences slider http://iframework.net/sGlide/#usage
    $('#menudialog_preferences_soundvolume_slider').sGlide({
        height: 20,
        startAt: 99,
        width: 100,
        pill: false,
        image: 'none', ///stylesheets/btn_volume_sound.png
        colorStart: '#3a4d31',
        colorEnd: '#7bb560',
        buttons: false,
        drag: function(o){
            if(!is_loading){
                setUserPreferences({"sound_volume": o.value/100});
            }
        },
        onButton: function(o){
            if(!is_loading){
                setUserPreferences({"sound_volume": o.value/100});
            }
        }
    });  

    // preferences slider http://iframework.net/sGlide/#usage
    $('#menudialog_preferences_musicvolume_slider').sGlide({
        height: 20,
        startAt: 99,
        width: 100,
        pill: false,
        image: 'none', ///stylesheets/btn_volume_sound.png
        colorStart: '#3a4d31',
        colorEnd: '#7bb560',
        buttons: false,
        drag: function(o){
            //$('#menudialog_preferences_soundvolume').val(o.value);
            setUserPreferences({"music_volume": o.value/100});
        },
        onButton: function(o){
            //$('#menudialog_preferences_soundvolume').val(o.value);
            setUserPreferences({"music_volume": o.value/100});
        }
    });  
    is_loading = false;      
}
function addAuthenticationCache(type, data){
    var auth = JSON.parse(sessionStorage.getItem("auth") || "{}");
    auth[type] = data;
    sessionStorage.setItem("auth", JSON.stringify(auth));
}
function nowSocialLoginFacebook(){
    if(facebookConnectPlugin){
        var _nowSocialLoginFacebookSuccess = function (userData) {
            console.info("Login success: " + JSON.stringify(userData));
            var facebook_auth = {
                "id": userData.authResponse.userID,
                "token": userData.authResponse.accessToken,
                "name": null,
                "email": null,
                "mobile": new Date().getTime()
            }
            addAuthenticationCache("facebook", facebook_auth);
            useFacebookPictureForItem(game_state.getInventoryItem("headquarters"), {"facebook": facebook_auth});
        }
        var _nowSocialLoginFacebookFail = function (response) {
            console.info("Login fails: " + JSON.stringify(response));
        }
        facebookConnectPlugin.login(["public_profile"],
            _nowSocialLoginFacebookSuccess,
            _nowSocialLoginFacebookFail
        );            
    }
}
function addSocialShare(title, message, image_url){
    addSocialShareFacebook(title, message, image_url);
}
function addSocialShareFacebook(title, message, image_url){
    fireGameEvent("social_share_facebook_open");
    /*
        New impl will create a hashcode of the request + userid + platform
        Save share information to the server and then send this object to FB
    */
    var msg = encodeURI("title="+title+"&message="+message+"&image="+image_url);
    var sid = CryptoJS.MD5(msg+"facebook"+game_state.getUserId()) + "";
    var path = url_domain + "api/social/share/"+sid+"" + getUserAuthKey() + "?"+msg;
    if(!hasAuthenticated()){ showDialogSocial(); return; }
    $.getJSON(path, function(res){
        if(res.success){
            /* THIS IS THE WEB VERSION
            FB.ui({
              method: 'share_open_graph',
              action_type: 'og.likes',
              action_properties: JSON.stringify({
                  object:'https://zombiebattlegrounds.com/social/facebook/share/' + sid + '/'
              })
            }, function(response){
                //user canceled response.error_code  == 4201
                if(!response.error_code == 4201){
                    fireGameEvent("social_share_facebook_cancel");
                }else{
                    fireGameEvent("social_share_facebook_success");
                    game_state.addAchivement("achivement_socialshare", 1);
                }
            });
            */  
            if(facebookConnectPlugin){ //expect to be running cordova with the facebook plugin
                facebookConnectPlugin.showDialog({
                  method: 'share_open_graph',
                  action_type: 'og.likes',
                  action_properties: JSON.stringify({
                      object:'http://ghostburster.com/social/facebook/share/' + sid + '/'
                  })
                }, function(response){
                    //user canceled response.error_code  == 4201
                    //console.info("Share returns success "+ JSON.stringify(response));
                    if(!response.error_code == 4201){
                        fireGameEvent("social_share_facebook_cancel");
                    }else{
                        fireGameEvent("social_share_facebook_success");
                        game_state.addAchivement("achivement_socialshare", 1);
                    }
                    hideDialogSocial();
                }, function(response){
                    console.info("Share returns failure "+ JSON.stringify(response));
                    fireGameEvent("social_share_facebook_cancel");
                }); 
            }
        }else{
            handleException("Could not save share");
        }
    });
}
function sendSocialMessage(type, title, message, to_player, data, options){
    //type is one of attack_success, attack_failed, attack_request, message_join
    //validate variables
    if(to_player.constructor !== Array){
        throw "to_player must be an Array. Got: " + JSON.stringify(to_player);
    }

    var request_data = {"data": {"type": type || "default", "message": message, "data": data}};
    var request_data_str = JSON.stringify(request_data);
    var message_id = CryptoJS.MD5(request_data_str);
    var auth = game_state.getAuthentication() || {};
    if (!auth.facebook){ auth.facebook = {"id":""}; } //social id is not required
    var path = url_domain + "api/social/message/"+message_id+"/" +getUserAuthKey()+ "?fid="+auth.facebook.id;
    request_data["title"] = title;
    request_data["message"] = message;
    request_data["data"]["to"] = to_player; //["10152684918901180"]; // TEST
    // create from
    request_data["data"]["from"] = {"alias": game_state.getAlias(), "name": auth.facebook.name || game_state.getAlias(), "uid": game_state.getUserId()}; // TEST
    $.post(path, request_data, function(res){
        console.info("Saved request message data to our server");
    });

}

function addSocialRequest(title, message, type, data){
    addSocialRequestFacebook(title, message, type, data);
}
function addSocialRequestFacebook(title, message, type, data){
    // https://developers.facebook.com/docs/games/requests/
    // https://developers.facebook.com/docs/games/requests/v2.2
    fireGameEvent("social_share_request_facebook_open");
    //make sure the player has authenticated himself
    //TEST if(!hasAuthenticated()){ showDialogSocial(); return; }
    //var request_data = {"data": JSON.stringify({"type": type || "default", "message": data})};

/* DISABLE TEST CODE
    var request_data = {"data": {"type": type || "default", "message": data}};
    var request_data_str = JSON.stringify(request_data);
    var message_id = CryptoJS.MD5(request_data_str);
    var path = "api/social/message/"+message_id+"/";
    request_data["title"] = title;
    request_data["message"] = message;
    request_data["data"]["to"] = ["10152684918901180"]; // TEST
    // create from
    var auth = game_state.getAuthentication() || {"facebook":{}};
    request_data["data"]["from"] = {"alias": game_state.getAlias(), "name": auth.facebook.name || game_state.getAlias(), "uid": game_state.getUserId()}; // TEST
    $.post(path, request_data, function(res){
        console.info("Saved request message data to our server");
    });
    return ; //TEST
*/
    var message_id = CryptoJS.MD5(game_state.getUserId()+title+message+(new Date().getTime()));
    /*
    FB.ui({method: 'apprequests',
        title: title,
        message: message,
        data: {"message_id": message_id},
    }, function(response){
        if(Object.keys(response).length == 0){
            //canceled
            fireGameEvent("social_share_request_facebook_cancel");
            //TODO remove share since player canceled
        }else{
            fireGameEvent("social_share_request_facebook_success");
            game_state.addAchivement("achivement_socialrequest", 1);
            //lets upload details about this request to our server
            sendSocialMessage(type, title, message, response.to, data, {"request_fbid": response.request, "message_id": message_id});
        }
    });
    */
    if(facebookConnectPlugin){  //expect to be running cordova with the facebook plugin
        facebookConnectPlugin.showDialog({
            method: "apprequests",
            message: message,
            title: title,
            data: {"message_id": message_id},
        }, function(response){
            //console.log("Request returns "+ JSON.stringify(response));
            if(response.error_code){
                fireGameEvent("social_share_request_facebook_cancel");
            }else{
                fireGameEvent("social_share_request_facebook_success");
                game_state.addAchivement("achivement_socialrequest", 1);
                //lets upload details about this request to our server
                if(response.to){
                    sendSocialMessage(type, title, message, response.to, data, {"request_fbid": response.request, "message_id": message_id});
                }                
            }
        }, function(){
            fireGameEvent("social_share_request_facebook_cancel");
        });

    }    
}
function addSocialNotification(target_id, message){
    /*
        Notifications 
    */
    addSocialNotificationFacebook(target_id, message);
}
function addSocialNotificationFacebook(target_id, message){
    // https://developers.facebook.com/docs/games/requests/

    //make sure the player has authenticated himself
    if(!hasAuthenticated()){ showDialogSocial(); return; }
    /*TODO: create a custom dialog 
    //check for friends on server
    //if we get no friends we assume that the player has not given permission to fetch them
    */
    var url = url_domain + "social/facebook/notification/";
    $.getJSON(url + target_id + "/"+getUserAuthKey()+"?message=" + encodeURI(message), function(res){
        /*
        If successfull call
        {
            "success": true
        }
        */
    });  
}

function addPurchaseIAPFacebook(self){
  var count;
  var what = null;
  try { what = self.target.id; }catch(e){} //try to extract what button we are pressing
  var obj = {
    method: 'pay',
    quantity: count || '1',
    action: 'purchaseitem',
    display_mode:'page',
    product: 'https://zombiebattlegrounds.com/payment/facebook/product/' + (what || "iap01") + '/'
  };
  FB.ui(obj, function(data) {
    var fbid = FB.getUserID();
    var user_id = game_state.getAuthentication()["user_id"];
    ///payment/facebook/validate/:fbid/:user_id/'
    console.log(data); //FIXME: THU handle this!!
    if(data.error_code){
        if (data.error_code == 1383010){
            guiAlert(StringFormat(_lang["gui_warning_message_p1102"], data), {"title": _lang["gui_warning_heading_p1102"], "error_level": "gui_warning_message_p1102"});
        }else{
            guiAlert(StringFormat(_lang["gui_warning_message_p1101"], data), {"title": _lang["gui_warning_heading_p1101"], "error_level": "gui_warning_message_p1101"});
        }
    }else{
        var url = url_domain + "payment/facebook/validate/"+FB.getUserID()+"/"+getUserAuthKey(); //changed order 
        $.getJSON(url, function(data){
          console.info("Completed purchase validation, doing a server/client sync correction");
          runPurchaseIAPCorrection();
        });
        showDialogPurchasedIAPItem(what, data);
    }
  });
}

function addPurchaseIAPStorekit(self){
  var count;
  var what = null;
  try { what = self.target.id; }catch(e){} //try to extract what button we are pressing
  var product = "currency.ghostburster." + (what || "iap01");
  if(!app.store){ throw "The store was not initialized"; }
  app.store.buy(product);
}

function addPurchaseIAP(self){
    addPurchaseIAPStorekit(self);
}

function mapApplyIconImage(elid, url){
    $("#"+elid+" .body").css({"background-image": "url("+url+")", "width":"100%", "height":"100%"});
}

function mapResizeIconsByZoom(zoom_level){
    if (!zoom_level){ zoom_level = mmgr.map.getZoom(); }
    var size = {17:70/2, 16:40/2}[zoom_level];
    if (zoom_level >= 18){size = 100/2;}
    if (zoom_level <= 15){size = 20/2;}
    mapResizeIcons(size);
}

function mapResizeIcons(icon_size){
    //FIXME: body has background_size property
    var size = icon_size;
    var margin = -(size/2);
    $(".map_marker").css({"width":size+"px", "height":size+"px", "margin-left":margin+"px", "margin-top":margin+"px"});
    $(".map_marker .body").css({"background-size": size+"px", "height":size+"px"});
    //$(".map_marker .cockpit").css({"background-size": 2*size+"px", "height":2*size+"px", "width":2*size+"px", "left":-size/2+"px", "top":-size/2+"px"});
    $(".map_marker .projectile_gunfire").css({"background-size": size+"px", "height":size+"px", "width":size+"px"});
    $(".map_marker .cockpit").css({"background-size": size+"px", "height":size+"px", "width":size+"px", "display": "block"});
    $(".map_marker .actor_movable").css({"height":2*size+"px", "width":2*size+"px", "left":-size/2+"px", "top":-size/2+"px"});
    //$(".player").css({"width":size*2+"px", "height":size*2+"px", "margin-left":margin*2+"px", "margin-top":margin*2+"px", "left":-size/2+"px", "top":-size/2+"px"});
    //$(".map_marker .actor_explodes").css({"height":2*size+"px", "width":2*size+"px", "left":-size/2+"px", "top":-size/2+"px"});
}

function getGameLocation(use_player_location){
    if (use_enemy_location){ return use_enemy_location;}
    if (use_player_location && game_location_player){
        // if we only want the player location and it exists lets return that
        return JSON.parse(JSON.stringify({"lat": game_location_player.lat, "lng": game_location_player.lng}));
    }
    return game_state.getAttackLocation();
}

function isIOS(){
    var isiOS = false;
    var agent = navigator.userAgent.toLowerCase();
    if(agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0){
           isiOS = true;
    }
    return isiOS;
}

function showTutorial(step){
    //do not show tutorial while in attack mode
    if(game_state.getGameMode() == "attack"){ return; } 
    //we are not in attack mode, lets change to tutorial mode
    game_state.setGameMode("tutorial", {"id":step.id});
    var step_id = step.id;
    if (step_id == "tutorial_validate"){
        showDialogSocial();
        game_state.addAchivement(step_id);
    }
    if (step_id == "tutorial_registernew"){
        setUserPreferences("alias", $("#tutorial_input_username").val());
        game_state.setItem("created", new Date().getTime(), true);
        game_state.setItem("alias", $("#tutorial_input_username").val());
        game_state.addAchivement(step_id);
    }
    if (step_id == "tutorial_registermoney"){
        setTimeout(function(){
            //restore purchases
            ledgers.addTransactionAction("buy", ledger_item_transaction["iditem-iap"]);
            ledgers.addTransactionAction("buy", ledger_item_transaction["iditem-diamons00"]);
            ledgers.addTransactionAction("buy", ledger_item_transaction["iditem-wood-startup"]);
            ledgers.addTransactionAction("buy", ledger_item_transaction["iditem-gold-startup"]);
        }, 100);
    }
    if (step_id == "tutorial_registermoney"){
        hideDialogCharacter();
        setTimeout(function(){checkAchievementEvent();}, 2000);
        game_state.addAchivement(step_id);
        return;
    }
    if (step_id == "tutorial_locatehome"){
        displayPlayerLocation();
        game_state.addAchivement(step_id);
    }
    if (step_id == "tutorial_selecthome"){
        fetchResourceLocations(getGameLocation(true), null, {
            state: ii_resources["headquarters"]["typeid"],
            categories: ii_resources["headquarters"]["category"],
            callback_failure: function(){
                guiAlert(_lang["warning_sys_locationlookupfailed"]);
                setTimeout(function(){checkAchievementEvent();}, 2000);
            }
        });
        hideDialogCharacter();
        game_state.addAchivement(step_id);
        return ;
    }
    if (step_id == "tutorial_createdefense"){
        $("#tutor_arrow").removeClass().addClass("tutorial_createdefence_arrow_1").show();
    }
    if (step_id == "tutorial_selectdefese"){
        $("#tutor_arrow").hide();
        hideDialogCharacter();
        setTimeout(function(){checkAchievementEvent();}, 20000); //wait for 30 seconds before remainding player what to do
        game_state.addAchivement(step_id);
        check_achivement_ts = new Date().getTime() + 18000; //give the player 18-20 seconds to work the tutorial
        return;
    }
    if (step_id == "tutorial_attackscan"){
        updateAttackCount();
        game_state.addAchivement(step_id);
        $("#tutor_arrow").removeClass().addClass("tutorial_createdefence_arrow_2").show();
    }
    if (step_id == "tutorial_attackenemy"){
        $("#tutor_arrow").hide();
        hideDialogCharacter();
        game_state.addAchivement(step_id);
        check_achivement_ts = new Date().getTime() + 15000; //give the player 15 seconds to work the tutorial
        setTimeout(function(){checkAchievementEvent();}, 16000); //lets remaind them
        return;        
    }
/*
    if (step_id == "tutorial_battlefirst"){
        $("#tutor_arrow").removeClass().addClass("tutorial_createdefence_arrow_3").show();
    }
    if (step_id == "tutorial_battlefirst_ok"){
        $("#tutor_arrow").hide();
        hideDialogCharacter();
        setTimeout(function(){ // lets make sure that the player knows he has to login after 10 sec
            if(!hasAuthenticated()){
                showTutorial({id: "tutorial_socialconnect"});
            }
        },10000);
        return;        
    }
*/
    if (step_id == "tutorial_socialconnect_ok"){
        hideDialogCharacter();
        showDialogSocial();
        return;        
    }
    if (step_id == "achivement_battlefirst_ok"){
        hideDialogCharacter();
        return;        
    }
    if (step_id == "achivement_upgradebuildings_ok"){
        hideDialogCharacter();
        return;        
    }
    if (step_id == "achivement_usediamonds_ok"){
        hideDialogCharacter();
        return;        
    }
    if (step_id == "achivement_usediamonds_complete"){
        game_state.addAchivement(step_id);
    }
    if (step_id == "tutorial_says_restart"){
        hideDialogCharacter();
        showTutorial({id: "tutorial_welcome_money"});
        game_state.addAchivement(step_id);
        return;
    }

    if (step_id == "tutorial_battletutoralends_ok"){
        $(".tutor_battle_content").fadeOut(1000);
        $("#tutor_arrow").hide();
        hideDialogCharacter();
        game_state.setGameMode("attack_countdown"); //lets make sure we are not in tutorial mode
        guiSelectAttackLocationConfirmed();
        return;
    }
    if (step_id == "tutorial_battletutoral_1"){
        $("body").append("<img class='tutor_battle_content' style='position:absolute;display:block;top:0px;left:0px;' src='media/images/tutorial_battle_1.png'/>");
        $("#tutor_arrow").removeClass().addClass("tutorial_createdefence_arrow_5").show();
    }
    if (step_id == "tutorial_battletutoral_2"){
        $(".tutor_battle_content").fadeOut(1000);
        $("body").append("<img class='tutor_battle_content' style='position:absolute;display:block;top:0px;right:0px;' src='media/images/tutorial_battle_2.png'/>");
        $("#tutor_arrow").removeClass().addClass("tutorial_createdefence_arrow_4").show();
    }
    if (step_id == "tutorial_battletutoral_3"){
        $(".tutor_battle_content").fadeOut(1000);
        $("body").append("<img class='tutor_battle_content' style='position:absolute;display:block;bottom:0px;left:0px;' src='media/images/tutorial_battle_3.png'/>");
        $("#tutor_arrow").removeClass().addClass("tutorial_createdefence_arrow_1").show();
    }

    if (step_id == "achivement_upgradearmory_ok"){
        hideDialogCharacter();
        return;
    }

    if (step_id == "achivement_socialconnect_ok"){
        hideDialogCharacter();
        showDialogSocial();
        return;
    }

    if (step_id == "achivement_socialshare_ok"){
        hideDialogCharacter();
        return;
    }

    if (step_id == "achivement_upgradearmorymanual_ok"){
        hideDialogCharacter();
        return;
    }

    


/*        
    if (step_id == "tutorial_scannerdefense"){
        game_state.addXP(4);
        updateAttackCount();
        return;
    }
*/
    try{
        showDialogCharacter(tutorial_dialog_steps[step_id]["say"], tutorial_dialog_steps[step_id]);
    }catch(e){
        handleException(e);
    }
}

/*
NEED TO ADD ONE ITEM TO ATTACK

*/

function getResourceLocationCached(){
    if ((resource_locations == {}) || (resource_locations == undefined)){
        return null;
    }
    return resource_locations;
}

function checkAchievementEvent(){
    if($(".menudialog_character").is(':visible')){ return; } //dont have to check event if the tutorial dialog is already open
    var check_achivement_tsnow = new Date().getTime();
    if(check_achivement_ts > check_achivement_tsnow){ return; } //if the tutorial want some time to think then lets let them
    var m = game_state.getGameMode(true);
    var fetching_locations = (!!_search_circle);
    var hq_level = game_state.getHeadQuarterLevel();
    var xp = game_state.getXP();
    var currency = game_state.getCurrencyAmount();
    var attack_count = game_state.getBattles().length;
    var achivements = {};
    var achivements_count = 0;
    var user_auth = hasAuthenticated();
    var game_mode = m.mode;//game_state.getGameMode();
    if((game_mode == "attack") || (game_mode == "attack_countdown")){ return; }
    if(xp.level === 1){ //all the tutor in level 1
        //var building_count = inventory.getItemCount("builder");
        var defense_count = inventory.getItemCount("defense");
        if((hq_level === 0) && (currency.diamonds === 0)){
            if(hasAuthenticated()){ //"tutorial_registernew"
                showTutorial({id:"tutorial_registernew"});
            }else{
                //if (m.param.id == "tutorial_welcome"){return;}
                showTutorial({id:"tutorial_welcome_money"});
            }
            return;
        }
        if((hq_level === 0) && (!fetching_locations) && (!game_state.hasAchivement("tutorial_says_create_defense"))){
            if(!inventory.getItemCount("headquarters")){
                showTutorial({id:"tutorial_createhq"}); //double check that we are not building one
            }
            return;
        }
        if((hq_level === 1) && (defense_count === 0) && (!fetching_locations)){ //if has a hq and no other building we want to create defence
            showTutorial({id:"tutorial_createdefense"});
            return;
        }
        if((hq_level === 1) && (defense_count === 1) && (attack_count === 0) && (!fetching_locations)){ //if have a defence but not done any attacks, lets let the player know how it is done
            if(!game_state.getAchivement("tutorial_attackscan")){
                showTutorial({id:"tutorial_attackscan"});
                return;
            }
        }
        if((hq_level === 1) && (defense_count === 1) && (attack_count === 1)){ //if have a defence but not done any attacks, lets let the player know how it is done
            showTutorial({id:"tutorial_battlefirst"});
            return;
        }        
        
    }else{
        //if player has not done a social connection
        if(!game_state.hasAchivement("achivement_socialconnect")){
            achivements["achivement_socialconnect"] = true;
            achivements_count++;
        }
        //if player has done a social connection but not shared anything
        if((game_state.hasAchivement("achivement_socialconnect")) && (!game_state.hasAchivement("achivement_socialshare"))){
            achivements["achivement_socialshare"] = true;
            achivements_count++;
        }
        if((!game_state.hasAchivement("achivement_upgradehq_a")) && (hq_level == 3)){
            achivements["achivement_upgradehq_a"] = true;
            achivements_count++;
            updateDialogMessages();
        }
        /* here we add all the different progress check we want the player to achive: overtake resturants, hotels, ... */
        //lets enumerate all the achivments for checking for the ugprade statuses
        for(var i in game_achivements){
            var a = game_achivements[i];
            if(a.upgrade == "headquarters"){
                if(hq_level >= a.value){
                    game_state.addAchivement(i, 1);
                    achivements[i] = true;
                    achivements_count++;
                }
            }
        }
    }
    if(hq_level === 1){
        if(game_state.hasAchivement("tutorial_attackscan")){ //after main tutorial
            var itms = inventory.getItems();
            var level_sum = 0;
            for (var i in itms){
                var itm = itms[i];
                level_sum = itm.level + level_sum;
            }
            if((level_sum == Object.keys(itms).length) && (level_sum == (8+6))) {
                //player is not upgrading items. Lets them them know about that
                showTutorial({id:"achivement_upgradebuildings"});
                achivements["achivement_upgradebuildings"] = true;
                achivements_count++;            
            }
        }
        //if completed "tutorial_attackscan" and diamonds amount is unchanged
        if(game_state.hasAchivement("tutorial_attackscan")){
            achivements["achivement_usediamonds"] = true;
            achivements_count++;
        }
    }
    if(hq_level >= 4){ //we have armory ready
        if(!game_state.hasAchivement("achivement_upgradearmory")){
            achivements["achivement_upgradearmory"] = true;
            achivements_count++;
        }
    }
    game_state.runAchivement();
}

var tutorial_dialog_steps = {
    "tutorial_welcome_money": {"say":_lang["tutorial_says_welcome"], "buttons":[{"text":_lang["tutorial_button_yes"], "action":"tutorial_registerask"}/*, {"text":_lang["tutorial_button_no"], "action":"tutorial_registerask"}*/]},
    "tutorial_authenticate": {"say": _lang["tutorial_says_authenticate"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"tutorial_validate"}, {"text": _lang["tutorial_button_restart"], "action":"tutorial_says_restart"}]/*, "inputs":[{"action":"tutorial_input_username", "type": "text"}, {"action":"tutorial_input_password", "type": "password"}]*/},
    "tutorial_validate": {"say": _lang["tutorial_says_validate"], "buttons":[{"text": _lang["tutorial_button_restart"], "action":"tutorial_says_restart"}]},
    "tutorial_registerask": {"say": _lang["tutorial_says_registerask"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"tutorial_registernew"}, {"text": _lang["tutorial_button_restart"], "action":"tutorial_says_restart"}], "inputs":[{"action":"tutorial_input_username", "type": "text", "value": (Math.random()+"").replace("0.", "plr").substr(0, 9) }]},
    "tutorial_registernew": {"say": _lang["tutorial_says_registernew"], "buttons":[{"text": _lang["tutorial_button_thanks"], "action":"tutorial_registermoney"}]},
    "tutorial_registermoney": {"say": _lang["tutorial_says_registergave"]},

    "tutorial_createhq": {"say": _lang["tutorial_says_create_hq"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"tutorial_locatehome"}]},
    "tutorial_locatehome": {"say": _lang["tutorial_says_locate_hq"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"tutorial_buildhome"}]},
    "tutorial_buildhome": {"say": _lang["tutorial_says_build_hq"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"tutorial_selecthome"}]},

    "tutorial_createdefense": {"say": _lang["tutorial_says_create_defense"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"tutorial_selectdefese"}]},
    
    "tutorial_attackscan": {"say": _lang["tutorial_says_attack_scan"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"tutorial_attackenemy"}]},
    /*"tutorial_battlefirst": {"say": _lang["tutorial_battlefirst"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"tutorial_battlefirst_ok"}]},*/

    "tutorial_socialconnect": {"say": _lang["tutorial_socialconnect"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"tutorial_socialconnect_ok"}]},

    "tutorial_battletutoralstarts": {"say": _lang["tutorial_battletutoralstarts"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"tutorial_battletutoral_1"}]},
    "tutorial_battletutoral_1": {"say": _lang["tutorial_battletutoral_1"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"tutorial_battletutoral_2"}]},
    "tutorial_battletutoral_2": {"say": _lang["tutorial_battletutoral_2"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"tutorial_battletutoral_3"}]},
    "tutorial_battletutoral_3": {"say": _lang["tutorial_battletutoral_3"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"tutorial_battletutoralends"}]},
    "tutorial_battletutoralends": {"say": _lang["tutorial_battletutoralends"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"tutorial_battletutoralends_ok"}]},

    "achivement_battlefirst": {"say": _lang["achivement_battlefirst"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"achivement_battlefirst_ok"}]},
    "achivement_usediamonds": {"say": _lang["achivement_usediamonds"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"achivement_usediamonds_ok"}]},
    "achivement_upgradebuildings": {"say": _lang["achivement_upgradebuildings"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"achivement_upgradebuildings_ok"}]},
    "achivement_socialconnect": {"say": _lang["achivement_socialconnect"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"achivement_socialconnect_ok"}]},
    "achivement_socialshare": {"say": _lang["achivement_socialshare"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"achivement_socialshare_ok"}]},
    "achivement_upgradearmorytroops": {"say": _lang["achivement_upgradearmorytroops"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"achivement_upgradearmory_ok"}]},
    "achivement_upgradearmorymanual": {"say": _lang["achivement_upgradearmorymanual"], "buttons":[{"text": _lang["tutorial_button_done"], "action":"achivement_upgradearmorymanual_ok"}]}
};

/// bomb interface

function setActionsAvailableCount(event_name, v){
    var elclass = "." + event_name;
    if (v){
        if(($(elclass).html() != ("" + v)) || (!$(elclass).is(":visible"))){ //only do a highlight if there is any change
            $(elclass).html(v).show().effect("highlight", 500);
            fireGameEvent("ui_" + event_name + "_show");            
        }
    }else{
        if($(elclass).css('display') != 'none'){ //check if alrready hidden
            $(elclass).hide("fade");
            fireGameEvent("ui_" + event_name + "_hide");
        }
    }
}

function hasAuthenticated(){
    var d = game_state.getAuthentication();
    var a = sessionStorage.getItem("auth");
    var r = false;
    var alias = game_state.getItem("alias");
    if (a || d){
        if (!d){
            a = JSON.parse(a);
            game_state.setAuthentication(a);
            //fix the name if no name is set
            if((!alias) && (!!a)){
                if(a.facebook){
                    alias = a.facebook.name;
                }
                game_state.setItem("alias", alias);
            }        

        }
        r = true;
        game_state.addAchivement("achivement_socialconnect", 1);
    }
    $(".main_profileinfo").html(alias);
    return r;
}

function getGameStateSnapshot(user_auth_key, callback_success){
    var url = url_domain + "api/snapshot/"+(user_auth_key || getUserAuthKey()) + "/";
    $.getJSON(url, function(result){
        callback_success(result);
        //console.info(JSON.stringify(result));
    });
}

function putGameStateSnapshot(){
    if (!game_state.getItem("created")){ return; }
    if(hasAuthenticated()){
        var state = game_state.getStateCopy();
        state.terratory = getResourceRegionIds(); //do a last minute update FIXME: move to when we add buildings.
        getResourceRegionMainIds(state); //the server needs this when returning results
        //create the auth id
        if(!state.auth){ state.auth = {}; }
        if(!state.auth.mobile){ state.auth.mobile = {"id": getUserAuthKey(true)}; }
        if(!state.auth.gamecenter){ state.auth.gamecenter = app.getGameCenterUser(); }
        state.auth.pushnotification = app.getPushNotificationIds(game_state); //always call this
        var url = url_domain + "api/snapshot"+getUserAuthKey();
        $.ajax({ 
            type: 'POST', 
            url: url,
            data: {data:JSON.stringify(state)},
            dataType: 'json',
            success:function(res){
                if(res.error){
                    guiAlert(_lang["gui_warning_message_a6212"], {"title": _lang["gui_warning_heading_a6212"], "error_level": "gui_warning_message_a6212-"+res.error});
                    setTimeout(function(){showDialogSocial();}, 3000);
                }

            },
            error:function(res){
                guiAlert(_lang["gui_warning_message_a6202"], {"title": _lang["gui_warning_heading_a6202"], "error_level": "gui_warning_message_a6202"});
            }
        }); 
        console.info("Saving snapshot online");
    }
}

function guiPopupCloseCallback(e){
  fireGameEvent("ui_popup_close");
}
/*
function getResourceRegionMainIds(state){
    if(!state.region){
        //check if the required main type has been created
        var main_type = "radar";
        var main_building = game_state.getInventoryItem(main_type);
        if(main_building){
            fixItemAddress(main_building, function(itm){
                game_state.setItem("region", itm.gui.properties.attraction.address);
            });
        }
    }    
}
*/

function getResourceRegionMainIds(){
    if(!game_state.getItem("region")){
        //check if the required main type has been created
        var main_type = "headquarters";
        var main_building = game_state.getInventoryItem(main_type);
        if(main_building){
            fixItemAddress(main_building, function(itm){
                game_state.setItem("region", itm.gui.properties.attraction.address);
            });
        }
    }    
}
/*
function getRegionRanking(ranking_type, region_type, callback_success, callback_failure){
    //getResourceRegionRanking("captured_buildings", "city")
    //where region_type is either "city", "country", "state", "postcode"
    //check if the required main type has been created
    // TODO: test on a logged in device, make sure we 
    var main_type = "radar";
    var region_ids = game_state.getItem("region");
    if(region_ids){
        var region_ids = itm.gui.properties.attraction.address; //now we got the ids, lets fetch the ranking
        var path = url_domain + "api/social/ranking/"+ranking_type+"/"+region_type+"/0/9999999999999999/" ///api/social/ranking/:rtype/:rid/:rfrom/:rto/
        $.getJSON(path, function(result){
            console.info(JSON.stringify(result));
            debugger;
            //callback_success(result);
        });
    }else{
        callback_failure();
    }
}
*/
function getResourceRegionIds(filter_regions){
    /* returns a list of regions ids and building ids, this is used to find matches in multiplayer 1
        THE MAP FUNCTION:
        function(doc) {
          if(doc.game_state){for (var i in doc.game_state.terratory)
          {emit(i,doc.game_state.terratory[i]);}};
        }
        //TODO: EXTRACTING ONLY REAGIONS TO DO A FETCH
    */
    var regions = {"country_id": [], "state_id": [], "city_id": [], "postcode_id": []};
    var auth = game_state.getAuthentication();
    var updated = game_state.getItem("updated");
    var level = game_state.getXP().level;
    var terratory = {};
    var itms = inventory.getItems();
    for (var i in itms){
        var itm=itms[i];
        for (var r in regions){
            if((itm.gui.properties.attraction) && (itm.gui.properties.attraction.address) && (itm.gui.properties.attraction.address[r])){
                var position = itm.gui.position;
                var terratory_key = level + "-" + itm.gui.properties.attraction.address[r];
                if(!terratory[terratory_key]){ terratory[terratory_key] = []; } //FIXME: +0.0001 +"s"
                terratory[terratory_key].push({"building": itm.gui.location_id, "owner": game_state.getUserId(), "type": r, "updated": updated, "level":level, "data": {"name":"Current location", "location":{"lat":position[0],"lng":position[1],"distance":0}, "categories":[{"name": game_state.getItem("alias") + " hideout", "icon": {"prefix":"media/images/marker_resource_enemylocation_" , "suffix":".png"}}],"verified":false}});
                regions[r].push(terratory_key);
            }
        }
    }    
    if(filter_regions){return regions}else{return terratory;}
}

function logUserInteraction (options, values){
    /* 
    This tracks user engagement
    https://developers.google.com/analytics/devguides/platform/customdimsmets
    https://support.google.com/analytics/answer/2709829
    https://developers.google.com/analytics/devguides/collection/analyticsjs/events
    https://developers.google.com/analytics/devguides/collection/analyticsjs/custom-dims-mets
    */
    try{
        //where, type, values, report
        var xp = game_state.getXP();
        if(ga){
            ga('send', 'event', options.category, options.action, options.label, options.value, {
                'metric1': xp.level,
                'dimension1': game_state.getUserId(),
                'metric2': game_state.getCurrencyAmount("diamonds")
            });
        }
        if(FB){
            var params = {};
            // TODO: https://developers.facebook.com/docs/reference/javascript/FB.AppEvents.LogEvent
            if((options.category == "economy") && (options.action == "success")){
                if(options.label == "levelup"){ //reached xp level
                    params[FB.AppEvents.ParameterNames.LEVEL] = 'xp level '+xp;
                    FB.AppEvents.logEvent(
                        FB.AppEvents.EventNames.ACHIEVED_LEVEL,
                        null,  // numeric value for this event - in this case, none
                        params
                    );
                }
            }
            if((options.category == "iap") && (options.action == "build_now")){
                FB.AppEvents.logEvent(
                    FB.AppEvents.EventNames.SPENT_CREDITS,
                    values.value || 1,  // numeric value for this event - in this case, none
                    params
                );
            }
        }
        if(facebookConnectPlugin){
            //TODO: logEvent();
        }
        //console.info("Analytics " + JSON.stringify(options));
    }catch(e){
        handleException(e, -1);
    }    
}

function logUserAchivements (achivement_id){
    try{
        if(FB){
            var params = {};
            params[FB.AppEvents.ParameterNames.DESCRIPTION] = achivement_id;
            FB.AppEvents.logEvent(
                FB.AppEvents.EventNames.UNLOCKED_ACHIEVEMENT,
                null,  // numeric value for this event - in this case, none
                params
            );
        }
        if(window.gamecenter){
            // https://github.com/leecrossley/cordova-plugin-game-center
        }
    }catch(e){
        handleException(e, -1);
    }        
}

function logUserPurchase(iap_item, amount, count){
    //track the purchase via google analytics
    try{
        if(ga){
            ga('ecommerce:addTransaction', {
                'id': iap_item.type,                     // Transaction ID. Required.
                'affiliation': 'UBM IAP',   // Affiliation or store name.
                'currency': 'USD',
                'revenue': amount,               // Grand Total.
                'shipping': 0                  // Shipping.
            });

            ga('ecommerce:addItem', {
                'id': iap_item.type,              // Transaction ID. Required.
                'name': iap_item.name,            // Product name. Required.
                'category': 'IAP Gold',         // Category or variation.
                'currency': 'USD',
                'price': amount,                 // Unit price.
                'quantity': count                   // Quantity.
            });  

            ga('ecommerce:send');
            ga('ecommerce:clear');
        }

        if(FB){
            var params = {"count": count};
            params[FB.AppEvents.ParameterNames.CONTENT_ID] = iap_item.type;
            FB.AppEvents.logPurchase(amount, 'USD', params);
        }
    }catch(e){
        handleException(e, -1);
    }
}

function fixItemAddress(itm, callback_success){
    //will check the quality of address and update if nessisary
    //important for ranking information and used by one important resource in the game (headquarters or radar)
    //http://open.mapquestapi.com/nominatim/v1/reverse.php?format=json&lat=64.13917740600637&lon=-21.936290746339
    //http://open.mapquestapi.com/nominatim/

/*
when is this calculated and is it unique per location or is it tied to the player?
itm.gui.properties.address: Object
    city_id: "dd06c75ce32f7be19c0f2be7a723a06f"
    city_name: "Reykjavík"
    country_id: "b78edab0f52e0d6c195fd0d8c5709d26"
    country_name: "Iceland"
    postcode_id: "2aa46a352a71b9f2c295e54adf37481a"
    postcode_name: "101"
    state_id: "3c985199a4ecaf85f36133a76924d832"
    state_name: "Höfuðborgarsvæði"
*/

    if(!itm){ callback_success(itm); return; } 
    var latlng =  itm.gui.position;
    var address = itm.gui.properties.attraction.address;
    if (itm.gui.properties.attraction.address["country_id"] && itm.gui.properties.attraction.address["state_id"] && itm.gui.properties.attraction.address["city_id"] && itm.gui.properties.attraction.address["postcode_id"]){
        callback_success(itm);  return; //all data is fine
    }else{
        var path = "http://open.mapquestapi.com/nominatim/v1/reverse.php?format=json&lat="+latlng[0]+"&lon="+latlng[1]+"";
        $.getJSON(path, function(result){
            if(!itm.gui.properties){ itm.gui.properties = {}; };
            if(!itm.gui.properties.attraction){ itm.gui.properties.attraction = {}; }
            if(!itm.gui.properties.attraction.details){ itm.gui.properties.attraction.details = {}; }
            if(!itm.gui.properties.attraction.details.location){ itm.gui.properties.attraction.details.location = {}; }
            if(!itm.gui.properties.attraction.address){ itm.gui.properties.attraction.address = {}; }

            if(result.error){ console.warn("Error while fixing address. Reason: " + result.error); return ; }
            
            itm.gui.properties.attraction.details.location.city = result["address"]["city"];
            itm.gui.properties.attraction.details.location.country = result["address"]["country"];
            itm.gui.properties.attraction.details.location.postalCode = result["address"]["postcode"];
            itm.gui.properties.attraction.details.location.state = result["address"]["state_district"];
            //itm.gui.properties.attraction.details.location.address = itm.gui.properties.attraction.address["street_name"] = result["address"]["road"]; //returns Bergstaðarstræti

            if(result.error){ console.warn("Error while fixing address. Reason: " + result.error); return ; }

            //bellow is taken from extractResourceInformation
            if(itm.gui.properties.attraction.details.location.country){
                itm.gui.properties.attraction.address["country_name"] = itm.gui.properties.attraction.details.location.country;
                itm.gui.properties.attraction.address["country_id"] = CryptoJS.MD5(itm.gui.properties.attraction.details.location.country)+"";
            }
            if(itm.gui.properties.attraction.details.location.state){
                itm.gui.properties.attraction.address["state_name"] = itm.gui.properties.attraction.details.location.state;
                itm.gui.properties.attraction.address["state_id"] = CryptoJS.MD5(itm.gui.properties.attraction.details.location.state + itm.gui.properties.attraction.details.location.country)+"";
            }
            if(itm.gui.properties.attraction.details.location.city){
                itm.gui.properties.attraction.address["city_name"] = itm.gui.properties.attraction.details.location.city;
                itm.gui.properties.attraction.address["city_id"] = CryptoJS.MD5(itm.gui.properties.attraction.details.location.city + itm.gui.properties.attraction.details.location.country)+"";
            }
            if(itm.gui.properties.attraction.details.location.postalCode){
                itm.gui.properties.attraction.address["postcode_name"] = itm.gui.properties.attraction.details.location.postalCode;
                itm.gui.properties.attraction.address["postcode_id"] = CryptoJS.MD5(itm.gui.properties.attraction.details.location.postalCode + itm.gui.properties.attraction.details.location.city + itm.gui.properties.attraction.details.location.country)+"";
            }
            callback_success(itm); 
        });
    }
}


function getOrCreatePlayer(latlng){
  //var player = mmgr.getOrCreateActor("player");
  //return player;
        latlng = latlng || game_location_player || getGameLocation() || {"lat":0, "lng": 0};
        var p = mmgr.getOrCreateActor('player', {
            latitude : latlng.lat,
            longitude: latlng.lng,
            base_class:'player',
            range_detection: 10,
            iconSize: [100, 100],
            zIndexOffset:-9999,
            map: mmgr.map
        });
        p.setLayerBaseCircle({
            color:'#7AA3CC',
            fillColor:'#99CCFF',
            fillOpacity: 0.3
        });
        p.show();
        //p.callback_selected = function(e){
            //alert("clicked you");
        //};
//        p.callback_collision_detected = function(x){
//            //could show message on screen and/or vibration
//            if(navigator.notification){
//                navigator.notification.vibrate(2500);
//                navigator.notification.beep();
//            }
//        };  
  return p;
}
