function l(s) { 
    console.log(s) 
}

function in_array(needle, haystack) {
    for(var i in haystack) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

function checkConnection() {
    if (typeof(cordova) !== 'undefined') {
        try{
            if(navigator.connection.type!=Connection.NONE){
                isConeLost = false;
                return true;
            }else{
                isConeLost = true;
                return false;
            }
        }catch(e){ l( e ); }
    }else{
        return true;
    }
}

// FORMATEAR NUMEROS CON 2 DIGITOS
function n(n){ return n > 9 ? "" + n: "0" + n; }

function mylog(log_){
    console.log(log_);
}