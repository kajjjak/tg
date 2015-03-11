//application user:fregieffirdstaryingencen:CJUYrvg7M22CefwKNpuOBrUd@

_cfgv_liveserverhost = {
  header: {title: "Taxi gateway", description: "Gateway to manage the taxi mobile apps", keyword: "mobile, taxi, app, ios, android", author:"Kjartan Akil Jonsson"},
  dbport: "http://",
  dbportnr: 80,
  dbhost: "db01.taxigateway.com",
  dbname: "taxigateway_test1",
  dbserver: "http://db01.taxigateway.com", 
  dbpath: "http://db01.taxigateway.com/taxigateway_test1/",
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
  header: {title: "Taxi gateway", description: "Gateway to manage the taxi mobile apps", keyword: "mobile, taxi, app, ios, android", author:"Kjartan Akil Jonsson"},
  dbport: "https://",
  dbportnr: 443,
  dbhost: "taxigateway.cloudant.com/",
  dbname: "taxigateway_test1",
  dbserver: "https://taxigateway.cloudant.com/", 
  dbpath: "https://taxigateway.cloudant.com/taxigateway_test1/",
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
  header: {title: "Taxi gateway", description: "Gateway to manage the taxi mobile apps", keyword: "mobile, taxi, app, ios, android", author:"Kjartan Akil Jonsson"},
  dbport: "http://",
  dbportnr: 80,
  dbhost: "db00.taxigateway.com",
  dbname: "taxigateway_test1",
  dbserver: "http://db00.taxigateway.com", 
  dbpath: "http://db00.taxigateway.com/taxigateway_test1/",
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