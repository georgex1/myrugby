//CRONOMETRO
var tiempo_corriendo = null;

var tiempo_cumplido = 0;

var entretiempo_corriendo = null;

//var et = 1;

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


