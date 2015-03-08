/*
	kajjjak, jan 29 2015
	Ranking is mainly used by ghost burster, use this to show the player status in a region.

	Idea:
		The user document has information on where the players main location is (can be HQ or Radar or ...)
		This location info is ranked from global to street.
		When ranking value changes this information is store to the server (as usual).
		The ranking must be a positive numeric value.
		The database has a list function that allows us to fetch from value 0 to value MAX for any region in the world.

			/_design/ranking/_view/captured_buildings?startkey="a1b0c00000000000000000"&endkey="a1b0c000000000000000002900000000000000"

		Information required is ranking dict, region information (grouped by type) and aut (for serius users)
		Example:
		   "ranking": {  <<-- this is game specific and populated by achivement checks, should be visible by user since this is important for the player
		       "captured_buildings": 19
		   },
		   "region": {   <<-- reverse lookup the item position
		       "country": {
		           "rid": "a1b0c00000000000000000",
		           "name": "Iceland"
		       },
		       "capital": {
		           "rid": "2000000000000000000",
		           "name": "Reykjavik",
		           "data": {
		               "size": 3232
		           }
		       }
		   },
		   "auth": 1

		Returns the following structure
		{
			"total_rows": 2,
			"offset": 1,
			"rows": [{
				"id": "test_ranking",
				"key": "a1b0c0000000000000000019",
				"value": {
					"user": {},
					"region": {
						"rid": "a1b0c00000000000000000",
						"name": "Iceland"
					},
					"ranking": 19,
					"type": "captured_buildings"
				}
			}]
		}

	Reason:
		Player want to know how they are doing compared to others in a particular region (allowing them to participate in a list)

	Example:
		http://db00.zombiebattlegrounds.com/zombiebattleground/_design/ranking/_view/captured_buildings?startkey=%22100000000000000000000%22&endkey=%2210000000000000000002900000000000000%22
		http://db00.zombiebattlegrounds.com/zombiebattleground/_design/ranking/_view/captured_buildings?startkey=%22a1b0c00000000000000000%22&endkey=%22a1b0c000000000000000002900000000000000%22

	Implementation progress:
		Currently we call getResourceRegionMainIds to set "region" and we use HQ
		Todo:
			- populate "ranking" with data, should be done in achivements check
			- dialog box with ranking lists
*/