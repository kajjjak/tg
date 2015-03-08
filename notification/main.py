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

# #https://github.com/kajjjak/python-gcm
# from gcm import GCM #pip install python-gcm
# import argparse

# # API Key for your Google OAuth project
# API_KEY = ''


# def send_push_notification(registration_id, message):
#     gcm = GCM(API_KEY)
#     resp = gcm.plaintext_request(registration_id=registration_id,
#                                  data={'message': message})


# if __name__ == '__main__':
#     parser = argparse.ArgumentParser()
#     parser.add_argument('-r', '--reg-id', dest='registration_id', required=True)
#     parser.add_argument('-m', '--message', dest='message', required=True)
#     args = parser.parse_args()
#     send_push_notification(args.registration_id, args.message)


import urllib, json
import time
import couchdb
from apns import APNs, Frame, Payload

couch_server = couchdb.Server('http://db00.taxigateway.com/')

def fetchJobs():
	url = "http://db00.taxigateway.com/tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57/_design/jobs/_view/active"
	response = urllib.urlopen(url);
	data = json.loads(response.read())
	return data["rows"];

def extractNotifications(jobs):
	notify_apn = [];
	notify_gcm = [];
	for row in jobs:
		job = row["value"];
		if job["notify"] and job["driver"]:
			if (not job["notify"]["arrived_ts"]) and (job["driver"]["arrived_ts"]):
				notify_apn.append({"doc_id": job["_id"], "token": job["notification_ios"], "action": "arrived"})
	return {"apn": notify_apn, "gcm": notify_gcm};


def getFormatedMessage(message):
	if(message["action"] == "arrived"):
		return {"text": "Driver has arrived", "sound_apn": "default", "badge": 1};

def sendNotifications2APN(messages):
	couch_database = couch_server["tgc-e3d56304c5288ccd6dd6c4a0bb8c3d57"];

	apns = APNs(use_sandbox=True, enhanced=True, cert_file="cert.pem", key_file="key.unencrypted.pem")
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

messages = extractNotifications(fetchJobs())
sendNotifications2APN(messages["apn"])

