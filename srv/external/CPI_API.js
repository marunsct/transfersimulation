const cds = require("@sap/cds");

class CPI_API extends cds.RemoteService {
  async init() {
    this.reject(["CREATE", "UPDATE", "DELETE"], "*");

    this.before("READ", "*", (req) => {
      try {
        const queryParams = parseQueryParams(req.query.SELECT);
        const queryString = Object.keys(queryParams)
          .map((key) => `${key}=${queryParams[key]}`)
          .join("&");
        req.query = `GET /weather?${queryString}`;
      } catch (error) {
          console.log("No filters provided in the request.");
        req.reject(400, error.message);
      }
    });

    this.on("READ", "*", async (req, next) => {
      const response = await next(req);
      return parseResponse(response);
    });

    super.init();
  }
}

function parseQueryParams(select) {
  const filter = {};
  Object.assign(
    filter,
    parseExpression(select.from.ref[0].where),
    parseExpression(select.where)
  );

  if (!Object.keys(filter).length) {
    throw new Error("At least one filter is required");
  }

  const apiKey = process.env.OPEN_WEATHER_API_KEY;
  if (!apiKey) {
    throw new Error("API key is missing.");
  }

  const params = {
    appid: apiKey,
    units: "metric",
  };

  for (const key of Object.keys(filter)) {
    switch (key) {
      case "id":
        params["id"] = filter[key];
        break;
      case "city":
        params["q"] = filter[key];
        break;
      default:
        throw new Error(`Filter by '${key}' is not supported.`);
    }
  }

  return params;
}

function parseExpression(expr) {
  if (!expr) {
    return {};
  }
  const [property, operator, value] = expr;
  if (operator !== "=") {
    throw new Error(`Expression with '${operator}' is not allowed.`);
  }
  const parsed = {};
  if (property && value) {
    parsed[property.ref[0]] = value.val;
  }
  return parsed;
}

function parseResponse(response) {
  return {
    id: response.id,
    city: response.name,
    country: response.sys.country,
    current: {
      description: response.weather[0].description,
      temperature: response.main.temp,
      humidity: response.main.humidity,
      windSpeed: response.wind.speed,
    },
  };
}

module.exports = CPI_API;
