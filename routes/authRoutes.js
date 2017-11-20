const passport = require('passport');

module.exports = function (app) {
    app.get('/auth/google',
        passport.authenticate('google',{
            scope: ['profile', 'email']
        })
    );

    app.get('/auth/google/callback',
        passport.authenticate('google'), function (req, res) {
            res.redirect('/user/chamberlist');
        });

    app.get('/auth/facebook',
        passport.authenticate('facebook',
            { scope: 'email' }));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook'),function (req, res) {
            res.redirect('/user/chamberlist');
        });

    app.get('/api/logout', function (req, res) {
        req.logout();//easy~~~~~~
        res.redirect('/');
    });

    app.get('/api/current_user', function (req, res) {
        res.send(req.user);
    });
};