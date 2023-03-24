import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import { myrequest, data } from "../index.js";

const { cls } = data;

const appinfo = JSON.parse(data.readFile(__dirname + "/Data/appinfo.json"));
const accesstokeninfo = JSON.parse(
  data.readFile(__dirname + "/Data/access_token.json")
);

const makeRequest = async () => {
  const dataObject = {
    client_id: appinfo.client_id,
    refresh_token: accesstokeninfo.refresh_token,
    grant_type: "refresh_token",
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

  if (resData.access_token) {
    cls();
    console.log("New Access Token Generated\n");
    console.log(resData);
    data.writeFile(
      __dirname + "/Data/refresh_token.json",
      JSON.stringify(resData)
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
