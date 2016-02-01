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

var service_url = "http://thepastoapps.com/proyectos/myrugby/webservices/servicios.php"
var profile_pics = "http://thepastoapps.com/proyectos/myrugby/webservices/profiles/"

if (!window.cordova) {
    service_url = "http://localhost/betterpixel/myrugby/response/webservices/servicios.php"
    profile_pics = "http://localhost/betterpixel/myrugby/response/webservices/profiles/"
}


var evento_minuto;
var m = 0;
var user_id_filter = 0;
var isConeLost = false;
var db = null;

// ************************************* FUNCTIONS **************************************

function checkConnection() {
    //return true;
    if (typeof(cordova) !== 'undefined') {
        try{
            //alert('connection? '+navigator.connection.type);
            //alert('connection name? '+Connection.NONE);
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

function cache_images() {

    $('img').each(function() {
        ImgCache.cacheFile($(this).attr('src'));
    });

}

function use_cache() {

    $('img').each(function() {
        ImgCache.useCachedFile($(this));
    });

}

function use_online() {

    $('img').each(function() {
        ImgCache.useOnlineFile($(this));
    });

}


var reloadImages = function() {

    // see console output for debug info
    //ImgCache.options.debug = true;
    ImgCache.options.usePersistentCache = true;

    ImgCache.init();

};

if (typeof(cordova) !== 'undefined') {
    document.addEventListener('deviceready', reloadImages, false);
} else {
    $(document).ready(reloadImages);
}

//if(checkConnection()){ cache_images(); use_online(); } else { use_cache(); }


function l(s) { console.log(s) }

function in_array(needle, haystack) {
    for(var i in haystack) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

// LOGIN SIN DB
function loginf(u_id, callback) {

    //l('loginf(u_id, callback)')


    if(!checkConnection()){

        l('login sin conexion')

        user_id = u_id;

        //CARGAR MI IMAGEN DE PERFIL
        user_pic = "https://graph.facebook.com/"+user_id+"/picture?width=150&height=150";
        //user_pic = profile_pics + "profile_" + user_id + ".jpg";

        //alert(user_pic)

        $("#wellcome_2 .img_perfil img").attr('src', user_pic);

        $(".panel").each(function(){ $(this).find(".img_perfil img").attr('src', user_pic); } );

        //cache_images(); 

        use_cache();



    } else {

        user_id = u_id;

        //CARGAR MI IMAGEN DE PERFIL
        user_pic = "https://graph.facebook.com/"+user_id+"/picture?width=150&height=150";
        //user_pic = profile_pics + "profile_" + user_id + ".jpg";

        //alert(user_pic)

        $("#wellcome_2 .img_perfil img").attr('src', user_pic);

        $(".panel").each(function(){ $(this).find(".img_perfil img").attr('src', user_pic); } );
        
        //CARGA EL RATING EN EL PANEL LATERAL 
        get_load_my_rating (user_id);
        
        //load my partidos
        $.ajax({
            url: service_url+"?action=get_user_partidos",
            type: "post", data: { user_id: user_id }, datatype: 'json',
            success: function(data){
                $('.panel').each(function(){
                    $(this).find('.value:last').text(data.partidos); 
                })
            }
        });

        //l('cache_images();')
        cache_images(); 

        //use_online();


    }

    $("#wellcome_2 h2").text(user_name);

    if (callback) { callback(); }

}

// FACEBOOK FUNCTIONS
var login = function () {

    if (!window.cordova) {
        
        user_id = '10208098166282044';
        user_pic = "https://graph.facebook.com/"+user_id+"/picture?width=150&height=150";

        $(".panel").each(function(){ $(this).find(".img_perfil img").attr('src', user_pic); })
        $("#wellcome_2 .img_perfil img").attr('src', user_pic);
        
        //CARGA EL RATING EN EL PANEL LATERAL 
        get_load_my_rating (user_id);
        
        
        user_name = 'Jorge Letvi';
        $("#wellcome_2 h2").text(user_name);

        //AGREGAR USUARIO SI SE LOGUEA
        agregar_usuario(user_id, user_name);

        //ESPERO 2 SEGUNDOS Y PASO A LA PANTALLA DE BIENVENIDA DE USUARIO
        setTimeout(function(){ $.mobile.navigate( "#wellcome_2", { transition : "slide" }); }, 2000);
        
        
        $.ajax({
            url: service_url+"?action=save_user_profile",
            type: "post", 
            data: { user_id: user_id }, 
            datatype: 'json',
            success: function(data) {
                var user_pic_temp = profile_pics + "profile_" + user_id + ".jpg";

                //$("#wellcome_2 .img_perfil img").attr('src', user_pic_temp);
                //$(".panel").each(function(){ $(this).find(".img_perfil img").attr('src', user_pic_temp); })


                //l('cache_images();')

                cache_images(); 

                //use_online();

            }
        });

        save_login();
        
        //var appId = prompt("Enter FB Application ID", "886077731441644");
        //facebookConnectPlugin.browserInit(appId);
        
        /*(function () {
            if (!window.FB) {
                console.log("launching FB SDK");
                var e = document.createElement('script');
                e.src = document.location.protocol + '//connect.facebook.net/en_US/sdk.js';
                e.async = true;
                document.getElementById('fb-root').appendChild(e);
                if (!window.FB) {
                    // Probably not on server, use the sample sdk
                    e.src = 'js/facebookConnectPlugin.js';
                    document.getElementById('fb-root').appendChild(e);
                    console.log("Attempt local load: ", e);
                    
                    facebookConnectPlugin.browserInit(appId);
                }
            }
        }());*/
        
        
        
        
    }else{

    facebookConnectPlugin.login( ["email"],
    function (response) {
        if (response.authResponse) {

            user_id = response.authResponse.userID;

            //CARGAR MI IMAGEN DE PERFIL
            user_pic = "https://graph.facebook.com/"+user_id+"/picture?width=150&height=150";

            $(".panel").each(function(){ $(this).find(".img_perfil img").attr('src', user_pic); })
            $("#wellcome_2 .img_perfil img").attr('src', user_pic);

            //CARGA EL RATING EN EL PANEL LATERAL 
            get_load_my_rating (user_id);

            //OBTENER MI NOMBRE DE USUARIO Y GUARDARLO
            facebookConnectPlugin.api('/me', null, function(response) {
                user_name = response.name;
                $("#wellcome_2 h2").text(user_name);

                //AGREGAR USUARIO SI SE LOGUEA
                agregar_usuario(user_id, response.name);

                //ESPERO 2 SEGUNDOS Y PASO A LA PANTALLA DE BIENVENIDA DE USUARIO
                setTimeout(function(){ $.mobile.navigate( "#wellcome_2", { transition : "slide" }); }, 2000);

            });

            //load my partidos
            $.ajax({
                url: service_url+"?action=get_user_partidos",
                type: "post", data: { user_id: user_id }, datatype: 'json',
                success: function(data){
                    $('.panel').each(function(){
                        $(this).find('.value:last').text(data.partidos); 
                    })
                }
            });


            //save_user_profile
            $.ajax({
                url: service_url+"?action=save_user_profile",
                type: "post", 
                data: { user_id: user_id }, 
                datatype: 'json',
                success: function(data) {
                    var user_pic_temp = profile_pics + "profile_" + user_id + ".jpg";

                    //$("#wellcome_2 .img_perfil img").attr('src', user_pic_temp);
                    //$(".panel").each(function(){ $(this).find(".img_perfil img").attr('src', user_pic_temp); })


                    //l('cache_images();')

                    cache_images(); 

                    //use_online();

                }
            });

            save_login();

        }
    },
    function (response) { alert(JSON.stringify(response)) });
    }
}

var showDialog = function() { facebookConnectPlugin.showDialog( { method: "feed" }, function (response) { alert(JSON.stringify(response)) }, function (response) { alert(JSON.stringify(response)) }); }
var apiTest = function () { facebookConnectPlugin.api( "me/?fields=id,email", ["user_birthday"], function (response) { alert(JSON.stringify(response)) }, function (response) { alert(JSON.stringify(response)) }); }
var getAccessToken = function () { facebookConnectPlugin.getAccessToken( function (response) { alert(JSON.stringify(response)) }, function (response) { alert(JSON.stringify(response)) } );}
var getStatus = function () { facebookConnectPlugin.getLoginStatus( function (response) { alert(JSON.stringify(response)) }, function (response) { alert(JSON.stringify(response)) });}
var logout = function () { 
    facebookConnectPlugin.logout( function (response) { 
        //alert(JSON.stringify(response)) 
        //navigator.app.exitApp();
        user_id = 0;
        user_pic = '';
        user_name = '';
        reset_partido();
        $.mobile.navigate( "#ini", { transition : "slide" });
    }, function (response) { 
        alert(JSON.stringify(response)) 
    });}

// FACEBOOK FUNCTIONS END

//GUARDAR USUARIO 
function agregar_usuario(user_id, user_name) {
    $.ajax({
        url: service_url+"?action=agregar_usuario",
        type: "post",
        data: { user_id: user_id, user_name: user_name },
        datatype: 'json',
        success: function(data){ l(data.result); },
        error:function(){ alert(data.result) }
    });
}

// SALIR DE LA APP
function showConfirmSalir() { navigator.notification.confirm( '¿Seguro que quieres cerrar la aplicación?', exitFromApp, 'Salir', 'Cancelar,Si' );}
function exitFromApp(buttonIndex) { if (buttonIndex==2){ navigator.app.exitApp();} }


// FORMATEAR NUMEROS CON 2 DIGITOS
function n(n){ return n > 9 ? "" + n: "0" + n; }

// RESETEAR PARTIDO
function reset_partido() {

    l('reset_partido()');
    partido.id = generateId();
    partido.equipo_l = '';
    partido.equipo_v = '';
    partido.resultado_l = 0;
    partido.resultado_v = 0;
    partido.info = '';
    partido.user_id = 0;
    partido.user_name = '';
    partido.inicio = '';
    partido.minuto = 0;
    partido.tiempo = 1;
    partido.segundo = 0;
    partido.fecha = '';
    partido.sincronizar = 0;
    partido.finalizado = 0;
    m = 0;
    $('#control_tiempo').show();
    $('#control_tiempo').text("Terminar 1T");
    $('#control_tiempo').next().text("1T");
}

// GUARDAR PARTIDO
function save_partido(equipo_l, equipo_v, info, user_id) {
    
    var mdata = null;
    mdata = {
        partido_id: partido.id,
        equipo_l: equipo_l,
        equipo_v: equipo_v,
        info: info,
        user_id: user_id,
        user_name: user_name,
        fecha_entrada: getCurDate()
    };
    
    partidos_db[0] = {
        id: partido.id,
        equipo_l: equipo_l,
        equipo_v: equipo_v,
        info: info,
        user_id: user_id,
        user_name: user_name,
        serverupdate: getCurDate()
    };
    
    //guardar en local..
    save_partido_local();
    
    queueSync('save_partido', JSON.stringify(mdata));
    
    
    
    
    /*
    if(isConeLost){
        if(checkConnection())
            sync_datos();
    }

    if(!checkConnection()){

        partidos_db = [];

        partidos_db.push({equipo_l:equipo_l, equipo_v:equipo_v, info:info, user_id:user_id,user_name:user_name})
        save_partido_local();

    } else {

        $.ajax({
            url: service_url+"?action=save_partido",
            type: "post",
            data: { equipo_l: equipo_l, equipo_v: equipo_v, info: info, user_id: user_id },
            datatype: 'json',
            success: function(data){
                partido.id = data.partido.id;
                partido.equipo_l = equipo_l;
                partido.equipo_v = equipo_v;
                partido.info = info;
                partido.user_id = user_id;
                $.mobile.navigate( "#eventos", { transition : "slide" });
                cronometro( ".top_data .partido_d p.time", 0, 0 );
                m = 0;
            },
            error:function(){
                alert(data.result)
            }   
        });

    }
*/
}

// GET PARTIDO
function get_partido (partido_id, callback) {
    $.mobile.loading( "show" );
    
    partido.id = partido_id;
    get_partido_local();

    //l(partido)

    setTimeout(function(){
        /*if(partido.sincronizar==0) {

            alert('Necesita conexión a internet para poder ver el detalle del partido');
            $.mobile.loading( "hide" );
            return false;

        } else {*/

            //l('ver partido')
            if (callback) { callback(); }
            $.mobile.loading( "hide" );

        //}
    }, 1000);
    
    
    
    /*if(!checkConnection()){

        partido.id = partido_id;
        get_partido_local();

        //l(partido)

        setTimeout(function(){
            if(partido.sincronizar==0) {

                alert('Necesita conexión a internet para poder ver el detalle del partido');
                $.mobile.loading( "hide" );
                return false;

            } else {

                //l('ver partido')
                if (callback) { callback(); }
                $.mobile.loading( "hide" );

            }
        }, 1000)



    } else {

        $.ajax({
            url: service_url+"?action=get_partido",
            type: "post",
            data: { partido_id: partido_id },
            datatype: 'json',
            success: function(data){
                partido.equipo_l = data.partido.equipo_l;
                partido.equipo_v = data.partido.equipo_v;
                partido.resultado_l = data.partido.resultado_l;
                partido.resultado_v = data.partido.resultado_v;
                partido.info = data.partido.info;
                partido.user_id = data.partido.user_id;
                partido.user_name = data.partido.user_name;
                partido.inicio = data.partido.inicio;
                partido.fecha =  moment(data.partido.inicio, null, 'es', true).format("dddd D [de] MMMM HH:mm");
                load_partido_detalles ();
                if (callback) { callback(); }
                $.mobile.loading( "hide" );
            },
            error:function(){
                alert(data.result)
            }
        });

    }*/

}

// CARGAR DETALLES DEL PARTIDO
function load_partido_detalles () {

    $("#eventos .top_data .partido .club_name:first p").text(partido.equipo_l);
    $("#eventos .top_data .partido .results p").html(partido.resultado_l + ' &middot; ' + partido.resultado_v);
    $("#eventos .top_data .partido .club_name:last p").text(partido.equipo_v);

    $("#partido_eventos .top_data .partido .club_name:first p").text(partido.equipo_l);
    $("#partido_eventos .top_data .partido .results p").html(partido.resultado_l + ' &middot; ' + partido.resultado_v);
    $("#partido_eventos .top_data .partido .club_name:last p").text(partido.equipo_v);
    $("#partido_eventos .top_data .date p").text(partido.fecha);

    $('#agregar_evento .evento .desc').text(add_evento);
    $("#agregar_evento .partido .club_name:first p, #agregar_evento .equipo .club_name:first p").text(partido.equipo_l);
    $("#agregar_evento .top_data .partido .results p").html(partido.resultado_l + ' &middot; ' + partido.resultado_v);
    $("#agregar_evento .partido .club_name:last p, #agregar_evento .equipo .club_name:last p").text(partido.equipo_v);
    $("#agregar_evento .minuto .result").text(partido.minuto+"'");

    m = partido.minuto;

    $('.bottom_datos_perfil .title p').text(partido.info);

}

function hideFbShare(){
    //if(partido.finalizado == '1'){
    if(!isCurrentPartido){
        //alert("MOSTRAR fb share " + partido.finalizado);
        $('#sharePartido').show();
    }else{
        //alert("esconder fb share " + partido.finalizado);
        $('#sharePartido').hide();
    }
}

// RESET DETALLES DEL PARTIDO
function reset_partido_detalles () {

    l('reset_partido_detalles () ')

    $('input#search').val('')

    $("#eventos .top_data .partido .club_name:first p").text('');
    $("#eventos .top_data .partido .results p").html('0' + ' &middot; ' + '0');
    $("#eventos .top_data .partido .club_name:last p").text('');

    $("#partido_eventos .top_data .partido .club_name:first p").text('');
    $("#partido_eventos .top_data .partido .results p").html('0' + ' &middot; ' + '0');
    $("#partido_eventos .top_data .partido .club_name:last p").text('');
    $("#partido_eventos .top_data .date p").text('');

    $('#agregar_evento .evento .desc').text('');
    $("#agregar_evento .partido .club_name:first p, #agregar_evento .equipo .club_name:first p").text('');
    $("#agregar_evento .top_data .partido .results p").html('0' + ' &middot; ' + '0');
    $("#agregar_evento .partido .club_name:last p, #agregar_evento .equipo .club_name:last p").text('');
    $("#agregar_evento .minuto .result").text('0'+"'");

    $('.bottom_datos_perfil .title p').text('');

    $('#eventos_list_1').html('');
    $('#eventos_list_2').html('');

    $('#estadisticas_list').html('');

}

// CARGAR EVENTOS DEL PARTIDO
function load_partido_eventos (partido_id, callback) {

    get_partido_local();
    setTimeout(function(){
        load_partido_eventos_local();
    }, 600);


    //l('load_partido_eventos (partido_id, callback)')

    /*if(checkConnection()) {

        var tiemp = 1;

        $.mobile.loading( "show" );
        $.ajax({
            url: service_url+"?action=get_partido_eventos", type: "post", data: { partido_id: partido_id },datatype: 'json',
            success: function(data){

                //EVENTOS
                var html = '';
                var html2 = '';

                $('#eventos_list_1').html(html);
                $('#eventos_list_2').html(html2);

                if(data.result=="true") {
                    $.each(data.eventos, function() {

                        l(this.evento.toLowerCase())

                        if(this.evento.toLowerCase()=='infracción') {


                            if(this.tiempo == 2) {
                                html2 += '<div class="evento equipo_'+this.equipo+'">' + 
                                    '<span class="ico-evento ico-evento-penal"></span>' +
                                    "<span class='desc'>Infracción "+n(this.minuto)+"'</span>" +
                                    '</div>';
                            } else {
                                html += '<div class="evento equipo_'+this.equipo+'">' + 
                                    '<span class="ico-evento ico-evento-penal"></span>' +
                                    "<span class='desc'>Infracción "+n(this.minuto)+"'</span>" +
                                    '</div>';
                            }



                        } else {

                            if(this.tiempo == 2) {
                                html2 += '<div class="evento equipo_'+this.equipo+'">' + 
                                    '<span class="ico-evento ico-evento-'+this.evento.toLowerCase().replace(' ', '_')+'"></span>' +
                                    "<span class='desc'>"+this.evento+" "+n(this.minuto)+"'</span>" +
                                    '</div>';
                            } else {
                                html += '<div class="evento equipo_'+this.equipo+'">' + 
                                    '<span class="ico-evento ico-evento-'+this.evento.toLowerCase().replace(' ', '_')+'"></span>' +
                                    "<span class='desc'>"+this.evento+" "+n(this.minuto)+"'</span>" +
                                    '</div>';
                            }

                        }

                    });
                } else { html = '<span>Sin eventos</span>'; }

                $('#eventos_list_1').html(html);
                $('#eventos_list_2').html(html2);

                //ESTADISTICAS
                var html_est = '';
                if(data.result=="true") {
                    $.each(data.estadisticas, function(key, value) {
                        if( key=='try' || key=='conversiones' || key=='cambio' || key=='pass_fw' || key=='knock_on' ||  key=='penales' || key=='tarjeta_amarilla' || key=='tarjeta_roja' ) {
                            html_est += '<li><span>'+this.l.cantidad+'</span><span class="est">'+key.replace('_', ' ')+'</span><span>'+this.v.cantidad+'</span></li>';
                        } else if(key=='drop' || key=='penal' || key=='line' || key=='scrum' || key=='palos') {
                            html_est += '<li><span>'+this.l.valor+'/'+this.l.cantidad+'</span><span class="est">'+key.replace('_', ' ')+'</span><span>'+this.v.valor+'/'+this.v.cantidad+'</span></li>';
                        }
                    });
                } else { html = '<span>Sin estadisticas</span>'; }
                $('#estadisticas_list').html(html_est);

                $.mobile.loading( "hide" );
                
                if (callback) { callback(); }

            }, error:function(){ alert(data.result) }
        });


    } else {
        //l('cargar eventos sin cone')
        get_partido_local();
        setTimeout(function(){
            load_partido_eventos_local();
        }, 600);
    }
*/

}

//CRONOMETRO
var tiempo_corriendo = null;

var tiempo_cumplido = 0;

function cronometro ( selector, minute, second) {
    var tiempo = { minuto: minute, segundo: second };
    tiempo_corriendo = setInterval(function(){

        // Segundos
        tiempo.segundo++;
        if(tiempo.segundo >= 60) { tiempo.segundo = 0; tiempo.minuto++; }
        // Minutos
        if( (tiempo.minuto >= 40 && partido.tiempo==1) || (tiempo.minuto >= 80 && partido.tiempo==2) ) {
            $(".top_data .partido_d p.time").css('color', "#ff0000");
        } else {
            $(".top_data .partido_d p.time").css('color', "#ffffff");
        }

        partido.segundo = tiempo.segundo < 10 ? '0' + tiempo.segundo : tiempo.segundo;
        partido.minuto = tiempo.minuto < 10 ? '0' + tiempo.minuto : tiempo.minuto;

        $(selector).find(".second").text('');
        $(selector).find(".minute").text('');

        $(selector).find(".second").text(partido.segundo);
        $(selector).find(".minute").text(partido.minuto);

    }, 1000);
}

//CRONOMETRO
var entretiempo_corriendo = null;
//var et = 1;

function cronometro2 ( selector, minute, second) {
    var tiempo = { minuto: minute, segundo: second };
    entretiempo_corriendo = setInterval(function(){
        // Segundos
        tiempo.segundo++;
        if(tiempo.segundo >= 60) { tiempo.segundo = 0; tiempo.minuto++; }

        var segundo = tiempo.segundo < 10 ? '0' + tiempo.segundo : tiempo.segundo;
        var minuto = tiempo.minuto < 10 ? '0' + tiempo.minuto : tiempo.minuto;
        $(selector).find(".second").text(segundo);
        $(selector).find(".minute").text(minuto);
    }, 1000);
}





// GUARDAR UN EVENTO DE UN PARTIDO
var evento_local = {};
function save_evento () {
    
    $.mobile.loading("show");
    var equipo = $('#sel_team').val().trim();
    var conversion = $('#conversion').val();
    var minuto = parseInt(partido.minuto);
    var minuto_seleccionado_temp = $('.minuto .result').text().split("'");
    var minuto_seleccionado = parseInt(minuto_seleccionado_temp[0]);

    if( minuto_seleccionado > minuto ) {
        minuto = minuto_seleccionado;
        clearInterval(tiempo_corriendo);

        $(".top_data .partido_d p.time .second").hide();
        $(".top_data .partido_d p.time .minute").hide();

        cronometro( ".top_data .partido_d p.time", minuto, partido.segundo )

        $(".top_data .partido_d p.time .second").show();
        $(".top_data .partido_d p.time .minute").show();

        m = minuto;
    } else if (minuto_seleccionado < minuto) {
        minuto = minuto_seleccionado;
        m = minuto;
    }
    
    if(add_evento=="Penal"){
        add_evento = "Infracción";
    }
    
    var evento_id = generateId();
    
    var mdata = null;
    mdata = {
        id: evento_id,
        evento: add_evento, 
        minuto: minuto, 
        tiempo: partido.tiempo, 
        user_id: user_id, 
        partido_id: partido.id,
        equipo:equipo,
        conversion: conversion,
        fecha_entrada: getCurDate()
    };
    
    evento_local = {
        id: evento_id,
        evento: add_evento, 
        minuto: minuto, 
        tiempo: partido.tiempo, 
        user_id: user_id, 
        partido_id: partido.id,
        equipo:equipo,
        conversion: conversion,
        serverupdate: getCurDate()
    }
    
    //guardar en local..
    save_evento_local();
    queueSync('save_evento', JSON.stringify(mdata));

    
    if(add_evento=="Infracción"){

        if(add_evento_penal=="") { add_evento_penal = "Free Kick"; }
                        add_evento=add_evento_penal;

        evento_id = generateId();
        mdata.id = evento_id;
        mdata.evento = add_evento_penal;
        
        evento_local.evento = add_evento_penal;
        evento_local.id = evento_id;

        //guardar en local..
        save_evento_local();
        queueSync('save_evento', JSON.stringify(mdata));
    }
    
    
    var next = "#partido_eventos";
    
    setTimeout(function(){
        get_partido(partido.id, function(){
            $.mobile.navigate( next, { transition : "slide" });
            $.mobile.loading("hide");
        });
    }, 500)

    /*if(!checkConnection()) {
        evento_local = {
            evento: add_evento, 
            minuto: minuto, 
            tiempo: partido.tiempo, 
            user_id: user_id, 
            partido_id: partido.id,
            equipo:equipo,
            conversion: conversion
        }
        save_evento_local();

    } else {

        var next = "#partido_eventos";

        if(add_evento=="Penal"){

            add_evento = "Infracción";

            $.ajax({
                url: service_url+"?action=save_evento",
                type: "post",
                data: {
                    evento: add_evento, 
                    minuto: minuto, 
                    tiempo: partido.tiempo, 
                    user_id: user_id, 
                    partido_id: partido.id,
                    equipo:equipo,
                    conversion: conversion
                },
                datatype: 'json',
                success: function(data){
                    
                    if(add_evento_penal=="") { add_evento_penal = "Free Kick"; }
                    add_evento=add_evento_penal;
                    
                    $.ajax({
                        url: service_url+"?action=save_evento",
                        type: "post",
                        data: {
                            evento: add_evento, 
                            minuto: minuto, 
                            tiempo: partido.tiempo, 
                            user_id: user_id, 
                            partido_id: partido.id,
                            equipo:equipo,
                            conversion: conversion
                        },
                        datatype: 'json',
                        success: function(data){

                            get_partido(partido.id, function(){
                                $.mobile.navigate( next, { transition : "slide" });
                                $.mobile.loading("hide");
                            });

                        },
                        error:function(){
                            alert(data.result)
                        }   

                    });
                    
                }
            });

            
        } else {
            
            $.ajax({
                url: service_url+"?action=save_evento",
                type: "post",
                data: {
                    evento: add_evento, 
                    minuto: minuto, 
                    tiempo: partido.tiempo, 
                    user_id: user_id, 
                    partido_id: partido.id,
                    equipo:equipo,
                    conversion: conversion
                },
                datatype: 'json',
                success: function(data){

                    get_partido(partido.id, function(){
                        $.mobile.navigate( next, { transition : "slide" });
                        $.mobile.loading("hide");
                    });

                },
                error:function(){
                    alert(data.result)
                }   

            });
            
        }

        

    }*/

}



// GUARDAR RATING.. VOTOS 
function save_rating (voto, user_id, user_id_from, partido_id, callback) {
    $.mobile.loading("show");
    
    var votoId = generateId();
    
    var mdata = null;
    mdata = {
        id: votoId, voto: voto, user_id: user_id , user_id_from: user_id_from , partido_id: partido_id,
        fecha_entrada: getCurDate()
    };
    
    puntos_db[0] = {id : votoId, user_id : user_id, user_id_from : user_id_from, partido_id : partido_id, serverupdate : getCurDate(), valor : voto};
    
    save_punto_local();
    
    queueSync('save_rating', JSON.stringify(mdata));
    
    $.mobile.loading("hide"); if (callback) { callback(); }
    
    /*$.ajax({
        url: service_url+"?action=save_rating", type: "post",
        data: { voto: voto, user_id: user_id , user_id_from: user_id_from , partido_id: partido_id },
        datatype: 'json',
        success: function(data){ $.mobile.loading("hide"); if (callback) { callback(); }  },
        error:function(){ alert(data.result) }   
    });*/
}

//GET AND LOAD RATING IN PANEL
function get_load_my_rating (user_id) {
    get_puntos (user_id, null, 1);
    
    /*$.ajax({
        url: service_url+"?action=get_rating", type: "post", data: { user_id: user_id },
        datatype: 'json',
        success: function(data){
            $('.panel').each(function(){ $(this).find('.value:first').text(data.puntos); })
        }, error:function(){ alert(data.result) }
    });*/
}

//GET MI VOTO DEL PARTIDO
function get_mi_voto (user_id_from, partido_id, callback) {
    
    var query = "select * from puntos where \
                user_id_from = '" + user_id_from + "' \
                and partido_id = '" + partido_id + "' limit 1";
    mylog(query);
    db.transaction(function(tx){
        tx.executeSql(query, [], function(tx, results){
            if(results.rows.length > 0){
                callback( results.rows.item(0).valor );
            }else{
                callback(0);
            }
        }, errorCB);
    }, errorCB);
    
    
    /*
    
    $.ajax({
        url: service_url+"?action=get_mi_voto", type: "post", data: { user_id_from: user_id_from, partido_id: partido_id },
        datatype: 'json',
        success: function(data){ 
            if (data.result=="true") {
                if (callback) { callback(data.valor); } 
            } else {
                if (callback) { callback(0); } 
            }
        }, error:function(){ alert(data.result) }   
    });*/
}

function get_puntos (user_id, callback, myRating) {
    
    var puntosTotal = 0;
    var puntosCantidad = 1;
    
    var query = "SELECT *  FROM `puntos` where user_id = '"+user_id+"' ";
    mylog(query);
    db.transaction(function(tx){
        tx.executeSql(query, [], function(tx, results){
            if(results.rows.length > 0){
                var i = 0;
                puntosCantidad = 0;
                $('#empresas_listado').html('');
                while(i < results.rows.length){
                    puntosTotal = puntosTotal*1 + results.rows.item(i).valor*1;
                    puntosCantidad++;
                    i++;
                }
                
            }
        }, errorCB);
    }, errorCB);
    
    var puntosCalc = puntosTotal/puntosCantidad;
    
    var rating = Math.round(parseFloat(puntosCalc));
    if (callback) { callback(rating, puntosCalc); }
    
    if(myRating){
        $('.panel').each(function(){ $(this).find('.value:first').text(puntosCalc); })
    }
    
    /*
    $.mobile.loading("show");
    $.ajax({
        url: service_url+"?action=get_rating", type: "post", data: { user_id: user_id }, datatype: 'json',
        success: function(data){
            var rating = Math.round(parseFloat(data.puntos));
            var puntos = data.puntos;
            if (callback) { callback(rating, puntos); } 
            $.mobile.loading("hide");
        }, error:function(){ alert(data.result) }   
    });*/
}

//GET AND LOAD RATING
function get_load_rating (u_id, callback) {
    $('.rating a').removeClass('active');
    $('.bottom_datos_perfil .datos_perfil .values .v:last').text(0);
    get_mi_voto(user_id, partido.id, function(voto){
        $('.rating').removeClass('no_votar');
        if ( user_id == u_id ) { // SOY YO
            $('.rating').addClass('no_votar');
            get_puntos (u_id, function(rating, puntos) { $('.bottom_datos_perfil .datos_perfil .values .v:last').text(puntos); });
            if (callback) { callback() }
        } else if(voto==0) { // NO VOTÉ TODAVÍA
            get_puntos (u_id, function(rating, puntos) { $('.bottom_datos_perfil .datos_perfil .values .v:last').text(puntos); });
            if (callback) { callback(voto) }
        } else { // YA VOTE ESTE PARTIDO
            $('.rating a:eq('+(voto-1)+')').prevAll().addClass('active');
            $('.rating a:eq('+(voto-1)+')').addClass('active');
            get_puntos (u_id, function(rating, puntos) { $('.bottom_datos_perfil .datos_perfil .values .v:last').text(puntos); });
            if (callback) { callback(voto); }
            $('.rating').addClass('no_votar');
        }
    });
}


function cambiar_tiempo (el) {
    $('#eventos .eventos').removeClass('no_add');
    var el_time = $(".top_data .partido_d p.time");
    $('#part_time').text("1T");
    if( el.text()=="Terminar 1T" ) {
        clearInterval(tiempo_corriendo);
        el_time.find(".minute").text("40");
        el_time.find(".second").text("00");
        el.text("Comenzar 2T");
        el.next().html("ET <span id='etc' style='color:#ff0000'>(<span class='minute'>00</span>:<span class='second'>00</span>)</span>");
        cronometro2("#etc", 0, 0);
        $('#eventos .eventos').addClass('no_add');
    } else if ( el.text()=="Comenzar 2T" ) {
        partido.tiempo = 2;
        clearInterval(entretiempo_corriendo);
        cronometro( ".top_data .partido_d p.time", 40, 0 );
        partido.minuto = 40;
        m = 40;
        el.text("Terminar 2T");
        el.next().text("2T");
        $('#part_time').text("2T");
        $('.minuto .result').text( n(m) + "'" );
    } else if( el.text()=="Terminar 2T" ) {
        clearInterval(tiempo_corriendo);
        el_time.find(".minute").text("80");
        el_time.find(".second").text("00");
        partido.minuto = 80;
        m = 80;
        el.text("Ver estadísticas");
        el.next().html("Finalizado");
        $('#eventos .eventos').addClass('no_add');
        
        //enviar dato para generar imagen para compartir
        $.ajax({
            url: service_url+"?action=create_share_img",
            type: "post",
            data: {
                partido_id: partido.id
            },
            datatype: 'json',
            success: function(data){
            },
            error:function(){
                alert(data.result)
            }   
        });
        
        //guardar como finzalido
        partido.finalizado = 1;
        isCurrentPartido = false;
        
        updateDB("UPDATE `partidos` set finalizado = 1 where id = "+partidos.id+" ");
        
    } else if( el.text()=="Ver estadísticas" ) {
        var partido_id_ = partido.id;
        reset_partido();
        get_partido( partido_id_, function(){ $.mobile.navigate( "#partido_eventos", { transition : "slide" } ); } );
        
        setTimeout(function(){
            $.mobile.navigate( "#partidos", { transition : "slide" } );
        }, 100);
        /*
        if(checkConnection()){
            get_partido( partido.id, function(){ $.mobile.navigate( "#partido_eventos", { transition : "slide" } ); } );
        } else {
            l('off line get partido')
            get_partido_local();
            setTimeout(function(){
                $.mobile.navigate( "#partido_eventos", { transition : "slide" } );
            }, 1000) 
        }*/

    } else {
        alert('Finalizado!')
    }
}

// GET AND LOAD USER PARTIDOS EN PARTIDO DETALLE
function get_load_user_partidos(user_id, callback) {
    
    var query = "SELECT COUNT(id) as count_ids FROM `partidos` where user_id = '"+user_id+"' limit 1";
    mylog(query);
    db.transaction(function(tx){
        tx.executeSql(query, [], function(tx, results){
            if(results.rows.length > 0){
                $('.bottom_datos_perfil .datos_perfil .values .v:first').text(results.rows.item(0).count_ids);
            }
        }, errorCB);
    }, errorCB);
    
    /*$.mobile.loading("show");
    $.ajax({
        url: service_url+"?action=get_user_partidos", type: "post", data: { user_id: user_id },
        datatype: 'json',
        success: function(data){
            $('.bottom_datos_perfil .datos_perfil .values .v:first').text(data.partidos);
            $.mobile.loading("hide");

            if (callback) { callback(); }
        }, error:function(){ alert(data.result) }   
    });*/
}


//GET AND LOAD USUARIO PARA PARTIDO DETALLE
function get_load_user_name (user_id, callback) {
    
    var query = "SELECT user_name FROM `partidos` where user_id = '"+user_id+"' limit 1";
    mylog(query);
    db.transaction(function(tx){
        tx.executeSql(query, [], function(tx, results){
            if(results.rows.length > 0){
                $('.bottom_datos_perfil .datos_perfil .name p:first').text(results.rows.item(0).user_name);
                //$('.bottom_datos_perfil .datos_perfil .values .v:first').text(results.rows.item(0).count_ids);
            }
        }, errorCB);
    }, errorCB);
    
    /*
    $.mobile.loading("show");
    $.ajax({ url: service_url+"?action=get_usuario", type: "post", data: { user_id: user_id }, datatype: 'json',
            success: function(data){
                $('.bottom_datos_perfil .datos_perfil .name p:first').text(data.usuario.user_name);
                $.mobile.loading("hide");
                if (callback) { callback(); }
            }, error:function(){ alert(data.result) }   
           });*/
}


var cantidad_restante = 1;

var partidos_db = [];
var eventos_db = [];
var puntos_db = [];

var partidos_dbupd = [];
var eventos_dbupd = [];
var puntos_dbupd = [];

function get_updates_sv(){
    get_updates("partidos");
    get_updates("eventos");
    get_updates("puntos");
}

function get_updates(type_){
    if(checkConnection()){
        var query = "SELECT MAX(serverupdate) as max_serverupdate FROM `"+type_+"` limit 1";
        mylog(query);
        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                if(results.rows.length > 0){
                    if(results.rows.item(0).max_serverupdate != null){
                        get_last_updates(type_, results.rows.item(0).max_serverupdate);
                    }else
                        get_last_updates(type_, '2015-01-01 00:00:00');
                }else{
                    get_last_updates(type_, '2015-01-01 00:00:00');
                }
            }, errorCB);
        }, errorCB);
    }
}


