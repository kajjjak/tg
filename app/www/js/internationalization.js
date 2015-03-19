
var lang_en = {
  "notification": {
    "assigned": {
      "vibrate": 100,
      "title": "Assigned", 
      "message": "Check job list"
    },
    "accepted": {
      "vibrate": 100,
      "title": "On our way", 
      "message": "We are on our way to pick you up"
    },    
    "arrived": {
      "vibrate": 100,
      "title": "Arrived", 
      "message": "Your driver has arrived"
    },
    "canceled": {
      "vibrate": 800,
      "title": "Canceled job", 
      "message": "Review your jobs, a job was canceled"      
    }
  },
  "page":{
    "map":{
      "title": "Location",
      "instruction": "drag map",
      "btn_continue": "Continue",
      "lbl_fetchingaddress": "fetching address ..."
    },
    "menu":{
      "title": "Menu",
      "row_map": "Home",
      "row_call": "Call",
      "row_jobs": "Pickups",
      "row_settings": "Settings"
    },
    "service":{
      "title": "Service"
    },
    "jobs":{
      "title": "Jobs",
      "lbl_releasetorefresh": "Release to update",
      "lbl_pulltorefresh": "Pull down to refresh"
    },    
    "driver": {
      "title": "Driver",
      "btn_login": "Link",
      "lbl_hasloggedin": "Logged in as ",
      "lbl_notloggedin": "Please sync using credentials given by your station"
    },     
    "settings":{
      "title": "Settings",
      "btn_driver": "Driver"

    },        
    "revoke":{
      "title": "Cancel",
      "btn_close": "Close",
      "lbl_callstation": "Call station to make changes?",
      "btn_call": "Call"
    },        
    "request":{
      "title": "Confirm",
      "btn_confirm": "Confirm",
      "btn_complete": "Complete",
      "btn_cancel": "Cancel",
      "lbl_updating": "Updating",
      "lbl_updated": "Updated",
      "lbl_address": "Not selected",
      "row_time":{
        "label": "Time",
        "value": "Now"
      },
      "row_service":{
        "label": "Service",
        "value": "Regular"
      },
      "state_map":{
        "complete": "Complete",
        "waiting": "Waiting",
        "active": "Active"
      },
      "feedback_states":{
        "request": "Requesting driver",
        "assigned": "Driver has been assigned",
        "accepted": "We are on our way",
        "arrived": "Driver has arrived",
        "complete": "Drop off"
      }       
    }
  }
};

var lang_is = {
  "notification": {
    "assigned": {
      "vibrate": 100,
      "title": "Nýtt verkefni", 
      "message": "Skoðið pantanir"
    },    
    "accepted": {
      "vibrate": 100,
      "title": "Á leiðinni", 
      "message": "Erum á leiðinni til þín"
    },
    "arrived": {
      "vibrate": 100,
      "title": "Komin", 
      "message": "Er að biða fyrir utan"
    },
    "canceled": {
      "vibrate": 800,
      "title": "Hætt við", 
      "message": "Farið yfir vinnu listinn. Einn viðskiptamaður hætti við"      
    }

  },  
  "page":{
    "map":{
      "title": "Staðsettning",
      "instruction": "færið kortið til",
      "btn_continue": "Panta",
      "lbl_fetchingaddress": "sækir staðsetting ..."
    },
    "menu":{
      "title": "Valmynd",
      "row_map": "Kort",
      "row_call": "Hringja",
      "row_jobs": "Pantanir",
      "row_settings": "Stillingar"
    },
    "service":{
      "title": "Þjónusta"
    },
    "jobs":{
      "title": "Pantanir",
      "lbl_releasetorefresh": "Sleppið til að sækja",
      "lbl_pulltorefresh": "Draga niður til að uppfæra"
    },
    "settings":{
      "title": "Stillingar",
      "btn_driver": "Bílstjóri"
    },
    "driver": {
      "title": "Bílstjóri",
      "btn_login": "Tengja",
      "lbl_hasloggedin": "Auðkenndur sem ",
      "lbl_notloggedin": "Vinsamlegast tengist þjón"
    }, 
    "revoke":{
      "title": "Hætta við",
      "btn_close": "Loka",
      "lbl_callstation": "Viltu hringja inn til stöðinn til að gera breytingar?",
      "btn_call": "Hringja"
    },
    "request":{
      "title": "Staðfesta",
      "btn_confirm": "Staðfesta",
      "btn_complete": "Lokið",
      "btn_cancel": "Hætta við",
      "lbl_updating": "Er að uppfæra",
      "lbl_updated": "Uppfært",
      "lbl_address": "Ekkert valið",
      "row_time":{
        "label": "Tími",
        "value": "Núna"
      },
      "row_service":{
        "label": "Þjónusta",
        "value": "Venjuleg"
      },
      "state_map":{
        "complete": "Lokið",
        "waiting": "Bið",
        "active": "Vinnslu"
      },
      "feedback_states":{
        "request": "Biðja um bíll",
        "assigned": "Pöntun mótekinn",
        "accepted": "Erum á leiðinni",
        "arrived": "Erum komin fyrir utan",
        "complete": "Áfangastaður"
      }
    }
  }
};
window.lang_support = {};
window.lang_support["en"] = lang_en;
window.lang_support["is"] = lang_is;
