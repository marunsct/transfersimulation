var approuter = require('@sap/approuter');
var ar = approuter();
ar.beforeRequestHandler.use('/getuserinfo', function (req, res, next) {

    try {

        let results = {
            user: null,
            message: "",
            Viewer : false,
            HR: false,
            Manager: false,
            Admin: false,  
            scopes : {}  
        };
        results.user = req.user.id;
        // eslint-disable-next-line no-prototype-builtins
        if (req.user.hasOwnProperty("locale")) {
            results.locale = req.user.locale;
        }
        results.scopes = req.user.scopes;
       // results.request = req;
        
        for (let i = 0; i < req.user.
            scopes.length; i++) {

            if(req.user.scopes[i].includes("user")){
                results.Viewer = true;
            }else if(req.user.scopes[i].includes("HR")){
                results.HR = true;
            }else if(req.user.scopes[i].includes("Manager")){
                results.Manager = true;
            }else if(req.user.scopes[i].includes("Admin")){
                results.Admin = true;
            }            
        }

        if (!req.user) {
            res.statusCode = 403;
           results.message ="Timeout";
            res.end(JSON.stringify(results));
        } else {
            res.statusCode = 200;
            //if()
            //res.end("My name is ${JSON.stringify(req.user.name, null, 2)}");
            results.message = "Scope Check";
            res.end(JSON.stringify(results));
        }

    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify(req.user));
    }

});
ar.start();
