/* Copyright 2014 kajjjak
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
     http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
////////////////////////////////////////////////////////////////////////////
var messages_list = {};

function handleRequests(){
    //fetches requests
    //builds a message board
    //
}

function getMessages(){
   /*
      Will always return an array
   */
   return messages_list;
}

function _checkFBPermissions(permission, callback_yes, callback_no){
   if(!window.FB){ callback_no(); return; }
   FB.api('/me/permissions', function (response) {
      console.log("Users FB permissions " + response);
      for(var i in response["data"]){
         if(response["data"][i].permission == permission){
            if(response["data"][i].status == "granted"){
               callback_yes();
            }else{
               //ask user for permission to get the friends
               callback_no();
            }
            return;
         }
      }
   } );   
}

function _updateFriendsListFB(){
   if(!window.FB){ return; }
   FB.api(
       "/me/friends/",
       function (response) {
         if (response && !response.error) {
            // handle the result 
            console.info("Got this: " + JSON.stringify(response));
            var friends_id = [];
            for(var i in response.data){
               friends_id.push(response.data[i].id);
            }
            sendSocialMessage("message_join", _lang["social_message_joinmessagelist_title"], _lang["social_message_joinmessagelist_message"], friends_id, {});
         }
      }
   );   
}

function addFriendsToMessageList(){
   console.info("Fetching updated friends list to sync them");
   if(!window.FB){ return; }
   _checkFBPermissions("user_friends", _updateFriendsListFB, function(){
      FB.login(function(response) {
        if (response.authResponse) {
            _updateFriendsListFB();
        } else {
          // user did not give permission
        }
      }, {scope:'user_friends'});      
   });
}

function updateFriendsList(){
   /* This should be done weekly */
   var date_joined = game_state.getItem("messages_join") || 0;
   var date_now = new Date().getTime();
   if ((date_joined + (2628000000/4)) < date_now){ //every month/4
   //if ((date_joined + (1000*60*5)) < date_now){ //every 5 minutes
      addFriendsToMessageList();
      game_state.setItem("messages_join", date_now);
   }   
}

function _formatDialogMessages(res){
   if(res.success){
      var message_count = 0;
      var message_type_destroyed = 0;
      var msgtbl = "";
      var message_read = game_state.getItem("messages_read") || {};
      for (var i in res.response){
            var msg = res.response[i].value;
            messages_list[i] = msg;
            var style_readvsunread = "menudialog_messages_row_isread";
            if(!message_read[msg.mid]){
                  style_readvsunread = "menudialog_messages_row_unread";
                  message_count = message_count + 1;
            }
            var btn_accept = "<div class='menudialog_messages_btnaccept button_link' onclick=\"btnTE(1301, this, 1)\">" + _lang["gui_menudialog_messages_btnaccept"] + "</div>";
            var btn_attack = "<div class='menudialog_messages_btnattack button_link' onclick=\"btnTE(1301, this, -1)\">" + _lang["gui_menudialog_messages_btnattack"] + "</div>";
            var message = "";
            var subject = msg.subject;
            if (msg.type == "attack_success"){
                  subject = StringFormat(_lang["gui_menudialog_messages_attacksuccess_title"], msg.data.bounty.location);
                  message = StringFormat(_lang["gui_menudialog_messages_attacksuccess_text"], msg.data.bounty.location);
                  btn_accept = "";
            }else if(msg.type == "attack_failed"){
                  subject = StringFormat(_lang["gui_menudialog_messages_attackfailed_title"], msg.data.bounty.location);
                  message = StringFormat(_lang["gui_menudialog_messages_attackfailed_text"], msg.data.bounty.location);
                  btn_accept = "";
            }else if(msg.type == "attack_request"){
                  //format we get for msg.data is 
                  /*
                     {"name":"Reykjavík Ro ...","attack_level":"2","gold":"55","wood":"19","xp":"126","gold_budget":"304","id":"4b0e7b9bf964a520e05723e3","location":{"lat":"64.14365155303166","lng":"-21.92642813763542"},"target":["64.14279478873203","-21.93374529399746"]}
                  */
                  subject = StringFormat(_lang["gui_menudialog_messages_attackrequest_title"], msg.data);
                  message = StringFormat(_lang["gui_menudialog_messages_attackrequest_text"], msg.data);
            }else if(msg.type == "message_join"){
                  subject = StringFormat(_lang["social_message_joinmessagelist_title"], msg);
                  message = StringFormat(_lang["social_message_joinmessagelist_message"], msg);
            }else if(msg.type == "message_init"){
                  subject = StringFormat(_lang["social_message_initmessagelist_title"], msg);
                  message = StringFormat(_lang["social_message_initmessagelist_message"], msg);
                  btn_accept = btn_attack = "";
            }
            var message_area = "<div class='menudialog_messages_text'><span>" + message + "</span><span style='display:block;'>" + btn_accept + btn_attack + "</span></div>"; //
            var message_preview = "<div class='menudialog_messages_preview'><div class='menudialog_messages_sender' pid='" + msg.from.id + "'>" + msg.from.name + "</div><div class='menudialog_messages_subject font-effect-outline'>" + subject + "</div></div>"
            msgtbl = msgtbl + "<div id='message_created_" + msg.created + "' class='menudialog_messages_row " + style_readvsunread + "' onclick=\"btnTE(1301, this, 0)\">" + message_preview + message_area + "</div>";
            
            if(msg.type == "attack_success"){
                  game_state.addDestroyedBase(msg.mid, message_type_destroyed*1000);
                  message_type_destroyed = message_type_destroyed + 1;
            }
      }
      if(msgtbl){$(".menudialog_messages .ui_border_content").html(msgtbl);}
      else{/*$(".menudialog_messages .ui_border_content").html(_lang["gui_menudialog_messages_nomessages"]);*/}
      updateMessageCount(message_count);
   }else{
      handleException(res);
   }  
}

