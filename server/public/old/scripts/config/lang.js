// http://www.convertcsv.com/csv-to-json.htm

/*
spriteAnimation.play("#"+mmgr.actors.building_actor_4c6fcc15d274b60cff87d70d.id+" .actor_explodes", "explode_coins", "explode_coins");
*/

var _lang_en = {
  //items
  "headquarters": "scanner",
  "residence": "generator",
  "goldstorage": "battery",
  "sawmill": "office",
  "woodstorage": "safe",
  "quarry": "biopharmer",
  "stonestorage": "cryogenics",
  "ironmine": "decomposer",
  "ironstorage": "aquarium",
  "vault": "storage",
  "snipertower": "photonx",
  "machinegun": "photonator",
  "mortar": "neutronos",
  "cannon": "neutronx",
  "flamethrower": "darkaronos",
  "boomcannon": "darkanx",
  "rocketlauncher": "strignator",
  "landminesmall": "claymore mine",
  "landminelarge": "anti-tank mine",
  "landingcraft": "garage",
  "gunboat": "scanner",
  "sculptor": "sculptor",
  "radar": "radar",
  "armory": "armoury",
  "captured": "captured",
 
  "rifleman": "motorcycle",
  "heavy": "car",
  "zooka": "van",
  "warrior": "truck",
  "tank": "tank",
 
  "artillery": "Frag", //http://en.wikipedia.org/wiki/AGM-114_Hellfire
  "flare": "Hellfire",
  "medkit": "First aid kit", //will give our troops healing (instead of fixing interface)
  "shockbomb": "Bomb",
  "barrage": "Shock",
  "smokescreen": "Nuke", //less damage for a while
 
  "iap01": "Pouch of coins", //less damage for a while
  "iap02": "Bag of coins",
  "iap03": "Pot of coins",
  "iap04": "Crate of coins",
  "iap05": "Safe of coins",
 
  //currencies
  "gold": "electricity",
  "wood": "bux",
  "stone": "protoplasm",
  "iron": "detritus",
  "diamonds": "coins",
  "cash": "cash",
  "missing_resources": "about",
  "build": "build",
  "attack": "attack",
  "purchase": "purchase",
  "economy": "economy",
  "defense": "trap",
  "support": "support",
 
  "infowindow_label_attack": "<b class='font-bright'>{name}</b><br>Help us we have detected <br>ghost activity level {attack_level}.<br>Requires scanner type {attack_level}",
  /*"infowindow_button_attack": "attack",
  "infowindow_button_info": "info",
  "infowindow_button_cancel": "cancel",
  "infowindow_label_captured": "Captured ",
  */
 
  //menu items
  "menuitems_shelf_iap_details": "Purchase {diamonds} coins for {upgrade_cash}",
  "menuitems_shelf_iap_details_maxcount": "used ",
  "menuitems_shelf_iap_details_time": "build time ",
  //attack
  //"attack_infowindow_label_budget": "Budget",
  "attack_infowindow_label_place": "Armoury",
  "attack_infowindow_label_cancel": "Scanner cancelled",
  "attack_infowindow_label_lost": "You will get them next time!",
  "attack_infowindow_label_win": "Job well done!",
 /* "attack_wave_startingin": "Starting wave",
  "attack_wave_message_0": "And so it begins",
  "attack_wave_message_1": "Good work! There are more",
  "attack_wave_message_2": "Here come more",
  "attack_wave_message_3": "Wow, they keep coming!",
  "attack_wave_message_4": "Come on, man!!",
  "attack_wave_message_5": "Keep fighting!",
  "attack_wave_message_6": "Prepare for the next wave!",
  "attack_wave_message_7": "You're holding up well under pressure",
  "attack_wave_message_8": "There can't be many more now. Keep it up!",
  "attack_wave_message_9": "That was masterful. Well done.",  
  "attack_wave_waitingnext": "Preparing next wave",
 */ 
  "select_infowindow_label_location": "<b class='font-bright'>{name}</b><br>place {building_type} here?",
  "select_infowindow_label_location_noname": "<b class='font-bright'>Location</b><br>place {building_type} here?",
  "select_infowindow_label_select": "Yes",
  "select_infowindow_label_cancel": "Cancel",
  
  //states of items
  "state_build_building": "Upgrading ...",
  "state_ready_building": "Complete!",
  "state_ready_storage": "Storing resources",
  "state_ready_protect": "Protecting resources",
  "state_ready_support": "Support",
  "state_ready_defense": "Trapping ghosts",
  "state_ready_headquarter": "Scanning",
  "state_working_builder": "Generating",
  
  //dialogs

  "gui_menudialog_messages_btnaccept": "OK",
  "gui_menudialog_messages_nomessages": "You have no messages",
  "gui_menudialog_messages_btnattack": "Attack",
  "gui_menudialog_messages_attacksuccess_title": "successfully attacked {name}",
  "gui_menudialog_messages_attacksuccess_text": "{name} was recently attacked and you lost some resources. Try upgrading your resources for stronger defence.",
  "gui_menudialog_messages_attackfailed_title": "failed while attacking {name}",
  "gui_menudialog_messages_attackfailed_text": "{name} was recently attacked. No worries your defences held their ground",
  "gui_menudialog_messages_attackrequest_title": "requesting help",
  "gui_menudialog_messages_attackrequest_text": "Need help in clearing out a location",
  "gui_menudialog_messages_notunlocked": "<center>Need to upgrade Scanner to level 3 for multiplayer</center>",

  "gui_menudialog_battleresult_title": "Secured {name}",
  "gui_menudialog_battleresult_message": "I have cleared the location {name} of enemies",

  "gui_menudialog_battleradarupgrade_title": "Increase service area",
  "gui_menudialog_battleradarupgrade_message": "Service area needs expanding to fetch more locations",
  

  "dialog_title_storagefullwarning": "Storage is full",
  "dialog_title_resourcemissingattack": "Missing resources",
  "dialog_title_iap": "Buy",
  "dialog_title_upgrade": "Upgrade",
  "dialog_title_info": "About",
  "dialog_title_create": "Build",
  "gui_format_time_string_ready": "Ready!",
  "gui_button_label_instantupgrade": "finish now",
  "gui_dialogiteminfo_label_constructiontime": "Upgrade time: ",
  "gui_dialogiteminfo_label_level": "Level",
  "gui_dialogiteminfo_label_explore": "Scan range",
  "gui_dialogiteminfo_label_buyresources": "Buy resources!",
  "gui_dialogiteminfo_label_upgradeitem": "Upgrade resource",
  "gui_dialogiteminfo_label_upgraderesources": "Upgrade now",
  "gui_dialogiteminfo_label_shareitem_button" : "share",
  "gui_dialogiteminfo_label_shareitem_title" : "{name} is my {type}",
  "gui_dialogiteminfo_label_shareitem_message" : "I am now using {name} as is my {type}.",
  "gui_dialogiteminfo_label_sharescreenshot_title": "Ghost sighting",
  "gui_dialogiteminfo_label_sharescreenshot_message": "Shared a ghost sighting",
  "gui_dialogiteminfo_label_shareitem_button" : "share",
  "gui_dialogiteminfo_label_shareitem_title" : "{name} is my {type}",
  
  "gui_dialogiteminfo_label_upgrade_gold": "Requires electricity",
  "gui_dialogiteminfo_label_upgrade_wood": "Requires bux",
  "gui_dialogiteminfo_label_upgrade_stone": "Requires protoplast",
  "gui_dialogiteminfo_label_upgrade_iron": "Requires detritus",
 
  "gui_dialogiteminfo_label_capacity_gold": "Capacity electricity",
  "gui_dialogiteminfo_label_capacity_wood": "Capacity bux",
  "gui_dialogiteminfo_label_capacity_stone": "Capacity protoplast",
  "gui_dialogiteminfo_label_capacity_iron": "Capacity detritus",
 
  "gui_dialogiteminfo_label_capacity_ammo_artillery": "Capacity frag", 
  "gui_dialogiteminfo_label_capacity_ammo_flare": "Capacity hellfire", 
  "gui_dialogiteminfo_label_capacity_ammo_medkit": "Capacity first aid kit", 
  "gui_dialogiteminfo_label_capacity_ammo_shockbomb": "Capacity bombs", 
  "gui_dialogiteminfo_label_capacity_ammo_barrage": "Capacity shock", 
  "gui_dialogiteminfo_label_capacity_ammo_smokescreen": "Capacity nukes", 

  //radar and scanner
  "gui_dialogiteminfo_label_radar_count" : "Phone calls",
  "gui_dialogiteminfo_label_charge_time" : "Recharge time (in seconds)",
  "gui_dialogiteminfo_label_drain_time" : "Drain time (in seconds)",
  "gui_dialogiteminfo_label_scanner_range" : "Scanner range (in meters)",
  "gui_dialogiteminfo_label_radar_range" : "Radar range (in meters)",

  //collectors and traps
  "gui_dialogiteminfo_label_capacity_car1" : "Capacity to trap type 1 ghosts",
  "gui_dialogiteminfo_label_capacity_car2" : "Capacity to trap type 2 ghosts",
  "gui_dialogiteminfo_label_capacity_car3" : "Capacity to trap type 3 ghosts",
  "gui_dialogiteminfo_label_capacity_car4" : "Capacity to trap type 4 ghosts",
  "gui_dialogiteminfo_label_capacity_car5" : "Capacity to trap type 5 ghosts",
  "gui_dialogiteminfo_label_capacity_car6" : "Capacity to trap type 6 ghosts",
  "gui_dialogiteminfo_label_capacity_car7" : "Capacity to trap type 7 ghosts",
  "gui_dialogiteminfo_label_capacity_car8" : "Capacity to trap type 8 ghosts",
  
  // artilary
  "gui_dialogiteminfo_label_damage" : "Damage",
  "gui_dialogiteminfo_label_reload" : "Reload",
  
  //troops
  "gui_dialogiteminfo_label_transition_speed" : "Speed",
  
  "gui_dialogiteminfo_label_hit_points": "Hit points",
  "gui_dialogiteminfo_label_dps": "Damage per second",
  "gui_dialogiteminfo_label_rpm": "Rounds per minute",
  "gui_dialogiteminfo_label_price_placing": "Costs",
  
  "gui_dialogiteminfo_label_actor_count": "Max available",
  "gui_dialoginstant_upgrade_okfund": "Purchase the missing resources for {price} coins?",
  "gui_dialoginstant_upgrade_nofund": "You will need {price} coins to complete the upgrade. You currently have {left}.",
  
  "gui_dialogiappurchase_complete": "Thank you for purchasing the {name} package having {count} coins for {price} {currency}<br><img src='{preview}'/>",
  
  "time_format_hours": " hours",
  "time_format_minutes": " minutes",
  "time_format_seconds": " seconds",
  "time_format_days": " day(s)",

  "gui_attack_button_targets_title": "Threats",
  "gui_attack_button_targets_message": "We have detected {attack_count} additional high profile threats in your area. Eliminate them ASAP.",
 
  "attack_details_title": "Location spoils",
  "attack_details_message": "<b class='font-effect-outline'>Threat level {attack_level}</b><br>at {name}. <br><br>Your budget starts at {gold_budget}.<br>Do you want to attack the zombies?",
  "attack_details_button": "attack",

  "gui_warning_title_error": "warning",
  "gui_warning_title_suggestion": "Oops...try",

  //warnings
  "gui_warning_message_e1002": "You can only build one device at a time",
  "gui_warning_message_e1003": "{item_name} requires scanner level {hq_level_required}",
  "gui_warning_message_e1004": "{item_name} max level upgrade reached",
  "gui_warning_message_e1005": "need to upgrade scanner level {hq_level_required} to add more items",
  "gui_warning_message_e1006": "{item_name} requires total {xp_required} XP you have {xp_count}",
  "gui_warning_message_e1007": "{item_name} requires {upgrade_price} in {upgrade_currency}",
  "gui_warning_message_e1008": "{item_name} requires XP level {xp_level_required}",
  "gui_warning_message_e1009": "{item_name} requires armoury level {armory_level_required}. Current level is {armory_level}",
  "gui_warning_message_a2101": "Problem creating actor.",
  "gui_warning_message_e1051": "{currency} storage is full. Could not save {amount_overflow}. Please upgrade the facility.",
  "gui_warning_message_e1052": "You do not have enough {currency} for an attack. You have {currency_amount} but need {attack_price} {currency}.<br><br>Check your safe houses for source of income {currency}.",
  "gui_warning_message_e2311": "Game economy exception",
  "gui_warning_message_a2312": "No trap device has been created. Create one by selecting the first weapon in traps menu.",
  "gui_warning_message_a2313": "Location failed",
  "gui_warning_message_a6101": "{message}",
  "gui_warning_message_a6102": "Authentication required",
  "gui_warning_heading_a6102": "Authentication",
  "gui_warning_message_g0101": "Oh no! An error occurred (and we have logged it for further investigation). Reason was ",
  "gui_warning_message_a6202": "Could not save your progress to server",
  "gui_warning_heading_a6202": "Save failed",
  "gui_warning_message_a6212": "Authentication required",
  "gui_warning_heading_a6212": "Save failed",
  "gui_warning_message_p1101": "Sorry, IAP purchase failed. Make sure you are logged in and authenticated. The reason given was {error_message}. Code {error_code}",
  "gui_warning_heading_p1101": "AIP failed", 
  "gui_warning_message_p1102": "The purchase was cancelled",
  "gui_warning_heading_p1102": "Cancel purchase",   
  "gui_warning_message_m1002": "The player XP level is {xp_their} but you are currently at {xp_mine}. You require at least XP level {xp_recomended} to fight this opponent.",
  "gui_warning_heading_m1002": "Cancel purchase",   
  //"gui_warning_message_g0102": "Could not find any resources near your location. Try capturing a building in this area and then try again.",
  //"gui_warning_message_g0102": "Could not find any resources near your location. Try selecting another attack location",
  "gui_warning_message_g0110": "You have not authenticated yourself. Your progress will be lost. Are you sure you want to leave?",
  "gui_warning_message_g0111": "Are you sure you want to leave?",
  
  //misc warnings
  "warning_iap_platform_notsupported_detail": "Thanks for trying to make an in-pp-purchase. But unfortunately only the Facebook platform supports this action at the moment. To make a purchase simply try again here <br><br><br> <a class='button_link' href='https://apps.facebook.com/zombiebattlegrounds/'>Zombie Battle Grounds on Facebook</a>",
  "warning_iap_platform_notsupported_title": "IAP platform",
  "warning_sys_locationlookupfailed": "Browser location lookup failed. Don’t worry, this takes about 10 seconds. Let’s try that again. If you’ve already tried this you may need to reset the geo-location settings in your browser preferences.",
  
  //item details
  "headquarters_details": "Use the scanner to move towards and trap ghosts",
  "residence_details": "Generator creates the electricity needed for our devices",
  "goldstorage_details": "Battery stores electricity for your devices",
  "sawmill_details": "Receaves capital (bux) needed to build technology",
  "woodstorage_details": "Stores bux needed for our technology development",
  "quarry_details": "Creates protoplasm that is used to attract the dead. Protoplasm is the living contents of a cell that is surrounded by a plasma membrane",
  "stonestorage_details": "Cryogenic storage of protoplasma",
  "ironmine_details": "Creates detritus through decomposition, the process through which organic matter is decomposed",
  "ironstorage_details": "Aquarium is used to store decomposed organic matter",
  "vault_details": "Protects (some percentage) of our valuables from damage",
  "snipertower_details": "Traps level 1 ghost types",
  "machinegun_details": "Traps level 2 ghost types",
  "mortar_details": "Traps level 3 ghost types",
  "cannon_details": "Traps level 4 ghost types",
  "flamethrower_details": "Traps level 5 ghost types",
  "boomcannon_details": "Traps level 6 ghost types",
  "rocketlauncher_details": "Traps level 7 ghost types",
  "landminesmall_details": "Traps level 8 ghost types",
  "landminelarge_details": "Traps level 9 ghost types",
  "landingcraft_details": "",
  "gunboat_details": "Scanner configures the scan range",
  "sculptor_details": "",
  "radar_details": "Radar effects new discoverable ghosts as well as the scan range",
  "armory_details": "Research and upgrade facility for defence and projectiles", 
  "captured_details": "Location that has been captured and secured by you", 
 
  "rifleman_details": "Motorcycle creeps are fast and furious, shooting franticly at nearby towers",
  "heavy_details": "Cars are speedy vehicles with good armour",
  "zooka_details": "Vans are steady-going vehicles with heavy ammunition",
  "warrior_details": "Vans are slow going vehicles with heavy artillery",
  "tank_details": "Tanks are slow going vehicles with large cannons",
  "medic_details": "Medics are fast vehicles that will heal any creep in their vicinity",
  
  "artillery_details": "A fragment grenade",
  "flare_details": "Molotov cocktail is a petrol bomb that rains fire from above",
  "medkit_details": "A medical kit will give health to nearby defenders",
  "shockbomb_details": "A container filled with explosives designed to explode on impact",
  "barrage_details": "A stun grenade slows down vehicles",
  "smokescreen_details": "Mini nuke that will devastate local surroundings",
  
  "iap01_details": "A pouch of coins should be enough",
  "iap02_details": "A bag of coins should be to carry you on a bit",
  "iap03_details": "With a pot of coins, we should be able to stir up some trouble",
  "iap04_details": "A crate of coins should bury the enemy",
  "iap05_details": "A safe of coins is the safest bet",
  
  //tutorial
  "tutorial_says_welcome": "Are you ready to catch some ghosts?",
  "tutorial_says_authenticate": "Authenticate yourself and I will check with my commanding officer that everything adds up",
  "tutorial_says_validate": "Let’s just see about that. Authenticate yourself and I will check with my C.O.",
  "tutorial_says_registerask": "What should we call you?",
  "tutorial_says_registernew": "We are always looking for new talent. Here is some start-up capital.",
  "tutorial_says_registergave": "No problem",
  "tutorial_says_create_hq": "Let’s start you off by initializing your scanner",
  "tutorial_says_locate_hq": "We need your geo-location.<br>Accept the terms and then,<br>then press OK",
  "tutorial_says_build_hq": "Excellent! <br>Lets create your scanner",
  "tutorial_says_create_defense": "We need a ghost trap.<br>Select the button below with the red circle. <br><br>Then the first device in the traps category.",
  "tutorial_says_attack_scan": "We are getting reports of ghost activity.<br>Lets got to that location and check it out.<br><br>When you are near select the<br>scanner button to trap the ghosts.",
  /*"tutorial_battlefirst": "You have secured the building, collect your reward here on the left. Continue securing the entire area",*/
  "tutorial_socialconnect": "We need to authenticate you so we can save your progress.<br>We recommend you do this now but if you want to do it later then you can authenticate through preferences.",
  /*"achivement_battlefirst": "We need to secure the surrounding buildings. Attack and capture a local building.",*/
  "achivement_usediamonds": "If you are in a hurry you can always select the <b>finish now</b> button to purchase the resources you need.",
  "achivement_upgradebuildings": "Upgrading devices is dead easy. Just select the device you want to upgrade on the map and press the upgrade button. You will even gain experience points.<br><br>If you don’t have the resources, simply buy them with coins.",
  "achivement_socialconnect": "Connect with people, be social, man!",
  "achivement_socialshare": "Let your friends know!",
  "achivement_upgradearmorytroops": "You need ghosts to defend your devices during attacks",
  "achivement_upgradearmorymanual": "Upgrade your armoury for your scanner during aerial attacks",
 
  "tutorial_button_yes": "YES",
  "tutorial_button_no": "NO",
  "tutorial_button_restart": "Restart",
  "tutorial_button_done": "OK",
  "tutorial_button_thanks": "Thanks",
  
  "tutorial_battletutoralstarts": "When checking for zombies in a location we often get attacked by the enemy.<br><br>You must be ready to protect your buildings by placing defense towers along the attackers' path.",
  "tutorial_battletutoral_1": "You can see how much money you have<br>and the amount of waves left on your top left", 
  "tutorial_battletutoral_2": "When you are in trouble you can use the air support bombs.<br>Have in mind that it takes time to load them and you have limited supply.",
  "tutorial_battletutoral_3": "The lower bottom will be populated with the weapons you have developed. They also are in limited supply so be mindfull when placing them.",
  "tutorial_battletutoralends": "By choosing a location near the highlighted path you can select and place towers to shoot at the oncoming creeps.<br><br>Lets start the battle.",
 
  "achivement_accept": "collect rewards",
  "achivement_complete": "Complete",
  "achivement_queued": "more",
  "achivement_accepted": "collected",
  
  "social_request_delegate_title": "{name} is overrun by zombies",
  "social_request_delegate_message": "Help me in ridding {name} at {street_name} of zombies",
  "social_request_delegate_message_noaddress": "Help me in ridding {name} of zombies",
  "social_request_delegate_defaultstreet": "nearby",

  "social_notification_attacksuccess_title": "Successfully attacked you",
  "social_notification_attacksuccess_message": "Successfully attacked you",
  "social_notification_attackfailed_title": "Failed while attacked you",
  "social_notification_attackfailed_message": "Did not successfully attacked you",
  
  "social_message_joinmessagelist_title": "Has joined the battle",
  "social_message_joinmessagelist_message": "Exciting times!",
/*
  "social_message_initmessagelist_title": "Welcome to the jungle",
  "social_message_initmessagelist_message": "You have now officially joined the fight for terratories",
  "social_message_initmessagelist_fromname": "General",
*/
  "main_networkprogress_route_loading": '<p>Scanning</p>',
  "main_networkprogress_route_error": "Fetching route failed, try again later",
  "main_networkprogress_attractions_loading": "Loading locations from Foursquare",
  "main_networkprogress_attractions_error": "Loading locations failed, try again later.",
  "attribution_button_fourquare_itemdetails": "location details",

  "menuitems_shelf_details_title_nowavailable": "This item is available, click for more details.",
  "menuitems_shelf_details_title_notavailable": "This items are not available, click for more details.",
  "gui_dialogiteminfo_label_buyresources_tooltip": "Purchase missing resources required for upgrade using coins",

  "missing_resources_nowavailable": "available",
  "missing_resources_notavailable": "unavailable",

  "infowindow_payoutbutton_tooltip": "Collect resource",
  "infowindow_buttons_details_tooltip": "Resource information",
  "infowindow_buttons_upgrade_tooltip": "Instant upgrade",
  "infowindow_buttons_attack_tooltip": "Attack from this location",
  "infowindow_buttons_research_tooltip": "Reasearch and upgrade armory",

  "battle_hud_weapon_button_price_tooltip": "Price to place weapon",
  "battle_hud_weapon_button_used_tooltip": "Weapons currently available",
  "battle_hud_weapon_button_image_tooltip": "Upgraded weapon",
  "battle_hud_bombs_button_image_tooltip": "Current bomb upgrade",
  "battle_hud_bombs_button_used_tooltip": "Bombs available",
  "infowindow_buttons_payout_tooltip": "Payout resource",

  //ghostburster specifics

  "gui_battle_watch_false": "faild scanning",
  "gui_battle_watch_searching": "searching",
  "gui_battle_watch_tracking": "tracking",
  "gui_battle_watch_errorlocation": "location failed",
  "gui_battle_watch_errorunavailable": "location unavailable",
  "gui_battle_watch_charging": "charging",
  "gui_battle_watch_idle": "ready",

  "gui_battle_message_charging_text": "Charging scanner power<br>Try upgrading the scanner for shorter scanning time", 
  "gui_battle_message_charging_title": "Charging",

  "gui_battle_collect_ghosts_text": "Continue to enter burst mode and blast these ghosts<br><br><a class='button_link' href='#' onclick='collectGhostScore()'>Continue</a>", 
  "gui_battle_collect_ghosts_title": "Burst ghosts?",
  "gui_battle_collect_ghosttypes_text": "From trap {type} collected {ghost_count} <br>",
  "gui_battle_collect_ghostsnone_text": "The containment field does not have any ghosts.<br>Try clearing the ghosts traps.", 
  "gui_battle_collect_ghostsnone_title": "No ghosts",

   "gui_battle_collect_missingtraps_text": "You do not have the traps required to trap this ghost.<br><br>Build one in the traps menu.",
   "gui_battle_collect_missingtraps_title": "No traps",
   "gui_battle_collect_missingghost_text": "No ghosts where detected within the scanner range.<br><br>Move more closely, upgrade scanner or get more experiance points.",
   "gui_battle_collect_missingghost_title": "Not close enough"
 
};
var _langgui_en = {
  ".mainattack_button .gui_button_label_l": "Attack",
  ".mainitems_button .gui_button_label_l": "Build",
  ".menuitems_button_economy .gui_button_label_l": "Economy",
  ".menuitems_button_defense .gui_button_label_l": "Traps",
  ".menuitems_button_support .gui_button_label_l": "Support",
  ".gui_button_battledone .gui_button_label_m": "OK",
  ".menudialog_countdown .menudialog_frame .gui_title_label_m": "Countdown",
  ".menudialog_countdown p": "There are zombies here and they are attacking us!!",
  ".menudialog_research .gui_title_label_m": "Armoury",
  ".menudialog_instantcomplete .menudialog_frame .gui_title_label_m": "Upgrade instantly",
  ".menudialog_instantcomplete .menudialog_frame .gui_button_label_m": "OK",
  ".menudialog_preferences .menudialog_frame .gui_title_label_m": "Preferences",
  ".menudialog_preferences_soundvolume": "Volume",
  ".menudialog_preferences_musicmuted": "Mute music",
  ".menudialog_preferences_soundmuted": "Mute all",
  ".menudialog_messages .gui_title_label_m": "Messages",
  ".menudialog_character h2" : "Hello there",
  ".menudialog_battleresult .menudialog_frame .gui_title_label_m": "Title",
  ".menudialog_buyaipframe h2": "Thanks",
  ".menudialog_battleresult .gui_button_battledone": "Awesome",
  ".purchase_iap": "Buy coins",
  
  "#hud_actor_troops_rifleman h2": "motorcycle",
  "#hud_actor_troops_heavy h2": "car",
  "#hud_actor_troops_zooka h2": "van",
  "#hud_actor_troops_warrior h2": "truck",
  "#hud_actor_troops_tank h2": "tank",
  "#hud_actor_troops_medic h2": "&nbsp",
  
  "#hud_actor_manual_artillery h2": "Frag grenade",
  "#hud_actor_manual_flare h2": "Hellfire",
  "#hud_actor_manual_medkit h2": "First aid kit",
  "#hud_actor_manual_shockbomb h2": "Bomb",
  "#hud_actor_manual_barrage h2": "Stun grenade",
  "#hud_actor_manual_smokescreen h2": "Nuke",
  "#menudialog_preferences_soundvolume_container .preference_section": "master volume", 
  "#menudialog_preferences_musicvolume_container .preference_section": "music volume",
  "#menudialog_preferences_feedback_button": "Give us your feedback",
  "#menudialog_preferences_logout_button": "Logout",
  "#menudialog_preferences_socialaccount_button": "Social account",
  
  "#menudialog_battleresult .button_image_share": "Share",
  ".menudialog_battledetails .gui_button_battleattack": "attack",
  ".menudialog_battledetails .gui_button_battletutorial": "confirm attack",
  ".menudialog_battledetails .gui_button_battledelagate": "ask a friend",
  ".menudialog_messages .ui_border_content": "Checking messages ...",

  //ghostburster
  ".menudialog_shareimage h2": "Sightings"

};

