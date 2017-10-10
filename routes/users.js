var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users', { title: 'Magical Chamber' });
});

router.get('/verify', function(req, res, next) {
    res.render('verify', { title: 'Magical Chamber' });
});
module.exports = router;
