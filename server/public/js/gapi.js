
var api_url = "http://localhost:8000/api/";//"http://api.taxigateway.com/api/"

function setCompanyInformation(info, callback_success, callback_failure){
  var url = api_url + "company/information"
  $.post(url, info, function(res){
    if(res.success){
      callback_success(res);
    }else{
      callback_failure(res);
    }
  }, callback_failure);
}