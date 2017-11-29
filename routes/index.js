var express = require('express');
var router = express.Router();
var mysql_dbc = require('../service/db_con')();
var connection = mysql_dbc.init();
mysql_dbc.test_open(connection);

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

router.get('/about', function (req, res, next) {
    res.render('about', {title: 'Magical Chamber | About Us'});
});

router.get('/contact', function (req, res, next) {
    res.render('contact', {title: 'Magical Chamber | Contact Us'});
});

router.get('/faq', function (req, res, next) {
    res.render('faq', {title: 'Magical Chamber | F&Q'});
});

module.exports = router;
