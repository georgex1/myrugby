// LOGIN SIN DB
function loginf(u_id, callback) {
    if(!checkConnection()){
        user_id = u_id;
        user_pic = "https://graph.facebook.com/"+user_id+"/picture?width=150&height=150";
        $("#wellcome_2 .img_perfil img").attr('src', user_pic);
        $(".panel").each(function(){ $(this).find(".img_perfil img").attr('src', user_pic); } );
        //cache_images(); 
        use_cache();
    } else {
        user_id = u_id;
        user_pic = "https://graph.facebook.com/"+user_id+"/picture?width=150&height=150";
        $("#wellcome_2 .img_perfil img").attr('src', user_pic);
        $(".panel").each(function(){ $(this).find(".img_perfil img").attr('src', user_pic); } );
        get_load_my_rating (user_id);
        $.ajax({
            url: service_url+"?action=get_user_partidos",
            type: "post", data: { user_id: user_id }, 
            datatype: 'json',
            success: function(data){
                $('.panel').each(function(){
                    $(this).find('.value:last').text(data.partidos); 
                })
            }
        });
        cache_images(); 
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
        
        $.mobile.loading("show");

        //ESPERO 2 SEGUNDOS Y PASO A LA PANTALLA DE BIENVENIDA DE USUARIO
        setTimeout(function(){ 
            $.mobile.loading("hide");
            $.mobile.navigate( "#wellcome_2", { transition : "slide" }); 
        }, 2000);

        $.ajax({
            url: service_url+"?action=save_user_profile",
            type: "post", 
            data: { user_id: user_id }, 
            datatype: 'json',
            success: function(data) {
                var user_pic_temp = profile_pics + "profile_" + user_id + ".jpg";
                cache_images(); 
            }
        });

        save_login();

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
                    $.mobile.loading("show");
                    user_name = response.name;
                    $("#wellcome_2 h2").text(user_name);

                    //AGREGAR USUARIO SI SE LOGUEA
                    agregar_usuario(user_id, response.name);

                    //ESPERO 2 SEGUNDOS Y PASO A LA PANTALLA DE BIENVENIDA DE USUARIO
                    setTimeout(function(){ 
                        $.mobile.loading("hide");
                        $.mobile.navigate( "#wellcome_2", { transition : "slide" }); 
                    }, 2000);

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
                        cache_images(); 
                    }
                });

                save_login();

            }
        }, function (response) { alert(JSON.stringify(response)) });
    }
}

var showDialog = function() { facebookConnectPlugin.showDialog( { method: "feed" }, function (response) { alert(JSON.stringify(response)) }, function (response) { alert(JSON.stringify(response)) }); }

var apiTest = function () { facebookConnectPlugin.api( "me/?fields=id,email", ["user_birthday"], function (response) { alert(JSON.stringify(response)) }, function (response) { alert(JSON.stringify(response)) }); }

var getAccessToken = function () { facebookConnectPlugin.getAccessToken( function (response) { alert(JSON.stringify(response)) }, function (response) { alert(JSON.stringify(response)) } );}

var getStatus = function () { facebookConnectPlugin.getLoginStatus( function (response) { alert(JSON.stringify(response)) }, function (response) { alert(JSON.stringify(response)) });}

var logout = function () { 
    facebookConnectPlugin.logout( function (response) { 
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
function showConfirmSalir() { 
    navigator.notification.confirm( '¿Seguro que quieres cerrar la aplicación?', exitFromApp, 'Salir', 'Cancelar,Si' );
}

function exitFromApp(buttonIndex) { 
    if (buttonIndex==2){ 
        navigator.app.exitApp();
    } 
}

// CERRAR SESION y SALIR DE LA APP
function showCSyConfirmSalir() { 
    navigator.notification.confirm( '¿Seguro que quieres cerrar la sesión y salir de la aplicación?', cS_exitFromApp, 'Salir', 'Cancelar,Si' );
}

function cS_exitFromApp(buttonIndex) { 
    if (buttonIndex==2){ 
        logout();
        delete_logged();
        setTimeout(function(){
            navigator.app.exitApp();
        }, 100 );
    } 
}



// DB FUNCTIONS 


//LOGIN

function save_login () {
    db.transaction(save_login_Populate, errorCB, save_login_Success);
}

function save_login_Populate(tx) {
    tx.executeSql('INSERT INTO usuarios(user_id,user_name)'+
                  'VALUES (?,?)', [user_id, user_name]);
}

function save_login_Success() {
    return true;
}

function check_logged() {
    db.transaction(check_logged_populate, errorCB);
}

function check_logged_populate(tx) { 
    tx.executeSql('SELECT * FROM usuarios ORDER BY id DESC LIMIT 1', [], check_logged_Success, errorCB); 
}

function check_logged_Success(tx, results) {
    var len = results.rows.length;
    for (var i=0; i<len; i++){ 
        //alert(results.rows.item(i).user_id)
        user_id = results.rows.item(i).user_id;
        user_name = results.rows.item(i).user_name;
    }
    if(user_id!=0){
        //alert('is logged')
        loginf(user_id, function(){
            $.mobile.navigate( "#partidos", { transition : "slide" } );
        });
    }else{
    }
}

function delete_logged() {
    db.transaction(delete_logged_populate, errorCB);
}

function delete_logged_populate(tx) {
    tx.executeSql('delete from usuarios');
}

