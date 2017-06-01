/**
 * Created by fallegro on 13/09/2016.
 */

var express = require("express");
var mysql = require("mysql");
var http = require('http');
var sha256 = require('sha256');
var morgan = require("morgan");
var bodyParser = require("body-parser");
var multer = require('multer');
var jwt        = require("jsonwebtoken");
var jwt_secret= "f3452e0210ad4d884a4624c1dbc8226e";
var app = express();
var path=require("path");
app.use(express.static(path.join(__dirname, '/')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.header("Access-Control-Allow-Headers", "*");

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


/*Connecting to Database*/
var pool = require('./connection');
/*pool.getConnection(function(error, connection){
    if(error)
    {
        console.log("Problem with MySQL"+error);
    }
    else
    {
        console.log("Connected with Database");
    }
});*/

/*Start the Server*/
app.listen(3000,function(){
    console.log("It's Started on PORT 3000");
});









/************************************ UPLOAD ************************************/
var d = new Date();
var timestamp = Date.now();
var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './ext/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, timestamp+'-'+file.originalname)
    }
});
var upload = multer({ //multer settings
    storage: storage
}).single('file');
/** API path that will upload the files */
app.post('/upload', function(req, res) {
    upload(req,res,function(err){
        if(err){
            res.json({error_code:1,err_desc:err});
            return;
        }
        res.json({error_code:0,err_desc:null});
    });
});

/************************************  ************************************/



app.get('/', function(req, res){
    res.sendFile(path.join(__dirname + '/index.html'));
});
/*
 * Here we will call Database.
 * Fetch news from table.
 * Return it in JSON.
 */
app.get('/load',function(req,res){
    pool.getConnection(function(err, connection) {
        connection.query("SELECT * from aziende",function(err,rows){
            if(err)
            {
                console.log("Problem with MySQL"+err);
                connection.release();
            }
            else
            {
                res.end(JSON.stringify(rows));
                connection.release();
            }
        });
    });

});

/************************************ AUTHENTICATION ************************************/
app.post('/authenticate', function(req, res) {
    var hashed_password = sha256(req.body.password);
    var query = `SELECT * FROM utenti WHERE email =  '${req.body.email}' AND  password = '${hashed_password}' LIMIT 1`;

    pool.getConnection(function(err, connection) {
        connection.query(query ,function(err, user) {
            if (err) {
                res.json({
                    type: false,
                    data: "Error occured: " + err
                });
            } else {
                if (user != undefined && user.length != 0) {
                    delete user.password;
                    res.json({
                        type: true,
                        data: user,
                        token: user.token
                    });
                } else {
                    res.json({
                        type: false,
                        data: "Incorrect email/password"
                    });
                }
            }
            connection.release();
        });
    });

});

app.post('/changePassword', ensureAuthorized, function(req, res) {
    var hashed_password = sha256(req.body.password);
    var query = `UPDATE utenti SET password = '${hashed_password}', passwd_cambiata = 1  WHERE id_utente = '${req.body.id_utente}' `;
    console.log(query);

    pool.getConnection(function(err, connection) {
        connection.query(query ,function(err, user) {
            if (err) {
                res.json({
                    type: false,
                    data: "Error occured: " + err
                });
            } else {
                if (user != undefined && user.length != 0) {
                    query = 'SELECT email from utenti WHERE id_utente = ' + req.body.id_utente;
                    connection.query(query ,function(err,rows){
                        if(err)
                        {
                            console.log("Problem with MySQL"+err);
                            res.json({
                                type: false,
                                data: "Problem with MySQL"+err
                            });
                        }
                        else
                        {
                            //var email_utente = 'allegro.federico@gmail.com';
                            var email_utente = JSON.stringify(rows[0].email);
                            var subject = 'Password Cambiata Su CreditKey';
                            var text = '<p>Buongiorno.</p>' +
                                '<p>E\' stata cambiata con successo la password sul portale CreditKey.</p>'+
                                '<p>La nuova password impostata è: <b>'+req.body.password+'</b></p>'+
                                '<p>Cordiali saluti.</p>'+
                                '<p><b>Il team di CreditKey</b></p>';
                            sendMail(email_utente, text, subject);
                            res.json({
                                type: true,
                                data: user
                            });
                        }
                    });
                } else {
                    res.json({
                        type: false,
                        data: "Errore 4256"
                    });
                }
            }
            connection.release();
        });
    });

});


app.post('/signup', function(req, res) {
    var hashed_password = sha256(req.body.password);
    var query = `SELECT * FROM utenti WHERE email =  '${req.body.email}' AND  password = '${hashed_password}' LIMIT 1`;

    pool.getConnection(function(err, connection) {
        connection.query(query ,function(err, user) {
            if (err) {
                res.json({
                    type: false,
                    data: "Error occured: " + err
                });
            } else {
                if (user != undefined && user.length != 0) {
                    res.json({
                        type: false,
                        data: "User already exists!"
                    });
                } else {
                    var query = 'INSERT INTO utenti SET' +
                        ' email = ' + "'"+req.body.email +"'"+','+
                        ' nome = ' + "'"+req.body.nome +"'"+','+
                        ' password = ' + "'" +hashed_password +"'"+','+
                        ' id_profilo = 3'+','+
                        ' data_add = NOW()';
                    connection.query(query ,function(err, user) {
                        //user.token = jwt.sign(user, jwt_secret);
                        var query = `UPDATE utenti SET token = '${user.token}' WHERE email =  '${req.body.email}' AND  password = '${hashed_password}' `;
                        connection.query(query ,function(err, user1) {
                            res.json({
                                type: true,
                                data: user1,
                                token: user.token
                            });
                        });
                    })
                }
            }
            connection.release();
        });
    });

});

