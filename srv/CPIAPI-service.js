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

            /*
                    console.log( "printing query :" ,req.query ,"URL : ", req.req.originalUrl.split("/cpi-api"), "end");
                    let url = "";
                if(req.req.originalUrl.split("test=")[1]){
                        url = "/FODepartment?$top=20&$select=externalCode,name,name_defaultValue,name_en_DEBUG,name_en_US,name_ja_JP,name_localized,parent,status&$filter=" + req.req.originalUrl.split("test=")[1];
                }else{
                        url = "/FODepartment?$top=20&$select=externalCode,name,name_defaultValue,name_en_DEBUG,name_en_US,name_ja_JP,name_localized,parent,status";

                }
                    const result =  await tx.get(url)
             */
            //(req.req.originalUrl.split("/cpi-api")[1])
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

    //FOLocation
    this.on("READ", FOLocation, async (req) => {
        const sfecei = await cds.connect.to("ECPositionManagement");
        try {
            const tx = sfecei.transaction(req);
            const result =
                await tx.get("/FOLocation?$select=externalCode,startDate,name,description,status,nameTranslationNav/externalCode,nameTranslationNav/foField,nameTranslationNav/value_defaultValue,nameTranslationNav/value_ja_JP,nameTranslationNav/value_en_US,nameTranslationNav/value_localized&$expand=nameTranslationNav&$top=1000&$filter=status eq 'A'")
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
