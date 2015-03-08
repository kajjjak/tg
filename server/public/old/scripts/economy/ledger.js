/** Copyright 2014 kajjjak
Idea is to count the resources using know financial calculations.

General ledger representing the 5 main account types: assets, liabilities, income, expenses, and equity.

Resource management is handled using callbacks detecting if item is booked in debet column
then looking that item up in the resource list and setting the item holder to the debet account.

*/


function Ledger (currency, saved) {
    this.currency = currency;
    this.accounts = saved.accounts || {"cash": 0};
    this.amount = saved.amount || 0;
    this.records = saved.records || [];
    this.callback = undefined; //function (accounts, item)
}

Ledger.prototype.addTransactionItem = function(item, debet, credit){
    if((this.amount + item[this.currency]) < 0){
        throw "Error: not enough funds in " + this.currency;
    }
    if(item[this.currency]){
        this.amount = this.amount + item[this.currency];
    }
    if(!this.accounts[debet]){this.accounts[debet] = 0;}
    if(!this.accounts[credit]){this.accounts[credit] = 0;}
    if(item[this.currency]){
        this.accounts[debet] = this.accounts[debet] + item[this.currency];
    }
    if(item[this.currency]){
        this.accounts[credit] = this.accounts[credit] - item[this.currency];
    }
    
    this.records.push({"debet":debet, "credit": credit, "item":item});
};

var ledgers = new function() {
    var userState = null;

    this.initialize = function(currencies, transactions){
        /*
            example currencies = ["gold", "elixir", "gems"]
            example transactions = {
              "build_express":  {"debet": "time", "credit": "cash"}, //must have item with gems
              "build_resource": {"debet": "build", "credit": "time"},
              "build_complete": {"debet": null, "credit": "build"},
              "mined_resource": {"debet": "mined", "credit": "time"}, //costs time while mining
              "mined_complete": {"debet": null, "credit": "mined"} //costs mined to get item
            };
        */
        //userState = user_state;
        this.currencies = {};
        this.transactions = transactions || {};

        for (var c in currencies){
            this.currencies[c] = new Ledger(c, currencies[c]);
        }
        this.runCallback();
    }    

    this.runCallback = function(debet, credit, item){
        if(this.callback){
            this.callback(this.currencies, debet, credit, item);
        }
    }

    this.addTransactionAction = function (action, item) {
        if (!this.transactions[action]){ throw "Ledger action not found"; }
        var debet = this.transactions[action].debet || item.account;
        var credit = this.transactions[action].credit || item.account;
        for (var c in this.currencies){
            if(item[c]){this.currencies[c].addTransactionItem(item, debet, credit);}
        }        
        this.runCallback();
        return new Date().getTime(); ///a unique transaction id
    };
};

/////////////////////////////////////////////////////////////////////
/*
ledgers.callback = function(d, k, totals, item){ 
    //totals is used to update GUI totals
    if (d == "defense"){
        console.log("ADD TO RESOURCES");
    }
    if (d == "181-210"){
        console.log("REMOVE FROM RESOURCES");
    }
};

    ledgers.addTransactionAction("buy", items["a1d0-f2fs1-2sfs40-fss2"])
*/