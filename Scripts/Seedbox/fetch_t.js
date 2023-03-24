import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import { data, myrequest } from "../index.js";

//Returns a promise

const fetch = async () => {
  const requiredData = myrequest.makeReadRequest("GET", data.path_add_t);
  return requiredData;
};

const exportData = {};
exportData.fetch = fetch;
export default exportData;
