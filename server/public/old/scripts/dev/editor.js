window.editor_tracks_changed = false;
var editor_tracks = new jsoneditor.JSONEditor(document.getElementById("dialog-modal-soundtrack-editor_tracks"),{
  change:function(){
    window.editor_tracks_changed = true;
  },
  history: true
});
editor_tracks.set(sound_tracks);

window.editor_soundlist_changed = false;
var editor_soundlist = new jsoneditor.JSONEditor(document.getElementById("dialog-modal-soundtrack-editor_lists"),{
  change:function(){
    editor_soundlist_changed = true;
  },
  history: true
});
editor_soundlist.set(sound_lists);

setInterval(function(){
  if(window.editor_tracks_changed){
    editor_tracks_changed = false;
  }
  if(window.editor_soundlist_changed){
    window.editor_soundlist_changed = false;
  }
}, 2000);

function copyData(v){
  data = "var _sound_tracks = " + JSON.stringify(editor_tracks.get()) + ";\n\n\n";
  data = data + "var _sound_lists = " + JSON.stringify(editor_soundlist.get()) + ";\n\n\n";
  data = data + "var _sound_events = " + JSON.stringify(sound_events) + ";\n\n\n";
  copyToClipboard(data);
}

function setNavigation(){
  var pages = {"#sound":null,"#state":null,"#battle":null};
  for(var p in pages){
    $(p).hide();
    $(p + "_menu_item").removeClass("active");
  }
  setTimeout(function(){
    $(window.location.hash).fadeIn(500);
    $(window.location.hash + "_menu_item").addClass("active");
  }, 500);
}

function resetGame(){
  cacheStorageRemove("state");
  cacheStorageRemove("preferences");
}

function test(){
  cacheStorageSave("settings", JSON.stringify(editor_tracks.get()));
  document.location.href = "index.html";
}

function save(){
  var data = JSON.stringify(editor_tracks.get());
  cacheStorageSave("settings", data);
  copyToClipboard(data);
}
function reset(){
  cacheStorageRemove("settings");
  cacheStorageRemove("state");
}

function copyToClipboard(content) {
  var text = document.getElementById("text_area");
  text.innerHTML = content;
}

//////// states

function saveState(){
  var state_name = "state_name_" + $("#state_name").val();
  cacheStorageSave(state_name, cacheStorageLoad("state"));
  loadStates();
}

function loadState(){
  var state_name = $('#states').find(":selected").val();
  if (state_name){
    cacheStorageSave("test_state", state_name);  
    cacheStorageSave("state", cacheStorageLoad(state_name));  
  }else{
    cacheStorageRemove("test_state");  
    cacheStorageRemove("state");  
  }
}

function loadStates(){
  var state_name = cacheStorageLoad("test_state");
  $("#states").html("<option></option>");
  for(var n in localStorage){
    var sel = "";
    if (state_name == n){ sel = "selected";}
    if (n.indexOf("state_name_") == 0){
      $("#states").append("<option "+sel+" value='" + n + "'>" + n.replace("state_name_", "") + "</option>");
    }
  }          
}

function loadEventMapping(){
  $("#sound_trigger").html("");
  $("#sound_played").html("<option value='null'></option>");
  var s, tmps = [];
  for(s in _sound_events_defaults){ if(!sound_events[s]){ sound_events[s] = _sound_events_defaults[s]; }; } //add new sound events to old event list
  for(s in sound_events){ tmps.push(s); }
  tmps.sort();
  for(s in tmps){
    $("#sound_trigger").append("<option value='" + tmps[s] + "'>" + tmps[s] + "</option>");
  }

  var snd_tracks = smgr.getTracks();
  tmps = [];
  for (s in snd_tracks){tmps.push(s);}
  for (s in sound_lists){tmps.push(s);}
  tmps.sort();
  for(s in tmps){
    $("#sound_played").append("<option value='" + tmps[s] + "'>" + tmps[s] + "</option>");
  }

}

$("#sound_trigger").change(function(){
  var trigger_name = $('#sound_trigger').find(":selected").val();
  var playing_name = sound_events[trigger_name] || "null";
  $('#sound_played').val(playing_name);

});
$("#sound_played").change(function(){
  var trigger_name = $('#sound_trigger').find(":selected").val();
  var played_name = $('#sound_played').find(":selected").val();
  sound_events[trigger_name] = played_name;
  cacheStorageSave("edit_sound_events", JSON.stringify(sound_events));
});

//sound
smgr.init(sound_tracks, {"categorized": true, "directory": "media/sounds/", "enabled": true, "music_fadeout": 1000, "extension":".mp3"});

var sound_prop = {"volume":{"default":1}, "rate":{"default":1}, "loop":{"default":false}, "file":{"default":"FILE-NAME"}};
$("#sound_tracks").change(function(){
  var sound_name = $('#sound_tracks').find(":selected").val();
  for (var p in sound_prop){
    if(sound_tracks[sound_name]){
      $("#sound_track_"+p).val(sound_tracks[sound_name][p] || sound_prop[p]["default"]);  
    }else{
      $("#sound_track_"+p).val(sound_prop[p]["default"]);  
    }
    
  }
});

