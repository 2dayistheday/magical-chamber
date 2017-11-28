var express = require('express');
var router = express.Router();
var mysql_dbc = require('../service/db_con')();
var connection = mysql_dbc.init();
mysql_dbc.test_open(connection);

/* GET chamber listing. */

router.get('/:chamberID/', function (req, res, next) {
    var chamberID = req.params.chamberID;
    var user_id = req.user.id;

    if (chamberID != "undefined") {
        var selectMyChamberSql = "select * from CHAMBERS where chamber_id = ?;";
        var selectMyProfileSql = "select * from USER_PROFILE where user_id = ?;";

        connection.query(selectMyChamberSql + selectMyProfileSql, [chamberID, user_id], function (err, results) {
            if (err) {
                console.log('err : ' + err);
            } else {
                res.render('./chamber/chamberHome', {
                    title: 'Magical Chamber',
                    chamber: results[0],
                    profile: results[1]
                });
            }
        });
    } else {
        res.redirect('/');
    }
});

router.get('/:chamberID/member', function (req, res, next) {
    var chamberID = req.params.chamberID;
    var user_id = req.user.id;

    if (chamberID != "undefined") {
        var selectMyUserSql = "select distinct * from USER_PROFILE as UP inner join CHAMBER_USER as CU on UP.user_id = CU.user_id where CU.chamber_id = ?;";
        var selectInvitationSql = "select * from CHAMBER_INVITATION where chamber_id = ? and allowed = FALSE;";
        var selectChamberSql = "select * from CHAMBERS where chamber_id = ?;";
        var selectMyProfileSql = "select * from USER_PROFILE where user_id = ?;";

        connection.query(selectMyUserSql + selectInvitationSql + selectChamberSql + selectMyProfileSql, [chamberID, chamberID, chamberID, user_id], function (err, results) {
            if (err) {
                console.log('err : ' + err);
            } else {
                res.render('./chamber/newMember', {
                    title: 'Magical Chamber',
                    users: results[0],
                    invitations: results[1],
                    chamber: results[2],
                    profile: results[3]
                });
            }
        });
    } else {
        res.redirect('/');
    }
});

router.get('/:chamberID/rtc', function (req, res, next) {
    var chamberID = req.params.chamberID;
    var user_id = req.user.id;

    if (chamberID != "undefined" && user_id != 'undefined') {
        var selectMyChamberSql = "select * from CHAMBERS where chamber_id = ?;";
        var selectMyProfileSql = "select * from USER_PROFILE where user_id = ?;";
        connection.query(selectMyChamberSql + selectMyProfileSql, [chamberID, user_id], function (err, results) {
            res.render('./chamber/rtc', {
                title: 'Magical Chamber',
                chamber: results[0],
                profile: results[1]
            });
        });
    } else {
        res.redirect('/');
    }
});

router.post('/:chamberID/newmember', function (req, res, next) {
    var newMember = req.body.newMember;
    var chamberID = req.params.chamberID;
    var user_id = req.user.id;

    var selectChamberSql = "select * from CHAMBER_INVITATION where chamber_id = ? and user_invitation = ?";
    connection.query(selectChamberSql, [chamberID, newMember], function (err, chambers) {
        if (chambers === "undefined") {
            console.log('이미 초대함');
            res.redirect('/chamber/' + chamberID + '/member');
        } else {
            var insertChambersql = "insert into CHAMBER_INVITATION(chamber_id, user_invitation) values(?,?); ";
            connection.query(insertChambersql, [chamberID, newMember], function (err, rows) {
                if (err)
                    console.error("err : " + err);
                else {
                    res.redirect('/chamber/' + chamberID + '/member');
                }
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

awsS3Conn = require('../service/awsS3'),
    async = require('async'),
    router.get('/:chamberID/documents', function (req, res, next) {
        var chamberID = req.params.chamberID;
        var user_id = req.user.id;

        if (chamberID != 'undefined' && user_id != 'undefined') {
            var selectMyUserSql = "select distinct * from USER_PROFILE as UP inner join CHAMBER_USER as CU on UP.user_id = CU.user_id where CU.chamber_id = ?;";
            var selectChamberSql = "select * from CHAMBERS where chamber_id = ?;";
            var selectMyProfileSql = "select * from USER_PROFILE where user_id = ?;";

            connection.query(selectMyUserSql + selectChamberSql + selectMyProfileSql, [chamberID, chamberID, user_id], function (err, results) {
                if (err) {
                    console.log('err : ' + err);
                } else {
                    awsS3Conn.getlist('chamber/' + chamberID + '/files/', function (filelist) {
                        filelist = JSON.parse(filelist);

                        res.render('./chamber/documents', {
                            title: 'Magical Chamber',
                            users: results[0],
                            chamber: results[1],
                            profile: results[2],
                            filelist: filelist
                        });
                    });
                }
            });
        } else {
            res.redirect('/');
        }
    });

module.exports = router;