function get_last_updates(type_, serverupdate){
    
    if(type_ == "partidos"){
        $.ajax({
            url: service_url+"?action=get_partidos_all&serverupdate="+serverupdate, 
            type: "post", 
            data: {}, 
            datatype: 'json',
            success: function(data){
                if(data.result=="true") {
                    var j = 0;
                    $.each(data.partidos, function() {

                        $.each(this, function() {
                            partidos_dbupd[j] = this;
                            j++;
                        });

                    });
                    
                    save_partidos_local();
                }
            }
        });
    }
    if(type_ == "eventos"){
        $.ajax({
            url: service_url+"?action=get_eventos_all&serverupdate="+serverupdate, 
            type: "post", 
            data: {}, 
            datatype: 'json',
            success: function(data){
                if(data.result=="true") {
                    var j = 0;
                    $.each(data.eventos, function() {

                        $.each(this, function() {
                            eventos_dbupd[j] = this;
                            j++;
                        });

                    });
                    
                    save_eventos_local();
                }
            }
        });
    }
    
    if(type_ == "puntos"){
        $.ajax({
            url: service_url+"?action=get_puntos_all&serverupdate="+serverupdate, 
            type: "post", 
            data: {}, 
            datatype: 'json',
            success: function(data){
                if(data.result=="true") {
                    var j = 0;
                    $.each(data.puntos, function() {

                        $.each(this, function() {
                            puntos_dbupd[j] = this;
                            j++;
                        });

                    });
                    
                    save_puntos_local();
                }
            }
        });
    }
}


