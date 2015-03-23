
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