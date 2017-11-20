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
        var selectMyChamberSql = "select * from CHAMBERS where chamber_id IN (select chamber_id from CHAMBER_USER where user_id = ?)";
        connection.query(selectMyChamberSql, user_id, function (err, chambers) {

            var selectMyProfileSql = "select * from USER_PROFILE where user_id = ?";
            connection.query(selectMyProfileSql, user_id, function (err, profile) {

                var selectMyInvitationSql = "select * from CHAMBERS where chamber_id IN (select chamber_id from CHAMBER_INVITATION where Allowed = '0' and user_invitation = (select user_email from USERS where user_id = ?))";
                connection.query(selectMyInvitationSql, user_id, function (err, invitations) {
                    res.render('./user/chamberList', {
                        title: 'Magical Chamber',
                        chambers: chambers,
                        profile: profile,
                        invitations: invitations
                    });
                });
            });
        });
    } else {
        res.redirect('/');
    }
});

router.get('/newchamber', function (req, res, next) {
    if (req.user.id != 'undefined') {
        var selectMyProfileSql = "select * from USER_PROFILE where user_id = ?";
        connection.query(selectMyProfileSql, req.user.id, function (err, profile) {
            res.render('./user/createChamber', {title: 'Magical Chamber', profile: profile});
        });
    } else {
        res.redirect('/');
    }
});

router.post('/newchamber', function (req, res, next) {
    var chamber_name = req.body.chamber_name;
    var chamber_des = req.body.chamber_des;

    var data = [chamber_name, chamber_des];
    console.log(data);
    var user_id = req.user.id;

    // Use the connection
    var insertChambersql = "insert into CHAMBERS(chamber_name, chamber_des) values(?,?); ";
    connection.query(insertChambersql, data, function (err, rows) {
        if (err) console.error("err : " + err);
        console.log("rows : " + JSON.stringify(rows));

        var chamber_id = rows.insertId;
        console.log('chamber_id : ' +chamber_id);
        //rows : {"fieldCount":0,"affectedRows":1,"insertId":1,"serverStatus":2,"warningCount":0,"message":"","protocol41":true,"changedRows":0}

        var addRelationsql = "INSERT into CHAMBER_USER(chamber_id, user_id) values(?, ?)";
        connection.query(addRelationsql, [chamber_id, user_id], function (err, rows) {
            if(err)
                console.log("err : " + err);
            else
                console.log("rows : " + JSON.stringify(rows));
        });
        res.redirect('/user/chamberlist');
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

router.get('/verify', function (req, res, next) {
    res.render('verify', {title: 'Magical Chamber'});
});

module.exports = router;
