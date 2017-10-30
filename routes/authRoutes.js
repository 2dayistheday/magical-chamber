const passport = require('passport');

module.exports = function (app) {
    app.get('/auth/google',
        passport.authenticate('google',{
            scope: ['profile', 'email']
        })
    );

    app.get('/auth/google/callback',
        passport.authenticate('google'));

    app.get('/auth/facebook',
        passport.authenticate('facebook',
            { scope: 'public_profile' }));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook',{
            sucessRedirect: '/api/current_user',
            failureRedirect: '/'
        }));

    app.get('/api/logout', function (req, res) {
        req.logout();//easy~~~~~~
        res.send(req.user);
    });

    app.get('/api/current_user', function (req, res) {
        res.send(req.user);
    });
};