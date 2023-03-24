import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import { utils, data } from "../index.js";

const readline = require("readline");
const { cls, commands, procesCmd } = data;

//Count completed files in a torrent

const countCompleted = (torrent) => {
  let i = 0;

  torrent.files.forEach((file) => {
    if (file.downloadPercent === 100) i += 1;
  });

  return i;
};

//Check if a torrent is downloaded in seedbox (in seedbox server)
const checkCompleted = (torrent) => {
  if (
    torrent.files.length > 0 &&
    countCompleted(torrent) === torrent.files.length
  )
    return true;
  else return false;
};

const nameCheck = (name, formats, keywords) =>
  utils.checkFormats(name, formats) && utils.excludeKeywords(name, keywords);

//Check if a torrent is downloaded or not by the user (not in seedbox server)

const checkDownloaded = (torrent, checkRelevence) => {
  const fileCount = (checkRelevence, checkDownloaded) => {
    let i = 0;
    torrent.files.forEach((file) => {
      if (
        (!checkRelevence || nameCheck(file.name)) &&
        (!checkDownloaded || file.downloaded)
      )
        i += 1;
    });

    return i;
  };

  //console.log(torrent.name,fileCount(checkRelevence, false),fileCount(checkRelevence, true));

  if (
    fileCount(checkRelevence, false) > 0 &&
    fileCount(checkRelevence, false) === fileCount(checkRelevence, true)
  )
    return true;
  else return false;
};

const torrentNameFilter = (torrents, filterFunction, data) => {
  torrents = torrents.filter((torrent) => filterFunction(torrent.name, data));
  return torrents;
};

const torrentFileNameFilter = (torrents, filterFunction, data) => {
  torrents.forEach((torrent) => {
    torrent.files = torrent.files.filter((file) =>
      filterFunction(file.name, data)
    );
  });
  return torrents;
};

const torrentFilePercentFilter = (torrents, min, max) => {
  torrents.forEach((torrent) => {
    torrent.files = torrent.files.filter(
      (file) => file.downloadPercent >= min && file.downloadPercent <= max
    );
  });
  return torrents;
};

//Shows all torrent List

const showTorrents = (torrents, formats, keywords) => {
  if (!formats || formats.length === 0)
    formats = [...data.formats, "jpg", "jpeg", "png"];

  const fileCount = (onlyRelevent, torrent, checkRelevent) => {
    let i = 0;
    torrent.files.forEach((file) => {
      if (
        (onlyRelevent || file.downloadPercent === 100) &&
        (!checkRelevent || nameCheck(file.name, formats, keywords))
      )
        i += 1;
    });
    return i;
  };

  torrents.forEach((torrent, index) => {
    console.log(
      index + 1,
      torrent.name,
      "(",
      fileCount(false, torrent, false),
      "/",
      torrent.files.length,
      ")(",
      fileCount(false, torrent, true),
      "/",
      fileCount(true, torrent, true),
      ")\n"
    );
  });
};

//Shows all files in a single Torrent

const showFiles = (torrents, indexes, showURL) => {
  indexes.forEach((index) => {
    console.log("\t", index + 1, torrents[index].name, "\n\n");
    torrents[index].files.forEach((file, i) => {
      console.log(i + 1, file.name, "\t(", file.downloadPercent, "% )\n");
      if (showURL) console.log("URL: " + file.downloadUrl + "\n\n");
    });
    console.log("\n");
  });
};

//Get minimum/maximum percentage reqired for files

const getPercentage = (msg) => {
  const scanner = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const currentScreen = () => {
    cls();
    console.log(
      "\nCommmands =>\ne/exit: To exit\nr/reprint: To reprint current screen\n"
    );
    console.log(msg);
  };

  const checkinput = (input) => {
    if (input && !isNaN(input) && parseInt(input) <= 100) return true;
    else return false;
  };

  currentScreen();

  return new Promise((resolve, reject) => {
    scanner.on("line", (input) => {
      if (commands.includes(input)) {
        procesCmd(input, scanner, currentScreen);
      } else if (checkinput(input)) {
        cls();
        resolve(parseInt(input));
        scanner.close();
      } else {
        console.log("Wrong Input\n");
      }
    });
  });
};

//Manipulate torrents using Criterias

