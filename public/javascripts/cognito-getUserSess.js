/*global Chamber _config AmazonCognitoIdentity AWSCognito*/

var Chamber = window.Chamber || {};

(function scopeWrapper($) {
    var signinUrl = '/';

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

    if (!(_config.cognito.userPoolId &&
            _config.cognito.userPoolClientId &&
            _config.cognito.region)) {
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    Chamber.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                console.log(userPool);
                //TODO: 확인용 나중에 삭제할 것
                $('#userEmail').text(cognitoUser.username);

                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
            window.location.href = "/";
        }

        if(cognitoUser){
            getUser(cognitoUser);
        }
    });


    /*
     * Cognito User Pool functions
     */

//Error :user is not authorized --> ok
    function getUser(user) {
        console.log("getUser");
        user.getUserAttributes(function(err, result) {
            if (err) {
                alert(err);
                window.location.href = "/";
                return;
            }

            for (i = 0; i < result.length; i++) {
                console.log('attribute ' + result[i].getName() + ' has value ' + result[i].getValue());
            }


            if(result){
                $.post('/', {sub: result[0].getValue(), nickname: result[2].getValue(), email: result[3].getValue()});
            }
            //ex Attributes
            // result0: sub has value ''
            // result1: email_verified has value true
            // result2: nickname has value ''
            // result3: email has value ''
        });
    }


    function createCognitoUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: toUsername(email),
            Pool: userPool
        });
    }

    function toUsername(email) {
        return email.replace('@', '-at-');
    }

}(jQuery));
