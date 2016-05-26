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
}

//GET AND LOAD RATING IN PANEL
function get_load_my_rating (user_id) {
    get_puntos (user_id, null, 1);
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