var express = require('express');
var router = express.Router();

/* GET home page. */
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('heree');
    res.render('index', { title: 'SleepRank' });
});

module.exports = router;
