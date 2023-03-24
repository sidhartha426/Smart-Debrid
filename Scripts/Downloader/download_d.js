import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import { utils, myrequest, data } from "../index.js";
import utils_d from "./utils_d.js";

const readline = require("readline");

const { cls, commands, procesCmd } = data;

//idea filesInfo (based on 1st input) => files (based on 2nd input) =>outputFiles

//Used For writing output Files

const writeFile = data.writeFile;

// For making result file (Extracting Meaningful Info)

const makeResult = (files) => {
  const results = [];

  files.forEach((file) => {
    results.push({
      fileID: file.id,
      fileName: file.name,
      fileURL: file.downloadUrl,
    });
  });

  return results;
};

//Used For making output Files

const makeOutput = (results, doMultiple) => {
  const path = data.out_path;
  let content = "";

  const makeContent = (result) =>
    "echo " +
    result.fileName +
    "\n\naria2c" +
    data.aria2Commands +
    '" ' +
    result.fileURL +
    "\n\n";

  const writeMultiple = () => {
    let i = Math.floor(results.length / 3); //No. of lines each file

    if (i === 0) i = 1;
    //For avioding divide by zero
    else if (results.length % 3 === 2) i += 1; //For even load distribution among files

    let j = 0; //Used for no. of files (3,So 0<=j<=2)

    results.forEach((result, index) => {
      if (Math.floor(index / i) > j && j <= 1) {
        writeFile(path + "d_download" + (j + 1).toString() + ".sh", content);
        j += 1;
        content = "";
      }
      content += makeContent(result);
    });

    writeFile(path + "d_download" + (j + 1).toString() + ".sh", content);
  };

  const writeSingle = () => {
    results.forEach((result, index) => {
      content += makeContent(result);
    });
    writeFile(path + "d_download1.sh", content);
  };

  if (results.length !== 0) {
    results.forEach((result) => {
      console.log(result);
    });

    console.log(results.length);

    if (doMultiple) writeMultiple();
    else writeSingle();
  } else console.log("No Files to Download");
};

// Main Driver function
const mainScreen = async (filesInfo) => {
  let files = [];
  const receivedFiles = filesInfo;
  const screenInputs =
    "1. Download all Files (y/n)\n" +
    "2. 3 Download Files (y/n)\n" +
    "\nCommmands =>\ne/exit: To exit\nr/reprint: To reprint current screen\n\n" +
    "Enter Inputs:";

  const scanner = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const processInput = async (input) => {
    if (input[0] === "y") {
      files = receivedFiles;
    } else if (input[0] === "n") {
      indexes = await utils.selectSome(
        filesInfo,
        utils_d.showFiles,
        "Which Files to Download:"
      );
      indexes.forEach((index) => {
        files.push(receivedFiles[index]);
      });
    }

    if (input[1] === "y") {
      results = makeResult(files);
      makeOutput(results, true);
    } else if (input[1] === "n") {
      results = makeResult(files);
      makeOutput(results, false);
    }
  };

  const checkInput = (input) => {
    if (input.length > 2) return false;
    else {
      input = input.replace(/y/g, "1");
      input = input.replace(/n/g, "0");
      return !isNaN(input);
    }
  };

  const currentScreen = () => {
    cls();
    console.log(screenInputs);
  };

  utils.dataCheck(filesInfo,"No files available");

  scanner.on("line", (input) => {
    if (checkInput(input)) {
      cls();
      scanner.close();
      processInput(input);
    } else if (commands.includes(input)) {
      procesCmd(input, scanner, currentScreen);
    } else {
      console.log("Wrong Input\n");
    }
  });
};

const exportData = {};
exportData.mainScreen = mainScreen;
export default exportData;