function get_partidos (search_filter, comienzo,callback) {

    load_partidos_from_local ();

    /*if(checkConnection()){
        delete_partidos_local();
    }

    if(cantidad_restante==1 || search_filter!="all") {

        $.mobile.loading( "show" );
        $.ajax({
            url: service_url+"?action=get_partidos_by_date", 
            type: "post", 
            data: { search_filter_type: search_filter.type, search_filter_id: search_filter.id, comienzo: comienzo }, 
            datatype: 'json',
            success: function(data){

                if(data.result=="true") {

                    var html = '';

                    if(parseInt(comienzo)>0){ } else { $('#partidos_list').html(html); }

                    var today = new Date();
                    var yesterday = new Date(new Date().setDate(new Date().getDate()-1));
                    var date_today = today.getFullYear()+'-'+n(today.getMonth() + 1)+'-'+n( today.getDate() );
                    var date_yesterday = yesterday.getFullYear()+'-'+n(yesterday.getMonth() + 1)+'-'+n( yesterday.getDate() );


                    var j = 0;

                    $.each(data.partidos, function() {

                        html += '<div class="list_box"> ' ;

                        $.each(this, function() {
                            var date_inicio = this.inicio.split(' ');
                            fecha = date_inicio[0];

                            if(fecha == date_today ) { fecha = 'Hoy'; } 
                            else if (fecha == date_yesterday) { fecha = 'Ayer' } 
                            else { fecha = partido.fecha =  moment(this.inicio, null, 'es', true).format("D [de] MMMM");}
                        });

                        html +=   '<h4>'+fecha+'</h4>' ;
                        html +=     '<ul>';

                        $.each(this, function() {

                            var user_pic = "https://graph.facebook.com/"+this.user_id+"/picture?width=150&height=150";
                            html +=        '<li data-user="'+this.user_name+'" data-user_id="'+this.user_id+'">'+
                                '<a href="#partido_eventos" id="'+this.id+'">'+
                                '<span class="img">'+
                                '<span class="img_perfil"><img alt="" src="'+user_pic+'" /></span>'+
                                '</span>'+
                                '<span class="club_name"><p>'+this.equipo_l+'</p></span>'+
                                '<span class="results">'+this.resultado_l+' &middot; '+this.resultado_v+'</span>'+
                                '<span class="club_name"><p>'+this.equipo_v+'</p></span>'+
                                '</a>'+
                                '</li>';

                            partidos_db[j] = this;
                            j++;
                        });

                        html +=     '</ul>';
                        html += '</div>';

                    })

                    save_partidos_local(partidos_db);

                    if(parseInt(comienzo)>0){ 
                        $('#partidos_list').append(html); 
                    } else { 
                        $('#partidos_list').html(html); 
                    }

                    if(data.cantidad_restante==0) {
                        cantidad_restante = 0;
                        $('#loadmore').hide();
                    } else {
                        cantidad_restante = 1;
                        $('#loadmore').show();
                    }

                } else if (data.result=="false" && data.cantidad_total==0) {
                    html = '<div class="list_box"><h4>Sin resultados</h4></div>';
                    $('#partidos_list').html(html); 
                    $('#loadmore').hide();
                }

                if (callback) { callback(); }

                //l('cache_images();')
                cache_images();

                $.mobile.loading( "hide" );

            }, error:function(){ 
                //alert(data.result) 

                html = '<div class="list_box"><h4>Problemas con la conexión.</h4></div>';
                $('#partidos_list').html(html); 

                alert('Se produjo un error al intentar descargar los datos. Por favor, salga de la aplicación e intente nuevamente.')

                $.mobile.loading( "hide" );

            }   
        });

    } else { l('no hay mas') }
*/
}