app.get('/me', ensureAuthorized, function(req, res) {
    var query = 'SELECT * from utenti ' +
        ' WHERE token = ' +req.token+
        ' LIMIT 1';

    pool.getConnection(function(err, connection) {
        connection.query(query ,function(err, user) {
            if (err) {
                res.json({
                    type: false,
                    data: "Error occured: " + err
                });
            } else {
                res.json({
                    type: true,
                    data: user
                });
            }
            console.log('connection released');
            connection.release();
        });
    });
});

function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.send(403);
    }
}

process.on('uncaughtException', function(err) {
    console.log(err);
});
/******************************************** **********************************************/



/**************************************** GET ***********************************************/
app.get('/getItems',ensureAuthorized,function(req,res){
    if(!req.query.path)
        res.end("errore di trasmissione");
    var query = '';
    console.log(req.query);
    switch (req.query.path) {
        case 'aziende':
            query = "SELECT *, id_azienda as id from aziende";
            break;
        case 'utenti':
            query = 'SELECT *, id_utente as id from utenti WHERE id_profilo = 3';
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
            if(req.query.id_profilo == 1){
                query = 'SELECT documents.id_document, documents.id_document as id, documents.id_azienda, aziende.nome as nome_azienda, documents.data_add, documents.note, documents.documento_1, documents.documento_2, documents.stato, documents.tipo' +
                    ' FROM documents' +
                    ' JOIN aziende' +
                    ' ON documents.id_azienda = aziende.id_azienda';
            }
            else{
                query = 'SELECT documents.id_document, documents.id_document as id, documents.id_azienda, aziende.nome as nome_azienda, documents.data_add, documents.note, documents.documento_1, documents.documento_2, documents.stato, documents.tipo' +
                    ' FROM documents' +
                    ' JOIN aziende' +
                    ' ON documents.id_azienda = aziende.id_azienda' +
                    ' WHERE documents.id_azienda = ' + "'" +req.query.id_azienda +"'";
            }
            break;
        case 'userCompanies':
            query = "SELECT *, aziende.id_azienda as id " +
                "from aziende" +
                " JOIN associazioni" +
                " ON associazioni.id_azienda = aziende.id_azienda" +
                " WHERE associazioni.id_utente = " + "'" +req.query.id_utente +"'";
            break;
    }
    console.log(query);

    pool.getConnection(function(err, connection) {
        connection.query(query ,function(err,rows){
            if(err)
            {
                console.log("Problem with MySQL"+err);
            }
            else
            {
                res.end(JSON.stringify(rows));
            }
            console.log('connection released');
            connection.release();
        });
    });

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
            query = 'SELECT MAX(id_document) AS id from documents';
            break;
    }
    console.log(query);

    pool.getConnection(function(err, connection) {
        connection.query(query ,function(err,rows){
            if(err)
            {
                console.log("Problem with MySQL"+err);
            }
            else
            {
                res.end(JSON.stringify(rows[0].id));
            }
            console.log('connection released');
            connection.release();
        });
    });

});
/******************************************** **********************************************/

