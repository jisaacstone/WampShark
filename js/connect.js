var _password;
var _ticket;

function wsConnect(connectionPub, connectionSub, url, realm) {
    connectionPub.onopen = function (session, details) {
        wsPub = session;
    };

    connectionPub.onclose = function(reason, details) {
        loginError(reason, details);
    };

    connectionPub.open();

    connectionSub.onopen = function (session, details) {
        console && console.log && details && details.authextra && console.log('auth version ' + details.authextra.version);
        wsSub = session;

        loginSuccess(url, realm, details.authid);
    };

    connectionSub.onclose = function(reason, details) {
        loginError(reason, details);
    };

    connectionSub.open();
}

function wsConnectAnonymous(url, realm)
{
    var connectionPub = new autobahn.Connection({
        url: url,
        realm: realm
    });

    var connectionSub = new autobahn.Connection({
        url: url,
        realm: realm
    });
    
    wsConnect(connectionPub, connectionSub, url, realm);
}

function onchallenge (session, method, extra) {
    if (method === "wampcra") {
            var secret = _password;
            if ("keylen" in extra) {
                secret = autobahn.auth_cra.derive_key(_password, extra.salt, extra.iterations, extra.keylen);
            }
            
      return autobahn.auth_cra.sign(secret, extra.challenge);
    } else if (method === "ticket") {
      return _ticket;
    }
}
    
function wsConnectWampcra(url, realm, id)
{
      _password = id.password;
    
    var connectionPub = new autobahn.Connection({
        url: url,
        realm: realm,
        authmethods: ["wampcra"],
        authid: id.user,
        onchallenge: onchallenge
    });

    var connectionSub = new autobahn.Connection({
        url: url,
        realm: realm,
        authmethods: ["wampcra"],
        authid: id.user,
        onchallenge: onchallenge
    });
    
    wsConnect(connectionPub, connectionSub, url, realm);
}

function wsConnectTicket(url, realm, id)
{
    _ticket = id.ticket;

    var connectionPub = new autobahn.Connection({
        url: url,
        realm: realm,
        authmethods: ["ticket"],
        authid: id.user,
        onchallenge: onchallenge
    });

    var connectionSub = new autobahn.Connection({
        url: url,
        realm: realm,
        authmethods: ["ticket"],
        authid: id.user,
        onchallenge: onchallenge
    });
    
    wsConnect(connectionPub, connectionSub, url, realm);
}