/*        function saveSoundTrack(){
  var sound_name = $('#sound_tracks').find(":selected").val();
  for (var p in sound_prop){
    if(p == "file"){
      sound_tracks[sound_name][p] = $("#sound_track_" + p).val();
    }else{
      sound_tracks[sound_name][p] = eval($("#sound_track_" + p).val()) || sound_prop[p]["default"];
    }
  }
}
*/

function getSoundTracksClean(sound_tracks){
  var tracks = {};
  for (var i in sound_tracks){
    tracks[i] = {};
    for (var j in sound_tracks[i]){
      if (j != "inst"){
        tracks[i][j] = sound_tracks[i][j];
      }
    }
  }
  return tracks;
}

function loadSounds(){
  var soundtracks = smgr.getTracks();
  $("#sound_tracks").html("<option></option>");
  for(s in soundtracks){
    var sel = "";
    $("#sound_tracks").append("<option value='" + s + "'>" + s + "</option>")
  }                    

  $("#sound_lists").html("<option></option>");
  for(var s in sound_lists){
    var sel = "";
    $("#sound_lists").append("<option value='" + s + "'>" + s + "</option>");
    smgr.setPlayList(s, sound_lists[s]);
  }                 

}

function saveSoundTrack(){  
  smgr.stopAll();
  cacheStorageSave("edit_sound_tracks", JSON.stringify(getSoundTracksClean(editor_tracks.get())));
  smgr.setTracks(editor_tracks.get());
  //cacheStorageSave("edit_sound_tracks", JSON.stringify(getSoundTracksClean(editor_tracks.get())));  
}

function playSoundTrack(){  
  var sound_name = $('#sound_tracks').find(":selected").val();
  smgr.play(sound_name);
}

function saveSoundList(){
    smgr.stopAll();
    //cacheStorageSave("edit_sound_lists", JSON.stringify(editor_soundlist.get()));
    loadSounds();
    cacheStorageSave("edit_sound_lists", JSON.stringify(editor_soundlist.get()));
}

function playSoundList(){
    var sound_name = $('#sound_lists').find(":selected").val();
    smgr.stopAll();
    smgr.runPlayList(sound_name);
}

loadStates();
loadSounds();
loadEventMapping();

////////////// battle

var editor_battle_attack = new jsoneditor.JSONEditor(document.getElementById("dialog-modal-battle-editor_attacker"),{
  change:function(){
    
  },
  history: true
});

var editor_battle_defense = new jsoneditor.JSONEditor(document.getElementById("dialog-modal-battle-editor_defender"),{
  change:function(){
    
  },
  history: true
});

function clearBattleLocation(){
    cacheStorageRemove("resource_locations");
    cacheStorageRemove("location_id");
    cacheStorageRemove("bounty_list");
}
function saveBattleLocation(){
  alert("Do this in game preferences");
}
function saveBattleAttacker(){
  cacheStorageSave("battle_attacker", JSON.stringify(editor_battle_attack.get()));
}
function clearBattleDefender(){
  localStorage.clearItem("battle_attacker");
}
function loadBattleAttacker(){
  var types = ["rifleman", "heavy", "zooka", "warrior", "tank", "medic"];
  var d = {
        'health': 140,
        'dps': 30,
        'weapon_sound': 'gunshot1',
        'price_placing': 10,
        'price_corpse': 2,
        'price_building': 2,
        'price_reperation': 2,
        'price_removing': 0,
        'rotation_offset': 0,
        'rotation_transition': true,
        'rotation_speed': 500,
        'placement_duration': 1000,
        'placement_sound': null,
        'placement_sound_complete': null,
        'transition_speed': 100
  };
  var configs = {};
  for (var t in types){configs[types[t]] = JSON.parse(JSON.stringify(d));}
  editor_battle_attack.set(JSON.parse(cacheStorageLoad("battle_attacker") || "null") || configs);
}

function saveBattleDefender(){
  cacheStorageSave("battle_defender", JSON.stringify(editor_battle_defense.get()));
}
function clearBattleDefender(){
  localStorage.clearItem("battle_defender");
}
function loadBattleDefender(){
  var types = ["snipertower", "machinegun", "mortar", "cannon", "flamethrower", "boomcannon", "rocketlauncher", "landminesmall", "landminelarge"];
  var d = {
        'damage_now': 0,
        'damage_max': 4,
        'weapon_damage': 1,
        'weapon_sound': 'gunshot2',
        'price_placing': 8,
        'price_corpse': 2,
        'price_building': 2,
        'price_reperation': 20,
        'price_removing': 4,
        'rotation_offset': 0,
        'rotation_transition': true,
        'rotation_speed': 500,
        'placement_duration': 1000,
        'placement_sound': null,
        'placement_sound_complete': null,
        'transition_speed': 100,
        'actor_count': 3
  };
  var configs = {};
  for (var t in types){configs[types[t]] = JSON.parse(JSON.stringify(d));}
  editor_battle_defense.set(JSON.parse(cacheStorageLoad("battle_defender") || "null") || configs);
}

loadBattleDefender();
loadBattleAttacker();

/*
  + lower sound for zoom out
  https://www.dropbox.com/sh/k63f7lihh6i4ot2/AACBgORnCbQbS7uwlWSVg3aMa/defensemap_audio
*/
