const cds = require("@sap/cds");
// eslint-disable-next-line no-unused-vars
const debug = require("debug")("srv:CPIAPI-service");
const log = require("cf-nodejs-logging-support");
log.setLoggingLevel("info");

module.exports = cds.service.impl(async function () {
    const { CurrentWeather, Empjob,
        EmployeeJobs, Position, FODepartment, PickListValueV2, 
        FOLocation, TransferSettings,createTransferPlan } = this.entities;

    this.on("READ", CurrentWeather, async (req) => {
       // console.log("Reading weather information.");
        const openWeatherApi = await cds.connect.to("CPI_API");
        return openWeatherApi.tx(req).run(req.query);
    });



    this.on("READ", EmployeeJobs, async (req) => {
        const sfecei = await cds.connect.to("ECEmploymentInformation");

            const tx = sfecei.transaction(req);
              const result = await tx.send({
                query: req.query,
                headers: {
                    // "Application-Interface-Key": process.env.ApplicationInterfaceKey,
                    // APIKey: process.env.APIKeyHubSandbox,
                },
            });
            console.log(result.length, "req.query empjob");
            return result;

    });

    this.on("READ", Position, async (req) => {
        const sfecei = await cds.connect.to("ECPositionManagement");
        try {
          
            const tx = sfecei.transaction(req);
            const result = await tx.send({
                query: req.query,
                headers: {
                    // "Application-Interface-Key": process.env.ApplicationInterfaceKey,
                    // APIKey: process.env.APIKeyHubSandbox,
                },
            });
            console.log(result.length, "req.query position");
            return result;

        } catch (err) {
            console.log(err);
            req.reject(err);
        }
    });
    this.on("READ", FODepartment, async (req) => {
        console.log("in");
        const sfecei = await cds.connect.to("ECPositionManagement");
        try {
            const tx = sfecei.transaction(req);

            console.log(req.query)
            const result = await tx.send({
                query: req.query,
                headers: {
                    // "Application-Interface-Key": process.env.ApplicationInterfaceKey,
                    // APIKey: process.env.APIKeyHubSandbox,
                },
            }); 
            console.log("result FODepartment");
            return result;

        } catch (err) {
            console.log(err);
            req.reject(err);
        }
    });
    //PickListValueV2
    this.on("READ", PickListValueV2, async (req) => {
        const sfecei = await cds.connect.to("ECPositionManagement");
        try {
            const tx = sfecei.transaction(req);
            const result = await tx.send({
                query: req.query,
                headers: {
                    // "Application-Interface-Key": process.env.ApplicationInterfaceKey,
                    // APIKey: process.env.APIKeyHubSandbox,
                },
            });
            console.log("result PickListValueV2");
            return result;
        } catch (err) {
            console.log(err);
            req.reject(err);
        }
    });
    this.on("CREATE", createTransferPlan, async (req)=>{
        const sfecei = await cds.connect.to("ECEmploymentInformation");     
        return  sfecei.tx(req).post("/v2/upsert",req.data);
    });

    //FOLocation
    this.on("READ", FOLocation, async (req) => {
        const sfecei = await cds.connect.to("ECPositionManagement");
        try {
            const tx = sfecei.transaction(req);
            const result =
               
             await tx.send({
               query: req.query,
               headers: {
                // "Application-Interface-Key": process.env.ApplicationInterfaceKey,
                // APIKey: process.env.APIKeyHubSandbox,
               },
             }); 
   
          //  console.log(result);
            return result;
        } catch (err) {
            console.log(err);
            req.reject(err);
        }
    });
    this.on("READ", TransferSettings, async (req) => {
        const sfecei = await cds.connect.to("ECEmploymentInformation");

            const tx = sfecei.transaction(req);
              const result = await tx.send({
                query: req.query,
                headers: {
                    // "Application-Interface-Key": process.env.ApplicationInterfaceKey,
                    // APIKey: process.env.APIKeyHubSandbox,
                },
            });
            console.log(result.length, "req.query");
            return result;

    });

    this.on("userInfo", (req) => {
        let results = {};
        results.user = req.user.id;
        // eslint-disable-next-line no-prototype-builtins
        if (req.user.hasOwnProperty("locale")) {
            results.locale = req.user.locale;
        }
        results.scopes = {};
        results.scopes.identified = req.user.is("identified-user");
        results.scopes.authenticated = req.user.is("authenticated-user");
        results.scopes.Viewer = req.user.is("Viewer");
        results.scopes.Admin = req.user.is("Admin");
        return results;
    });

    this.on("READ", Empjob, async (req) => {
        // console.log("Reading weather information.");
         const openWeatherApi = await cds.connect.to("CPI_DEV");
         return openWeatherApi.tx(req).run(req.query);
     });
});
