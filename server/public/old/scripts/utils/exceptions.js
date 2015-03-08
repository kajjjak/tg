
function getURLParameter(val){
  /*
    Parses the location url looking for val, if not found we return null
    http://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript
  */
    var result = null,
        tmp = [];
    location.search
    //.replace ( "?", "" ) 
    // this is better, there might be a question mark inside
    .substr(1)
        .split("&")
        .forEach(function (item) {
        tmp = item.split("=");
        if (tmp[0] === val) result = decodeURIComponent(tmp[1]);
    });
    return result;
}

var StringFormat = function (str, col) {
	/*
	format("i can speak {language} since i was {age}",{language:'javascript',age:10});
	format("i can speak {0} since i was {1}",'javascript',10});
	*/
    col = typeof col === 'object' ? col : Array.prototype.slice.call(arguments, 1);

    return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
        if (m == "{{") { return "{"; }
        if (m == "}}") { return "}"; }
        return col[n];
    });
};
function StringCapitalise(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//exception code are language dependent error codes
exception_codes = {};
exception_codes[1002] = _lang["gui_warning_message_e1002"];
exception_codes[1003] = _lang["gui_warning_message_e1003"];
exception_codes[1004] = _lang["gui_warning_message_e1004"];
exception_codes[1005] = _lang["gui_warning_message_e1005"];
exception_codes[1006] = _lang["gui_warning_message_e1006"];
exception_codes[1007] = _lang["gui_warning_message_e1007"];
exception_codes[1008] = _lang["gui_warning_message_e1008"];
exception_codes[1009] = _lang["gui_warning_message_e1009"];

exception_codes[2101] = _lang["gui_warning_message_a2101"];

// Create a new object, that prototypally inherits from the Error constructor.
function EconomyException(error_code, data) {
  this.name = _lang["gui_warning_message_e2311"];
  this.data = data || {};
  this.code = error_code;
  this.message = StringFormat(exception_codes[error_code], data) || "";
}
EconomyException.prototype = new Error();
EconomyException.prototype.constructor = EconomyException;