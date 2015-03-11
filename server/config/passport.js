
//http://scotch.io/tutorials/javascript/easy-node-authentication-facebook

// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;
// https://www.npmjs.org/package/passport-facebook-canvas
var nano = require('nano')(global._cfgv.dbserver);
var crypto = require('crypto');
http = require('http');

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

function getUser(email, password, callback_result){
    var db = nano.db.use(global._cfgv.dbname);
    var doc_id = crypto.createHash('md5').update(email+"-"+password).digest('hex');
    console.log("fetching document id " + doc_id);

    db.get(doc_id, function(err, body){
        if(err){
            callback_result(null);            
        }else{
            callback_result(body);
        }
    });
}

/* Taken from routes.js */
function validateMemberData(data){
    data.role = null;
    data.doctype = "user";
    if(data.group == "driver"){  data.role = {"driver": 1, "router": 0, "config": 0, "member": 0};}
    if(data.group == "router"){  data.role = {"driver": 0, "router": 1, "config": 1, "member": 1};}
    if(data.group == "manager"){ data.role = {"driver": 0, "router": 1, "config": 1, "member": 1};}
    if(data.group == "admin"){ data.role = {"driver": 0, "router": 0, "config": 1, "member": 1};}
    if(!data.role){ throw "Member group was invalid. Must be one of these: driver, router, manager or admin";}
    data.created = parseInt(data.created);
    if(!data.name.length){ throw "Member must have a name"; }
    if(!data.email.length){ throw "Member must have a email"; }
    return data;
}

function handleException(err, done){
    /* The idea here is a function that will always store all the errors we encounter (grouped into a day) */

    function doubleTime(d){
        if (d < 10){ return "0"+d; }
        return d;
    }
    var doc = {};
    var today = new Date();
    doc[new Date().getTime()] = err;
    setDocument("dberrors-" + today.getFullYear() + doubleTime(today.getUTCMonth()+1) + "" + doubleTime(today.getDate()), doc, function(){
        if(done){return done(err);}
    }, function(){
        if(done){return done(err);}
    });
}

function addUser (doc_id, doc, done){
    /* set the document defaults */
    var db = nano.db.use(global._cfgv.dbname);
    console.log("creating document id " + doc_id);
    db.insert(doc, doc_id, function(err, body){
        doc.created = new Date().getTime();
        doc.group = "admin";
        doc.name = doc.email = doc.auth.local.username;
        doc = validateMemberData(doc)
        doc.company_id = "tgc-"+doc_id;
        
        if(err){
            handleException(err);
            setDocument(doc_id, doc, function(d){
                return done(d);
            }, function(d){
                return done(d);
            });
        }else{
            doc._id = doc_id;
            console.info("Ok got this " + JSON.stringify(doc));
            return done(null, doc);
        }
    });    
}

function setUser (doc_id, doc, done){
    /* set the document defaults */
    var db = nano.db.use(global._cfgv.dbname);
    console.log("storing document id " + doc_id);
/*    doc.hash = doc_id;
    db.save(doc, doc_id, function(err, body){
        if(err){
            console.info(JSON.stringify(err));
            //return done(err);
            throw err;
            
        }else{
            return done(null, doc);
        }
    });    
*/}

function getUserById(username, callback_result){
    var url = global._cfgv.dbpath + "_design/list/_view/userid?key=%22"+username+"%22";
    console.info(url)
    console.info(url)
    http.get(url, function(res) {
        var _callback_result = callback_result;
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            var resp = JSON.parse(body);
            _callback_result(resp.rows);
        });
    }).on('error', function(e) {
          console.log("Got error: ", e);
    });
}

