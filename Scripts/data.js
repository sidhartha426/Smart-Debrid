import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";

const fs = require("fs");
const data = {};

//Reading and Writing files

data.writeFile = (filePath, content) => {
  fs.writeFile(
    filePath,
    content,
    {
      flag: "w+",
    },
    (err) => {
      if (err) {
        console.log("File Writing Failed\n" + err);
        console.log(err);
      } else return true;
    }
  );
};
data.readFile = (filePath) => {
  let fileData;
  try {
    fileData = fs.readFileSync(filePath);
    return fileData;
  } catch (err) {
    console.log("File Reading Failed\n");
    console.log(err);
  }
};

//For reading lines in a file (returns a array containing lines)

data.readFileLines = (filePath) => {
  let lines = data
    .readFile(filePath)
    .toString()
    .split("\n")
    .filter((line) => line);
  if (lines[lines.length - 1])
    lines[lines.length - 1] = lines[lines.length - 1].replace("\n", "");
  return lines;
};

//Returns comma-delimited string

data.commaString = (fdata) => {
  let str = "";
  for (let i = 0; i < fdata.length - 1; i += 1) str += fdata[i] + ",";
  str += fdata[fdata.length - 1];
  return str;
};

//Authorization Information

data.tokeninfo = JSON.parse(
  data.readFile(__dirname + "/Appauth/Data/refresh_token.json")
);
data.deviceCodePath = "/api/oauth/device/code";
data.tokenPath = "/api/oauth/token";

data.accessToken = data.tokeninfo.access_token;

data.hostname = "debrid-link.com";

//API Paths and Output file Paths

data.path_add_t = "/api/v2/seedbox/list";
data.path_delete_t = (ids) => {
  let str = data.commaString(ids);
  str = "/api/v2/seedbox/" + str + "/remove";
  return str;
};
data.add_t = {
  path: "/api/v2/seedbox/add",
  getPostData: (url) => ({
    url: url,
    async: "true",
  }),
  getURLs: data.readFileLines(__dirname + "/../magnets.txt"),
};
data.zip_t = {
  getpath: (id) => "/api/v2/seedbox/" + id + "/zip",
  getPostData: (ids) => {
    let str = data.commaString(ids);
    return {
      ids: str,
    };
  },
};

data.path_add_d = "/api/v2/downloader/list";
data.add_d = {
  path: "/api/v2/downloader/add",
  getPostData: (url, password) => ({
    password: password || false,
    url: url,
  }),
  getURLs: data.readFileLines(__dirname + "/../links.txt"),
};
data.path_delete_d = (ids) => {
  let str = data.commaString(ids);
  str = "/api/v2/downloader/" + str + "/remove";
  return str;
};

//Common data for use across Functions

//commands list for functions
data.commands = ["e", "exit", "r", "reprint"];

//Process commands
data.procesCmd = (input, scanner, currentScreen) => {
  if (input === "reprint" || input === "r") {
    currentScreen();
  } else if (input === "exit" || input === "e") {
    data.cls();
    scanner.close();
  }
};

//Relevent file formats
data.formats = ["mp4", "mkv", "iso", "avi", "wmv", "flv", "mov", "zip", "rar"];

data.irreleventKeywords = ["sample", "banner"];

//Path for download scripts to be written
data.out_path = __dirname + "/../Download_Scripts/";

//aria2 downloader commands
data.aria2Commands = ' -x 8 --file-allocation=none -d "./';

//Keywords for filtering keywords
data.URLKeywords = ["magnet", "http", "https"];

//For clearing the output screen
data.cls = () => {
  process.stdout.write("\x1Bc");
  console.clear();
};

export default data;
