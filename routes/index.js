var express = require('express');
var router = express.Router();
var mysql_dbc = require('../service/db_con')();
var connection = mysql_dbc.init();
mysql_dbc.test_open(connection);

var sub;
var nickname;
var email;
var user_id;

/* GET home page. */
router.get('/', function (req, res, next) {
    if(req.user){
        var user_id = req.user.id;
        if (user_id != 'undefined') {
            var selectMyProfileSql = "select * from USER_PROFILE where user_id = ?";
            connection.query(selectMyProfileSql, user_id, function (err, profile) {
                res.render('index', {
                    title: 'Magical Chamber',
                    profile: profile
                });
            });
        } else {
            res.render('index', {title: 'Magical Chamber', profile: undefined});
        }
    }else{
        res.render('index', {title: 'Magical Chamber', profile: undefined});
    }
});


router.get('/verify', function (req, res, next) {
    res.render('verify', {title: 'Magical Chamber'});
});

module.exports = router;
