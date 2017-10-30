const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategt = require('passport-facebook').Strategy;
const keys = require('../config/keys');
var mysql_dbc = require('../service/db_con')();
var connection = mysql_dbc.init();

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

//mongoDB의 id를 통해 user를 찾아가져옴?..
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

            if (typeof existingUser[0] != "undefined") {
                console.log("already inserted");
                existingUser = JSON.stringify(existingUser);
                existingUser = JSON.parse(existingUser);
                var user ={
                    id: existingUser[0].user_id,
                    sub: existingUser[0].user_sub
                };

                console.log('existingUser', existingUser);
                done(null, user);
            }else{
                var addUsersql = "INSERT into USERS(user_sub) values(?)";
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
                    }
                });
            }
        });
    })
);

passport.use(
    new FacebookStrategt({
        clientID: keys.facebookClientID,
        clientSecret: keys.facebookClientSecret,
        callbackURL: '/auth/facebook/callback'
    },
        function (accessToken, refreshToken, profile, done) {
            var selectUsersql = "select * from USERS where user_sub = ?";
            connection.query(selectUsersql, profile.id, function (err, existingUser) {

                if (typeof existingUser[0] != "undefined") {
                    console.log("already inserted");
                    existingUser = JSON.stringify(existingUser);
                    existingUser = JSON.parse(existingUser);
                    var user ={
                        id: existingUser[0].user_id,
                        sub: existingUser[0].user_sub
                    };

                    console.log('existingUser', existingUser);
                    done(null, user);
                }else{
                    var addUsersql = "INSERT into USERS(user_sub) values(?)";
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
                        }
                    });
                }
            });
        }
    )
);