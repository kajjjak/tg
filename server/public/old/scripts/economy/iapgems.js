/*

Time platues

60 seconds (1 min) - 1 gem
3600 seconds (1 hour) - 20 diamonds
86400 seconds (1 day) - 260 diamonds
604800 seconds (1 week) - 1000 diamonds

For example the plateaus for gold/elixir are:

100 - 1 gem
1000 - 5 diamonds
10000 - 25 diamonds
100000 - 125 diamonds
1000000 - 600 diamonds
10000000 - 3000 diamonds


Dark Elixir works similarly, but costs 100 times as much.

1 - 1 gem
10 - 5 diamonds
100 - 25 diamonds
1000 - 125 diamonds
10000 - 600 diamonds
100000 - 3000 diamonds
*/
var iapgems = new function(){

    var plateaus = {};

    function prepResourcePlatues2Gems (currency_plateaus){
        plateaus = {};
        for (var i in currency_plateaus){
            var p = currency_plateaus[i];
            if (!plateaus[p.type]){ plateaus[p.type] = {"ranges":[], "diamonds":[]}; }
            plateaus[p.type]["ranges"].push(p.amount);
            plateaus[p.type]["diamonds"].push(p.value);
        }
        return plateaus;
    };

    function r2g (resources, type){
       //var plateaus = prepResourcePlatues2Gems(); //calc once
       if(!plateaus[type]) { throw "type " + type + " does not exist in " + JSON.stringify(plateaus); }
       var ranges = plateaus[type]["ranges"];
       var diamonds = plateaus[type]["diamonds"];
       return getCalcResourceAndGems(resources, diamonds, ranges); //same as getGems2Resource but reverse input
    };

    function g2r (resources, type) {
       //var plateaus = prepResourcePlatues2Gems(); //calc once
       if(!plateaus[type]) { throw "type " + type + " does not exist in " + JSON.stringify(plateaus); }
       var ranges = plateaus[type]["ranges"];
       var diamonds = plateaus[type]["diamonds"];
       return getCalcResourceAndGems(resources, ranges, diamonds);
    };

    function getCalcResourceAndGems (resources, ranges, diamonds) {
       // http://boombeach.wikia.com/wiki/Thread:4841 
       /*
       var ranges = [100,1000,10000,100000,1000000,10000000];
       var diamonds = [1,5,25,125,600,3000];
       */
       var storagemax = 8001000;
     
       if (isNaN(resources)) throw "Resources count is NaN";
     
       if (resources < 0) throw "Resource count must be a possitive number";
       else if (resources == 0) return(0);
       else if (resources <= ranges[0]) return(diamonds[0]);
     
       for (var i = 1; i < ranges.length-1; i++)
          if (resources <= ranges[i]) 
             return(Math.round((resources - ranges[i-1])/((ranges[i] - ranges[i-1])/(diamonds[i] - diamonds[i-1])) + diamonds[i-1]));
     
       if (resources <= storagemax)
          return(Math.round((resources - ranges[ranges.length-2])/((ranges[ranges.length-1] - ranges[ranges.length-2])/(diamonds[diamonds.length-1] - diamonds[diamonds.length-2])) + diamonds[diamonds.length-2]));           
       else 
          return(doCalcResourceToGems(resources % storagemax) + Math.floor(resources/storagemax) * doCalcResourceToGems(storagemax));
     
       throw "Could not calculate resource count";
    };

    this.getGems4Resource = g2r;
    this.getResource4Gems = r2g;
    

    this.initialize = function(currency_plateaus){
        prepResourcePlatues2Gems(currency_plateaus);
    };
}();