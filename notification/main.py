#!/usr/bin/env python
# -*- coding: utf-8 -*-

import urllib, json
import time
import couchdb
import internationalization as language
#apple
from apns import APNs, Frame, Payload
#google
#https://github.com/kajjjak/python-gcm
from gcm import * #pip install python-gcm


import argparse
# API Key for your Google OAuth project
GCM_API_KEY = 'AIzaSyB8XL-_Bx_UwssTqzpeb8g5K2UluwR-3d4' #'AIzaSyBwnZMPecUnvMYPbeFn0sDeo_gRZaCkGyw'

dbserver = 'http://db01.taxigateway.com/';
keydir = '../../pems/'
couch_server = couchdb.Server(dbserver)

def fetchJobs(dbname):
	url = dbserver + dbname + "/_design/jobs/_view/active"
	response = urllib.urlopen(url)
	data = json.loads(response.read())
	print ("Fetched " + str(len(data["rows"])) + " rows from " + dbname)
	return data["rows"];

def extractNotifications(docs):
	notify_apn = [];
	notify_gcm = [];
	for doc in docs:
		job = doc;
		if doc.has_key("value"): job = doc["value"]
		if not job.has_key("doctype"): job["doctype"] = None
		print job["doctype"]
		if job["doctype"] == "notify": #if this is a message
			if not job["notify"].has_key("receaved_ts"): job["notify"]["receaved_ts"] = None
			if not job.has_key("message"): continue
			if not job["message"].has_key("text"): continue
			if job["notify"]["receaved_ts"] != job["notify"]["published_ts"]:
				notify_apn.append({"doc_id": job["_id"], "token": job["token"]["apn"], "action": "message", "text": job["message"]["text"]})
				notify_gcm.append({"doc_id": job["_id"], "token": job["token"]["gcm"], "action": "message", "text": job["message"]["text"]})

# {
#   "_id": "test_msg",
#   "_rev": "7-e981fe576a8fa96472c9ddd0b89794e3",
#   "token": {
#     "apn": [
#       "8c63b4b2d4b2f0afff885ed03ffe22a409074e03de3a6c3c0459452d1042b86a"
#     ],
#     "gcm": []
#   },
#   "notify": {
#     "receaved_ts": 123123131,
#     "published_ts": 12312313131
#   },
#   "message": {
#     "text": "hellow orld in message"
#   },
#   "doctype": "notify"
# }

		if job["doctype"] == "job": #if this is a job
			if job.has_key("value"):
				job = job["value"];
			if not job.has_key("notify"): job["notify"] = {}
			if not job.has_key("driver"): job["driver"] = {}
			if not job.has_key("client"): job["client"] = {}
			if True: 
				try:
					action = None;
					target = None;
					#check if the driver and user was the same
					if job["client"].has_key("id") and job["driver"].has_key("id"):
						if job["client"]["id"] == job["driver"]["id"]:
							continue; #skip sending notification if driver and user are the same

					#LETS MAKE SURE WE HAVE THE CURRENT STATE (so the code does not failue due to missing keys)
					if not job["notify"].has_key("assigned_ts"): job["notify"]["assigned_ts"] = None;
					if not job["notify"].has_key("accepted_ts"): job["notify"]["accepted_ts"] = None;
					if not job["notify"].has_key("arrived_ts"): job["notify"]["arrived_ts"] = None;
					if not job["notify"].has_key("canceled_ts"): job["notify"]["canceled_ts"] = None;
					if not job["driver"].has_key("canceled_ts"): job["driver"]["canceled_ts"] = None;
					if not job["driver"].has_key("arrived_ts"): job["driver"]["arrived_ts"] = None;
					if not job["driver"].has_key("arrives_ts"): job["driver"]["arrives_ts"] = None;
					if not job["driver"].has_key("assigned_ts"): job["driver"]["assigned_ts"] = None;
					if not job["driver"].has_key("accepted_ts"): job["driver"]["accepted_ts"] = None;
					if not job["client"].has_key("arrived_ts"): job["client"]["arrived_ts"] = None;
					if not job["client"].has_key("canceled_ts"): job["client"]["canceled_ts"] = None;

					if not job["client"].has_key("gcm"): job["client"]["gcm"] = None;
					if not job["client"].has_key("apn"): job["client"]["apn"] = None;
					if not job["client"].has_key("lang"): job["client"]["lang"] = None;
					if not job["driver"].has_key("gcm"): job["driver"]["gcm"] = None;
					if not job["driver"].has_key("apn"): job["driver"]["apn"] = None;
					if not job["driver"].has_key("lang"): job["driver"]["lang"] = None;

					if job["driver"]["assigned_ts"] and (job["driver"]["assigned_ts"] != job["notify"]["assigned_ts"]):
						action = "assigned"
						target = job["driver"]
					if job["driver"]["accepted_ts"] and (job["driver"]["accepted_ts"] != job["notify"]["accepted_ts"]):
						action = "accepted"
						target = job["client"]
					if job["driver"]["arrived_ts"] and (job["driver"]["arrived_ts"] != job["notify"]["arrived_ts"]):
						action = "arrived"
						target = job["client"]
					if job["client"]["canceled_ts"] and (job["client"]["canceled_ts"] != job["notify"]["canceled_ts"]):
						action = "canceled"
						target = job["driver"]
					
					if action:
						if target["apn"]:
							notify_apn.append({"doc_id": job["_id"], "token": target["apn"], "action": action, "lang": target["lang"]})
						if target["gcm"]:
							notify_gcm.append({"doc_id": job["_id"], "token": target["gcm"], "action": action, "lang": target["lang"]})
				except Exception as e:
					print (">>>>>>>>>>\n " + str(job) + "\n<<<<<<<<<<<<\n " + str(e))
	return {"apn": notify_apn, "gcm": notify_gcm};


