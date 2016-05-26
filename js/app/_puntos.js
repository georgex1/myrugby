function save_puntos_local() {
    $.each(puntos_dbupd, function() {
        var query = 'INSERT OR REPLACE INTO puntos(id,user_id,user_id_from,partido_id,valor,serverupdate) '+
                      'VALUES ('+this.id+', "'+this.user_id+'" , "'+this.user_id_from+'", "'+this.partido_id+'", "'+this.valor+'", "'+this.serverupdate+'")';
        
        db.transaction(function(tx){
            tx.executeSql(query, [], function(tx, results){
                return true;

            }, errorCB);
        }, errorCB);
    });
}

//guardar puntos local
function save_punto_local() {
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
      function(tx, results){ });
}
