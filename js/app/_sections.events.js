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
        //e.preventDefault();
        //$.mobile.navigate( "#nuevo_partido", { transition : "slide" });
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

});

//LISTADO DE EVENTOS 

$(document).on("pageshow","#eventos",function() {

    load_partido_detalles ();

    if(parseInt(partido.nivel)==1) {
        
        $('#eventos .eventos').html('<div class="ui-grid-b">\
                    <a href="#agregar_evento" class="ui-block-a">\
                        <span class="ico-evento ico-evento-try"></span>\
                        <span class="desc">Try</span>\
                    </a>\
                    <a href="#agregar_evento" class="ui-block-b">\
                        <span class="ico-evento ico-evento-drop"></span>\
                        <span class="desc">Drop</span>\
                    </a>\
                    <a href="#agregar_evento" class="ui-block-c">\
                        <span class="ico-evento ico-evento-penal"></span>\
                        <span class="desc">Penal</span>\
                    </a>\
                </div><!-- /grid-b -->')
        
    }else if(parseInt(partido.nivel)==2) {
        
        $('#eventos .eventos').html('<div class="ui-grid-b">\
                    <a href="#agregar_evento" class="ui-block-a">\
                        <span class="ico-evento ico-evento-try"></span>\
                        <span class="desc">Try</span>\
                    </a>\
                    <a href="#agregar_evento" class="ui-block-b">\
                        <span class="ico-evento ico-evento-drop"></span>\
                        <span class="desc">Drop</span>\
                    </a>\
                    <a href="#agregar_evento" class="ui-block-c">\
                        <span class="ico-evento ico-evento-penal"></span>\
                        <span class="desc">Penal</span>\
                    </a>\
                </div><!-- /grid-b -->\
                <div class="ui-grid-b">\
                    <a href="#agregar_evento" class="ui-block-a">\
                        <span class="ico-evento ico-evento-scrum"></span>\
                        <span class="desc">Scrum</span>\
                    </a>\
                    <a href="#agregar_evento" class="ui-block-b">\
                        <span class="ico-evento ico-evento-line"></span>\
                        <span class="desc">Line</span>\
                    </a>\
                </div><!-- /grid-b -->')
        
    } else {
        
        $('#eventos .eventos').html('<div class="ui-grid-b">\
                <a href="#agregar_evento" class="ui-block-a">\
                    <span class="ico-evento ico-evento-try"></span>\
                    <span class="desc">Try</span>\
                </a>\
                <a href="#agregar_evento" class="ui-block-b">\
                    <span class="ico-evento ico-evento-drop"></span>\
                    <span class="desc">Drop</span>\
                </a>\
                <a href="#agregar_evento" class="ui-block-c">\
                    <span class="ico-evento ico-evento-cambio"></span>\
                    <span class="desc">Cambio</span>\
                </a>\
            </div><!-- /grid-b -->\
            <div class="ui-grid-b">\
                <a href="#agregar_evento" class="ui-block-a">\
                    <span class="ico-evento ico-evento-scrum"></span>\
                    <span class="desc">Scrum</span>\
                </a>\
                <a href="#agregar_evento" class="ui-block-b">\
                    <span class="ico-evento ico-evento-line"></span>\
                    <span class="desc">Line</span>\
                </a>\
                <a href="#agregar_evento" class="ui-block-c">\
                    <span class="ico-evento ico-evento-pass_fw"></span>\
                    <span class="desc">Pass Fw</span>\
                </a>\
            </div><!-- /grid-b -->\
            <div class="ui-grid-b">\
                <a href="#agregar_evento" class="ui-block-a">\
                    <span class="ico-evento ico-evento-penal"></span>\
                    <span class="desc">Penal</span>\
                </a>\
                <a href="#agregar_evento" class="ui-block-b">\
                    <span class="ico-evento ico-evento-knock_on"></span>\
                    <span class="desc">Knock On</span>\
                </a>\
                <a href="#agregar_evento" class="ui-block-c">\
                    <span class="ico-evento ico-evento-tarjeta"></span>\
                    <span class="desc">Tarjeta</span>\
                </a>\
            </div><!-- /grid-b -->');
            
    }
    
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
    
    $('#eventos .eventos').html('');

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

        $("#agregar_evento .penal_eventos").show();
        $("#agregar_evento .conversion").hide();
        
        if(partido.nivel==1) {
            setTimeout(function(){
                $("#agregar_evento .penal_eventos a:first").trigger('click');
            }, 200)
        }
        
    } else {
        $("#agregar_evento .conversion").hide();
    }

    $('#agregar_evento .evento_img').html('<img alt="" src="images/eventos/'+add_evento.toLowerCase().replace(' ', '_')+'.png" />');
    $('#agregar_evento .evento .desc').text(add_evento);

});

//PARTIDO DETALLES, EVENTOS Y ESTADÍSTICAS

$(document).on("pageshow","#partido_eventos",function() {

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

    $('.bottom_datos_perfil .datos_perfil .img_perfil img').attr('src', "https://graph.facebook.com/"+partido.user_id+"/picture?width=150&height=150");

});

$(document).on('backbutton', function(e, data){
    e.preventDefault();
    var activePage = $.mobile.activePage[0].id;
    if(activePage=="partidos") {
        showConfirmSalir();
    }

});

