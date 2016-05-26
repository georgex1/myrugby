// FILTRAR POR USUARIO Y POR EQUIPO
function filter (input) {

    var valThis = input.val().toLowerCase();
    
    var noresult = 0;

    if(valThis == ""){
        $('#partidos_list ul > li').show().removeClass('inactivo');
        noresult = 1;
        $('.no-results-found').remove();
        //l('no hay valor');
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
            //l('Buscar x usuario');
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