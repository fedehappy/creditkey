app.get('/getItems',function(req,res){
    if(!req.query.path)
        res.end("errore di trasmissione");
    var query = '';
    switch (req.query.path) {
        case 'aziende':
            query = "SELECT *, id_azienda as id from aziende";
            break;
        case 'utenti':
            query = 'SELECT *, id_utente as id from utenti';
            break;
        case 'associazioni':
            query = 'SELECT associazioni.id_associazione, associazioni.id_associazione as id, utenti.id_utente, utenti.nome as nome_utente, aziende.id_azienda, aziende.nome as nome_azienda, associazioni.data_add' +
                ' FROM associazioni' +
                ' JOIN utenti' +
                ' ON associazioni.id_utente = utenti.id_utente' +
                ' JOIN aziende' +
                ' ON associazioni.id_azienda = aziende.id_azienda';
            break;
        case 'documents':
            query = 'SELECT *, id_docuement as id from documents';
            break;
    }


    connection.query(query ,function(err,rows){
        if(err)
        {
            console.log("Problem with MySQL"+err);
        }
        else
        {
            res.end(JSON.stringify(rows));
        }
    })
});

app.post('/saveItems',function(req,res){
    if(!req.body.path)
        res.end("errore di trasmissione");

    var query = '';
    switch (req.body.path) {
        case 'aziende':
            query = 'INSERT INTO aziende SET' +
                ' email = ' + "'"+req.body.data.email +"'"+','+
                ' nome = ' + "'" +req.body.data.nome +"'"+','+
                ' partita_iva = ' + "'" +req.body.data.partita_iva +"'"+','+
                ' pec = ' + "'" +req.body.data.pec +"'"+','+
                ' indirizzo = ' + "'" +req.body.data.indirizzo +"'"+','+
                ' data_add = NOW()';
            break;
        case 'utenti':
            query = 'INSERT INTO utenti SET' +
                ' email = ' + "'"+req.body.data.email +"'"+','+
                ' nome = ' + "'" +req.body.data.nome +"'"+','+
                ' id_profilo = 3'+','+
                ' data_add = NOW()';
            break;
        case 'associazioni':
            query = 'INSERT INTO associazioni SET' +
                ' id_azienda = ' + "'"+req.body.data.id_azienda +"'"+','+
                ' id_utente = ' + "'" +req.body.data.id_utente +"'"+','+
                ' data_add = NOW()';
            break;
        case 'documents':
            query = 'SELECT * from documents';
            break;
    }

    connection.query(query ,function(err,rows){
        if(err)
        {
            console.log("Problem with MySQL"+err);
        }
        else
        {
            res.end(JSON.stringify(rows));
        }
    });
    console.log(query);
});

app.post('/deleteItem',function(req,res){
    if(!req.body.path)
        res.end("errore di trasmissione");

    var query = '';
    switch (req.body.path) {
        case 'aziende':
            query = 'DELETE FROM aziende WHERE id_azienda='+req.body.id;
            break;
        case 'utenti':
            query = 'DELETE FROM utenti WHERE id_utente='+req.body.id;
            break;
        case 'associazioni':
            query = 'DELETE FROM associazioni WHERE id_associazione='+req.body.id;
            break;
        case 'documents':
            query = 'DELETE FROM documents WHERE id_document='+req.body.id;
            break;
    }
    console.log(query);

    connection.query(query ,function(err,rows){
        if(err)
        {
            console.log("Problem with MySQL"+err);
        }
        else
        {
            res.end(JSON.stringify(rows));
        }
    })
});

app.get('/getLastId',function(req,res){
    console.log(req.query.path);
    if(!req.query.path)
        res.end("errore di trasmissione");
    var query = '';
    switch (req.query.path) {
        case 'aziende':
            query = "SELECT MAX(id_azienda) AS id from aziende";
            break;
        case 'utenti':
            query = 'SELECT MAX(id_utente) AS id from utenti';
            break;
        case 'associazioni':
            query = 'SELECT MAX(id_associazione) AS id from associazioni';
            break;
        case 'documents':
            query = 'SELECT MAX(id_docuement) AS id from documents';
            break;
    }
    console.log(query);
    connection.query(query ,function(err,rows){
        if(err)
        {
            console.log("Problem with MySQL"+err);
        }
        else
        {
            res.end(JSON.stringify(rows[0].id));
        }
    })
});

var MainController = (function () {

    var connection = mysql.createConnection({
        host : "localhost",
        user : "root",
        password : "",
        database : "credit-key"
    });

    return connection;
})();

module.exports = MainController;
