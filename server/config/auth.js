//application user:fregieffirdstaryingencen:CJUYrvg7M22CefwKNpuOBrUd@
var header = {
  title: "Taxi gateway", 
  description: "Mobile app for taxi companies. Easy setup and customization", 
  keyword: "mobile, taxi, app, ios, android, custom, phone, smartphone, ", 
  author:"Kjartan Akil Jonsson"
};
_cfgv_liveserverhost = {
  version: "0.1.1a",
  header: header,
  dbport: "http://",
  dbportnr: 80,
  dbhost: "db01.taxigateway.com",
  dbname: "taxigateway",
  dbserver: "http://db01.taxigateway.com", 
  dbpath: "http://db01.taxigateway.com/taxigateway/",
  srvportname: "http://",
  srvport: 8000 || process.env.PORT,
  srvdomain: "taxigateway.com", 
  srvhost: "http://taxigateway.com",
  srvfacebook: "https://apps.facebook.com/taxigateway/",
  social_facebook_appid: '382258661957064',
  social_facebook_secret: 'd7fda2dde02362004894cebc10bc1e8e',
  social_facebook_page: 'https://apps.facebook.com/taxigateway' //used after login redirect
};

/*_cfgv_liveserverhost = {
  header: header,
  dbport: "https://",
  dbportnr: 443,
  dbhost: "taxigateway.cloudant.com/",
  dbname: "taxigateway",
  dbserver: "https://taxigateway.cloudant.com/", 
  dbpath: "https://taxigateway.cloudant.com/taxigateway/",
  srvportname: "https://",
  srvport: 8000 || process.env.PORT,
  srvdomain: "taxigateway.com", 
  srvhost: "http://taxigateway.com",
  srvfacebook: "https://apps.facebook.com/taxigateway/",
  social_facebook_appid: '382258661957064',
  social_facebook_secret: 'd7fda2dde02362004894cebc10bc1e8e',
  social_facebook_page: 'https://apps.facebook.com/taxigateway' //used after login redirect
};*/

_cfgv_testserverhost = {
  version: "0.1.1a-test",
  header: header,
  dbport: "http://",
  dbportnr: 80,
  dbhost: "db00.taxigateway.com",
  dbname: "taxigateway",
  dbserver: "http://db00.taxigateway.com", 
  dbpath: "http://db00.taxigateway.com/taxigateway/",
  srvportname: "http://",
  srvport: 8000 || process.env.PORT,
  srvdomain: "taxigateway.com", 
  srvhost: "http://taxigateway.com",
  srvfacebook: "http://apps.facebook.com/taxigateway/",
  social_facebook_appid: '382258661957064', //test one
  social_facebook_secret: 'd7fda2dde02362004894cebc10bc1e8e', //test one
  social_facebook_page: 'https://apps.facebook.com/taxigateway'  //used after login redirect
};

_cfgv_testlocalhost = {
  version: "0.1.1a-test",
  header: header,
  dbport: "http://",
  dbportnr: 80,
  dbhost: "db00.taxigateway.com", //54.249.245.7
  dbname: "taxigateway",
  dbserver: "http://db00.taxigateway.com",
  dbpath: "http://db00.taxigateway.com/taxigateway/",
  srvportname: "http://",
  srvport: 8000,
  srvdomain: "localhost:8000",//"urbanbattleground.com", 
  srvhost: "http://localhost:8000",
  srvfacebook: "https://apps.facebook.com/taxigateway/",  
  social_facebook_appid: '382258661957064',
  social_facebook_secret: 'd7fda2dde02362004894cebc10bc1e8e',
  social_facebook_page: "http://localhost:8000/",  //used after login redirect
};

//IMPORTANT: ALSO UPDATE INDEX.HTML
global._cfgv = _cfgv_liveserverhost;



// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: global._cfgv.social_facebook_appid, // your App ID
		'clientSecret' 	: global._cfgv.social_facebook_secret, // your App Secret
		'callbackURL' 	: global._cfgv.srvhost + '/auth/facebook/callback'// 'http://localhost:8080/auth/facebook/callback' //'https://defensemap.com/auth/facebook/callback'
	},

	'twitterAuth' : {
		'consumerKey' 		: 'your-consumer-key-here',
		'consumerSecret' 	: 'your-client-secret-here',
		'callbackURL' 		: global._cfgv.srvhost + 'auth/twitter/callback' // .../auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: 'your-secret-clientID-here',
		'clientSecret' 	: 'your-client-secret-here',
		'callbackURL' 	:  global._cfgv.srvhost + 'auth/google/callback' // ...auth/google/callback'
	}

};