function get_users_of_partidos(valThis, callback) {

    $.mobile.loading( "show" );

    var usuarios = [];
        var usuarios_existe = [];
        var noresult = 0;

        $('#partidos_list .partidos_list_offline li').each(function(){
            var text = $(this).data('user').toLowerCase();
            var match = text.indexOf(valThis);
            if (match >= 0) {
                noresult = 1;
                $('.no-results-found').remove();
                if( in_array($(this).data('user_id'), usuarios_existe) ) {
                    l('ya existe en el array')
                } else {
                    usuarios.push({user_id:$(this).data('user_id'), user_name:$(this).data('user'), })
                    usuarios_existe.push($(this).data('user_id'))
                }
            }
        })

        if(usuarios.length>0) {

            $('#partidos_list .list_usuarios_found').remove(); 
            var html = '';
            html += '<div class="list_box list_usuarios_found"> ' ;
            html +=     '<ul>';
            $.each(usuarios, function() {
                var user_pic = "https://graph.facebook.com/"+this.user_id+"/picture?width=150&height=150";
                html +=        '<li data-user="'+this.user_name+'">'+
                    '<a href="#list_user_partidos" id="'+this.user_id+'">'+
                    '<span class="img">'+
                    '<span class="img_perfil"><img alt="" src="'+user_pic+'" /></span>'+
                    '</span>'+
                    '<span class="club_name"><p>'+this.user_name+'</p></span>'+
                    '<span class="results"></span>'+
                    '<span class="club_name"><p></p></span>'+
                    '</a>'+
                    '</li>';
            })
            html +=     '</ul>';
            html += '</div>';
            $('#partidos_list').prepend(html); 
            $('.img_perfil img').each(function() {
                //ImgCache.useCachedFile($(this));
                //$(this).attr('src', "images/default_profile.jpg");
            });

        } else {
            $('#partidos_list .list_usuarios_found').remove(); 
        }

        if (callback) { callback(noresult); }
        $.mobile.loading( "hide" );


    /*if(!checkConnection()) {

        var usuarios = [];
        var usuarios_existe = [];
        var noresult = 0;

        $('#partidos_list .partidos_list_offline li').each(function(){
            var text = $(this).data('user').toLowerCase();
            var match = text.indexOf(valThis);
            if (match >= 0) {
                noresult = 1;
                $('.no-results-found').remove();
                if( in_array($(this).data('user_id'), usuarios_existe) ) {
                    l('ya existe en el array')
                } else {
                    usuarios.push({user_id:$(this).data('user_id'), user_name:$(this).data('user'), })
                    usuarios_existe.push($(this).data('user_id'))
                }
            }
        })

        if(usuarios.length>0) {

            $('#partidos_list .list_usuarios_found').remove(); 
            var html = '';
            html += '<div class="list_box list_usuarios_found"> ' ;
            html +=     '<ul>';
            $.each(usuarios, function() {
                var user_pic = "https://graph.facebook.com/"+this.user_id+"/picture?width=150&height=150";
                html +=        '<li data-user="'+this.user_name+'">'+
                    '<a href="#list_user_partidos" id="'+this.user_id+'">'+
                    '<span class="img">'+
                    '<span class="img_perfil"><img alt="" src="'+user_pic+'" /></span>'+
                    '</span>'+
                    '<span class="club_name"><p>'+this.user_name+'</p></span>'+
                    '<span class="results"></span>'+
                    '<span class="club_name"><p></p></span>'+
                    '</a>'+
                    '</li>';
            })
            html +=     '</ul>';
            html += '</div>';
            $('#partidos_list').prepend(html); 
            $('.img_perfil img').each(function() {
                //ImgCache.useCachedFile($(this));
                //$(this).attr('src', "images/default_profile.jpg");
            });

        } else {
            $('#partidos_list .list_usuarios_found').remove(); 
        }

        if (callback) { callback(noresult); }
        $.mobile.loading( "hide" );


    } else {

        $.ajax({
            url: service_url+"?action=get_users", 
            type: "post", 
            data: { user_name: valThis }, 
            datatype: 'json',
            success: function(data){
                if(data.result=="true") {
                    var html = '';
                    html += '<div class="list_box"> ' ;
                    html +=     '<ul>';
                    $.each(data.usuarios, function() {
                        var user_pic = "https://graph.facebook.com/"+this.user_id+"/picture?width=150&height=150";
                        html +=        '<li data-user="'+this.user_name+'">'+
                            '<a href="#list_user_partidos" id="'+this.user_id+'">'+
                            '<span class="img">'+
                            '<span class="img_perfil"><img alt="" src="'+user_pic+'" /></span>'+
                            '</span>'+
                            '<span class="club_name"><p>'+this.user_name+'</p></span>'+
                            '<span class="results"></span>'+
                            '<span class="club_name"><p></p></span>'+
                            '</a>'+
                            '</li>';
                    })
                    html +=     '</ul>';
                    html += '</div>';
                    $('#partidos_list').html(html); 
                } else if (data.result=="false") {
                    html = '<div class="list_box"><h4>Sin resultados</h4></div>';
                    $('#partidos_list').html(html); 
                }
                if (callback) { callback(); }
                $.mobile.loading( "hide" );
            }
        })

    }*/


}


// FILTRAR POR USUARIO Y POR EQUIPO

function filter (input) {

    var valThis = input.val().toLowerCase();
    
    var noresult = 0;

    if(valThis == ""){
        $('#partidos_list ul > li').show().removeClass('inactivo');
        noresult = 1;
        $('.no-results-found').remove();
        l('no hay valor');
        $('#partidos_list .partidos_list_offline').show();
        $('#partidos_list .list_usuarios_found').remove(); 
    } else {

        if($('#search').hasClass('byequipo')){
            $('#partidos_list .partidos_list_offline').show();
            $('#partidos_list ul > li').each(function(){
                var text = $(this).find('.club_name p:first').text().toLowerCase() + ' ' + $(this).find('.club_name p:last').text().toLowerCase();
                var match = text.indexOf(valThis);
                if (match >= 0) {
                    $(this).show().removeClass('inactivo');
                    noresult = 1;
                    $('.no-results-found').remove();
                } else {
                    $(this).hide().addClass('inactivo');
                }
            })
        } else {
            $('#partidos_list .partidos_list_offline').hide();
            l('Buscar x usuario');
            get_users_of_partidos(valThis, function(data){ noresult = data; })
        }

    };

    if (noresult == 0) {
        $('#no-results').remove();
        $("#partidos_list").append('<div id="no-results"><h4 class="no-results-found">Sin resultados.</h4></div>');
    }

    $("#partidos_list .list_box").each(function(){
        var activo = 0;
        $(this).find('li').each(function(){
            if($(this).hasClass('inactivo')) { } else { activo = 1; }
        })
        if(activo==0) { $(this).hide(); } else { $(this).show(); }
    });

    /*if(!checkConnection()) {

        var noresult = 0;

        if(valThis == ""){
            $('#partidos_list ul > li').show().removeClass('inactivo');
            noresult = 1;
            $('.no-results-found').remove();
            l('no hay valor');
            $('#partidos_list .partidos_list_offline').show();
            $('#partidos_list .list_usuarios_found').remove(); 
        } else {

            if($('#search').hasClass('byequipo')){
                $('#partidos_list .partidos_list_offline').show();
                $('#partidos_list ul > li').each(function(){
                    var text = $(this).find('.club_name p:first').text().toLowerCase() + ' ' + $(this).find('.club_name p:last').text().toLowerCase();
                    var match = text.indexOf(valThis);
                    if (match >= 0) {
                        $(this).show().removeClass('inactivo');
                        noresult = 1;
                        $('.no-results-found').remove();
                    } else {
                        $(this).hide().addClass('inactivo');
                    }
                })
            } else {
                $('#partidos_list .partidos_list_offline').hide();
                l('Buscar x usuario');
                get_users_of_partidos(valThis, function(data){ noresult = data; })
            }

        };

        if (noresult == 0) {
            $('#no-results').remove();
            $("#partidos_list").append('<div id="no-results"><h4 class="no-results-found">Sin resultados.</h4></div>');
        }

        $("#partidos_list .list_box").each(function(){
            var activo = 0;
            $(this).find('li').each(function(){
                if($(this).hasClass('inactivo')) { } else { activo = 1; }
            })
            if(activo==0) { $(this).hide(); } else { $(this).show(); }
        })

    } else {

        if(valThis) {
            if($('#search').hasClass('byequipo')){
                get_partidos({type: "byequipo",id: valThis}, 0);
            } else {
                $('#loadmore').hide();
                get_users_of_partidos(valThis)
            }
        } else {
            cantidad_restante = 1;
            get_partidos('all', 0);
        }

    }*/

}


// FILTRAR PARTIDOS POR USUARIO OFFLINE

function get_partidos_filter(user_id_filter) {

    $('#partidos_list .partidos_list_offline').show();

    var noresult = 0;
    $("#partidos_list .list_box li").each(function(){

        if ( $(this).data('user_id')==user_id_filter ) {
            $(this).show().removeClass('inactivo');
            noresult = 1;
            $('.no-results-found').remove();
        } else {
            $(this).hide().addClass('inactivo');
        }

    })

    if (noresult == 0) {
        $('#no-results').remove();
        $("#partidos_list").append('<div id="no-results"><h4 class="no-results-found">Sin resultados.</h4></div>');
    }

    $("#partidos_list .list_box").each(function(){
        var activo = 0;
        $(this).find('li').each(function(){
            if($(this).hasClass('inactivo')) { } else { activo = 1; }
        })
        if(activo==0) { $(this).hide(); } else { $(this).show(); }
    })

}


function sp () {
    var datos = { m : m, partido_minuto : partido.minuto, match : partido, add_evento : add_evento, evento_minuto : evento_minuto } 
    l(datos);
}







// ************************************* DB FUNCTIONS  **************************************




function errorCB(err) { console.log("Error procesando SQL: "+err.code+" message: " + err.message); }

function onDeviceReady_DB() {
    //alert('CREAR TABLAS')
    db.transaction(populateDB, errorCB, successCB);
}

// CREAR LA TABLAS
function populateDB(tx) { 
    //alert('populateDB(tx) CREAR TABLAS')
    tx.executeSql( "CREATE TABLE IF NOT EXISTS partidos ( \
id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \
equipo_l VARCHAR(255) NOT NULL, \
equipo_v VARCHAR(255) NOT NULL, \
resultado_l INTEGER NOT NULL default '0', \
resultado_v INTEGER NOT NULL default '0', \
info TEXT NULL, \
inicio TEXT NULL, \
user_id VARCHAR(255) NULL, \
user_name VARCHAR(255) NULL, \
`serverupdate` TEXT NULL,\
sincronizar INTEGER NOT NULL default '0' ,\
finalizado INTEGER NOT NULL default '0' )" );

    tx.executeSql( "CREATE TABLE IF NOT EXISTS usuarios ( \
id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \
user_id VARCHAR(255) NOT NULL, \
user_name VARCHAR(255) NOT NULL ) " );

    tx.executeSql( "CREATE TABLE IF NOT EXISTS eventos ( \
id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \
evento VARCHAR(255) NOT NULL, \
minuto INTEGER NOT NULL, \
tiempo INTEGER NOT NULL default '1', \
user_id VARCHAR(255) default NULL, \
partido_id INTEGER NOT NULL, \
equipo VARCHAR(1) default NULL, \
`serverupdate` TEXT NULL,\
valor INTEGER NOT NULL default '0' ) " );
    
    tx.executeSql( "CREATE TABLE IF NOT EXISTS puntos ( \
id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \
user_id VARCHAR(255) NOT NULL, \
user_id_from VARCHAR(255) NOT NULL,\
partido_id VARCHAR(255) NOT NULL,\
`serverupdate` TEXT NULL,\
valor VARCHAR(255) NOT NULL ) " );

    tx.executeSql( "CREATE TABLE IF NOT EXISTS syncs (\
        id INTEGER PRIMARY KEY AUTOINCREMENT,\
        func TEXT NOT NULL,\
        vals TEXT NULL,\
        state_id INTEGER NOT NULL DEFAULT 1\
      ) " );


}

function successCB() {
    //alert('successCB() TABLAS CREADAS')
}


//LOGIN

function save_login () {
    //alert("Save Login");
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(save_login_Populate, errorCB, save_login_Success);
}

