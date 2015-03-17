//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation

var default_config = {
  "map":{
    "position": [64.1353379, -21.89521],
    "zoom": 16
  },
  "database":{
    "name": "tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57",
    "host": "http://db01.taxigateway.com/"
  },
  "serverapi":{
    "host": "http://localhost:8000/" //"http://db01.taxigateway.com/"
  },  
  "client":{
    "number":"+3548958283"
  },
  "locale":{
    "datetime": "en-IS"
  },
  "service": {
    "vehicles": {
      "1":{ "type": "vehicles", "title": "Small", "summary": "Cheapest available vehicle", "id": 1 },
      "2":{ "type": "vehicles", "title": "Regular", "summary": "Regular service", "id": 2 },
      "3":{ "type": "vehicles", "title": "Large", "summary": "Large vehicle +7", "id": 3 }
    },
    "options": {
      "1": { "type": "services", "title": "Baby chair", "summary": "If available a chair will be provided", "id": 1 }
    },
    "defaults":{
      "vehicles": "2"
    }
  },
  "language": "is",
  "internationalization": {
    "en":{"id":"en", "title": "English"},
    "is":{"id":"is", "title": "Íslensku"},
  },
  "setup":{
    "driver":{
      "position": false
    }
  }
};



window.config = default_config;


function getCompanyDatabasePath(){
  return window.config.database.host + window.config.database.name;
}

function getServerAPIPath(){
  return window.config.serverapi.host;
}

function getMediaSourceURL(){
  return "media/";
}