var Chamber = window.Chamber || {};

(function ($) {
    var authToken;
    Chamber.authToken.then(function setAuthToken(token) {
        if(token){
            authToken = token;
        }else{
            window.location.href = "/users";
        }
    }).catch(function handleTokenError(error) {
            alert(error);
            window.location.href = "/users";
    });

    $(function onDocReady() {
        Chamber.authToken.then(function updateAuthMessage(token) {
            if(token){
                $('.authToken').text(token);
            }
        })
    })
}(jQuery));