function updateDialogMessages(){
   var hq_level = game_state.getHeadQuarterLevel();
   var url = url_domain + "api/social/messages/"+getUserAuthKey();
   if(hq_level < 3){
      $(".menudialog_messages .ui_border_content").html(_lang["gui_menudialog_messages_notunlocked"]);
      return false;
   }
   updateFriendsList();
   if(hasAuthenticated()){
      var auth = game_state.getAuthentication() || {"facebook":{}};
      //FIXME: SECURITY ISSUE SHOULD NOT HAVE TO PASS THE FACEBOOK ID, SERVER SHOULD KNOW IT
      url = url + "?fid=" + auth.facebook.id;
   }
   $.getJSON(url, _formatDialogMessages);   
}
/*
var request_messages_data = 
{
   "data":[
      {
         "application":{
            "name":"Urban Battle Map - Server test",
            "namespace":"urbanbattlesrvtst",
            "id":"248418481997473"
         },
         "created_time":"2014-11-12T23:39:17+0000",
         "data":"{\"type\":\"attack_location\",\"data\":{\"categories\":[{\"name\":\"category name\"}],\"name\":\"Te & Kaffi\",\"attack_level\":3,\"gold\":168,\"wood\":6,\"xp\":5,\"gold_budget\":140,\"id\":\"4bf7ef695efe2d7f6bbc6934\",\"location\":{\"lat\":64.14561151636764,\"lng\":-21.92824959754944}}}",
         "from":{
            "id":"1458107131123544",
            "name":"John Amggbhaceada Panditwitz"
         },
         "message":"Help me in securing Te & Kaffi of zombies",
         "to":{
            "id":"1491083887820547",
            "name":"Sharon Amgefhejeaia Narayananwitz"
         },
         "id":"528937340542731_1491083887820547"
      },
      {
         "application":{
            "name":"Urban Battle Map - Server test",
            "namespace":"urbanbattlesrvtst",
            "id":"248418481997473"
         },
         "created_time":"2014-11-12T08:29:47+0000",
         "data":"{\"type\":\"attack_location\",\"data\":{\"categories\":[{\"name\":\"category name\"}], \"name\":\"CINTAMANI\",\"attack_level\":3,\"gold\":168,\"wood\":6,\"xp\":5,\"gold_budget\":140,\"id\":\"4d9f358d925f236af70b4a44\",\"location\":{\"lat\":64.14665,\"lng\":-21.933812}}}",
         "from":{
            "id":"1458107131123544",
            "name":"John Amggbhaceada Panditwitz"
         },
         "message":"Help me in securing CINTAMANI of zombies",
         "to":{
            "id":"1491083887820547",
            "name":"Sharon Amgefhejeaia Narayananwitz"
         },
         "id":"275471079243355_1491083887820547"
      },
      {
         "application":{
            "name":"Urban Battle Map - Server test",
            "namespace":"urbanbattlesrvtst",
            "id":"248418481997473"
         },
         "created_time":"2014-11-12T08:29:12+0000",
         "data":"{\"type\":\"attack_location\",\"data\":{\"categories\":[{\"name\":\"category name\"}],\"name\":\"Bakarí Sandholt\",\"attack_level\":3,\"gold\":168,\"wood\":6,\"xp\":5,\"gold_budget\":140,\"id\":\"4b0588aff964a520f4d322e3\",\"location\":{\"lat\":64.145121,\"lng\":-21.926212}}}",
         "from":{
            "id":"1458107131123544",
            "name":"John Amggbhaceada Panditwitz"
         },
         "message":"Help me in securing Bakarí Sandholt of zombies",
         "to":{
            "id":"1491083887820547",
            "name":"Sharon Amgefhejeaia Narayananwitz"
         },
         "id":"954222704591241_1491083887820547"
      }
   ],
   "paging":{
      "cursors":{
         "before":"NTI4OTM3MzQwNTQyNzMxOjEwMDAwNzU2ODUwNTE5MQ==",
         "after":"OTU0MjIyNzA0NTkxMjQxOjEwMDAwNzU2ODUwNTE5MQ=="
      }
   }
};

*/
