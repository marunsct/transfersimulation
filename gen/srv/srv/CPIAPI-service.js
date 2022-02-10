const cds = require("@sap/cds");
// eslint-disable-next-line no-unused-vars
const debug = require("debug")("srv:CPIAPI-service");
const log = require("cf-nodejs-logging-support");
log.setLoggingLevel("info");

module.exports = cds.service.impl(async function () {
  const { CurrentWeather, EmployeeJobs, Position } = this.entities;

  this.on("READ", CurrentWeather, async (req) => {
    console.log("Reading weather information.");
    const openWeatherApi = await cds.connect.to("CPI_API");
    return openWeatherApi.tx(req).run(req.query);
  });

  this.on("READ", EmployeeJobs, async (req) => {
    const sfecei = await cds.connect.to("ECEmploymentInformation");
    try {
      const tx = sfecei.transaction(req);
      return await tx.send({
        query: req.query,
        headers: {
          "Application-Interface-Key": process.env.ApplicationInterfaceKey,
          APIKey: process.env.APIKeyHubSandbox,
        },
      });
    } catch (err) {
      req.reject(err);
    }
  });

  this.on("READ", Position, async (req) => {
    const sfecei = await cds.connect.to("ECPositionManagement");
    try {
      const tx = sfecei.transaction(req);
      return await tx.send({
        query: req.query,
        headers: {
          "Application-Interface-Key": process.env.ApplicationInterfaceKey,
          APIKey: process.env.APIKeyHubSandbox,
        },
      });
    } catch (err) {
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
