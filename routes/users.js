var express = require('express');
var router = express.Router();
var mysql_dbc = require('../public/javascripts/db_con')();
var connection =mysql_dbc.init();
mysql_dbc.test_open(connection);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users', { title: 'Magical Chamber' });
});

router.get('/verify', function(req, res, next) {
    res.render('verify', { title: 'Magical Chamber' });
});

module.exports = router;
