var partidos_db = [];
var eventos_db = [];
var puntos_db = [];

var partidos_dbupd = [];
var eventos_dbupd = [];
var puntos_dbupd = [];

var partido_id_to_now = 0;

function get_updates_sv(){
    get_updates("partidos");
    get_updates("eventos");
    get_updates("puntos");
}

function get_updates(type_){
    if(checkConnection()){
        var query = "SELECT MAX(serverupdate) as max_serverupdate FROM `"+type_+"` limit 1";
        //mylog(query);
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
            results.rows.item(i).nivel, 
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

function sync_save_partido(equipo_l, equipo_v, resultado_l, resultado_v, info, nivel, inicio, user_id, partido_id_from, callback) {
    $.ajax({
        url: service_url+"?action=importar_partido",
        type: "post",
        data: { 
            equipo_l: equipo_l, 
            equipo_v: equipo_v, 
            resultado_l: resultado_l, 
            resultado_v: resultado_v, 
            info: info, 
            nivel: nivel, 
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

function sync_datos_eventos (partido_id_from, partido_id_to) {
    //l('paso 5: sync_datos_eventos (partido_id_from, partido_id_to) => partido_id_from = ' + partido_id_from + ', partido_id_to = ' + partido_id_to )
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction( function(tx){ sync_datos_eventos_populate(tx, partido_id_from, partido_id_to) }, errorCB);
}

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

var updateInterval = null;
var syncInterval = null;

//sync
function queueSync(func, data){
    updateDB("INSERT INTO `syncs`(`func`, `vals`) VALUES ('"+func+"','"+data+"')");
}

function updateDB(sql_){
    db.transaction(function(tx){
        tx.executeSql(sql_);
    }, errorCB);
}

//var uploadTimeout = null;
var syncing       = false;
var srvsyncing    = false;
var srvintentos   = 0;

function serverSync(){
    if(checkConnection() && !srvsyncing){
        syncing=true;
        srvsyncing=true;
        var query = "SELECT * FROM `syncs` WHERE  state_id <> 2 LIMIT 25";
        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                if(results.rows.length > 0){
                    i = 0;
                    var forsync= new Array();
                    while(i < results.rows.length){
                        try{
                            var myvals = JSON.parse(results.rows.item(i).vals);
                            forsync[i] = {
                                id: results.rows.item(i).id, 
                                func: results.rows.item(i).func, 
                                vals: myvals};
                        }catch(e){
                            updateDB('update syncs set state_id=2 where id='+results.rows.item(i).id);
                        }
                        i++;
                    }
                    //mylog(forsync);
                    $.ajax({
                        url: service_url+"?action=sync",
                        type: "POST", 
                        cache: false, 
                        dataType: 'json',
                        data: '&forsync='+JSON.stringify(forsync)+'&json=true&sync=true',
                        success: function(data){
                            var oks = '';
                            var bads = '';
                            var sw  = false;
                            for (var i=0; i<data.content.length; i++){
                                if(data.content[i].iscorrect==1){
                                    sw = true;
                                    oks+=','+data.content[i].id;
                                    switch(data.content[i].func){
                                        
                                    }
                                }else{
                                    bads+=','+data.content[i].id;
                                }
                            }
                            if(sw){
                                updateDB("DELETE FROM `syncs` WHERE id IN (0"+oks+")");
                            }
                            if(bads !== ''){
                                updateDB("UPDATE `syncs` SET state_id=2 WHERE id IN (0"+bads+")");
                            }
                        },beforeSend: function() {
                        }, 
                        complete: function() {
                            syncing=false;
                            srvsyncing=false;
                        },
                        error: function (obj, textStatus, errorThrown) {
                            syncing=false;
                            srvsyncing=false;
                        }
                    });
                }else{
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
