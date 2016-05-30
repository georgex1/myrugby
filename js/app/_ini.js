function ini() {

    //db = window.openDatabase("rugby", "1.0", "Rugby", 200000);
    db = window.openDatabase("rugby", "", "Rugby", 200000);
    
    //l(db.version);
    if(db.version == "1.0") {
        db.changeVersion("1.0", "1.1", 
            function(tx) {
                tx.executeSql('DROP table partidos');
                tx.executeSql('DROP table eventos');
                tx.executeSql('DROP table usuarios');
                tx.executeSql('DROP table puntos');
            }, 
            //used for error
            function(e) {
                l('error in changeV for v2');
                l(JSON.stringify(e));
            },
            //used for success
            function() {
                l('i ran once');
                l(db.version);
            }
        );			
    }

    onDeviceReady_DB();

    check_logged();

    if(updateInterval == null){
        updateInterval = setInterval(function(){ get_updates_sv(); }, 5000);
    }
    
    if(syncInterval == null){
        syncInterval = setInterval(function(){serverSync()}, 2000);
    }
    
    $('.timeline_2 .fin, #partidos_list ').on( {
        click: function(e){
            var part_id = $(this).data('partido_id');
            if(confirm('Está seguro que quiere borrar el partido?')){
                delete_partido(part_id);
                load_partidos_from_local();
                $.mobile.navigate( "#partidos", { transition : "slide" });
            }

            e.preventDefault()
        }
    }, '.del')

    //LOGIN
    $('#login').click(function(e){
        login();
        e.preventDefault();
    });

    //LISTADO DE PARTIDOS
    $('#get_partidos').click(function(e){

        reset_partido_detalles ();
        
        load_partidos_from_local ();
        $('#loadmore').hide();
        
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
                //alert(isCurrentPartido)
                if(isCurrentPartido===true){
                    
                    if(confirm("Tienes un partido en juego, Seguro deseas salir? El partido en juego quedará como finalizado.")){
                        terminar_partido (partido.id);
                    } else {
                        e.preventDefault();
                    }

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
                
            } else {

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
    $('#nuevo_partido .s_niveles .nivel a').click(function(e){
        $('#nuevo_partido .s_niveles .nivel').removeClass('activo');
        $(this).parent().addClass('activo');
        $('#nuevo_partido .s_niveles input').val($(this).data('nivel'));
        e.preventDefault();
    })
    
    $('#nuevo_partido a#save_partido').click(function(e){

        if( $('#equipo_l').val()!="" && $('#equipo_v').val()!="" &&  $('#nivel').val()!="" ) {

            save_partido( $('#equipo_l').val(), $('#equipo_v').val(), $('#info').val(), $('input#nivel').val(), user_id );
            isCurrentPartido = true;
            
            $('input#nivel').val('');
            $('.niveles .nivel').removeClass('activo');
            
        } else {
            alert("Ingrese los equipos y elija un nivel.")
            e.preventDefault();
        }
    });

    $('#eventos .eventos ').on({
        click: function(e){
            if($(this).parents('.eventos').hasClass('no_add')){
                e.preventDefault()
            } else {
                add_evento = $(this).find('.desc').text();
            }
        }
    }, 'a');

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

function onDeviceReady() {
    if (window.cordova) {
        initAdMob();
    }
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