
var http = require("http");
var https = require("https");
var url = require("url");
var crypto = require('crypto');

// FAKE PROFILE FOR DEVELOPEMBT {role:{router:3,member:3, report:3, config:3}, company_id:"tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57", company:{location:[64.13856919460817,-21.908959150314328]}, auth:{local:{username:""}}}, //req.user,
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
        	try{
            	var obj = JSON.parse(output);
            }catch(e){
            	var msg = "Parsing failed: " + output + ". Got error: " + JSON.stringify(e);
            	console.log(msg)
				if(onFailure){
		        	onFailure(msg);
		        }
		        return;            	
            }
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

getText = function(options, onResult, onFailure)
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
            var obj = output;
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

module.exports = function(app, passport) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        //res.render('index.ejs');
        res.sendfile('public/about.html');
    });
    app.get('/faq.html', function(req, res) {
        //res.render('index.ejs');
        res.sendfile('public/faq.html');
    });
	app.get('/authenticate', function(req, res) {
		res.render('authenticate.ejs');
	});

	app.get('/authenticated', isLoggedIn, function(req, res) {
        /* THE OLD CODE BELLOW DOES NOT FETCH NEWEST DOCUMENT IF WE ARE DOING A REFRESH
		res.render('authenticated.ejs', {
			user : req.user,
			app_social_facebook_appid: global._cfgv.social_facebook_appid,
			redirect_url: global._cfgv.social_facebook_page
		});
        */
        //new code FETCH THE NEWEST DOCUMENT
        var user_id = req.user._id;
        getDocument(user_id, function(doc){
            res.render('authenticated.ejs', {
                user : doc,
                app_social_facebook_appid: global._cfgv.social_facebook_appid,
                redirect_url: global._cfgv.social_facebook_page
            });
        }, function(err){
            res.send(err);
        });

	});

	// CONTENT SECTION =========================

    function getCommonVars(req){
        var params = global._cfgv
        params["user"] = req.user;
        params["user"] = {role:{router:3,member:3, report:3, config:3}, company_id:"tgc-e6ed05461250df994aa26e7c2d58b82a", company:{location:[64.13856919460817,-21.908959150314328]}, auth:{local:{username:""}}}, //req.user;
        //if(!params["user"]){ params["user"] = {};}
        //if(!params["user"]["role"]){ params["user"]["role"] = {};}
        params["app_social_facebook_appid"] = global._cfgv.social_facebook_appid;
        return params;
    }

    app.get('/index.html', isLoggedIn, function(req, res) {
        var params = getCommonVars(req);
        res.render('page_dashboard.ejs', params);
    });

    app.get('/pickups.html', isLoggedIn, function(req, res) {
        var params = getCommonVars(req);
        res.render('page_map.ejs', params);
    }); 

    app.get('/setup.html', isLoggedIn, function(req, res) {
        var params = getCommonVars(req);
        res.render('page_setup.ejs', params);
    });

    app.get('/notify.html', isLoggedIn, function(req, res) {
        var params = getCommonVars(req);
        res.render('page_notify.ejs', params);
    });

    // APP CONFIGURATION SECTION =========================

    app.get('/mobileinfo.html', isLoggedIn, function(req, res) {
        var params = getCommonVars(req);
        res.render('page_mobileinfo.ejs', params);            
    });

    app.get('/mobileconf.html', isLoggedIn, function(req, res) {
        var params = getCommonVars(req);
        res.render('page_mobileconf.ejs', params);            
    });

    app.get('/mobilelang.html', isLoggedIn, function(req, res) {
        var params = getCommonVars(req);
        res.render('page_mobilelang.ejs', params);            
    });

    app.get('/mobilestyle.html', isLoggedIn, function(req, res) {
        var params = getCommonVars(req);
        res.render('page_mobilestyle.ejs', params);            
    });

    app.get('/mobileapply.html', isLoggedIn, function(req, res) {
        var params = getCommonVars(req);
        res.render('page_mobileapply.ejs', params);            
    });

    // PAYMENTS SECTION =========================

    app.get('/payments.html', isLoggedIn, function(req, res) {
        var params = getCommonVars(req);
        res.render('page_billing.ejs', params);
    });
    
    app.get('/billing/paypal/page/:payment_type/:payment_action', isLoggedIn, function(req, res) {

        var type = req.params.payment_type;
        var action = req.params.payment_action;
        var params = getCommonVars(req);
        if(!params.user.role.payment){
            res.send({"error": "Role manager required"});
            return;
        }        
        if(((type == "instalment") || (type == "subscription")) && (action == "confirmed")){
            //OK we may be getting payment from our prospect, lets open the system up
            var dict = {"payment": {}};
            dict["payment"][type] = {"prospect": new Date().getTime()};
            params.payment = dict["payment"];
            setDocument(params.user.company_id, dict, function(d){
                res.render('page_billing_action.ejs', params);
            }, function(e){
                res.render('page_billing_action.ejs', params);
            });
        }else{
            res.render('page_billing_action.ejs', params);
        }
    });

    // STATISTICS SECTION =========================
    
    app.get('/areastats.html', isLoggedIn, function(req, res) {
        var params = getCommonVars(req);
        if(!params.user.role.report){
            res.send({"error": "Role report required"});
            return;
        }                
        res.render('page_areastats.ejs', params);
    });

    // PROFILE SECTION =========================
    
    app.get('/users.html', isLoggedIn, function(req, res) {
        var params = getCommonVars(req);
        if(!params.user.role.member){
            res.send({"error": "Role member required"});
            return;
        }                
        res.render('page_users.ejs', params);
    });

    app.get('/profile', isLoggedIn, function(req, res) {
        var params = getCommonVars(req);
        res.render('page_profile.ejs', params);
    });

	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/authenticate');
	});

