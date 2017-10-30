var express = require('express');
var router = express.Router();
var mysql_dbc = require('../service/db_con')();
var connection =mysql_dbc.init();
mysql_dbc.test_open(connection);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users', { title: 'Magical Chamber' });
});

router.post('/', function (req, res, next) {
    var sub = req.body.sub;
    var nicknmae = req.body.nickname;
    var email = req.body.email;

    var datas = [sub, email, nicknmae];

    var selectUsersql = "select * from USERS where user_sub = ?";
    connection.query(selectUsersql, sub, function (err, rows) {
        if (typeof rows[0] == "undefined") {
            var addUsersql = "INSERT into USERS(user_sub, user_email, user_nickname) values(?, ?, ?)";
            connection.query(addUsersql, datas, function (err, rows) {
                if(err)
                    console.log("err : " + err);
                else
                    console.log("rows : " + JSON.stringify(rows));
            })
        }else{
            console.log("already inserted");
        }
    });

});

router.get('/verify', function(req, res, next) {
    res.render('verify', { title: 'Magical Chamber' });
});

module.exports = router;
