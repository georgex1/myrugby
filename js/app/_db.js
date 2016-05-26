

function errorCB(err) { 
    console.log("Error procesando SQL: "+err.code+" message: " + err.message); 
}

function onDeviceReady_DB() {
    db.transaction(populateDB, errorCB, successCB);
}

// CREAR LA TABLAS
function populateDB(tx) { 
    tx.executeSql( "CREATE TABLE IF NOT EXISTS partidos ( \
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \
        equipo_l VARCHAR(255) NOT NULL, \
        equipo_v VARCHAR(255) NOT NULL, \
        resultado_l INTEGER NOT NULL default '0', \
        resultado_v INTEGER NOT NULL default '0', \
        info TEXT NULL, \
        nivel INTEGER NOT NULL default '3', \
        inicio TEXT NULL, \
        user_id VARCHAR(255) NULL, \
        user_name VARCHAR(255) NULL, \
        `serverupdate` TEXT NULL,\
        sincronizar INTEGER NOT NULL default '0' ,\
        finalizado INTEGER NOT NULL default '0' )" );

    tx.executeSql( "CREATE TABLE IF NOT EXISTS usuarios ( \
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \
        user_id VARCHAR(255) NOT NULL, \
        user_name VARCHAR(255) NOT NULL ) " );

    tx.executeSql( "CREATE TABLE IF NOT EXISTS eventos ( \
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \
        evento VARCHAR(255) NOT NULL, \
        minuto INTEGER NOT NULL, \
        tiempo INTEGER NOT NULL default '1', \
        user_id VARCHAR(255) default NULL, \
        partido_id INTEGER NOT NULL, \
        equipo VARCHAR(1) default NULL, \
        `serverupdate` TEXT NULL,\
        valor INTEGER NOT NULL default '0' ) " );

    tx.executeSql( "CREATE TABLE IF NOT EXISTS puntos ( \
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, \
        user_id VARCHAR(255) NOT NULL, \
        user_id_from VARCHAR(255) NOT NULL,\
        partido_id VARCHAR(255) NOT NULL,\
        `serverupdate` TEXT NULL,\
        valor VARCHAR(255) NOT NULL ) " );

    tx.executeSql( "CREATE TABLE IF NOT EXISTS syncs (\
        id INTEGER PRIMARY KEY AUTOINCREMENT,\
        func TEXT NOT NULL,\
        vals TEXT NULL,\
        state_id INTEGER NOT NULL DEFAULT 1\
    ) " );

}

function successCB() {
}


//borrar tablas
function delete_tables() {
    db.transaction(delete_tables_t, errorCB);
}

function delete_tables_t(tx) {
    tx.executeSql('DROP table partidos');
    tx.executeSql('DROP table eventos');
    tx.executeSql('DROP table usuarios');
    tx.executeSql('DROP table puntos');
}