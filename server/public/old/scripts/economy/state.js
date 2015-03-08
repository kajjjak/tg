
var game_state = new function(){

    var state = {};
    var xp_level_increase = 50;

    this.initialize = function(callback_yesprofile, callback_noprofile, options){
        state = {xp:{level:1, required:0, count:0, total:0}, search:{radius:3, factor:100}, battles:[], achivements:{}};
        this.options = options || {};
        state.currencies = {
            "gold":{"economy":true, "capacity": 0}, 
            "wood":{"economy":true, "capacity": 0}, 
            "iron":{"economy":true, "capacity": 0}, 
            "stone":{"economy":true, "capacity": 0},
            "diamonds":{"economy":false, "capacity": 0},
            "car1":{"economy":false, "capacity": 0},
            "car2":{"economy":false, "capacity": 0},
            "car3":{"economy":false, "capacity": 0},
            "car4":{"economy":false, "capacity": 0},
            "car5":{"economy":false, "capacity": 0},
            "car6":{"economy":false, "capacity": 0},
            "car7":{"economy":false, "capacity": 0}
        };
        state.storage_capacity = {}; //state.storage_capacity = {"gold":0, "wood":0, "iron":0, "stone":0, "diamonds": 0};
        state.storage_contents = {}; //state.storage_contents = {"gold":0, "wood":0, "iron":0, "stone":0, "diamonds": 0};
        state.ledgers = {}; //state.ledgers = {"gold":{}, "iron":{}, "wood":{}, "stone":{}, "diamonds":{}, "iap":{}};
        for(var i in state.currencies){
            state.storage_capacity[i] = state.currencies[i].capacity;
            state.storage_contents[i] = 0;
            state.ledgers[i] = {};
        }
        this.loadState(callback_yesprofile, callback_noprofile);
        state.game_mode = "economy"; //always start in economy mode (override saved state)
        if(!state.uid){state.uid = guid();}
        if(game_state.callback_changed_xp){game_state.callback_changed_xp(state.xp.count, 0, _getLevelXPRequired(state.xp.level+1));}        
        shop.initialize(inventory_item_array, this);
        inventory.initialize(this);
        iapgems.initialize(currency_plateaus);
        updateCurrencyStorageCapacity();
        ledgers.initialize(state.ledgers, ledgers_transactions);
        try{mmgr.viewActors("building", function(a){
            if(a.getGameProperty("item_type") == "captured"){ return false; }
                return true;
            });
        }catch(e){}
    };

    this.getCurrencies = function(){
        return state.currencies;
    };

    this.getUserId = function(){
        return state.uid;
    }

    this.getInventoryItem = function(type){
        //checks that this item is available, returns single item if only one result was return
        var itms_all = inventory.getItemByType(type);
        var itms_rdy = [];
        for (var i in itms_all){
            if(itms_all[i].state != 0){
                itms_rdy.push(itms_all[i]);
            }
        }
        if(itms_rdy.length <= 1){ return itms_rdy[0]; }
        else { return itms_rdy; }
    }
    
    this.addDestroyedBase = function(incident_id, mstimeout){
        mstimeout = mstimeout || 10;
        setTimeout(this._addDestroyedBase, mstimeout, incident_id, this);
    }

    this._addDestroyedBase = function(incident_id, self){
        //incident_id is a unique id making sure that we are not destroying more than once per incident, options is not used
        var incidents = self.getItem("destroyed_incidents") || {};
        if(incidents[incident_id]){ return null; }
        //uses http://boombeach.wikia.com/wiki/Vault_Protection_Calculator
        var vault = inventory.getItemDetails(self.getInventoryItem("vault")) || {}; //get the vault
        var resources = self.getStorageContents();
        var stolen = {};
        for(var i in resources){
            if((i == "diamonds") || (i == "iap")){ continue; }
            //check how much we are protecting
            var capacity = vault["capacity_" + i];
            if(capacity){
                stolen[i] = Math.max(resources[i]-capacity, 0);
                //now calculated percentage
                stolen[i] = Math.floor((stolen[i] * (1.0-vault["protected"])));
            }else{
                stolen[i] = resources[i]; //steals all if we do not have a vault
            }
            addCurrencyPayout(i, -stolen[i], "destroyed");
        }
        stolen["time"] = new Date().getTime();
        incidents[incident_id] = stolen;
        self.setItem("destroyed_incidents", incidents);
        return stolen;
    }

    this.getAttackPrice = function(threat_level, xp_level, hq_level){
        //returns calculated spoils and attack price
        threat_level = threat_level || 2;
        hq_level = hq_level || this.getHeadQuarterLevel();
        xp_level = xp_level || this.getXP()["level"];
        var threat_level_max = 13;
        var threat_percentage = threat_level / threat_level_max;
        var attack_levels = {};
        for (var i in ii_attack){
            attack_levels[ii_attack[i]["level"]] = {
                "gold": Math.floor(ii_attack[i]["attack_cost"]*threat_percentage), //FIXME: xp_level perhaps multiply this with difficulty factor
                "wood": Math.floor(ii_attack[i]["xp"]*threat_percentage), //FIXME: xp_level perhaps multiply this with difficulty factor
                "xp": ii_attack[i]["xp"],
                "gold_budget": Math.floor(ii_attack[i]["attack_cost"]*(1.0-threat_percentage)) //increase difficulty to win by lowering budget
            }
        }
        attack_levels[1]["wood"] = 110; ///special case first level since we need the wood to build new canteen
        return attack_levels[xp_level];
    };

    this.setAttackLocation = function(p){
        this.attack_location = p;
    };

    this.getAttackLocation = function(){
        if(game_state.attack_location){return game_state.attack_location;}
        if (game_location_player && isMobile()){
            return JSON.parse(JSON.stringify({"lat": game_location_player.lat, "lng": game_location_player.lng}));
        }else{
            try{
                return getAnyDefenseBaseCamp().getPosition();
            }catch(e){
                if(window.game_location_player){
                    return JSON.parse(JSON.stringify({"lat": game_location_player.lat, "lng": game_location_player.lng}))
                }else{
                    return {lat:0, lng:0}; //this should never happen but just in case
                }
            }
        }
    };

    this.getDefenses = function(){
        //is in fact the attack towers
        var defences = inventory.getItemByCategory("defense");
        var landingcrafts = inventory.getItemByType("landingcraft");
        if (landingcrafts.length){
            var q = inventory.getItemDetails(landingcrafts[0]);
            for (var i in defences){
                defences[i].capacity_troops = q.capacity_troops;
            }
        }
        return defences;
    };

    this.getSearchRadius = function (){
        var radar = this.getInventoryItem("radar");
        if (radar){ //if radar exist
            var details = inventory.getItemDetails(radar);
            state.search.radius = details.explore;
        }
        return state.search.radius*state.search.factor; //return default or last known radius
    };

    this.getStateCopy = function(){
        //return copy of state (so that it can not directly be manipulated)
        return JSON.parse(JSON.stringify(state));
    };

    function _setStateChanged(){
        state["changed"] = new Date().getTime();
    }

    this.setItem = function(name, value, nocaching){
        //FIXME: this allows for external tamperinf of state. The classes using this should be within this object
        console.info("saving ----- " + name);
        state[name] = value;
        _setStateChanged();
        if(!nocaching){this.saveState();}
    };

    this.getItem = function(name){
        //FIXME: return copy of state instead. To avoid external tampering of state
        return state[name];
        console.info("loading ----- " + name);
    };

    this.setBattleState = function(state_name, dict){
        var battle_state = this.getItem("battle_state") || {};  
        battle_state[state_name] = dict;
        this.setItem("battle_state", battle_state);
    };

    this.getBattleState = function(state_name){
        var battle_state = this.getItem("battle_state") || {};  
        return battle_state[state_name];
    };

    this.setAuthentication = function(auth){
        $.extend(auth, this.getItem("auth"));
        this.setItem("auth", auth);
    };

    this.getAuthentication = function(type){
        var auth = this.getItem("auth");
        if(type){
            if (auth){
                return auth[type];
            }
        }else{
            return auth;
        }
        return null;
    };
    this.getAlias = function(){
        return this.getItem("alias");
    };
    this.saveState = function(){
        cacheStorageSave("state", JSON.stringify(state));
        var un = new Date().getTime();
        var ul = this.getItem("updated") || 0;
        if(un > ul){ //means that we need to promise a new save
            state["updated"] = un + 5000;
            setTimeout(putGameStateSnapshot, 5000);
        } //else we have promised to save a snapshot and are waiting for the timeout
    };

    this.loadState = function(callback_success, callback_failure){
        cached_state = cacheStorageLoad("state");
        if(cached_state){
            state = JSON.parse(cached_state);
            callback_success(cached_state);
        }else{
            callback_failure();
        }
    };

    this.setItemState = function(item, state, delay){
        if(item.state != state){
            _setStateChanged();
            var old_state = item.state;
            item.state = state;
            if(delay){
                inventory.askCallback(item.id, delay);
            }
            game_state.saveState();
            this.callback_changed_itemstate(item, old_state);
        }
    };

    this.callback_changed_itemstate = function(item, old_state){
        var sounds = {undefined:"start", 0: "progress", 1: "spawn", 2: "idle", 3: "full"};
        if(sounds[item.state]){
            //USING TYPE ALLOWS CONSTRUCTION SOUNDS TO BE SPECIFICT TO DIFFERENT ITEMS -> item.type + "_" + sounds[item.state];
            //smgr.playItem("construction_" + sounds[item.state], item.id);
            if(sounds[item.state] == "done"){
                try{
                    var marker_id = inventory.getItems()[item.id].gui.id;
                    mmgr.actors[marker_id].marker.openPopup();
                    map.zoomOut(); //FIXME: this is a refresh icon hack
                    if(item.gui.sound_loop){
                        smgr.stop(item.gui.sound_loop);
                    }
                }catch(e){}
            }
            //this will fire 
            if(sounds[item.state] == "start" || sounds[item.state] == "progress" || sounds[item.state] == "spawn"){
                if((sounds[item.state] == "spawn") && (item.gui.sound_loop)){
                    smgr.stop(item.gui.sound_loop);
                }
                item.gui.sound_loop = fireGameEventItem("building_" + item.category + "_" + item.type + "_" + sounds[item.state], item.id);
            }
        }
    };

    this.handleCallbackItemUpgrades = function(item, time_now){
        /* SECURITY: state validate last state and time */
        if (item.state == undefined){
            var item_details = inventory.getItemDetails(item);
            inventory.askCallback(item.id, item_details.upgrade_time * 1000);
            /*item.state = 0;
            this.saveState();*/
            item.constructed = (new Date().getTime()) + item_details.upgrade_time * 1000; //used by server push notification
            this.setItemState(item, 0);
        }
        if (item.state == 0){
            $("#"+item.id+" .item_state").html(_lang["state_build_building"] || "Building ...");
            setTimeout(checkAchievementEvent, 4000);
            if(inventory.hasTimedOut(item)){
                item.level = item.level + 1;
                /*item.state = 1; 
                this.saveState();*/
                this.setItemState(item, 1);
          }
          else{return item;}
        }
        if (item.state == 1){
            var item_details = inventory.getItemDetails(item);
            $("#"+item.id+" .item_state").html(_lang["state_ready_building"] || "Ready!!");
            addXP(getBuildTimeXP(item_details.upgrade_time || item_details.research_time || 0));
            updateCurrencyStorageCapacity();
            mapApplyIconImage(item.gui.id, getItemIconURL(item_details));
            //item.state = 2; //move directly to state 2 and do item specific stuff
            this.setItemState(item, 2);
            if (item_details.level >= 2){  //detect if the player has upgraded a building
                this.addAchivement("achivement_upgradebuildings", 1);
            }
        }
        if (item.state == 200){ //requirest update state
            var item_details = shop.getInstanceUpgrade(item);//inventory.getItemDetails(item);
            inventory.askCallback(item.id, (item_details.upgrade_time || 0.01) * 1000);
            item.constructed = (new Date().getTime()) + item_details.upgrade_time * 1000; //used by server push notification            
            /*item.state = 0;
            this.saveState();*/
            this.setItemState(item, 0);
        }        
        return item;
    }

    this.handleCallbackItemStorage = function(item, time_now){
        item = this.handleCallbackItemUpgrades(item, time_now);
        if (item.state == 2){
            updateCurrencyStorageCapacity();
            item.state = 3;
            this.setItemState(item, 3);
        }
        if (item.state == 3){
            $("#"+item.id+" .item_state").html(_lang["state_ready_storage"] || "Storing resources");            
        }
    };

    this.handleCallbackItemProtect = function(item, time_now){
        item = this.handleCallbackItemUpgrades(item, time_now);
        if (item.state == 2){
            $("#"+item.id+" .item_state").html(_lang["state_ready_protect"] || "Protecting resources");
        }
    };

    this.handleCallbackItemSupport = function(item, time_now){
        item = this.handleCallbackItemUpgrades(item, time_now);
        if (item.state == 2){
            $("#"+item.id+" .item_state").html(_lang["state_ready_support"] || "Supporting");
            if(item.type == "gunboat"){
                //TODO: set the scanner range here
                if(battle_state){
                    var radar_details = inventory.getItemDetails(item);
                    //set the items here
                    //update the scanner visual range (for player feedback)
                    try{
                        mmgr.actors.player.circle_base.setRadius(radar_details.scanner_range);
                    }catch(e){
                        setTimeout(function(){
                            mmgr.actors.player.circle_base.setRadius(radar_details.scanner_range);
                        }, 10000);
                    }
                }

            }
            if(item.type == "radar"){
                //TODO: SET THE RADAR
                if(battle_state){
                    var radar_details = inventory.getItemDetails(item);
                    //set the items here
                    if(battle_state.scanner){
                        battle_state.scanner.power = 100;
                        battle_state.scanner.charge = battle_state.scanner.power/radar_details.charge_time;
                        battle_state.scanner.drain  = -(battle_state.scanner.power/radar_details.drain_time);
                        battle_state.scanner.radar_range = radar_details.radar_range;
                    }
                }
            }            
        }
    };

    this.handleCallbackItemDefense = function(item, time_now){
        return this.handleCallbackItemBuilder(item, time_now);
    };

    this.handleCallbackItemHeadquarter = function(item, time_now){
        item = this.handleCallbackItemUpgrades(item, time_now);
        if (item.state == 2){
            $("#"+item.id+" .item_state").html(_lang["state_ready_headquarter"] || "HQ command");
        }
    };

    this.handleCallbackItemManual = function(item, time_now){
        item = this.handleCallbackItemUpgrades(item, time_now);
        if (item.state == 2){
            $("#"+item.id+" .item_state").html("");
            if (item.level >= 2){ //detect if the player has upgraded the boombs
                game_state.addAchivement("achivement_upgradearmorymanual", 1);
            }
        }
    };


    this.handleCallbackItemTroops = function(item, time_now){
        item = this.handleCallbackItemUpgrades(item, time_now);
        if (item.state == 2){
            $("#"+item.id+" .item_state").html("");
            // lets update the level info in board
            guiResearchDialogItemShow(inventory.getItemDetails(item), item.id); 
            if (item.level >= 2){ //detect if the player has upgraded the boombs
                game_state.addAchivement("achivement_upgradearmorytroops", 1);
            }
        }
    };    

    this.handleCallbackItemBuilder = function(item, time_now){
        /* SECURITY: state validate last state and time */
        item = this.handleCallbackItemUpgrades(item, time_now);
        if (item.state == 2){
            item._time_builder_starts = new Date().getTime();
            item._time_builder_ends = getResourceBuildTime(item);
            inventory.askCallback(item.id, item._time_builder_ends);
            $("#"+item.id+" .item_state").html(_lang["state_working_builder"] || "Building");
            /*item.state = 3;
            this.saveState();*/
            this.setItemState(item, 3);
            return;
        }
        if (item.state == 3){
            var built = getResourcePayout(item);
            $("#"+item.id+" .item_state").html("<img class='infowindow_buttons_currency' src='media/images/icon_small_" + built["type"] + ".png'> " + built["count"]);
            if(inventory.hasTimedOut(item)){
                var item_details = inventory.getItemDetails(item);
                /*item.state = 4;*/
                this.setItemState(item, 4);
            }
        }
        if (item.state == 4){
            var built = getResourcePayout(item);
            $("#"+item.id+" .item_state").html("<img class='infowindow_buttons_currency' src='media/images/icon_small_" + built["type"] + ".png'> FULL " + built["count"]);
        }
        if (item.state == 5){
            runResourcePayout(item);
        }
    };

    this.handleCallbackLedgerChange = function(ledgers, debet, credit, item){
        game_state.setItem("ledgers", ledgers);
        for (var l in ledgers){
          state.storage_contents[l] = ledgers[l]["amount"];
        }
        refreshShopItems();
    };

    this.getCurrencyAmount = function(name){
        if(!name){ return game_state.getStorageContents(); }
        return game_state.getStorageContents()[name];
    }

    this.getStorageCapacity = function(){ return state.storage_capacity; };
    this.getStorageContents = function(){ return state.storage_contents; };
    this.getHeadQuarterLevel = function(){
        var hq = inventory.getItemByType("headquarters");
        if(!hq[0]){ return 0; }
        return hq[0].level;
    };

    function getUpgradeBuildingCost(item_type, to_level, item_inst){
        //is called when showing build buildings
        var next_details = inventory.getItemDetails({"type":item_type, "level": to_level});
        var totals = {"diamonds":0};
        for(var c in state.currencies){
            if(state.currencies[c].economy){
                if(next_details["upgrade_"+c] > state.storage_contents[c]){
                    var requires = next_details["upgrade_"+c] - state.storage_contents[c];
                    if(requires > 0){
                        if(!totals[c]){totals[c] = 0;}
                        totals[c] = totals[c] + requires;
                        totals["diamonds"] = totals["diamonds"] + iapgems.getGems4Resource(requires, c);
                    }
                }
            }
        }
        totals["diamonds"] = totals["diamonds"] + iapgems.getGems4Resource(next_details["upgrade_time"], "time");
        return totals;
    };

    this.canUpgradeItemException = function(item_type, to_level){
        /* returns null if all is ok else raises error with description */
        try{
            this.canUpgrade(item_type, to_level);
        }catch(e){
            throw StringCapitalise(e.message);
        }
    };

    this.canUpgrade = function(item_type, to_level){
        /* returns null if all is ok else raises error with description */
        var hq_level = game_state.getHeadQuarterLevel();
        var armory = inventory.getItemByType("armory");
        var item, next_details = inventory.getItemDetails({"type":item_type, "level": to_level});
        if (next_details.head_quarter > hq_level){throw new EconomyException(1003, {"item_name":_lang[item_type], "hq_level": hq_level, "hq_level_required": next_details.head_quarter});}
        //TODO: if (inventory.getAllowedUpgrade(item_type, hq_level) >=  to_level){ throw "You need to upgrade headquarter level to upgrade this item."; }
        if (!shop.inventory[item_type][to_level]){ throw new EconomyException(1004, {"item_name":_lang[item_type]}); }

        if(to_level == 1){ //then we are adding a new item with level 1, lets check if we may do this!!
            if (inventory.getAllowedCount(item_type, hq_level) <= inventory.getItemByType(item_type).length){
                throw new EconomyException(1005, {"hq_level": hq_level, "hq_level_required": hq_level+1});
            }
        }
        if(armory.length && (next_details.armory != undefined) ){
            if (armory[0].level < next_details.armory){
                throw new EconomyException(1009, {"item_name": _lang[item_type], "armory_level_required": next_details.armory, "armory_level": armory[0].level});
            }
        }
        if (next_details.xp_level){
            if(state.xp.level < next_details.xp_level){
                throw new EconomyException(1008, {"item_name": _lang[item_type], "xp_level_required": next_details.xp_level, "xp_level": state.xp.level});
            }

            var xp_required = _getLevelXPRequired(next_details.xp_level);//getTotalXPLevelRequirement(next_details.xp_level);
            if(state.xp.total < xp_required){
                throw new EconomyException(1006, {"item_name": _lang[item_type], "xp_required": xp_required, "xp_count": state.xp.total});
            }
        }

        for(var c in state.currencies){
            if((state.currencies[c].economy) && (next_details["upgrade_"+c] > state.storage_contents[c])){
                throw new EconomyException(1007, {"item_name": _lang[item_type], "upgrade_price": next_details["upgrade_"+c], "upgrade_currency": _lang[c]});
            }
        }
        if (inventory.getProgress({state: 0}).length){ throw new EconomyException(1002);}
        return true;
    };

    this.addUpgrade = function(inst, ignore_error){
        //FIXME: reused code from addPurchase
        if(inst){
            this.canUpgradeItemException(inst.type, parseInt(inst.level)+1);
            var item = shop.getInstanceUpgrade(inst); //shop.inventory[inst.type][inst.level+1];
            //transaction
            //move price to root - begin
            for (var i in item){
              if(item[i]){
                if (i.indexOf("upgrade_") === 0){
                  item[i.replace("upgrade_", "")] = -item[i];
                }
              }
            }
            var transaction = ledgers.addTransactionAction("buy", item);
            game_state.setItemState(inst, 200, 100);
        }
    };

    this.addPurchase = function(item_type, item_level, properties){
        //FIXME: reused code from runUpgrade
        properties = properties || {};
        this.canUpgradeItemException(item_type, parseInt(item_level));
        var item = shop.inventory[item_type][item_level];
/*        if (item.category == "iap"){
            addIAPPurchase(item);
            return;
        }*/
        for (var i in item){
          if(item[i]){
            if (i.indexOf("upgrade_") === 0){
              item[i.replace("upgrade_", "")] = -item[i];
            }
          }
        }
        //move price to root - ends
        var transaction = ledgers.addTransactionAction('buy', item);
        properties.item_level = item_level;
        properties.item_type = item_type;
        properties.trans_id = transaction;
        return inventory.addItem(item, properties.id || transaction, properties);
    };

    function getBuildTimeXP(ms){
        var xp = 0;
        for(var i in build_xp){
            if (build_xp[i].build_time > ms){
                break;
            }else{
                xp = build_xp[i].xp;
            }
        }
        return xp;
    };

    function _getLevelXPRequired(level){
        level = level || state.xp.level;
        return (ii_attack[level-1] || {"xp": 20000}).xp;//(level * xp_level_increase) - xp_level_increase;
    }

    function addXP(xp){
        var upgrade = false;
        var old_count = state.xp.count;
        if(!xp){ return; } //skip doing anything if 0
        state.xp.required = _getLevelXPRequired(state.xp.level+1);
        state.xp.count = state.xp.count + xp;
        state.xp.total = state.xp.total + xp;
        if (state.xp.count >= state.xp.required){
            upgrade = true;
            state.xp.count = Math.abs(state.xp.count - state.xp.required);
            state.xp.level = state.xp.level + 1;
            state.xp.required = _getLevelXPRequired(state.xp.level+1); //((state.xp.level+1) * xp_level_increase) - xp_level_increase;
            //now make sure that the current amount does not exceed the next xp count (example is that we add 1000000000 in xp should not result in next wave being full)
            if(state.xp.xp_count > state.xp.required) { state.xp.count = state.xp.required-1; }
            if(game_state.callback_changed_level){game_state.callback_changed_level(state.xp.level, state.xp.old);}
        }
        state.xp.old = old_count;
        game_state.updateGUI();
    }

    this.updateGUI = function(){
        if(game_state.callback_changed_xp){game_state.callback_changed_xp(state.xp);}
        if(game_state.callback_changed_storage){game_state.callback_changed_storage(state.storage_content, state.storage_capacity);}
    };

    this.getXP = function(){
        return state.xp || {};
    };

    this.getXPLevel = function(){
        return this.getXP()["level"] || 0 ;
    };

    this.addBattleTransaction = function(amount, transaction_name, debet_account, debet_sum){
        addCurrencyPayout("gold", amount, transaction_name);
        if(debet_account){
            debet_sum = debet_sum || -amount;
            if(debet_sum > 0){ throw "Can to add to debet account, must be negative value. Got " + debet_sum; }
            if((debet_account == "gold") || (debet_account == "wood") || (debet_account == "stone") || (debet_account == "iron") || (debet_account == "diamonds")){ throw "Can not use economic accounts to add money to" }
            addCurrencyPayout(debet_account, debet_sum, transaction_name);
        }
    };
    this.getBattles = function(effort){
        if(effort == undefined){return state.battles;}
        var battles = [];
        for (var i in state.battles){
            if(state.battles[i].effort >= effort){
                battles.push(state.battles[i]);
            }
        }
        return battles;
    };
    this.addBattle = function(p){ 
        /* we collect the player battles */
        if(p.effort == undefined){ throw "Battle effort must be set"; }
        state.battles.push(p);
        this.saveState();
    };
    this.addScore = function(score_type, count){
        //future proof
        var scores = this.getItem("score") || {};
        scores[score_type] = count + (scores[score_type] || 0);
        this.setItem("score", scores);
    };
    this.addAchivement = function(a, p){
        /*
            Where 
                - a is the attraction identifier
                - p is a value from 0 to 1
        */
        if(p == undefined){ p = null; }
        if(!state.achivements[a]){state.achivements[a] = {};}//create if does not exist
        if (!state.achivements[a]["added"]){
            state.achivements[a]["added"] = new Date().getTime();
            if(typeof(p) == "number"){
                if((0 > p) || (1 > p)){ throw "Attraction value must be between 0 and 1"; }
                state.achivements[a]["complete"] = p;
            }
            this.saveState();
            logUserAchivements(a);
            try{
                this.runAchivement(a);
            }catch(e){
                handleException(e);
            }
        }        
    };
    this.runAchivement = function(a){
        if(this.options.callback_achivement){
            this.options.callback_achivement(state.achivements, a); // this callback should count what has not been collected and call setActionsAvailableCount("achivement_count", achivements_count);
        }
    }
    this.hasAchivement = function(a){
        return (!!state.achivements[a]);
    };
    this.getAchivement = function(a){
        return state.achivements[a];
    };
    this.collectAchivementGroup = function(agid){
        var group_achivements = game_achivement_groups[agid].achivements;
        var c = 0;
        for(var i in group_achivements){
            var a = group_achivements[i];
            if((state.achivements[a]) && (state.achivements[a]["complete"]) && (!state.achivements[a]["collected"])){
                setTimeout(this.collectAchivement, c*2000, a, this);
                c = c + 1;
            }
        }
    }
    this.collectAchivement = function(a, self){
        var r = game_achivements[a].rewards;
        if((state.achivements[a]["complete"]) && (!state.achivements[a]["collected"])){
            addCurrencyPayout("diamonds", r.diamonds);
            addXP(r.xp);
            state.achivements[a]["collected"] = new Date().getTime();
            self = self || this;
            self.saveState();
            self.runAchivement();            
            //lets notify the server as well
            $.getJSON("api/achievement/collect/" + a + "/", function(res){
                if(res.success){
                    runPurchaseIAPCorrection(); //lets make sure everything is correct
                }
            });
        }
    }

    this.setGameMode = function(mode, param){
        //can be "attack" or "economy"
        param = param || {};
        if((mode != "attack") && (mode != "economy") && (mode != "attack_countdown") && (mode != "tutorial")){ throw "Game state mode ("+mode+") does not exist";}
        if(mode == state.game_mode){ return ;}
        if((mode == "economy") && (param.action === "battle")){this.addBattle(param);}
        if(game_state.callback_changed_gamemode){game_state.callback_changed_gamemode(mode, param);}
        state.game_mode = mode;
        state.game_param = param;
    };

    this.getGameMode = function(with_param){
        /* returns: attack, economy */
        if (with_param){
            return {"mode": state.game_mode || "economy", "param": state.game_param || {}};
        }else{
            return state.game_mode || "economy" ;
        }
    };

    /// private
/*    
    function getNextXPLevelRequirement(xp_level){
        //clashofclans.wikia.com/wiki/Experience
        xp_level = xp_level || state.xp.level;
        return xp_level * xp_level_increase - xp_level_increase;
    }

    function getTotalXPLevelRequirement(xp_level){
        //clashofclans.wikia.com/wiki/Experience
        xp_level = xp_level || state.xp.level;
        return xp_level * (xp_level - 1) * xp_level_increase/2;
    }
*/
    function getStorageCapacityDiamonds(){
        /* returns a max amount of storage capacity of diamonds */
        return Math.max(state.storage_capacity["diamonds"], state.storage_contents["diamonds"] + 10, iapgems.getGems4Resource(60*60*state.xp.level, "time"));
    }

    function updateCurrencyStorageCapacity(){
        var capacity = {};
        var inventory_items = inventory.getItems();
        //init the capacity
        for(var i in state.currencies){
            capacity[i] = state.currencies[i].capacity;
        }
        //special case diamonds
        capacity["diamonds"] = getStorageCapacityDiamonds();
        for(var id in inventory_items){
            if(inventory_items[id].state > 0){ //if initialized (created)
                var item_type = inventory_items[id].type;
                var details = inventory.getItemDetails(inventory_items[id]);
                /*
                if (item_type == "goldstorage"){capacity["gold"] = capacity["gold"] + details["capacity_gold"];}
                if (item_type == "woodstorage"){capacity["wood"] = capacity["wood"] + details["capacity_wood"];}
                if (item_type == "stonestorage"){capacity["stone"] = capacity["stone"] + details["capacity_stone"];}
                if (item_type == "ironstorage"){capacity["iron"] = capacity["iron"] + details["capacity_iron"];}

                if (item_type == "headquarters"){capacity["gold"] = capacity["gold"] + details["capacity_gold"];}
                if (item_type == "headquarters"){capacity["wood"] = capacity["wood"] + details["capacity_wood"];}
                if (item_type == "headquarters"){capacity["stone"] = capacity["stone"] + details["capacity_stone"];}
                if (item_type == "headquarters"){capacity["iron"] = capacity["iron"] + details["capacity_iron"];}
                */
                //check all of our valuables if capacity is defined for object, then accumilate it
                for(var currency in capacity){
                    if(details["capacity_" + currency] != undefined){
                        capacity[currency] = capacity[currency] + details["capacity_" + currency];
                    }
                }
            }
        }
        state.storage_capacity = capacity;
        game_state.updateGUI();
        return capacity;
    };

    function getItemCurrencyType(item){
        if(item.create_gold || item.capacity_gold){ return "gold"; }
        if(item.create_wood || item.capacity_wood){ return "wood"; }
        if(item.create_stone || item.capacity_stone){ return "stone"; }
        if(item.create_iron || item.capacity_iron){ return "iron"; }
        /* car > collectable accumulative resource can be defined by weapons */
        if(item.create_car1 || item.capacity_car1){ return "car1"; }
        if(item.create_car2 || item.capacity_car2){ return "car2"; }
        if(item.create_car3 || item.capacity_car3){ return "car3"; }
        if(item.create_car4 || item.capacity_car4){ return "car4"; }
        if(item.create_car5 || item.capacity_car5){ return "car5"; }
        if(item.create_car6 || item.capacity_car6){ return "car6"; }
        if(item.create_car7 || item.capacity_car7){ return "car7"; }
    }
    function getResourceBuildTime(item_inst){  //game_state.js, gui.js, 
        var item = inventory.getItemDetails(item_inst);
        var type = getItemCurrencyType(item);
        var max = item["capacity_" + type];
        var cph = item["create_" + type];
        //var max = item.capacity_gold || item.capacity_wood || item.capacity_stone || item.capacity_iron || item.capacity_ctbl1;
        //var cph = item.create_gold || item.create_wood || item.create_stone || item.create_iron || item.create_ctbl1;
        return (max/cph)*60*60*1000;
    }
    function getResourcePayout(inst, time_now){
        if(!time_now){time_now = new Date().getTime();}
        var item = inventory.getItemDetails(inst);

        

        var endtime = time_now;
        if (inst._time_builder_ends <= time_now){
            time_now = inst._time_builder_ends;
        }
        var seconds = (endtime - inst._time_builder_starts)/1000; //amount of seconds since we started
        var payment_type = getItemCurrencyType(item);
        var payment_persecond = item["create_"+payment_type]/(60*60);
        //console.info("------------get resource payout --------------" + JSON.stringify({"seconds":seconds, "payment_type":payment_type}));
        return {"count":Math.min(item["capacity_" + getItemCurrencyType(item)], Math.floor(seconds*payment_persecond) || 0), "type":payment_type, "persecond":payment_persecond};
    }
    function runResourcePayout(inst){
        //1. calculate amout - DONE
        var payment = getResourcePayout(inst);
        var time_now = new Date().getTime();
        if (payment.count < 0){ return; /* payout must be positive */ }
        var amount_overflow = addCurrencyPayout(payment.type, payment.count);
        //console.info("------------run resource payout --------------" + JSON.stringify(payment) + " " + amount_overflow);
        //4. reset the timer
        var seconds_to_collect = amount_overflow/payment.persecond;
        var time_builder_length = getResourceBuildTime(inst);
        /*
        if (!amount_overflow){ //fully paid
            //inventory.askCallback(inst.id, getResourceBuildTime(inst));
        }else{ //the resource payed out more than could be stored, lets calculate adjusted time
            //calculate when we should have started mining if we currently have amount_overflow (and set that to the items start time)
            if(seconds_to_collect){
                inst._time_builder_length = time_now - (seconds_to_collect*1000);
                inst._time_callback_starts = inst._time_builder_starts = time_now - (seconds_to_collect*1000); //time_now;
                inst._time_callback_ends = inst._time_builder_ends = time_now + inst._time_builder_length - (seconds_to_collect*1000); //time_now + inst._time_builder_length; 
                
                //inventory.askCallback(inst.id, inst._time_builder_length);
            }
            game_state.setItemState(inst, 3, 500);
            setTimeout(function(){
                guiAlert("Current storage is full. Could not save  "+amount_overflow+" " + payment.type + ". Please upgrade storage facility.", "Storage full");
            }, 500);
        }
        */
        //MOVED game_state.setItemState(inst, 3, 500); //continue
        var date_now = new Date();
        var instid = inst.id;
        var inst = inventory.getItemById(instid);
        if(isNaN(seconds_to_collect)){ seconds_to_collect = 0;}
        var time_builder_spent = (seconds_to_collect*1000);
        time_builder_length = time_builder_length;
        inst._time_builder_length = time_builder_length;
        inst._time_callback_starts = inst._time_builder_starts = time_now - time_builder_spent; //time_now;
        //inst._time_callback_ends = inst._time_builder_ends = time_now + time_builder_length - time_builder_spent; //time_now + inst._time_builder_length; 
        inst._time_callback_ends = inst._time_builder_ends = time_now + time_builder_length - time_builder_spent; //time_now + inst._time_builder_length; 
        inventory.askCallback(instid, time_builder_length);
        inventory.setItem(instid, inst);
        if(seconds_to_collect > 0){
            setTimeout(function(){
                //guiAlert("" + StringCapitalise(payment.type) + " storage is full. Could not save  " + amount_overflow + ". Please upgrade storage facility.", "Storage full");
                guiAlert(StringCapitalise(StringFormat(_lang["gui_warning_message_e1051"], {"currency":_lang[payment.type], "amount_overflow": amount_overflow})), _lang["dialog_title_storagefullwarning"], {"message": "Storage full", "sound_notification": "ui_full_storage_" + payment.type});
            }, 500);
        }
        game_state.setItemState(inst, 2, 500); //WAS 3 MOVED 
    }

    function addCurrencyPayout(payment_type, amount, transaction_name){
        //example: addCurrencyPayout("gold", 100); gives 100 in gold
        //start
        transaction_name = transaction_name || "buy";
        var capacity =  state.storage_capacity;
        var contents =  state.storage_contents;
        //2. check that we have somewhere to place it
        var capacity_paymenttype = capacity[payment_type] || 0;
        var overflow = 0;
        if(true){// lets allow negative numbers since we want to pay for battles //(amount > 0){
            if(capacity[payment_type] > (amount + contents[payment_type])){

            }else{
                overflow = (amount + contents[payment_type]) - capacity_paymenttype;
                amount = capacity_paymenttype - contents[payment_type];
            }
            //3. add transaction
            var transaction = {"account":"resource", "name": payment_type};
            transaction[payment_type] = amount;
            ledgers.addTransactionAction(transaction_name, transaction);
        }
        return overflow;
    }

    this.addXP = addXP;
    this.getUpgradeBuildingCost = getUpgradeBuildingCost;
    /*
    DEBUGGING
    */
    //this._getTotalXPLevelRequirement = getTotalXPLevelRequirement;
    this._runResourcePayout = runResourcePayout;
    this._addCurrencyPayout = addCurrencyPayout;
    this._addXP = addXP;
    this._state = state;
    this.getLevelXPRequired = _getLevelXPRequired;
    this._updateCurrencyStorageCapacity = updateCurrencyStorageCapacity;

}();
