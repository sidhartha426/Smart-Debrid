import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import data from "./data.js";
const https = require("https");
const qs = require("querystring");

const makeReadRequest = async (method, path) => {
  const options = {
    method: method,
    hostname: data.hostname,
    path: path,
    headers: {
      Authorization: "Bearer " + data.accessToken,
    },
    maxRedirects: 20,
  };

  const request = new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        const body = Buffer.concat(chunks);
        resolve(JSON.parse(body));
      });

      res.on("error", function (error) {
        reject(error);
      });
    });

    req.on("error",(err)=>{
      reject(err);
    });

    req.end();
  });

  return request;
};

const makeWriteRequest = async (method, path, dataObject) => {
  const options = {
    method: method,
    hostname: data.hostname,
    path: path,
    headers: {
      Authorization: "Bearer " + data.accessToken,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    maxRedirects: 20,
  };

  const request = new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        const body = Buffer.concat(chunks);
        resolve(JSON.parse(body));
      });

      res.on("error", function (err) {
        reject(err);
      });
    });

    req.write(qs.stringify(dataObject));

    req.on("error",(err)=>{
      reject(err);
    });

    req.end();
  });

  return request;
};

const exportData = {};
exportData.makeWriteRequest = makeWriteRequest;
exportData.makeReadRequest = makeReadRequest;
export default exportData;
