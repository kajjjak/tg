#!/usr/bin/env python

import urllib, json
import time
import couchdb
#apple
from apns import APNs, Frame, Payload
#google
#https://github.com/kajjjak/python-gcm
from gcm import GCM #pip install python-gcm
import argparse
# API Key for your Google OAuth project
GCM_API_KEY = 'AIzaSyD6_BAlgs8_YECtbsWThvIVGRIxI5fsuiw'

dbserver = 'http://db01.taxigateway.com/';
keydir = '../../pems/'
couch_server = couchdb.Server(dbserver)

def fetchJobs(dbname):
	url = dbserver + dbname + "/_design/jobs/_view/active"
	response = urllib.urlopen(url)
	data = json.loads(response.read())
	print ("Fetched " + str(len(data["rows"])) + " rows from " + dbname)
	return data["rows"];

def extractNotifications(jobs):
	notify_apn = [];
	notify_gcm = [];
	for job in jobs:
		if job.has_key("value"):
			job = job["value"];
		if job.has_key("notify") and job.has_key("driver") and job.has_key("client"):
			try:
				if not job["notify"].has_key("arrived_ts"):
					job["notify"]["arrived_ts"] = None;
				if not job["driver"].has_key("arrived_ts"):
					job["driver"]["arrived_ts"] = None;
				#check if the driver and user was the same
				if job["client"].has_key("id") && job["driver"].has_key("id"):
					if job["client"]["id"] == job["driver"]["id"]:
						continue; #skip sending notification if driver and user are the same
				#if ((not job["notify"]["arrived_ts"]) and (job["driver"]["arrived_ts"])):
				if (job["driver"]["arrived_ts"]):
					if job.has_key("notification_apn"):
						notify_apn.append({"doc_id": job["_id"], "token": job["notification_apn"], "action": "arrived"})
					if job.has_key("notification_gcm"):
						notify_gcm.append({"doc_id": job["_id"], "token": job["notification_gcm"], "action": "arrived"})
				if (job["client"]["canceled_ts"]):
					if job.has_key("notification_apn"):
						notify_apn.append({"doc_id": job["_id"], "token": job["notification_apn"], "action": "canceled"})
					if job.has_key("notification_gcm"):
						notify_gcm.append({"doc_id": job["_id"], "token": job["notification_gcm"], "action": "canceled"})
			except Exception:
				print (">>>>>>>>>>\n " + str(job) + "\n<<<<<<<<<<<<\n")
	return {"apn": notify_apn, "gcm": notify_gcm};


def getFormatedMessage(message):
	if(message["action"] == "arrived"):
		return {"text": "Driver has arrived", "sound_apn": "arrived", "badge": 1};
	if(message["action"] == "canceled"):
		return {"text": "Client has canceled a job that was assigned to you", "sound_apn": "canceled", "badge": 1};


def sendNotifications2GCMDevice(registration_id, message):
	gcm = GCM(GCM_API_KEY)
	reg_id = registration_id
	try:
		canonical_id = gcm.plaintext_request(registration_id=reg_id, data={'message': message})
		if canonical_id:
			# Repace reg_id with canonical_id in your database
			entry = entity.filter(registration_id=reg_id)
			entry.registration_id = canonical_id
			entry.save()
	except GCMNotRegisteredException:
		# Remove this reg_id from database
		entity.filter(registration_id=reg_id).delete()
	except GCMUnavailableException:
		print "resend required"
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

	#update the documents
	print ("Updating documents " + str(len(messages)))
	for message in messages:
		doc = couch_database[message["doc_id"]];
		if(message["action"] == "arrived"):
			doc["notify"]["arrived_ts"] = time.time();
			couch_database.save(doc)

def sendNotifications2APN(messages, dbname):
	couch_database = couch_server[dbname];

	apns = APNs(use_sandbox=True, enhanced=True, cert_file=keydir+"cert.pem", key_file=keydir+"key.unencrypted.pem")
	frame = Frame()

	identifier = 1
	expiry = time.time()+3600
	priority = 10

	#create the notification package
	print ("Creating APN package " + str(len(messages)))
	for message in messages:
		fmessage = getFormatedMessage(message)
		payload = Payload(alert=fmessage["text"], sound=fmessage["sound_apn"], badge=fmessage["badge"])
		frame.add_item(message["token"], payload, identifier, expiry, priority)

	#update the documents
	print ("Updating documents " + str(len(messages)))
	for message in messages:
		doc = couch_database[message["doc_id"]];
		if(message["action"] == "arrived"):
			doc["notify"]["arrived_ts"] = time.time();
			couch_database.save(doc)

	#send the notifications
	if(len(messages)):
		apns.gateway_server.send_notification_multiple(frame)

client_databases = ["tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57"];

# for cdb in client_databases:
# 	messages = extractNotifications(fetchJobs(cdb))
# 	#sendNotifications2APN(messages["apn"], cdb)
# 	sendNotifications2GCM(messages["gcm"], cdb)


# db = couch_server['tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57']
# cdb = 'tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57';
# # the since parameter defaults to 'last_seq' when using continuous feed
# ch = db.changes(feed='continuous', heartbeat='1000', include_docs=True, since='now')
# #http://stackoverflow.com/questions/7840383/couchdb-python-change-notifications
# for line in ch:
# 	doc = line['doc']
# 	messages = extractNotifications([doc])
# 	sendNotifications2APN(messages["apn"], cdb)
# 	sendNotifications2GCM(messages["gcm"], cdb)

sendNotifications2GCMDevice("APA91bGBw-khSaqFn-MBNg2ZZTV_CjmVUUl2fyhPO0l6nHnD20HHo9mQG-Bvlb4M8U3-RcKnagYe4oUdyOX96uDMQPV_eE_irOEzmrhsguRqLi6T_s8LFyHfU7Ti3__1A5mOXC6uAGCT7_uDagRkilJ80TKqZWAAq21O1KrDtck4H8QWaaf0fso", "message")
