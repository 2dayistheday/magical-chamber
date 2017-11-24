var express = require('express');
var router = express.Router();
var mysql_dbc = require('../service/db_con')();
var connection = mysql_dbc.init();
mysql_dbc.test_open(connection);

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('user', {title: 'Magical Chamber'});
});

router.get('/chamberlist', function (req, res, next) {
    var user_id = req.user.id;

    if (user_id != "undefined") {
        var selectMyChamberSql = "SELECT DISTINCT * FROM CHAMBERS AS C INNER JOIN CHAMBER_USER AS CU ON C.chamber_id = CU.chamber_id WHERE CU.user_id = ?;";
        var selectMyProfileSql = "SELECT * FROM USER_PROFILE WHERE user_id = ?;";
        var selectMyInvitationSql = "SELECT DISTINCT * FROM CHAMBERS AS C INNER JOIN CHAMBER_INVITATION AS CI ON C.chamber_id = CI.chamber_id " +
            "WHERE CI.allowed = FALSE AND CI.user_invitation = (SELECT user_email FROM USERS WHERE user_id = ?);";

        connection.query(selectMyChamberSql + selectMyProfileSql + selectMyInvitationSql, [user_id, user_id, user_id], function (err, results) {
            if (err) {
                //TODO: ERROR HANDLING
                console.log('err: ', err);
                res.redirect('/');
            } else {
                res.render('./user/chamberList', {
                    title: 'Magical Chamber',
                    chambers: results[0],
                    profile: results[1],
                    invitations: results[2]
                });
            }
        });
    } else {
        res.redirect('/');
    }
});

router.get('/newchamber', function (req, res, next) {
    if (req.user.id != 'undefined') {
        var selectMyProfileSql = "select * from USER_PROFILE where user_id = ?";
        connection.query(selectMyProfileSql, req.user.id, function (err, profile) {
            res.render('./user/newChamber', {title: 'Magical Chamber', profile: profile});
        });
    } else {
        res.redirect('/');
    }
});

router.post('/newchamber', function (req, res, next) {
    var chamber_name = req.body.chamber_name;
    var chamber_des = req.body.chamber_des;
    var user_id = req.user.id;

    var insertChambersql = "insert into CHAMBERS(chamber_name, chamber_des) values(?,?);";

    connection.query(insertChambersql, [chamber_name, chamber_des], function (err, rows) {
        if (err) {
            console.error("err : " + err);
        }
        else {
            //console.log("rows : " + JSON.stringify(rows));
            var chamber_id = rows.insertId;
            var addRelationsql = "INSERT into CHAMBER_USER(chamber_id, user_id) values(?, ?)";
            connection.query(addRelationsql, [chamber_id, user_id], function (err, rows) {
                if (err)
                    console.log("err : " + err);
                else
                    console.log("rows : " + JSON.stringify(rows));
            });
            res.redirect('/user/chamberlist');
        }
    });
});

router.get('/profile', function (req, res, next) {
    var user_id = req.user.id;

    var selectUserProfilesql = "select * from USER_PROFILE where user_id = ?";
    connection.query(selectUserProfilesql, user_id, function (err, profile) {
        if (err)
            console.log("err : " + err);
        else
            res.render('./user/userProfile', {title: 'Magical Chamber', profile: profile});
    });
});

router.post('/profile/update', function (req, res, next) {
    var user_id = req.user.id;
    var nickname = req.body.user_nickname;
    var des = req.body.user_des;

    var updateUserProfilesql = "update USER_PROFILE set user_nickname = ?, user_des = ? where user_id = ?";
    connection.query(updateUserProfilesql, [nickname, des, user_id], function (err, profile) {
        if (err)
            console.log("err : " + err);
        else
            res.redirect('/chamber/list');
    });
});

awsS3Conn = require('../service/awsS3'),
    async = require('async'),
router.post('/profile/imgupload', function (req, res, next) {
    var tasks = [
        function (callback) {
            awsS3Conn.formidable(req, function (err, files, field) {
                callback(err, files);
            });
        },
        function (files, callback) {
            awsS3Conn.profile(files,'user/'+req.user.id+'/profile/', function (err, result) {
                callback(err, files);
            });
        }
    ];
    async.waterfall(tasks, function (err, result) {
        if(err){
           res.json({sucess: false, msg: '실패', err: err})
        }else{
            res.json({sucess: true, msg: '업로드 성공'})
        }
    });
});

router.get('/verify', function (req, res, next) {
    res.render('verify', {title: 'Magical Chamber'});
});

module.exports = router;
