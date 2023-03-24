import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import { utils, data } from "../index.js";

const showFiles = (receivedFiles) => {
  receivedFiles.forEach((file, index) => {
    console.log(index + 1, file.name, "\n");
    console.log("URL: " + file.downloadUrl + "\n\n");
  });
};

const exportData = {};
exportData.showFiles = showFiles;
export default exportData;