const manipulateTorrents = async (torrents) => {
  const myoperations = [
    {
      message: "Search for certain keywords",
      value: false,
    },
    {
      message: "Exclude certain keywords",
      value: false,
    },
    {
      message: "Include only completed torrents",
      value: false,
    },
    {
      message: "Include only incomplete torrents",
      value: false,
    },
    {
      message: "Include only torrents downloaded relevent files",
      value: false,
    },
    {
      message: "Include only torrents with undownloaded relevent files",
      value: false,
    },
    {
      message: "Include only torrents downloaded all files",
      value: false,
    },
    {
      message: "Include only torrents having undownloaded files",
      value: false,
    },
  ];

  const processInput = async (operations, resolve) => {
    //Search for Kewwords
    if (operations[0].value) {
      let requiredKeywords = await utils.passKeywords(
        "Enter your required Searching keywords:"
      );
      torrents = torrentNameFilter(
        torrents,
        utils.searchKeywords,
        requiredKeywords
      );
    }

    //Exclude keywords
    if (operations[1].value) {
      let requiredKeywords = await utils.passKeywords(
        "Message: Press Enter for defaults\n\n" +
          "Enter keywords to be excluded:",
        true
      );
      torrents = torrentNameFilter(
        torrents,
        utils.excludeKeywords,
        requiredKeywords
      );
    }

    //Check if completed (downloaded in seedbox server)
    if (operations[2].value !== operations[3].value) {
      if (operations[2].value)
        torrents = torrents.filter((torrent) => checkCompleted(torrent));
      else torrents = torrents.filter((torrent) => !checkCompleted(torrent));
    }

    //Check if Downloaded  by the user (relevent files)

    if (operations[4].value !== operations[5].value) {
      if (operations[4].value)
        torrents = torrents.filter((torrent) => checkDownloaded(torrent, true));
      else
        torrents = torrents.filter(
          (torrent) => !checkDownloaded(torrent, true)
        );
    }

    //Check if Downloaded  by the user (all files)

    if (operations[6].value !== operations[7].value) {
      if (operations[6].value)
        torrents = torrents.filter((torrent) =>
          checkDownloaded(torrent, false)
        );
      else
        torrents = torrents.filter(
          (torrent) => !checkDownloaded(torrent, false)
        );
    }
    resolve(torrents);
  };

  return new Promise((resolve, reject) => {
    utils.execOperations(myoperations, processInput, resolve, false);
  });
};

//Manipulate files inside torrents

const manipulateTorrentFiles = async (torrents) => {
  const myoperations = [
    {
      message: "Search for certain keywords",
      value: false,
    },
    {
      message: "Exclude certain keywords",
      value: false,
    },
    {
      message: "Search for certain file formats",
      value: false,
    },
    {
      message: "Set a minimum download percentage",
      value: false,
    },
    {
      message: "Set a maximum download percentage",
      value: false,
    },
    {
      message: "Set a percentage range (min-max)",
      value: false,
    },
    {
      message: "Include only downloaded files",
      value: false,
    },
    {
      message: "Include only undownloaded files",
      value: false,
    },
  ];

  const processInput = async (operations, resolve) => {
    //Search for kewwords
    if (operations[0].value) {
      let requiredKeywords = await utils.passKeywords(
        "Enter your required Searching keywords:"
      );
      torrents = torrentFileNameFilter(
        torrents,
        utils.searchKeywords,
        requiredKeywords
      );
    }

    //Exclude keywords
    if (operations[1].value) {
      let requiredKeywords = await utils.passKeywords(
        "Message: Press Enter for defaults\n\n" +
          "Enter keywords to be excluded:",
        true
      );
      torrents = torrentFileNameFilter(
        torrents,
        utils.excludeKeywords,
        requiredKeywords
      );
    }

    //Search for file formats
    if (operations[2].value) {
      let requiredFormats = await utils.passKeywords(
        "Message: Press Enter for defaults\n\n" +
          "Enter required file formats:",
        true
      );
      torrents = torrentFileNameFilter(
        torrents,
        utils.checkFormats,
        requiredFormats
      );
    }

    //Set min percentage
    if (operations[3].value) {
      let minPercent = await getPercentage(
        "Enter required minimum percentage:"
      );

      torrents = torrentFilePercentFilter(torrents, minPercent, 100);
    }

    //set max percentage
    if (operations[4].value) {
      let maxPercent = await getPercentage(
        "Enter required maximum percentage:"
      );

      torrents = torrentFilePercentFilter(torrents, 0, maxPercent);
    }

    //set a percentage range
    if (operations[5].value) {
      let minPercent = await getPercentage(
        "Enter required minimum percentage:"
      );
      let maxPercent = await getPercentage(
        "Enter required maximum percentage:"
      );

      torrents = torrentFilePercentFilter(torrents, minPercent, maxPercent);
    }

    //Include only downloaded files by the user

    if (operations[6].value !== operations[7].value) {
      if (operations[6].value) {
        torrents.forEach((torrent) => {
          torrent.files = torrent.files.filter((file) => file.downloaded);
        });
      } else {
        torrents.forEach((torrent) => {
          torrent.files = torrent.files.filter((file) => !file.downloaded);
        });
      }
    }

    resolve(torrents);
  };

  return new Promise((resolve, reject) => {
    utils.execOperations(myoperations, processInput, resolve, false);
  });
};

const exportData = {};
exportData.showFiles = showFiles;
exportData.showTorrents = showTorrents;
exportData.getPercentage = getPercentage;
exportData.checkCompleted = checkCompleted;
exportData.countCompleted = countCompleted;
exportData.torrentNameFilter = torrentNameFilter;
exportData.torrentFileNameFilter = torrentFileNameFilter;
exportData.torrentFilePercentFilter = torrentFilePercentFilter;
exportData.manipulateTorrents = manipulateTorrents;
exportData.manipulateTorrentFiles = manipulateTorrentFiles;
exportData.checkDownloaded = checkDownloaded;
export default exportData;
