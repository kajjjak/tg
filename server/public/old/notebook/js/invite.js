/* automatically pics up invites */
function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

function updateInvites(user_id, callback_success){
    var invites = fetchInvitesLocal();
    var url = url_domain + "api/invite/"+user_id+"/stream/"+i+"/notify/";
    for(var i in invites){
        console.info(" Invite "  +i+  " " + JSON.stringify(invites[i]));
        if (invites[i] == 0){
            $.getJSON(url, function(doc){
                callback_success(doc);
            });
        }
    }
}

function fetchInvitesLocal(){
    return JSON.parse(localStorage.getItem("invites") || "{}");
}

function acceptInvites(user_id, stream_id, alias, callback_success){
    /* if alias is null or undefined we unaccept the stream */
    $.getJSON("/api/invite/"+user_id+"/stream/"+stream_id+"/accept/"+alias, function(doc){
        var invites = fetchInvitesLocal();
        invites[invite] = 1;
        callback_success(doc);
    });
}

var invite = getURLParameter("stream");
if (invite){
    var invites = fetchInvitesLocal();
    invites[invite] = 0;
    cacheStorageSave("invites", JSON.stringify(invites));
}