var _langguitooltips_en = {
  ".mainitems_button": "Build",
  ".mainattack_button": "Attack",
  ".menuitems_button_economy": "Economy menu allows you to create resource devices",
  ".menuitems_button_defense": "Collectors menu allows you to create machines attracting ghosts",
  ".menuitems_button_support": "Support menu allows you to create support devices",
  ".mainconfig_button": "Preferences menu",
  ".mainachivements_button": "Achivements",
  ".mainmessages_button": "Messages and hints",
  ".menudialog_frame_x": "Close dialog box",

  "#progressbar_gold": "Energy available",
  "#progressbar_wood": "Bux available",
  "#progressbar_stone": "Protoplasm available",
  "#progressbar_iron": "Detritus available",
  "#progressbar_diamonds": "Add coins",
  "#progressbar_xp": "Your curerent level experiance progress",
  "#xp_value": "Your experiance level",
  "#battle_hud_budget": "Current budget",
  "#progressbar_creeps": "Creeps progress",
  "#battle_hud_enemy_image": "Creeps type",
  "#battle_hud_cancel_button": "End battle",
  "#battle_hud_gunshipimage": "Current gunship upgrade",
};

var _langgui = _langgui_en;
var _langguitooltips = _langguitooltips_en;
var _lang = _lang_en;
