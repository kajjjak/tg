
function isPhoneGap() {
    return (window.cordova || window.PhoneGap || window.phonegap) 
    && /^file:\/{3}[^\/]/i.test(window.location.href) 
    && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent);
}

function cacheStorageSave(id, strdata){
    if((id == "preferences") || (id.indexOf("edit_") != -1)){
        localStorage.setItem(id, strdata);
    }else{
        if(isPhoneGap()){
            localStorage.setItem(id, strdata);
        }else{
            sessionStorage.setItem(id, strdata);
        }
    }
}

function cacheStorageLoad(id){
    if(id == "preferences" || (id.indexOf("edit_") != -1)){
        return localStorage.getItem(id);
    }else{
        if(isPhoneGap()){
            return localStorage.getItem(id);
        }else{
            return sessionStorage.getItem(id);
        }
    }
}

function cacheStorageRemove(id){
    sessionStorage.removeItem(id);
}

function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

function clearPlayerSession(){
    deleteAllCookies();
    cacheStorageRemove("state");
    sessionStorage.clear();
}


function getBrowserType(){
    // http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        // At least Safari 3+: "[object HTMLElementConstructor]"
    var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
    var isIE = false || !!document.documentMode; // At least IE6

    if(isChrome){return "chrome";}
    if(isFirefox){return "firefox";}
    if(isSafari){return "safari";}
    if(isOpera){return "opera";}
    if(isIE){return "ie";}
}


function preLoadImages(arrayOfImages) {
    /* image preloader */
  $(arrayOfImages).each(function(){
      //$('<img/>')[0].src = this;
      (new Image()).src = this;
  });
}

Date.prototype.stdTimezoneOffset = function() {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.dst = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

function useFacebookPictureForItem(itm, auth, options){
    //useFacebookPictureForItem(game_state.getInventoryItem("headquarters"), {"facebook":{"id":10153099606551180, "token":"CAADh729gBqEBABRFFequHbZACIQ0v8GYQcdOcB65dyJTT5NPjmw6s4vxZAnGjt9rtzI2WBFj1DIPOcpdZAVkjsaZCR70hRvucHQctrjEuY2d35R3Qjn3nN0W9RGJToQndaf5nZB5NX9qV1ZA0qvEJZB8lXBuIkzNa667ISZCxPPPFBj42eu7KvfRZCn5ibhlUI7hwObQMoU1c09EYmn8ZAv92OPxxBGaclGTcZD"}}, {"style":{"border-style":"solid", "border-color":"black"}});
    options = options || {};
    if(!options.style){ options.style = {"style":{"border-style":"solid", "border-color":"black"}}; }
    if(auth && auth.facebook && itm.gui && itm.gui.id){
        if(auth.facebook.token && auth.facebook.id){
            url = "https://graph.facebook.com/"+auth.facebook.id+"/picture?redirect=false&token="+auth.facebook.token;
  
            $.getJSON(url, function(res){
                if(res.data && res.data.url){
                    $("#"+itm.gui.id + " .body").css("background-image", 'url('+res.data.url+')');
                }
                if(options.style){
                    $("#"+itm.gui.id + " .body").css(options.style);
                }        
            });
        }
    }
}

function addTimeMinutes(time, minutes) {
    return new Date(time + minutes*60000).getTime();
}


guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();    
