const cds = require("@sap/cds");
// eslint-disable-next-line no-unused-vars
const debug = require("debug")("srv:CPIAPI-service");
const log = require("cf-nodejs-logging-support");
log.setLoggingLevel("info");

module.exports = cds.service.impl(async function () {
    const { CurrentWeather,
        EmployeeJobs, Position, FODepartment, PickListValueV2, FOLocation } = this.entities;

    this.on("READ", CurrentWeather, async (req) => {
       // console.log("Reading weather information.");
        const openWeatherApi = await cds.connect.to("CPI_API");
        return openWeatherApi.tx(req).run(req.query);
    });

    this.on("READ", EmployeeJobs, async (req) => {
        const sfecei = await cds.connect.to("ECEmploymentInformation");
        try {
            if (req.query.SELECT.columns[0].func !== 'count'){
            const tx = sfecei.transaction(req);
              const result = await tx.send({
                query: req.query,
                headers: {
                    // "Application-Interface-Key": process.env.ApplicationInterfaceKey,
                    // APIKey: process.env.APIKeyHubSandbox,
                },
            });
            console.log(result.length, req.query);
            return result;
        }else{
            return {};
        }
        } catch (err) {
            console.log(err);
            req.reject(err);
        }
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
            console.log(result.length, req.query);
            return result;

        } catch (err) {
            console.log(err);
            req.reject(err);
        }
    });
    this.on("READ", FODepartment, async (req) => {
        const sfecei = await cds.connect.to("ECPositionManagement");
        try {
            const tx = sfecei.transaction(req);
            //  const result =  await tx.get(req.req.url)

            const result = await tx.send({
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
            console.log(result);
            return result;
        } catch (err) {
            console.log(err);
            req.reject(err);
        }
    });

    //FOLocation
    this.on("READ", FOLocation, async (req) => {
        const sfecei = await cds.connect.to("ECPositionManagement");
        try {
            const tx = sfecei.transaction(req);
            const result =
                await tx.get("/FOLocation?$select=externalCode,startDate,name,description,status,nameTranslationNav/externalCode,nameTranslationNav/foField,nameTranslationNav/value_defaultValue,nameTranslationNav/value_ja_JP,nameTranslationNav/value_en_US,nameTranslationNav/value_localized&$expand=nameTranslationNav&$top=1000")
            /*
             await tx.send({
               query: req.query,
               headers: {
                // "Application-Interface-Key": process.env.ApplicationInterfaceKey,
                // APIKey: process.env.APIKeyHubSandbox,
               },
             }); 
             */
          //  console.log(result);
            return result;
        } catch (err) {
            console.log(err);
            req.reject(err);
        }
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
});