def getFormatedMessage(message):
	if(message["action"] == "assigned"):
		return {"text": unicode(language.lang[message["lang"]]["notification"][message["action"]]["message_notify"]), "sound_apn": message["action"], "badge": 1};
	if(message["action"] == "accepted"):
		return {"text": unicode(language.lang[message["lang"]]["notification"][message["action"]]["message_notify"]), "sound_apn": message["action"], "badge": 1};
	if(message["action"] == "arrived"):
		return {"text": unicode(language.lang[message["lang"]]["notification"][message["action"]]["message_notify"]), "sound_apn": message["action"], "badge": 1};
	if(message["action"] == "canceled"):
		return {"text": unicode(language.lang[message["lang"]]["notification"][message["action"]]["message_notify"]), "sound_apn": message["action"], "badge": 1};
	if(message["action"] == "message"):
		return {"text": message["text"], "sound_apn": "message", "badge": 0};


def sendNotifications2GCMDevice(reg_id, message):
	gcm = GCM(GCM_API_KEY)
	if True: 
		if isinstance(reg_id, list):
			reg_ids = reg_id;
		else:
			reg_ids = [reg_id];
		if(len(reg_ids)):
			response = gcm.json_request(registration_ids=reg_ids, data={'message': message}, delay_while_idle=False)
			print ("GCM response: " + str(response))
			#canonical_id = gcm.plaintext_request(registration_id=reg_id, data={'message': message, 'asetas': 'asdfasdfafsfds'}, delay_while_idle=False)
			#print ("GCM responsess: " + str(canonical_id))
		# 	# Repace reg_id with canonical_id in your database
		# 	entry = entity.filter(registration_id=reg_id)
		# 	entry.registration_id = canonical_id
		# 	entry.save()
	# except GCMNotRegisteredException:
	# 	# Remove this reg_id from database
	# 	entity.filter(registration_id=reg_id).delete()
	# except GCMUnavailableException:
	# 	print "resend required"


    # Resent the message    
 #    response = gcm.plaintext_request(registration_id=registration_id, data={'message': message})
	# # Handling errors
	# if 'errors' in response:
	#     for error, reg_ids in response['errors'].items():
	#         # Check for errors and act accordingly
	#         if error is 'NotRegistered':
	#             # Remove reg_ids from database
	#             for reg_id in reg_ids:
	#                 entity.filter(registration_id=reg_id).delete()
	# if 'canonical' in response:
	#     for reg_id, canonical_id in response['canonical'].items():
	#         # Repace reg_id with canonical_id in your database
	#         entry = entity.filter(registration_id=reg_id)
	#         entry.registration_id = canonical_id
	#         entry.save()    

