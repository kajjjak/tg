from subprocess import call, Popen

import urllib, json
import time
import couchdb

dbserver = 'https://taxigateway.cloudant.com/';
dbase = 'taxigateway'
couch_server = couchdb.Server(dbserver)
couch_database = couch_server[dbase]

working_dir = "../../taxigateways/"
gitfile_dir = "../"

build_file = """cd $1/app
npm install
cd $1/app
ionic platform add ios
ionic platform add android
ionic plugin add com.ionic.keyboard
ionic plugin add org.apache.cordova.device
ionic resources
ionic build
cd ..
cd ..
python deploy_tests.py $1 $2
"""

def prepScripts():
	call(["rm", "build_files.sh"])
	call(["rm", "notify_serverstart.sh"])
	call(["rm", "notify_serverstop.sh"])
	# copy test script
	call(["cp", "deploy_tests.py", working_dir + "/"])
	# create the build file
	f = open(working_dir + "/build_file.sh", "w")
	f.write(build_file)
	f.close()
	call(["chmod", "+x", working_dir + "/build_file.sh"])



def fetchCompanies():
	url = dbserver + dbase + "/_design/list/_view/companies"
	response = urllib.urlopen(url)
	data = json.loads(response.read())
	return data["rows"];

def checkChanges(rows):
	for rowval in rows:
		row = rowval["value"]
		if(row.has_key("app_details") and (row.has_key("app_config") or (row["app_config"]["changed"] != row["app_config"]["updated"]))):
			print ("Needs code update " + row["_id"])
			# make sure directory exists
			call(["mkdir", working_dir + row["_id"]])
			# copy new code to new directory
			call(["cp", "-rf", gitfile_dir + "app", working_dir + row["_id"] + "/app"])
			call(["cp", "-rf", gitfile_dir + "notification", working_dir + row["_id"] + "/notification"])
			# fetch config
			doc = couch_database[row["_id"]]
			# create notification config
			f = open(working_dir + "" + row["_id"] + "/notification/config.py", "w")
			f.write("client_database = '" + row["_id"] + "'\n")
			f.write("server_database = '" + row["app_config"]["notification"]["server_database"] + "'\n")
			f.write("server_username = '" + row["app_config"]["notification"]["server_username"] + "'\n")
			f.write("server_password = '" + row["app_config"]["notification"]["server_password"] + "'\n")
			f.write("changes_heartbeat = " + str(row["app_config"]["notification"]["changes_heartbeat"]) + "\n")
			f.write("apnkey_directory = '" + row["app_config"]["notification"]["apnkey_directory"] + "'\n")
			f.write("gcmkey_serverkey = '" + row["app_config"]["notification"]["gcmkey_serverkey"] + "'\n")
			f.close()
			del row["app_config"]["notification"]
			# create app config
			f = open(working_dir + "" + row["_id"] + "/app/www/js/config.js", "w")
			f.write("var config = "+json.dumps(doc["app_config"], sort_keys=True, indent=4, separators=(',', ': ')) + ";\n")
			f.close()
			# create style
			f = open(working_dir + "" + row["_id"] + "/app/www/css/config.css", "w")
			config_style = ""
			for page in doc["app_config"]["design"]:
				for style_id in doc["app_config"]["design"][page]:
					style = doc["app_config"]["design"][page][style_id];
					config_style = config_style + "." + style["class"] + " {\n";
					for style_el in style["style"]:
						config_style = config_style + "\t" + style_el + ": " + style["style"][style_el] + " !important;\n";
					config_style = config_style + "}\n\n"
			f.write(config_style)
			f.close()			
			# fetch language
			doclang = couch_database["mobile_languages"]
			try: doclang = couch_database[row["_id"] + "-lang"]
			except Exception: pass
			# create internatialzation file
			f = open(working_dir + "" + row["_id"] + "/app/www/js/internationalization.js", "w")
			f.write("var lang_support = "+json.dumps(doclang["languages"], sort_keys=True, indent=4, separators=(',', ': ')) + ";")
			f.close()
			# building
			# update the config.xml (replacing text with project configs)
			f = open(working_dir + "" + row["_id"] + "/app/_config.xml", "r+w")
			confxml = f.read()
			f.close()
			
			confxml = confxml.replace("tg_app_uaid", row["_id"])
			confxml = confxml.replace("tg_app_name", row["app_details"]["name"])
			confxml = confxml.replace("tg_app_desc", row["app_details"]["description"])

			# update config xml
			f = open(working_dir + "" + row["_id"] + "/app/config.xml", "w")
			f.write(confxml)
			f.close()

			# create build files script			
			f = open("build_files.sh", "a+w")
			deployment_email = "";
			if row["app_config"].has_key("testers"):
				if row["app_config"]["testers"].has_key("android") and len(row["app_config"]["testers"]["android"]):
					deployment_email = str(row["app_config"]["testers"]["android"][0])
			f.write(working_dir + "build_file.sh " + str(row["_id"]) + " " + deployment_email + "\n")
			f.close()
			call(["chmod", "+x", "build_files.sh"])

			# create notification servers script
			f = open("notify_serverstart.sh", "a+w")
			f.write("./main_kill.sh " + working_dir + str(row["_id"]) + "/notification\n")
			f.write("./main_start.sh " + working_dir + str(row["_id"]) + "/notification\n")
			f.close()
			call(["chmod", "+x", "notify_serverstart.sh"])
			f = open("notify_serverstop.sh", "a+w")
			f.write("./main_kill.sh " + working_dir + str(row["_id"]) + "/notification\n")
			f.close()
			call(["chmod", "+x", "notify_serverstop.sh"])

			#download the icon and splash
			if row["app_details"]["icon"]: 
				f = open(working_dir + "" + row["_id"] + "/app/resources/icon.png", "w")
				f.write(row["app_details"]["icon"].replace("data:image/png;base64,", "").decode('base64'))
				f.close()

			if row["app_details"]["splash"]: 
				f = open(working_dir + "" + row["_id"] + "/app/resources/splash.png", "w")
				f.write(row["app_details"]["splash"].replace("data:image/png;base64,", "").decode('base64'))
				f.close()


prepScripts()
checkChanges(fetchCompanies())