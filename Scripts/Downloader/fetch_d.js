import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import { myrequest, data } from "../index.js";

//Returns a promise

const fetch = async () => {
  const requiredData = myrequest.makeReadRequest("GET", data.path_add_d);
  return requiredData;
};

const exportData = {};
exportData.fetch = fetch;
export default exportData;