function save_login_Populate(tx) {
    tx.executeSql('INSERT INTO usuarios(user_id,user_name)'+
                  'VALUES (?,?)', [user_id, user_name]);
}

function save_login_Success() {
    // alert("save_login_Success()");
    return true;
}

function check_logged() {
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(check_logged_populate, errorCB);
}

function check_logged_populate(tx) { 
    tx.executeSql('SELECT * FROM usuarios ORDER BY id DESC LIMIT 1', [], check_logged_Success, errorCB); 
}

function check_logged_Success(tx, results) {
    //alert('check_logged_Success(tx, results)')
    //alert(results.rows.length)
    //alert(results.rows.item(0).user_id)
    var len = results.rows.length;
    for (var i=0; i<len; i++){ 
        //alert(results.rows.item(i).user_id)
        user_id = results.rows.item(i).user_id;
        user_name = results.rows.item(i).user_name;
    }
    if(user_id!=0){
        //alert('is logged')
        loginf(user_id, function(){
            $.mobile.navigate( "#wellcome_2", { transition : "slide" } );
        });
    }else{
        //alert('is not logged yet')
    }
}



// ACTUALIZAR ÚLTIMOS PARTIDOS

function save_partidos_local() {
    l("Obteniendo últimos partidos");
    
    $.each(partidos_dbupd, function() {
        console.log("insertar partido: " + this.id);
        var query = 'INSERT OR REPLACE INTO partidos(id,equipo_l,equipo_v,resultado_l,resultado_v,info,inicio,user_id,user_name,serverupdate,finalizado) '+
                      'VALUES ('+this.id+', "'+this.equipo_l+'" , "'+this.equipo_v+'", "'+this.resultado_l+'", "'+this.resultado_v+'", "'+this.info+'", "'+this.inicio+'", "'+this.user_id+'", "'+this.user_name+'", "'+this.serverupdate+'", 1)';
        
        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                return true;

            }, errorCB);
        }, errorCB);
    });
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    //db.transaction(save_partidos_local_populate, errorCB, save_partidos_local_Success);
}
/*
function save_partidos_local_populate(tx) {
    $.each(partidos_dbupd, function() {
        tx.executeSql('INSERT OR REPLACE INTO partidos(id,equipo_l,equipo_v,resultado_l,resultado_v,info,inicio,user_id,user_name,serverupdate)'+
                      'VALUES (?,?,?,?,?,?,?,?,?,?)',
                      [this.id,
                       this.equipo_l,
                       this.equipo_v,
                       this.resultado_l,
                       this.resultado_v,
                       this.info,
                       this.inicio,
                       this.user_id,
                       this.user_name,
                        this.serverupdate]);
    })
}

function save_partidos_local_Success() {
    //l("Últimos partidos success");
    return true;
}
*/
function save_eventos_local() {
    l("Obteniendo últimos eventos");
    
    $.each(eventos_dbupd, function() {
        console.log("insertar evento: " + this.id);
        var query = 'INSERT OR REPLACE INTO eventos(id,evento,minuto,tiempo,user_id,partido_id,equipo,valor,serverupdate) '+
                      'VALUES ('+this.id+', "'+this.evento+'" , "'+this.minuto+'", "'+this.tiempo+'", "'+this.user_id+'", "'+this.partido_id+'", "'+this.equipo+'", "'+this.valor+'", "'+this.serverupdate+'")';
        
        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                return true;

            }, errorCB);
        }, errorCB);
    });
    
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    //db.transaction(save_eventos_local_populate, errorCB, save_eventos_local_Success);

}

/*function save_eventos_local_populate(tx) {

    $.each(eventos_dbupd, function() {
        tx.executeSql('INSERT OR REPLACE INTO eventos(id,evento,minuto,tiempo,user_id,partido_id,equipo,valor,serverupdate)'+
                      'VALUES (?,?,?,?,?,?,?,?,?)',
                      [this.id,
                       this.evento,
                       this.minuto,
                       this.tiempo,
                       this.user_id,
                       this.partido_id,
                       this.equipo,
                       this.valor,
                        this.serverupdate]);
    })
}

function save_eventos_local_Success() {
    //l("Últimos partidos success");
    return true;
}*/

function save_puntos_local() {
    l("Obteniendo últimos puntos");
    
    $.each(puntos_dbupd, function() {
        console.log("insertar punto: " + this.id);
        var query = 'INSERT OR REPLACE INTO puntos(id,user_id,user_id_from,partido_id,valor,serverupdate) '+
                      'VALUES ('+this.id+', "'+this.user_id+'" , "'+this.user_id_from+'", "'+this.partido_id+'", "'+this.valor+'", "'+this.serverupdate+'")';
        
        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                return true;

            }, errorCB);
        }, errorCB);
    });
    
    
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    //db.transaction(save_puntos_local_populate, errorCB, save_puntos_local_Success);

}
/*
function save_puntos_local_populate(tx) {

    $.each(puntos_dbupd, function() {
        tx.executeSql('INSERT OR REPLACE INTO puntos(id,user_id,user_id_from,partido_id,valor,serverupdate)'+
                      'VALUES (?,?,?,?,?,?)',
                      [this.id,
                       this.user_id,
                       this.user_id_from,
                       this.partido_id,
                       this.valor,
                        this.serverupdate]);
    })
}

function save_puntos_local_Success() {
    //l("Últimos partidos success");
    return true;
}*/

// CARGAR ÚLTIMOS PARTIDOS DE DB LOCAL

var load_from_user = 0;

function load_partidos_from_local () {
    //alert('load_partidos_from_local ()')
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(load_partidos_from_local_t, errorCB);
}

function load_partidos_from_local_t(tx) { 
    //l('load_partidos_from_local_t(tx)')
    if(load_from_user==1){
        tx.executeSql('SELECT * FROM partidos where user_id="'+user_id+'" ORDER BY id DESC', [], load_partidos_from_local_success, errorCB); 
        load_from_user=0;
    }else{
        tx.executeSql('SELECT * FROM partidos ORDER BY id DESC', [], load_partidos_from_local_success, errorCB); 
    }

}

function load_partidos_from_local_success(tx, results) {

    $('#partidos_list').html('');

    //l('load_partidos_from_local_success(tx, results) ');

    var len = results.rows.length;

    var partidos_temporal = [];
    var partidos_temporal_fecha = [];

    var pt = -1;

    for (var i=0; i<len; i++) {

        var date_inicio = results.rows.item(i).inicio.split(' ');

        fecha = date_inicio[0];

        if (!partidos_temporal_fecha[fecha]) {
            partidos_temporal_fecha[fecha] = [];  
            pt++;
        }

        if (!partidos_temporal[pt]) {
            partidos_temporal[pt] = []; 
        }

        partidos_temporal[pt].push( results.rows.item(i) );

    }

    if (partidos_temporal) {

        var html = '';

        //html +=   '<div class="list_box"><h4>Sin conexión</h4></div>' ;

        var today = new Date();
        var yesterday = new Date(new Date().setDate(new Date().getDate()-1));
        var date_today = today.getFullYear()+'-'+n(today.getMonth() + 1)+'-'+n( today.getDate() );
        var date_yesterday = yesterday.getFullYear()+'-'+n(yesterday.getMonth() + 1)+'-'+n( yesterday.getDate() );

        var j = 0;

        html += '<div class="partidos_list_offline">';

        $.each(partidos_temporal, function() {

            html += '<div class="list_box"> ' ;

            $.each(this, function() {
                var date_inicio = this.inicio.split(' ');
                fecha = date_inicio[0];

                if(fecha == date_today ) { fecha = 'Hoy'; } 
                else if (fecha == date_yesterday) { fecha = 'Ayer' } 
                else { fecha = partido.fecha =  moment(this.inicio, null, 'es', true).format("D [de] MMMM");}
            });

            html +=   '<h4>'+fecha+'</h4>' ;
            html +=     '<ul>';

            $.each(this, function() {

                var user_pic = "https://graph.facebook.com/"+this.user_id+"/picture?width=150&height=150";
                html +=        '<li data-sinc="'+this.sincronizar+'" data-user="'+this.user_name+'" data-user_id="'+this.user_id+'">'+
                    '<a href="#partido_eventos" id="'+this.id+'">'+
                    '<span class="img">'+
                    '<span class="img_perfil"><img alt="" src="'+user_pic+'" /></span>'+
                    '</span>'+
                    '<span class="club_name"><p>'+this.equipo_l+'</p></span>'+
                    '<span class="results">'+this.resultado_l+' &middot; '+this.resultado_v+'</span>'+
                    '<span class="club_name"><p>'+this.equipo_v+'</p></span>'+
                    '</a>'+
                    '</li>';
            });

            html +=     '</ul>';
            html += '</div>';

        });

        html += '</div>';

        $('#partidos_list').html(html);

        //l('use_cache();')
        use_cache();

    } else {
        l('no está cargado el array')
        var html = '<div class="list_box"><h4>Sin resultados</h4></div>';
        $('#partidos_list').html(html); 
        $('#loadmore').hide();
    }

    setTimeout(function(){reloadImages()}, 5000)

}


//guardar puntos local
function save_punto_local() {
    //l("save_partido_local()");
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(save_punto_local_populate, errorCB, save_partido_local_Success);

}

function save_punto_local_populate(tx) {

    tx.executeSql('INSERT INTO puntos(id, user_id,user_id_from,partido_id,serverupdate,valor)'+
                  'VALUES (?,?,?,?,?,?)',
                  [puntos_db[0].id,
                   puntos_db[0].user_id,
                   puntos_db[0].user_id_from,
                   puntos_db[0].partido_id,
                   puntos_db[0].serverupdate,
                   puntos_db[0].valor],
                  function(tx, results){
        //alert('Returned ID: ' + results.insertId);
    });

}


// GUARDAR PARTIDO A LOCAL

function save_partido_local() {
    //l("save_partido_local()");
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(save_partido_local_populate, errorCB, save_partido_local_Success);

}

function save_partido_local_populate(tx) {

    partido.equipo_l = partidos_db[0].equipo_l;
    partido.equipo_v = partidos_db[0].equipo_v;
    partido.info = partidos_db[0].info;
    partido.user_id = partidos_db[0].user_id;
    partido.user_name = partidos_db[0].user_name;

    partido.inicio = moment().format('YYYY-MM-DD HH:mm:ss');
    partido.fecha =  moment().format("dddd D [de] MMMM HH:mm");


    tx.executeSql('INSERT INTO partidos(id, equipo_l,equipo_v,resultado_l,resultado_v,info,inicio,user_id,user_name,sincronizar)'+
                  'VALUES (?,?,?,?,?,?,?,?,?,?)',
                  [partido.id,
                   partido.equipo_l,
                   partido.equipo_v,
                   0,
                   0,
                   partido.info,
                   partido.inicio,
                   partido.user_id,
                   partido.user_name,
                   1],
                  function(tx, results){
        partido.id = results.insertId;
        //alert('Returned ID: ' + results.insertId);
    });


    $.mobile.navigate( "#eventos", { transition : "slide" });
    cronometro( ".top_data .partido_d p.time", 0, 0 );
    m = 0;

}

function save_partido_local_Success() {
    //l("save_partido_local_Success()");
    return true;
}


// GET PARTIDO DE DB LOCAL

function get_partido_local() {
    //l('get_partido_local() ')
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(get_partido_local_t, errorCB);
}

function get_partido_local_t(tx) { 
    //l('get_partido_local_t(tx)')
    //l(partido.id)
    tx.executeSql('SELECT * FROM partidos where id='+partido.id, [], get_partido_local_success, errorCB); 
}

function get_partido_local_success(tx, results) {
    //l('get_partido_local_success(tx, results)')
    var len = results.rows.length;
    for (var i=0; i<len; i++){ 

        //user_id = results.rows.item(i).user_id;
        //user_name = results.rows.item(i).user_name;

        partido.equipo_l = results.rows.item(i).equipo_l;
        partido.equipo_v = results.rows.item(i).equipo_v;
        partido.resultado_l = results.rows.item(i).resultado_l;
        partido.resultado_v = results.rows.item(i).resultado_v;
        partido.info = results.rows.item(i).info;
        partido.user_id = results.rows.item(i).user_id;
        partido.user_name = results.rows.item(i).user_name;
        partido.inicio = results.rows.item(i).inicio;
        partido.fecha =  moment(results.rows.item(i).inicio, null, 'es', true).format("dddd D [de] MMMM HH:mm");

        partido.sincronizar = results.rows.item(i).sincronizar;
        partido.finalizado = results.rows.item(i).finalizado;

        //l(results.rows.item(i).equipo_l);

    }

}

// LOAD EVENTOS FROM PARTIDO_ID LOCAL

function load_partido_eventos_local() {
    //l('load_partido_eventos_local() ')
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(load_partido_eventos_local_t, errorCB);
}

function load_partido_eventos_local_t(tx) { 
    //l('load_partido_eventos_local_t(tx)')
    //l(partido.id)
    tx.executeSql('SELECT * FROM eventos where partido_id='+partido.id+'  order by minuto ASC, id ASC', [], load_partido_eventos_local_success, errorCB); 
}

