#!/usr/bin/env python


#https://github.com/djacobs/PyAPNs

# import time
# from apns import APNs, Frame, Payload

# apns = APNs(use_sandbox=True, enhanced=True, cert_file="cert.pem", key_file="key.unencrypted.pem")

# push_token = "689c24befe448764badf6b58502c90a8e601e621ca7249c8e2cf6adc32dacfaf";

# # Send a notification
# #payload = Payload(alert="my message", sound="default", badge=1)
# #apns.gateway_server.send_notification(push_token, payload)
# #print("Sent push message to APNS gateway.")

# payload = Payload(alert="Hello World!", sound="default", badge=1)

# frame = Frame()
# identifier = 1
# expiry = time.time()+3600
# priority = 10
# frame.add_item(push_token, payload, identifier, expiry, priority)
# apns.gateway_server.send_notification_multiple(frame)

###########################






# if __name__ == '__main__':
#     parser = argparse.ArgumentParser()
#     parser.add_argument('-r', '--reg-id', dest='registration_id', required=True)
#     parser.add_argument('-m', '--message', dest='message', required=True)
#     args = parser.parse_args()
#     send_push_notification(args.registration_id, args.message)


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
GCM_API_KEY = 'AIzaSyBwnZMPecUnvMYPbeFn0sDeo_gRZaCkGyw'

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
	for row in jobs:
		job = row["value"];
		if job["notify"] and job["driver"]:
			#if (job["driver"]["arrived_ts"]):#
			if (not job["notify"]["arrived_ts"]) and (job["driver"]["arrived_ts"]):
				if job.has_key("notification_apn"):
					notify_apn.append({"doc_id": job["_id"], "token": job["notification_apn"], "action": "arrived"})
				if job.has_key("notification_gcm"):
					notify_gcm.append({"doc_id": job["_id"], "token": job["notification_gcm"], "action": "arrived"})
	return {"apn": notify_apn, "gcm": notify_gcm};


def getFormatedMessage(message):
	if(message["action"] == "arrived"):
		return {"text": "Driver has arrived", "sound_apn": "arrived", "badge": 1};


def sendNotifications2GCMDevice(registration_id, message):
    gcm = GCM(GCM_API_KEY)
    resp = gcm.plaintext_request(registration_id=registration_id,
                                 data={'message': message})

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
	apns.gateway_server.send_notification_multiple(frame)

client_databases = ["tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57"];

for cdb in client_databases:
	messages = extractNotifications(fetchJobs(cdb))
	sendNotifications2APN(messages["apn"], cdb)
	sendNotifications2GCM(messages["gcm"], cdb)

#code = "APA91bHFlobdvabmD_IsiC6UeCwH6bJ7mpHY10HV7bhkZGUgp7PfxTHdU0E7B_x1NL46iN8nCV7keSqmVI-XGzid5KDOjyLC6M_GT5jvroEL0UxNKc-1QW7nWVUzQbYLcoK4z5XQQ646pXFLV8gmcMCpciV9o05rBc1kzxG1BeOR7DeS3C7i9U4"
#sendNotifications2GCM(code, "hello world")

