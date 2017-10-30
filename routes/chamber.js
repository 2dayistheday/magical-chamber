var express = require('express');
var router = express.Router();
var mysql_dbc = require('../service/db_con')();
var connection =mysql_dbc.init();
mysql_dbc.test_open(connection);

var user_id;
var sub;

/* GET chamber listing. */
router.get('/list', function(req, res, next) {
    var user_id = 2//req.session.user_id;


    if(user_id != "undefined"){
        var selectMyChamberSql = "select * from CHAMBERS where chamber_id IN (select chamber_id from CHAMBER_USER where user_id = ?)";
        connection.query(selectMyChamberSql,user_id, function (err, rows) {
            if (typeof rows[0] != "undefined") {
                res.render('chamber_list', { title: 'Magical Chamber', rows: rows});
            }else{
                res.render('chamber_list', { title: 'Magical Chamber', rows: rows});
            }
        });
    }

});

router.post('/', function (req, res, next) {
    sub = req.body.sub;
    nickname = req.body.nickname;
    email = req.body.email;

    console.log(sub);
    console.log(nickname);
    console.log(email);
    var datas = [sub, email, nickname];

    var selectUsersql = "select user_id from USERS where user_sub = ?";
    connection.query(selectUsersql, sub, function (err, rows) {
        if (typeof rows[0] != "undefined") {
            rows = JSON.stringify(rows);
            rows = JSON.parse(rows);
            user_id = rows[0].user_id;
            console.log('user_id : ' +user_id);
        }else{
            console.log("row 없음");
        }
    });

});

router.get('/chamberId', function(req, res, next) {
    res.render('chamber', { title: 'Magical Chamber', chamber_name: 'Chamber_name' });
});

router.get('/rtc', function(req, res, next) {
    res.render('rtc', { title: 'Magical Chamber', chamber_name: 'Chamber_name' });
});


router.get('/new', function(req, res, next) {
    res.render('chamber_new', { title: 'Magical Chamber' });
});

router.post('/new', function (req, res, next) {
    var chamber_name = req.body.chamber_name;
    var chamber_des = req.body.chamber_des;

    var data = [chamber_name, chamber_des];
    console.log(data);
    var user_id = 2;

    // Use the connection
    var insertChambersql = "insert into chambers(chamber_name, chamber_des) values(?,?); ";
    connection.query(insertChambersql, data, function (err, rows) {
        if (err) console.error("err : " + err);
        console.log("rows : " + JSON.stringify(rows));

        var chamber_id = rows.insertId;
        console.log('chamber_id : ' +chamber_id);
        //rows : {"fieldCount":0,"affectedRows":1,"insertId":1,"serverStatus":2,"warningCount":0,"message":"","protocol41":true,"changedRows":0}

        var addRelationsql = "INSERT into CHAMBER_USER(chamber_id, user_id) values(?, ?)";
        connection.query(addRelationsql, [chamber_id, user_id], function (err, rows) {
            if(err)
                console.log("err : " + err);
            else
                console.log("rows : " + JSON.stringify(rows));
        });

        res.redirect('/chamber/list');
    });
})


module.exports = router;