def sendNotifications2GCM(messages, dbname):
	couch_database = couch_server[dbname];
	#create the notification package	
	print ("Sending GCM package " + str(len(messages)))
	for message in messages:
		fmessage = getFormatedMessage(message)
		sendNotifications2GCMDevice(message["token"], fmessage["text"])

	saveNotificationSent(messages, dbname)

def sendNotifications2APN(messages, dbname):

	apns = APNs(use_sandbox=True, enhanced=True, cert_file=keydir+"cert.pem", key_file=keydir+"key.unencrypted.pem")
	frame = Frame()

	identifier = 1
	expiry = time.time()+3600
	priority = 10

	#create the notification package
	print ("Creating APN packages " + str(len(messages)))

	for message in messages:
		fmessage = getFormatedMessage(message)
		if isinstance(message["token"], list):
			tokens = message["token"];
		else:
			tokens = [message["token"]];
		for token in tokens:
			payload = Payload(alert=fmessage["text"], sound=fmessage["sound_apn"], badge=fmessage["badge"])
			frame.add_item(token, payload, identifier, expiry, priority)

	saveNotificationSent(messages, dbname)
	#send the notifications
	if(len(messages)):
		apns.gateway_server.send_notification_multiple(frame)

def saveNotificationSent(messages, dbname):
	couch_database = couch_server[dbname];
	# #update the documents
	for message in messages:
		doc = couch_database[message["doc_id"]];
		if(message["action"] == "assigned"):
			doc["notify"]["assigned_ts"] = doc["driver"]["assigned_ts"];
			couch_database.save(doc)
		if(message["action"] == "accepted"):
			doc["notify"]["accepted_ts"] = doc["driver"]["accepted_ts"];
			couch_database.save(doc)
		if(message["action"] == "arrived"):
			doc["notify"]["arrived_ts"] = doc["driver"]["arrived_ts"];
			couch_database.save(doc)
		if(message["action"] == "canceled"):
			doc["notify"]["canceled_ts"] = doc["client"]["canceled_ts"];
			couch_database.save(doc)
		if(message["action"] == "message"):
			doc["notify"]["receaved_ts"] = doc["notify"]["published_ts"];
			couch_database.save(doc)


client_databases = ["tgc-e6ed05461250df994aa26e7c2d58b82a"];

# for cdb in client_databases:
# 	messages = extractNotifications(fetchJobs(cdb))
# 	sendNotifications2APN(messages["apn"], cdb)
# 	sendNotifications2GCM(messages["gcm"], cdb)

cdb = client_databases[0];
db = couch_server[cdb]
# the since parameter defaults to 'last_seq' when using continuous feed
ch = db.changes(feed='continuous', heartbeat='1000', include_docs=True, since='now')
# http://stackoverflow.com/questions/7840383/couchdb-python-change-notifications
for line in ch:
	doc = line['doc']
	messages = extractNotifications([doc])
	sendNotifications2APN(messages["apn"], cdb)
	sendNotifications2GCM(messages["gcm"], cdb)


#canonical ----  APA91bHfyj_2oQQHoUl8o49FwQreGDMK-mzU8xKhnDhI-f_244i71NSy7JSGZ6uqXZRkFyFvuL4eVXzDce6wNhxuV3np70JSEh06xhH05x4KxL6wEwr5zJsjNsnXF9fxXuDqHW8iPiQyS8j4mFJ3kzZ7AU1hHE5RDh0st1aGcS0okA7mtJSplDo
#sendNotifications2GCMDevice("APA91bF79-90Oacmp3uTb-q1_cQI8jfNjcJ8wvhL8wXPfn05aQRSCXq9zg2yb33Ox6y2SbE85CJHH6ov5fY_sPMB8c1x_-HrFk5M2wuVtaDnbQjs2S36eBQ_VTr-KNz7KRXeZeX41zowWTU6BSKp9fpOuWcz_TkAsg", "MYMESSEGE WITH DEVID")
#sendNotifications2GCMDevice("APA91bHfyj_2oQQHoUl8o49FwQreGDMK-mzU8xKhnDhI-f_244i71NSy7JSGZ6uqXZRkFyFvuL4eVXzDce6wNhxuV3np70JSEh06xhH05x4KxL6wEwr5zJsjNsnXF9fxXuDqHW8iPiQyS8j4mFJ3kzZ7AU1hHE5RDh0st1aGcS0okA7mtJSplDo", "MYMESSAGE WITH CANONIC")
