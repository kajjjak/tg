// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var passport = require('passport');
var flash    = require('connect-flash');
var path 	 = require('path');
var auth   = require('./config/auth');
var helmet = require('helmet');

var port = global._cfgv.srvport;


if(true){ // get the debug data
  var fs = require('fs');
  var log = function(msg1, msg2, msg3, msg4, msg5) {
    if(typeof(msg1) == "object"){ msg1 = JSON.stringify(msg1); }else{ msg1 = msg1 || ""; }
    if(typeof(msg2) == "object"){ msg2 = JSON.stringify(msg2); }else{ msg2 = msg2 || ""; }
    if(typeof(msg3) == "object"){ msg3 = JSON.stringify(msg3); }else{ msg3 = msg3 || ""; }
    if(typeof(msg4) == "object"){ msg4 = JSON.stringify(msg4); }else{ msg4 = msg4 || ""; }
    if(typeof(msg5) == "object"){ msg5 = JSON.stringify(msg5); }else{ msg5 = msg5 || ""; }
    var msg = msg1 + " " + msg2 + " " + msg3 + " " + msg4 + " " + msg5;
    //fs.appendFileSync('/home/agame/webapps/defensemap/console.log', msg + '\n');
  };
  console.log = log;
  console.error = log;
}

function addHeaders(req, res, next){
  //http://stackoverflow.com/questions/18722515/how-to-send-http-headers-to-static-directory-in-connect-node-js
  //res.setHeader("X-Frame-Options", "GOFORIT");
  res.header("Access-Control-Allow-Origin", "*"); //, "null");
  //res.header("Access-Control-Allow-Credentials", 'true')
  next();
}

require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {

	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms
  
  app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs'); // set up ejs for templating

	// required for passport
	app.use(express.session({ secret: 'fdfvcfe2ecf25tgrhwddrg' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session
  
  app.use(addHeaders);

  //app.use(helmet.frameguard('allow-from', 'https://apps.facebook.com'));
	app.use(express.static(path.join(__dirname, '/public')));
  
});

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(global._cfgv.srvport);
console.log('The magic happens on port ' + global._cfgv.srvport);



/*


{
   "_id": "_design/list",
   "language": "javascript",
   "views": {
       "stream": {
           "map": "function(doc) {\n  for (var i in doc.stream){emit(i, doc);}\n}"
       },
       "userid": {
           "map": "function(doc) {if (doc.auth){if (doc.auth.local){emit(doc.auth.local.id, doc);}if (doc.auth.facebook){emit(doc.auth.facebook.id, doc);}if (doc.auth.googleplus){emit(doc.auth.googleplus.id, doc);}if (doc.auth.twitter){emit(doc.auth.twitter.id, doc);}}}"
       },
       "invite": {
           "map": "function(doc) {\nif(doc.feeds){\nfor (var f in doc.feeds){\nvar usrfeed = doc.feeds[f];\nfor (var a in usrfeed.email){\nvar e = usrfeed.email[a];if(e){\nif(e.send == true && e.address){\nemit(e.address, \n{stream:f,name:doc.feeds[f].name,email:a, attempt:e.attempt, send:e.send, source:doc.username, user_id: doc._id\n}\n);\n\n}}}}}}"
       }
   }
}



*/