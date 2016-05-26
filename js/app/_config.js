var user_id = '';
var user_pic = '';
var user_name = '';
var partido = { 
    id: 0, 
    equipo_l: '', 
    equipo_v: '', 
    resultado_l: 0, 
    resultado_v: 0, 
    info:'', 
    nivel:0, 
    user_id:0 , 
    user_name:'' , 
    inicio:'', 
    minuto:0, 
    tiempo:1,
    segundo:0,
    fecha:'',
    sincronizar: 0,
    finalizado: 0
};

var isCurrentPartido = false;
var partidos = [];
var add_evento = '';
var add_evento_penal = '';

var service_url = "http://myrugby.com.ar/webservices/servicios.php";
var profile_pics = "http://myrugby.com.ar/webservices/profiles/";

if (!window.cordova) {
    service_url = "http://myrugby.com.ar/webservices/servicios.php";
    profile_pics = "http://myrugby.com.ar/webservices/profiles/";
}

var evento_minuto;
var m = 0;
var user_id_filter = 0;
var isConeLost = false;
var db = null;


function sp () {
    var datos = { m : m, partido_minuto : partido.minuto, match : partido, add_evento : add_evento, evento_minuto : evento_minuto } 
    l(datos);
}