function load_partido_eventos_local_success(tx, results) {

    //l('load_partido_eventos_local_success(tx, results)')

    var len = results.rows.length;

    //EVENTOS
    var html = '';
    var html2 = '';

    $('#eventos_list_1').html(html);
    $('#eventos_list_2').html(html2);

    var estadisticas = { 
        'try': {l: {cantidad:0, ganados:0, valor:0}, v: {cantidad:0, ganados:0, valor:0}}, 
        conversiones: {l: {cantidad:0, ganados:0, valor:0}, v: {cantidad:0, ganados:0, valor:0}}, 
        drop: {l: {cantidad:0, ganados:0, valor:0}, v: {cantidad:0, ganados:0, valor:0}}, 
        palos: {l: {cantidad:0, ganados:0, valor:0}, v: {cantidad:0, ganados:0, valor:0}},
        penales: {l: {cantidad:0, ganados:0, valor:0}, v: {cantidad:0, ganados:0, valor:0}}, 
        cambio: {l: {cantidad:0, ganados:0, valor:0}, v: {cantidad:0, ganados:0, valor:0}}, 
        scrum: {l: {cantidad:0, ganados:0, valor:0}, v: {cantidad:0, ganados:0, valor:0}}, 
        line: {l: {cantidad:0, ganados:0, valor:0}, v: {cantidad:0, ganados:0, valor:0}}, 
        pass_fw: {l: {cantidad:0, ganados:0, valor:0}, v: {cantidad:0, ganados:0, valor:0}}, 
        knock_on: {l: {cantidad:0, ganados:0, valor:0}, v: {cantidad:0, ganados:0, valor:0}}, 
        tarjeta_amarilla: {l: {cantidad:0, ganados:0, valor:0}, v: {cantidad:0, ganados:0, valor:0}}, 
        tarjeta_roja: {l: {cantidad:0, ganados:0, valor:0}, v: {cantidad:0, ganados:0, valor:0}},
        free_kick: {l: {cantidad:0, ganados:0, valor:0}, v: {cantidad:0, ganados:0, valor:0}}
    }

    //l(estadisticas)

    if(results.rows.length>0) {

        for (var i=0; i<len; i++){ 

            //l(results.rows.item(i))

            var evento_name =  results.rows.item(i).evento.toLowerCase().replace(' ', '_');

            if(evento_name=='infracción') { 

                if(results.rows.item(i).tiempo == 2) {
                    html2 += '<div class="evento equipo_'+results.rows.item(i).equipo+'">' + 
                        '<span class="ico-evento ico-evento-penal"></span>' +
                        "<span class='desc'>Infracción "+n(results.rows.item(i).minuto)+"'</span>" +
                        '</div>';
                } else {
                    html += '<div class="evento equipo_'+results.rows.item(i).equipo+'">' + 
                        '<span class="ico-evento ico-evento-penal"></span>' +
                        "<span class='desc'>Infracción "+n(results.rows.item(i).minuto)+"'</span>" +
                        '</div>';
                }


            } else {

                if(results.rows.item(i).tiempo == 2) {
                    html2 += '<div class="evento equipo_'+results.rows.item(i).equipo+'">' + 
                        '<span class="ico-evento ico-evento-'+results.rows.item(i).evento.toLowerCase().replace(' ', '_')+'"></span>' +
                        "<span class='desc'>"+results.rows.item(i).evento+" "+n(results.rows.item(i).minuto)+"'</span>" +
                        '</div>';
                } else {
                    html += '<div class="evento equipo_'+results.rows.item(i).equipo+'">' + 
                        '<span class="ico-evento ico-evento-'+results.rows.item(i).evento.toLowerCase().replace(' ', '_')+'"></span>' +
                        "<span class='desc'>"+results.rows.item(i).evento+" "+n(results.rows.item(i).minuto)+"'</span>" +
                        '</div>';
                }

            }

            var evento_equipo = results.rows.item(i).equipo;

            //l(evento_name)
            //l(evento_equipo)

            if( evento_name=='infracción' ) {

                if(evento_equipo=='l'){
                    estadisticas.penales["v"].cantidad = estadisticas.penales["v"].cantidad + 1;
                } else {
                    estadisticas.penales["l"].cantidad = estadisticas.penales["l"].cantidad + 1;
                }

            } else {

                // SI ES TARJETA
                if( evento_name=='tarjeta' && results.rows.item(i).valor==1 ) {

                    estadisticas.tarjeta_roja[evento_equipo].cantidad = estadisticas.tarjeta_roja[evento_equipo].cantidad + 1;

                } else if( evento_name=='tarjeta' && results.rows.item(i).valor==0 ) {

                    estadisticas.tarjeta_amarilla[evento_equipo].cantidad = estadisticas.tarjeta_amarilla[evento_equipo].cantidad + 1;


                    // SI NO ES TARJETA
                } else {

                    estadisticas[evento_name][evento_equipo].cantidad = estadisticas[evento_name][evento_equipo].cantidad + 1;

                    if(results.rows.item(i).valor!=0) {
                        estadisticas[ evento_name ][ evento_equipo ].ganados = estadisticas[ evento_name ][ evento_equipo ].ganados + 1;
                    }

                    if( evento_name=='try' && results.rows.item(i).valor==7 ) {
                        estadisticas.conversiones[evento_equipo].cantidad = estadisticas.conversiones[evento_equipo].cantidad + 1;
                    }

                    if( evento_name=='drop' || evento_name=='palos' ) {
                        if(results.rows.item(i).valor > 0 ) { var ganado=1; } else {var ganado=0;}
                        estadisticas[ evento_name ][ evento_equipo ].valor = estadisticas[ evento_name ][ evento_equipo ].valor + ganado;
                    } else {
                        estadisticas[ evento_name ][ evento_equipo ].valor = estadisticas[ evento_name ][ evento_equipo ].valor + results.rows.item(i).valor;
                    }


                }

            }

        }

    } else { html = '<span>Sin eventos</span>'; }

    $('#eventos_list_1').html(html);
    $('#eventos_list_2').html(html2);

    //l(estadisticas)

    //ESTADISTICAS
    var html_est = '';
    $.each(estadisticas, function(key, value) {

        if( key=='try' || key=='conversiones' || key=='cambio' || key=='pass_fw' || key=='knock_on' || key=='penales' || key=='tarjeta_amarilla' || key=='tarjeta_roja' ) {
            html_est += '<li><span>'+this.l.cantidad+'</span><span class="est">'+key.replace('_', ' ')+'</span><span>'+this.v.cantidad+'</span></li>';
        } else if(key=='drop' || key=='penal' || key=='line' || key=='scrum' || key=='palos') {
            html_est += '<li><span>'+this.l.valor+'/'+this.l.cantidad+'</span><span class="est">'+key.replace('_', ' ')+'</span><span>'+this.v.valor+'/'+this.v.cantidad+'</span></li>';
        }

    });
    $('#estadisticas_list').html(html_est);
    
    hideFbShare();

}



// SAVE EVENTO LOCAL

function save_evento_local() {
    //l("save_evento_local()");
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(save_evento_local_populate, errorCB, save_evento_local_Success);
}

var valor_local = 0 ;

function save_evento_local_populate(tx) {

    /*if(add_evento=="Penal"){

        add_evento = "Infracción";

        //if(add_evento_penal!="") {

        tx.executeSql('INSERT INTO eventos (id, evento,minuto,tiempo,user_id,partido_id,equipo,valor)'+
                      'VALUES (?,?,?,?,?,?,?)',
                      [evento_local.id,
                       add_evento,
                       evento_local.minuto,
                       evento_local.tiempo,
                       evento_local.user_id,
                       evento_local.partido_id,
                       evento_local.equipo,
                       valor_local ] );

        if(add_evento_penal=="") {
            add_evento_penal = "Free Kick";
        }

        add_evento=add_evento_penal;

        //}

    }*/

    if(add_evento=='Try') {
        valor_local = (evento_local.conversion=='s') ? 7 : 5;
    } else if (add_evento=='Drop' || add_evento=='Palos') {
        valor_local = (evento_local.conversion=='s') ? 3 : 0;
    } else if (add_evento=='Line' || add_evento=='Scrum' || add_evento=='Tarjeta') {
        valor_local = (evento_local.conversion=='s') ? 1 : 0;
    }

    //setTimeout(function(){

    tx.executeSql('INSERT INTO eventos (id, evento,minuto,tiempo,user_id,partido_id,equipo,valor,serverupdate)'+
                  'VALUES (?,?,?,?,?,?,?,?,?)',
                  [evento_local.id, add_evento,
                   evento_local.minuto,
                   evento_local.tiempo,
                   evento_local.user_id,
                   evento_local.partido_id,
                   evento_local.equipo,
                   valor_local, 
                   evento_local.serverupdate] );

    //}, 200)

}


var incremento_valor_local = {}

function save_evento_local_Success() {

    //l("save_evento_local_Success()");


    if(add_evento=='Try' || add_evento=='Drop' || add_evento=='Palos' ) {

        incremento_valor_local = {
            partido_id: evento_local.partido_id,
            equipo: evento_local.equipo,
            valor : valor_local
        }

        incrementar_resultado_local();

    } else {
        evento_local_agregado();
    }


    return true;
}


// INCREMENTAR RESULTADO EN UN PARTIDO

function incrementar_resultado_local() {
    //l("incrementar_resultado_local()");
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(incrementar_resultado_local_populate, errorCB, incrementar_resultado_local_Success);

}

function incrementar_resultado_local_populate(tx) {
    //l(incremento_valor_local)
    tx.executeSql("update partidos set resultado_" + incremento_valor_local.equipo + " = resultado_" + incremento_valor_local.equipo + " + " + incremento_valor_local.valor + " where id=" + incremento_valor_local.partido_id)
}

function incrementar_resultado_local_Success() {

    //l("incrementar_resultado_local_Success()");

    evento_local_agregado();

    return true;
}


function evento_local_agregado() {
    var next = "#partido_eventos";

    if(add_evento=="Infracción"){ 
        if(add_evento_penal=="") { 
            //next = "#eventos"; 
        } 
    }

    //l(next)

    $.mobile.navigate( next, { transition : "slide" });
    $.mobile.loading("hide");
}


// SYNC

function sync_datos () {
    //l('paso 1: sync_datos')
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(sync_datos_populate, errorCB);
}

function sync_datos_populate(tx) {
    //l('paso 2: sync_datos_populate(tx)')
    tx.executeSql('SELECT * FROM partidos where sincronizar = 1 ORDER BY id ASC', [], sync_datos_success, errorCB); 
}

function sync_datos_success(tx, results) {
    //l('paso 3: sync_datos_success(tx, results)')
    var len = results.rows.length;
    for (var i=0; i<len; i++){ 
        //l('paso 4: sync_save_partido(equipo_l, equipo_v, info, user_id, callback) partido_id_from = ' + results.rows.item(i).id)
        sync_save_partido(
            results.rows.item(i).equipo_l, 
            results.rows.item(i).equipo_v, 
            results.rows.item(i).resultado_l, 
            results.rows.item(i).resultado_v, 
            results.rows.item(i).info, 
            results.rows.item(i).inicio, 
            results.rows.item(i).user_id, 
            results.rows.item(i).id, 
            function(partido_id_from, partido_id_to){
                //l('callback sync_save_partido => partido_id_from = ' + partido_id_from + ', partido_id_to = ' + partido_id_to )
                sync_datos_eventos (partido_id_from, partido_id_to)
            }
        );

    }

}


function sync_save_partido(equipo_l, equipo_v, resultado_l, resultado_v, info, inicio, user_id, partido_id_from, callback) {
    $.ajax({
        url: service_url+"?action=importar_partido",
        type: "post",
        data: { 
            equipo_l: equipo_l, 
            equipo_v: equipo_v, 
            resultado_l: resultado_l, 
            resultado_v: resultado_v, 
            info: info, 
            inicio: inicio, 
            user_id: user_id 
        },
        datatype: 'json',
        success: function(data){
            if (callback) { callback(partido_id_from, data.partido.id); }
            delete_partido_local(partido_id_from);
        },
        error:function(){
            alert(data.result)
        }   
    });
}

function delete_partido_local(partido_id) {
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(function(tx){delete_partido_local_populate(tx, partido_id)}, errorCB);
}

function delete_partido_local_populate(tx, partido_id) {
    tx.executeSql('delete from partidos where sincronizar=1 and id='+partido_id);
    //l('partido' + partido_id + ' borrado.')
}


function sync_datos_eventos (partido_id_from, partido_id_to) {
    //l('paso 5: sync_datos_eventos (partido_id_from, partido_id_to) => partido_id_from = ' + partido_id_from + ', partido_id_to = ' + partido_id_to )
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction( function(tx){ sync_datos_eventos_populate(tx, partido_id_from, partido_id_to) }, errorCB);
}


var partido_id_to_now = 0;

function sync_datos_eventos_populate (tx, partido_id_from, partido_id_to) { 
    partido_id_to_now = partido_id_to;
    //l('paso 6: sync_datos_eventos_populate (tx, partido_id_from, partido_id_to) => partido_id_from = ' + partido_id_from + ', partido_id_to = ' + partido_id_to )
    tx.executeSql('SELECT * FROM eventos where partido_id='+partido_id_from+' ORDER BY id ASC', [], sync_datos_eventos_success, errorCB); 
}


function sync_datos_eventos_success(tx, results) {
    //l('paso 7: sync_datos_eventos_success(tx, partido_id_to, results) ' + partido_id_to_now )
    var len = results.rows.length;
    for (var i=0; i<len; i++){ 

        //l(results.rows.item(i))
        var evento_sync = {
            id: results.rows.item(i).id, 
            evento: results.rows.item(i).evento, 
            minuto: results.rows.item(i).minuto, 
            tiempo: results.rows.item(i).tiempo, 
            user_id: results.rows.item(i).user_id, 
            partido_id: partido_id_to_now,
            equipo:results.rows.item(i).equipo,
            valor: results.rows.item(i).valor
        }
        sync_save_evento(evento_sync);

    }
}


