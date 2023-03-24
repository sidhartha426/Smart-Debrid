import require from "./cjs.js";
import { data, utils } from "./Scripts/index.js";
import { __filename, __dirname } from "./dir.js";

const readline = require("readline");
const { cls, commands, procesCmd } = data;

//Torrent (Seedbox) Functions

import {
  add_t,
  delete_t,
  download_t,
  fetch_t,
  show_t,
  zip_t,
} from "./Scripts/Seedbox/index.js";

//Files (Downloader) Functions

import {
  add_d,
  delete_d,
  download_d,
  fetch_d,
  show_d,
} from "./Scripts/Downloader/index.js";

//Appauth Functions for app authorization

import {
  appRegister,
  accessToken,
  refreshToken,
  mainAuth,
} from "./Scripts/Appauth/index.js";

let torrentsInfo, filesInfo, torrents, files;

const init = async () => {
  //Waiting Screen
  cls();
  console.log("Please Wait ....\nGetting Data from internet.");

  //For fecting Data

  const fetchData = async (fetchFunction) => {

    const data = fetchFunction()
      .then((receivedData) => receivedData)
      .catch((err) => {
        cls();
        console.log("init->fetchData \n\n",err);
        process.exit();
      });

    return data;
  };

  //Fetches data

  torrentsInfo = await fetchData(fetch_t.fetch);

  filesInfo = await fetchData(fetch_d.fetch);

  //For faking empty data scenario (for testing purposes)

  // filesInfo={success:true,value:[]}
  // torrentsInfo={success:true,value:[]}

  //Executes mainscreen after fetching data

  if (torrentsInfo.success && filesInfo.success) {
    torrents = torrentsInfo.value;
    files = filesInfo.value;

    torrents.sort((a, b) => a.name.localeCompare(b.name));
    torrents.forEach((torrent) => {
      torrent.files.sort((a, b) => a.name.localeCompare(b.name));
    });
    files.sort((a, b) => a.name.localeCompare(b.name));

    //Writes data (test data) for testing
    data.writeFile(
      __dirname + "/Scripts/Seedbox/Data/testdata.json",
      JSON.stringify(torrents)
    );
    data.writeFile(
      __dirname + "/Scripts/Downloader/Data/testdata.json",
      JSON.stringify(files)
    );

    //refreshes torrents data (local data)
    add_t.refreshData(torrents);

    mainScreen();
  } else if (
    (torrentsInfo.error && torrentsInfo.error === "badToken") ||
    (filesInfo.error && filesInfo.error === "badToken")
  )
    mainAuth.mainScreen();
  else {
    cls();
    console.log("Data Fetching error\n");
  }
};

const mainScreen = () => {
  //Data Including executing fuctions and feature name
  const featuresData = {
    seedbox: [
      {
        message: "Download Torrents",
        execFunction: download_t.mainScreen,
      },
      {
        message: "Show Torrents",
        execFunction: show_t.mainScreen,
      },
      {
        message: "Add Torrents",
        execFunction: add_t.mainScreen,
      },
      {
        message: "Remove Torrents",
        execFunction: delete_t.mainScreen,
      },
      {
        message: "ZIP Torrents",
        execFunction: zip_t.mainScreen,
      },
    ],
    downloader: [
      {
        message: "Download Files",
        execFunction: download_d.mainScreen,
      },
      {
        message: "Show Files",
        execFunction: show_d.mainScreen,
      },
      {
        message: "Add Files",
        execFunction: add_d.mainScreen,
      },
      {
        message: "Remove Files",
        execFunction: delete_d.mainScreen,
      },
    ],
    appauth: [
      {
        message: "Register App",
        execFunction: appRegister.makeRequest,
      },
      {
        message: "Get AccessToken",
        execFunction: accessToken.makeRequest,
      },
      {
        message: "Refresh AccessToken",
        execFunction: refreshToken.makeRequest,
      },
    ],
    getSectionsData: function () {
      let sections = [this.seedbox, this.downloader, this.appauth];
      let sectionsLength = [];
      let sectionsData = [torrents, files, false];
      let t = 0;
      for (let i = 0; i < sections.length; i += 1) {
        t += sections[i].length;
        sectionsLength.push(t);
      }
      return [sections, sectionsLength, sectionsData];
    },
    sectionsBanner: ["Torrents:", "Downloads:", "App Authorization:"],
    inputScreen: function () {
      let str = "";

      str += "\t\tSmart Debrid\n\n";

      let [sections, sectionsLength] = this.getSectionsData();

      for (let i = 0; i < sections.length; i += 1) {
        str += "\n\t " + this.sectionsBanner[i] + "\n\n";
        let j = 1;
        if (i > 0) j = sectionsLength[i - 1] + 1;
        sections[i].forEach((section, i) => {
          str += (i + j).toString() + ". " + section.message + "\n";
        });
      }

      str +=
        "\nCommmands =>\ne/exit: To exit\nr/reprint: To reprint current screen\n\n" +
        "Enter Choice:";

      return str;
    },
  };
  utils.mainMenuExec(featuresData);
};

init();
