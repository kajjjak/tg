/** Copyright 2014 kajjjak
Idea is to count the resources using know financial calculations.

General ledger representing the 5 main account types: assets, liabilities, income, expenses, and equity.

Resource management is handled using callbacks detecting if item is booked in debet column
then looking that item up in the resource list and setting the item holder to the debet account.

*/


/////////////////////////////////////////////////////////////////////
//resources
    
var inventory = new function(){
    var items = {};
    var userState = null;

    this.initialize = function(user_state){
        items = {};
        this.items = null; //hopefully causes error when directly accessed
        userState = user_state;
        this.loadItems();
    };

    this.getItemCount = function(bycategory){
        var itms = inventory.getItems();
        var c = 0;
        if (bycategory){
            for (var i in itms){ if(itms[i].category == bycategory){ c++; }}
        }else{
            c = itms.length;
        }
        return c;
    }

    this.getItems = function(){
        return items;
    };

    this.setItem = function(item_id, itm){
        items[item_id] = itm;
    };

    this.getItem = function(item_id){
        return items[item_id];
    };
    this.getItemById = this.getItem;

    this.getItemByType = function(item_type){
        var itms = [];
        for(var id in items){
            var item = items[id];
            if (item.type == item_type){
                itms.push(item);
            }
        }
        return itms;
    };

    this.getItemByCategory = function(item_category){
        var itms = [];
        for(var id in items){
            var item = items[id];
            if (item.category == item_category){
                itms.push(item);
            }
        }
        return itms;
    };

    this.getItemDetails = function(item_instance){
        if (!item_instance){ return {}; }
        return shop.inventory[item_instance["type"]][item_instance["level"]];
    };

    this.getAllowedUpgrade = function(item_type, level){
        level = level - 1; //because HQ level is newer lower than 1
        if (level < 0){ level = 0; } //lets be safe
        return inventory_hqupgrades[level][item_type];
    };

    this.getAllowedCount = function(item_type, level){
        level = level - 1; //because HQ level is newer lower than 1
        if (level < 0){ level = 0; } //lets be safe
        return inventory_hqavailable[level][item_type];
    };

    this.addItem = function(item, uid, gui){
        if (!uid){ throw "Adding a resource needs unique id"; }
        if (!this.callback_item) { throw "Function this.callback_item not set"; }
        items[uid] = {};
        items[uid]["id"] = uid;
        items[uid]["created"] = new Date().getTime();
        items[uid]["type"] = item.type;
        items[uid]["level"] = 0; //item.level;
        items[uid]["category"] = item.category;
        items[uid]["gui"] = gui;
        items[uid].callback = this.callback_item;
        var self = this;
        if (this.callback){this.callback(items[uid], gui);}
        items[uid].callback(uid);
        this.cacheItems();
    };

    this.getProgress = function(filter){
        var itms = [];
        var time_now = new Date().getTime();
        for(var id in items){
            var item = items[id];
            if(filter != undefined){ if (filter.state !== item.state){ continue; } }
            if(item._time_callback_length){
                var ms = item._time_callback_ends-(time_now+500);
                var progress = 1-(ms/item._time_callback_length);
                if (progress < 0){ progress = 0; }
                if (progress > 1){ progress = 1; inventory.askCallback(id, 100); item._time_callback_length = null; }
                itms.push({id:id, progress: progress, ms:ms,  type: item.type, state: item.state, level: item.level});
            }
        }
        return itms;
    };

    this.cacheItems = function(){
        userState.setItem("inventory", items);
    };

    this.loadItems = function(){
        items = userState.getItem("inventory") || {};
        for (var i in items){
            items[i].callback = this.callback_item;
            inventory.askCallback(i);
            if (this.callback){this.callback(items[i], items[i].gui);}
        }
    };

    this.hasTimedOut = function(item){
        var time_now = new Date().getTime();
        if(item._time_callback_ends > time_now){
            return false;
        }else{
            return true;
        }
    };

    this.askCallback = function(uid, ms){
        var item = items[uid];
        var time_now = new Date().getTime();
        var item_id = uid;
        //avoid creating many timeouts by misstake
        //if ((item._time_callback_starts + 400) > time_now){ return ; /* avoid multiple calls if within short time range */}
        if (ms){
            item._time_callback_length = ms;
            item._time_callback_starts = time_now;
            item._time_callback_ends = time_now + ms;
        }
        if (item._time_callback_ends){
            var time_callback = 1;
            if(item._time_callback_ends > time_now){
                time_callback = item._time_callback_ends - time_now;
            }
            setTimeout(function(){ 
                //item._time_callback_length = null;
                //item._time_callback_ends = null;
                item.callback(item_id);
            }, time_callback);
        }
    };
}();

var shop = new function(){
    var inventory = {};
    var userState = null;

    this.initialize = function(item_inventory, user_state){
        //TODO: load from userState, rebuild transactions 
        this.loadInventory(item_inventory);
        userState = user_state;
    };

    this._dictArray2dictByTypeLevel = function(item_array){
        var items = {};
        for (var i in item_array){
            var item = item_array[i];
            if(!item.disabled){
                if(!items[item.type]){ items[item.type] = {};}
                items[item.type][item.level] = item;
            }
        }
        return items;
    };

    this._dictArray2dictByType = function(item_array){
        var items = {};
        for (var i in item_array){
            var item = item_array[i];
            if(!items[item.type]){ items[item.type] = {};}
            items[item.type] = item;
        }
        return items;
    }

    this.loadInventory = function(item_array){
        this.inventory = this._dictArray2dictByTypeLevel(item_array);
    };

    this.getItemByInstance = function (inst){
        var l = inst.level;
        var t = inst.type;
        return this.getItems()[t][l];
    }

    this.getItemByType = function(item_type){
        return this.inventory[item_type];
    };

    this.getItemByCategory = function(item_category){
        var itms = [];
        for(var id in this.inventory){
            var item = this.inventory[id][1];
            if (item.category == item_category){
                itms.push(item);
            }
        }
        return itms;
    };

    this.getAffordableByType = function(type, currency){
        var item = this.inventory[type];
        var level;
        var available = [];
        for(var l in item){
            level = item[l];
            var affordable = true;
            for(var r in currency){
                if(level[r] > currency[r]){
                    affordable = false;
                }
            }
            if(affordable){
                available.push({"type": type, "level":l, "category":item[l].category});
            }
        }
        return available;
    };

    this.getInstanceUpgrade = function(inst){
        var itm = this.inventory[inst.type] || {};
        return itm[inst.level+1];
    };

    this.getAffordable = function(currency){
        var available = [];
        for (var t in this.inventory){
            available = available.concat(this.getAffordableByType(t, currency));
        }
        return available;
    };

    this.getItems = function(){
        return this.inventory;
    }

}();