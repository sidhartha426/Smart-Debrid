import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import { utils, myrequest, data } from "../index.js";
import utils_d from "./utils_d.js";

const { cls, commands, procesCmd } = data;

const mainScreen = async (filesInfo) => {
  utils.dataCheck(filesInfo, false, "No files available");

  const indexes = await utils.selectSome(
    filesInfo,
    utils_d.showFiles,
    "Which Files to Delete:"
  );

  const receivedFiles = filesInfo.value;
  const requiredFiles = [];
  const requiredIDs = [];

  indexes.forEach((index) => {
    requiredIDs.push(receivedFiles[index].id);
    requiredFiles.push(receivedFiles[index]);
  });

  const checkResult = (result) => {
    if (requiredIDs.length !== result.length) return false;
    else {
      for (let i = 0; i < requiredIDs.length; i += 1)
        if (requiredIDs[i] !== result[i]) return false;
      return true;
    }
  };

  const printFiles = () => {
    requiredFiles.forEach((file, index) => {
      console.log(index + 1, indexes[index] + 1, file.name);
    });
  };

  const makeRequest = async () => {
    console.log("Please Wait ... \nExecuting Request online\n\n");
    const requiredData = await myrequest
      .makeReadRequest("DELETE", data.path_delete_d(requiredIDs))
      .then((receivedData) => {
        return receivedData;
      })
      .catch((err) => {
        console.log(err);
        process.exit();
      });
    try {
      if (requiredData.success && checkResult(requiredData.value)) {
        cls();
        console.log("Request executed Successfully.");
        console.log("Deleted Fils are:\n");
        printFiles();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const makeConformation = await utils.confromationScreen(
    "Selected Files for Deletion:\n",
    printFiles
  );

  if (makeConformation) makeRequest();
  else {
    console.log("Delete operation Cancelled");
  }
};

const exportData = {};
exportData.mainScreen = mainScreen;
export default exportData;