/*
	// show the signup form
	// https://developers.facebook.com/docs/opengraph/creating-custom-stories/#objecttypes
	//https://developers.facebook.com/docs/sharing/reference/feed-dialog
	app.get('/social/:share_id', function(req, res) {	
		var nano = require('nano')(global._cfgv.dbserver);
		var db = nano.db.use(global._cfgv.dbname);
		var id = req.params.share_id;
    	db.get(id, function(err, doc){
    		//TODO: check if this is shared to facebook before updating
			var d = {};
			d["id"] = id;
			d["media_type"] = "og:image";
			d["media_url"] = doc.files[0].url;
			if(doc.files[0].type.indexOf("video") == 0){
				d["media_type"] = "og:video";
			}
			d["subject"] = doc.subject;
			d["description"] = doc.note;
    		res.render('social.ejs', d);
    	});
	});*/

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

	// locally --------------------------------
		// LOGIN ===============================
		// show the login form
		app.get('/login', function(req, res) {
            var params = getCommonVars(req);
            params["message"] = req.flash('loginMessage');
			res.render('login.ejs', params);
		});

		// process the login form
		app.post('/login', passport.authenticate('local-login', {
			successRedirect : '/authenticated', // redirect to the secure profile section
			failureRedirect : '/login', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

		// SIGNUP =================================
		// show the signup form
		app.get('/signup', function(req, res) {
            var params = getCommonVars(req);
            params["message"] = req.flash('loginMessage');
			res.render('signup.ejs', params);
		});

		// SIGNUP =================================
		// process the signup form
		app.post('/signup', passport.authenticate('local-signup', {
			successRedirect : '/authenticated', // redirect to the secure profile section
			failureRedirect : '/signup', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

		// handle the callback after facebook has authenticated the user
		app.get('/auth/facebook/callback',
			passport.authenticate('facebook', {
				successRedirect : '/authenticated',
				failureRedirect : '/authenticate'
			}));

	// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

		// handle the callback after twitter has authenticated the user
		app.get('/auth/twitter/callback',
			passport.authenticate('twitter', {
				successRedirect : '/authenticated',
				failureRedirect : '/authenticate'
			}));


	// google ---------------------------------

		// send to google to do the authentication
		app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

		// the callback after google has authenticated the user
		app.get('/auth/google/callback',
			passport.authenticate('google', {
				successRedirect : '/authenticated',
				failureRedirect : '/authenticate'
			}));


	// application specific responses

    function buildReportUsage(rows){
        var row, report = {"usage": {}, "location":{"pickup":[]}};
        for(var i in rows){
            row = rows[i].value;
            //get date
            dtms = row.driver.complete_ts || row.client.complete_ts || row.client.canceled_ts || row.driver.canceled_ts;
            if(dtms){
                dtmo = new Date(dtms);
                monthdate = dtmo.getFullYear() + "-" + doubleTimeValue(dtmo.getMonth()) + "-" + doubleTimeValue(dtmo.getDate());
                //total count
                if(!report["usage"][monthdate]){report["usage"][monthdate] = {"total":0, "calls": 0, "request": 0, "canceled": 0};}
                report["usage"][monthdate]["total"] = report["usage"][monthdate]["total"] + 1;
                //calls
                if(row.author == "router"){
                    report["usage"][monthdate]["calls"] = report["usage"][monthdate]["calls"] + 1;
                }
                //request
                if(row.author == "client"){
                    report["usage"][monthdate]["request"] = report["usage"][monthdate]["request"] + 1;
                }
                //canceled
                if(row.client.canceled_ts || row.driver.canceled_ts){
                    report["usage"][monthdate]["canceled"] = report["usage"][monthdate]["canceled"] + 1;                
                }
            }
            if(row.location){
                report["location"]["pickup"].push([row.location["lat"], row.location["lng"]]);
            }
        }
        return report;
    }

    app.post('/api/geocode/address/:provider', /*isLoggedInAPI, */function(req, res){
        getGeocodeForward(req.body, function(result){
            res.send(result);
        }, function(err){
            res.send(err);
        }, {service: req.params.provider}); //mapquest
    });

    app.get('/api/geocode/reverse/:lat/:lng/:provider', function(req, res){
        var lat = req.params.lat;
        var lng = req.params.lng;
        getGeocodeReverse(lat,lng, function(result){
            res.send(result);
        }, function(err){
            res.send(err);
        }, {service: req.params.provider}); //mapquest
    });

    app.get('/api/client/', isLoggedInAPI, function(req, res) { //
        var company_id = req.user.company_id;
        getDocument(company_id, function(doc){
            res.send(doc);
        }, function(e){
            res.send({"error": e});
        });
    });

    // company / app related stuff

    app.post('/api/company/configure', isLoggedInAPI, function(req, res) { //
        var body = req.body; 
        var company_id = getCompanyDatabase(req, body)
        var nano_full = getNanoSecure();
        nano_full.db.replicate('tgc-template', company_id, {
            create_target: true
        }, function(err, body) {
            if (err) {
                res.send(err);
            }else{
                res.send({success: true, details: body});
            }
        });
        //var template_database = "tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57";
    });

    app.post('/api/company/configure/dbuser', isLoggedInAPI, function(req, res){

        var user =  {
          "_id":"_security",
          "cloudant":{}
        }
        var access = ["_reader", "_writer"];
        var company_id = getCompanyDatabase(req, req.body);
        //https://<username>.cloudant.com/_api/v2/db/<dbname>/_security
        var request = require('request');
        request.post(
            'http://taxigateway.cloudant.com/_api/v2/api_keys', {
            'json': true

        }, function(status, result) {
            //console.info(JSON.stringify(result))
            var body = result.body;
            user["cloudant"][body.key] = access;
            var created_user = {name: body.key, passw: body.password};
            request.put(
                'http://taxigateway.cloudant.com/_api/v2/db/'+company_id+'/_security', {
                'json': true,
                'body': user,

            }, function(status, body) {
                    setDocument(company_id, {"access": created_user}, function(doc){
                        res.send({success: true});
                    });
                }, function(err){
                    res.send({"response": err, "success":false, "host": global._cfgv.dbhost});
            }).auth("taxigateway", "alicia.123", false);

            }, function(err){
                res.send({"response": err, "success":false, "host": global._cfgv.dbhost});
        }).auth("taxigateway", "alicia.123", false);        
    });

    app.post('/api/company/information', isLoggedInAPI, function(req, res) { //
        var body = req.body; //{"company_id": "tgc-j3ljlsjfl3l"}//req.body;
        var company_id = getCompanyDatabase(req, body)
        setDocument(company_id, {"registration": body}, function(doc){
            //then save this id to the user
            req.user.company_id = company_id;
            setDocument(req.user._id, {"company_id": company_id}, function(doc){ 
                res.send(doc);
            }, function(e){res.send({"error": e});});
        }, function(e){res.send({"error": e});});
    });

    app.post('/api/client/mobile/info', isLoggedInAPI, function(req, res) { //
        var company_id = req.user.company_id;
        var info = req.body;
        if(!req.user.role.config){
            res.send({"error": "Role config required"});
            return;
        }
        if((!info.name.length) || (!info.description.length) || (!info.keywords.length) || (!info.icon.length)){
            res.send({"error": "Fields can not be empty"});
            return;
        }
        setDocument(company_id, {"app_details": info, "changed": new Date().getTime()}, function(d){
            res.send({success:true});
        }, function(e){
            res.send({"error": e});
        });
    });    
    app.get('/api/client/mobile/config/edit', isLoggedInAPI, function(req, res) {
        var params = getCommonVars(req);
        // fetch defaults
        getDocument("mobile_configuration", function(doc_config){
            // fetch company config
            var doc_def = doc_config.default;
            getDocument(params.user.company_id + "-edit", function(doc){
                var doc_usr = doc.app_config;
                // merge defaults and company config
                for(var p in doc_def){
                    if(!doc_usr[p]){doc_usr[p] = doc_def[p];} // this top level attribute does not exists lets add it
                    else{
                        if(!doc_usr.changed){
                            for(var j in doc_def[p]){
                                if(!doc_usr[p][j]){doc_usr[p][j] = doc_def[p][j];}
                            }
                        }
                    }
                }
                res.send({"config": doc_usr, "support": doc_config.support});
            },function(e){
                res.send({"config": doc_def, "support": doc_config.support});
            });
        });
    });
    app.post('/api/client/mobile/config/edit', isLoggedInAPI, function(req, res) { //
        /* TODO: BETTER VALIDATION */
        var params = getCommonVars(req);
        var company_id = params.user.company_id;
        var config = JSON.parse(req.body.data);
        if(!params.user.role.config){
            res.send({"error": "Role config required"});
            return;
        }
        /* These are set by default settings in document mobile_configuration so we can add features without having to restart server
        config.internationalization = {
            "en":{"id":"en", "title": "English"},
            "is":{"id":"is", "title": "Íslensku"}
        },
        config.database = {
            "name": company_id,
            "host": "http://db01.taxigateway.com/"
        };
        config.serverapi = {"host": "http://taxigateway.com/"};
        config.setup = {driver:{"position": false}}
        */
        config.changed = new Date().getTime();
        //THIS IS SET BY DEVELOPER config.updated = new Date().getTime();
        //config.deployed = new Date().getTime();
        if(!config.internationalization[config.language]){
            res.send({"error": "Selected language was not supported"});
            return;
        }
        if(!config.service.vehicles[config.service.defaults.vehicles]){
            res.send({"error": "Default vehicles not found"});
            return;
        }
        if((!config.client.number.length) || (!config.locale.datetime.length) || (!config.map.position.length) || (!config.map.zoom)){
            res.send({"error": "Fields can not be empty"});
            return;
        }        
        setDocument(company_id + "-edit", {"app_config": config}, function(d){
            res.send({success:true});
        }, function(e){
            res.send({"error": e});
        });
    });
    app.get('/api/client/mobile/lang', isLoggedInAPI, function(req, res) {
        var params = getCommonVars(req);
        // fetch defaults
        getDocument("mobile_languages", function(doc_config){
            // fetch company config
            var doc_def = doc_config.languages;
            getDocument(params.user.company_id + "-lang", function(doc){
                var doc_usr = doc.languages;
                res.send({"languages": mergeRecursive(doc_usr, doc_def), "description": doc_config.description});
            },function(e){
                res.send({"languages": doc_def, "description": doc_config.description});
            });
        });
    });
    app.post('/api/client/mobile/lang', isLoggedInAPI, function(req, res) {
        var params = getCommonVars(req);
        // fetch defaults
        if(!params.user.role.config){
            res.send({"error": "Role config required"});
            return;
        }
        setDocument(params.user.company_id + "-lang", {"languages": req.body, "changed": new Date().getTime()}, function(result){
            if(result.error){
                res.send(result);
            }else{
                res.send({"success": true});
            }
        });
    });
    app.post('/api/client/notify', isLoggedInAPI, function(req, res) {
        var params = getCommonVars(req);
        var company_id = params.user.company_id;
        // https://taxigateway.cloudant.com/tgc-e6ed05461250df994aa26e7c2d58b82a/_design/list/_view/users
        var envelope = req.body || {};
        var path = "/" + company_id + "/_design/list/_view/users";
        if(!params.user.role.notify){
            res.send({"error": "Role notify required"});
            return;
        }
        getJSON({
            port: 80, //http
            host: global._cfgv.dbhost,
            path: path,
            method:"GET",
            headers:{'Content-Type': 'application/json'}
        }, function(status, body) {
            var apns = [];
            var gcms = [];
            var user = null;
            for(var i in body.rows){
                user = body.rows[i].value;
                if (user.doctype == envelope.exclude){ continue; }
                if(user.notification_apn){ apns.push(user.notification_apn); }
                if(user.notification_gcm){ gcms.push(user.notification_gcm); }
            }
            envelope.token = {"apn": apns, "gcm": gcms};
            envelope.notify = {"published_ts": new Date().getTime()};
            envelope.doctype = "notify";
            var doc_id = JSON.stringify(envelope);
            doc_id = "msg-" + crypto.createHash('md5').update(doc_id).digest('hex');
            console.info("asdf  " + JSON.stringify(envelope))
            setCompanyDocument(company_id, doc_id, envelope, function(doc){
                res.send(envelope);
            }, function(e){ res.send({error: e}); });
        }, function(err){
            res.send({"response": err, "success":false, "path": path, "host": global._cfgv.dbhost});
        });        
    });    
    app.post('/api/client/mobile/version', /*isLoggedInAPI,*/ function(req, res) {
        var params = getCommonVars(req);
        if(!params.user.role.config){
            res.send({"error": "Role config required"});
            return;
        }                 
        if(req.body.action == "deploy"){
            // 1. create a backup of old version
            // 2. save the new version
            // 3. do not check for payment here (only during actual deployment phase because we will show in GUI)
            getDocument(params.user.company_id, function(cdoc){ //check the company document if a payment has been made
                if(!cdoc.payment){ cdoc.payment = {}; }
                if(cdoc.payment.instalment && cdoc.payment.subscription){
                    getDocument(params.user.company_id + "-edit", function(doc){
                        // final validation
                        doc.app_config.database.name = getCompanyDatabase(req);
                        // save to live version
                        setDocument(params.user.company_id, {"app_config": doc.app_config}, function(){
                            res.send({"success": true});
                        },function(e){
                        res.send(e);
                    });
                    },function(e){
                        res.send(e);
                    });
                }else{
                    res.send({"error":"Instalment and subscription commitment required"});
                }
            });
            return;
        }
        if(req.body.action == "preview"){
            var preview_testers = {
                "requested": new Date().getTime(),
                "android": [
                    req.body.email
                ]
            }
            getDocument(params.user.company_id + "-edit", function(doc){
                // final validation
                if(!doc.app_config.database){ doc.app_config.database = {}; }
                doc.app_config.database.name = getCompanyDatabase(req, params.user);
                doc.app_config.changed = new Date().getTime();
                doc.app_config.testers = preview_testers;
                // save to live version
                setDocument(params.user.company_id, {"app_config": doc.app_config}, function(){
                    res.send({"success": true});
                },function(e){
                    res.send(e);
                });
            },function(e){
                getDocument("mobile_configuration", function(doc){
                doc.default.database.name = getCompanyDatabase(req, params.user);
                doc.default.changed = new Date().getTime();
                doc.default.testers = preview_testers;

                // save default config to live version
                setDocument(params.user.company_id, {"app_config": doc.default}, function(){
                    res.send({"success": true});
                },function(e){
                    res.send(e);
                });
                },function(e){
                    res.send(e);
                });
            });
            return;
        }
        res.send({"error": "Nothing to do"});
    });    
    app.get('/api/client/invite/resend', isLoggedInAPI, function(req, res) { //
        var mailto = 'Kjartan Jónsson <mail@kjartanjonsson.com>';
        var mailfrom = 'kjartan@taxigateway.com';
        var subject = 'Ok';
        var content = 'Content';
        sendMail(mailfrom, mailto, subject, content, function(result){
            res.send(result);
        });
    });

    app.get('/api/client/:company_id/report', isLoggedInAPI, function(req, res) { //
        var params = getCommonVars(req);        
        if(!params.user.role.report){
            res.send({"error": "Role report required"});
            return;
        }          
        var company_id = req.params.company_id;
        var path = "/" + company_id + "/_design/jobs/_view/all";
        getJSON({
            port: 80, //http
            host: global._cfgv.dbhost,
            path: path,
            method:"GET",
            headers:{'Content-Type': 'application/json'}
        }, function(status, body) {
            var row, rows = body["rows"];
            res.send(buildReportUsage(rows));
        }, function(err){
            res.send({"response": err, "success":false, "path": path, "host": global._cfgv.dbhost});
        });        
    });


    app.delete('/api/client/:company_id/job', isLoggedInAPI, function(req, res) { //
        var params = getCommonVars(req);
        if(!params.user.role.admin >= 9){
            res.send({"error": "Role config required"});
            return;
        }        
        var company_id = req.params.company_id;
        var path = "/" + company_id + "/_design/list/_view/jobs";
        getJSON({
            port: 80, //http
            host: global._cfgv.dbhost,
            path: path,
            method:"GET",
            headers:{'Content-Type': 'application/json'}
        }, function(status, body) {
            var row, rows = body["rows"];
            bulkRemove(company_id, rows, function(e){
                res.send(e);
            });
        }, function(err){
            res.send({"response": err, "success":false, "path": path, "host": global._cfgv.dbhost});
        });        
    });

    // JOBS states

    app.post('/api/client/:company_id/job', function(req, res) { //
        var job_id = "job-" + getGuid();
        try {
            var data, company_id = req.params.company_id;
            try{
                var data = validateJobData(req.body);
            }catch(e){
                res.send({"error": e});
                return;
            }
            user = req.user || {"role":{}};
            if((!user) && (req.body.author == "router")){
                res.send(403);
                return;
            }
            author = "client";
            if(user.role.router){ author = "router";}
            if(user.role.driver){ author = "driver";}
            var time_now = new Date();
            var job_start = {
                doctype: "job", 
                location: data.location,
                pickup_time: data.pickup_time,
                author: author,
                client: data.client || {},
                driver: data.driver || {},
                notify: {},
                address: data.address,
                client_ts: data.client_ts,
                server_ts: time_now.getTime()
            };
            getCompanyDocument(company_id, job_id, function(){
                res.send({"error": "job exists"});
            }, function(){
                setCompanyDocument(company_id, job_id, job_start, function(d){
                    job_start.id = job_id;
                    res.send({success:true, job: job_start});
                }, function(e){
                    res.send({"error": e});
                });
            });
        }catch(e){
            res.send({"error": e});
            //todo handle error
        }
    });

    function setJobState(res, company_id, job_id, state, state_params, user){
        var data = handleJobState(state, user, state_params);
        if(company_id != user.company_id){ throw "User can only edit their own company state"; }
        setCompanyDocument(company_id, job_id, data, function(d){
            if(state == "assigned"){ //should be ontarget
                console.info("---" + JSON.stringify(state_params.driver_id));
                //try
                /*
                setCompanyDocument(company_id, user._id, {"job_id": job_id, "client_id": d.client.id}, function(){
                    res.send({success:true, result: d, job: data});
                }, function(e){
                    res.send({"error": e, "code": "1501"});
                });
                */
                res.send({success:true, result: d, job: data});
            }else{
                res.send({success:true, result: d, job: data});
            }
            healtyJobState(company_id, d);
        }, function(e){
            res.send({"error": e});
        });        
    }

    app.post('/api/client/:company_id/job/:job_id/:state', function(req, res) { //
        var job_id = req.params.job_id; //req.user._id || body.auth.user_id;
        var company_id = req.params.company_id;
        var access_passkey = req.body.access_passkey;
        if(access_passkey){
            getAccessByPassKey(res, access_passkey, function(user){
                console.info("User " + JSON.stringify(user));
                setJobState(res, company_id, job_id, req.params.state, req.body, user);
            }); 
        }else{
            if((!req.user) && (req.body.author == "router")){
                res.send(403);
            }else{
                setJobState(res, company_id, job_id, req.params.state, req.body, req.user);
            }
        }
    });
    app.post('/api/client/:company_id/mobile/doc', function(req, res) {
        // this is to remove write on specifict docs for client and for future security
        var params = getCommonVars(req);
        var company_id = req.params.company_id;
        var data = req.body;
        // may not create notify documents
        if(data.doctype == "notify"){ throw "Not allowed to create notify document. sorry :( "; }
        if(!data.doc_id){ throw "Document id must be specified "; }
        setCompanyDocument(company_id, data.doc_id, data, function(d){
            res.send(d);
        }, function(e){
            res.send({"error": e});
        });
    });
    //----- client app api

    function getAccessByPassKey(res, access, callback_accessgranted){
        getDocument(access.user_id, function(doc){
            try{
                console.info(doc)
                if(!doc.access_keys[access.passkey]){ throw "1433"; }
                callback_accessgranted(doc);
            }catch(e){
               res.send({"error": "Access denied", "details": e}); 
            }
        }, function(e){
            
        });
    }

    app.get('/api/client/user/:user_id/state/:state_id/:passkey', function(req, res) {
        ///does nothing
        var user_id = req.params.user_id;
        var passkey = req.params.passkey;
        var state_id = req.params.state_id;
        getAccessByPassKey(res, {"user_id": user_id, "passkey": passkey}, function(doc){
            res.send({"sucess": "Access granted"}); 
        });
    });

    app.post('/api/client/:company_id/sync/:device_id', function(req, res) {
        // will synchronize the user settings with the online device settings
        var company_id = req.params.company_id;
        var device_id = req.params.device_id;
        var data = req.body;
        console.info("Syncing device " + device_id);
        // find user in main database
        var passkey = getGuid();
        getUserById(req.body.username, function(users){
            // check that this user has correct keyword to link to
            if(users.length){ //select the first one
                var user = users[0].value;
                data.name = user.name;
                data.doctype = "driver";
                data.account = user._id;
                //validate the password
                //TODO: if (user.auth.local.password != crypto.createHash('md5').update(req.body.password).digest('hex')){ ... }
                // create a document in company id with doctype="driver" using device_id as doc._id and body as params
                setCompanyDocument(company_id, device_id, data, function(d){
                    if(!user.access_keys){user.access_keys = {};}
                    user.access_keys[passkey] = {"created": new Date().getTime(), "device": device_id}
                    console.info(JSON.stringify(user))
                    setDocument(user._id, user,
                        function(result){
                            data.passkey = passkey;
                            data.user_id = user._id;
                            res.send(data);
                        },
                        function(e){res.send({"error": e});    
                    });
                }, function(e){
                    res.send({"error": e});
                });
            }else{
                res.send({"error": "1443"});
            }
        });
    });

    //----- client membmers

    app.post('/api/client/user/:user_id/password', isLoggedInAPI, function(req, res) {
        //changes password
        var company_id = req.user.company_id;
        var user_id = req.params.user_id;
        console.info("Changing user password " + user_id);
        getDocument(user_id, function(doc){
            try{
                if(doc.company_id != company_id){ throw "Cannot remove user, access to company required. This was logged!"; }
                if(req.user.role.member < 1){ throw "Cannot edit user password. This was logged!"; }
                if(req.body.password1 != req.body.password2){ throw "The passwords did not match"; }
                doc.auth.local.password = crypto.createHash('md5').update(req.body.password1).digest('hex');
                doc.auth.local.changed = new Date().getTime();
                setDocument(user_id, doc, function(result){
                    res.send(result); 
                },function(e){
                    res.send({"error": e});     
                });
            }catch(e){
               res.send({"error": e}); 
            }
        }, function(e){
            res.send({"error": "User does not exist"}); 
        });
    });

    app.delete('/api/client/user/:user_id', isLoggedInAPI, function(req, res) {
        var company_id = req.user.company_id;
        var user_id = req.params.user_id;
        console.info("Removing user " + user_id);
        getDocument(user_id, function(doc){
            try{
                if(req.user._id === user_id){ throw "Cannot remove yourself from system"; }
                if(doc.company_id != company_id){ throw "Cannot remove user, access to company required. This was logged!"; }
                if(req.user.role.member < 2){ throw "Cannot remove user, required member access. This was logged!"; }
                delDocument(user_id, function(){
                    res.send({"success": true}); 
                }, function(e){
                    res.send({"error": e});      
                });
            }catch(e){
               res.send({"error": e}); 
            }
        }, function(e){
            res.send({"error": "User does not exist"}); 
        });
    });

    app.post('/api/client/user/', isLoggedInAPI, function(req, res) {
        var member_id = req.body.id || getGuid(); //if missing id we create a new one
        var user_id = req.user._id;
        var data, company_id = req.user.company_id;

        try{
            var data = validateMemberData(req.body);
        }catch(e){
            res.send({"error": e});
            return;
        }
        
        author = user_id;

        var time_now = new Date();
        var password = getGuid().replace("-", "").substring(2, 10);

        data["author"] = author;

        data["doctype"] = "user";
        data["company_id"] = company_id;

        getDocument(member_id, function(){
            res.send({"error": "user exists"});
        }, function(){
            if(!data["auth"]){
                data["auth"] = {
                    "local": {
                        "id": req.body.email,
                        "username": req.body.email,
                        "password": crypto.createHash('md5').update(password).digest('hex'),
                        "invited": null
                    }
                }
            }
            setDocument(member_id, data, function(d){
                var mailto =  req.user.name + " <" + req.body.email + ">";
                var mailfrom = req.user.name + " <"+req.user.auth.local.username+">";
                var subject = 'Gateway invitation';
                var content = 'Your username is ' + req.body.email + '. The password is ' + password;
                console.log(mailto  + " " + mailfrom + " ");
                sendMail(mailfrom, mailto, subject, content, function(result){
                    if(result.error){data.error = result.error;}
                    res.send(data);
                });
            }, function(e){
                res.send({"error": e});
            });
        });
    });  


    app.get('/api/client/user/', isLoggedInAPI, function(req, res) {
        var company_id = req.user.company_id;
        var path = "/" + global._cfgv.dbname +  "/_design/users/_view/list?key=%22"+company_id+"%22";
        console.info("-- " + global._cfgv.dbhost + "" + path)
        getJSON({
            port: 80, //http
            host: global._cfgv.dbhost,
            path: path,
            method:"GET",
            headers:{'Content-Type': 'application/json'}
        }, function(status, body) {
            res.send(body["rows"]);
        }, function(err){
            res.send({"error": err, "success":false, "path": path, "host": global._cfgv.dbhost});
        });        
    });
    //// ---------- billing ---------- 


    app.post('/billing/paypal/payment/ipn', function(req, res) {
        var parts = req.url.split("?");
        var params = parts[1];
        var path = "/cgi-bin/webscr?cmd=_notify-validate&" + params;
        var doc_id = "pay-" + crypto.createHash('md5').update(JSON.stringify([req.url, req.body])).digest('hex');
        setDocument(doc_id, {
            "path":path, 
            "doctype": "payment", 
            "service": "paypal", 
            "url": req.url, 
            "data": req.body
        }, function(result){
            res.send("");
        }, function(e){
            console.log("Error storing payment from paypal: " + path);
        });
        /*
        getJSON({
            port: 443, 
            host: "www.paypal.com",
            path: path,
            method:"POST",
            headers:{'Content-Type': 'application/json'}
        }, function(status, body) {
             res.send({"status": status, "body": body, "path": });
        }, function(err){
            
        });
        */
    
    }); 

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / APPLICATION SPECIFIC =============
// =============================================================================

    function getCompanyDatabase(req, body){
        body = body || {};
        return body.company_id || req.user._id.replace("usr-", "tgc-"); //since this is the register, lets just use the same name as his login
    }

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

	// locally --------------------------------
		app.get('/connect/local', function(req, res) {
			res.render('connect-local.ejs', { message: req.flash('loginMessage') });
		});
		app.post('/connect/local', passport.authenticate('local-signup', {
			successRedirect : '/authenticated', // redirect to the secure profile section
			failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

	// facebook -------------------------------

		// send to facebook to do the authentication
		app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

		// handle the callback after facebook has authorized the user
		app.get('/connect/facebook/callback',
			passport.authorize('facebook', {
				successRedirect : '/authenticated',
				failureRedirect : '/authenticate'
			}));

	// twitter --------------------------------

		// send to twitter to do the authentication
		app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

		// handle the callback after twitter has authorized the user
		app.get('/connect/twitter/callback',
			passport.authorize('twitter', {
				successRedirect : '/authenticated',
				failureRedirect : '/authenticate'
			}));


	// google ---------------------------------

		// send to google to do the authentication
		app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

		// the callback after google has authorized the user
		app.get('/connect/google/callback',
			passport.authorize('google', {
				successRedirect : '/authenticated',
				failureRedirect : '/authenticate'
			}));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

	// local -----------------------------------
	app.get('/unlink/local', function(req, res) {
		var user            = req.user;
		user.local.email    = undefined;
		user.local.password = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// facebook -------------------------------
	app.get('/unlink/facebook', function(req, res) {
		var user            = req.user;
		user.facebook.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// twitter --------------------------------
	app.get('/unlink/twitter', function(req, res) {
		var user           = req.user;
		user.twitter.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	// google ---------------------------------
	app.get('/unlink/google', function(req, res) {
		var user          = req.user;
		user.google.token = undefined;
		user.save(function(err) {
			res.redirect('/profile');
		});
	});

	app.post('/*', function(request, response) {
	  response.redirect('/');
	});
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/authenticate');
}

///////

function isLoggedInAPI(req, res, next) {
	if (req.isAuthenticated())
		return next();
    res.status(403).send({error: 403, "message": "autentication required for player"});
}

function isFloat(n) {
    return n === +n && n !== (n|0);
}
function isInteger(n) {
    return n === +n && n === (n|0);
}
function validateJobData(data){
    if(data.location){
        if(!data.location.length == 2){ throw "Validating job data failed for location length"; }
        var location = {};
        location.lat = parseFloat(data.location[0]);
        location.lng = parseFloat(data.location[1]);
        data.location = location;
        //if(!isFloat (data.location[0])){ throw "Validating job data failed for location is float, got lat = " + data.location[0]; }
        //if(!isFloat (data.location[1])){ throw "Validating job data failed for location is float, got lng = " + data.location[1]; }
    }
    if(data.pickup_time){
        data.pickup_time = parseInt(data.pickup_time);
        //if(!isInteger(data.time)){ throw "Validating job data failed for time, got time = " + data.time; }
    }
    if(data.client_ts){
        data.client_ts = parseInt(data.client_ts);
        //if(isInteger(client_ts)){ throw "Validating job data failed for time, got time = " + data.client_ts; }
    }
    return data;
}
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
function reportPlatformProblem(company_id, problem_id, data){
    var time_now = new Date().getTime();
    var doc = {"doctype": "fault", "server_ts": time_now};
    doc[problem_id] = {"server_ts": time_now, "data": data}
    setDocument(company_id+"-err", doc, function(d){}, function(e){}, function(olddoc){
        if((time_now - (olddoc.server_ts || 0)) > (60000*60)){ //is this a recent error (older than an hour)
            console.info("Error detected, sending email to developer")
            var mailto = 'Kjartan Jónsson <kjartan@taxigateway.com>';
            var mailfrom = 'kjartan@taxigateway.com';
            var subject = 'Taxi Gateway - Server error ' + problem_id + " " + company_id;
            var content = JSON.stringify(data, null, 2);
            sendMail(mailfrom, mailto, subject, content, function(result){});
        }
    });
}
function healtyJobState(company_id, state){
    //detect if something is wrong and notify the developer
    //check if notifications are being sent
    if(state.client.apn || state.client.gcm){
        //if there are device tokens for notifications check if anything has been sent
        if(state.driver.complete_ts){ //when job is done make sure we sent some notifications
            if((!state.notify.arrived_ts) && (state.driver.arrived_ts)){
                //this company notification server did not send arrived notifications
                reportPlatformProblem(company_id, "notify_arrived", state);
            }
        }
    }
}
function handleJobState(state_id, user, state_data){
    /*
            client_assigned_id: null,
            driver_assigned_id: null,
            driver_assigned_ts: null,

            driver_accepted_ts: null,
            client_accepted_ts: null,

            driver_arrives_ts: null,
            notify_arrives_ts: null,

            driver_arrived_ts: null,
            notify_arrived_ts: null,
            client_arrived_ts: null,

            driver_complete_ts: null,
            client_complete_ts: null,

            client_payment_ts: null,
            driver_payment_ts: null,

            driver_canceled_ts: null,
            notify_canceled_ts: null, 
            client_canceled_ts: null,    
    */
    state_data = state_data || {};
    var state = {"driver": {}, "client":{}}; 
    var time_now = new Date().getTime();
    if(state_data.driver_notification_apn){state.driver.apn = state_data.driver_notification_apn;}
    if(state_data.driver_notification_gcm){state.driver.gcm = state_data.driver_notification_gcm;}
    if(state_data.client_notification_apn){state.client.apn = state_data.client_notification_apn;}
    if(state_data.client_notification_gcm){state.client.gcm = state_data.client_notification_gcm;}
    if(state_data.driver_language){state.driver.lang = state_data.driver_language;}
    if(state_data.client_language){state.client.lang = state_data.client_language;}
    if(state_data.driver_name){state.driver.name = state_data.driver_name;} 
    if(!user){ //this is a client else we have either a driver or a router
        console.info("******************** user " + state_id); 
/*        if(state_id == "accept"){
            state.client.accepted_ts = time_now;
        }
        if(state_id == "arrived"){
            state.client.arrived_ts = time_now;
        }
*/
        if(state_id == "payment"){
            state.client.payment_ts = time_now;
            state.client.payment_dt = state_data;
        }        
/*
        if(state_id == "complete"){
            state.client.complete_ts = time_now;
        }        
*/
        if(state_id == "canceled"){
            state.client.canceled_ts = time_now;
            state.client.canceled_dt = state_data;
        } 
        return state;       
    }else if(user.role.router){ //also do this since a user can both be a driver and a router and we filter out 
        console.info("******************** router " + state_id + "  " + JSON.stringify(state_data));
        if(state_data.location){
            state.location = state_data.location;
        }
        if(state_id == "assigned"){
            state.driver.assigned_ts = time_now;
            state.driver.assigned_id = state_data.driver_id || user._id; 
            state.client.assigned_id = state_data.client_id || user._id; 
        }
        if(state_id == "driver_accepted"){
            state.driver.accepted_ts = time_now;
            try{state_data.arrives_delta = parseInt(state_data.arrives_delta)}catch(e){state_data.arrives_delta=0;}
            state.driver.arrives_delta = state_data.arrives_delta;  //used for push notification and letting client know when to expect driver
        }
        if(state_id == "driver_arrived"){ //used for push notification and letting client know when to expect driver
            state.driver.arrived_ts = time_now;
        }       
        if(state_id == "driver_completed"){
            state.driver.complete_ts = time_now;
        }        
        if(state_id == "driver_occupied"){
            state.driver.occupied_ts = time_now;
        }        
        if(state_id == "driver_canceled"){
            state.driver.assigned_ts = null;
            state.driver.accepted_ts = null;
            state.driver.assigned_id = null;
            state.driver.arrives_ts = null;
            state.driver.arrived_ts = null;
            state.client.assigned_id = null;

            state.driver.canceled_ts = time_now;
            state.driver.canceled_dt = state_data;
        }                
        if(state_id == "client_canceled"){
            state.client.canceled_ts = time_now;
            state.client.canceled_dt = state_data;
        } 
    }
    if(user.role.driver){
        console.info("******************** driver " + state_id + " -- " + user._id + " -- " + JSON.stringify(state_data));
        if(state_id == "assigned"){
            state.driver.assigned_ts = time_now;
            state.driver.assigned_id = state_data.driver_id || user._id; 
            state.client.assigned_id = state_data.client_id || user._id; 
        }
        if(state_id == "accepted"){
            state.driver.accepted_ts = time_now;
        }        
        if(state_id == "arrived"){
            state.driver.arrived_ts = time_now;
        }
        if(state_id == "payment"){
            state.driver.payment_ts = time_now;
            state.driver.payment_dt = state_data;
        }
        if(state_id == "complete"){
            state.client.complete_ts = time_now;
        }                
        if(state_id == "canceled"){
            state.driver.canceled_ts = time_now;
            state.driver.canceled_dt = state_data;
        }        
    }
    return state;
}

getGuid = (function() {
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

function doubleTimeValue(v){
    if(v < 10){ return "0" + v}
    return "" + v;
}

var nano = require('nano')(global._cfgv.dbserver);;

function getNanoSecure(){
    var cfg = {
      host: global._cfgv.dbhost,
      port: "80",
      ssl: false,
      user:"taxigateway",
      pass:"alicia.123"
    };

    cfg.credentials = function credentials() {
      if (cfg.user && cfg.pass) {
        return cfg.user + ":" + cfg.pass + "@";
      }
      else { return ""; }
    };

    cfg.url = function () {
      return "http" + (cfg.ssl ? "s" : "") + "://" + cfg.credentials() + cfg.host +
        ":" + cfg.port;
    };    
    return require('nano')(cfg.url());
}

function setCompanyDocumentForced(dbid, id, obj, success, failure){
    var nano = getNanoSecure();
    var db = nano.db.use(dbid);
    db.get(id, function(err, doc){
        if(err){
            if(err.message == "no_db_file"){ //the company database was missing
                //lets create the missing db
                var nano_full = getNanoSecure();
                nano_full.db.create(dbid, function(err, body) {
                  if (!err) {
                    db = nano.db.use(dbid);
                    setCompanyDocument(dbid, id, obj, success, failure);
                  }else{
                    failure(err);
                  }
                });      
            }else{
                setCompanyDocument(dbid, id, obj, success, failure);
            }
        }else{
            setCompanyDocument(dbid, id, obj, success, failure);
        }
    }); 
}

function setCompanyDocument(dbid, id, obj, success, failure){
    var nano = getNanoSecure();
    var db = nano.db.use(dbid);
    db.get(id, function(err, doc){
        if(err){
            if ((err.status_code || err.statusCode) != 404){ failure(err); return; }
            doc = {"_id": id};
        }
        for (var key in obj) {
          if ((obj[key] != null) && (typeof(obj[key]) == "object")){
            if(!doc[key]){ doc[key] = {}; }
            for (var key2 in obj[key]) {
              doc[key][key2] = obj[key][key2];
            }
          }else{
            doc[key] = obj[key] || doc[key];
          }
        }
        //doc = mergeRecursive(doc, obj);
        if(!doc.version){ doc.version = global._cfgv.version; }
        try{
            db.insert(doc, id, function(err, changed_doc){
                if(err){failure(err);}
                else{success(doc);}
            });
        }catch(e){
           failure({code: 66661, message: "could not do update"});
        } 
    }); 
}
function getCompanyDocument(dbid, id, success, failure){
    var db = nano.db.use(dbid);
    db.get(id, function(err, doc){
        if(err){
            failure(err);
        }else{
            success(doc);
        }
    }); 
}

function bulkRemove(dbname, docs, callback_result){
  var nano = getNanoSecure();
  var db = nano.db.use(dbname);
  var row, remove = [];
  for (var i in docs){
    row = docs[i].value;
    remove.push({
        '_id': row._id, 
        '_rev': row._rev,
        '_deleted': true
    });
  }
  console.info("Removing " + JSON.stringify(remove));
  db.bulk({'docs':remove}, {}, callback_result);
};

function removeCompanyDocument(dbid, id, success, failure){
    var db = nano.db.use(dbid);
    db.destroy(id, function(err, doc){
        if(err){
            failure(err);
        }else{
            success(doc);
        }
    }); 
}

function setDocument(id, obj, success, failure, callback_olddoc){
	var db = nano.db.use(global._cfgv.dbname);
    db.get(id, function(err, doc){
        if(err){
        	if ((err.status_code || err.statusCode) != 404){ failure(err); return; }
        	doc = {"_id": id};
        }
        if(callback_olddoc){ callback_olddoc(doc); }
        for (var key in obj) {
          if (typeof(obj[key]) == "object"){
            if(!doc[key]){ doc[key] = {}; }
            for (var key2 in obj[key]) {
              doc[key][key2] = obj[key][key2];
            }
          }else{
            doc[key] = obj[key];
          }
        }
        //doc = mergeRecursive(doc, obj);
        try{
            if(!doc.version){ doc.version = global._cfgv.version; }
	        db.insert(doc, id, function(err, changed_doc){
	        	if(err){failure(err);}
	        	else{success(changed_doc);}
	        });
        }catch(e){
           failure({code: 66661, message: "could not do update"});
        } 
    });	
}

function getDocument(id, success, failure){
	var db = nano.db.use(global._cfgv.dbname);
    db.get(id, function(err, doc){
        if(err){
        	if ((err.status_code || err.statusCode) != 404){ failure(err); return; }
        	if(failure){failure(err);}
        }else{
        	if(success){success(doc);}
        }
    });	
}

function delDocument(id, success, failure){
	var db = nano.db.use(global._cfgv.dbname);
	getDocument(id, function(org){
		db.destroy(id, org._rev, function(err, doc){
	        if(err){
	        	if ((err.status_code || err.statusCode) != 404){ failure(err); return; }
	        	if(failure){failure(err);}
	        }else{
	        	if(success){success(doc);}
	        }
	    });
	});
}


function updateAccessTokenFacebook(short_lived_token, success){
    var path = "/oauth/access_token?grant_type=fb_exchange_token&client_id=" + global._cfgv.social_facebook_appid + "&client_secret=" + global._cfgv.social_facebook_secret + "&fb_exchange_token=" + short_lived_token;

    getText({
        port: 443, //https
        host: "graph.facebook.com",
        path: path,
        method: "GET",
        headers:{'Content-Type': 'application/text'}
    }, function(status, body) {
    	try{
	    	var AB = body.split("&");
	    	var a = AB[0].split("=");
	    	var b = AB[1].split("=");
	    	success({"token": a[1], "expires" : b[1]});
	    }catch(e){
	    	success(body);
	    }
        
    });
}


function getUserById(username, callback_result){
    //TAKEN FROM oassport.js
    var url = global._cfgv.dbpath + "_design/users/_view/userid?key=%22"+username+"%22";
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
          callback_result(null);
    });
}

var mailgun = require("mailgun-js");
function sendMail(mailfrom, mailto, subject, content, callback_result){
    var api_key = 'key-7cbe4cc23afa5bd16842d7cd40926ded';
    var domain = 'sandbox80ff03b1ebb34edab8de56b324b9b531.mailgun.org';
    var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
     
    var data = {
      from: mailfrom,
      to: mailto,
      subject: subject,
      text: content
    };
     
    mailgun.messages().send(data, function (error, body) {
        var result = body;
        if(error){ result = {"error": error}; }
        callback_result(result);
    });
}


// =============================================================================
// ============= GEOCODE SERVICE ===============================================
// =============================================================================


function arrayContains(needle, arrhaystack)
{
    return (arrhaystack.indexOf(needle) > -1);
}

function _extractGeocodeAddressGoogle(body){
    var block, address = {"provider": "google"};
    //var quality = {undefined: 0, "ADDRESS": 1, "INTERSECTION": 2, "STREET": 2, "NEIGHBORHOOD": 3, "ZIP": 4, "ZIP_EXTENDED": 4, "CITY": 5, "STATE": 6, "COUNTRY": 7}
    if(body["results"][0]){
        block = body["results"][0]["address_components"];
        address.latlng = body["results"][0]["geometry"]["location"];
    }
    if(block){
        for(var i in block){
            if(arrayContains("street_number", block[i].types)){address.street_number = block[i].long_name;}
            if(arrayContains("route", block[i].types)){address.street = block[i].long_name;}
            if(arrayContains("sublocality_level_1", block[i].types)){address.area = block[i].long_name;}
            if(arrayContains("administrative_area_level_1", block[i].types)){address.region = block[i].long_name;}
            if(arrayContains("locality", block[i].types)){address.city = block[i].long_name;}
            if(arrayContains("country", block[i].types)){address.country = block[i].long_name;}
            if(arrayContains("post_code", block[i].types)){address.postcode = block[i].long_name;}
        }
    }
    return address;
}


function _extractGeocodeAddressMapquest(body){
    var block, address = {"provider": "mapquest"};
    var quality = {undefined: 0, "ADDRESS": 1, "INTERSECTION": 2, "STREET": 2, "NEIGHBORHOOD": 3, "ZIP": 4, "ZIP_EXTENDED": 4, "CITY": 5, "STATE": 6, "COUNTRY": 7}
    if(body["results"][0] && body["results"][0]["locations"][0]){
        block = body["results"][0]["locations"][0];
    }
    if(block){
        address.street = block.street;
        address.postcode = block.postalCode;
        if(block.adminArea1){address[block.adminArea1Type.toLowerCase()] = block.adminArea1;}
        if(block.adminArea2){address[block.adminArea2Type.toLowerCase()] = block.adminArea2;}
        if(block.adminArea3){address[block.adminArea3Type.toLowerCase()] = block.adminArea3;}
        if(block.adminArea4){address[block.adminArea4Type.toLowerCase()] = block.adminArea4;}
        if(block.adminArea5){address[block.adminArea5Type.toLowerCase()] = block.adminArea5;}
        address.street = block.street;
        address.latlng = block.latLng;
        address.precision = quality[block.geocodeQuality];
    }
    return address;
}

function getGeocodeReverse(lat, lng, callback_success, callback_failure, options){
    //returns address in form {country, city, region, street, house_number, postcode}
    var google_api_key = "AIzaSyBwnZMPecUnvMYPbeFn0sDeo_gRZaCkGyw"; //https://developers.google.com/maps/documentation/geocoding/#reverse-restricted
    var mapquest_api_key = "Fmjtd%7Cluu82l6825%2C2w%3Do5-94rgda";  ///http://www.mapquestapi.com/geocoding/

    var google_service = {
        port: 443,
        host: "maps.googleapis.com",
        path: "/maps/api/geocode/json?location_type=ROOFTOP&latlng="+lat+","+lng+"&key="+google_api_key
    };
    var mapquest_service = {
        port: 80,
        host: "open.mapquestapi.com",
        path: "/geocoding/v1/reverse?key="+mapquest_api_key+"&location="+lat+","+lng+""
    }

    var service = google_service;
    if(options.service == "mapquest"){service = mapquest_service;}

    getJSON({
        port: service.port, 
        host: service.host,
        path: service.path,
        method:"GET",
        headers:{'Content-Type': 'application/json'}
    }, function(status, body) {
        //callback_success(body);
        if(options.service == "mapquest") {callback_success(_extractGeocodeAddressMapquest(body));}
        else{callback_success(_extractGeocodeAddressGoogle(body));}
    }, function(err){
        callback_failure({error: err})
    });        

}


function getGeocodeForward(address, callback_success, callback_failure, options){
    //returns address in form {country, city, region, street, house_number, postcode}
    var google_api_key = "AIzaSyBwnZMPecUnvMYPbeFn0sDeo_gRZaCkGyw"; // https://developers.google.com/maps/documentation/geocoding/#reverse-restricted
    var mapquest_api_key = "Fmjtd%7Cluu82l6825%2C2w%3Do5-94rgda";  // http://www.mapquestapi.com/geocoding/

    options.service = "mapquest";
    
    var google_service = {};

    var mapquest_service = {
        port: 80,
        host: "open.mapquestapi.com",
        path: "/geocoding/v1/address?key="+mapquest_api_key+"&outFormat=json&inFormat=json&json=" + JSON.stringify({location: address, options:{thumbMaps:true}})
    }
    //console.info("Query " + mapquest_service.path);
    var service = google_service;
    if(options.service == "mapquest"){service = mapquest_service;}

    getJSON({
        port: service.port, 
        host: service.host,
        path: service.path,
        method:"GET",
        headers:{'Content-Type': 'application/json'}
    }, function(status, body) {
        var rows = [];
        if(options.service == "mapquest") {callback_success(_extractGeocodeAddressMapquest(body));}
        else{callback_success(_extractGeocodeAddressGoogle(body));}
    }, function(err){
        callback_failure({error: err})
    });        

}



function mergeRecursive(obj1, obj2) {
    //http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
  for (var p in obj2) {
    try {
      // Property in destination object set; update its value.
      if ( obj2[p].constructor==Object ) {
        obj1[p] = MergeRecursive(obj1[p], obj2[p]);

      } else {
        obj1[p] = obj2[p];

      }

    } catch(e) {
      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p];

    }
  }

  return obj1;
}

