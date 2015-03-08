var error_codes = {
  3242:{name:"user data", level:"system", description:"setting user data missing type property"},
  3243:{name:"user data", level:"system", description:"setting user data missing id or data property"},
};

function handleException(code){
  throw "Exception handler got code " + code;
}