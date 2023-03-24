import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import { myrequest, data } from "../index.js";
const { cls } = data;

const appinfo = JSON.parse(data.readFile(__dirname + "/Data/appinfo.json"));
const tokeninfo = JSON.parse(data.readFile(__dirname + "/Data/tokeninfo.json"));
const refreshtokeninfo = JSON.parse(
  data.readFile(__dirname + "/Data/refresh_token.json")
);

const makeRequest = async (clientID, deviceCode) => {
  const dataObject = {
    client_id: clientID || appinfo.client_id,
    code: deviceCode || tokeninfo.device_code,
    grant_type: "http://oauth.net/grant_type/device/1.0",
  };

  cls();

  console.log("Please Wait ....\nMaking Request.");

  const resData = await myrequest
    .makeWriteRequest("POST", data.tokenPath, dataObject)
    .then((data) => data)
    .catch((err) => {
      cls();
      console.log(err);
      process.exit();
    });

  if (resData.access_token && resData.refresh_token) {
    cls();
    console.log("Access Token Generated\n");
    console.log(resData);
    data.writeFile(
      __dirname + "/Data/access_token.json",
      JSON.stringify(resData)
    );
    data.writeFile(
      __dirname + "/Data/refresh_token.json",
      JSON.stringify({
        ...refreshtokeninfo,
        access_token: resData.access_token,
      })
    );
  } else {
    cls();
    console.log("Some error occured\n");
    console.log(resData);
    process.exit();
  }
};

const exportData = {};
exportData.makeRequest = makeRequest;

export default exportData;
