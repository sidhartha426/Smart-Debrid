import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import { myrequest, data, utils } from "../index.js";
import accessToken from "./access_token.js";

const { cls } = data;

const appinfo = JSON.parse(data.readFile(__dirname + "/Data/appinfo.json"));

const makeRequest = async () => {
  let demoObject = {};

  if (!appinfo.client_id || !appinfo.client_secret) {
    const msg =
      "URL: https://debrid-link.com/webapp/account/apps\n\n" +
      "Message:Goto the URL and generate clientID and clientSecret pair\n\n" +
      "Enter your client ID:";
    demoObject.client_id = await utils.passInputs(msg, false);
    demoObject.client_secret = await utils.passInputs(
      "Enter your client Secret:",
      false
    );
    data.writeFile(
      __dirname + "/Data/appinfo.json",
      JSON.stringify(demoObject)
    );
  }

  const dataObject = {
    client_id: demoObject.client_id || appinfo.client_id,
    scope:
      "get.post.delete.downloader get.post.delete.seedbox get.account get.files get.post.stream",
  };

  cls();

  console.log("Please Wait ....\nMaking Request.");

  const resData = await myrequest
    .makeWriteRequest("POST", data.deviceCodePath, dataObject)
    .then((data) => data)
    .catch((err) => {
      cls();
      console.log(err);
      process.exit();
    });

  if (resData.device_code && resData.user_code) {
    data.writeFile(__dirname + "/Data/tokeninfo.json", JSON.stringify(resData));
    cls();
    console.log("App registered Successfully\n");
    console.log(resData);

    console.log("Please go online and authorize your app.\n");
    console.log("URL: ", resData.verification_url);
    console.log("Required Code: ", resData.user_code);
    console.log("\n\nPlease don't skip this step it's important.\n\n");
    console.log(
      "Please wait " + resData.interval + " seconds before pressing key"
    );

    await utils.waitKeyStroke();
    accessToken.makeRequest(dataObject.client_id, resData.device_code);
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
