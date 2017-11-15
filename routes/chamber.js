var express = require('express');
var router = express.Router();
var mysql_dbc = require('../service/db_con')();
var connection =mysql_dbc.init();
mysql_dbc.test_open(connection);

var user_id;
var sub;

/* GET chamber listing. */
router.get('/list', function(req, res, next) {
    var user_id = req.user.id;

    if(user_id != "undefined"){
        var selectMyChamberSql = "select * from CHAMBERS where chamber_id IN (select chamber_id from CHAMBER_USER where user_id = ?)";
        connection.query(selectMyChamberSql, user_id, function (err, chambers) {

            var selectMyProfileSql = "select * from USER_PROFILE where user_id = ?";
            connection.query(selectMyProfileSql, user_id, function (err, profile) {

                var selectMyInvitationSql = "select * from CHAMBERS where chamber_id IN (select chamber_id from CHAMBER_INVITATION where Allowed = '0' and user_invitation = (select user_email from USERS where user_id = ?))";
                connection.query(selectMyInvitationSql, user_id, function (err, invitations) {
                    res.render('chamber_list', { title: 'Magical Chamber', chambers: chambers, profile: profile, invitations: invitations});
                });
            });
        });

    }else{
        res.redirect('/');
    }
});


router.get('/room/:chamberID', function(req, res, next) {
    var chamberID = req.params.chamberID;

    if(chamberID != "undefined"){
        var selectMyChamberSql = "select * from CHAMBERS where chamber_id = ?";
        connection.query(selectMyChamberSql, chamberID, function (err, chamber) {
            res.render('chamber', { title: 'Magical Chamber', chamber: chamber});
        });
    }else{
        res.redirect('/');
    }
});

router.get('/room/:chamberID/member', function(req, res, next) {
    var chamberID = req.params.chamberID;

    if(chamberID != "undefined"){
        var selectMyUserSql = "select * from USER_PROFILE where user_id IN (select user_id from CHAMBER_USER where chamber_id = ?)";
        connection.query(selectMyUserSql, chamberID, function (err, users) {
            res.render('chamber_invitation', { title: 'Magical Chamber', users: users, chamber: chamberID});
        });
    }else{
        res.redirect('/');
    }
});

router.get('/rtc/:chamberID', function(req, res, next) {
    var chamberID = req.params.chamberID;
    if(chamberID != "undefined"){
        var selectMyChamberSql = "select * from CHAMBERS where chamber_id = ?";
        connection.query(selectMyChamberSql, chamberID, function (err, chamber) {
            res.render('chamber_rtc', { title: 'Magical Chamber', chamber: chamber});
        });
    }else{
        res.redirect('/');
    }
});


router.get('/new', function(req, res, next) {
    if(req.user.id != 'undefined'){
        res.render('chamber_new', { title: 'Magical Chamber' });
    }else{
        res.redirect('/');
    }

});

router.post('/new', function (req, res, next) {
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

        res.redirect('/chamber/list');
    });
});

router.post('/room/:chamberID/new', function (req, res, next) {
    var newMember = req.body.newMember;
    var chamberID = req.params.chamberID;

    var user_id = req.user.id;
    // Use the connection

    var selectChamberSql = "select * from CHAMBER_INVITATION where chamber_id = ? and user_invitation = ?";
    connection.query(selectChamberSql, [chamberID, newMember], function (err, chambers) {
       if(chambers === "undefined"){
            console.log('이미 초대함');
            res.redirect('/chamber/room/'+chamberID+'/member');
       }else{
           var insertChambersql = "insert into CHAMBER_INVITATION(chamber_id, user_invitation) values(?,?); ";
           connection.query(insertChambersql, [chamberID, newMember], function (err, rows) {
               if (err) console.error("err : " + err);
               console.log("rows : " + JSON.stringify(rows));
               console.log('chamberID' + chamberID);
               res.redirect('/chamber/room/'+chamberID+'/member');
           });
       }
    });
});

router.post('/room/:chamberID/allow', function (req, res, next) {
    var chamberID = req.params.chamberID;
    var user_id = req.user.id;

    var selectMyEmailSql = "select * from USERS where user_id = ?";
    connection.query(selectMyEmailSql, user_id, function (err, user) {
        var updateChamberInvitationesql = "update CHAMBER_INVITATION set allowed = TRUE where user_invitation = ? and chamber_id = ?";
        connection.query(updateChamberInvitationesql, [user[0].user_email, chamberID], function (err, rows) {
            if(err)
                console.log("err : " + err);
            else{
                console.log('email'+user[0].user_email);
                console.log('chamberID'+chamberID);
                var addRelationsql = "INSERT into CHAMBER_USER(chamber_id, user_id) values(?, ?)";
                connection.query(addRelationsql, [chamberID, user_id], function (err, rows) {
                    if(err)
                        console.log("err : " + err);
                    else
                        console.log("rows : " + JSON.stringify(rows));
                });
                res.redirect('/chamber/room/'+chamberID);
            }
        });
    });
});

module.exports = router;
