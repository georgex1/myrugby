function hideFbShare(){
    if(!isCurrentPartido){
        $('#sharePartido').show();
    }else{
        $('#sharePartido').hide();
    }
}

var toShareFb = "http://myrugby.com.ar/share.php";

function open_fb_share(){
    facebookConnectPlugin.showDialog(
    {
        method: "feed",
        link: 'http://myrugby.com.ar/partido/index.php?partidos_id=' + partido.id,
        picture:'http://myrugby.com.ar/webservices/shares/share'+ partido.id +'.png',
        name:'My Rugby!',
        message:'Resultados del Partido',    
        caption: 'Resultados del Partido ' + partido.equipo_l + ' VS '+ partido.equipo_v,
        description: 'Resultados del Partido ' + partido.equipo_l + ' VS '+ partido.equipo_v
    }, 
    function (response) {
        navigator.notification.alert("Publicado Correctamente!", function(){}, "Facebook", "Aceptar");
        /*alert(JSON.stringify(response))*/ 
    },
    function (response) { /*alert(JSON.stringify(response)) }*/});
}