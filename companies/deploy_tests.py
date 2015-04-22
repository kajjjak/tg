import sys
import requests #pip install requests

key = "key-7tt4u03ilu2ca5t5eaaf3twwy9iit-d0"
print ("Checking for test mails")
if len(sys.argv) > 2:
	print ("Requesting sending test mail to " + sys.argv[2])
	file_path = "./"+sys.argv[1]+"/app/platforms/android/ant-build/CordovaApp-release.apk"
	message = "Just open the attachment in a Android device"
	print requests.post("https://api.mailgun.net/v3/sandbox46022.mailgun.org/messages",
		auth=("api", key),
		files=[("attachment", open(file_path))],
		data={"from": "Taxi Gateway Deployer <deployer@sandbox46022.mailgun.org>",
			"to": sys.argv[2],
			"subject": "Your test app is ready",
			"text": message,
			"html": "<html>" + message + "</html>"})