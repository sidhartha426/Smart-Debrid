import { require } from "./index.js";
import { __filename, __dirname } from "./dir.js";
import { utils, myrequest, data } from "../index.js";
import utils_t from "./utils_t.js";
const { cls, commands, procesCmd, zip_t, out_path } = data;

const mainScreen = (torrents) => {
  let requiredTorrents = [];
  let requiredIDs = [];
  let results = [];

  const myoperations = [
    {
      message: "Zip all Torrents  (default:disabled)",
      value: false,
    },
    {
      message: "Zip all Files with in Torrents  (default:enabled)",
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
      message: "Manipulte Torrent Files  (default:disabled)",
      value: false,
    },
    {
      message: "Add special commands for file processing (default:disabled)",
      value: false,
    },
  ];

  const printTorrentFiles = () => {
    requiredTorrents.forEach((torrent, i) => {
      console.log("\n\t", i + 1, torrent.name, ":\n");
      torrent.files.forEach((file, j) => {
        console.log(j + 1, file.name);
      });
    });
  };

  const processInput = async (operations) => {
    const processResult = async (takeCmd) => {
      cls();
      let cmd, cmdPath;
      const fileNamePattern = "tz_download";
      const makeContent = (result) => {
        let str =
          'echo "" && echo "' +
          result.name +
          '"\n\naria2c' +
          data.aria2Commands +
          '" ' +
          result.fileURL +
          "\n\n";

        if (takeCmd) {
          str = str + cmd + " " + result.name + ".zip " + cmdPath + "\n\n";
        }
        return str;
      };

      if (results.length > 0) {
        if (takeCmd) {
          [cmd, cmdPath] = await utils.takeSpecialCommands();
        }
        utils.writeResult([
          results,
          fileNamePattern,
          makeContent,
          operations[2].value,
        ]);
        await utils.cmdExec(
          'chmod +x "' + out_path + '"/' + fileNamePattern + "*.sh"
        );
      } else console.log("No torrents available for zipping");
    };

    const makeRequest = async () => {
      console.log("Please Wait ... \nExecuting Request online\n\n");
      for (let i = 0; i < requiredTorrents.length; i += 1) {
        let torrent = requiredTorrents[i];
        const requiredData = await myrequest
          .makeWriteRequest(
            "POST",
            zip_t.getpath(torrent.id),
            zip_t.getPostData(requiredIDs[i])
          )
          .then((receivedData) => receivedData)
          .catch((err) => {
            cls();
            console.log(err);
            process.exit();
          });
        try {
          if (requiredData.success) {
            console.log("Request executed Successfully.");
            console.log("Result:", requiredData.value.status);
            if (requiredData.value.downloadUrl) {
              results.push({
                name: torrent.name,
                fileURL: requiredData.value.downloadUrl,
              });
            }
          } else {
            console.log("Some Error Occured.");
            console.log("Result:\n");
            console.log(requiredData);
          }
        } catch (e) {
          cls();
          console.log(e);
          process.exit();
        }
      }

      if (results.length > 0) {
        let s = results.length;
        cls();
        console.log("\t", s, "torrents zipped successfully.\n\n");
        utils.printNames(results);
        console.log("\n");
        await utils.waitKeyStroke();
        processResult(operations[5].value);
      } else {
        cls();
        console.log("Zipping operation failed");
        process.exit();
      }
    };

    //Manipulate Torrents
    if (operations[3].value) {
      torrents = await utils_t.manipulateTorrents(torrents);
      utils.dataCheck(torrents, "No torrents match your criteria");
    }

    //Select torrents
    if (operations[0].value) {
      requiredTorrents = torrents;
    } else {
      const indexes = await utils.selectSome(
        torrents,
        utils_t.showTorrents,
        "Which Torrents to ZIP:"
      );
      indexes.forEach((index) => {
        requiredTorrents.push(torrents[index]);
      });
    }

    let makeConformation = await utils.confromationScreen(
      "Selected Torrents for Zipping:\n",
      requiredTorrents
    );

    if (!makeConformation) {
      console.log("Zip operation Cancelled");
      process.exit();
    }

    //Manipulate Files
    if (operations[4].value) {
      requiredTorrents = await utils_t.manipulateTorrentFiles(requiredTorrents);
      requiredTorrents.forEach((torrent) => {
        utils.dataCheck(torrent.files, "Some torrents found with no files");
      });
    }

    //Select files with in torrents
    if (operations[1].value) {
      requiredTorrents.forEach((torrent) => {
        let ids = [];
        torrent.files.forEach((file) => {
          ids.push(file.id);
        });
        requiredIDs.push(ids);
      });
    } else {
      for (let i = 0; i < requiredTorrents.length; i += 1) {
        let ids = [];
        let files = [];
        let torrent = requiredTorrents[i];
        let indexes = await utils.selectSome(
          torrent.files,
          (data) => {
            console.log("\t", i + 1, torrent.name + ":\n");
            utils.printNames(data);
          },
          "Which Files to add:"
        );
        indexes.forEach((index) => {
          ids.push(torrent.files[index].id);
          files.push(torrent.files[index]);
        });
        torrent.files = files;
        requiredIDs.push(ids);
      }
    }

    makeConformation = await utils.confromationScreen(
      "Selected Torrents and files for Zipping:",
      requiredTorrents,
      printTorrentFiles
    );

    if (makeConformation) {
      makeRequest();
    } else {
      console.log("Zipping operation Cancelled");
    }
  };

  const banner = "\tZip Torrents:\n\n";
  utils.dataCheck(torrents, "No torrents available");
  utils.execOperations(myoperations, processInput, false, banner);
};

const exportData = {};
exportData.mainScreen = mainScreen;
export default exportData;
