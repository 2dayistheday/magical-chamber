var express = require('express');
var router = express.Router();
var mysql_dbc = require('../service/db_con')();
var connection =mysql_dbc.init();
mysql_dbc.test_open(connection);

var sub;
var nickname;
var email;
var user_id;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Magical Chamber' });
});

router.post('/', function (req, res, next) {
    sub = req.body.sub;
    nickname = req.body.nickname;
    email = req.body.email;

    var datas = [sub, email, nickname];

    var selectUsersql = "select * from USERS where user_sub = ?";
    connection.query(selectUsersql, sub, function (err, rows) {
        if (typeof rows[0] == "undefined") {
            var addUsersql = "INSERT into USERS(user_sub, user_email, user_nickname) values(?, ?, ?)";
            connection.query(addUsersql, datas, function (err, rows) {
                if(err)
                    console.log("err : " + err);
                else{
                    console.log("rows : " + JSON.stringify(rows));
                    var user_id = rows.insertId;
                }
            });
        }else{
            var selectUsersql = "select user_id from USERS where user_sub = ?";
            connection.query(selectUsersql, sub, function (err, rows) {
                if (typeof rows[0] != "undefined") {
                    rows = JSON.stringify(rows);
                    rows = JSON.parse(rows);
                    user_id = rows[0].user_id;
                    console.log('user_id : ' +user_id);
                }else{
                    console.log(rows);
                }
            });
            console.log("already inserted");
        }

    });
});

router.get('/verify', function(req, res, next) {
    res.render('verify', { title: 'Magical Chamber' });
});

module.exports = router;
