/**
 * Created by fallegro on 28/09/2016.
 */
var mysql = require("mysql");



var ConParams = (function () {

    var pool   = mysql.createPool({
        connectionLimit : 10,
        host : "localhost",
        user : "root",
        password : "",
        database : "credit-key"
    });

    return pool;
})();

module.exports = ConParams;
