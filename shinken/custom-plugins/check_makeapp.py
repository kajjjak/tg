import sys
import couchdb
import urllib, json

dbserver = 'https://taxigateway.cloudant.com/';
dbase = 'taxigateway'
couch_server = couchdb.Server(dbserver)
couch_database = couch_server[dbase]


def fetchCompanies():
        url = dbserver + dbase + "/_design/list/_view/companies"
        response = urllib.urlopen(url)
        data = json.loads(response.read())
        return data["rows"];

def checkChanges(rows):
        app_count = 0;
        for rowval in rows:
                row = rowval["value"]
                if not row.has_key("payment"): row["payment"] = {};
                if not row["app_config"].has_key("changed"): row["app_config"]["changed"] = None;
                if not row["app_config"].has_key("updated"): row["app_config"]["updated"] = None;
                if (row["payment"].has_key("instalment") and row["payment"].has_key("subscription") and (not row["payment"].has_key("deployed"))):
                        app_count = app_count + 1
        return app_count

app_count = checkChanges(fetchCompanies())
print ("Pending customer app count " + str(app_count))
sys.exit(app_count + 1)