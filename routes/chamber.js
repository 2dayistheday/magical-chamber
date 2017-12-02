var express = require('express');
var router = express.Router();
var mysql_dbc = require('../service/db_con')();
var connection = mysql_dbc.init();
mysql_dbc.test_open(connection);

/* GET chamber listing. */

awsS3Conn = require('../service/awsS3'),
    async = require('async'),
    router.get('/:chamberID/', function (req, res, next) {
        var chamberID = req.params.chamberID;
        var user_id = req.user.id;

        if (chamberID != "undefined") {
            var selectMyChamberSql = "select * from CHAMBERS where chamber_id = ?;";
            var selectMyProfileSql = "select * from USER_PROFILE where user_id = ?;";
            var selectPostSql = "select distinct * from CHAMBER_POST as cp inner join USER_PROFILE as up on cp.post_authorID = up.user_id where cp.chamber_id = ?;";
            var selectMyUserSql = "select distinct * from USER_PROFILE as UP inner join CHAMBER_USER as CU on UP.user_id = CU.user_id where CU.chamber_id = ?;";
            var selectInvitationSql = "select * from CHAMBER_INVITATION where chamber_id = ? and allowed = FALSE;";

            connection.query(selectMyChamberSql + selectMyProfileSql + selectPostSql + selectMyUserSql + selectInvitationSql, [chamberID, user_id, chamberID, chamberID, chamberID], function (err, results) {
                if (err) {
                    console.log('err : ' + err);
                } else {
                    awsS3Conn.getlist('chamber/' + chamberID + '/files/', function (filelist) {
                        filelist = JSON.parse(filelist);
                        res.render('./chamber/chamberHome', {
                            title: 'Magical Chamber',
                            chamber: results[0],
                            profile: results[1],
                            post: results[2],
                            users: results[3],
                            invitations: results[4],
                            filelist: filelist
                        });
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
        var selectChamberSql = "select * from CHAMBERS where chamber_id = ?;";
        var selectMyProfileSql = "select * from USER_PROFILE where user_id = ?;";
        var selectInvitationSql = "select * from CHAMBER_INVITATION where chamber_id = ? and allowed = FALSE;";

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
            res.redirect('/chamber/' + chamberID + '/');
        } else {
            var insertChambersql = "insert into CHAMBER_INVITATION(chamber_id, user_invitation) values(?,?); ";
            connection.query(insertChambersql, [chamberID, newMember], function (err, rows) {
                if (err)
                    console.error("err : " + err);
                else {
                    res.redirect('/chamber/' + chamberID + '/');
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
    router.post('/:chamberID/upload/files', function (req, res, next) {
        var chamberID = req.params.chamberID;
        var tasks = [
            function (callback) {
                awsS3Conn.formidable(req, function (err, files, field) {
                    callback(err, files);
                });
            },
            function (files, callback) {
                awsS3Conn.upload(files,'chamber/'+chamberID+'/files/', function (err, result) {
                    callback(err, files);
                });
            }
        ];
        async.waterfall(tasks, function (err, result) {
            if(err){
                console.log('err : ' + err);
            }else{
                console.log('result : ' + result);
            }
        });
    });

router.post('/:chamberID/upload/post', function (req, res, next) {
    var user_id = req.user.id;
    var chamberID = req.params.chamberID;
    var post_content = req.body.post_content;

    var InsertPostSql = "insert into CHAMBER_POST(chamber_id, post_content, post_authorID) values(?,?,?);";
    connection.query(InsertPostSql, [chamberID, post_content, user_id], function (err, post) {
        if(err){
            console.log('err : ' + err);
        }else{
            res.redirect('/chamber/'+chamberID+'/');
        }
    });
});

router.post('/:chamberID/delete/post', function (req, res, next) {
    var post_id = req.body.postID;
    var chamberID = req.params.chamberID;

    var DeletePostSql = "delete from CHAMBER_POST where post_id = ?;";
    connection.query(DeletePostSql, post_id, function (err, result) {
       if(err){
           console.log('err : ' + err);
       }else{
           res.redirect('/chamber/'+chamberID+'/');
       }
    });
});


awsS3Conn = require('../service/awsS3'),
    async = require('async'),
    router.post('/:chamberID/upload/file', function (req, res, next) {
        var chamberID = req.params.chamberID;
        var tasks = [
            function (callback) {
                awsS3Conn.formidable(req, function (err, files, field) {
                    callback(err, files);
                });
            },
            function (files, callback) {
                awsS3Conn.upload(files,'chamber/'+chamberID+'/files/', function (err, result) {
                    callback(err, files);
                });
            }
        ];
        async.waterfall(tasks, function (err, result) {
            if(err){
                console.log('err:' + err);
            }else{
                result = JSON.stringify(result);
                result = JSON.parse(result);
                res.send(result[0].name);
            }
        });
    });

module.exports = router;
