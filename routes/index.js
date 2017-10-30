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


router.get('/verify', function(req, res, next) {
    res.render('verify', { title: 'Magical Chamber' });
});

module.exports = router;
