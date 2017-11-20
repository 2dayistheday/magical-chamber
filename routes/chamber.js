var express = require('express');
var router = express.Router();
var mysql_dbc = require('../service/db_con')();
var connection = mysql_dbc.init();
mysql_dbc.test_open(connection);

var user_id;
var sub;

/* GET chamber listing. */

router.get('/:chamberID/', function (req, res, next) {
    var chamberID = req.params.chamberID;
    var user_id = req.user.id;

    if (chamberID != "undefined") {
        var selectMyChamberSql = "select * from CHAMBERS where chamber_id = ?";
        connection.query(selectMyChamberSql, chamberID, function (err, chamber) {
            var selectMyProfileSql = "select * from USER_PROFILE where user_id = ?";
            connection.query(selectMyProfileSql, user_id, function (err, profile) {
                res.render('./chamber/chamberHome', {
                    title: 'Magical Chamber',
                    chamber: chamber,
                    profile: profile
                });
            });
        });
    } else {
        res.redirect('/');
    }
});

router.get('/:chamberID/member', function (req, res, next) {
    var chamberID = req.params.chamberID;
    var user_id = req.user.id;

    if (chamberID != "undefined") {
        var selectMyUserSql = "select * from USER_PROFILE where user_id IN (select user_id from CHAMBER_USER where chamber_id = ?)";
        connection.query(selectMyUserSql, chamberID, function (err, users) {
            var selectInvitationSql = "select * from CHAMBER_INVITATION where chamber_id = ? and allowed = FALSE";
            connection.query(selectInvitationSql, chamberID, function (err, invitation) {
                var selectChamberSql = "select * from CHAMBERS where chamber_id = ?";
                connection.query(selectChamberSql, chamberID, function (err, chamber) {
                    var selectMyProfileSql = "select * from USER_PROFILE where user_id = ?";
                    connection.query(selectMyProfileSql, user_id, function (err, profile) {
                        res.render('./chamber/newMember', {
                            title: 'Magical Chamber',
                            users: users,
                            chamber: chamber,
                            invitations: invitation,
                            profile: profile
                        });
                    });
                });
            });
        });
    } else {
        res.redirect('/');
    }
});

router.get('/:chamberID/rtc', function (req, res, next) {
    var chamberID = req.params.chamberID;
    if (chamberID != "undefined") {
        var selectMyChamberSql = "select * from CHAMBERS where chamber_id = ?";
        connection.query(selectMyChamberSql, chamberID, function (err, chamber) {
            res.render('./chamber/rtc', {title: 'Magical Chamber', chamber: chamber, profile: undefined});
        });
    } else {
        res.redirect('/');
    }
});

router.post('/:chamberID/newMember', function (req, res, next) {
    var newMember = req.body.newMember;
    var chamberID = req.params.chamberID;

    var user_id = req.user.id;
    // Use the connection

    var selectChamberSql = "select * from CHAMBER_INVITATION where chamber_id = ? and user_invitation = ?";
    connection.query(selectChamberSql, [chamberID, newMember], function (err, chambers) {
        if (chambers === "undefined") {
            console.log('이미 초대함');
            res.redirect('/chamber/room/' + chamberID + '/member');
        } else {
            var insertChambersql = "insert into CHAMBER_INVITATION(chamber_id, user_invitation) values(?,?); ";
            connection.query(insertChambersql, [chamberID, newMember], function (err, rows) {
                if (err) console.error("err : " + err);
                console.log("rows : " + JSON.stringify(rows));
                console.log('chamberID' + chamberID);
                res.redirect('/chamber/room/' + chamberID + '/member');
            });
        }
    });
});

router.post('/:chamberID/allow', function (req, res, next) {
    var chamberID = req.params.chamberID;
    var user_id = req.user.id;

    var selectMyEmailSql = "select * from USERS where user_id = ?";
    connection.query(selectMyEmailSql, user_id, function (err, user) {
        var updateChamberInvitationesql = "update CHAMBER_INVITATION set allowed = TRUE where user_invitation = ? and chamber_id = ?";
        connection.query(updateChamberInvitationesql, [user[0].user_email, chamberID], function (err, rows) {
            if (err)
                console.log("err : " + err);
            else {
                console.log('email' + user[0].user_email);
                console.log('chamberID' + chamberID);
                var addRelationsql = "INSERT into CHAMBER_USER(chamber_id, user_id) values(?, ?)";
                connection.query(addRelationsql, [chamberID, user_id], function (err, rows) {
                    if (err)
                        console.log("err : " + err);
                    else
                        console.log("rows : " + JSON.stringify(rows));
                });
                res.redirect('/chamber/' + chamberID + '/');
            }
        });
    });
});

module.exports = router;