/**************************************** POST ***********************************************/
app.post('/saveItems', ensureAuthorized, function(req,res){
    if(!req.body.path)
        res.end("errore di trasmissione");

    var query = '';
    switch (req.body.path) {
        case 'aziende':
            if(!req.body.data.id  || req.body.data.id == 0){
                query = 'INSERT INTO aziende SET' +
                    ' email = ' + "'"+req.body.data.email +"'"+','+
                    ' nome = ' + "'" +req.body.data.nome +"'"+','+
                    ' partita_iva = ' + "'" +req.body.data.partita_iva +"'"+','+
                    ' pec = ' + "'" +req.body.data.pec +"'"+','+
                    ' indirizzo = ' + "'" +req.body.data.indirizzo +"'"+','+
                    ' data_add = NOW()';
            }
            else{
                query = 'UPDATE aziende SET' +
                    ' email = ' + "'"+req.body.data.email +"'"+','+
                    ' nome = ' + "'" +req.body.data.nome +"'"+','+
                    ' partita_iva = ' + "'" +req.body.data.partita_iva +"'"+','+
                    ' pec = ' + "'" +req.body.data.pec +"'"+','+
                    ' indirizzo = ' + "'" +req.body.data.indirizzo +"'"+','+
                    ' data_upd = NOW()'+
                    ' WHERE id_azienda = ' + "'" +req.body.data.id +"'";
            }
            break;
        case 'utenti':
            if(!req.body.data.id  || req.body.data.id == 0){
                query = 'INSERT INTO utenti SET' +
                    ' email = ' + "'"+req.body.data.email +"'"+','+
                    ' nome = ' + "'" +req.body.data.nome +"'"+','+
                    ' id_profilo = 3'+','+
                    ' data_add = NOW()';
            }
            else{
                query = 'UPDATE utenti SET' +
                    ' email = ' + "'"+req.body.data.email +"'"+','+
                    ' nome = ' + "'" +req.body.data.nome +"'"+','+
                    ' id_profilo = 3'+','+
                    ' data_upd = NOW()'+
                    ' WHERE id_utente = ' + "'" +req.body.data.id +"'";
            }
            break;
        case 'associazioni':
            query = 'INSERT INTO associazioni SET' +
                ' id_azienda = ' + "'"+req.body.data.id_azienda +"'"+','+
                ' id_utente = ' + "'" +req.body.data.id_utente +"'"+','+
                ' data_add = NOW()';
            break;
        case 'documents':
            timestamp = Date.now();
            if(req.body.data.id_document && req.body.data.id_document != 0){
                query = 'UPDATE documents SET' +
                    ' documento_2 = ' + "'" +timestamp+ '-' +req.body.data.documento_2 +"'"+','+
                    ' note = ' + "'" +req.body.data.note +"'"+','+
                    ' stato = 1,' +
                    ' data_update = NOW()'+
                    'WHERE id_document = ' + "'" +req.body.data.id_document +"'";
                if(req.body.data.documento_2){
                    var bisogna_inviare_la_mail_allutente = true;
                }
            }
            else{
                query = 'INSERT INTO documents SET' +
                    ' id_azienda = ' + "'"+req.body.data.id_azienda +"'"+','+
                    ' tipo = ' + "'" +req.body.data.tipo +"'"+','+
                    ' documento_1 = ' + "'" +timestamp+ '-' +req.body.data.documento_1 +"'"+','+
                    ' note = ' + "'" +req.body.data.note +"'"+','+
                    ' data_add = NOW()';
            }
            break;
    }

    pool.getConnection(function(err, connection) {
        connection.query(query ,function(err,rows){
            if(err)
            {
                console.log("Problem with MySQL"+err);
            }
            else
            {
                // invio la email all'utente nel caso sia l'admin a caricare un documento
                if(bisogna_inviare_la_mail_allutente){
                    query = 'SELECT email from aziende WHERE id_azienda = ' + req.body.data.id_azienda;
                    connection.query(query ,function(err,rows){
                        if(err)
                        {
                            console.log("Problem with MySQL"+err);
                        }
                        else
                        {
                            var email_utente = JSON.stringify(rows[0].email);
                            var subject = 'Nuovo Documento Disponibile Su CreditKey';
                            var text = '<p>Buongiorno.</p>' +
                                '<p>E\' stato caricato con successo un nuovo documento sul portale CreditKey.</p>'+
                                '<p>Cordiali saluti.</p>'+
                                '<p><b>Il team di CreditKey</b></p>';
                            sendMail(email_utente, text, subject);
                        }
                    })
                }
                res.end(JSON.stringify(rows));
            }
            console.log('connection released');
            connection.release();
        });
    });
    console.log(query);
});

app.post('/deleteItem', ensureAuthorized, function(req,res){
    if(!req.body.path)
        res.end("errore di trasmissione");

    var query = '';
    switch (req.body.path) {
        case 'aziende':
            query = 'DELETE FROM associazioni WHERE id_azienda='+req.body.id + '; ';
            var query2 = 'DELETE FROM aziende WHERE id_azienda='+req.body.id;
            break;
        case 'utenti':
            query = 'DELETE FROM associazioni WHERE id_utente='+req.body.id + '; ';
            var query2 = 'DELETE FROM utenti WHERE id_utente='+req.body.id;
            break;
        case 'associazioni':
            query = 'DELETE FROM associazioni WHERE id_associazione='+req.body.id;
            break;
        case 'documents':
            query = 'DELETE FROM documents WHERE id_document='+req.body.id;
            break;
    }
    console.log(query);

    pool.getConnection(function(err, connection) {
        connection.query(query ,function(err,rows){
            if(err)
            {
                console.log("Problem with MySQL"+err);
            }
            else
            {
                if(query2){
                    console.log(query2);
                    connection.query(query2 ,function(err,rows){
                        if(err)
                        {
                            console.log("Problem with MySQL"+err);
                        }
                        else
                        {
                            res.end(JSON.stringify(rows));
                        }
                    })
                }
                else{
                    res.end(JSON.stringify(rows));
                }
            }
            console.log('connection released');
            connection.release();
        });
    });
});
/******************************************** **********************************************/




/******************************************** SEND EMAILS **********************************************/
var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'postmaster.cashflow@gmail.com', // Your email id
        pass: 'cashflow2@15' // Your password
    }
});


function sendMail(email, text, subject){
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"CreditKey" <postmaster.cashflow@gmail.com>', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        //text: 'Hello world ?', // plaintext body
        html: text
    };
// send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            return error;
        }
        console.log('Message sent: ' + info.response);
    });
}

/******************************************** **********************************************/



