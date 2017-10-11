var express = require('express');
var router = express.Router();

/* GET chamber listing. */
router.get('/', function(req, res, next) {
    res.render('chamber_list', { title: 'Magical Chamber' });
});

router.get('/chamberId', function(req, res, next) {
    res.render('chamber', { title: 'Magical Chamber' });
});

router.get('/new', function(req, res, next) {
    res.render('chamber_new', { title: 'Magical Chamber' });
});


module.exports = router;