function sync_save_evento (evento_sync) {
    //l('paso 8: sync_save_evento (evento_sync)' )
    //l(evento_sync)
    $.ajax({
        url: service_url+"?action=importar_evento",
        type: "post",
        data: evento_sync,
        datatype: 'json',
        success: function(data){ l('evento guardado'); delete_evento_local(evento_sync.id) },
        error:function(){ alert(data.result) }   
    });
}



function delete_evento_local(evento_id) {
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(function(tx){delete_evento_local_populate(tx, evento_id)}, errorCB);
}

function delete_evento_local_populate(tx, evento_id) {
    tx.executeSql('delete from eventos where id='+evento_id);
    //l('evento' + evento_id + ' borrado.')
}



function delete_partidos_local(partido_id) {
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(delete_partidos_local_populate, errorCB);
}

function delete_partidos_local_populate(tx, partido_id) {
    tx.executeSql('delete from partidos where sincronizar=0');
}





//borrar tablas
function delete_tables() {
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(delete_tables_t, errorCB);
}

function delete_tables_t(tx) {
    tx.executeSql('DROP table partidos');
    tx.executeSql('DROP table eventos');
    tx.executeSql('DROP table usuarios');
    tx.executeSql('DROP table puntos');
}





// ************************************* EVENTOS POR SECCIÓN **************************************


// TODAS LAS PÁGINAS

$(document).on('pagebeforeshow', '[data-role="page"]', function(){ 

    var id = $(this).attr('id');
    $.mobile.activePage.find(".panel").each(function(){ $(this).attr('id','panel-'+id); })
    $.mobile.activePage.find(".navicon").each(function(){ $(this).attr('href','#panel-'+id); })

});


// CONTROL DE ENTRADA Y SALIDA DE SECCIONES

$(document).on("pagebeforechange", function(e, ob) {

    // SECCIÓN LISTADO DE EVENTOS A UN NUEVO PARTIDO (SALIENDO)
    if (ob.options.fromPage && ob.options.fromPage[0].id === "eventos" && ob.toPage[0].id === "nuevo_partido" ) {
        if(confirm("Está seguro que desea salir y cerrar el partido?")) {
            l("terminó el partido");

            clearInterval(tiempo_corriendo);
            clearInterval(entretiempo_corriendo);

            reset_partido();

            $.mobile.navigate( "#partidos", { transition : "slide" });
            e.preventDefault();
        } else {
            l("sigue");
            e.preventDefault();
            history.go(1);
        }
    }

    // SECCIÓN LISTADO DE EVENTOS A DETALLE DE PARTIDO (CON EL BACK DEL CELU... SALIENDO)
    if (ob.options.fromPage && ob.options.fromPage[0].id === "eventos" && ob.toPage[0].id === "partido_eventos" ) {
        e.preventDefault();
        $.mobile.navigate( "#nuevo_partido", { transition : "slide" });
    }

    // PREVENIR IR A LA PAGINA WELLCOME 1 SI YA ESTÁ LOGUEADO
    if (ob.options.fromPage && ob.options.fromPage[0].id === "wellcome_2" && ob.toPage[0].id === "wellcome_1" ) {
        if(user_id=!''){
            e.preventDefault();
        }
    }

});


// INI

$(document).on("pageshow","#ini",function() {

    $.mobile.navigate( "#wellcome_1", { transition : "slide" });

})

// WELLCOME

$(document).on("pageshow","#wellcome_2",function() {

    if (window.cordova) {
        if(!checkConnection()){

            $('img').each(function() {
                //ImgCache.cacheFile($(this).attr('src'));
            });

            $('.img_perfil img').each(function() {
                //ImgCache.useCachedFile($(this));
                //$(this).attr('src', "images/default_profile.jpg");
            });

        } else {
            admob.destroyBannerView();
        }
    }

})


// LISTADO DE PARTIDOS

$(document).on("pageshow","#partidos",function() {
    
    

    // RESET PARTIDO
    reset_partido_detalles ();
    $('#partido_eventos a.back').attr('href', '#partidos');

    load_partidos_from_local ();
    $('#loadmore').hide();

    if(checkConnection()){
        adMobBannerShow();
    }

    /*if(!checkConnection()){

        load_partidos_from_local ();
        $('#loadmore').hide();

    } else {

        get_partidos ('all');
        
        adMobBannerShow();

    }*/


});

//LISTADO DE EVENTOS 

$(document).on("pageshow","#eventos",function() {

    load_partido_detalles ();

    /*if(!checkConnection()){
        load_partido_detalles ();
    }else{
        get_partido(partido.id);
    }*/

    $('#partido_eventos a.back').attr('href', '#eventos');

});

//NUEVO PARTIDO

$(document).on("pageshow","#nuevo_partido",function() {
    
    if (window.cordova) {
        admob.destroyBannerView();
    }

    setTimeout(function(){$("#nuevo_partido .ui-panel-wrapper").css('height', '100%')},20)
    setTimeout(function(){$("#nuevo_partido .ui-panel-wrapper").css('height', '100%')},50)
    setTimeout(function(){$("#nuevo_partido .ui-panel-wrapper").css('height', '100%')},80)
    setTimeout(function(){$("#nuevo_partido .ui-panel-wrapper").css('height', '100%')},100)
    setTimeout(function(){$("#nuevo_partido .ui-panel-wrapper").css('height', '100%')},150)
    setTimeout(function(){$("#nuevo_partido .ui-panel-wrapper").css('height', '100%')},200)
    setTimeout(function(){$("#nuevo_partido .ui-panel-wrapper").css('height', '100%')},250)
    setTimeout(function(){$("#nuevo_partido .ui-panel-wrapper").css('height', '100%')},300)
    setTimeout(function(){$("#nuevo_partido .ui-panel-wrapper").css('height', '100%')},400)
    setTimeout(function(){$("#nuevo_partido .ui-panel-wrapper").css('height', '100%')},500)
    setTimeout(function(){$("#nuevo_partido .ui-panel-wrapper").css('height', '100%')},600)
    setTimeout(function(){$("#nuevo_partido .ui-panel-wrapper").css('height', '100%')},700)
    setTimeout(function(){$("#nuevo_partido .ui-panel-wrapper").css('height', '100%')},800)
    setTimeout(function(){$("#nuevo_partido .ui-panel-wrapper").css('height', '100%')},900)
    setTimeout(function(){$("#nuevo_partido .ui-panel-wrapper").css('height', '100%')},1000)


    reset_partido();
    reset_partido_detalles();

    $("#nuevo_partido .ui-content input#equipo_l").val('');
    $("#nuevo_partido .ui-content input#equipo_v").val('');
    $("#nuevo_partido .ui-content input#info").val('');

    if(checkConnection()) {

        var ac_el = $("input#equipo_l").autocomplete({
            target: $('#suggestions_l'),
            source: service_url,
            callback: function(e) {
                var $a = $(e.currentTarget); // access the selected item
                $('#equipo_l').val($a.text()); // place the value of the selection into the search box
                $("#equipo_l").autocomplete('clear'); // clear the listview
            },
            minLength: 1
        });


        var ac_ev = $("input#equipo_v").autocomplete({
            target: $('#suggestions_v'),
            source: service_url,
            callback: function(e) {
                var $a = $(e.currentTarget); // access the selected item
                $('#equipo_v').val($a.text()); // place the value of the selection into the search box
                $("#equipo_v").autocomplete('clear'); // clear the listview
            },
            minLength: 1
        });

        $('#nuevo_partido').on({
            click: function () {
                $("#equipo_l").autocomplete('clear');
                $("#equipo_v").autocomplete('clear');
            }
        })


    } else {
        //alert('unbind autocomplete');
        $("#nuevo_partido input#equipo_l").autocomplete("destroy");
        $("#nuevo_partido input#equipo_v").autocomplete("destroy");
        $("input#equipo_l").unbind('autocomplete');
        $("input#equipo_v").unbind('autocomplete');
    }

});

//AGREGAR EVENTO 

$(document).on("pageshow","#agregar_evento",function() {
    
    if (window.cordova) {
        admob.destroyBannerView();
    }

    if(checkConnection()){
        get_partido(partido.id);
    } else {
        load_partido_detalles ();
    }

    add_evento_penal = "";

    $("#agregar_evento .penal_eventos").hide();

    $("#agregar_evento .conversion .opcion:first p").text('No');
    $("#agregar_evento .conversion .opcion:last p").text('Si');

    if( add_evento=="Try" || add_evento=="Drop") {

        $("#agregar_evento .conversion .titulo").text('¿Convertido?')
        $("#agregar_evento .conversion").show();

    } else if ( add_evento=="Scrum" || add_evento=="Line" ) {

        $("#agregar_evento .conversion .titulo").text('¿Ganado?')
        $("#agregar_evento .conversion").show();

    } else if ( add_evento=="Tarjeta" ) {

        $("#agregar_evento .conversion .titulo").text('¿Color?');
        $("#agregar_evento .conversion .opcion:first p").text('Amarilla');
        $("#agregar_evento .conversion .opcion:last p").text('Roja');
        $("#agregar_evento .conversion").show();

    } else if (  add_evento=="Penal"  ) {

        //$("#agregar_evento .conversion .titulo").text('¿Convertido?')

        $("#agregar_evento .penal_eventos").show();
        $("#agregar_evento .conversion").hide();

    } else {

        $("#agregar_evento .conversion").hide();

    }

    $('#agregar_evento .evento_img').html('<img alt="" src="images/eventos/'+add_evento.toLowerCase().replace(' ', '_')+'.png" />')

});

//PARTIDO DETALLES, EVENTOS Y ESTADÍSTICAS

$(document).on("pageshow","#partido_eventos",function() {

    //l("#partido_eventos")
    if(!checkConnection()){
        l('Sin conexión.');
        if (window.cordova) {
            admob.destroyBannerView();
        }
    }


    load_partido_eventos (partido.id);
    setTimeout(function(){
        load_partido_detalles ();
    }, 600);
    
    get_load_user_partidos (partido.user_id);
    get_load_user_name (partido.user_id) ;
    get_load_rating(partido.user_id);
    
    if (window.cordova) {
        adMobBannerShow();
    }

    /*if(!checkConnection()){

        l('Sin conexión.');
        
        if (window.cordova) {
        admob.destroyBannerView();
    }

        load_partido_eventos (partido.id);
        setTimeout(function(){
            load_partido_detalles ();
        }, 600)


    } else {
        
        adMobBannerShow();

        load_partido_eventos (partido.id, function(){
            get_load_rating (partido.user_id, function () {
                get_load_user_partidos (partido.user_id);
                get_load_user_name (partido.user_id) ;
            });
        });

    }

*/

    $('.bottom_datos_perfil .datos_perfil .img_perfil img').attr('src', "https://graph.facebook.com/"+partido.user_id+"/picture?width=150&height=150");



});



$(document).on('backbutton', function(e, data){

    e.preventDefault();

    var activePage = $.mobile.activePage[0].id;

    if(activePage=="partidos") {
        $.mobile.navigate( "#wellcome_2", { transition : "slide" });
    }

});






// ************************************* INI **************************************

var updateInterval = null;

