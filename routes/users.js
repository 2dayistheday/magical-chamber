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

router.get('/profile', function(req, res, next) {
    var user_id = req.user.id;

    var selectUserProfilesql = "select * from USER_PROFILE where user_id = ?";
    connection.query(selectUserProfilesql, user_id, function (err, profile) {
        if(err)
            console.log("err : " + err);
        else
            res.render('user_profile', { title: 'Magical Chamber', profile: profile });
    });
});

router.post('/profile/update', function(req, res, next) {
    var user_id = req.user.id;
    var nickname = req.body.user_nickname;
    var des = req.body.user_des;

    var updateUserProfilesql = "update USER_PROFILE set user_nickname = ?, user_des = ? where user_id = ?";
    connection.query(updateUserProfilesql, [nickname, des, user_id], function (err, profile) {
        if(err)
            console.log("err : " + err);
        else
            res.redirect('/chamber/list');
    });
});


router.get('/verify', function(req, res, next) {
    res.render('verify', { title: 'Magical Chamber' });
});

module.exports = router;
