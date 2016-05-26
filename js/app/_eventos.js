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
    
    
    //var next = "#partido_eventos";
    var next = "#eventos";
    
    setTimeout(function(){
        
        get_partido(partido.id, function(){
            $.mobile.navigate( next, { transition : "slide" });
            $.mobile.loading("hide");
            l(next)
        });
    }, 500)

}


// DB FUNCTIONS ***********************

function save_eventos_local() {
    $.each(eventos_dbupd, function() {
        var query = 'INSERT OR REPLACE INTO eventos(id,evento,minuto,tiempo,user_id,partido_id,equipo,valor,serverupdate) '+
                      'VALUES ('+this.id+', "'+this.evento+'" , "'+this.minuto+'", "'+this.tiempo+'", "'+this.user_id+'", "'+this.partido_id+'", "'+this.equipo+'", "'+this.valor+'", "'+this.serverupdate+'")';
        
        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                return true;

            }, errorCB);
        }, errorCB);
    });
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

function evento_local_agregado() {
    var next = "#partido_eventos";

    if(add_evento=="Infracción"){ 
        if(add_evento_penal=="") { 
        } 
    }
    $.mobile.navigate( next, { transition : "slide" });
    $.mobile.loading("hide");
}

function delete_evento_local(evento_id) {
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(function(tx){delete_evento_local_populate(tx, evento_id)}, errorCB);
}

function delete_evento_local_populate(tx, evento_id) {
    tx.executeSql('delete from eventos where id='+evento_id);
    //l('evento' + evento_id + ' borrado.')
}