function ini() {

    l('INI')

    db = window.openDatabase("rugby", "1.0", "Rugby", 200000);

    onDeviceReady_DB();

    check_logged();

    /*if(checkConnection()) {
        sync_datos();
    }*/
    
    if(updateInterval == null){
        updateInterval = setInterval(function(){ get_updates_sv(); }, 5000);
        //get_updates_sv();
    }
    

    //LOGIN
    $('#login').click(function(e){
        login();
        e.preventDefault();
    });

    //LISTADO DE PARTIDOS
    $('#get_partidos').click(function(e){

        l("$('#get_partidos').click")

        reset_partido_detalles ();
        
        load_partidos_from_local ();
        $('#loadmore').hide();

        /*if(!checkConnection()){

            load_partidos_from_local ();
            $('#loadmore').hide();

        } else {

            cantidad_restante = 1;
            get_partidos('all',0);

        }*/

        $( this ).parents('.panel').panel( "close" );

        $('[data-role=header],[data-role=footer]').css('overflow-x', 'visible');

    });
    
    //preguntar si se esta jugando un partido
    $(document).on('pagebeforechange', function(e, data){
        var to = data.toPage;
        if (typeof to === 'string') {
            var u = $.mobile.path.parseUrl(to);
            to = u.hash || '#' + u.pathname.substring(1);
            
            if (to === '#partidos' || to === '#nuevo_partido') {
                if(isCurrentPartido){
                    
                    /*if(window.cordova){
                            e.preventDefault();
                            navigator.notification.confirm( 'Tienes un partido en juego, Seguro deseas salir? El partido en juego quedará como finalizado.', function(buttonIndex){
                                if (buttonIndex==2){
                                    $.mobile.navigate( "#partidos", { transition : "slide" });
                                }
                            }, 'Salir', 'Cancelar,Si' );
                        
                    }else{*/
                        if(!confirm("Tienes un partido en juego, Seguro deseas salir? El partido en juego quedará como finalizado.")){
                            e.preventDefault();
                        }
                    //}

                }
            }
        }
    });

    $('#partidos').on({
        click: function () {
            
            if( $('#search').val()!="undefined" && $('#search').val()!="" ) {

                if($('#search').hasClass('byequipo')){
                    var obj_filter = { type: "byequipo", id: $('#search').val() }
                    user_id_filter = 0;
                } else {
                    if(user_id_filter!=0){
                        var obj_filter = { type: "byusuario", id: user_id_filter }
                        } else {
                            var obj_filter = { type: "byusuario", id: $('#search').val() }
                            }
                }

            } else { var obj_filter = 'all'; }
            get_partidos(obj_filter, $("#partidos_list li").length);
        }
    }, '#loadmore');


    //LISTADO DE MIS PARTIDOS
    $('#get_mis_partidos').click(function(e){
        reset_partido_detalles ();
        /*if(checkConnection()){
            get_partidos({type:'byusuario',id:user_id},0)
        } else {
            load_from_user=1;
            load_partidos_from_local();
        }*/
        
        load_from_user=1;
        load_partidos_from_local();

        $( this ).parents('.panel').panel( "close" );
    })



    //CLICK EN UN PARTIDO EN LISTADO DE PARTIDOS
    $('#partidos_list').on({
        click: function(e) {
            if( $(this).attr('href') == "#list_user_partidos" ) {

                user_id_filter = $(this).attr('id');
                
                get_partidos_filter(user_id_filter);
                /*if(!checkConnection()){
                    get_partidos_filter(user_id_filter)
                } else {
                    get_partidos({type:'byusuario',id:user_id_filter}, 0);
                }*/

            } else {

                //l('acá?')

                partido.id = $(this).attr('id');
                get_partido(partido.id, function(){ $.mobile.navigate( "#partido_eventos", { transition : "slide" });});

            }
            e.preventDefault();
        }
    }, 'a');

    // BUSQUEDA DE PARTIDOS
    $('.search_bar .type ').on({
        click: function(){
            if($(this).hasClass('active')) {
                $('.search_bar .type a').css('display', 'none');
                $(this).removeClass('active');
            } else {
                $('.search_bar .type a').css('display', 'block');
                $(this).addClass('active');
            }

        }
    }, 'span.select')

    //SEARCH SELECT
    $('.search_bar .type a').click(function(e){
        if($(this).attr('href')=="#by_usuario") {
            $('#search').attr('placeholder', "Buscá por usuario...").removeClass('byequipo');
            $(this).parents('.search_bar').find('.select .ico').removeClass('ico-equipo')
            $(this).parents('.search_bar').find('.select .ico').addClass('ico-user')
        } else {
            $('#search').attr('placeholder', "Buscá por equipo...").addClass('byequipo');
            $(this).parents('.search_bar').find('.select .ico').removeClass('ico-user')
            $(this).parents('.search_bar').find('.select .ico').addClass('ico-equipo')
        }
        $('.search_bar .type a').hide()
        e.preventDefault();
    });

    // SEARCH ACTION
    $('#search').keyup(function(){
        filter($(this));
    });

    // SAVE PARTIDO
    $('#nuevo_partido a#save_partido').click(function(e){

        if( $('#equipo_l').val()!="" && $('#equipo_v').val()!=""  ) {

            save_partido( $('#equipo_l').val(), $('#equipo_v').val(), $('#info').val(), user_id );
            isCurrentPartido = true;
        } else {
            alert("Ingrese los equipos")
            e.preventDefault();
        }
    });

    $('#nuevo_partido input').on( "focus", function(){
        $('#nuevo_partido .bottom_btn').css('position', 'relative');
    });

    $('#nuevo_partido input').on( "blur", function(){
        $('#nuevo_partido .bottom_btn').css('position', 'fixed');
    });

    // EVENTOS
    $('#eventos .eventos a').click(function(e){
        if($(this).parents('.eventos').hasClass('no_add')){
            e.preventDefault()
        } else {
            add_evento = $(this).find('.desc').text();
        }
    })

    // EVENTOS PENAL
    $('#agregar_evento .penal_eventos a').click(function(e){

        add_evento_penal = $(this).find('.desc').text();

        $("#agregar_evento .penal_eventos").hide();

        if(add_evento_penal=="Palos") {
            $("#agregar_evento .conversion .titulo").text('¿Convertido?');
            $("#agregar_evento .conversion .opcion:first p").text('No');
            $("#agregar_evento .conversion .opcion:last p").text('Si');

        }else if(add_evento_penal=="Line" || add_evento_penal=="Scrum") {
            $("#agregar_evento .conversion .titulo").text('¿Ganado?');
            $("#agregar_evento .conversion .opcion:first p").text('No');
            $("#agregar_evento .conversion .opcion:last p").text('Si');
        }
        $('#agregar_evento .evento .desc').text(add_evento_penal);
        $('#agregar_evento .evento_img').html('<img alt="" src="images/eventos/'+add_evento_penal.toLowerCase().replace(' ', '_')+'.png" />')

        $("#agregar_evento .conversion").show();

    })


    // CONTROLAR 1ER TIEMPO, 2DO TIEMPO
    $('#control_tiempo').click(function(e){
        cambiar_tiempo ($(this));
        e.preventDefault();
    })

    // CAMBIAR EL MINUTO DEL EVENTO
    $(".minuto a.control").click(function(){
        if(partido.tiempo==2){
            if($(this).hasClass('c_mas')) { m++; } else { if(m>=41) { m--; } }
        } else {
            if($(this).hasClass('c_mas')) { m++; } else { if(m>=0) { m--; } }
        }
        $('.minuto .result').text( m + "'" );
    });


    // GUARDAR EVENTO
    $("#agregar_evento #marcar").click(function(e){
        save_evento ();
        e.preventDefault();
    });


    //PARTIDO DETALLE VOTOS
    $('.rating a').click(function(e){
        if($(this).parents('.rating').hasClass('no_votar')) { } else {
            $('.rating a').removeClass('active');
            $(this).prevAll().addClass('active');
            $(this).addClass('active');

            save_rating( $( ".rating a" ).index( this ) + 1, partido.user_id, user_id, partido.id, function() {
                get_puntos (partido.user_id, function(rating, puntos) {
                    $('.bottom_datos_perfil .datos_perfil .values .v:last').text(puntos);
                });
            } );
        }
        e.preventDefault();
    })






}




var admobid = {};


function initAdMob(){
    initAds();
}

function adMobBannerShow(){
    if (window.cordova) {
        admob.createBannerView();
    }
}

var isAppForeground = true;

function initAds() {
    if (admob) {
        var adPublisherIds = {
            ios : {
                banner: 'ca-app-pub-9046869699589240/8266061019',
                interstitial: 'ca-app-pub-9046869699589240/9742794218'
            },
            android : {
                banner: 'ca-app-pub-9046869699589240/8266061019',
                interstitial: 'ca-app-pub-9046869699589240/9742794218'
            }
        };

        var admobid = (/(android)/i.test(navigator.userAgent)) ? adPublisherIds.android : adPublisherIds.ios;

        admob.setOptions({
            publisherId:      admobid.banner,
            interstitialAdId: admobid.banner
        });

        registerAdEvents();

    } else {
        l('AdMobAds plugin not ready');
    }
}

function onAdLoaded(e) {
    if (isAppForeground) {
        if (e.adType === admob.AD_TYPE.INTERSTITIAL) {
            l("An interstitial has been loaded and autoshown. If you want to load the interstitial first and show it later, set 'autoShowInterstitial: false' in admob.setOptions() and call 'admob.showInterstitialAd();' here");
        } else if (e.adType === admob.AD_TYPE_BANNER) {
            l("New banner received");
        }
    }
}


function registerAdEvents() {
    document.addEventListener(admob.events.onAdLoaded, onAdLoaded);
    document.addEventListener(admob.events.onAdFailedToLoad, function (e) {});
    document.addEventListener(admob.events.onAdOpened, function (e) {});
    document.addEventListener(admob.events.onAdClosed, function (e) {});
    document.addEventListener(admob.events.onAdLeftApplication, function (e) {});
    document.addEventListener(admob.events.onInAppPurchaseRequested, function (e) {});
}

function onDeviceReady() {
    if (window.cordova) {
        initAdMob();
    }
}




//sync
function queueSync(func, data){
    updateDB("INSERT INTO `syncs`(`func`, `vals`) VALUES ('"+func+"','"+data+"')");
    serverSync();
}

function updateDB(sql_){
    //console.log(sql_);
    db.transaction(function(tx){
        tx.executeSql(sql_);
    }, errorCB);
}

function mylog(log_){
    console.log(log_);
}

var uploadTimeout = null;
var syncing       = false;
var srvsyncing    = false;
var srvintentos   = 0;

function serverSync(){
    mylog('serverSync');
    if(checkConnection() && !srvsyncing){
        syncing=true;
        srvsyncing=true;
        clearTimeout(uploadTimeout);
        var query = "SELECT * FROM `syncs` WHERE  state_id <> 2 LIMIT 25";
        mylog(query);
        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                if(results.rows.length > 0){
                    //mylog(results.rows);
                    i = 0;
                    var forsync= new Array();
                    while(i < results.rows.length){
                        console.log(results.rows.item(i).func+' -> '+results.rows.item(i).vals);
                        try{
                            var myvals = JSON.parse(results.rows.item(i).vals);
                            forsync[i] = {
                                id: results.rows.item(i).id, 
                                func: results.rows.item(i).func, 
                                vals: myvals};
                        }catch(e){
                            console.log('update syncs set state_id=2 where id='+results.rows.item(i).id);
                            updateDB('update syncs set state_id=2 where id='+results.rows.item(i).id);
                        }
                        i++;
                    }
                    mylog(forsync);
                    $.ajax({
                        url: service_url+"?action=sync",
                        /*url: responseUrl+'sync',*/
                        type: "POST", 
                        cache: false, 
                        dataType: 'json',
                        /*callback: 'callback',*/
                        data: '&forsync='+JSON.stringify(forsync)+'&json=true&sync=true',
                        success: function(data){ 
                            mylog('success');
                            mylog(data.content);
                            var oks = '';
                            var bads = '';
                            var sw  = false;
                            for (var i=0; i<data.content.length; i++){
                                if(data.content[i].iscorrect==1){
                                    sw = true;
                                    oks+=','+data.content[i].id;
                                    switch(data.content[i].func){
                                        /*case 'chatInsert':
                                            updateDB("UPDATE evento_foro SET server_id='"+data.content[i].server_id+"', server_update='"+data.content[i].server_update+"' WHERE id="+data.content[i].mobile_id);
                                            break;
                                            */
                                    }
                                }else{
                                    bads+=','+data.content[i].id;
                                }
                            }
                            if(sw){
                                updateDB("DELETE FROM `syncs` WHERE id IN (0"+oks+")");
                                mylog("DELETE FROM `syncs` WHERE id IN (0"+oks+")");
                            }
                            if(bads !== ''){
                                updateDB("UPDATE `syncs` SET state_id=2 WHERE id IN (0"+bads+")");
                                mylog("UPDATE `syncs` SET state_id=2 WHERE id IN (0"+bads+")");
                            }
                        },beforeSend: function() {
                            mylog('beforeSend');
                            //showLoading();
                        }, //Show spinner
                        complete: function() {
                            mylog('complete');
                            syncing=false;
                            srvsyncing=false;
                            //hideLoading();
                        },
                        error: function (obj, textStatus, errorThrown) {
                            syncing=false;
                            srvsyncing=false;
                            mylog("status=" + textStatus + ",error=" + errorThrown);
                            //hideLoading();
                        }
                    });
                }else{
                    mylog('Nada que sincronizar. '+srvsyncing);
                    syncing=false;
                    srvsyncing = false;
                }
            }, errorCB);
        }, errorCB);
    }else if(srvsyncing){
        srvintentos++;
        if(srvintentos>8){
            srvintentos = 0;
            srvsyncing=false;
            syncing=false;
        }
        mylog('ocupado: '+srvsyncing);
        clearTimeout(uploadTimeout);
        uploadTimeout = window.setTimeout(function(){serverSync()}, 1769);
    }
}

function getCurDate(){
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1;
    if(month<10){
        month = '0'+month;
    }
    var day = currentDate.getDate();
    if(day<10){
        day = '0'+day;
    }
    var hs = currentDate.getHours();
    if(hs<10){
        hs = '0'+hs;
    }
    var mn = currentDate.getMinutes();
    if(mn<10){
        mn = '0'+mn;
    }
    var sc = currentDate.getSeconds();
    if(sc<10){
        sc = '0'+sc;
    }
    return year+'-'+month+'-'+day+' '+hs + ":" + mn + ":" + sc;
}

function generateId(){
    var rand_ = Math.floor((Math.random() * 100) + 1);
    var unix = Math.round(+new Date()/1000);
    
    return unix+rand_;
}

var toShareFb = "http://thepastoapps.com/proyectos/myrugby/share.php";

/*function open_fb_share(){
    
    var toShareFbN = toShareFb + "?partidos_id=" + partido.id;
    if(checkConnection()){
        window.open('http://m.facebook.com/sharer.php?u='+encodeURI(toShareFbN), '_blank', 'location=yes');
    }else{
        alert('Necesitas estar conectado a internet para completar esta acción.');
    }
}*/

function open_fb_share(){
    facebookConnectPlugin.showDialog( 
    {
        method: "feed",
        redirect_uri: 'http://thepastoapps.com/proyectos/myrugby/xhtml_verimg/index.php?partidos_id=' + partido.id,
        picture:'http://thepastoapps.com/proyectos/myrugby/webservices/shares/share'+ partido.id +'.png',
        name:'My Rugby!',
        message:'Resultados del Partido',    
        caption: 'Resultados del Partido ' + partido.equipo_l + ' VS '+ partido.equipo_v,
        description: 'Resultados del Partido ' + partido.equipo_l + ' VS '+ partido.equipo_v
    }, 
    function (response) {
        navigator.notification.alert("Publicado Correctamente!", function(){}, "Facebook", "Aceptar");
        /*alert(JSON.stringify(response))*/ },
    function (response) { /*alert(JSON.stringify(response)) }*/});
}

if (typeof(cordova) !== 'undefined') {

    document.addEventListener("deviceready", ini, false);
    document.addEventListener("deviceready", onDeviceReady, false);


} else {
    // normal browser test

    $(document).ready(function(){
        ini();
    })

}



