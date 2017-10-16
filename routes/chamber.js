var express = require('express');
var router = express.Router();
var mysql_dbc = require('../public/javascripts/db_con')();
var connection =mysql_dbc.init();
mysql_dbc.test_open(connection);

/* GET chamber listing. */
router.get('/', function(req, res, next) {

        var sql = "SELECT * FROM chambers;";
        connection.query(sql, function (err, rows) {
            if (typeof rows[0] != "undefined") {
                res.render('chamber_list', { title: 'Magical Chamber', rows: rows});
            }else{
                res.render('chamber_list', { title: 'Magical Chamber'});
            }
        });
});

router.get('/chamberId', function(req, res, next) {
    res.render('chamber', { title: 'Magical Chamber' });
});

router.get('/new', function(req, res, next) {
    res.render('chamber_new', { title: 'Magical Chamber' });
});

router.post('/new', function (req, res, next) {
    var chamber_name = req.body.chamber_name;
    var chamber_des = req.body.chamber_des;

    var data = [chamber_name, chamber_des];
    console.log(data);


        // Use the connection
        var sql = "insert into chambers(chamber_name, chamber_des) values(?,?); ";
        connection.query(sql,data, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.redirect('/chamber');
            // Don't use the connection here, it has been returned to the pool.
        });
    //res.redirect('/chamber');
})


module.exports = router;
