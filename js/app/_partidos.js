// RESETEAR PARTIDO
function reset_partido() {
    partido.id = generateId();
    partido.equipo_l = '';
    partido.equipo_v = '';
    partido.resultado_l = 0;
    partido.resultado_v = 0;
    partido.info = '';
    partido.nivel = 0;
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
function save_partido(equipo_l, equipo_v, info, nivel, user_id) {
    
    var mdata = null;
    mdata = {
        partido_id: partido.id,
        equipo_l: equipo_l,
        equipo_v: equipo_v,
        info: info,
        nivel: nivel,
        user_id: user_id,
        user_name: user_name,
        fecha_entrada: getCurDate()
    };
    
    partidos_db[0] = {
        id: partido.id,
        equipo_l: equipo_l,
        equipo_v: equipo_v,
        info: info,
        nivel: nivel,
        user_id: user_id,
        user_name: user_name,
        serverupdate: getCurDate()
    };
    
    //guardar en local..
    save_partido_local();
    queueSync('save_partido', JSON.stringify(mdata));
    
}

// GET PARTIDO
function get_partido (partido_id, callback) {
    $.mobile.loading( "show" );
    partido.id = partido_id;
    get_partido_local();
    setTimeout(function(){
        if (callback) { callback(); }
        $.mobile.loading( "hide" );

    }, 1000);
}

function delete_partido(partido_id) {
    
    var mdata = null;
    mdata = {
        partido_id: partido_id
    };
    
    partidos_db[0] = {
        id: partido_id
    };
    
    queueSync('delete_partido', JSON.stringify(mdata));
    delete_partido_l(partido_id);
    partido.finalizado = 1;
    isCurrentPartido = false;
    updateDB("UPDATE `partidos` set finalizado = 1 where id = "+partido_id+" ");
    
}

function terminar_partido (partido_id) {
    l('terminar partido: '+partido_id)
    clearInterval(tiempo_corriendo);
    clearInterval(entretiempo_corriendo);
    partido.minuto = 0;
    //guardar como finzalido
    partido.finalizado = 1;
    isCurrentPartido = false;
    updateDB("UPDATE `partidos` set finalizado = 1 where id = "+partido_id+" ");
    //reset_partido();
    reset_partido_detalles();
}

// CARGAR DETALLES DEL PARTIDO
function load_partido_detalles () {
    
    $('.timeline_2 .fin .btn_del').remove();
    
    if(partido.user_id==user_id  ) {
        var del_link = '<p class="btn_del"><a href="#" class="del" data-partido_id="'+partido.id+'" >Eliminar</a></p>';
        $(".timeline_2 .fin .btn_back ").after(del_link);
    } else {
        var del_link = '';
    }

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

// RESET DETALLES DEL PARTIDO
function reset_partido_detalles () {

    $('#partido_eventos .top_data a.del').remove();

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
}



// DB FUNCTIONS *****************

// ACTUALIZAR ÚLTIMOS PARTIDOS

function save_partidos_local() {
    $.each(partidos_dbupd, function() {
        var query = 'INSERT OR REPLACE INTO partidos(id,equipo_l,equipo_v,resultado_l,resultado_v,info,nivel,inicio,user_id,user_name,serverupdate,finalizado) '+
                      'VALUES ('+this.id+', "'+this.equipo_l+'" , "'+this.equipo_v+'", "'+this.resultado_l+'", "'+this.resultado_v+'", "'+this.info+'", "'+this.nivel+'", "'+this.inicio+'", "'+this.user_id+'", "'+this.user_name+'", "'+this.serverupdate+'", 1)';
        
        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                return true;

            }, errorCB);
        }, errorCB);
    });
}

// CARGAR ÚLTIMOS PARTIDOS DE DB LOCAL

var load_from_user = 0;

function load_partidos_from_local () {
    db.transaction(load_partidos_from_local_t, errorCB);
}

function load_partidos_from_local_t(tx) { 
    if(load_from_user==1){
        tx.executeSql('SELECT * FROM partidos where user_id="'+user_id+'" ORDER BY id DESC', [], load_partidos_from_local_success, errorCB); 
        load_from_user=0;
    }else{
        tx.executeSql('SELECT * FROM partidos ORDER BY id DESC', [], load_partidos_from_local_success, errorCB); 
    }
}