function setDocument(id, obj, success, failure){
    var db = nano.db.use(global._cfgv.dbname);
    
    db.get(id, function(err, doc){
        if(err){failure(err);
        }else{
            for (var key in obj) { doc[key] = obj[key]; }
            try{
                db.insert(doc, id, function(err, changed_doc){
                    if(err){failure(err);}
                    else{success(changed_doc);}
                });
            }catch(e){
                failure({code: 66661, message: "could not do update"});
            }                
        }
    }); 
    
}

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        //done(null, user.id);
        //console.log("----->>>>-----" + JSON.stringify(user));
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(doc, done) {
        /*User.findById(id, function(err, user) {
            done(err, user);
        });
        */
        //console.log("-----<<<<-----" + JSON.stringify(doc));
        return done(null, doc);
        /*
        var db = nano.db.use(global._cfgv.dbname);
        db.get(doc._id, {
            success:function(body){
                return done(null, body);
            },failure:function(){
                return done(true, null);
            }
        });
        */
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done){
        // asynchronous
        process.nextTick(function(){
            getUserById(email, function(rows){
                rows = rows || [];
                if(rows.length){
                    user = rows[0].value;
                    if(user.auth.local.password == crypto.createHash('md5').update(password).digest('hex')){
                        return done(null, user); //, req.flash('loginMessage', 'Ok'));
                    }
                    return done(null, false, req.flash('loginMessage', 'Wrong password.'));
                }else{
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                }
            });
        });

    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {

        // asynchronous
        process.nextTick(function() {
            // check if the user is already logged ina
            if (!req.user) {
                // check to see if theres already a user with that email
                getUserById(email, function(users){
                    users = users || [];
                    if(users.length){
                        return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                    }else{
                        //create the new user
                        var doc_id = crypto.createHash('md5').update(email).digest('hex');
                        addUser(doc_id, {
                            auth:{
                                local: {
                                    id: email,
                                    username: email,
                                    password: crypto.createHash('md5').update(password).digest('hex')
                                }
                            }
                        }, done);
                    }
                });

                /*
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return
                         done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // create the user
                        var newUser            = new User();

                        newUser.local.email    = email;
                        newUser.local.password = newUser.generateHash(password);

                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            return done(null, newUser);
                        });
                    }
                });
                */
            } else {

                var user            = req.user;
                //user.local.email    = email;
                user.local.password = user.generateHash(password);
                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });

            }
        });

    }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {
        console.info("Token: " + token + " refreshToken " + refreshToken);
        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {
                getUserById(profile.id, function(users){
                    var user = {};
                    if((users) && (users.length)){
                        //console.info("----" + JSON.stringify(users));
                        user = users[0].value;
                        if(!user.auth){ user.auth = {}; }
                        if(!user.auth.facebook){ user.auth.facebook = {}; }
                        if (profile){
                            user.auth.facebook.id    = profile.id;
                            user.auth.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                            user.auth.facebook.email = profile.emails[0].value;                        
                        }
                        user.auth.facebook.token = token;                        
                        return done(null, user);
                    }
                    console.log("creating / updating facebook user");
                    if(!user.auth){ user.auth = {}; }
                    if(!user.auth.facebook){ user.auth.facebook = {}; }
                    user.auth.facebook.id = profile.id;
                    user.auth.facebook.token = token;
                    user.auth.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                    user.auth.facebook.email = profile.emails[0].value;
                    var doc_id = crypto.createHash('md5').update(user.auth.facebook.email + user.auth.facebook.id).digest('hex');
                    addUser(doc_id, user, done);
                });

                /*
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.facebook.token) {
                            user.facebook.token = token;
                            user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                            user.facebook.email = profile.emails[0].value;

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser            = new User();

                        newUser.facebook.id    = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email = profile.emails[0].value;

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
                */

            } else {

               /*
                // user already exists and is logged in, we have to link accounts
                var user            = {"facebook": {}}; // pull the user out of the session OR defaults
                if (req.user.auth){
                    
                    user = req.user.auth.value || req.user;
                    
                    console.info("******  101" + JSON.stringify(user));

                    if (!user.facebook){ user["facebook"] = {}; }
                    if (profile){
                        user.facebook.id    = profile.id;
                        user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        user.facebook.email = profile.emails[0].value;                        
                    }
                    user.facebook.token = token;
                    
                    var err = setUser(user._id, user, done);
                    if (err)
                        throw err; 
                    return done(null, user);                                                    

                }else{
                   if(req.user.facebook){ //we have facebook auth, lets use it to get our clients state
                        getUserById(req.user.facebook.id, function(users){
                            var user = {};
                            if((users) && (users.length)){
                                user = users[0].value;
                                if (profile){
                                    user.facebook.id    = profile.id;
                                    user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                                    user.facebook.email = profile.emails[0].value;                        
                                }
                                user.facebook.token = token;

                                if(user.auth.facebook.token){
                                    console.log("found facebook user " + JSON.stringify(user._id));
                                    return done(null, user);
                                }
                            }else{
                                user = req.user;
                                if ((!profile) || (!user.facebook)){ throw "Authentication failed profile was null: " + JSON.stringify(req.user.auth); }
                                user.facebook.id    = profile.id;
                                user.facebook.token = token;
                                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                                user.facebook.email = profile.emails[0].value;
                            }
                            var err = setUser(user._id, user, done);
                            if (err)
                                throw err; 
                            return done(null, user);                                                    

                        });

                   } 
                }
               */

                // user already exists and is logged in, we have to link accounts
                var user            = {"facebook": {}}; // pull the user out of the session OR defaults
                if (req.user.auth){
                    
                    user = req.user.auth.value || req.user;
                    if (!user.auth){ user.auth = {}; }
                    if (!user.auth.facebook){ user.auth["facebook"] = {}; }
                    if (profile){
                        user.auth.facebook.id    = profile.id;
                        user.auth.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        user.auth.facebook.email = profile.emails[0].value;                        
                    }
                    user.auth.facebook.token = token;
                    
                    var err = setUser(user._id, user, done);
                    if (err)
                        throw err; 
                    return done(null, user);                                                    

                }else{
                   if(req.user.facebook){ //we have facebook auth, lets use it to get our clients state
                        getUserById(req.user.facebook.id, function(users){
                            var user = {};
                            if((users) && (users.length)){
                                user = users[0].value;
                            }else{
                                user = req.user;
                            }
                            if ((!profile) || (!user.facebook)){ throw "Authentication failed profile was null: " + JSON.stringify(req.user.auth); }
                            user.auth.facebook.id    = profile.id;
                            user.auth.facebook.token = token;
                            user.auth.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                            user.auth.facebook.email = profile.emails[0].value;

                            var err = setUser(user._id, user, done);
                            if (err)
                                throw err; 
                            return done(null, user);                                                    

                        });
                   } 
                }               
            }
        });

    }));

    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({

        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, tokenSecret, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'twitter.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.twitter.token) {
                            user.twitter.token       = token;
                            user.twitter.username    = profile.username;
                            user.twitter.displayName = profile.displayName;

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser                 = new User();

                        newUser.twitter.id          = profile.id;
                        newUser.twitter.token       = token;
                        newUser.twitter.username    = profile.username;
                        newUser.twitter.displayName = profile.displayName;

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user                 = req.user; // pull the user out of the session

                user.twitter.id          = profile.id;
                user.twitter.token       = token;
                user.twitter.username    = profile.username;
                user.twitter.displayName = profile.displayName;

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }

        });

    }));

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'google.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.google.token) {
                            user.google.token = token;
                            user.google.name  = profile.displayName;
                            user.google.email = profile.emails[0].value; // pull the first email

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } else {
                        var newUser          = new User();

                        newUser.google.id    = profile.id;
                        newUser.google.token = token;
                        newUser.google.name  = profile.displayName;
                        newUser.google.email = profile.emails[0].value; // pull the first email

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user               = req.user; // pull the user out of the session

                user.google.id    = profile.id;
                user.google.token = token;
                user.google.name  = profile.displayName;
                user.google.email = profile.emails[0].value; // pull the first email

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });

            }

        });

    }));

};
/*

////// COMMON FUNCTIONS

var https = require("https");
var url = require("url");

getJSON = function(options, onResult, onFailure)
{
    console.log("rest::getJSON");

    var prot = options.port == 443 ? https : http;
    var req = prot.request(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(output);
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        //res.send('error: ' + err.message);
        if(onFailure){
            onFailure(err);
        }
    });

    req.end();
};



*/