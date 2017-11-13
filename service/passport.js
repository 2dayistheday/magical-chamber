const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const keys = require('../config/keys');
var mysql_dbc = require('../service/db_con')();
var connection = mysql_dbc.init();

//로그인 후 세션에 저장
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

//id로 DB에
passport.deserializeUser(function(id, done) {
    var selectUsersql = 'select * from USERS where user_id = ?';
    connection.query(selectUsersql, id, function (err, existingUser) {
        if(err)
            console.log("err : " + err);
        else{
            var user ={
                id: existingUser[0].user_id,
                sub: existingUser[0].user_sub
            };
            done(null, user);
        }
    });
});

passport.use(
    new GoogleStrategy({
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: '/auth/google/callback'
    }, function (accessToken, refreshToken, profile, done) {

        var selectUsersql = "select * from USERS where user_sub = ?";
        connection.query(selectUsersql, profile.id, function (err, existingUser) {

            if (typeof existingUser[0] != "undefined" && existingUser[0].user_type == 'g') {
                console.log("already inserted");
                existingUser = JSON.stringify(existingUser);
                existingUser = JSON.parse(existingUser);
                var user ={
                    id: existingUser[0].user_id,
                    sub: existingUser[0].user_sub
                };
                console.log('existingUser', existingUser);
                console.log(profile);
                done(null, user);

                var email = profile.emails[0].value;
                var selectInvitationsql = "select * from CHAMBER_INVITATION where user_invitation = ?";
                connection.query(selectInvitationsql, email, function (err, invitation) {
                    if(err)
                        console.log(err);
                    else{
                        console.log(invitation);
                    }
                });
            }else{
                var addUsersql = "INSERT into USERS(user_sub, user_type) values(?, 'g')";
                connection.query(addUsersql, profile.id, function (err, rows) {
                    if(err)
                        console.log("err : " + err);
                    else{
                        console.log("rows : " + JSON.stringify(rows));
                        console.log('rows', [rows.insertId, profile.id]);
                        var user ={
                            id: rows.insertId,
                            sub: profile.id
                        };
                        done(null, user);

                        //profile add
                        var addUserProfilesql = "INSERT into USER_PROFILE(user_id, user_nickname) values(?,?)";
                        connection.query(addUserProfilesql, [rows.insertId, profile.displayName], function (err) {
                            if(err)
                                console.log("err : " + err);
                        });

                    }
                });

            }
        });
    })
);

passport.use(
    new FacebookStrategy({
        clientID: keys.facebookClientID,
        clientSecret: keys.facebookClientSecret,
        callbackURL: '/auth/facebook/callback',
            profileFields: ['id', 'emails', 'name']
    },
        function (accessToken, refreshToken, profile, done) {
            var selectUsersql = "select * from USERS where user_sub = ?";
            connection.query(selectUsersql, profile.id, function (err, existingUser) {

                if (typeof existingUser[0] != "undefined" && existingUser[0].user_type == 'f') {
                    console.log("already inserted");
                    existingUser = JSON.stringify(existingUser);
                    existingUser = JSON.parse(existingUser);
                    var user ={
                        id: existingUser[0].user_id,
                        sub: existingUser[0].user_sub
                    };

                    console.log('existingUser', existingUser);
                    console.log(profile);
                    done(null, user);

                    var email = profile.emails[0].value;
                    var selectInvitationsql = "select * from CHAMBER_INVITATION where user_invitation = ? and Allowed = false";
                    connection.query(selectInvitationsql, email, function (err, invitation) {
                        if(err)
                            console.log(err);
                        else{
                            console.log(invitation);
                        }
                    });
                }else{
                    var addUsersql = "INSERT into USERS(user_sub, user_type) values(?, 'f')";
                    connection.query(addUsersql, profile.id, function (err, rows) {
                        if(err)
                            console.log("err : " + err);
                        else{
                            console.log("rows : " + JSON.stringify(rows));
                            console.log('rows', [rows.insertId, profile.id]);
                            var user ={
                                id: rows.insertId,
                                sub: profile.id
                            };
                            done(null, user);


                            //profile add
                            var addUserProfilesql = "INSERT into USER_PROFILE(user_id, user_nickname) values(?,?)";
                            connection.query(addUserProfilesql, [rows.insertId, profile.displayName], function (err) {
                                if(err)
                                    console.log("err : " + err);
                            });
                        }
                    });
                }
            });
        }
    )
);