function load_partidos_from_local_success(tx, results) {

    $('#partidos_list').html('');
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
        
        var niveles = [];

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
                
                if(this.user_id==user_id) {
                    var del_link = '<span class="del" data-partido_id="'+this.id+'" >[-]</span>';
                } else {
                    var del_link = '';
                }
                
                niveles[1] = 'Básico';
                niveles[2] = 'Intermedio';
                niveles[3] = 'Completo';
                
                var nivel_id = (this.nivel) ? this.nivel : 3 ;

                var user_pic = "https://graph.facebook.com/"+this.user_id+"/picture?width=150&height=150";
                html +=        '<li data-sinc="'+this.sincronizar+'" data-user="'+this.user_name+'" data-user_id="'+this.user_id+'">'+
                    del_link +
                    '<a href="#partido_eventos" id="'+this.id+'">'+
                    '<span class="img">'+
                    '<span class="img_perfil"><img alt="" src="'+user_pic+'" /></span>'+
                    '</span>'+
                    '<span class="club_name"><p>'+this.equipo_l+'</p></span>'+
                    '<span class="results">'+this.resultado_l+' &middot; '+this.resultado_v+'</span>'+
                    '<span class="club_name"><p>'+this.equipo_v+'</p></span>'+
                    '</a>'+
                    '<div class="nivel">' + niveles[nivel_id] + '</div>' +
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
    partido.nivel = partidos_db[0].nivel;
    partido.user_id = partidos_db[0].user_id;
    partido.user_name = partidos_db[0].user_name;

    partido.inicio = moment().format('YYYY-MM-DD HH:mm:ss');
    partido.fecha =  moment().format("dddd D [de] MMMM HH:mm");


    l('tratando guardar')
    
    tx.executeSql('INSERT INTO partidos(id, equipo_l,equipo_v,resultado_l,resultado_v,info,nivel,inicio,user_id,user_name,sincronizar)'+
                  'VALUES (?,?,?,?,?,?,?,?,?,?,?)',
                  [partido.id,
                   partido.equipo_l,
                   partido.equipo_v,
                   0,
                   0,
                   partido.info,
                   partido.nivel,
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
    l("save_partido_local_Success()");
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
        partido.nivel = results.rows.item(i).nivel;
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
            
            l(evento_name)

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

    //ESTADISTICAS
    
    var html_est = '';
    $.each(estadisticas, function(key, value) {
        
        if(partido.nivel==1) {
            if(key=='try' || key=='drop' || key=='palos' ) {
                
                if( key=='try' || key=='conversiones' || key=='cambio' || key=='pass_fw' || key=='knock_on' || key=='penales' || key=='tarjeta_amarilla' || key=='tarjeta_roja' ) {
                    html_est += '<li><span>'+this.l.cantidad+'</span><span class="est">'+key.replace('_', ' ')+'</span><span>'+this.v.cantidad+'</span></li>';
                } else if(key=='drop' || key=='penal' || key=='line' || key=='scrum' || key=='palos') {
                    html_est += '<li><span>'+this.l.valor+'/'+this.l.cantidad+'</span><span class="est">'+key.replace('_', ' ')+'</span><span>'+this.v.valor+'/'+this.v.cantidad+'</span></li>';
                }
                
            }
        } else if(partido.nivel==2) {
            if(key=='try' || key=='drop' || key=='penal' || key=='penales'  || key=='line' || key=='scrum' || key=='palos' ) {
                
                if( key=='try' || key=='conversiones' || key=='cambio' || key=='pass_fw' || key=='knock_on' || key=='penales' || key=='tarjeta_amarilla' || key=='tarjeta_roja' ) {
                    html_est += '<li><span>'+this.l.cantidad+'</span><span class="est">'+key.replace('_', ' ')+'</span><span>'+this.v.cantidad+'</span></li>';
                } else if(key=='drop' || key=='penal' || key=='line' || key=='scrum' || key=='palos') {
                    html_est += '<li><span>'+this.l.valor+'/'+this.l.cantidad+'</span><span class="est">'+key.replace('_', ' ')+'</span><span>'+this.v.valor+'/'+this.v.cantidad+'</span></li>';
                }
                
            }
        } else if(partido.nivel==3)  {
            if( key=='try' || key=='conversiones' || key=='cambio' || key=='pass_fw' || key=='knock_on' || key=='penales' || key=='tarjeta_amarilla' || key=='tarjeta_roja' ) {
                html_est += '<li><span>'+this.l.cantidad+'</span><span class="est">'+key.replace('_', ' ')+'</span><span>'+this.v.cantidad+'</span></li>';
            } else if(key=='drop' || key=='penal' || key=='line' || key=='scrum' || key=='palos') {
                html_est += '<li><span>'+this.l.valor+'/'+this.l.cantidad+'</span><span class="est">'+key.replace('_', ' ')+'</span><span>'+this.v.valor+'/'+this.v.cantidad+'</span></li>';
            }
        }

        

    });
    
    $('#estadisticas_list').html(html_est);
    
    hideFbShare();

}


function delete_partido_local(partido_id) {
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(function(tx){delete_partido_local_populate(tx, partido_id)}, errorCB);
}

function delete_partido_local_populate(tx, partido_id) {
    tx.executeSql('delete from partidos where sincronizar=1 and id='+partido_id);
    //l('partido' + partido_id + ' borrado.')
}

function delete_partido_l(partido_id) {
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(function(tx){delete_partido_l_populate(tx, partido_id)}, errorCB);
}

function delete_partido_l_populate(tx, partido_id) {
    tx.executeSql('delete from partidos where id='+partido_id);
    //l('partido' + partido_id + ' borrado.')
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

function delete_partidos_local(partido_id) {
    //var db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db.transaction(delete_partidos_local_populate, errorCB);
}

function delete_partidos_local_populate(tx, partido_id) {
    tx.executeSql('delete from partidos where sincronizar=0');
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
            });

        } else {
            $('#partidos_list .list_usuarios_found').remove(); 
        }

        if (callback) { callback(noresult); }
        $.mobile.loading( "hide" );
}


