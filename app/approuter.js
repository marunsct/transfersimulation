var approuter = require('@sap/approuter');
var ar = approuter();
ar.beforeRequestHandler.use('/getuserinfo', function (req, res, next) {

    try {

        let results = {};
        results.user = req.user.id;
        // eslint-disable-next-line no-prototype-builtins
        if (req.user.hasOwnProperty("locale")) {
            results.locale = req.user.locale;
        }
        results.scopes = {};
        results.scopes.identified = req.user.is("identified-user");
        results.scopes.authenticated = req.user.is("Admin");
        results.scopes.Viewer = req.user.is("Manager");
        results.scopes.Admin = req.user.is("HR");

        if (!req.user) {
            res.statusCode = 403;
            results.message("Timeout");
            res.send(results);
        } else {
            res.statusCode = 200;
            //if()
            //res.end("My name is ${JSON.stringify(req.user.name, null, 2)}");
            res.send(results);
        }

    } catch (error) {
        res.statusCode = 200;
        res.end(JSON.stringify(req.user));
    }

});
ar.start();
