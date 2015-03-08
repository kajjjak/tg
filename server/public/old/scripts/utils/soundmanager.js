

window.smgr = {  //window.smgr >> due to sound loading using eval in line 55
    init: function(tracks, options){
        this.options = options || {};
        //set defaults
        this.options.extension = this.options.extension || ".wav";
        this.options.directory = this.options.directory || "";
        this.options.enabled = this.options.enabled || false;
        this.options.debug = this.options.debug || false;
        this._music_enabled = this.options.music_enabled || true;
        this._music_volume = this.options.music_volume || 1;
        this._phonegap = this.options.phonegap || false;
        this.playlists = {};
        this._max_instance_counter = {};
        this._music_tracks = {}; //avoid creating new sounds
        this._items = {}; //items repeating sounds
        this._loadSounds(tracks);
        if(this.options.muted){Howler.mute();}
    },
    _print: function(msg){
        if(this.options.debug){
            console.info("[DEBUG] Sound manager: " + msg );
        }
    },
    _loadSound: function(s, track, options){
        if(this._phonegap){
            this.tracks[s]["inst"] = new Media(options.urls[0], function(){
                console.info("[DEBUG] Phonegap loading file " + track["file"]);
            });
            //remap functions
            this.tracks[s]["inst"].volume = this.tracks[s]["inst"].setVolume;
            this.tracks[s]["inst"].unload = this.tracks[s]["inst"].release;
            this.tracks[s]["inst"].fadeOut = this.tracks[s]["inst"].stop;
            this.tracks[s]["inst"].fadeIn = this.tracks[s]["inst"].play;
        }else{
            if (track.important){
                this.tracks[s]["inst"] = new Howl(options);
            }else{
                setTimeout('smgr.tracks["'+s+'"]["inst"] = new Howl('+JSON.stringify(options)+');', this.options.load_track_delay || 2000);
            }
        }
    },
    _loadSounds: function(tracks){
        this.tracks = {};
        if(this.options.categorized){
            for(var c in tracks){
                this.tracks = $.extend(this.tracks, tracks[c]);
            }
        }else{
            this.tracks = tracks;
        }

        for (var s in this.tracks){
            var track = this.tracks[s];
            var rate = track["rate"] || 1;

            if(track["file"]){ // if the track has a playback file then we continue loading it
                this._print("loading " + s);
                if (isNaN(parseInt(rate))){ //if this is NOT a number
                    rate = 1;
                    this.tracks[s]["playback"] = this.tracks[s]["playback"] || {};
                    this.tracks[s]["playback"]["rate_range"] = track["rate"];
                }
                var options = {
                    urls: [this.options.directory + track["file"] + this.options.extension],
                    loop: track["loop"] || false,
                    buffer: track["stream"] || false,
                    volume: track["volume"] || 1,
                    rate: rate,
                };
                this._loadSound(s, track, options);
            }else{
                this._print("loading skipped " + s + " (no sound file defined)");
            }
        }
    },
    _unloadSounds: function(){
        for (var s in this.tracks){
            try{ this.tracks[s]["inst"].unload(); }catch(e){}
        }
        this.tracks = {};
    },
    getTracks: function(){ return this.tracks; },
    setTracks: function(tracks){
        this._unloadSounds();
        this._loadSounds(tracks);
    },
    hasDebug: function(){ return this.options.debug; },
    playItem: function(name, item_id){
        //FIXME: should know what the item is currently playing and reset it if needed (expesially if repeating)
        if(this._items[item_id]){ //if this item was playing a repeating sound, lets stop it
            if(this._items[item_id]._loop){
                this._items[item_id].stop();
            }
        }
        var sound_id = smgr.play(name);
        if(sound_id){
            this._items[item_id] = sound_id;
        }
        this._print("Playing " + name + " for item " + item_id);
        return sound_id;
    },
    playMusic: function(name){
        if(name){this._music_track_name = name;} /* lets remember what to play even if sound is disabled */
        if (!this._music_enabled){ return; } /* skip playing anything at all if disabled */
        
        if(this._music_track){
            if(this._music_track.name !== this._music_track_name){/* changing music, lets stop current instance */
                this.stopMusic(this._music_track); 
            } 
        }
        //code bellow avoids creating a new instance of the music
        if(!this._music_tracks[this._music_track_name]){
            this._music_track = this._music_tracks[this._music_track_name] = this.play(this._music_track_name, {"volume": this._music_volume});
        }else{
            this._music_track = this._music_tracks[this._music_track_name];
            if(!this._music_track.pos()){ // if this track is not playing lets play it now
                this._music_track.pos(0);
            }
            var vol = /*smgr.tracks[this._music_track_name].volume || */ this._music_volume; ///HERE IS MUSIC VOLUME
            if (vol != this._music_track.volume()){ //lets fade in the volume
                this._music_track.fadeIn(vol, 400);            
            }
        }
        
        
        this._print("Playing music " + this._music_track_name);
        return this._music_track;
    },
    stopMusic: function(inst){
        inst = inst || this._music_track;
        if(inst){
            var music_instance_id = inst.name;
            inst.fadeOut(0, this.options.music_fadeout || 1000, function(){
                smgr.tracks[music_instance_id]["inst"].stop(); //when fadeout complete we stop the music (so it restarts from 0)
            });
            this._print("Stopping music " + name);
        }
    },
    hasMusic: function(){
        return this._music_enabled;
    },
    disableMusic: function(b){
        this._music_enabled = b;
        if(b){
            smgr.playMusic(sound_events[this._music_track_name]);
        }else{
            smgr.stopMusic();
        }
    },
    play: function(name, options){
        if (!name){return;}
        if (!this.options.enabled){ return; }
        try{
            this._print("Playing " + name + " with options - " + JSON.stringify(options));
            if (this.tracks[name]){ 
                var track = this.tracks[name]["inst"];
                track.volume(this.tracks[name]["volume"] || 1); //will fix the fadeOut bug for music tracks
                if(options || this.tracks[name]["playback"]){
                    options = $.extend(options || {}, this.tracks[name]["playback"]);
                    if(options.fadein){
                        track.fadeIn(options.fadein.to, options.fadein.duration);
                    }
                    if(options.rate_range){
                        track._rate = options.rate_range.from + Math.random()*(options.rate_range.to - options.rate_range.from);
                    }
                }
                if((!!this.tracks[name].max_instance_count) && (!track._loop)){
                    if(!this._max_instance_counter[name]){ this._max_instance_counter[name] = []; }
                    if(this.tracks[name].max_instance_count <= this._max_instance_counter[name].length){
                        return; // if max instances is playing lets skip this one
                    }// ok we may play one more, lets remember the track in an array
                    this._max_instance_counter[name].push(track); // add to the ends of array
                    // lets also remove it from list when done
                    var track_name = name;
                    track._onend.push(function(t){
                        //smgr._max_instance_counter[track_name].shift(); // remove first in array
                        smgr._max_instance_counter[track_name].splice(0, 1); //faster operation than splice, remove last in array
                        //console.info("Removing sound " + track_name + " from max_instance list leaving " + smgr._max_instance_counter[track_name].length + " left");
                    });
                }
                track.play();
                track.name = name;
                return track;
            }else{
                if (!smgr.playlists[name]){ var errmsg = "Sound '" + name + "' not defined in tracks list or playlist"; console.warn(errmsg); throw errmsg; }
                return smgr.runPlayList(name);
            }
        }catch(e){
            this._print("Error - " + e);
        }
    },
    stop: function(instance_id){
        if(smgr.playlists[instance_id]){
            if(smgr.playlists[instance_id]["start_track_inst"]){
                smgr.playlists[instance_id]["start_track_inst"].stop();
            }
            delete smgr.playlists[instance_id];
            return;
        }
        if(this.tracks[instance_id]){
            this.tracks[instance_id].stop();
        }
    },
    stopAll: function(){
        for (var instance_id in smgr.playlists){
            if(parseInt(instance_id)){//then a instance to stop
                delete smgr.playlists[instance_id];
            }
        }
    },
    setPlayLists: function(slist){
        for (var i in slist){
            this.setPlayList(i, slist[i]);
        }
    },
    setPlayList: function(list_name, tracks){
        /*
            smgr.setPlayList("voodoo", {"loop": true, "delay":{"from":1000, "to": 5000}, "tracks":["gunshot1", "gunshot2"]});
            smgr.setPlayList("voodoo", {"loop": true, "delay":1000, "tracks":["gunshot1", "gunshot2"]});
            smgr.setPlayList("voodoo", {"loop": true, "delay":1000, "tracks":["gunshot1", "gunshot2"]});
            selection
                random: will select a random sound (trying to randomize again if selected again)
                sequential: will select next file in line (and start from beginning if all files have been played)
            loop
                true: will play another sound when previus sound has stopped playing using selection method
                false: will play a single file using the selection method
            delay
                object is a dictionary with {from: MS, to: MS} OR can also be a integer (denoting MS)
            tracks
                are the tracks that has been defined. Note that the tracks options will also apply (allowing for fadeIns)
        */
        this.playlists[list_name] = tracks;
    },
    runPlayList: function(list_name){
        /*
            Makes a copy of the list having the instance_id
        */
        var instance_id = null;
        try{
            this._print("Playing playlist " + list_name);
            var instance_id = list_name;
            if (smgr.playlists[list_name]["loop"]){ //since this will be looping we will create a new playlist as instance
                instance_id = new Date().getTime();
                smgr.playlists[instance_id] = JSON.parse(JSON.stringify(smgr.playlists[list_name]));
            }
            if (smgr.playlists[instance_id]["start_track"]){
                smgr.playlists[instance_id]["start_track_inst"] = smgr.play(smgr.playlists[list_name]["start_track"]);
            }
            setTimeout(smgr._playListItem, smgr.playlists[list_name]["start"] || 0, -1, instance_id);
        }catch(e){
            this._print("Error - " + e);
        }
        return instance_id;
    },
    _playListItem: function(last_played, list_name){
        if(!smgr.playlists[list_name]){ return; }
        smgr._print("Playing playlist req: " + list_name);
        var itm, delay = smgr.playlists[list_name]["delay"] || 0;
        var next_track = Math.floor(Math.random() * smgr.playlists[list_name]["tracks"].length); if(next_track == last_played){next_track =  Math.floor(Math.random() * smgr.playlists[list_name]["tracks"].length);} //try again
        if (smgr.playlists[list_name]["selection"] == "sequential"){
            next_track = last_played + 1;
            if (smgr.playlists[list_name]["tracks"].length <= next_track){ next_track = 0; }
        }
        if (typeof(delay) == "object"){
            delay = delay.from + Math.floor(Math.random() * (delay.to - delay.from));
        }
        if(smgr.playlists[list_name]["loop"]){
            itm = smgr.playlists[list_name]["tracks"][next_track];
            track = smgr.play(itm);
            if(track){
                track._onend[0] = function(){
                    setTimeout(smgr._playListItem, delay, next_track, list_name);
                };                
            }
        }else{
            itm = smgr.playlists[list_name]["tracks"][next_track];
            track = smgr.play(itm);
        }
    },
    setVolume: function(v, channel){
        /*
            There is currently 2 channels
             - undefined (default master volume)
             - music channel
        */
        this._print("Volume: " + v + " channel " + channel);
        if(channel == "music"){
            this._music_volume = v;
            if(this._music_track){
                this._music_track.volume(v);
            }
        }else{
            return Howler.volume(v);
        }
    },
    getVolume: function(channel){
        /*
            There is currently 2 channels
             - undefined (default master volume)
             - music channel
        */
        if(channel == "music"){
            return this._music_volume;
        }else{
            return Howler.volume();
        }
    },
    setEnabled: function(b){
        this.options.enabled = b;
    },
    setMute: function(b){
        this._print("Mute: " + b);
        if(b){Howler.mute();}
        else{Howler.unmute();}
    },
    hasMuted: function(){
        return Howler._muted;
    },
    getFileList: function(){
        //return what files are being used
        var file_names = [];
        tracks = smgr.getTracks();
        for (var t in tracks){ if (tracks[t].file){ file_names.push(tracks[t].file + this.options.extension); } }
        return file_names;
    }

};



/*

var defenders = mmgr.getActorsByType("defender"); for (var i in defenders[1].cds){ defenders[1].cds[i].id }

*/