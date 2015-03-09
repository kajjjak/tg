_cfgv_liveserverhost = {
  dbport: "http://",
  dbportnr: 80,
  dbhost: "db00.taxigateway.com",
  dbname: "taxigateway_test1",
  dbserver: "http://db00.taxigateway.com", 
  dbpath: "https://db00.taxigateway.com/taxigateway_test1/",
  srvportname: "https://",
  srvport: 25774 || process.env.PORT,
  srvdomain: "taxigateway.com", 
  srvhost: "https://taxigateway.com",
  srvfacebook: "https://apps.facebook.com/taxigateway/",
  social_facebook_appid: '248418481997473',
  social_facebook_secret: '89991ddf91fe7e8576817c0a45b6aed3',
  social_facebook_page: 'https://apps.facebook.com/taxigateway' //used after login redirect
};

_cfgv_testserverhost = {
  dbport: "https://",
  dbportnr: 443,
  dbhost: "db00.taxigateway.com",
  dbname: "taxigateway_test1",
  dbserver: "http://db00.taxigateway.com", 
  dbpath: "https://db00.taxigateway.com/taxigateway_test1/",
  srvportname: "https://",
  srvport: 29078 || process.env.PORT,
  srvdomain: "taxigateway.com", 
  srvhost: "https://taxigateway.com",
  srvfacebook: "https://apps.facebook.com/taxigateway/",
  social_facebook_appid: '', //test one
  social_facebook_secret: '', //test one
  social_facebook_page: 'https://apps.facebook.com/taxigateway'  //used after login redirect
};

_cfgv_testlocalhost = {
  header: {title: "Taxi gateway", description: "Gateway to manage the taxi mobile apps", keyword: "mobile, taxi, app, ios, android", author:"Kjartan Akil Jonsson"},
  dbport: "http://",
  dbportnr: 80,
  dbhost: "db00.taxigateway.com", //54.249.245.7
  dbname: "taxigateway_test1",
  dbserver: "http://db00.taxigateway.com",
  dbpath: "http://db00.taxigateway.com/taxigateway_test1/",
  srvportname: "http://",
  srvport: 8000,
  srvdomain: "localhost:8000",//"urbanbattleground.com", 
  srvhost: "http://localhost:8000",
  srvfacebook: "https://apps.facebook.com/taxigateway/",  
  social_facebook_appid: '248418481997473',
  social_facebook_secret: '89991ddf91fe7e8576817c0a45b6aed3',
  social_facebook_page: "http://localhost:8000/",  //used after login redirect
};

//IMPORTANT: ALSO UPDATE INDEX.HTML
global._cfgv = _cfgv_testserverhost;



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