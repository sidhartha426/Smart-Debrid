import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import { utils, data } from "../index.js";
import utils_t from "./utils_t.js";
const { cls, commands, procesCmd, out_path } = data;

//flow of operations
//idea torrentsInfo  => torrents  => results  => outputFiles

//Used to make result File

const makeResult = (torrents) => {
  const results = [];

  torrents.forEach((torrent) => {
    torrent.files.forEach((file) => {
      results.push({
        torrentName: torrent.name,
        torrentID: torrent.id,
        fileName: file.name,
        fileURL: file.downloadUrl,
      });
    });
  });

  return results;
};

//For making output command files

const makeOutput = async (results, doMultiple, takeCmd) => {
  let cmd, cmdPath;
  const fileNamePattern = "t_download";

  const fpath = (result) =>
    ' "./' + result.torrentName + "/" + result.fileName + '" ';

  const makeContent = (result) => {
    let str =
      'echo "" && echo "' +
      result.fileName +
      '"\n\naria2c' +
      data.aria2Commands +
      result.torrentName +
      '" ' +
      result.fileURL +
      "\n\n";

    if (takeCmd) str = str + cmd + fpath(result) + cmdPath + "\n\n";

    return str;
  };

  if (results.length !== 0) {
    //results.sort((a, b) => a.torrentName.localeCompare(b.torrentName));
    if (takeCmd) {
      [cmd, cmdPath] = await utils.takeSpecialCommands();
    }
    utils.writeResult([results, fileNamePattern, makeContent, doMultiple]);
    await utils.cmdExec(
      'chmod +x "' + out_path + '"/' + fileNamePattern + "*.sh"
    );
  } else console.log("No Files in Torrents to Download");
};

const mainScreen = async (torrents) => {
  let results = [];
  const myoperations = [
    { message: "Download all Torrents  (default:enabled)", value: true },
    {
      message: "Download only Completed Files  (default:enabled)",
      value: true,
    },
    {
      message: "Download only relevent files  (default:enabled)",
      value: true,
    },
    {
      message: "Multiple Download Scripts  (default:disabled)",
      value: false,
    },
    {
      message: "Manipulte Torrents  (default:disabled)",
      value: false,
    },
    {
      message: "Manipulte Files under Torrents  (default:disabled)",
      value: false,
    },
    {
      message: "Add special commands for file processing (default:disabled)",
      value: false,
    },
  ];

  const processInput = async (operations) => {
    //Torrents Manipulation
    if (operations[4].value) {
      operations[2].value = false;
      operations[1].value = false;
      torrents = await utils_t.manipulateTorrents(torrents);
    }

    //Files Manipulation
    if (operations[5].value) {
      operations[2].value = false;
      operations[1].value = false;
      torrents = await utils_t.manipulateTorrentFiles(torrents);
    }

    utils.dataCheck(torrents, "No Torrents match your criteria.");

    //Only completed torrent
    if (operations[1].value) {
      torrents = torrents.filter((torrent) => utils_t.checkCompleted(torrent));
    }

    utils.dataCheck(torrents, "No completed torrents");

    //only relevent files
    if (operations[2].value) {
      torrents = utils_t.torrentFileNameFilter(
        torrents,
        utils.checkFormats,
        []
      );
      torrents = utils_t.torrentFileNameFilter(
        torrents,
        utils.excludeKeywords,
        []
      );
    }

    if (operations[1].value) {
      torrents = torrents.filter((torrent) => utils_t.checkCompleted(torrent));
    }

    utils.dataCheck(torrents, "No Torrents match your criteria");

    //Torrent selection
    if (!operations[0].value) {
      let indexes = await utils.selectSome(
        torrents,
        utils_t.showTorrents,
        "Which Torrents to Download:"
      );
      let selectedTorrents = [];
      indexes.forEach((index) => {
        selectedTorrents.push(torrents[index]);
      });
      torrents = selectedTorrents;
    }

    results = makeResult(torrents);

    //operations[3] Multiple Scripts operations[6] special Commands
    makeOutput(results, operations[3].value, operations[6].value);
  };
  const banner = "\tDownload Torrents:\n\n";
  utils.dataCheck(torrents, "No torrents available");
  utils.execOperations(myoperations, processInput, false, banner);
};

const exportData = {};
exportData.mainScreen = mainScreen;
export default exportData;
